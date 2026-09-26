import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  initDatabase,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
  updateUserProfile,
  countUsers,
  createSession,
  findSessionByToken,
  deleteSession,
  saveContactMessage,
  getContactMessages,
  updateContactDeliveryStatus,
  deleteContactMessage,
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  deleteBlogPost,
  recordToolUsage,
  getToolStatsList,
  getTotalExecutionsCount,
  isDatabaseConnected,
  DbUser,
} from './server/db/db';
import { sendContactNotificationEmail } from './server/email/mailer';
import { TOOLS } from './src/data/toolsRegistry';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware for parsing JSON with a 15MB limit for text & data
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory reset tokens for password recovery
const resetTokens: Map<string, { email: string; expiresAt: number }> = new Map();
let totalAiRequests = 0;

// Simple IP-based rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= limit) {
      res.status(429).json({
        success: false,
        error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again shortly.' },
      });
      return;
    }
    entry.count++;
    next();
  };
}

// Authentication Helpers
async function getAuthUser(req: Request): Promise<DbUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  if (!token) return null;
  const session = await findSessionByToken(token);
  if (!session) return null;
  return await findUserById(session.user_id);
}

async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required to access administrator endpoints.' },
    });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied: Administrator privileges required.' },
    });
    return;
  }
  (req as any).user = user;
  next();
}

// Dynamic tools registry context for Gemini AI
const toolsListSummary = TOOLS.map((t) => `- ${t.name} (${t.categoryName}): ${t.shortDescription}`).join('\n');

const UTILEX_CENTRALIZED_CONTEXT = `You are UTILEX AI, an intelligent, concise, and helpful assistant for the UTILEX platform.
Platform Identity:
- Website: UTILEX
- Founder: Daniyal (Primary Contact: utilex10@gmail.com)
- Purpose: All-in-one online utility platform
- Client-Side Privacy: Most utilities (PDF tools, image manipulation, text tools, converters, calculators) process files and data 100% locally in the browser memory using WebAssembly, HTML5 Canvas, and client-side cryptography. Zero user files are stored on remote servers.

Available UTILEX Tools (${TOOLS.length} total):
${toolsListSummary}

Strict Directive:
- Do not invent information about Daniyal or UTILEX. Founder Daniyal can be reached at utilex10@gmail.com.
- Always provide clean Markdown formatting with clear code blocks or bullet points.
- If asked about available tools, refer directly to the real UTILEX tools listed above.`;

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Health check (Strict format without exposing secrets)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    service: 'UTILEX',
  });
});

// 2. Config & System Status check (Safe non-confidential flags)
app.get('/api/config/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
      targetModel: 'gemini-3.8-flash',
      databaseConfigured: Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''),
      databaseConnected: isDatabaseConnected(),
      smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
      contactReceiverConfigured: true,
      contactReceiverEmail: process.env.CONTACT_RECEIVER_EMAIL || 'utilex10@gmail.com',
    },
  });
});

// 3. Tool Execution telemetry endpoint
app.post('/api/tool/execute', async (req: Request, res: Response) => {
  const { toolId, toolName, category } = req.body;
  if (!toolId) {
    res.status(400).json({ success: false, error: { message: 'toolId is required.' } });
    return;
  }
  const user = await getAuthUser(req);
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

  await recordToolUsage(toolId, toolName || toolId, category || 'General', user?.id, ipHash);
  res.json({ success: true, message: 'Execution recorded' });
});

// 4. Authentication Endpoints (Persistent Database Backed)
app.post('/api/auth/register', rateLimiter(10, 60000), async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ success: false, error: { message: 'Name, email, and password are required.' } });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ success: false, error: { message: 'Password must be at least 6 characters.' } });
    return;
  }
  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await findUserByEmail(cleanEmail);
  if (existingUser) {
    res.status(409).json({ success: false, error: { message: 'An account with this email already exists.' } });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newUser = await createUser({
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    password_hash: passwordHash,
    salt,
    role: 'user',
  });

  const token = crypto.randomBytes(32).toString('hex');
  await createSession(newUser.id, token);

  res.json({
    success: true,
    data: {
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    },
  });
});

