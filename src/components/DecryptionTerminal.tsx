import React, { useState } from 'react';
import { Terminal, Send, Lock, AlertTriangle, Sparkles, KeyRound } from 'lucide-react';
import { sounds } from '../services/sound.ts';

interface DecryptionTerminalProps {
  decryptionChoices?: string[];
  category: string;
  timeRemaining: number;
  duration: number;
  onSubmitGuess: (guess: string) => void;
}

export const DecryptionTerminal: React.FC<DecryptionTerminalProps> = ({
  decryptionChoices = [],
  category,
  timeRemaining,
  duration,
  onSubmitGuess
}) => {
  const [customGuess, setCustomGuess] = useState('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (wordToSubmit: string) => {
    if (!wordToSubmit.trim() || submitted) return;
    sounds.playVoteCast();
    setSelectedWord(wordToSubmit);
    setSubmitted(true);
    onSubmitGuess(wordToSubmit.trim());
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-slate-950 border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden font-mono text-emerald-400 animate-fade-in">
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-black pointer-events-none" />

      {/* Terminal Title */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-800/60 mb-5">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest uppercase">
            IMPOSTER DECRYPTION OVERRIDE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-500">TIME TO STEAL:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-sm font-bold text-emerald-300 tabular-nums">
            {timeRemaining}s
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-xs">
          <p className="text-emerald-300">
            [STATUS: ELIMINATED BUT ARMED] If you correctly name the secret word in category{' '}
            <strong className="text-white underline">{category}</strong>, your cover is redeemed
            and <strong className="text-emerald-200">IMPOSTERS WIN 250 PTS</strong>!
          </p>
        </div>

        {/* 4 Intercepted Decryption Choices */}
        {decryptionChoices.length > 0 && (
          <div>
            <label className="block text-[11px] text-emerald-400/90 font-bold mb-2 uppercase tracking-wider">
              Intercepted Cipher Candidates:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {decryptionChoices.map((choice, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(choice)}
                  disabled={submitted}
                  className={`p-3 rounded-xl border text-left font-bold text-xs transition-all flex items-center justify-between ${
                    selectedWord === choice
                      ? 'bg-emerald-600 text-slate-950 border-white shadow-lg'
                      : 'bg-slate-900/80 hover:bg-emerald-950/60 border-emerald-800 hover:border-emerald-500 text-emerald-200 hover:text-white'
                  }`}
                >
                  <span>{choice}</span>
                  <KeyRound className="w-3.5 h-3.5 opacity-60" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Input Override */}
        <div className="pt-2">
          <label className="block text-[11px] text-emerald-400/90 font-bold mb-1.5 uppercase tracking-wider">
            Or Type Exact Secret Word:
          </label>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit(customGuess);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customGuess}
              onChange={e => setCustomGuess(e.target.value)}
              disabled={submitted}
              placeholder="Enter secret word..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-emerald-800 text-xs text-white placeholder:text-emerald-800 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              disabled={submitted || !customGuess.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Decipher</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
