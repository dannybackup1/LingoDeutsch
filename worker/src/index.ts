import lessons from '../data/lessons.json';
import decks from '../data/flashcards.json';
import dailyWords from '../data/dailyWords.json';

interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
}

// Utility functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

function generateCode(): string {
  return Math.random().toString().substring(2, 8);
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

function createJWT(payload: Record<string, any>, secret: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const message = `${header}.${body}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(message + secret);

  // For simplicity, we'll use a basic signature
  // In production, you should use a proper JWT library
  const signature = btoa(message);

  return `${message}.${signature}`;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  env: Env
): Promise<boolean> {
  try {
    // For now, we'll just log it. In production, integrate with SendGrid, Mailgun, or SMTP service
    // You can configure environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
    console.log(`Email to ${to}: ${subject}`);

    // Placeholder for future SMTP integration
    // You can use Resend, SendGrid, or other email services via API
    // Example using SendGrid:
    // const sendgridApiKey = env.SENDGRID_API_KEY;
    // if (!sendgridApiKey) return false;
    // await fetch('https://api.sendgrid.com/v3/mail/send', { ... })

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
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

let initialized = false;

async function bootstrap(env: Env) {
  if (initialized) return; // ✅ 跳过重复执行
  initialized = true;

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

// ✅ CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*', // 或者替换为你的前端域名
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ✅ 生成 ETag (使用简单的哈希)
function generateETag(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

// ✅ 获取合理的 cache max-age（根据端点类型）
function getCacheMaxAge(path: string): number {
  if (path === '/daily-word') return 600; // 10 分钟，动态内容
  if (path === '/daily-words') return 3600; // 1 小时
  if (path.includes('/lessons') || path.includes('/flashcards')) return 86400; // 24 小时，静态内容
  return 3600; // 默认 1 小时
}

// ✅ JSON 响应统一带 CORS 和 Cache-Control
function json(data: unknown, req?: Request, path?: string, init?: ResponseInit) {
  const dataStr = JSON.stringify(data);
  const eTag = generateETag(dataStr);

  const maxAge = path ? getCacheMaxAge(path) : 3600;
  const cacheControl = `public, max-age=${maxAge}`;

  // 检查 ETag 缓存验证 (304 Not Modified)
  if (req) {
    const ifNoneMatch = req.headers.get('if-none-match');
    if (ifNoneMatch === eTag) {
      return new Response(null, {
        status: 304,
        headers: {
          'cache-control': cacheControl,
          'etag': eTag,
          ...corsHeaders(),
        },
      });
    }
  }

  return new Response(dataStr, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cacheControl,
      'etag': eTag,
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
        return json(results, req, path);
      }

      // GET /lessons/:id
      if (req.method === 'GET' && /^\/lessons\//.test(path)) {
        const id = decodeURIComponent(path.split('/')[2] || '');
        const row = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
        if (!row) return json({ message: 'Not Found' }, req, path, { status: 404 });
        return json(row, req, path);
      }

      // GET /flashcards
      if (req.method === 'GET' && path === '/flashcards') {
        const { results: deckRows } = await env.DB.prepare('SELECT * FROM flashcard_decks ORDER BY id').all();
        const decksList = [];
        for (const d of deckRows as any[]) {
          const { results: cards } = await env.DB.prepare('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY id').bind(d.id).all();
          decksList.push({ ...d, cards });
        }
        return json(decksList, req, path);
      }

      // GET /flashcards/:id
      if (req.method === 'GET' && /^\/flashcards\//.test(path)) {
        const id = decodeURIComponent(path.split('/')[2] || '');
        const deck = await env.DB.prepare('SELECT * FROM flashcard_decks WHERE id = ?').bind(id).first<any>();
        if (!deck) return json({ message: 'Not Found' }, req, path, { status: 404 });
        const { results: cards } = await env.DB.prepare('SELECT * FROM flashcards WHERE deck_id = ? ORDER BY id').bind(id).all();
        return json({ ...deck, cards }, req, path);
      }

      // GET /daily-words
      if (req.method === 'GET' && path === '/daily-words') {
        const { results } = await env.DB.prepare('SELECT * FROM daily_words ORDER BY date ASC').all();
        return json(results, req, path);
      }

      // GET /daily-word
      if (req.method === 'GET' && path === '/daily-word') {
        const { results } = await env.DB.prepare('SELECT * FROM daily_words').all();
        if (!results || results.length === 0) return json({ message: 'Not Found' }, req, path, { status: 404 });
        const idx = Math.floor(Math.random() * results.length);
        return json(results[idx], req, path);
      }

      // POST /auth/register
      if (req.method === 'POST' && path === '/auth/register') {
        const body = await req.json<{ username: string; email: string; password: string }>();
        const { username, email, password } = body;

        if (!username || !email || !password) {
          return json({ error: 'Missing required fields' }, req, path, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE email = ? OR username = ?'
        ).bind(email, username).first();

        if (existingUser) {
          return json({ error: 'User already exists' }, req, path, { status: 409 });
        }

        const userId = generateId();
        const passwordHash = await hashPassword(password);
        const createdAt = new Date().toISOString();

        await env.DB.prepare(
          'INSERT INTO users (id, username, email, password_hash, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind(userId, username, email, passwordHash, 0, createdAt, createdAt).run();

        // Generate verification token and code
        const verificationId = generateId();
        const code = generateCode();
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await env.DB.prepare(
          'INSERT INTO email_verification_tokens (id, user_id, token, code, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(verificationId, userId, token, code, expiresAt, createdAt).run();

        // Send verification email
        const html = `
          <h2>Welcome to LingoDeutsch!</h2>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 24 hours.</p>
          <p>Please enter this code on the verification page to complete your registration.</p>
        `;

        await sendEmail(email, 'Email Verification - LingoDeutsch', html, env);

        return json(
          {
            success: true,
            message: 'Registration successful. Please check your email for the verification code.',
            userId,
            requiresVerification: true,
          },
          req,
          path
        );
      }

      // POST /auth/verify-email
      if (req.method === 'POST' && path === '/auth/verify-email') {
        const body = await req.json<{ userId: string; code: string }>();
        const { userId, code } = body;

        if (!userId || !code) {
          return json({ error: 'Missing required fields' }, req, path, { status: 400 });
        }

        const verification = await env.DB.prepare(
          'SELECT * FROM email_verification_tokens WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(userId).first<any>();

        if (!verification) {
          return json({ error: 'No verification found' }, req, path, { status: 404 });
        }

        if (verification.code !== code) {
          return json({ error: 'Invalid verification code' }, req, path, { status: 400 });
        }

        if (new Date(verification.expires_at) < new Date()) {
          return json({ error: 'Verification code expired' }, req, path, { status: 400 });
        }

        const verifiedAt = new Date().toISOString();
        await env.DB.prepare(
          'UPDATE users SET email_verified = ?, verified_at = ?, updated_at = ? WHERE id = ?'
        ).bind(1, verifiedAt, verifiedAt, userId).run();

        // Delete used verification token
        await env.DB.prepare('DELETE FROM email_verification_tokens WHERE id = ?').bind(verification.id).run();

        // Get user for JWT
        const user = await env.DB.prepare('SELECT id, username, email FROM users WHERE id = ?').bind(userId).first<any>();

        return json(
          {
            success: true,
            message: 'Email verified successfully',
            user,
          },
          req,
          path
        );
      }

      // POST /auth/login
      if (req.method === 'POST' && path === '/auth/login') {
        const body = await req.json<{ email: string; password: string }>();
        const { email, password } = body;

        if (!email || !password) {
          return json({ error: 'Missing required fields' }, req, path, { status: 400 });
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<any>();

        if (!user) {
          return json({ error: 'User not found' }, req, path, { status: 404 });
        }

        if (!user.email_verified) {
          return json(
            { error: 'Email not verified', userId: user.id, requiresVerification: true },
            req,
            path,
            { status: 403 }
          );
        }

        const passwordValid = await verifyPassword(password, user.password_hash);

        if (!passwordValid) {
          return json({ error: 'Invalid password' }, req, path, { status: 401 });
        }

        // Update last login
        await env.DB.prepare('UPDATE users SET updated_at = ? WHERE id = ?').bind(new Date().toISOString(), user.id).run();

        return json(
          {
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
          },
          req,
          path
        );
      }

      // POST /auth/forgot-password
      if (req.method === 'POST' && path === '/auth/forgot-password') {
        const body = await req.json<{ email: string }>();
        const { email } = body;

        if (!email) {
          return json({ error: 'Email is required' }, req, path, { status: 400 });
        }

        const user = await env.DB.prepare('SELECT id, email FROM users WHERE email = ?').bind(email).first<any>();

        if (!user) {
          // Don't reveal if user exists
          return json(
            {
              success: true,
              message: 'If an account with that email exists, a password reset link will be sent.',
            },
            req,
            path
          );
        }

        // Generate reset token and code
        const resetId = generateId();
        const code = generateCode();
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(); // 1 hour

        await env.DB.prepare(
          'INSERT INTO password_reset_tokens (id, user_id, token, code, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(resetId, user.id, token, code, expiresAt, new Date().toISOString()).run();

        // Send password reset email
        const html = `
          <h2>Password Reset Request</h2>
          <p>Your password reset code is: <strong>${code}</strong></p>
          <p>This code will expire in 1 hour.</p>
          <p>Please enter this code to reset your password.</p>
        `;

        await sendEmail(user.email, 'Password Reset - LingoDeutsch', html, env);

        return json(
          {
            success: true,
            message: 'If an account with that email exists, a password reset link will be sent.',
          },
          req,
          path
        );
      }

      // POST /auth/reset-password
      if (req.method === 'POST' && path === '/auth/reset-password') {
        const body = await req.json<{ email: string; code: string; newPassword: string }>();
        const { email, code, newPassword } = body;

        if (!email || !code || !newPassword) {
          return json({ error: 'Missing required fields' }, req, path, { status: 400 });
        }

        const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<any>();

        if (!user) {
          return json({ error: 'User not found' }, req, path, { status: 404 });
        }

        const resetToken = await env.DB.prepare(
          'SELECT * FROM password_reset_tokens WHERE user_id = ? AND code = ? ORDER BY created_at DESC LIMIT 1'
        ).bind(user.id, code).first<any>();

        if (!resetToken) {
          return json({ error: 'Invalid reset code' }, req, path, { status: 400 });
        }

        if (new Date(resetToken.expires_at) < new Date()) {
          return json({ error: 'Reset code expired' }, req, path, { status: 400 });
        }

        const newPasswordHash = await hashPassword(newPassword);
        const now = new Date().toISOString();

        await env.DB.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').bind(
          newPasswordHash,
          now,
          user.id
        ).run();

        // Delete used reset token
        await env.DB.prepare('DELETE FROM password_reset_tokens WHERE id = ?').bind(resetToken.id).run();

        return json(
          {
            success: true,
            message: 'Password reset successful',
          },
          req,
          path
        );
      }

      // 404
      return json({ message: 'Not Found' }, req, path, { status: 404 });

    } catch (e: any) {
      return json({ message: 'Internal Error', error: String(e?.message || e) }, req, path, { status: 500 });
    }
  },
};