app.post('/api/auth/login', rateLimiter(15, 60000), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: { message: 'Email and password required.' } });
    return;
  }
  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);
  if (!user) {
    res.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
    return;
  }

  const testHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
  if (testHash !== user.password_hash) {
    res.status(401).json({ success: false, error: { message: 'Invalid email or password.' } });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  await createSession(user.id, token);

  res.json({
    success: true,
    data: {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    },
  });
});

app.get('/api/auth/me', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.created_at },
    },
  });
});

app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    await deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/auth/forgot-password', rateLimiter(5, 60000), async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ success: false, error: { message: 'Valid email is required.' } });
    return;
  }
  const cleanEmail = email.toLowerCase().trim();
  const user = await findUserByEmail(cleanEmail);
  if (!user) {
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
    });
    return;
  }
  const resetToken = crypto.randomBytes(24).toString('hex');
  resetTokens.set(resetToken, { email: cleanEmail, expiresAt: Date.now() + 3600000 });

  res.json({
    success: true,
    message: 'Password reset token generated.',
    data: { resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined },
  });
});

app.post('/api/auth/reset-password', rateLimiter(5, 60000), async (req: Request, res: Response) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword || newPassword.length < 6) {
    res.status(400).json({ success: false, error: { message: 'Valid token and minimum 6 character password required.' } });
    return;
  }
  const entry = resetTokens.get(resetToken);
  if (!entry || Date.now() > entry.expiresAt) {
    res.status(400).json({ success: false, error: { message: 'Invalid or expired password reset token.' } });
    return;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex');
  await updateUserPassword(entry.email, passwordHash, salt);
  resetTokens.delete(resetToken);

  res.json({ success: true, message: 'Password has been reset successfully. You may now sign in.' });
});

app.put('/api/auth/profile', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
    return;
  }
  const { name } = req.body;
  if (name && typeof name === 'string' && name.trim().length > 0) {
    const updated = await updateUserProfile(user.id, name.trim());
    if (updated) {
      res.json({ success: true, data: { user: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } } });
      return;
    }
  }
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role } } });
});

// 5. Contact Form API (with actual server-side email dispatch & status tracking)
app.post('/api/contact', rateLimiter(5, 60000), async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ success: false, error: { message: 'Name, email, and message are required.' } });
    return;
  }
  if (!email.includes('@') || message.length < 5) {
    res.status(400).json({ success: false, error: { message: 'Please provide a valid email and detailed message.' } });
    return;
  }

  const messageId = `msg_${Date.now()}`;
  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanSubject = subject ? subject.trim() : 'General Inquiry';
  const cleanMessage = message.trim();

  // 1. Save to database with initial status
  await saveContactMessage({
    id: messageId,
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    status: 'new',
    delivery_status: 'pending',
  });

  // 2. Dispatch server-side transactional email
  const emailResult = await sendContactNotificationEmail({
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    messageId,
  });

  // 3. Update database record with final delivery status
  await updateContactDeliveryStatus(messageId, emailResult.deliveryStatus, emailResult.error);

  res.json({
    success: true,
    message: 'Message sent successfully. Daniyal and the UTILEX team will get back to you shortly!',
    deliveryStatus: emailResult.deliveryStatus,
    contactEmail: 'utilex10@gmail.com',
  });
});

app.get('/api/admin/contacts', requireAdmin, async (_req: Request, res: Response) => {
  const messages = await getContactMessages();
  res.json({ success: true, data: messages });
});

app.delete('/api/admin/contacts/:id', requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteContactMessage(id);
  res.json({ success: true, message: 'Contact message removed.' });
});

