import React, { useState } from 'react';
import { Shield, Trophy, Award, Medal, User, X, Check, Star, Zap } from 'lucide-react';
import { Avatar, AVATAR_OPTIONS } from './Avatar.tsx';
import { UserCareerRecord } from '../services/firebase.ts';
import { sounds } from '../services/sound.ts';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRecord: UserCareerRecord | null;
  onUpdateAvatar: (avatarId: string) => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({
  isOpen,
  onClose,
  userRecord,
  onUpdateAvatar
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(userRecord?.avatarId || 'avatar-1');

  if (!isOpen) return null;

  const points = userRecord?.points || 0;
  const totalGames = userRecord?.totalGames || 0;
  const totalWins = userRecord?.totalWins || 0;
  const imposterWins = userRecord?.imposterWins || 0;
  const civilianWins = userRecord?.civilianWins || 0;

  // Compute Rank
  let rankName = 'Undercover Cadet';
  let rankTier = 1;
  let nextRankPoints = 200;
  if (points >= 2000) {
    rankName = 'Director of Intelligence';
    rankTier = 5;
    nextRankPoints = 5000;
  } else if (points >= 1000) {
    rankName = 'Master Detective';
    rankTier = 4;
    nextRankPoints = 2000;
  } else if (points >= 500) {
    rankName = 'Counter-Intel Agent';
    rankTier = 3;
    nextRankPoints = 1000;
  } else if (points >= 200) {
    rankName = 'Field Operative';
    rankTier = 2;
    nextRankPoints = 500;
  }

  const progressPercent = Math.min(100, Math.round((points / nextRankPoints) * 100));

  const achievements = [
    {
      title: 'First Assignment',
      desc: 'Complete your first game',
      unlocked: totalGames >= 1,
      icon: '🎯'
    },
    {
      title: 'Ghost in the Shadows',
      desc: 'Win as an Imposter without being caught',
      unlocked: imposterWins >= 1,
      icon: '🕵️'
    },
    {
      title: 'Civilian Vanguard',
      desc: 'Win 3 rounds as Civilian',
      unlocked: civilianWins >= 3,
      icon: '🛡️'
    },
    {
      title: 'Master Sleuth',
      desc: 'Reach 500+ career points',
      unlocked: points >= 500,
      icon: '⚡'
    }
  ];

  const handleSelectAvatar = (id: string) => {
    sounds.playClick();
    setSelectedAvatar(id);
    onUpdateAvatar(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in font-sans">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-purple-500/50 rounded-2xl shadow-2xl p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-900/60 border border-purple-500/60 flex items-center justify-center text-purple-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                Agent Dossier &amp; Rank
              </h3>
              <p className="text-[11px] text-slate-400">
                Encrypted Career Credentials · Synchronized via Firestore
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

        {/* Profile Identity Row */}
        <div className="py-5 space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <Avatar avatarId={selectedAvatar} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white truncate">
                  {userRecord?.displayName || 'Undercover Agent'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                  Tier {rankTier}
                </span>
              </div>
              <p className="text-xs text-purple-400 font-semibold">{rankName}</p>

              {/* Progress to next rank */}
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Progress to Next Rank</span>
                  <span className="text-purple-300 font-bold">{points} / {nextRankPoints} pts</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-purple-500 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Games</span>
              <span className="text-lg font-extrabold text-white">{totalGames}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Victories</span>
              <span className="text-lg font-extrabold text-emerald-400">{totalWins}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Imposter Wins</span>
              <span className="text-lg font-extrabold text-red-400">{imposterWins}</span>
            </div>
          </div>

          {/* Unlockable Badges */}
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Service Badges:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    ach.unlocked
                      ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                      : 'bg-slate-900/40 border-slate-800/60 opacity-40 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{ach.icon}</span>
                    <span className="text-xs font-bold">{ach.title}</span>
                  </div>
                  <p className="text-[10px] leading-tight">{ach.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Avatar selector */}
          <div>
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Switch Undercover Avatar:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {AVATAR_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectAvatar(opt.id)}
                  className={`p-1 rounded-xl border shrink-0 transition-all ${
                    selectedAvatar === opt.id
                      ? 'border-purple-500 bg-purple-950/80 ring-2 ring-purple-500/40'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900'
                  }`}
                >
                  <Avatar avatarId={opt.id} size="sm" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors"
          >
            Confirm Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
