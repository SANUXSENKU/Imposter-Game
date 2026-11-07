import React, { useState } from 'react';
import { Sparkles, X, Plus, Check, Loader2, BookOpen, Layers } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface AiWordPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPackGenerated: (category: string) => void;
}

const PRESET_PACKS = [
  'Cyberpunk & Sci-Fi Tech',
  'Anime & Legendary Gaming',
  '90s Nostalgia Pop Culture',
  'Fast Food & Street Eats',
  'Secret Agents & Heists',
  'Mythology & Fantasy Lore'
];

export const AiWordPackModal: React.FC<AiWordPackModalProps> = ({
  isOpen,
  onClose,
  onPackGenerated
}) => {
  const [themeInput, setThemeInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    category: string;
    words: { word: string; hints: string[] }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (themeToUse?: string) => {
    const prompt = themeToUse || themeInput;
    if (!prompt.trim()) return;

    sounds.playClick();
    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedResult(null);

    try {
      const res = await fetch('/api/ai/generate-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePrompt: prompt.trim() })
      });
      const data = await res.json();
      if (data.success && data.category) {
        setGeneratedResult({
          category: data.category,
          words: data.words || []
        });
        sounds.playVictory();
        onPackGenerated(data.category);
      } else {
        setErrorMsg(data.error || 'Failed to generate word pack');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error generating word pack');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-purple-500/50 rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Generate AI Word Pack
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by Gemini · Creates 8 words with clever hints
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input & Presets */}
        <div className="py-5 space-y-4">
          <div>
            <label className="block text-xs font-mono text-purple-300 font-bold mb-1.5 uppercase">
              Choose or Enter Theme
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={themeInput}
                onChange={e => setThemeInput(e.target.value)}
                placeholder="e.g. Marvel Superheroes, Hogwarts, Fast Food..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => handleGenerate()}
                disabled={isLoading || !themeInput.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all shrink-0"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generate</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Popular Spy Themes:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PACKS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setThemeInput(preset);
                    handleGenerate(preset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-purple-900/40 border border-slate-800 hover:border-purple-600/50 text-[11px] text-slate-300 hover:text-white transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Result view */}
          {generatedResult && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-200">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Category Created: {generatedResult.category}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Ready in Lobby
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {generatedResult.words.map((w, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-900 text-[11px] font-mono text-purple-300 border border-purple-900"
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
