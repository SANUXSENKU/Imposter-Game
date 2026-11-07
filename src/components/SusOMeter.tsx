import React from 'react';
import { ShieldAlert, ShieldCheck, HelpCircle, Flame, Eye, Sparkles } from 'lucide-react';
import { PublicPlayerInfo } from '../shared/types.ts';
import { Avatar } from './Avatar.tsx';
import { sounds } from '../services/sound.ts';

interface SusOMeterProps {
  players: PublicPlayerInfo[];
  currentPlayerId: string;
  suspectRatings?: Record<string, { sus: number; trust: number }>;
  onRatePlayer: (targetId: string, rating: 'SUSPECT' | 'TRUSTED') => void;
  myVotes?: Record<string, 'SUSPECT' | 'TRUSTED'>;
}

export const SusOMeter: React.FC<SusOMeterProps> = ({
  players,
  currentPlayerId,
  suspectRatings = {},
  onRatePlayer,
  myVotes = {}
}) => {
  // Compute rankings
  const ranked = [...players].map(p => {
    const data = suspectRatings[p.id] || { sus: 0, trust: 0 };
    const total = data.sus + data.trust;
    const susPercent = total > 0 ? Math.round((data.sus / total) * 100) : 0;
    return {
      player: p,
      sus: data.sus,
      trust: data.trust,
      total,
      susPercent
    };
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-950 border border-red-800/80 flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Sus-O-Meter · Heatmap
            </h4>
            <p className="text-[10px] text-slate-400">
              Live room suspicion ratings. Flag clues as Suspicious or Trusted.
            </p>
          </div>
        </div>
      </div>

      {/* Player Suspect Bars */}
      <div className="space-y-2">
        {ranked.map(({ player, sus, trust, susPercent }) => {
          const isSelf = player.id === currentPlayerId;
          const isTopSuspect = sus > 0 && sus >= Math.max(...ranked.map(r => r.sus));
          const currentVote = myVotes[player.id];

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border transition-all ${
                isTopSuspect
                  ? 'bg-red-950/20 border-red-500/40 shadow-xs shadow-red-950/50'
                  : 'bg-slate-950/60 border-slate-800/70'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar avatarId={player.avatarId} size="sm" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {player.displayName}
                    {isSelf && <span className="ml-1 text-[10px] text-slate-500 font-mono">(You)</span>}
                  </span>
                  {isTopSuspect && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-900/60 text-red-300 border border-red-700/50 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-red-400" />
                      SUSPECT
                    </span>
                  )}
                </div>

                {/* Rating Controls (Only for other players) */}
                {!isSelf ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRatePlayer(player.id, 'SUSPECT');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                        currentVote === 'SUSPECT'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-red-950/60 border border-slate-800 hover:border-red-600/50 text-slate-400 hover:text-red-300'
                      }`}
                      title="Flag as Suspicious"
                    >
                      <span>🕵️</span>
                      <span>Sus ({sus})</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onRatePlayer(player.id, 'TRUSTED');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 ${
                        currentVote === 'TRUSTED'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600/50 text-slate-400 hover:text-emerald-300'
                      }`}
                      title="Flag as Trusted Civilian"
                    >
                      <span>🛡️</span>
                      <span>Trust ({trust})</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] font-mono text-slate-400">
                    {sus} Sus / {trust} Trust
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-red-500 h-full transition-all duration-300"
                  style={{ width: `${susPercent}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${100 - susPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
