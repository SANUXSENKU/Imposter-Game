import { Server as SocketIOServer, Socket } from 'socket.io';
import { z } from 'zod';
import { RoomManager } from '../game/RoomManager.ts';
import { upsertPlayer, getPlayerBySession } from '../db/database.ts';
import type { Player } from '../../shared/types.ts';

const CreateRoomSchema = z.object({
  displayName: z.string().min(1).max(20),
  avatarId: z.string().min(1).max(30),
});

const JoinRoomSchema = z.object({
  roomCode: z.string().min(3).max(10),
  displayName: z.string().min(1).max(20),
  avatarId: z.string().min(1).max(30),
  sessionToken: z.string().optional()
});

const SettingsSchema = z.object({
  maxPlayers: z.number().min(3).max(12).optional(),
  imposterCount: z.number().min(1).max(2).optional(),
  clueTimerSec: z.number().min(10).max(120).optional(),
  discussionTimerSec: z.number().min(15).max(180).optional(),
  votingTimerSec: z.number().min(15).max(120).optional(),
  selectedCategories: z.array(z.string()).optional(),
  totalRounds: z.number().min(1).max(5).optional(),
  allowImposterGuess: z.boolean().optional()
});

export function registerSocketHandlers(io: SocketIOServer, roomManager: RoomManager) {
  io.on('connection', (socket: Socket) => {
    let currentPlayerId: string | null = null;
    let currentRoomCode: string | null = null;

    // Helper to send error safely
    const sendError = (message: string) => {
      socket.emit('error:toast', { message });
    };

    // 1. Create Room
    socket.on('room:create', (rawData: unknown) => {
      try {
        const data = CreateRoomSchema.parse(rawData);
        const playerId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sessionToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        const player: Player = {
          id: playerId,
          sessionToken,
          displayName: data.displayName.trim(),
          avatarId: data.avatarId,
          isHost: true,
          isReady: true,
          isConnected: true,
          score: 0
        };

        upsertPlayer(player);

        const room = roomManager.createRoom(player);
        currentPlayerId = playerId;
        currentRoomCode = room.code;

        socket.join(room.code);
        room.playerSockets.set(playerId, socket.id);

        socket.emit('room:joined', {
          roomCode: room.code,
          player,
          state: room.getPublicState()
        });
      } catch (err: any) {
        sendError(err?.message || 'Failed to create room');
      }
    });

    // 2. Join Room
    socket.on('room:join', (rawData: unknown) => {
      try {
        const data = JoinRoomSchema.parse(rawData);
        const code = data.roomCode.toUpperCase().trim();
        const room = roomManager.getRoom(code);

        if (!room) {
          sendError(`Room code "${code}" not found.`);
          return;
        }

        if (room.phase !== 'LOBBY') {
          // Check if reconnecting existing player
          let existingPlayer: Player | undefined;
          if (data.sessionToken) {
            existingPlayer = Array.from(room.players.values()).find(p => p.sessionToken === data.sessionToken);
          }
          if (!existingPlayer) {
            sendError('Game is already in progress. Only players in the match can rejoin.');
            return;
          }

          // Reconnect
          existingPlayer.isConnected = true;
          currentPlayerId = existingPlayer.id;
          currentRoomCode = room.code;
          socket.join(room.code);
          room.playerSockets.set(existingPlayer.id, socket.id);

          socket.emit('room:joined', {
            roomCode: room.code,
            player: existingPlayer,
            state: room.getPublicState()
          });

          // Re-send private assignment if round is active
          const role = room.playerRoles.get(existingPlayer.id);
          if (role) {
            socket.emit('assignment:private', {
              role,
              category: room.category,
              secretWord: role === 'CIVILIAN' ? room.secretWord : undefined,
              imposterHint: role === 'IMPOSTER' ? room.imposterHints[0] : undefined
            });
          }

          room.broadcastState();
          return;
        }

        if (room.players.size >= room.settings.maxPlayers) {
          sendError('Room is full.');
          return;
        }

        const playerId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const sessionToken = data.sessionToken || `tok_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

        const player: Player = {
          id: playerId,
          sessionToken,
          displayName: data.displayName.trim(),
          avatarId: data.avatarId,
          isHost: false,
          isReady: false,
          isConnected: true,
          score: 0
        };

        upsertPlayer(player);
        roomManager.associatePlayerWithRoom(playerId, room.code);

        const added = room.addPlayer(player, socket.id);
        if (!added) {
          sendError('Could not join room.');
          return;
        }

        currentPlayerId = playerId;
        currentRoomCode = room.code;
        socket.join(room.code);

        socket.emit('room:joined', {
          roomCode: room.code,
          player,
          state: room.getPublicState()
        });

        room.addSystemMessage(`${player.displayName} entered the room.`);
      } catch (err: any) {
        sendError(err?.message || 'Failed to join room');
      }
    });

    // 3. Settings Update
    socket.on('room:updateSettings', (newSettings: unknown) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room || room.hostId !== currentPlayerId) return;

      try {
        const parsed = SettingsSchema.parse(newSettings);
        room.updateSettings(currentPlayerId, parsed);
      } catch (err: any) {
        sendError(err?.message || 'Invalid settings values');
      }
    });

    // 4. Player Ready Toggle
    socket.on('player:ready', (data: { isReady: boolean }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.setPlayerReady(currentPlayerId, Boolean(data.isReady));
      }
    });

    // 5. Bot management
    socket.on('bot:add', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.hostId === currentPlayerId) {
        const added = room.addBot();
        if (!added) sendError('Cannot add more bots or game in progress');
      }
    });

    socket.on('bot:remove', (data: { botId: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.hostId === currentPlayerId && data?.botId) {
        room.removeBot(data.botId);
      }
    });

    // 6. Start Game
    socket.on('game:start', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room || room.hostId !== currentPlayerId) return;

      if (room.players.size < 3) {
        sendError('At least 3 players are required to start the game. You can add AI bots for testing.');
        return;
      }

      const started = room.startGame(currentPlayerId);
      if (!started) {
        sendError('Could not start game. Check player count.');
      }
    });

    // 7. Submit Clue
    socket.on('clue:submit', (data: { clueText: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const success = room.submitClue(currentPlayerId, data.clueText);
      if (!success) {
        sendError('It is not your turn to give a clue, or clue phase has finished.');
      }
    });

    // 8. Skip Discussion / Force Voting
    socket.on('discussion:forceVoting', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.hostId === currentPlayerId) {
        room.forceStartVoting(currentPlayerId);
      }
    });

    // 9. Cast Vote
    socket.on('vote:cast', (data: { targetId: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      const success = room.castVote(currentPlayerId, data.targetId);
      if (!success) {
        sendError('Invalid vote. You cannot vote for yourself or outside eligible targets.');
      }
    });

    // 10. Imposter Final Guess
    socket.on('imposter:guess', (data: { guess: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (!room) return;

      room.submitImposterGuess(currentPlayerId, data.guess);
    });

    // 11. Next Round
    socket.on('game:nextRound', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.hostId === currentPlayerId) {
        room.startNextRound(currentPlayerId);
      }
    });

    // 12. Rematch / Return to Lobby
    socket.on('game:rematch', () => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && room.hostId === currentPlayerId) {
        room.rematch(currentPlayerId);
      }
    });

    // 13. In-game Chat
    socket.on('chat:send', (data: { text: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room) {
        room.addChatMessage(currentPlayerId, data.text);
      }
    });

    // 14. Real-time floating reactions & sound emotes
    socket.on('room:reaction', (data: { emoji: string; label: string }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && data?.emoji) {
        room.addReaction(currentPlayerId, String(data.emoji), String(data.label || ''));
      }
    });

    // 15. Sus-O-Meter / Suspect Rating
    socket.on('suspect:rate', (data: { targetId: string; rating: 'SUSPECT' | 'TRUSTED' }) => {
      if (!currentRoomCode || !currentPlayerId) return;
      const room = roomManager.getRoom(currentRoomCode);
      if (room && data?.targetId && (data.rating === 'SUSPECT' || data.rating === 'TRUSTED')) {
        room.ratePlayer(currentPlayerId, data.targetId, data.rating);
      }
    });

    // 16. Disconnect
    socket.on('disconnect', () => {
      if (currentRoomCode && currentPlayerId) {
        const room = roomManager.getRoom(currentRoomCode);
        if (room) {
          room.removePlayer(currentPlayerId);
        }
      }
    });
  });
}