// 6. Admin Stats API (Protected)
app.get('/api/admin/stats', async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  const totalUsers = await countUsers();
  const totalToolExecutions = await getTotalExecutionsCount();
  const toolStatsList = await getToolStatsList();
  const contactMessages = await getContactMessages();

  if (!user || user.role !== 'admin') {
    res.json({
      success: true,
      data: {
        totalUsers,
        totalToolExecutions,
        totalAiRequests,
        totalContactMessages: contactMessages.length,
        topTools: toolStatsList.slice(0, 8),
        allToolsUsage: toolStatsList,
        geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
        recentMessages: [],
      },
    });
    return;
  }

  res.json({
    success: true,
    data: {
      totalUsers,
      totalToolExecutions,
      totalAiRequests,
      totalContactMessages: contactMessages.length,
      topTools: toolStatsList.slice(0, 8),
      allToolsUsage: toolStatsList,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
      recentMessages: contactMessages.slice(0, 10),
    },
  });
});

// 7. Blog API (Public List / Single Post, Admin Create / Delete)
app.get('/api/blog', async (_req: Request, res: Response) => {
  const posts = await getBlogPosts();
  res.json({ success: true, data: posts });
});

app.get('/api/blog/:slug', async (req: Request, res: Response) => {
  const post = await getBlogPostBySlug(req.params.slug);
  if (!post) {
    res.status(404).json({ success: false, error: { message: 'Post not found' } });
    return;
  }
  res.json({ success: true, data: post });
});

app.post('/api/blog', requireAdmin, async (req: Request, res: Response) => {
  const { title, excerpt, content, category, tags } = req.body;
  if (!title || !content) {
    res.status(400).json({ success: false, error: { message: 'Title and content required.' } });
    return;
  }
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const newPost = await createBlogPost({
    id: `post_${Date.now()}`,
    slug,
    title: title.trim(),
    excerpt: excerpt || content.slice(0, 140) + '...',
    content: content.trim(),
    category: category || 'Productivity',
    tags: Array.isArray(tags) ? tags : ['Productivity'],
    author: 'Daniyal',
    read_time: `${Math.ceil(content.split(/\s+/).length / 200)} min read`,
    published_at: new Date().toISOString().split('T')[0],
  });
  res.json({ success: true, data: newPost });
});

app.delete('/api/blog/:id', requireAdmin, async (req: Request, res: Response) => {
  await deleteBlogPost(req.params.id);
  res.json({ success: true, message: 'Article deleted.' });
});

// 8. Secure Server-Side Gemini AI Endpoints
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 8a. UTILEX AI Chat endpoint
app.post('/api/ai/chat', rateLimiter(20, 60000), async (req: Request, res: Response) => {
  const { messages, systemInstruction } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ success: false, error: { message: 'Messages array is required.' } });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({
      success: false,
      error: {
        code: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini AI is not configured yet. Please configure the GEMINI_API_KEY in the environment or server settings.',
      },
    });
    return;
  }

  try {
    totalAiRequests++;
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemInstruction ? `${UTILEX_CENTRALIZED_CONTEXT}\n\n${systemInstruction}` : UTILEX_CENTRALIZED_CONTEXT,
      },
    });

    const replyText = response.text || 'I apologize, but I could not generate a response. Please try again.';
    res.json({
      success: true,
      data: {
        reply: replyText,
      },
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error?.message || 'Failed to generate response from Gemini AI.',
      },
    });
  }
});

