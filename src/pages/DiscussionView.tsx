import React from 'react';
import { MessageSquare, Users, Vote, ArrowRight, Shield, AlertCircle, Bot, Sparkles } from 'lucide-react';
import { PublicGameState, Player, PrivateAssignment, ChatMessage } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Timer } from '../components/Timer.tsx';
import { ChatPanel } from '../components/ChatPanel.tsx';
import { SusOMeter } from '../components/SusOMeter.tsx';
import { sounds } from '../services/sound.ts';

interface DiscussionViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  assignment: PrivateAssignment | null;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onForceVoting: () => void;
  onRatePlayer?: (targetId: string, rating: 'SUSPECT' | 'TRUSTED') => void;
  onOpenInspector?: () => void;
  mySuspectVotes?: Record<string, 'SUSPECT' | 'TRUSTED'>;
}

export const DiscussionView: React.FC<DiscussionViewProps> = ({
  gameState,
  currentPlayer,
  assignment,
  chatMessages,
  onSendMessage,
  onForceVoting,
  onRatePlayer,
  onOpenInspector,
  mySuspectVotes = {}
}) => {
  const isHost = gameState.hostId === currentPlayer.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header with timer and Host control */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
            <span>Round {gameState.currentRound} / {gameState.totalRounds}</span>
            <span aria-hidden="true">·</span>
            <span>Category: <strong className="text-white">{gameState.category}</strong></span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Phase 3: Open Discussion & Interrogation
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All {gameState.clues.length} clues are revealed. Identify contradictions, vague bluffs, or hesitant clues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Timer
            remaining={gameState.phaseTimeRemaining}
            duration={gameState.phaseDuration}
            label="Voting Begins In"
            size="md"
          />

          {onOpenInspector && (
            <button
              onClick={() => { sounds.playClick(); onOpenInspector(); }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-purple-200 bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 active:scale-95 shadow-lg shadow-purple-950/60 transition-all flex items-center gap-1.5 shrink-0"
              title="Inspect clues with Inspector Gemini AI"
            >
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Inspector Gemini</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          )}

          {isHost && (
            <button
              onClick={() => { sounds.playClick(); onForceVoting(); }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 shrink-0"
            >
              <Vote className="w-4 h-4" />
              <span>Start Voting Now</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Clues Review Board & SusOMeter */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sus-O-Meter Live Heatmap */}
          {onRatePlayer && (
            <SusOMeter
              players={gameState.players}
              currentPlayerId={currentPlayer.id}
              suspectRatings={gameState.suspectRatings}
              onRatePlayer={onRatePlayer}
              myVotes={mySuspectVotes}
            />
          )}

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>All Clues Submitted</span>
              <span className="text-xs font-mono text-purple-400">
                Cross-Examine Suspects
              </span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {gameState.clues.map((clue, idx) => {
                const isMe = clue.playerId === currentPlayer.id;
                return (
                  <div
                    key={clue.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                      isMe
                        ? 'bg-purple-950/30 border-purple-800/60'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <Avatar avatarId={clue.playerAvatar} size="md" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white truncate">
                          {clue.playerName} {isMe && <span className="text-purple-400 text-[10px] font-mono">(You)</span>}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base font-semibold text-slate-100 break-words italic">
                        "{clue.clueText}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confidential Reminder Drawer */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Confidential Role:</span>
            </div>
            {assignment?.role === 'CIVILIAN' ? (
              <span className="font-mono text-purple-300">
                Word: <strong className="text-white uppercase font-bold">{assignment.secretWord}</strong>
              </span>
            ) : (
              <span className="font-mono text-amber-300">
                Hint: <strong className="text-white font-bold">"{assignment?.imposterHint}"</strong>
              </span>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Live In-Room Chat for verbal & text deduction */}
        <div className="lg:col-span-5">
          <ChatPanel
            messages={chatMessages}
            currentUserId={currentPlayer.id}
            onSendMessage={onSendMessage}
            isCompact={false}
          />
        </div>
      </div>
    </div>
  );
};
