import React, { useState, useEffect } from 'react';
import { Send, Mic, Volume2, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { PublicGameState, Player, PrivateAssignment } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Timer } from '../components/Timer.tsx';
import { sounds } from '../services/sound.ts';

interface ClueViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  assignment: PrivateAssignment | null;
  onSubmitClue: (text: string) => void;
}

export const ClueView: React.FC<ClueViewProps> = ({
  gameState,
  currentPlayer,
  assignment,
  onSubmitClue
}) => {
  const [clueInput, setClueInput] = useState('');
  const isMyTurn = gameState.currentSpeakerId === currentPlayer.id;
  const currentSpeaker = gameState.players.find(p => p.id === gameState.currentSpeakerId);

  // Sound chime when clues count changes
  useEffect(() => {
    if (gameState.clues.length > 0) {
      sounds.playClueChime();
    }
  }, [gameState.clues.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMyTurn || !clueInput.trim()) return;
    sounds.playClick();
    onSubmitClue(clueInput.trim());
    setClueInput('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Turn Header Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
            <span>Round {gameState.currentRound} / {gameState.totalRounds}</span>
            <span aria-hidden="true">·</span>
            <span>Category: <strong className="text-white">{gameState.category}</strong></span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Phase 2: Clue Round</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
              {gameState.clues.length} / {gameState.players.length} clues
            </span>
          </h2>
        </div>

        <Timer
          remaining={gameState.phaseTimeRemaining}
          duration={gameState.phaseDuration}
          label={isMyTurn ? 'Your Time' : `${currentSpeaker?.displayName || 'Speaker'}'s Turn`}
          size="md"
        />
      </div>

      {/* Center Action Box: My Turn vs Waiting */}
      <div className="mb-8">
        {isMyTurn ? (
          <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-2 border-purple-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-900/30 animate-pulse-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-purple-400 tracking-wider">
                  Attention Required
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  It's Your Turn! Provide a One-Phrase Clue
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={clueInput}
                  onChange={e => setClueInput(e.target.value)}
                  placeholder="e.g. Sliced with melted cheese..."
                  maxLength={65}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-4 text-base sm:text-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-colors shadow-inner"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  {clueInput.length}/65
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Be clever. If you say the exact word, it will be automatically redacted!</span>
                </div>

                <button
                  type="submit"
                  disabled={!clueInput.trim()}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-500 active:scale-95 disabled:opacity-40 shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit Clue</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentSpeaker ? (
                <Avatar avatarId={currentSpeaker.avatarId} size="lg" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-800" />
              )}
              <div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                  Current Speaker
                </span>
                <h3 className="text-lg font-bold text-white">
                  Waiting for <span className="text-purple-300">{currentSpeaker?.displayName || 'Operative'}</span> to submit a clue...
                </h3>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
              <span>Transmitting</span>
            </div>
          </div>
        )}
      </div>

      {/* Clues Timeline Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Clue Submissions Stream</span>
          <span className="text-xs font-mono text-slate-400 font-normal">
            Order of Testimony
          </span>
        </h3>

        {gameState.clues.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 italic">
            No clues submitted yet. First operative is drafting their clue above.
          </div>
        ) : (
          <div className="space-y-3">
            {gameState.clues.map((clue, idx) => {
              const isMine = clue.playerId === currentPlayer.id;
              return (
                <div
                  key={clue.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                    isMine
                      ? 'bg-purple-950/30 border-purple-800/60'
                      : 'bg-slate-950/70 border-slate-800/80'
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
                        {clue.playerName} {isMine && <span className="text-purple-400 text-[10px] font-mono">(You)</span>}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(clue.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-slate-200 break-words italic">
                      "{clue.clueText}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confidential Personal Reference Drawer at Bottom */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-950/90 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400">Your Confidential Assignment:</span>
        </div>

        {assignment?.role === 'CIVILIAN' ? (
          <div className="font-mono text-purple-300">
            Secret Word: <strong className="text-white uppercase font-bold tracking-wider">{assignment.secretWord}</strong>
          </div>
        ) : (
          <div className="font-mono text-amber-300">
            Imposter Hint: <strong className="text-white font-bold">"{assignment?.imposterHint}"</strong>
          </div>
        )}
      </div>
    </div>
  );
};
