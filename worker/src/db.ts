import lessons from '../data/lessons.json';
import decks from '../data/flashcards.json';
import dailyWords from '../data/dailyWords.json';

interface Env {
  DB: D1Database;
}

export const createTablesSQL = `
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  imageUrl TEXT
);

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS flashcards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL,
  german TEXT NOT NULL,
  english TEXT NOT NULL,
  example TEXT,
  imageUrl TEXT,
  mastered INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(deck_id) REFERENCES flashcard_decks(id)
);

CREATE TABLE IF NOT EXISTS daily_words (
  date TEXT PRIMARY KEY,
  german TEXT NOT NULL,
  english TEXT NOT NULL,
  example TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0,
  verified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS __migrations (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;

export async function bootstrap(env: Env) {
  const db = env.DB;
  const seeded = await db.prepare('SELECT value FROM __migrations WHERE key = ?').bind('seeded_v1').first<{ value: string }>();
  if (seeded) return;
  
  const ddls = createTablesSQL
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s + ';');
  for (const sql of ddls) {
    await db.prepare(sql).run();
  }

  const insertLesson = db.prepare(
    'INSERT OR IGNORE INTO lessons (id, title, category, level, description, content, imageUrl) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const l of lessons as any[]) {
    await insertLesson.bind(l.id, l.title, l.category, l.level, l.description, l.content, l.imageUrl ?? null).run();
  }

  const insertDeck = db.prepare('INSERT OR IGNORE INTO flashcard_decks (id, title, category) VALUES (?, ?, ?)');
  const insertCard = db.prepare(
    'INSERT OR IGNORE INTO flashcards (id, deck_id, german, english, example, imageUrl, mastered) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  for (const d of decks as any[]) {
    await insertDeck.bind(d.id, d.title, d.category).run();
    for (const c of d.cards as any[]) {
      await insertCard.bind(c.id, d.id, c.german, c.english, c.example ?? null, c.imageUrl ?? null, c.mastered ? 1 : 0).run();
    }
  }

  const insertWord = db.prepare('INSERT OR IGNORE INTO daily_words (date, german, english, example) VALUES (?, ?, ?, ?)');
  for (const w of dailyWords as any[]) {
    await insertWord.bind(w.date, w.german, w.english, w.example).run();
  }

  await db.prepare('INSERT OR REPLACE INTO __migrations (key, value) VALUES (?, ?)').bind('seeded_v1', new Date().toISOString()).run();
}
