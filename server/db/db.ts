import pg from 'pg';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface DbUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  salt: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  token: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

export interface DbContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  delivery_status: 'pending' | 'sent' | 'failed';
  error_details?: string;
  created_at: string;
}

export interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  read_time: string;
  tags: string[];
  published_at: string;
  created_at: string;
}

export interface DbToolStat {
  toolId: string;
  name: string;
  category: string;
  count: number;
  lastUsed: string;
}

let pool: pg.Pool | null = null;
let isConnected = false;

// Fallback in-memory state
const memUsers: Map<string, DbUser> = new Map();
const memSessions: Map<string, DbSession> = new Map();
const memContacts: DbContactMessage[] = [];
const memBlogPosts: DbBlogPost[] = [];
const memToolStats: Map<string, DbToolStat> = new Map();
const memFavorites: Map<string, Set<string>> = new Map();

// Helper to seed initial data in memory
function seedInMemory() {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultAdminHash = crypto.pbkdf2Sync('utilexAdmin2026!', defaultSalt, 1000, 64, 'sha512').toString('hex');
  const adminUser: DbUser = {
    id: 'usr_admin_1',
    name: 'Daniyal',
    email: 'admin@utilex.com',
    password_hash: defaultAdminHash,
    salt: defaultSalt,
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memUsers.set(adminUser.email, adminUser);

  memContacts.push(
    {
      id: 'msg_1',
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      subject: 'Love the PDF Merge tool!',
      message: 'UTILEX saved our team hours on our monthly reports. Incredible speed and zero file storage worries.',
      status: 'read',
      delivery_status: 'sent',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'msg_2',
      name: 'Alex Rivera',
      email: 'alex.code@example.dev',
      subject: 'Feature suggestion: RegEx visualizer',
      message: 'The Regex tester is super handy. Keep up the phenomenal work!',
      status: 'new',
      delivery_status: 'sent',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    }
  );

  const initialStats = [
    { toolId: 'jpg-to-pdf', name: 'JPG to PDF', category: 'PDF Tools', count: 184 },
    { toolId: 'pdf-merge', name: 'PDF Merge', category: 'PDF Tools', count: 239 },
    { toolId: 'image-compressor', name: 'Image Compressor', category: 'Image Tools', count: 312 },
    { toolId: 'json-formatter', name: 'JSON Formatter', category: 'Developer Tools', count: 420 },
    { toolId: 'word-counter', name: 'Word Counter', category: 'Text Tools', count: 295 },
    { toolId: 'utilex-ai-chat', name: 'UTILEX AI Chat', category: 'AI Tools', count: 350 },
    { toolId: 'qr-code-generator', name: 'QR Code Generator', category: 'Productivity', count: 178 },
    { toolId: 'password-generator', name: 'Password Generator', category: 'Productivity', count: 165 },
  ];
  for (const s of initialStats) {
    memToolStats.set(s.toolId, { ...s, lastUsed: new Date().toISOString() });
  }

  memBlogPosts.push(
    {
      id: 'post_1',
      slug: 'why-client-side-pdf-processing-is-the-future-of-document-privacy',
      title: 'Why Client-Side PDF Processing Is the Future of Document Privacy',
      excerpt: 'Discover how modern browser WebAssembly and local JavaScript engines process confidential PDF files without ever uploading a single byte to the cloud.',
      content: `# Why Client-Side PDF Processing Is the Future of Document Privacy\n\nEvery day, millions of users upload sensitive bank statements, identification records, and tax returns to online PDF conversion portals without knowing where those files are stored.\n\n### The Security Flaw of Cloud-Based Converters\nMost traditional online document converters store your files on temporary cloud buckets. Even when services advertise automatic deletion within 60 minutes, your files remain exposed to server breaches, data scraping, and unintentional log persistence.\n\n### The UTILEX In-Browser Solution\nUTILEX fundamentally rethinks document utility by compiling rendering and manipulation engines directly into your client's web browser.\n\n1. **Zero Server Uploads**: The file stays in your browser memory.\n2. **Near-Zero Latency**: No waiting for upload and download queues.\n3. **Guaranteed Compliance**: Built-in adherence to GDPR and data sovereignty rules.`,
      category: 'Security & Privacy',
      author: 'Daniyal',
      read_time: '4 min read',
      tags: ['PDF', 'Privacy', 'Client-Side', 'Security'],
      published_at: '2026-09-20',
      created_at: new Date().toISOString(),
    },
    {
      id: 'post_2',
      slug: 'understanding-modern-image-formats-webp-vs-png-vs-jpeg',
      title: 'Understanding Modern Image Formats: WebP vs PNG vs JPEG',
      excerpt: 'A comprehensive visual guide comparing compression ratios, transparency support, and performance impacts for modern web applications.',
      content: `# Understanding Modern Image Formats: WebP vs PNG vs JPEG\n\nSelecting the correct image format directly impacts your website page speed, core web vitals, and user conversion rates.\n\n### Summary\n- **JPEG**: Ideal for photographs.\n- **PNG**: Ideal for vector graphics and UI mockups.\n- **WebP**: Modern standard providing 30% smaller files.`,
      category: 'Web Performance',
      author: 'Daniyal',
      read_time: '5 min read',
      tags: ['Image Optimization', 'WebP', 'Performance', 'Web Development'],
      published_at: '2026-09-22',
      created_at: new Date().toISOString(),
    }
  );
}

seedInMemory();

/**
 * Initialize Database Connection and run bootstrap schema
 */
export async function initDatabase(): Promise<boolean> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === '') {
    console.log('[Database] DATABASE_URL not detected. Using graceful in-memory storage fallback.');
    return false;
  }

  try {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('[Database] Connected successfully to PostgreSQL / Supabase.');

    // Run schema bootstrap
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSql);
        console.log('[Database] PostgreSQL schema verified and up to date.');
      }
    } catch (schemaErr: any) {
      console.warn('[Database] Schema execution warning:', schemaErr.message);
    }

    // Seed default admin in database if missing
    try {
      const checkAdmin = await client.query('SELECT id FROM users WHERE email = $1', ['admin@utilex.com']);
      if (checkAdmin.rowCount === 0) {
        const defaultSalt = crypto.randomBytes(16).toString('hex');
        const defaultAdminHash = crypto.pbkdf2Sync('utilexAdmin2026!', defaultSalt, 1000, 64, 'sha512').toString('hex');
        await client.query(
          `INSERT INTO users (id, name, email, password_hash, salt, role)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (email) DO NOTHING`,
          ['usr_admin_1', 'Daniyal', 'admin@utilex.com', defaultAdminHash, defaultSalt, 'admin']
        );
        console.log('[Database] Default administrator account seeded.');
      }
    } catch (seedErr: any) {
      console.warn('[Database] Admin seed warning:', seedErr.message);
    }

    client.release();
    isConnected = true;
    return true;
  } catch (err: any) {
    console.warn('[Database] Could not connect to PostgreSQL instance:', err.message);
    console.log('[Database] Falling back gracefully to resilient in-memory storage.');
    pool = null;
    isConnected = false;
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}

