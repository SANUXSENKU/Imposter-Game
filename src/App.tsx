import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { LobbyView } from './pages/LobbyView.tsx';
import { AssignmentView } from './pages/AssignmentView.tsx';
import { ClueView } from './pages/ClueView.tsx';
import { DiscussionView } from './pages/DiscussionView.tsx';
import { VotingView } from './pages/VotingView.tsx';
import { RevealView } from './pages/RevealView.tsx';
import { SummaryView } from './pages/SummaryView.tsx';
import { RulesView } from './pages/RulesView.tsx';
import { HowToPlayView } from './pages/HowToPlayView.tsx';
import { LeaderboardView } from './pages/LeaderboardView.tsx';

import { LiveVoiceModal } from './components/LiveVoiceModal.tsx';
import { FloatingReactions } from './components/FloatingReactions.tsx';
import { InspectorGeminiModal } from './components/InspectorGeminiModal.tsx';
import { AiWordPackModal } from './components/AiWordPackModal.tsx';
import { DossierModal } from './components/DossierModal.tsx';

import { getSocket } from './services/socket.ts';
import { sounds } from './services/sound.ts';
import {
  PublicGameState,
  PrivateAssignment,
  ChatMessage,
  Player,
  RoomSettings,
  ReactionEvent
} from './shared/types.ts';
import {
  auth,
  loginWithGoogle,
  logoutUser,
  onAuthStateChanged,
  syncUserProfile,
  recordMatchVictoryInFirestore,
  UserCareerRecord
} from './services/firebase.ts';

