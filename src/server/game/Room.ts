import { Server as SocketIOServer } from 'socket.io';
import type {
  GamePhase,
  Player,
  PlayerRole,
  PublicGameState,
  PublicPlayerInfo,
  RoomSettings,
  ClueItem,
  ChatMessage,
  RoundResult,
  PrivateAssignment,
  ReactionEvent
} from '../../shared/types.ts';
import { db, getRandomWord, updatePlayerScore, getDecoyWords } from '../db/database.ts';

const BOT_NAMES = ['NovaAgent', 'GhostCipher', 'ViperX', 'ShadowEcho', 'Raven7', 'BlazeFox', 'PixelDrift', 'NeonSpecter'];
const BOT_AVATARS = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6', 'avatar-7', 'avatar-8'];

export class GameRoom {
  public id: string;
  public code: string;
  public hostId: string;
  public phase: GamePhase = 'LOBBY';
  public settings: RoomSettings;
  public players: Map<string, Player> = new Map();
  public playerSockets: Map<string, string> = new Map(); // playerId -> socketId

  // Round authoritative state
  public currentRound = 1;
  public secretWord = '';
  public category = 'General';
  public imposterHints: string[] = [];
  public playerRoles: Map<string, PlayerRole> = new Map();
  public speakerOrder: string[] = [];
  public currentSpeakerIndex = 0;
  public clues: ClueItem[] = [];
  public votes: Map<string, string> = new Map(); // voterId -> targetId
  public isRevote = false;
  public tiedCandidateIds: string[] = [];
  public eliminatedPlayerId: string | null = null;
  public imposterGuessResult: { guess: string; isCorrect: boolean } | null = null;
  public lastRoundResult: RoundResult | null = null;
  public chatMessages: ChatMessage[] = [];

  // New Good Features: Sus-O-Meter, Live Reactions & AI Deduction
  public suspectRatings: Map<string, { sus: number; trust: number; voters: Map<string, 'SUSPECT' | 'TRUSTED'> }> = new Map();
  public recentReactions: ReactionEvent[] = [];
  public aiAnalysis: string | null = null;
  public decryptionChoices: string[] = [];

  // Timers
  private timerInterval: NodeJS.Timeout | null = null;
  public phaseTimeRemaining = 0;
  public phaseDuration = 0;

  private io: SocketIOServer;

  constructor(id: string, code: string, hostPlayer: Player, io: SocketIOServer) {
    this.id = id;
    this.code = code;
    this.hostId = hostPlayer.id;
    this.io = io;

    this.settings = {
      maxPlayers: 10,
      imposterCount: 1,
      clueTimerSec: 25,
      discussionTimerSec: 40,
      votingTimerSec: 25,
      selectedCategories: [],
      totalRounds: 3,
      allowImposterGuess: true
    };

    this.players.set(hostPlayer.id, hostPlayer);
  }

  public addPlayer(player: Player, socketId: string): boolean {
    if (this.players.size >= this.settings.maxPlayers && !this.players.has(player.id)) {
      return false;
    }
    this.players.set(player.id, {
      ...player,
      isConnected: true
    });
    this.playerSockets.set(player.id, socketId);
    this.broadcastState();
    return true;
  }

  public removePlayer(playerId: string): void {
    if (this.phase === 'LOBBY') {
      this.players.delete(playerId);
      this.playerSockets.delete(playerId);
      if (this.hostId === playerId) {
        const remaining = Array.from(this.players.values()).filter(p => !p.isBot);
        if (remaining.length > 0) {
          this.hostId = remaining[0].id;
          remaining[0].isHost = true;
        }
      }
    } else {
      const player = this.players.get(playerId);
      if (player) {
        player.isConnected = false;
        this.playerSockets.delete(playerId);
      }
    }
    this.broadcastState();
  }

