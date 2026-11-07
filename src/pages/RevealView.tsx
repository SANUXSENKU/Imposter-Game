import React, { useState, useEffect } from 'react';
import {
  Skull,
  Award,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle,
  XCircle,
  Sparkles,
  HelpCircle,
  Send,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublicGameState, Player, PrivateAssignment, RoundResult } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Timer } from '../components/Timer.tsx';
import { DecryptionTerminal } from '../components/DecryptionTerminal.tsx';
import { sounds } from '../services/sound.ts';

interface RevealViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  assignment: PrivateAssignment | null;
  onSubmitImposterGuess: (guess: string) => void;
}

export const RevealView: React.FC<RevealViewProps> = ({
  gameState,
  currentPlayer,
  assignment,
  onSubmitImposterGuess
}) => {
  const [guessInput, setGuessInput] = useState('');
  const result = gameState.lastRoundResult;
  const isGuessPhase = gameState.phase === 'IMPOSTER_GUESS';
  const isGuessingPlayer = gameState.imposterGuessingPlayerId === currentPlayer.id;

  const eliminatedPlayer = result?.eliminatedPlayerId
    ? gameState.players.find(p => p.id === result.eliminatedPlayerId)
    : null;

  const isCivilianWin = result?.winnerTeam === 'CIVILIANS';
  const isImposterWin = result?.winnerTeam === 'IMPOSTERS';
  const isDraw = result?.winnerTeam === 'DRAW';

  const didIWin =
    (isCivilianWin && assignment?.role === 'CIVILIAN') ||
    (isImposterWin && assignment?.role === 'IMPOSTER');

  useEffect(() => {
    if (isGuessPhase) {
      sounds.playClueChime();
    } else if (result) {
      sounds.playElimination();
      if (didIWin) {
        setTimeout(() => {
          sounds.playVictory();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
      }
    }
  }, [isGuessPhase, result]);

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    sounds.playClick();
    onSubmitImposterGuess(guessInput.trim());
  };

  // 1. If currently in Imposter Guess sub-phase:
  if (isGuessPhase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider">
              Last Chance Salvo
            </span>
            <Timer
              remaining={gameState.phaseTimeRemaining}
              duration={gameState.phaseDuration}
              size="sm"
            />
          </div>

          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">
              The Imposter Was Caught!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isGuessingPlayer
                ? 'You have 15 seconds to guess the secret word. A correct guess steals victory!'
                : `${eliminatedPlayer?.displayName || 'The Imposter'} is attempting to guess the secret word!`}
            </p>
          </div>

          {isGuessingPlayer ? (
            <DecryptionTerminal
              decryptionChoices={gameState.decryptionChoices || []}
              category={gameState.category}
              timeRemaining={gameState.phaseTimeRemaining}
              duration={gameState.phaseDuration}
              onSubmitGuess={onSubmitImposterGuess}
            />
          ) : (
            <div className="py-6 text-sm font-mono text-amber-300 animate-pulse">
              Waiting for imposter submission...
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Full Reveal Outcome Screen
  if (!result) {
    return (
      <div className="py-16 text-center text-slate-400 font-mono">
        Tabulating elimination ballots...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Victory Banner */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-2xl text-center relative overflow-hidden ${
        isCivilianWin
          ? 'bg-gradient-to-b from-purple-950/70 via-slate-900 to-slate-950 border-purple-500/70 shadow-purple-950/50'
          : isImposterWin
          ? 'bg-gradient-to-b from-red-950/70 via-slate-900 to-slate-950 border-red-500/70 shadow-red-950/50'
          : 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700 shadow-slate-950'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Round {result.roundNumber} Outcome
          </span>
          <Timer
            remaining={gameState.phaseTimeRemaining}
            duration={gameState.phaseDuration}
            label="Next Round In"
            size="sm"
          />
        </div>

        <div className="inline-flex p-3 rounded-2xl mb-4 bg-slate-950/80 border border-slate-800">
          {isCivilianWin ? (
            <ShieldCheck className="w-10 h-10 text-purple-400" />
          ) : isImposterWin ? (
            <ShieldAlert className="w-10 h-10 text-red-400" />
          ) : (
            <HelpCircle className="w-10 h-10 text-slate-400" />
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-2">
          {isCivilianWin ? 'Civilian Agents Victorious!' : isImposterWin ? 'The Imposter Won!' : 'Match Inconclusive / Draw!'}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
          {isCivilianWin
            ? 'The undercover Imposter was unmasked and failed to decipher the secret word!'
            : isImposterWin
            ? result.imposterGuess?.isCorrect
              ? 'The Imposter correctly guessed the secret word at the final second!'
              : 'The Imposter deceived the room and evaded identification!'
            : 'Votes were deadlocked. No operative was definitively eliminated.'}
        </p>

        {/* Word & Hint Centerpiece */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-2xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60">
            <span className="text-[11px] font-mono uppercase text-purple-400 font-bold block mb-1">
              True Secret Word ({result.category})
            </span>
            <span className="text-2xl font-black text-white uppercase tracking-wider font-mono">
              {result.secretWord}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60">
            <span className="text-[11px] font-mono uppercase text-amber-400 font-bold block mb-1">
              Imposter's Vague Hint
            </span>
            <span className="text-sm font-medium text-amber-200 italic">
              "{result.imposterHint}"
            </span>
          </div>
        </div>
      </div>

      {/* Elimination Breakdown Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Elimination & Role Unveiling</span>
          <span className="text-xs font-mono text-slate-400">
            {eliminatedPlayer ? `Eliminated: ${eliminatedPlayer.displayName}` : 'No player eliminated'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {gameState.players.map(p => {
            const isImposter = result.imposterIds.includes(p.id);
            const isEliminated = p.id === result.eliminatedPlayerId;
            const pointsDelta = result.pointsDeltas[p.id] || 0;
            const myVoteTarget = result.voterTargets[p.id];
            const targetPlayer = gameState.players.find(tgt => tgt.id === myVoteTarget);

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isEliminated
                    ? 'bg-red-950/40 border-red-500/80 shadow-md ring-1 ring-red-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar avatarId={p.avatarId} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-white truncate">
                          {p.displayName}
                        </h4>
                        <span className={`text-[10px] font-mono font-bold uppercase ${
                          isImposter ? 'text-red-400' : 'text-purple-400'
                        }`}>
                          {isImposter ? '★ IMPOSTER' : 'CIVILIAN AGENT'}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{pointsDelta} pts
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span>Voted for:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[120px]">
                      {targetPlayer ? targetPlayer.displayName : 'Nobody'}
                    </span>
                  </div>
                </div>

                {isEliminated && (
                  <div className="mt-3 pt-2 border-t border-red-900/60 text-center text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                    Voted Out This Round
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
