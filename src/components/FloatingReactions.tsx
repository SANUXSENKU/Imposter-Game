import React, { useState, useEffect } from 'react';
import { Flame, ShieldAlert, Sparkles, SmilePlus, Zap } from 'lucide-react';
import { ReactionEvent } from '../shared/types.ts';
import { sounds } from '../services/sound.ts';

interface FloatingReactionsProps {
  onSendReaction: (emoji: string, label: string) => void;
  recentReactions?: ReactionEvent[];
}

const REACTION_PRESETS = [
  { emoji: '🚨', label: 'LIAR!', sound: 'alarm' },
  { emoji: '🕵️', label: 'SUS', sound: 'suspect' },
  { emoji: '🧠', label: '200 IQ', sound: 'bigbrain' },
  { emoji: '🔥', label: 'FIRE CLUE', sound: 'click' },
  { emoji: '🤫', label: 'SHHH', sound: 'click' },
  { emoji: '😱', label: 'EXPOSED', sound: 'alarm' },
  { emoji: '🤡', label: 'CLOWN', sound: 'clown' },
  { emoji: '👀', label: 'SIDE EYE', sound: 'suspect' }
];

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({
  onSendReaction,
  recentReactions = []
}) => {
  const [activeParticles, setActiveParticles] = useState<
    Array<{ id: string; emoji: string; label: string; sender: string; left: number }>
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  // When new reaction arrives from socket
  useEffect(() => {
    if (recentReactions.length === 0) return;
    const latest = recentReactions[recentReactions.length - 1];
    if (!latest) return;

    // Check if we already displayed this particle
    const exists = activeParticles.some(p => p.id === latest.id);
    if (!exists) {
      const leftPercent = 15 + Math.random() * 70;
      setActiveParticles(prev => [
        ...prev.slice(-10),
        {
          id: latest.id,
          emoji: latest.emoji,
          label: latest.label,
          sender: latest.senderName,
          left: leftPercent
        }
      ]);

      // Sound trigger
      if (latest.emoji === '🚨') sounds.playAlarm();
      else if (latest.emoji === '🕵️') sounds.playSuspect();
      else if (latest.emoji === '🧠') sounds.playBigBrain();
      else if (latest.emoji === '🤡') sounds.playClown();
      else sounds.playClick();

      // Remove after animation completes
      setTimeout(() => {
        setActiveParticles(prev => prev.filter(p => p.id !== latest.id));
      }, 2500);
    }
  }, [recentReactions]);

  const handleSend = (preset: typeof REACTION_PRESETS[0]) => {
    sounds.playClick();
    onSendReaction(preset.emoji, preset.label);
  };

  return (
    <>
      {/* Floating Animated Reaction Particles Container */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute bottom-16 flex flex-col items-center animate-bounce-up"
            style={{ left: `${particle.left}%` }}
          >
            <span className="text-4xl filter drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
              {particle.emoji}
            </span>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/80 border border-purple-500/50 backdrop-blur-md text-[10px] font-mono text-purple-300 font-bold whitespace-nowrap shadow-lg">
              <span className="text-white font-medium">{particle.sender}:</span> {particle.label}
            </div>
          </div>
        ))}
      </div>

      {/* Emote Soundboard Trigger / Bar */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {isOpen && (
          <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-slate-950/90 border border-purple-500/40 shadow-2xl backdrop-blur-xl animate-fade-in">
            {REACTION_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-purple-900/50 border border-slate-800 hover:border-purple-500/60 transition-all hover:scale-110 active:scale-95 text-lg flex flex-col items-center group"
                title={p.label}
              >
                <span>{p.emoji}</span>
                <span className="text-[8px] font-mono font-bold text-slate-400 group-hover:text-purple-300 uppercase tracking-tighter">
                  {p.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            sounds.playClick();
            setIsOpen(!isOpen);
          }}
          className={`p-3 rounded-full border shadow-lg transition-all ${
            isOpen
              ? 'bg-purple-600 text-white border-purple-400 rotate-12 scale-105'
              : 'bg-slate-900/90 text-purple-400 border-slate-800 hover:border-purple-500/60 hover:text-white'
          }`}
          title={isOpen ? 'Close Reaction Emotes' : 'React with Live Sound Emotes'}
        >
          <SmilePlus className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
