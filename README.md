# IMPOSTER — Real-Time Multiplayer Word Deduction Game

> **"One word. One liar. Who can you trust?"**

A complete, responsive, real-time multiplayer social deduction browser party game built with React, Vite, Node.js, Express, Socket.IO, and SQLite.

---

## 🎮 Game Concept & Rules

In **IMPOSTER**, 3 to 12 players enter a private room:
1. **Secret Assignment:**
   - Every Civilian Agent receives the exact **Secret Word** (e.g., `"Pizza"`) and **Category** (`Food`).
   - The randomly selected **Imposter** receives only a **Vague Hint** (e.g., `"A popular Italian food"`).
2. **Turn-Based Clue Phase:**
   - Players take turns submitting a single clue phrase under a countdown timer.
   - Civilians must hint they know the word without giving it away to the Imposter.
   - The Imposter must bluff their way through without knowing the word.
3. **Discussion Phase:**
   - Players interrogate suspicious clues, discuss alibis, and use the live in-room intercom chat.
4. **Voting & Elimination:**
   - Secret ballots to eliminate the suspected Imposter.
   - Ties trigger a rapid tie-breaker revote between tied candidates.
   - If caught, the Imposter gets a 15-second bonus opportunity to guess the secret word for a dramatic steal!
5. **Scoreboard & Leaderboard:**
   - Persistent SQLite scoring tracking points, wins, losses, and win rates.

---

## 🏗️ Architecture

```
imposter/
├── src/
│   ├── assets/images/       # High-fidelity game artwork & badges
│   ├── components/
│   │   ├── Avatar.tsx       # 8 Distinct operative avatar themes
│   │   ├── ChatPanel.tsx    # Live in-room chat & system intercom
│   │   ├── Navbar.tsx       # Top Bar Contract compliant navigation
│   │   └── Timer.tsx        # SVG circular & linear countdown timers
│   ├── pages/
│   │   ├── LandingPage.tsx  # Game hub, room creator, joiner & preview
│   │   ├── LobbyView.tsx    # Room codes, player roster, host settings & bots
│   │   ├── AssignmentView.tsx # Classified confidential dossier reveal
│   │   ├── ClueView.tsx     # Turn-based clue input & testimony timeline
│   │   ├── DiscussionView.tsx # Clue board, discussion timer & chat
│   │   ├── VotingView.tsx   # Interactive elimination ballot cards
│   │   ├── RevealView.tsx   # Dramatic outcome, winner reveal & points
│   │   ├── SummaryView.tsx  # In-room match scoreboard & championship
│   │   ├── LeaderboardView.tsx # Global persistent operative hall of fame
│   │   ├── RulesView.tsx    # Official game rules & tie-break criteria
│   │   └── HowToPlayView.tsx # Scenario examples & tactical tips
│   ├── server/
│   │   ├── db/
│   │   │   ├── database.ts  # SQLite WAL-mode schema, scores & words
│   │   │   └── words.ts     # 200+ curated words across 10 categories
│   │   ├── game/
│   │   │   ├── Room.ts      # Authoritative state machine & bots
│   │   │   └── RoomManager.ts # Room lifecycles, codes & cleanup
│   │   └── socket/
│   │       └── socketHandler.ts # Real-time Socket.IO event router
│   ├── services/
│   │   ├── socket.ts        # Socket.IO client singleton
│   │   └── sound.ts         # Web Audio API procedural sound synthesizer
│   ├── shared/
│   │   └── types.ts         # Shared TypeScript game contracts
│   ├── App.tsx              # Root controller & view manager
│   ├── index.css            # Tailwind CSS rules & keyframe animations
│   └── main.tsx             # React entry point
├── test/
│   └── imposter.test.ts     # Automated unit & integration test suite
├── server.ts                # Express, Socket.IO & Vite middleware server
├── package.json
└── vite.config.ts
```

---

## 🚀 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser. Both the React SPA and Socket.IO real-time multiplayer server run seamlessly on port 3000.

3. **Run automated tests:**
   ```bash
   npm test
   ```

4. **Verify TypeScript compilation:**
   ```bash
   npm run lint
   ```

---

## 🌐 Production Deployment

### 1. Backend (Persistent Node.js / Cloud Run / VPS)
- Build frontend: `npm run build`
- Set environment variables:
  ```env
  PORT=3000
  NODE_ENV=production
  DATABASE_PATH=/var/data/imposter.db
  ```
- Start server: `node server.ts` or `npm start`
- Mount `/var/data` as a persistent disk volume to preserve SQLite database state across restarts.

### 2. Frontend (Netlify or CDN)
- Build command: `npm run build`
- Publish directory: `dist`
- If hosted separately from backend, configure `VITE_API_URL` to point to your persistent backend domain.
- For SPA client routing on Netlify, create a `dist/_redirects` file containing:
  ```
  /*    /index.html   200
  ```
