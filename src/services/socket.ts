import { io, Socket } from 'socket.io-client';
import { PublicGameState, PrivateAssignment, ChatMessage, Player } from '../shared/types.ts';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    // Connect to current origin
    socketInstance = io(window.location.origin, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }
  return socketInstance;
}

export interface SocketEvents {
  onGameState: (state: PublicGameState) => void;
  onPrivateAssignment: (assignment: PrivateAssignment) => void;
  onChatMessage: (message: ChatMessage) => void;
  onTimerTick: (data: { remaining: number; duration: number; phase: string }) => void;
  onRoomJoined: (data: { roomCode: string; player: Player; state: PublicGameState }) => void;
  onErrorToast: (data: { message: string }) => void;
}