// ==========================================
// USER REPOSITORY
// ==========================================
export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const normEmail = email.toLowerCase().trim();
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normEmail]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error('[Database] findUserByEmail error:', err);
    }
  }
  return memUsers.get(normEmail) || null;
}

export async function findUserById(id: string): Promise<DbUser | null> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error('[Database] findUserById error:', err);
    }
  }
  for (const u of memUsers.values()) {
    if (u.id === id) return u;
  }
  return null;
}

export async function createUser(user: Omit<DbUser, 'created_at' | 'updated_at'>): Promise<DbUser> {
  const now = new Date().toISOString();
  const newUser: DbUser = {
    ...user,
    created_at: now,
    updated_at: now,
  };

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO users (id, name, email, password_hash, salt, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [newUser.id, newUser.name, newUser.email.toLowerCase().trim(), newUser.password_hash, newUser.salt, newUser.role, now, now]
      );
    } catch (err) {
      console.error('[Database] createUser error:', err);
    }
  }

  memUsers.set(newUser.email.toLowerCase().trim(), newUser);
  return newUser;
}

export async function updateUserPassword(email: string, passwordHash: string, salt: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  if (pool && isConnected) {
    try {
      await pool.query(
        'UPDATE users SET password_hash = $1, salt = $2, updated_at = $3 WHERE LOWER(email) = $4',
        [passwordHash, salt, now, normEmail]
      );
    } catch (err) {
      console.error('[Database] updateUserPassword error:', err);
    }
  }

  const u = memUsers.get(normEmail);
  if (u) {
    u.password_hash = passwordHash;
    u.salt = salt;
    u.updated_at = now;
    return true;
  }
  return false;
}

