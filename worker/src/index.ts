import lessons from '../data/lessons.json';
import decks from '../data/flashcards.json';
import dailyWords from '../data/dailyWords.json';

interface Env {
  DB: D1Database;
}

const createTablesSQL = `
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

CREATE TABLE IF NOT EXISTS __migrations (
  key TEXT PRIMARY KEY,
  value TEXT
);
`;

async function bootstrap(env: Env) {
  const db = env.DB;

  const ddls = createTablesSQL
    .split(';')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s + ';');
  for (const sql of ddls) {
    await db.prepare(sql).run();
  }

  const seeded = await db.prepare('SELECT value FROM __migrations WHERE key = ?').bind('seeded_v1').first<{ value: string }>();
  if (seeded) return;

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

// ✅ CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // 或者替换为你的前端域名
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ✅ JSON 响应统一带 CORS
function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
      ...(init?.headers || {}),
    },
    status: init?.status || 200,
  });
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      await bootstrap(env);

      const url = new URL(req.url);
      const path = url.pathname.replace(/\/$/, '');

      // OPTIONS 预检请求
      if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders() });
      }

      // GET /lessons
      if (req.method === 'GET' && path === '/lessons') {
        const { results } = await env.DB.prepare('SELECT * FROM lessons ORDER BY CAST(id AS INTEGER) ASC').all();
        return json(results);
      }

      // GET /lessons/:id
      if (req.method === 'GET' && /^\/lessons\//.test(path)) {
        const id = decodeURIComponent(path.split('/')[2] || '');
        const row = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
        if (!row) return json({ message: 'Not Found' }, { status: 404 });
        return json(row);
      }

      // GET /flashcards
      if (req.method === 'GET' && path === '/flashcards') {
        const { results: deckRows } = await env.DB.prepare('SELECT * FROM flashcard_decks ORDER BY id').all();
        const decksList = [];
        for (const d of deckRows as any[]) {
          const { results: cards } = await env.DB.prepare('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY id').bind(d.id).all();
          decksList.push({ ...d, cards });
        }
        return json(decksList);
      }

      // GET /flashcards/:id
      if (req.method === 'GET' && /^\/flashcards\//.test(path)) {
        const id = decodeURIComponent(path.split('/')[2] || '');
        const deck = await env.DB.prepare('SELECT * FROM flashcard_decks WHERE id = ?').bind(id).first<any>();
        if (!deck) return json({ message: 'Not Found' }, { status: 404 });
        const { results: cards } = await env.DB.prepare('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY id').bind(id).all();
        return json({ ...deck, cards });
      }

      // GET /daily-words
      if (req.method === 'GET' && path === '/daily-words') {
        const { results } = await env.DB.prepare('SELECT * FROM daily_words ORDER BY date ASC').all();
        return json(results);
      }

      // GET /daily-word
      if (req.method === 'GET' && path === '/daily-word') {
        const { results } = await env.DB.prepare('SELECT * FROM daily_words').all();
        if (!results || results.length === 0) return json({ message: 'Not Found' }, { status: 404 });
        const idx = Math.floor(Math.random() * results.length);
        return json(results[idx]);
      }

      // 404
      return json({ message: 'Not Found' }, { status: 404 });

    } catch (e: any) {
      return json({ message: 'Internal Error', error: String(e?.message || e) }, { status: 500 });
    }
  },
};
