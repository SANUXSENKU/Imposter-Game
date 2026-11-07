import React, { useEffect } from 'react';
import { Eye, ShieldAlert, Sparkles, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { PrivateAssignment, PublicGameState } from '../shared/types.ts';
import { Timer } from '../components/Timer.tsx';
import { sounds } from '../services/sound.ts';

interface AssignmentViewProps {
  assignment: PrivateAssignment | null;
  gameState: PublicGameState;
}

export const AssignmentView: React.FC<AssignmentViewProps> = ({
  assignment,
  gameState
}) => {
  useEffect(() => {
    sounds.playJoin();
  }, []);

  const isImposter = assignment?.role === 'IMPOSTER';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header with timer */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block">
            Phase 1 · Dossier Briefing
          </span>
          <h2 className="text-xl font-extrabold text-white">
            Classified Assignment
          </h2>
        </div>
        <Timer
          remaining={gameState.phaseTimeRemaining}
          duration={gameState.phaseDuration}
          label="Clue Round In"
          size="md"
        />
      </div>

      {/* Main Dossier Card */}
      <div className={`relative rounded-3xl p-6 sm:p-8 border shadow-2xl overflow-hidden transition-all ${
        isImposter
          ? 'bg-gradient-to-b from-red-950/40 via-slate-900 to-slate-950 border-red-500/60 shadow-red-950/40'
          : 'bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/60 shadow-purple-950/40'
      }`}>
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 blur-[70px] pointer-events-none ${
          isImposter ? 'bg-red-500/20' : 'bg-purple-500/20'
        }`} />

        {/* Dossier Badge Illustration */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0 shadow-md">
              <img
                src="/src/assets/images/badge_classified_word_1793283794504.jpg"
                alt="Classified dossier badge"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold tracking-wider uppercase text-slate-300 bg-slate-800">
                  Round {gameState.currentRound} / {gameState.totalRounds}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  CATEGORY: <span className="text-white font-bold">{assignment?.category || gameState.category}</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isImposter ? 'YOU ARE THE IMPOSTER' : 'YOU ARE A CIVILIAN AGENT'}
              </h3>
            </div>
          </div>

          <div className={`p-2 rounded-xl border ${
            isImposter ? 'bg-red-950/60 border-red-700/60 text-red-400' : 'bg-purple-950/60 border-purple-700/60 text-purple-400'
          }`}>
            {isImposter ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Lock className="w-6 h-6" />}
          </div>
        </div>

        {/* Confidential Role Centerpiece */}
        {isImposter ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-mono font-bold uppercase tracking-widest">
              Imposter Role Assigned
            </div>

            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-900/60 max-w-lg mx-auto">
              <span className="text-xs uppercase font-mono text-red-400 font-bold block mb-1">
                Your Classified Vague Hint
              </span>
              <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                "{assignment?.imposterHint || 'Unknown Hint'}"
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You <strong className="text-white">DO NOT</strong> know the secret word. Pay close attention to what other agents say. Bluff, blend in, and avoid being voted out!
            </p>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/80 text-purple-300 text-xs font-mono font-bold uppercase tracking-widest">
              Civilian Clearance
            </div>

            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-900/60 max-w-lg mx-auto">
              <span className="text-xs uppercase font-mono text-purple-400 font-bold block mb-1">
                The Secret Word
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider uppercase text-purple-200">
                {assignment?.secretWord || 'Loading...'}
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Give a clue that proves to fellow agents that you know the secret word, without making it too obvious for the Imposter!
            </p>
          </div>
        )}

        {/* Security watermark footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>CLASSIFIED DATA PROTOCOL</span>
          <span>KEEP WINDOW PRIVATE</span>
        </div>
      </div>
    </div>
  );
};