export async function updateUserProfile(id: string, name: string): Promise<DbUser | null> {
  const now = new Date().toISOString();

  if (pool && isConnected) {
    try {
      const res = await pool.query(
        'UPDATE users SET name = $1, updated_at = $2 WHERE id = $3 RETURNING *',
        [name, now, id]
      );
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error('[Database] updateUserProfile error:', err);
    }
  }

  for (const u of memUsers.values()) {
    if (u.id === id) {
      u.name = name;
      u.updated_at = now;
      return u;
    }
  }
  return null;
}

export async function countUsers(): Promise<number> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT COUNT(*) as cnt FROM users');
      return parseInt(res.rows[0].cnt, 10);
    } catch (err) {
      console.error('[Database] countUsers error:', err);
    }
  }
  return memUsers.size;
}

// ==========================================
// SESSION REPOSITORY
// ==========================================
export async function createSession(userId: string, token: string, expiresInMs: number = 7 * 86400000): Promise<DbSession> {
  const id = `ses_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInMs).toISOString();

  const session: DbSession = {
    id,
    token,
    user_id: userId,
    expires_at: expiresAt,
    created_at: now.toISOString(),
  };

  if (pool && isConnected) {
    try {
      await pool.query(
        'INSERT INTO sessions (id, token, user_id, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)',
        [session.id, session.token, session.user_id, session.expires_at, session.created_at]
      );
    } catch (err) {
      console.error('[Database] createSession error:', err);
    }
  }

  memSessions.set(token, session);
  return session;
}

export async function findSessionByToken(token: string): Promise<DbSession | null> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error('[Database] findSessionByToken error:', err);
    }
  }

  const s = memSessions.get(token);
  if (s && new Date(s.expires_at).getTime() > Date.now()) {
    return s;
  }
  return null;
}

export async function deleteSession(token: string): Promise<void> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
    } catch (err) {
      console.error('[Database] deleteSession error:', err);
    }
  }
  memSessions.delete(token);
}

// ==========================================
// CONTACT REPOSITORY
// ==========================================
export async function saveContactMessage(msg: Omit<DbContactMessage, 'created_at'>): Promise<DbContactMessage> {
  const now = new Date().toISOString();
  const newMsg: DbContactMessage = {
    ...msg,
    created_at: now,
  };

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO contact_messages (id, name, email, subject, message, status, delivery_status, error_details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [newMsg.id, newMsg.name, newMsg.email, newMsg.subject, newMsg.message, newMsg.status, newMsg.delivery_status, newMsg.error_details || null, now]
      );
    } catch (err) {
      console.error('[Database] saveContactMessage error:', err);
    }
  }

  memContacts.unshift(newMsg);
  return newMsg;
}

export async function getContactMessages(): Promise<DbContactMessage[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 100');
      return res.rows;
    } catch (err) {
      console.error('[Database] getContactMessages error:', err);
    }
  }
  return [...memContacts];
}

export async function updateContactDeliveryStatus(
  id: string,
  deliveryStatus: 'pending' | 'sent' | 'failed',
  errorDetails?: string
): Promise<void> {
  if (pool && isConnected) {
    try {
      await pool.query(
        'UPDATE contact_messages SET delivery_status = $1, error_details = $2 WHERE id = $3',
        [deliveryStatus, errorDetails || null, id]
      );
    } catch (err) {
      console.error('[Database] updateContactDeliveryStatus error:', err);
    }
  }

  const item = memContacts.find((c) => c.id === id);
  if (item) {
    item.delivery_status = deliveryStatus;
    if (errorDetails) item.error_details = errorDetails;
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM contact_messages WHERE id = $1', [id]);
    } catch (err) {
      console.error('[Database] deleteContactMessage error:', err);
    }
  }
  const idx = memContacts.findIndex((c) => c.id === id);
  if (idx !== -1) memContacts.splice(idx, 1);
}

// ==========================================
// BLOG REPOSITORY
// ==========================================
export async function getBlogPosts(): Promise<DbBlogPost[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM blog_posts ORDER BY published_at DESC, created_at DESC');
      if (res.rows.length > 0) return res.rows;
    } catch (err) {
      console.error('[Database] getBlogPosts error:', err);
    }
  }
  return [...memBlogPosts];
}

export async function getBlogPostBySlug(slug: string): Promise<DbBlogPost | null> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
      if (res.rows.length > 0) return res.rows[0];
    } catch (err) {
      console.error('[Database] getBlogPostBySlug error:', err);
    }
  }
  return memBlogPosts.find((p) => p.slug === slug) || null;
}

export async function createBlogPost(post: Omit<DbBlogPost, 'created_at'>): Promise<DbBlogPost> {
  const now = new Date().toISOString();
  const newPost: DbBlogPost = {
    ...post,
    created_at: now,
  };

  if (pool && isConnected) {
    try {
      await pool.query(
        `INSERT INTO blog_posts (id, slug, title, excerpt, content, category, author, read_time, tags, published_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [newPost.id, newPost.slug, newPost.title, newPost.excerpt, newPost.content, newPost.category, newPost.author, newPost.read_time, newPost.tags, newPost.published_at, now]
      );
    } catch (err) {
      console.error('[Database] createBlogPost error:', err);
    }
  }

  memBlogPosts.unshift(newPost);
  return newPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  if (pool && isConnected) {
    try {
      await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    } catch (err) {
      console.error('[Database] deleteBlogPost error:', err);
    }
  }
  const idx = memBlogPosts.findIndex((p) => p.id === id);
  if (idx !== -1) memBlogPosts.splice(idx, 1);
}

