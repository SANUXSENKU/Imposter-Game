export type GamePhase =
  | 'LOBBY'
  | 'ASSIGNMENT'
  | 'CLUE'
  | 'DISCUSSION'
  | 'VOTING'
  | 'REVOTE'
  | 'REVEAL'
  | 'IMPOSTER_GUESS'
  | 'ROUND_SUMMARY'
  | 'MATCH_OVER';

export type PlayerRole = 'CIVILIAN' | 'IMPOSTER';

export interface RoomSettings {
  maxPlayers: number; // 3-12
  imposterCount: number; // 1 or 2
  clueTimerSec: number; // 20, 30, 45, 60
  discussionTimerSec: number; // 30, 45, 60, 90, 120
  votingTimerSec: number; // 20, 30, 45, 60
  selectedCategories: string[]; // empty = all
  totalRounds: number; // 1, 3, 5
  allowImposterGuess: boolean; // can imposter guess secret word if caught?
}

export interface Player {
  id: string;
  sessionToken: string;
  displayName: string;
  avatarId: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isBot?: boolean;
  score: number;
}

export interface PublicPlayerInfo {
  id: string;
  displayName: string;
  avatarId: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isBot?: boolean;
  score: number;
  hasGivenClue?: boolean;
  hasVoted?: boolean;
  isEliminated?: boolean;
}

export interface ClueItem {
  id: string;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  clueText: string;
  orderIndex: number;
  submittedAt: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface VoteRecord {
  voterId: string;
  targetId: string;
}

export interface RoundResult {
  roundNumber: number;
  secretWord: string;
  category: string;
  imposterHint: string;
  imposterIds: string[];
  eliminatedPlayerId: string | null;
  wasImposterEliminated: boolean;
  imposterGuess?: {
    guess: string;
    isCorrect: boolean;
  };
  winnerTeam: 'CIVILIANS' | 'IMPOSTERS' | 'DRAW';
  voteCounts: Record<string, number>;
  voterTargets: Record<string, string>; // voterId -> targetId (revealed at end)
  pointsDeltas: Record<string, number>;
}

export interface PrivateAssignment {
  role: PlayerRole;
  category: string;
  secretWord?: string; // only present if role === 'CIVILIAN'
  imposterHint?: string; // only present if role === 'IMPOSTER'
}

export interface PublicGameState {
  roomCode: string;
  hostId: string;
  phase: GamePhase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  settings: RoomSettings;
  currentRound: number;
  totalRounds: number;
  category: string;
  players: PublicPlayerInfo[];
  currentSpeakerId: string | null;
  clues: ClueItem[];
  eligibleVoterIds: string[];
  eligibleCandidateIds: string[]; // in revote, only tied players
  votedPlayerIds: string[]; // list of player IDs who submitted a vote (private who they chose)
  lastRoundResult: RoundResult | null;
  imposterGuessingPlayerId?: string | null;
  matchWinner?: {
    winnerTeam: 'CIVILIANS' | 'IMPOSTERS' | 'DRAW';
    championPlayerId?: string;
  };
  suspectRatings?: Record<string, { sus: number; trust: number }>;
  recentReactions?: ReactionEvent[];
  aiAnalysis?: string | null;
  decryptionChoices?: string[];
}

export interface ReactionEvent {
  id: string;
  senderId: string;
  senderName: string;
  emoji: string;
  label: string;
  timestamp: number;
}

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  avatarId: string;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  imposterWins: number;
  civilianWins: number;
  points: number;
  winRate: number;
}

