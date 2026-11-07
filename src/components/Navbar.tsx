import React from 'react';
import { Volume2, VolumeX, Shield, Trophy, BookOpen, LogOut, Radio, Mic, LogIn, User } from 'lucide-react';
import { sounds } from '../services/sound.ts';
import { UserCareerRecord } from '../services/firebase.ts';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  roomCode?: string;
  onLeaveRoom?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenVoiceModal: () => void;
  onOpenDossierModal?: () => void;
  currentUser: UserCareerRecord | null;
  onGoogleLogin: () => void;
  onGoogleLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  roomCode,
  onLeaveRoom,
  isMuted,
  onToggleMute,
  onOpenVoiceModal,
  onOpenDossierModal,
  currentUser,
  onGoogleLogin,
  onGoogleLogout
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => {
            sounds.playClick();
            if (roomCode) {
              if (window.confirm('Return to home menu? You can rejoin anytime with your room code.')) {
                onNavigate('landing');
              }
            } else {
              onNavigate('landing');
            }
          }}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-wider text-white uppercase font-sans">
            IMPOSTER<span className="text-purple-400">.</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links & Feature Buttons */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
          <button
            onClick={() => { sounds.playClick(); onNavigate('how_to_play'); }}
            className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${currentView === 'how_to_play' ? 'text-purple-400 font-semibold' : ''}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>How to Play</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigate('rules'); }}
            className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${currentView === 'rules' ? 'text-purple-400 font-semibold' : ''}`}
          >
            <Shield className="w-4 h-4" />
            <span>Rules</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigate('leaderboard'); }}
            className={`flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 ${currentView === 'leaderboard' ? 'text-purple-400 font-semibold' : ''}`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>


          {/* Gemini Live API Voice Conversation Action */}
          <button
            onClick={() => { sounds.playClick(); onOpenVoiceModal(); }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 text-cyan-300 hover:text-cyan-200 transition-colors whitespace-nowrap shrink-0 text-xs font-semibold"
            title="Real-time voice conversation with Gemini 3.8 Live API"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Voice</span>
          </button>

          {roomCode && (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-300 font-mono">
              <span className="text-slate-500">ROOM:</span>
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 font-bold tracking-widest">
                {roomCode}
              </span>
            </div>
          )}
        </nav>

        {/* Zone 3: Audio toggle & Auth status / CTA */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-purple-400" />}
          </button>

          <button
            onClick={onOpenVoiceModal}
            title="Live Voice"
            className="md:hidden p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Firebase Google Auth & Dossier */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { sounds.playClick(); onOpenDossierModal?.(); }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-600/60 text-xs transition-colors cursor-pointer group"
                title="View Agent Dossier & Rank"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-5 h-5 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-purple-400" />
                )}
                <span className="font-semibold text-white group-hover:text-purple-300 truncate max-w-[100px]">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800/40">
                  {currentUser.points} pts
                </span>
              </button>
              <button
                onClick={onGoogleLogout}
                title="Sign out of Firebase"
                className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors text-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-colors"
              title="Sign in with Google via Firebase Auth"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In</span>
            </button>
          )}

          {roomCode && (
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
