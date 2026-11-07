import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { initDatabase, getLeaderboard, getAvailableCategories, insertCustomWordPack } from './src/server/db/database.ts';
import { RoomManager } from './src/server/game/RoomManager.ts';
import { registerSocketHandlers } from './src/server/socket/socketHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

// Initialize SQLite Database
initDatabase();

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Setup Socket.IO on the same HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 10000
});

const roomManager = new RoomManager(io);
registerSocketHandlers(io, roomManager);

// Express Middlewares
app.use(express.json());

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: roomManager.getActiveRoomsCount(),
    activePlayers: roomManager.getActivePlayersCount(),
    timestamp: Date.now()
  });
});

app.get('/api/leaderboard', (req, res) => {
  try {
    const data = getLeaderboard(30);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch leaderboard' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    const cats = getAvailableCategories();
    res.json(cats);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to fetch categories' });
  }
});

app.get('/api/room/:code', (req, res) => {
  const code = (req.params.code || '').toUpperCase();
  const room = roomManager.getRoom(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  return res.json({
    code: room.code,
    phase: room.phase,
    playerCount: room.players.size,
    maxPlayers: room.settings.maxPlayers,
    isJoinable: room.phase === 'LOBBY' && room.players.size < room.settings.maxPlayers
  });
});


// Inspector Gemini AI Deduction Analysis for Discussion Phase
app.post('/api/ai/inspect-clues', async (req, res) => {
  try {
    const { roomCode } = req.body;
    const room = roomManager.getRoom((roomCode || '').toUpperCase());
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    if (room.clues.length === 0) {
      return res.status(400).json({ error: 'No clues submitted yet to inspect.' });
    }

    const cluesText = room.clues.map(c => `- Agent ${c.playerName}: "${c.clueText}"`).join('\n');
    const prompt = `You are Inspector Gemini, a sharp, witty undercover detective observing a social deduction party game called IMPOSTER.
The category of the secret word is: "${room.category}".
Players have given these clues:
${cluesText}

Analyze these clues. Which clue sounds suspiciously vague, overly broad, or evasive like an imposter who doesn't know the exact secret word? Which clue sounds authentically specific?
Give a 2-3 sentence punchy, humorous deduction report highlighting who is the primary suspect. Keep it light-hearted and entertaining. Do not declare with 100% certainty, but point out suspicious evasion!`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const analysis = response.text || 'Inspector Gemini is scrutinizing the submitted clues... Watch out for evasive answers!';
    room.setAiAnalysis(analysis);
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Inspector Gemini error:', err);
    res.status(500).json({ error: err?.message || 'Failed to inspect clues' });
  }
});

// AI Custom Word Pack Generator with Gemini
app.post('/api/ai/generate-pack', async (req, res) => {
  try {
    const { themePrompt } = req.body;
    if (!themePrompt || typeof themePrompt !== 'string') {
      return res.status(400).json({ error: 'themePrompt is required' });
    }

    const prompt = `You are a game designer for the social deduction word party game IMPOSTER.
Generate a custom category word pack based on this theme: "${themePrompt}".
Generate exactly 8 words for this category.
For EACH word, generate 2 clever, vague hints that help an Imposter blend in without giving away the exact word immediately.
Output MUST be valid JSON with this exact structure:
{
  "category": "Theme Name",
  "words": [
    {
      "word": "SecretWord",
      "hints": ["Hint 1", "Hint 2"]
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.category && Array.isArray(parsed.words) && parsed.words.length > 0) {
      insertCustomWordPack(parsed.category, parsed.words);
      res.json({
        success: true,
        category: parsed.category,
        count: parsed.words.length,
        words: parsed.words
      });
    } else {
      res.status(500).json({ error: 'Invalid AI response format' });
    }
  } catch (err: any) {
    console.error('AI Word Pack error:', err);
    res.status(500).json({ error: err?.message || 'Failed to generate word pack' });
  }
});

// Gemini 3.8 Live API Voice Conversation WebSocket Server (/live)
const liveWss = new WebSocketServer({ noServer: true });

liveWss.on('connection', async (clientWs: WebSocket) => {
  let liveSession: any = null;

  try {
    liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'You are the Interrogation Master and Voice Arbiter in the party game IMPOSTER. You speak directly to the player with dramatic tension, analyzing clues, challenging suspects, and answering game questions with charismatic suspense.',
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          for (const part of message.serverContent?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ audio: part.inlineData.data }));
              }
            }
          }
          if (message.serverContent?.interrupted) {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ ready: true, status: 'connected to gemini-3.8-live' }));

    clientWs.on('message', (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (e) {
        console.error('Error handling live client audio message', e);
      }
    });

    clientWs.on('close', () => {
      try {
        if (liveSession && typeof liveSession.close === 'function') {
          liveSession.close();
        }
      } catch (e) {}
    });
  } catch (err: any) {
    console.error('Failed to connect to gemini-3.8-live:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ error: err?.message || 'Failed to connect to Live API' }));
      clientWs.close();
    }
  }
});

// Upgrade handling for /live WebSocket route
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/live') {
    liveWss.handleUpgrade(request, socket, head, (ws) => {
      liveWss.emit('connection', ws, request);
    });
  }
});

// Dev vs Production static handling
if (!isProduction) {
  // Mount Vite development middlewares
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {}
    },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  // Production: serve built static files from dist
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

server.listen(port, '0.0.0.0', () => {
  console.log(`[IMPOSTER SERVER] Listening on http://0.0.0.0:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