// 8b. AI Utility Tools endpoint
app.post('/api/ai/utility', rateLimiter(25, 60000), async (req: Request, res: Response) => {
  const { toolType, input, options } = req.body;
  if (!toolType || !input) {
    res.status(400).json({ success: false, error: { message: 'toolType and input text are required.' } });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({
      success: false,
      error: {
        code: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini AI is not configured yet. Please ensure GEMINI_API_KEY is set in environment secrets.',
      },
    });
    return;
  }

  try {
    totalAiRequests++;
    let prompt = input;

    switch (toolType) {
      case 'summarizer': {
        const style = options?.style || 'bullet points';
        const length = options?.length || 'medium';
        prompt = `Please summarize the following text in ${style} format (${length} length):\n\n"""\n${input}\n"""`;
        break;
      }
      case 'paraphraser': {
        const tone = options?.tone || 'professional';
        prompt = `Paraphrase the following text into a ${tone} tone, maintaining the exact core meaning while improving clarity and vocabulary:\n\n"""\n${input}\n"""`;
        break;
      }
      case 'improver': {
        prompt = `Proofread, polish, and improve the following text. Correct grammar, enhance flow and readability, and provide both the improved version and a brief summary of key enhancements made:\n\n"""\n${input}\n"""`;
        break;
      }
      case 'email-writer': {
        const purpose = options?.purpose || 'professional follow-up';
        const recipient = options?.recipient || 'colleague or client';
        prompt = `Write a well-crafted email for ${purpose} directed to a ${recipient}. Context and key points:\n\n"""\n${input}\n"""\n\nInclude a subject line, proper greeting, concise body paragraphs, clear call to action, and professional sign-off.`;
        break;
      }
      case 'title-generator': {
        const count = options?.count || 8;
        prompt = `Generate ${count} compelling, high-converting, SEO-optimized titles/headlines based on this topic or content:\n\n"""\n${input}\n"""\n\nGroup them by style: Direct & Catchy, How-To/Guide, Question/Curiosity, and Listicle format.`;
        break;
      }
      case 'meta-description': {
        prompt = `Create 3 distinct, high-CTR SEO meta descriptions (each strictly under 155-160 characters) based on this content or target page:\n\n"""\n${input}\n"""\n\nShow the character count for each.`;
        break;
      }
      case 'faq-generator': {
        prompt = `Analyze this content and generate 5 to 7 frequently asked questions along with clear, authoritative answers. Format as Question & Answer pairs:\n\n"""\n${input}\n"""`;
        break;
      }
      case 'translator': {
        const targetLang = options?.targetLanguage || 'Spanish';
        prompt = `Translate the following text accurately into ${targetLang}. Preserve idioms, tone, formatting, and technical terminology:\n\n"""\n${input}\n"""`;
        break;
      }
      case 'analyzer': {
        prompt = `Perform comprehensive textual analysis on the text below. Include:
1. Overall Sentiment (Positive / Negative / Neutral with confidence %)
2. Writing Tone (Formal, Conversational, Technical, Academic, etc.)
3. Estimated Reading Grade Level & Readability Score
4. Key Named Entities and Main Themes
5. Executive Takeaway

Text to analyze:
"""\n${input}\n"""`;
        break;
      }
      default:
        prompt = input;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `${UTILEX_CENTRALIZED_CONTEXT}\n\nYou are a specialized AI utility engine for UTILEX. Return clean, high-quality, professional output formatted in markdown.`,
      },
    });

    res.json({
      success: true,
      data: {
        result: response.text || 'No response generated.',
      },
    });
  } catch (error: any) {
    console.error('Gemini utility error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error?.message || 'Failed to process AI utility task.',
      },
    });
  }
});

// 9. SEO Robots.txt & Sitemap.xml
app.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: https://utilex.com/sitemap.xml\n');
});

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  res.type('application/xml');
  const baseUrl = 'https://utilex.com';
  const pages = [
    '',
    '/tools',
    '/category/pdf-tools',
    '/category/image-tools',
    '/category/text-tools',
    '/category/developer-tools',
    '/category/ai-tools',
    '/category/productivity',
    '/category/calculators',
    '/category/converters',
    '/ai-chat',
    '/blog',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/cookie-policy',
    '/disclaimer',
    '/copyright',
  ];
  const urls = pages.map((p) => `
  <url>
    <loc>${baseUrl}${p}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p === '' ? '1.0' : p.startsWith('/category') ? '0.8' : '0.6'}</priority>
  </url>`).join('');

  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
});

// Server Initialization
async function start() {
  // Initialize Database connection (PostgreSQL / Supabase with graceful fallback)
  await initDatabase();

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UTILEX Server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start UTILEX server:', err);
  process.exit(1);
});
