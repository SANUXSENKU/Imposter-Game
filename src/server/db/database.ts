import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { WORD_DATABASE } from './words.ts';

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'imposter.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrency and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      session_token TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      last_seen INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scores (
      player_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_id TEXT NOT NULL,
      total_games INTEGER NOT NULL DEFAULT 0,
      total_wins INTEGER NOT NULL DEFAULT 0,
      total_losses INTEGER NOT NULL DEFAULT 0,
      imposter_wins INTEGER NOT NULL DEFAULT 0,
      civilian_wins INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      host_player_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'waiting', 'in_progress', 'ended'
      settings_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS room_players (
      room_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      is_ready INTEGER NOT NULL DEFAULT 0,
      is_connected INTEGER NOT NULL DEFAULT 1,
      joined_at INTEGER NOT NULL,
      PRIMARY KEY (room_id, player_id),
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      status TEXT NOT NULL, -- 'active', 'completed', 'abandoned'
      imposter_count INTEGER NOT NULL,
      winner_team TEXT, -- 'imposters', 'civilians', 'draw'
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      round_number INTEGER NOT NULL,
      secret_word TEXT NOT NULL,
      category TEXT NOT NULL,
      hints_json TEXT NOT NULL,
      imposter_ids_json TEXT NOT NULL,
      eliminated_player_id TEXT,
      was_imposter_eliminated INTEGER,
      imposter_guess TEXT,
      winner_team TEXT,
      started_at INTEGER NOT NULL,
      ended_at INTEGER,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS word_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      hints_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clues (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      player_id TEXT NOT NULL,
      clue_text TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      submitted_at INTEGER NOT NULL,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS votes (
      id TEXT PRIMARY KEY,
      round_id TEXT NOT NULL,
      voter_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      is_revote INTEGER NOT NULL DEFAULT 0,
      cast_at INTEGER NOT NULL,
      FOREIGN KEY (round_id) REFERENCES rounds(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
    CREATE INDEX IF NOT EXISTS idx_scores_points ON scores(points DESC);
    CREATE INDEX IF NOT EXISTS idx_rounds_game ON rounds(game_id);
    CREATE INDEX IF NOT EXISTS idx_word_category ON word_records(category);
  `);

  // Seed words if not already seeded
  const countRow = db.prepare('SELECT COUNT(*) as count FROM word_records').get() as { count: number };
  if (countRow.count === 0) {
    const insertWord = db.prepare('INSERT OR IGNORE INTO word_records (word, category, hints_json) VALUES (?, ?, ?)');
    const insertMany = db.transaction((words) => {
      for (const w of words) {
        insertWord.run(w.word, w.category, JSON.stringify(w.hints));
      }
    });
    insertMany(WORD_DATABASE);
  }
}

// Helpers for players & leaderboard
export function upsertPlayer(player: { id: string; sessionToken: string; displayName: string; avatarId: string }) {
  const now = Date.now();
  const stmt = db.prepare(`
    INSERT INTO players (id, session_token, display_name, avatar_id, created_at, last_seen)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_id = excluded.avatar_id,
      last_seen = excluded.last_seen
  `);
  stmt.run(player.id, player.sessionToken, player.displayName, player.avatarId, now, now);

  // Also ensure score row exists
  const scoreStmt = db.prepare(`
    INSERT INTO scores (player_id, display_name, avatar_id, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_id = excluded.avatar_id,
      updated_at = excluded.updated_at
  `);
  scoreStmt.run(player.id, player.displayName, player.avatarId, now);
}

export function getPlayerBySession(token: string) {
  return db.prepare('SELECT * FROM players WHERE session_token = ?').get(token) as {
    id: string;
    session_token: string;
    display_name: string;
    avatar_id: string;
    created_at: number;
    last_seen: number;
  } | undefined;
}

export function updatePlayerScore(playerId: string, result: {
  won: boolean;
  isImposter: boolean;
  pointsDelta: number;
  displayName: string;
  avatarId: string;
}) {
  const now = Date.now();

  // Ensure player row exists in players table to satisfy foreign key
  db.prepare(`
    INSERT INTO players (id, session_token, display_name, avatar_id, created_at, last_seen)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_id = excluded.avatar_id,
      last_seen = excluded.last_seen
  `).run(playerId, `tok_${playerId}`, result.displayName, result.avatarId, now, now);

  const stmt = db.prepare(`
    INSERT INTO scores (player_id, display_name, avatar_id, total_games, total_wins, total_losses, imposter_wins, civilian_wins, points, updated_at)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      display_name = excluded.display_name,
      avatar_id = excluded.avatar_id,
      total_games = scores.total_games + 1,
      total_wins = scores.total_wins + excluded.total_wins,
      total_losses = scores.total_losses + excluded.total_losses,
      imposter_wins = scores.imposter_wins + excluded.imposter_wins,
      civilian_wins = scores.civilian_wins + excluded.civilian_wins,
      points = MAX(0, scores.points + excluded.points),
      updated_at = excluded.updated_at
  `);

  stmt.run(
    playerId,
    result.displayName,
    result.avatarId,
    result.won ? 1 : 0,
    result.won ? 0 : 1,
    (result.won && result.isImposter) ? 1 : 0,
    (result.won && !result.isImposter) ? 1 : 0,
    result.pointsDelta,
    now
  );
}

export function getLeaderboard(limit = 20) {
  return db.prepare(`
    SELECT
      player_id as playerId,
      display_name as displayName,
      avatar_id as avatarId,
      total_games as totalGames,
      total_wins as totalWins,
      total_losses as totalLosses,
      imposter_wins as imposterWins,
      civilian_wins as civilianWins,
      points,
      CASE WHEN total_games > 0 THEN ROUND((CAST(total_wins AS FLOAT) / total_games) * 100, 1) ELSE 0 END as winRate
    FROM scores
    ORDER BY points DESC, total_wins DESC
    LIMIT ?
  `).all(limit);
}

export function getRandomWord(categories: string[] = []) {
  if (categories.length > 0) {
    const placeholders = categories.map(() => '?').join(',');
    const row = db.prepare(`
      SELECT word, category, hints_json as hintsJson
      FROM word_records
      WHERE category IN (${placeholders})
      ORDER BY RANDOM()
      LIMIT 1
    `).get(...categories) as { word: string; category: string; hintsJson: string } | undefined;

    if (row) {
      return {
        word: row.word,
        category: row.category,
        hints: JSON.parse(row.hintsJson) as string[]
      };
    }
  }

  // Fallback to any random word
  const row = db.prepare(`
    SELECT word, category, hints_json as hintsJson
    FROM word_records
    ORDER BY RANDOM()
    LIMIT 1
  `).get() as { word: string; category: string; hintsJson: string };

  return {
    word: row.word,
    category: row.category,
    hints: JSON.parse(row.hintsJson) as string[]
  };
}

export function getAvailableCategories(): string[] {
  const rows = db.prepare('SELECT DISTINCT category FROM word_records ORDER BY category ASC').all() as { category: string }[];
  return rows.map(r => r.category);
}

export function getDecoyWords(secretWord: string, category: string, count = 3): string[] {
  try {
    const rows = db.prepare(`
      SELECT word FROM word_records
      WHERE category = ? AND word != ?
      ORDER BY RANDOM()
      LIMIT ?
    `).all(category, secretWord, count) as { word: string }[];

    let words = rows.map(r => r.word);
    if (words.length < count) {
      const moreRows = db.prepare(`
        SELECT word FROM word_records
        WHERE word != ?
        ORDER BY RANDOM()
        LIMIT ?
      `).all(secretWord, count - words.length) as { word: string }[];
      words = [...words, ...moreRows.map(r => r.word)];
    }
    return words;
  } catch {
    return ['Bicycle', 'Telescope', 'Pyramid'];
  }
}

export function insertCustomWordPack(category: string, items: { word: string; hints: string[] }[]): number {
  const insertWord = db.prepare('INSERT OR IGNORE INTO word_records (word, category, hints_json) VALUES (?, ?, ?)');
  let inserted = 0;
  const insertMany = db.transaction((list) => {
    for (const item of list) {
      const res = insertWord.run(item.word, category, JSON.stringify(item.hints));
      if (res.changes > 0) inserted++;
    }
  });
  insertMany(items);
  return inserted;
}

