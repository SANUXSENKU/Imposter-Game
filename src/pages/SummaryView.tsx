import React, { useEffect } from 'react';
import { Trophy, Play, RotateCcw, Home, Award, Medal, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublicGameState, Player } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { sounds } from '../services/sound.ts';

interface SummaryViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  onNextRound: () => void;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  gameState,
  currentPlayer,
  onNextRound,
  onRematch,
  onReturnToLobby
}) => {
  const isHost = gameState.hostId === currentPlayer.id;
  const isMatchOver = gameState.phase === 'MATCH_OVER' || gameState.currentRound >= gameState.totalRounds;

  // Sort players by total score
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);
  const champion = sortedPlayers[0];

  useEffect(() => {
    if (isMatchOver) {
      sounds.playVictory();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [isMatchOver]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <Trophy className="w-7 h-7" />
        </div>

        <span className="text-xs font-mono uppercase text-purple-400 font-bold tracking-widest block mb-1">
          {isMatchOver ? 'Tournament Final Standings' : `Match Standing · Round ${gameState.currentRound} / ${gameState.totalRounds}`}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white">
          {isMatchOver ? 'Match Concluded!' : 'Round Summary'}
        </h1>

        {isMatchOver && champion && (
          <p className="text-sm text-slate-300 mt-2">
            Grand Champion: <strong className="text-amber-400">{champion.displayName}</strong> with {champion.score} total points!
          </p>
        )}
      </div>

      {/* Leaderboard Roster */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>In-Room Scoreboard</span>
          <span className="text-xs font-mono text-slate-500">
            Total Points Accumulated
          </span>
        </h3>

        <div className="space-y-3">
          {sortedPlayers.map((player, idx) => {
            const isMe = player.id === currentPlayer.id;
            const isFirst = idx === 0;

            return (
              <div
                key={player.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isFirst
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                    : isMe
                    ? 'bg-purple-950/30 border-purple-800/60'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 text-center font-mono font-bold">
                    {idx === 0 ? (
                      <Crown className="w-5 h-5 text-amber-400 mx-auto" />
                    ) : idx === 1 ? (
                      <Medal className="w-5 h-5 text-slate-300 mx-auto" />
                    ) : idx === 2 ? (
                      <Medal className="w-5 h-5 text-amber-600 mx-auto" />
                    ) : (
                      <span className="text-xs text-slate-500">#{idx + 1}</span>
                    )}
                  </div>

                  <Avatar avatarId={player.avatarId} size="md" />

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                      <span>{player.displayName}</span>
                      {isMe && <span className="text-purple-400 text-xs font-mono">(You)</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {player.isHost ? 'Room Commander' : 'Operative'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tabular-nums">
                    {player.score}
                  </span>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">
                    Points
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => { sounds.playClick(); onReturnToLobby(); }}
          className="px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Exit to Main Menu</span>
        </button>

        {isHost ? (
          isMatchOver ? (
            <button
              onClick={() => { sounds.playClick(); onRematch(); }}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Rematch in Same Room</span>
            </button>
          ) : (
            <button
              onClick={() => { sounds.playClick(); onNextRound(); }}
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Round {gameState.currentRound + 1} of {gameState.totalRounds}</span>
            </button>
          )
        ) : (
          <div className="text-xs text-slate-400 font-mono italic">
            Waiting for mission host to continue...
          </div>
        )}
      </div>
    </div>
  );
};
