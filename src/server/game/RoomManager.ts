import { Server as SocketIOServer } from 'socket.io';
import { GameRoom } from './Room.ts';
import type { Player } from '../../shared/types.ts';

export class RoomManager {
  private rooms: Map<string, GameRoom> = new Map(); // roomCode -> GameRoom
  private playerToRoom: Map<string, string> = new Map(); // playerId -> roomCode
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;

    // Periodically clean empty/abandoned rooms (every 5 minutes)
    const cleanupTimer = setInterval(() => {
      this.cleanupAbandonedRooms();
    }, 5 * 60 * 1000);
    cleanupTimer.unref();
  }

  public createRoom(hostPlayer: Player): GameRoom {
    const code = this.generateUniqueCode();
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const room = new GameRoom(roomId, code, hostPlayer, this.io);

    this.rooms.set(code, room);
    this.playerToRoom.set(hostPlayer.id, code);
    return room;
  }

  public getRoom(code: string): GameRoom | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getRoomByPlayerId(playerId: string): GameRoom | undefined {
    const code = this.playerToRoom.get(playerId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  public associatePlayerWithRoom(playerId: string, roomCode: string): void {
    this.playerToRoom.set(playerId, roomCode.toUpperCase());
  }

  public removePlayerAssociation(playerId: string): void {
    this.playerToRoom.delete(playerId);
  }

  public getActiveRoomsCount(): number {
    return this.rooms.size;
  }

  public getActivePlayersCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.players.size;
    }
    return count;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let attempts = 0;
    while (attempts < 100) {
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (!this.rooms.has(code)) {
        return code;
      }
      attempts++;
    }
    return `ROOM${Date.now() % 1000}`;
  }

  private cleanupAbandonedRooms(): void {
    for (const [code, room] of this.rooms.entries()) {
      const activeHumanPlayers = Array.from(room.players.values()).filter(p => !p.isBot && p.isConnected);
      if (activeHumanPlayers.length === 0) {
        this.rooms.delete(code);
      }
    }
  }
}
