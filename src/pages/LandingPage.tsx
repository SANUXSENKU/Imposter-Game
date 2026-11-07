import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Eye,
  KeyRound,
  Play,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Trophy,
  CheckCircle2,
  Dice5,
  Radio,
  Lock,
  Zap,
  Mic
} from 'lucide-react';
import { Avatar, AVATAR_OPTIONS } from '../components/Avatar.tsx';
import { LeaderboardEntry } from '../shared/types.ts';
import { sounds } from '../services/sound.ts';

interface LandingPageProps {
  onCreateRoom: (name: string, avatarId: string) => void;
  onJoinRoom: (code: string, name: string, avatarId: string) => void;
  onViewLeaderboard: () => void;
  onViewRules: () => void;
  onViewHowToPlay: () => void;
  onOpenVoiceModal?: () => void;
}

const AGENT_CODENAMES = [
  'Viper', 'Ghost', 'Cipher', 'Shadow', 'Apex', 'Falcon', 'Spectre', 'Echo', 'Neon', 'Sable', 'Onyx', 'Mirage'
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateRoom,
  onJoinRoom,
  onViewLeaderboard,
  onViewRules,
  onViewHowToPlay,
  onOpenVoiceModal
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [displayName, setDisplayName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(AVATAR_OPTIONS[0].id);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingScores, setIsLoadingScores] = useState(false);

  // Initialize random default name if empty
  useEffect(() => {
    const savedName = localStorage.getItem('imposter_player_name');
    const savedAvatar = localStorage.getItem('imposter_player_avatar');
    if (savedName) {
      setDisplayName(savedName);
    } else {
      const randCodename = AGENT_CODENAMES[Math.floor(Math.random() * AGENT_CODENAMES.length)];
      setDisplayName(`Agent ${randCodename}`);
    }
    if (savedAvatar) {
      setSelectedAvatarId(savedAvatar);
    }

    // Fetch top 5 players for preview
    setIsLoadingScores(true);
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLeaderboard(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setIsLoadingScores(false));
  }, []);

  const randomizeName = () => {
    sounds.playClick();
    const rand = AGENT_CODENAMES[Math.floor(Math.random() * AGENT_CODENAMES.length)];
    const num = Math.floor(Math.random() * 90) + 10;
    setDisplayName(`Agent ${rand}_${num}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    sounds.playClick();
    localStorage.setItem('imposter_player_name', displayName.trim());
    localStorage.setItem('imposter_player_avatar', selectedAvatarId);
    onCreateRoom(displayName.trim(), selectedAvatarId);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !roomCode.trim()) return;
    sounds.playClick();
    localStorage.setItem('imposter_player_name', displayName.trim());
    localStorage.setItem('imposter_player_avatar', selectedAvatarId);
    onJoinRoom(roomCode.trim().toUpperCase(), displayName.trim(), selectedAvatarId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-slate-800/80">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Game Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Next-Gen Multiplayer Social Deduction</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] text-balance">
                One word. <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">One liar.</span> <br className="hidden sm:inline" />
                Who can you trust?
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Everyone gets the secret word—except the Imposter, who only receives a vague hint. Give subtle clues, interrogate suspicious alibis, and vote to eliminate the liar before they steal victory.
              </p>

              {/* Quick stats pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 pt-2 font-mono">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-4 h-4 text-purple-400" /> 3–12 Players
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Radio className="w-4 h-4 text-cyan-400" /> Real-Time WebSockets
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400" /> 200+ Handcrafted Words
                </span>
              </div>

              {/* AI Features Bar */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                {onOpenVoiceModal && (
                  <button
                    onClick={() => { sounds.playClick(); onOpenVoiceModal(); }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-700/60 text-cyan-200 text-xs font-semibold shadow-md shadow-cyan-950/40 transition-all hover:scale-105"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Gemini 3.8 Live Voice Chat</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Hero Art Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-900/30 group">
                <img
                  src="/src/assets/images/hero_imposter_banner_1793283792721.jpg"
                  alt="Imposter game room in action"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold text-white">Live Match Protocol</span>
                  </div>
                  <span className="font-mono text-purple-400">Zero AI Slop · True Deductions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Play Hub Section */}
      <section id="play-section" className="py-12 md:py-16 bg-slate-950/60 relative">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/30">
            {/* Tab switchers */}
            <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab('create'); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'create'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Room (Host)
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveTab('join'); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'join'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Join Room
              </button>
            </div>

            {/* Profile setup: Name & Avatar */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Display Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Enter your operative name..."
                    maxLength={20}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={randomizeName}
                    title="Generate Random Codename"
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors shrink-0"
                  >
                    <Dice5 className="w-5 h-5 text-purple-400" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Operative Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATAR_OPTIONS.map(avatar => {
                    const isSelected = selectedAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => { sounds.playClick(); setSelectedAvatarId(avatar.id); }}
                        className={`p-1 rounded-xl transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-purple-950/80 border-2 border-purple-500 scale-105'
                            : 'border border-transparent hover:border-slate-700'
                        }`}
                      >
                        <Avatar avatarId={avatar.id} size="sm" />
                        <span className="text-[10px] text-slate-400 truncate max-w-full">
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tab Form: Create Room */}
            {activeTab === 'create' ? (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200/90 leading-relaxed">
                  As the room host, you can configure turn timers, select word categories, enable AI practice bots, and invite friends via a private code.
                </div>

                <button
                  type="submit"
                  disabled={!displayName.trim()}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Private Room</span>
                </button>
              </form>
            ) : (
              /* Tab Form: Join Room */
              <form onSubmit={handleJoinSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Enter 5-Letter Room Code
                  </label>
                  <div className="relative">
                    <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={roomCode}
                      onChange={e => setRoomCode(e.target.value.toUpperCase())}
                      placeholder="e.g. 8XYZ9"
                      maxLength={8}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-base font-mono tracking-widest uppercase text-purple-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!displayName.trim() || !roomCode.trim()}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Join Room</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* How to Play 3-Step Section */}
      <section className="py-16 md:py-20 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              How the Game Works
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Fast, intense rounds of verbal deception and sharp deduction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400 font-extrabold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Secret Assignment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Regular players receive the exact secret word (e.g. <span className="text-purple-300 font-semibold">Pizza</span>). The Imposter receives only a vague hint (e.g. <span className="text-amber-300 font-semibold">Popular Italian food</span>).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-cyan-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 font-extrabold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Take Turns Giving Clues</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each player provides one short clue. Civilians must prove they know the word without giving it away to the Imposter, while the Imposter must bluff convincing clues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative group hover:border-fuchsia-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-950/80 border border-fuchsia-800/80 flex items-center justify-center text-fuchsia-400 font-extrabold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Discuss & Vote</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Debate suspicious clues in the discussion phase, then vote to eliminate the suspected Imposter. If caught, the Imposter can attempt a last-second secret word guess!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview Strip */}
      <section className="py-12 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Top Ranked Operatives</span>
              </h3>
              <p className="text-xs text-slate-400">
                Persistent scoring synced directly to the local SQLite database.
              </p>
            </div>
            <button
              onClick={onViewLeaderboard}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
            >
              <span>View Full Leaderboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {leaderboard.length === 0 ? (
              <div className="col-span-full py-8 text-center text-xs text-slate-500 italic">
                {isLoadingScores ? 'Loading hall of fame...' : 'No recorded scores yet. Host the first match to claim rank #1!'}
              </div>
            ) : (
              leaderboard.map((entry, idx) => (
                <div
                  key={entry.playerId}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3"
                >
                  <span className="text-xs font-mono font-bold text-slate-500 w-5">
                    #{idx + 1}
                  </span>
                  <Avatar avatarId={entry.avatarId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {entry.displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {entry.points} pts · {entry.totalWins}W / {entry.totalLosses}L
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-300 font-bold">IMPOSTER</span>
            <span>—</span>
            <span>Real-Time Social Deduction Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onViewHowToPlay} className="hover:text-slate-300 transition-colors">
              How to Play
            </button>
            <button onClick={onViewRules} className="hover:text-slate-300 transition-colors">
              Rules
            </button>
            <button onClick={onViewLeaderboard} className="hover:text-slate-300 transition-colors">
              Leaderboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