  public addBot(): boolean {
    if (this.players.size >= this.settings.maxPlayers || this.phase !== 'LOBBY') {
      return false;
    }
    const botIndex = this.players.size;
    const botName = BOT_NAMES[botIndex % BOT_NAMES.length] || `AgentBot_${botIndex + 1}`;
    const botAvatar = BOT_AVATARS[botIndex % BOT_AVATARS.length] || 'avatar-1';
    const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const botPlayer: Player = {
      id: botId,
      sessionToken: `token_${botId}`,
      displayName: botName,
      avatarId: botAvatar,
      isHost: false,
      isReady: true,
      isConnected: true,
      isBot: true,
      score: 0
    };

    this.players.set(botId, botPlayer);
    this.broadcastState();
    return true;
  }

  public removeBot(botId: string): boolean {
    if (this.phase !== 'LOBBY') return false;
    const player = this.players.get(botId);
    if (player && player.isBot) {
      this.players.delete(botId);
      this.broadcastState();
      return true;
    }
    return false;
  }

  public setPlayerReady(playerId: string, isReady: boolean): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isReady = isReady;
      this.broadcastState();
    }
  }

  public updateSettings(hostId: string, newSettings: Partial<RoomSettings>): boolean {
    if (this.hostId !== hostId || this.phase !== 'LOBBY') return false;
    this.settings = { ...this.settings, ...newSettings };
    this.broadcastState();
    return true;
  }

  // Phase transitions
  public startGame(hostId: string): boolean {
    if (this.hostId !== hostId) return false;
    if (this.players.size < 3) return false; // Minimum 3 players

    // Reset scores for new match
    for (const player of this.players.values()) {
      player.score = 0;
    }
    this.currentRound = 1;
    this.startRound();
    return true;
  }

  public startNextRound(hostId: string): boolean {
    if (this.hostId !== hostId) return false;
    if (this.currentRound >= this.settings.totalRounds) {
      this.finishMatch();
      return true;
    }
    this.currentRound += 1;
    this.startRound();
    return true;
  }

  private startRound(): void {
    this.clearTimer();
    this.clues = [];
    this.votes.clear();
    this.isRevote = false;
    this.tiedCandidateIds = [];
    this.eliminatedPlayerId = null;
    this.imposterGuessResult = null;
    this.lastRoundResult = null;
    this.suspectRatings.clear();
    this.aiAnalysis = null;
    this.decryptionChoices = [];

    // Pick secret word
    const wordData = getRandomWord(this.settings.selectedCategories);
    this.secretWord = wordData.word;
    this.category = wordData.category;
    this.imposterHints = wordData.hints;

    // Assign roles randomly
    const playerIds = Array.from(this.players.keys());
    // Shuffle playerIds
    for (let i = playerIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIds[i], playerIds[j]] = [playerIds[j], playerIds[i]];
    }

    const imposterTargetCount = Math.min(
      this.settings.imposterCount,
      playerIds.length >= 6 ? 2 : 1
    );

    this.playerRoles.clear();
    const imposterIds: string[] = [];

    for (let i = 0; i < playerIds.length; i++) {
      const pid = playerIds[i];
      if (i < imposterTargetCount) {
        this.playerRoles.set(pid, 'IMPOSTER');
        imposterIds.push(pid);
      } else {
        this.playerRoles.set(pid, 'CIVILIAN');
      }
    }

    // Set speaker order (randomized)
    this.speakerOrder = [...playerIds];
    for (let i = this.speakerOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.speakerOrder[i], this.speakerOrder[j]] = [this.speakerOrder[j], this.speakerOrder[i]];
    }
    this.currentSpeakerIndex = 0;

    // Send private assignments to each connected player socket
    for (const [playerId, role] of this.playerRoles.entries()) {
      const socketId = this.playerSockets.get(playerId);
      if (socketId) {
        const assignment: PrivateAssignment = {
          role,
          category: this.category,
          secretWord: role === 'CIVILIAN' ? this.secretWord : undefined,
          imposterHint: role === 'IMPOSTER' ? this.imposterHints[0] : undefined
        };
        this.io.to(socketId).emit('assignment:private', assignment);
      }
    }

    // Move to ASSIGNMENT phase with 6s duration
    this.setPhase('ASSIGNMENT', 6, () => {
      this.startCluePhase();
    });
  }

  private startCluePhase(): void {
    this.currentSpeakerIndex = 0;
    this.advanceToSpeaker();
  }

  private advanceToSpeaker(): void {
    if (this.currentSpeakerIndex >= this.speakerOrder.length) {
      // Clue phase complete! Move to DISCUSSION
      this.startDiscussionPhase();
      return;
    }

    const speakerId = this.speakerOrder[this.currentSpeakerIndex];
    const speaker = this.players.get(speakerId);

    this.setPhase('CLUE', this.settings.clueTimerSec, () => {
      // Time expired: auto-pass or fallback clue
      this.submitClue(speakerId, '...', true);
    });

    // If bot turn: schedule realistic bot clue
    if (speaker && speaker.isBot) {
      setTimeout(() => {
        if (this.phase === 'CLUE' && this.speakerOrder[this.currentSpeakerIndex] === speakerId) {
          const role = this.playerRoles.get(speakerId);
          let botClue = '';
          if (role === 'CIVILIAN') {
            botClue = this.generateBotCivilianClue(this.secretWord, this.category);
          } else {
            botClue = this.generateBotImposterClue(this.category, this.imposterHints[0]);
          }
          this.submitClue(speakerId, botClue);
        }
      }, 1500 + Math.random() * 1500);
    }
  }

  public submitClue(playerId: string, rawText: string, isTimeout = false): boolean {
    if (this.phase !== 'CLUE') return false;
    const currentSpeakerId = this.speakerOrder[this.currentSpeakerIndex];
    if (currentSpeakerId !== playerId && !isTimeout) return false;

    const player = this.players.get(playerId);
    if (!player) return false;

    let cleanText = (rawText || '').trim();
    if (!cleanText) cleanText = '...';
    if (cleanText.length > 70) cleanText = cleanText.substring(0, 70);

    // Prevent direct revealing of secret word
    const secretLower = this.secretWord.toLowerCase();
    if (cleanText.toLowerCase().includes(secretLower) && secretLower.length > 2) {
      // Reject direct giveaway
      cleanText = '[Redacted Secret Giveaway]';
    }

    const clueItem: ClueItem = {
      id: `clue_${Date.now()}_${playerId}`,
      playerId,
      playerName: player.displayName,
      playerAvatar: player.avatarId,
      clueText: cleanText,
      orderIndex: this.clues.length + 1,
      submittedAt: Date.now()
    };

    this.clues.push(clueItem);
    this.currentSpeakerIndex += 1;
    this.advanceToSpeaker();
    return true;
  }

  private startDiscussionPhase(): void {
    this.setPhase('DISCUSSION', this.settings.discussionTimerSec, () => {
      this.startVotingPhase(false);
    });

    // Send a system message into chat
    this.addSystemMessage(`Discussion open! All ${this.clues.length} clues are revealed. Analyze suspect words.`);
  }

  public forceStartVoting(hostId: string): boolean {
    if (this.hostId !== hostId || this.phase !== 'DISCUSSION') return false;
    this.startVotingPhase(false);
    return true;
  }

  private startVotingPhase(isRevote = false, tiedCandidates: string[] = []): void {
    this.votes.clear();
    this.isRevote = isRevote;
    this.tiedCandidateIds = tiedCandidates;

    const duration = isRevote ? 20 : this.settings.votingTimerSec;
    this.setPhase(isRevote ? 'REVOTE' : 'VOTING', duration, () => {
      this.resolveVotes();
    });

    // Handle bot votes
    for (const player of this.players.values()) {
      if (player.isBot) {
        setTimeout(() => {
          if (this.phase === 'VOTING' || this.phase === 'REVOTE') {
            this.castBotVote(player.id);
          }
        }, 1000 + Math.random() * 3000);
      }
    }
  }

  public castVote(voterId: string, targetId: string): boolean {
    if (this.phase !== 'VOTING' && this.phase !== 'REVOTE') return false;
    if (voterId === targetId) return false; // No self-voting

    const voter = this.players.get(voterId);
    const target = this.players.get(targetId);
    if (!voter || !target) return false;

    if (this.isRevote && this.tiedCandidateIds.length > 0 && !this.tiedCandidateIds.includes(targetId)) {
      return false; // In revote, must target tied candidates
    }

    this.votes.set(voterId, targetId);
    this.broadcastState();

    // Check if everyone voted
    const eligibleVoters = Array.from(this.players.values()).filter(p => p.isConnected);
    if (this.votes.size >= eligibleVoters.length) {
      this.resolveVotes();
    }
    return true;
  }

  private castBotVote(botId: string): void {
    const candidates = this.isRevote && this.tiedCandidateIds.length > 0
      ? this.tiedCandidateIds.filter(id => id !== botId)
      : Array.from(this.players.keys()).filter(id => id !== botId);

    if (candidates.length === 0) return;

    // If bot is imposter, vote for random civilian to blend in
    // If bot is civilian, has slight chance to vote for real imposter or random
    const randomTarget = candidates[Math.floor(Math.random() * candidates.length)];
    this.castVote(botId, randomTarget);
  }

  private resolveVotes(): void {
    this.clearTimer();

    const voteCounts: Record<string, number> = {};
    for (const player of this.players.values()) {
      voteCounts[player.id] = 0;
    }
    for (const targetId of this.votes.values()) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }

    let maxVotes = 0;
    let topCandidates: string[] = [];

    for (const [candId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        topCandidates = [candId];
      } else if (count === maxVotes && count > 0) {
        topCandidates.push(candId);
      }
    }

    // Check for tie
    if (topCandidates.length > 1 && maxVotes > 0 && !this.isRevote) {
      this.addSystemMessage(`Tie vote detected between ${topCandidates.map(id => this.players.get(id)?.displayName).join(', ')}! Entering rapid Revote.`);
      this.startVotingPhase(true, topCandidates);
      return;
    }

    // Single eliminated player or draw
    const eliminatedId = topCandidates.length === 1 ? topCandidates[0] : null;
    this.eliminatedPlayerId = eliminatedId;

    const imposterIds = Array.from(this.playerRoles.entries())
      .filter(([_, role]) => role === 'IMPOSTER')
      .map(([id]) => id);

    const wasImposterEliminated = eliminatedId !== null && imposterIds.includes(eliminatedId);

    // If Imposter caught and settings allow final guess
    if (wasImposterEliminated && this.settings.allowImposterGuess && eliminatedId) {
      const imposterPlayer = this.players.get(eliminatedId);
      if (imposterPlayer?.isBot) {
        // Bot chance to guess secret word
        const isBotLucky = Math.random() < 0.25;
        this.imposterGuessResult = {
          guess: isBotLucky ? this.secretWord : 'Something else',
          isCorrect: isBotLucky
        };
        this.finalizeRoundResults(eliminatedId, wasImposterEliminated, imposterIds, voteCounts);
      } else {
        // Generate Decryption Choices (Secret Word + 3 plausible decoys)
        const decoys = getDecoyWords(this.secretWord, this.category, 3);
        const allChoices = [this.secretWord, ...decoys];
        for (let i = allChoices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allChoices[i], allChoices[j]] = [allChoices[j], allChoices[i]];
        }
        this.decryptionChoices = allChoices;

        // Player imposter gets 15s to enter guess
        this.setPhase('IMPOSTER_GUESS', 15, () => {
          this.finalizeRoundResults(eliminatedId, wasImposterEliminated, imposterIds, voteCounts);
        });
        return;
      }
    } else {
      this.finalizeRoundResults(eliminatedId, wasImposterEliminated, imposterIds, voteCounts);
    }
  }

  public submitImposterGuess(playerId: string, guess: string): boolean {
    if (this.phase !== 'IMPOSTER_GUESS' || this.eliminatedPlayerId !== playerId) return false;
    const cleanGuess = guess.trim();
    const isCorrect = cleanGuess.toLowerCase() === this.secretWord.toLowerCase();
    this.imposterGuessResult = {
      guess: cleanGuess,
      isCorrect
    };

    const imposterIds = Array.from(this.playerRoles.entries())
      .filter(([_, role]) => role === 'IMPOSTER')
      .map(([id]) => id);

    const voteCounts: Record<string, number> = {};
    for (const player of this.players.values()) {
      voteCounts[player.id] = 0;
    }
    for (const targetId of this.votes.values()) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }

    this.finalizeRoundResults(this.eliminatedPlayerId, true, imposterIds, voteCounts);
    return true;
  }

  private finalizeRoundResults(
    eliminatedId: string | null,
    wasImposterEliminated: boolean,
    imposterIds: string[],
    voteCounts: Record<string, number>
  ): void {
    this.clearTimer();

    // Determine winner team
    let winnerTeam: 'CIVILIANS' | 'IMPOSTERS' | 'DRAW';
    if (this.imposterGuessResult?.isCorrect) {
      // Imposter guessed word -> Imposters win!
      winnerTeam = 'IMPOSTERS';
    } else if (wasImposterEliminated) {
      winnerTeam = 'CIVILIANS';
    } else if (eliminatedId === null) {
      winnerTeam = 'DRAW';
    } else {
      // Civilian was wrongly voted out -> Imposters win!
      winnerTeam = 'IMPOSTERS';
    }

    // Calculate score deltas
    const pointsDeltas: Record<string, number> = {};
    for (const [pid, player] of this.players.entries()) {
      const isImposter = imposterIds.includes(pid);
      let delta = 0;

      if (winnerTeam === 'CIVILIANS' && !isImposter) {
        delta += 100;
      } else if (winnerTeam === 'IMPOSTERS' && isImposter) {
        delta += 250;
      } else if (winnerTeam === 'DRAW') {
        delta += 50;
      }

      // Bonus points for voting correctly against the imposter
      const votedTarget = this.votes.get(pid);
      if (votedTarget && imposterIds.includes(votedTarget)) {
        delta += 25;
      }

      pointsDeltas[pid] = delta;
      player.score += delta;

      // Update in SQLite DB if not a bot
      if (!player.isBot) {
        const won = (winnerTeam === 'CIVILIANS' && !isImposter) || (winnerTeam === 'IMPOSTERS' && isImposter);
        updatePlayerScore(pid, {
          won,
          isImposter,
          pointsDelta: delta,
          displayName: player.displayName,
          avatarId: player.avatarId
        });
      }
    }

    const voterTargets: Record<string, string> = {};
    for (const [voter, target] of this.votes.entries()) {
      voterTargets[voter] = target;
    }

    this.lastRoundResult = {
      roundNumber: this.currentRound,
      secretWord: this.secretWord,
      category: this.category,
      imposterHint: this.imposterHints[0] || 'Unknown hint',
      imposterIds,
      eliminatedPlayerId: eliminatedId,
      wasImposterEliminated,
      imposterGuess: this.imposterGuessResult || undefined,
      winnerTeam,
      voteCounts,
      voterTargets,
      pointsDeltas
    };

    // Transition to REVEAL phase (10s to look at dramatic reveal)
    this.setPhase('REVEAL', 12, () => {
      if (this.currentRound >= this.settings.totalRounds) {
        this.finishMatch();
      } else {
        this.setPhase('ROUND_SUMMARY', 0); // waits for host to click "Next Round"
      }
    });
  }

  private finishMatch(): void {
    this.clearTimer();
    let highestScore = -1;
    let championPlayerId: string | undefined;

    for (const [pid, player] of this.players.entries()) {
      if (player.score > highestScore) {
        highestScore = player.score;
        championPlayerId = pid;
      }
    }

    this.setPhase('MATCH_OVER', 0);
  }

  public rematch(hostId: string): boolean {
    if (this.hostId !== hostId) return false;
    for (const player of this.players.values()) {
      player.score = 0;
      player.isReady = player.isBot ? true : false;
    }
    this.currentRound = 1;
    this.lastRoundResult = null;
    this.clues = [];
    this.votes.clear();
    this.chatMessages = [];
    this.setPhase('LOBBY', 0);
    return true;
  }

  public addChatMessage(senderId: string, text: string): boolean {
    const player = this.players.get(senderId);
    if (!player) return false;
    const cleanText = text.trim();
    if (!cleanText || cleanText.length > 200) return false;

    const msg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName: player.displayName,
      senderAvatar: player.avatarId,
      text: cleanText,
      timestamp: Date.now()
    };

    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    this.io.to(this.code).emit('chat:message', msg);
    return true;
  }

  public addSystemMessage(text: string): void {
    const msg: ChatMessage = {
      id: `sys_${Date.now()}`,
      senderId: 'system',
      senderName: 'SYSTEM',
      senderAvatar: 'system',
      text,
      timestamp: Date.now(),
      isSystem: true
    };
    this.chatMessages.push(msg);
    this.io.to(this.code).emit('chat:message', msg);
  }

  // Timer utilities
  private setPhase(newPhase: GamePhase, durationSec: number, onComplete?: () => void): void {
    this.clearTimer();
    this.phase = newPhase;
    this.phaseDuration = durationSec;
    this.phaseTimeRemaining = durationSec;
    this.broadcastState();

    if (durationSec > 0) {
      this.timerInterval = setInterval(() => {
        this.phaseTimeRemaining -= 1;
        if (this.phaseTimeRemaining <= 0) {
          this.clearTimer();
          if (onComplete) onComplete();
        } else {
          // Send lightweight timer tick
          this.io.to(this.code).emit('timer:tick', {
            remaining: this.phaseTimeRemaining,
            duration: this.phaseDuration,
            phase: this.phase
          });
        }
      }, 1000);
      this.timerInterval.unref();
    }
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Public state projection
  public getPublicState(): PublicGameState {
    const publicPlayers: PublicPlayerInfo[] = Array.from(this.players.values()).map(p => ({
      id: p.id,
      displayName: p.displayName,
      avatarId: p.avatarId,
      isHost: p.id === this.hostId,
      isReady: p.isReady,
      isConnected: p.isConnected,
      isBot: p.isBot,
      score: p.score,
      hasGivenClue: this.clues.some(c => c.playerId === p.id),
      hasVoted: this.votes.has(p.id),
      isEliminated: this.eliminatedPlayerId === p.id
    }));

    const eligibleCandidateIds = this.isRevote && this.tiedCandidateIds.length > 0
      ? this.tiedCandidateIds
      : publicPlayers.map(p => p.id);

    return {
      roomCode: this.code,
      hostId: this.hostId,
      phase: this.phase,
      phaseTimeRemaining: this.phaseTimeRemaining,
      phaseDuration: this.phaseDuration,
      settings: this.settings,
      currentRound: this.currentRound,
      totalRounds: this.settings.totalRounds,
      category: this.category,
      players: publicPlayers,
      currentSpeakerId: this.phase === 'CLUE' && this.currentSpeakerIndex < this.speakerOrder.length
        ? this.speakerOrder[this.currentSpeakerIndex]
        : null,
      clues: this.clues,
      eligibleVoterIds: publicPlayers.filter(p => p.isConnected).map(p => p.id),
      eligibleCandidateIds,
      votedPlayerIds: Array.from(this.votes.keys()),
      lastRoundResult: this.lastRoundResult,
      imposterGuessingPlayerId: this.phase === 'IMPOSTER_GUESS' ? this.eliminatedPlayerId : null,
      suspectRatings: Object.fromEntries(
        Array.from(this.suspectRatings.entries()).map(([pid, val]) => [pid, { sus: val.sus, trust: val.trust }])
      ),
      recentReactions: this.recentReactions,
      aiAnalysis: this.aiAnalysis,
      decryptionChoices: this.decryptionChoices
    };
  }

  public addReaction(senderId: string, emoji: string, label: string): ReactionEvent | null {
    const sender = this.players.get(senderId);
    if (!sender) return null;
    const reaction: ReactionEvent = {
      id: `rx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName: sender.displayName,
      emoji,
      label,
      timestamp: Date.now()
    };
    this.recentReactions.push(reaction);
    if (this.recentReactions.length > 8) {
      this.recentReactions.shift();
    }
    this.io.to(this.code).emit('room:reaction', reaction);
    return reaction;
  }

  public ratePlayer(voterId: string, targetId: string, rating: 'SUSPECT' | 'TRUSTED'): void {
    if (!this.players.has(voterId) || !this.players.has(targetId) || voterId === targetId) return;

    let targetRecord = this.suspectRatings.get(targetId);
    if (!targetRecord) {
      targetRecord = { sus: 0, trust: 0, voters: new Map() };
      this.suspectRatings.set(targetId, targetRecord);
    }

    const prevVote = targetRecord.voters.get(voterId);
    if (prevVote === rating) {
      targetRecord.voters.delete(voterId);
      if (rating === 'SUSPECT') targetRecord.sus = Math.max(0, targetRecord.sus - 1);
      else targetRecord.trust = Math.max(0, targetRecord.trust - 1);
    } else {
      if (prevVote === 'SUSPECT') targetRecord.sus = Math.max(0, targetRecord.sus - 1);
      else if (prevVote === 'TRUSTED') targetRecord.trust = Math.max(0, targetRecord.trust - 1);

      targetRecord.voters.set(voterId, rating);
      if (rating === 'SUSPECT') targetRecord.sus++;
      else targetRecord.trust++;
    }

    this.broadcastState();
  }

  public setAiAnalysis(analysis: string): void {
    this.aiAnalysis = analysis;
    this.broadcastState();
  }

  public broadcastState(): void {
    const state = this.getPublicState();
    this.io.to(this.code).emit('game:state', state);
  }

  // Bot helpers
  private generateBotCivilianClue(word: string, category: string): string {
    const wordClean = word.toLowerCase();
    const mapClues: Record<string, string[]> = {
      pizza: ['Cheesy slice', 'Crispy crust', 'Hot delivery'],
      sushi: ['Fresh ocean roll', 'Dipped in soy', 'Chopsticks delicacy'],
      elephant: ['Huge memory', 'Grey majestic giant', 'Long flexible trunk'],
      lion: ['Savannah king', 'Fierce golden roar', 'Apex pride hunter'],
      basketball: ['Fast slam dunk', 'Orange sphere court', 'Three point arc'],
      soccer: ['Goal celebration', 'Grass pitch kick', 'Ninety minute match'],
      smartphone: ['Touchscreen pocket companion', 'Endless scrolling apps', 'Rechargeable mobile life'],
      umbrella: ['Rainy day shelter', 'Portable waterproof canopy', 'Unfolds in storms'],
      volcano: ['Molten mountain', 'Erupting ash cloud', 'Glowing magma rock'],
      chess: ['Checkmate crown', 'Sixty-four battlefield squares', 'Tactical king maneuver']
    };

    if (mapClues[wordClean]) {
      const list = mapClues[wordClean];
      return list[Math.floor(Math.random() * list.length)];
    }

    const fallbacks = [
      `Essential in ${category.toLowerCase()}`,
      `Distinctive everyday feature`,
      `Commonly recognized world classic`,
      `Remarkable craftsmanship`
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private generateBotImposterClue(category: string, hint?: string): string {
    const vagueClues = [
      'Very famous worldwide',
      'Always brings strong memories',
      'Something quite iconic in our culture',
      'Known for its prominent presence',
      'Quite versatile and popular',
      'Classic example of its kind'
    ];
    return vagueClues[Math.floor(Math.random() * vagueClues.length)];
  }
}
