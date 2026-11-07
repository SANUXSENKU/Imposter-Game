import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, Trophy, CheckCircle2, Users, Flame, Lock } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface RulesViewProps {
  onBack: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Game</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Official Imposter Game Rules
            </h1>
            <p className="text-xs text-slate-400">
              Standard competitive protocol for social deduction and word association.
            </p>
          </div>
        </div>

        {/* Section 1: Winning Conditions */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 text-purple-400">
            <Trophy className="w-4 h-4" />
            <span>Winning Conditions</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-2">
              <h3 className="font-bold text-white text-sm">Civilian Agents Win When:</h3>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>They successfully vote out the true Imposter in the ballot phase.</li>
                <li>The caught Imposter fails to guess the exact secret word during their final chance.</li>
                <li>Civilians earn <strong className="text-emerald-400 font-mono">+100 points</strong> each, plus a <strong className="text-emerald-400 font-mono">+25 point bonus</strong> for voting accurately.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-2">
              <h3 className="font-bold text-white text-sm">The Imposter Wins When:</h3>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                <li>They survive the voting phase without being eliminated (another civilian is wrongly voted out).</li>
                <li>OR if caught, they successfully guess the secret word within the 15-second bonus window!</li>
                <li>The Imposter earns <strong className="text-emerald-400 font-mono">+250 points</strong> for a victorious deception.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Clue Etiquette & Anti-Cheat */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Clue Giving Protocols</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              1. <strong>Single Phrase Limit:</strong> Clues must be brief words or concise descriptive phrases (under 60 characters).
            </p>
            <p>
              2. <strong>No Direct Word Reveals:</strong> Submitting the exact secret word or clear anagrams will be automatically redacted by the server security prober.
            </p>
            <p>
              3. <strong>Subtlety is Key:</strong> If your clue is too specific, the Imposter will learn the secret word and deduce their cover story. If your clue is too vague, fellow agents might suspect you are the Imposter!
            </p>
          </div>
        </div>

        {/* Section 3: Voting & Tie Breaks */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 text-cyan-400">
            <Users className="w-4 h-4" />
            <span>Voting & Tie-Breaker Logic</span>
          </h2>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3 leading-relaxed">
            <p>
              • Every player must vote secretly. Self-voting is prohibited.
            </p>
            <p>
              • If there is a tie between the top suspects, a <strong>rapid 20-second Revote</strong> is initiated where players may only vote between the tied contenders.
            </p>
            <p>
              • If a tie persists after the revote, the round ends in a Draw with 50 consolation points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
