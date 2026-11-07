import React, { useState } from 'react';
import {
  Copy,
  Check,
  Crown,
  Play,
  Bot,
  UserPlus,
  Settings,
  Trash2,
  Users,
  CheckCircle2,
  Circle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { PublicGameState, Player, RoomSettings } from '../shared/types.ts';
import { Avatar } from '../components/Avatar.tsx';
import { ChatPanel } from '../components/ChatPanel.tsx';
import { sounds } from '../services/sound.ts';

interface LobbyViewProps {
  gameState: PublicGameState;
  currentPlayer: Player;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  onToggleReady: (isReady: boolean) => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
  onSendMessage: (text: string) => void;
  availableCategories: string[];
  onOpenAiWordPack?: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  currentPlayer,
  onUpdateSettings,
  onToggleReady,
  onAddBot,
  onRemoveBot,
  onStartGame,
  onSendMessage,
  availableCategories,
  onOpenAiWordPack
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const isHost = gameState.hostId === currentPlayer.id;
  const isReady = currentPlayer.isReady;
  const playerCount = gameState.players.length;
  const canStart = playerCount >= 3 && isHost;

  const copyRoomCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(gameState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyRoomLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/?join=${gameState.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCategoryToggle = (cat: string) => {
    sounds.playClick();
    const current = gameState.settings.selectedCategories || [];
    let updated: string[];
    if (current.includes(cat)) {
      updated = current.filter(c => c !== cat);
    } else {
      updated = [...current, cat];
    }
    onUpdateSettings({ selectedCategories: updated });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner: Room Code & Quick Actions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 mb-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-inner">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">
              <span>Security Clearance: Private Room</span>
              <span aria-hidden="true">·</span>
              <span className="text-purple-400 font-bold">{playerCount} / {gameState.settings.maxPlayers} Operatives</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-widest font-mono text-white">
                {gameState.roomCode}
              </span>
              <button
                onClick={copyRoomCode}
                title="Copy Room Code"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          <button
            onClick={copyRoomLink}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          {isHost && (
            <button
              onClick={() => { sounds.playClick(); onAddBot(); }}
              title="Add an AI Bot for testing"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Add Test Bot</span>
            </button>
          )}

          {isHost ? (
            <button
              onClick={() => { sounds.playClick(); onStartGame(); }}
              disabled={!canStart}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Match ({playerCount}/3 min)</span>
            </button>
          ) : (
            <button
              onClick={() => { sounds.playClick(); onToggleReady(!isReady); }}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
              }`}
            >
              {isReady ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              <span>{isReady ? 'Ready for Mission' : 'Mark as Ready'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left is Roster & Settings, Right is Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Operative Roster & Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* Player Roster Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Operatives in Lobby</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                  {playerCount}
                </span>
              </h3>
              {playerCount < 3 && (
                <span className="text-xs text-amber-400 font-mono animate-pulse">
                  Need at least 3 players to start
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gameState.players.map(p => {
                const isCurrentMe = p.id === currentPlayer.id;
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrentMe
                        ? 'bg-purple-950/40 border-purple-600/60 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar avatarId={p.avatarId} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">
                            {p.displayName}
                          </span>
                          {p.isHost && (
                            <span title="Host">
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            </span>
                          )}
                          {p.isBot && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono shrink-0">
                              BOT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {p.score} pts · {p.isHost ? 'Mission Commander' : (p.isReady ? 'Ready' : 'Waiting')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.isReady ? (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Ready</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Circle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Wait</span>
                        </span>
                      )}

                      {isHost && p.isBot && (
                        <button
                          onClick={() => { sounds.playClick(); onRemoveBot(p.id); }}
                          title="Remove Bot"
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Host Settings Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Game Configuration
                </h3>
              </div>
              {!isHost && (
                <span className="text-xs text-slate-500 font-mono">Host Controlled</span>
              )}
            </div>

            <div className="space-y-5 text-xs">
              {/* Category selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-slate-300 font-semibold">
                    Word Categories ({gameState.settings.selectedCategories.length === 0 ? 'All Categories Included' : `${gameState.settings.selectedCategories.length} selected`})
                  </label>
                  {isHost && onOpenAiWordPack && (
                    <button
                      type="button"
                      onClick={() => { sounds.playClick(); onOpenAiWordPack(); }}
                      className="px-2.5 py-1 rounded-lg bg-purple-950/80 hover:bg-purple-900 border border-purple-600/60 text-purple-300 hover:text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1 transition-colors"
                      title="Generate custom category with Gemini"
                    >
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>AI Word Pack</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(availableCategories.length > 0 ? availableCategories : [
                    'Food', 'Animals', 'Movies', 'Sports', 'Technology', 'Places', 'Everyday objects', 'Nature', 'Professions', 'Games'
                  ]).map(cat => {
                    const isSelected = gameState.settings.selectedCategories.length === 0 || gameState.settings.selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={!isHost}
                        onClick={() => handleCategoryToggle(cat)}
                        className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-950/80 border border-purple-500/80 text-purple-200 shadow-sm'
                            : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid of timers and parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Imposters count */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Number of Imposters
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2].map(count => (
                      <button
                        key={count}
                        type="button"
                        disabled={!isHost || (count === 2 && playerCount < 5)}
                        onClick={() => { sounds.playClick(); onUpdateSettings({ imposterCount: count }); }}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          gameState.settings.imposterCount === count
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {count} Imposter{count > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                  {playerCount < 5 && (
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                      * 2 Imposters requires 5+ players
                    </span>
                  )}
                </div>

                {/* Total Rounds */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Match Rounds
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 3, 5].map(r => (
                      <button
                        key={r}
                        type="button"
                        disabled={!isHost}
                        onClick={() => { sounds.playClick(); onUpdateSettings({ totalRounds: r }); }}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          gameState.settings.totalRounds === r
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {r} Round{r > 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clue Timer */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Clue Turn Timer
                  </label>
                  <div className="flex items-center gap-2">
                    {[20, 30, 45].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        disabled={!isHost}
                        onClick={() => { sounds.playClick(); onUpdateSettings({ clueTimerSec: sec }); }}
                        className={`flex-1 py-2 rounded-xl font-mono font-bold transition-all ${
                          gameState.settings.clueTimerSec === sec
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discussion Timer */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Discussion Timer
                  </label>
                  <div className="flex items-center gap-2">
                    {[30, 45, 60].map(sec => (
                      <button
                        key={sec}
                        type="button"
                        disabled={!isHost}
                        onClick={() => { sounds.playClick(); onUpdateSettings({ discussionTimerSec: sec }); }}
                        className={`flex-1 py-2 rounded-xl font-mono font-bold transition-all ${
                          gameState.settings.discussionTimerSec === sec
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Imposter final guess option */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <div>
                  <span className="font-semibold text-slate-300 block">
                    Allow Imposter Last-Chance Guess
                  </span>
                  <span className="text-[11px] text-slate-500">
                    If caught, the Imposter can steal the win by guessing the secret word within 15s.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!isHost}
                  onClick={() => {
                    sounds.playClick();
                    onUpdateSettings({ allowImposterGuess: !gameState.settings.allowImposterGuess });
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    gameState.settings.allowImposterGuess ? 'bg-purple-600' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      gameState.settings.allowImposterGuess ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): In-room Chat / Discussion Feed */}
        <div className="lg:col-span-5">
          <ChatPanel
            messages={[]}
            currentUserId={currentPlayer.id}
            onSendMessage={onSendMessage}
            isCompact={false}
          />
        </div>
      </div>
    </div>
  );
};