export default function App() {
  // Navigation & View
  const [currentView, setCurrentView] = useState<string>('landing');
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // Authoritative State from Server
  const [gameState, setGameState] = useState<PublicGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [assignment, setAssignment] = useState<PrivateAssignment | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Sound & Modals
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isAiPackModalOpen, setIsAiPackModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Firebase User
  const [currentUser, setCurrentUser] = useState<UserCareerRecord | null>(null);

  // Local tracking of Sus-O-Meter ratings
  const [mySuspectVotes, setMySuspectVotes] = useState<Record<string, 'SUSPECT' | 'TRUSTED'>>({});

  // Socket instance
  const socket = getSocket();

  // Load available categories
  const fetchCategories = useCallback(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(cats => {
        if (Array.isArray(cats)) setAvailableCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auth observer
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await syncUserProfile(fbUser);
          setCurrentUser(profile);
        } catch (err) {
          console.warn('Could not sync user profile', err);
        }
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsub();
  }, []);

  // Show Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Socket event listeners
  useEffect(() => {
    socket.on('room:joined', (data: { roomCode: string; player: Player; state: PublicGameState }) => {
      setRoomCode(data.roomCode);
      setCurrentPlayer(data.player);
      setGameState(data.state);
      setCurrentView('game');
      sounds.playJoin();
    });

    socket.on('game:state', (newState: PublicGameState) => {
      setGameState(newState);
    });

    socket.on('assignment:private', (newAssignment: PrivateAssignment) => {
      setAssignment(newAssignment);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-99), msg]);
    });

    socket.on('error:toast', (data: { message: string }) => {
      showToast(data.message);
    });

    return () => {
      socket.off('room:joined');
      socket.off('game:state');
      socket.off('assignment:private');
      socket.off('chat:message');
      socket.off('error:toast');
    };
  }, [socket]);

  // Record stats to Firestore when round concludes
  useEffect(() => {
    if (gameState?.lastRoundResult && currentPlayer && currentUser) {
      const res = gameState.lastRoundResult;
      const isImposter = assignment?.role === 'IMPOSTER';
      const won = (res.winnerTeam === 'CIVILIANS' && !isImposter) || (res.winnerTeam === 'IMPOSTERS' && isImposter);
      const pointsDelta = res.pointsDeltas[currentPlayer.id] || 0;

      recordMatchVictoryInFirestore(currentUser.id, {
        won,
        isImposter,
        pointsDelta
      }).then(() => {
        // Refresh local points
        setCurrentUser(prev => prev ? {
          ...prev,
          totalGames: prev.totalGames + 1,
          totalWins: prev.totalWins + (won ? 1 : 0),
          points: Math.max(0, prev.points + pointsDelta)
        } : null);
      }).catch(() => {});
    }
  }, [gameState?.lastRoundResult]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  // Google Login / Logout
  const handleGoogleLogin = async () => {
    sounds.playClick();
    try {
      const profile = await loginWithGoogle();
      if (profile) setCurrentUser(profile);
    } catch {
      showToast('Google Sign-in was cancelled or closed.');
    }
  };

  const handleGoogleLogout = async () => {
    sounds.playClick();
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch {
      // ignore
    }
  };

  // Room Actions
  const handleCreateRoom = (displayName: string, avatarId: string) => {
    socket.emit('room:create', { displayName, avatarId });
  };

  const handleJoinRoom = (code: string, displayName: string, avatarId: string) => {
    socket.emit('room:join', { roomCode: code, displayName, avatarId });
  };

  const handleLeaveRoom = () => {
    sounds.playClick();
    socket.disconnect();
    socket.connect();
    setRoomCode(null);
    setGameState(null);
    setCurrentPlayer(null);
    setAssignment(null);
    setChatMessages([]);
    setMySuspectVotes({});
    setCurrentView('landing');
  };

  const handleToggleReady = (isReady: boolean) => {
    sounds.playClick();
    socket.emit('player:ready', { isReady });
    if (currentPlayer) {
      setCurrentPlayer({ ...currentPlayer, isReady });
    }
  };

  const handleUpdateSettings = (settings: Partial<RoomSettings>) => {
    sounds.playClick();
    socket.emit('room:updateSettings', settings);
  };

  const handleAddBot = () => {
    sounds.playClick();
    socket.emit('bot:add');
  };

  const handleRemoveBot = (botId: string) => {
    sounds.playClick();
    socket.emit('bot:remove', { botId });
  };

  const handleStartGame = () => {
    sounds.playClick();
    socket.emit('game:start');
  };

  const handleSubmitClue = (text: string) => {
    sounds.playClick();
    socket.emit('clue:submit', { clueText: text });
  };

  const handleForceVoting = () => {
    sounds.playClick();
    socket.emit('discussion:forceVoting');
  };

  const handleCastVote = (targetId: string) => {
    socket.emit('vote:cast', { targetId });
  };

  const handleSubmitImposterGuess = (guess: string) => {
    socket.emit('imposter:guess', { guess });
  };

  const handleNextRound = () => {
    sounds.playClick();
    socket.emit('game:nextRound');
  };

  const handleRematch = () => {
    sounds.playClick();
    socket.emit('game:rematch');
  };

  const handleSendMessage = (text: string) => {
    socket.emit('chat:send', { text });
  };

  // Reactions & Sus-O-Meter
  const handleSendReaction = (emoji: string, label: string) => {
    socket.emit('room:reaction', { emoji, label });
  };

  const handleRatePlayer = (targetId: string, rating: 'SUSPECT' | 'TRUSTED') => {
    setMySuspectVotes(prev => {
      const current = prev[targetId];
      if (current === rating) {
        const next = { ...prev };
        delete next[targetId];
        return next;
      }
      return { ...prev, [targetId]: rating };
    });
    socket.emit('suspect:rate', { targetId, rating });
  };

  // Inspect clues with Gemini
  const handleInspectCluesWithGemini = async () => {
    if (!roomCode) return;
    const res = await fetch('/api/ai/inspect-clues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode })
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.error || 'Failed to inspect clues');
    }
  };

  // Render main game content based on current view or phase
  const renderContent = () => {
    // 1. Auxiliary informational views
    if (currentView === 'how_to_play') {
      return <HowToPlayView onBack={() => setCurrentView(roomCode ? 'game' : 'landing')} />;
    }
    if (currentView === 'rules') {
      return <RulesView onBack={() => setCurrentView(roomCode ? 'game' : 'landing')} />;
    }
    if (currentView === 'leaderboard') {
      return <LeaderboardView onBack={() => setCurrentView(roomCode ? 'game' : 'landing')} />;
    }

    // 2. Landing Page if not in a room
    if (!roomCode || !gameState || !currentPlayer) {
      return (
        <LandingPage
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onViewLeaderboard={() => setCurrentView('leaderboard')}
          onViewRules={() => setCurrentView('rules')}
          onViewHowToPlay={() => setCurrentView('how_to_play')}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />
      );
    }

    // 3. Game Phases
    switch (gameState.phase) {
      case 'LOBBY':
        return (
          <LobbyView
            gameState={gameState}
            currentPlayer={currentPlayer}
            onUpdateSettings={handleUpdateSettings}
            onToggleReady={handleToggleReady}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onStartGame={handleStartGame}
            onSendMessage={handleSendMessage}
            availableCategories={availableCategories}
            onOpenAiWordPack={() => setIsAiPackModalOpen(true)}
          />
        );

      case 'ASSIGNMENT':
        return (
          <AssignmentView
            assignment={assignment}
            gameState={gameState}
          />
        );

      case 'CLUE':
        return (
          <ClueView
            gameState={gameState}
            currentPlayer={currentPlayer}
            assignment={assignment}
            onSubmitClue={handleSubmitClue}
          />
        );

      case 'DISCUSSION':
        return (
          <DiscussionView
            gameState={gameState}
            currentPlayer={currentPlayer}
            assignment={assignment}
            chatMessages={chatMessages}
            onSendMessage={handleSendMessage}
            onForceVoting={handleForceVoting}
            onRatePlayer={handleRatePlayer}
            onOpenInspector={() => setIsInspectorModalOpen(true)}
            mySuspectVotes={mySuspectVotes}
          />
        );

      case 'VOTING':
      case 'REVOTE':
        return (
          <VotingView
            gameState={gameState}
            currentPlayer={currentPlayer}
            assignment={assignment}
            onCastVote={handleCastVote}
          />
        );

      case 'REVEAL':
      case 'IMPOSTER_GUESS':
        return (
          <RevealView
            gameState={gameState}
            currentPlayer={currentPlayer}
            assignment={assignment}
            onSubmitImposterGuess={handleSubmitImposterGuess}
          />
        );

      case 'ROUND_SUMMARY':
      case 'MATCH_OVER':
        return (
          <SummaryView
            gameState={gameState}
            currentPlayer={currentPlayer}
            onNextRound={handleNextRound}
            onRematch={handleRematch}
            onReturnToLobby={handleRematch}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        roomCode={roomCode || undefined}
        onLeaveRoom={handleLeaveRoom}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenDossierModal={() => setIsDossierModalOpen(true)}
        currentUser={currentUser}
        onGoogleLogin={handleGoogleLogin}
        onGoogleLogout={handleGoogleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full pb-16">
        {renderContent()}
      </main>

      {/* Floating Sound Reaction Emotes (available when in an active room) */}
      {roomCode && (
        <FloatingReactions
          onSendReaction={handleSendReaction}
          recentReactions={gameState?.recentReactions || []}
        />
      )}

      {/* Inspector Gemini AI Interrogator Modal */}
      {roomCode && (
        <InspectorGeminiModal
          isOpen={isInspectorModalOpen}
          onClose={() => setIsInspectorModalOpen(false)}
          roomCode={roomCode}
          category={gameState?.category || 'General'}
          aiAnalysis={gameState?.aiAnalysis}
          onInspectClues={handleInspectCluesWithGemini}
        />
      )}

      {/* AI Word Pack Generator Modal */}
      <AiWordPackModal
        isOpen={isAiPackModalOpen}
        onClose={() => setIsAiPackModalOpen(false)}
        onPackGenerated={(newCat) => {
          fetchCategories();
          handleUpdateSettings({
            selectedCategories: [newCat]
          });
          showToast(`Custom AI Category "${newCat}" loaded!`);
        }}
      />

      {/* Agent Dossier & Rank Modal */}
      <DossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        userRecord={currentUser}
        onUpdateAvatar={(newAvatarId) => {
          if (currentUser) {
            setCurrentUser({ ...currentUser, avatarId: newAvatarId });
          }
          if (currentPlayer) {
            setCurrentPlayer({ ...currentPlayer, avatarId: newAvatarId });
          }
        }}
      />


      {/* Gemini 3.8 Live API Voice Modal */}
      <LiveVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-red-950/90 border border-red-500/80 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in flex items-center gap-2">
          <span>⚠️</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
