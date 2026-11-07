import React from 'react';
import { ArrowLeft, BookOpen, Lightbulb, Users, HelpCircle, Check, Eye } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface HowToPlayViewProps {
  onBack: () => void;
}

export const HowToPlayView: React.FC<HowToPlayViewProps> = ({ onBack }) => {
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              How to Play Imposter
            </h1>
            <p className="text-xs text-slate-400">
              A beginner-friendly guide to mastering the art of bluffing and deduction.
            </p>
          </div>
        </div>

        {/* Example Walkthrough */}
        <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
            <Lightbulb className="w-4 h-4" />
            <span>Real Game Scenario Example</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-purple-400 font-mono font-bold block mb-1">
                CIVILIAN AGENTS RECEIVE:
              </span>
              <p className="text-lg font-extrabold text-white">"Pizza"</p>
              <p className="text-slate-400 mt-1">Category: Food</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-amber-400 font-mono font-bold block mb-1">
                THE IMPOSTER RECEIVES:
              </span>
              <p className="text-sm font-bold text-amber-200">"A popular Italian food"</p>
              <p className="text-slate-400 mt-1">Category: Food</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-purple-900/40 text-xs text-slate-300 space-y-2">
            <p><strong>Agent 1 says:</strong> "Delivered in a cardboard box." (Good clue! Proves they know it's pizza without giving it away immediately).</p>
            <p><strong>Agent 2 says:</strong> "Sliced into triangles with crust." (Slightly risky, gives clues to the Imposter!).</p>
            <p><strong>The Imposter says:</strong> "Very delicious with herbs." (Suspiciously vague! Could describe any Italian food like pasta or risotto).</p>
          </div>
        </div>

        {/* Tactical Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-purple-400">
              <Check className="w-4 h-4" />
              <span>Civilian Strategy Tips</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              • Don't give super obvious clues right away. If the secret word is "Airplane", don't say "Has wings and flies". Instead say "Requires boarding pass" or "Turbulence in clouds".
            </p>
            <p className="text-slate-300 leading-relaxed">
              • Pay attention to players who hesitate or give generic adjectives like "very nice", "colorful", or "popular".
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 text-amber-400">
              <Eye className="w-4 h-4" />
              <span>Imposter Strategy Tips</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              • Listen intently to the clues given before your turn. Synthesize their keywords with your vague hint.
            </p>
            <p className="text-slate-300 leading-relaxed">
              • Act confident! If someone questions you during discussion, justify your clue with conviction.
            </p>
            <p className="text-slate-300 leading-relaxed">
              • Keep guessing the word in your head so if you get voted out, you can nail the 15-second bonus guess!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
