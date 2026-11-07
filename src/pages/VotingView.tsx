import React, { useState } from 'react';
import { Vote, CheckCircle2, AlertTriangle, ShieldCheck, UserX, Clock } from 'lucide-react';
import { PublicGameState, Player, PrivateAssignment } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Timer } from '../components/Timer.tsx';
import { sounds } from '../services/sound.ts';

interface VotingViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  assignment: PrivateAssignment | null;
  onCastVote: (targetId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  gameState,
  currentPlayer,
  assignment,
  onCastVote
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const hasVoted = gameState.votedPlayerIds.includes(currentPlayer.id);
  const isRevote = gameState.phase === 'REVOTE';

  const handleVoteSubmit = (targetId: string) => {
    if (hasVoted || targetId === currentPlayer.id) return;
    sounds.playVoteCast();
    setSelectedTargetId(targetId);
    onCastVote(targetId);
  };

  // Find clue for a player
  const getPlayerClue = (pid: string) => {
    const clue = gameState.clues.find(c => c.playerId === pid);
    return clue?.clueText || 'No clue provided';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner with Timer & Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-1">
            <span>Round {gameState.currentRound} / {gameState.totalRounds}</span>
            <span aria-hidden="true">·</span>
            <span className={isRevote ? 'text-amber-400 font-bold' : 'text-slate-300'}>
              {isRevote ? 'TIE-BREAKER REVOTE' : 'PHASE 4: ELIMINATION BALLOT'}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white">
            {isRevote ? 'Tie-Breaker: Choose Between Tied Suspects' : 'Vote for the Imposter'}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {hasVoted
              ? 'Your secret ballot is cast! Waiting for all operatives to vote.'
              : 'Select the operative whose clue or behavior was most suspicious.'}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-500 font-mono block">Ballot Progress</span>
            <span className="text-xl font-bold font-mono text-purple-300 tabular-nums">
              {gameState.votedPlayerIds.length} / {gameState.eligibleVoterIds.length} Voted
            </span>
          </div>

          <Timer
            remaining={gameState.phaseTimeRemaining}
            duration={gameState.phaseDuration}
            label="Ballot Closes In"
            size="md"
          />
        </div>
      </div>

      {isRevote && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 text-xs text-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>The previous vote was a dead tie. Vote only for one of the tied suspects highlighted below.</span>
        </div>
      )}

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {gameState.players.map(p => {
          const isCandidate = gameState.eligibleCandidateIds.includes(p.id);
          const isSelf = p.id === currentPlayer.id;
          const isSelected = selectedTargetId === p.id;
          const clueText = getPlayerClue(p.id);

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-900/30 ring-2 ring-purple-500/50'
                  : isCandidate && !isSelf && !hasVoted
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  : 'bg-slate-950/50 border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar avatarId={p.avatarId} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{p.displayName}</span>
                        {isSelf && <span className="text-purple-400 text-xs font-mono">(You)</span>}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {p.score} total pts
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1.5 rounded-full bg-purple-600 text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-4 text-xs">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                    Their Clue:
                  </span>
                  <p className="text-slate-200 font-medium italic">
                    "{clueText}"
                  </p>
                </div>
              </div>

              <div>
                {isSelf ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800"
                  >
                    Cannot Vote For Self
                  </button>
                ) : !isCandidate ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800"
                  >
                    Not an Eligible Candidate
                  </button>
                ) : hasVoted ? (
                  <div className="text-center py-2 text-xs font-mono text-slate-500">
                    {isSelected ? '✓ Your Choice' : 'Ballot Submitted'}
                  </div>
                ) : (
                  <button
                    onClick={() => handleVoteSubmit(p.id)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 active:scale-95 shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>Eliminate {p.displayName}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Word Reference Drawer */}
      <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Remember your role:</span>
        {assignment?.role === 'CIVILIAN' ? (
          <span className="font-mono text-purple-300">
            Secret Word: <strong className="text-white uppercase font-bold">{assignment.secretWord}</strong>
          </span>
        ) : (
          <span className="font-mono text-amber-300">
            Your Vague Hint: <strong className="text-white font-bold">"{assignment?.imposterHint}"</strong>
          </span>
        )}
      </div>
    </div>
  );
};
