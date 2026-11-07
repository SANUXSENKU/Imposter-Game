import React, { useState } from 'react';
import { Sparkles, X, ShieldAlert, Bot, Search, RefreshCw } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface InspectorGeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  category: string;
  aiAnalysis?: string | null;
  onInspectClues: () => Promise<void>;
}

export const InspectorGeminiModal: React.FC<InspectorGeminiModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  category,
  aiAnalysis,
  onInspectClues
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleInspect = async () => {
    sounds.playClick();
    setIsLoading(true);
    try {
      await onInspectClues();
      sounds.playBigBrain();
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-slate-950 border border-purple-500/50 rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow corner */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-300 shadow-lg shadow-purple-950/50">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Inspector Gemini</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/60 font-mono">
                  AI Interrogator
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Category Dossier: <span className="text-purple-300 font-semibold">{category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-sm leading-relaxed text-slate-200">
            {aiAnalysis ? (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                  Deduction Report:
                </span>
                <p className="italic text-purple-100 font-sans">{aiAnalysis}</p>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-purple-400/80" />
                <p className="text-xs">
                  Inspector Gemini is ready to interrogate the submitted clues.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-500">
            Room Code: {roomCode}
          </span>
          <button
            onClick={handleInspect}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-purple-600/30 active:scale-95"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Interrogating Clues...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiAnalysis ? 'Re-Analyze Clues' : 'Analyze Clues'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
