import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, RefreshCw, Medal, Crown, Star } from 'lucide-react';
import { LeaderboardEntry } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { sounds } from '../services/sound.ts';

interface LeaderboardViewProps {
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScores = () => {
    setIsLoading(true);
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Game</span>
        </button>

        <button
          onClick={() => { sounds.playClick(); fetchScores(); }}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Scores</span>
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">
              Global Operative Hall of Fame
            </h1>
            <p className="text-xs text-slate-400">
              Rankings stored in SQLite database. Points earned from civilian & imposter victories.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-mono">
            Fetching operative telemetry...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 italic">
            No games recorded in the database yet. Launch a room and play a match to establish the first leaderboard record!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-mono uppercase text-[11px]">
                  <th className="py-3 px-3">Rank</th>
                  <th className="py-3 px-3">Operative</th>
                  <th className="py-3 px-3 text-right">Points</th>
                  <th className="py-3 px-3 text-right">Win Rate</th>
                  <th className="py-3 px-3 text-right">W / L</th>
                  <th className="py-3 px-3 text-right">Imposter Wins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {entries.map((entry, idx) => (
                  <tr key={entry.playerId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-400">
                      {idx === 0 ? (
                        <Crown className="w-4 h-4 text-amber-400" />
                      ) : idx === 1 ? (
                        <Medal className="w-4 h-4 text-slate-300" />
                      ) : idx === 2 ? (
                        <Medal className="w-4 h-4 text-amber-600" />
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar avatarId={entry.avatarId} size="sm" />
                        <span className="font-bold text-white truncate max-w-[150px]">
                          {entry.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-purple-300 tabular-nums">
                      {entry.points}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 tabular-nums">
                      {entry.winRate}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300 tabular-nums">
                      {entry.totalWins}W / {entry.totalLosses}L
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-400 tabular-nums">
                      {entry.imposterWins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