// ==========================================
// TOOL USAGE & ANALYTICS
// ==========================================
export async function recordToolUsage(
  toolId: string,
  toolName: string,
  category: string,
  userId?: string,
  ipHash?: string
): Promise<void> {
  const now = new Date().toISOString();

  if (pool && isConnected) {
    try {
      const id = `use_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
      await pool.query(
        'INSERT INTO tool_usage (id, tool_id, tool_name, category, user_id, ip_hash, used_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [id, toolId, toolName, category, userId || null, ipHash || null, now]
      );
    } catch (err) {
      console.error('[Database] recordToolUsage error:', err);
    }
  }

  const existing = memToolStats.get(toolId);
  if (existing) {
    existing.count++;
    existing.lastUsed = now;
  } else {
    memToolStats.set(toolId, {
      toolId,
      name: toolName,
      category,
      count: 1,
      lastUsed: now,
    });
  }
}

export async function getToolStatsList(): Promise<DbToolStat[]> {
  if (pool && isConnected) {
    try {
      const res = await pool.query(
        `SELECT tool_id as "toolId", tool_name as name, category, COUNT(*) as count, MAX(used_at) as "lastUsed"
         FROM tool_usage
         GROUP BY tool_id, tool_name, category
         ORDER BY count DESC`
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          toolId: r.toolId,
          name: r.name || r.toolId,
          category: r.category || 'General',
          count: parseInt(r.count, 10),
          lastUsed: r.lastUsed,
        }));
      }
    } catch (err) {
      console.error('[Database] getToolStatsList error:', err);
    }
  }
  return Array.from(memToolStats.values()).sort((a, b) => b.count - a.count);
}

export async function getTotalExecutionsCount(): Promise<number> {
  if (pool && isConnected) {
    try {
      const res = await pool.query('SELECT COUNT(*) as cnt FROM tool_usage');
      return parseInt(res.rows[0].cnt, 10);
    } catch (err) {
      console.error('[Database] getTotalExecutionsCount error:', err);
    }
  }
  let sum = 0;
  for (const s of memToolStats.values()) {
    sum += s.count;
  }
  return sum;
}
