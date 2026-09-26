# UTILEX — Smart Tools. Simple Solutions.

> **Founder:** Daniyal  
> **Contact Email:** utilex10@gmail.com  
> **Product:** UTILEX — All-in-One Online Tools Platform  
> **Production Architecture:** Full-Stack Node.js (Express + TypeScript) + React 19 SPA + PostgreSQL / Supabase + Gemini 3.8 Flash + Nodemailer

UTILEX is a modern, production-grade utility platform featuring **60+ tools** spanning PDF manipulation, image optimization, text editing, developer encoding, Google Gemini 3.8 Flash AI assistants, calculators, converters, and productivity workflows.

---

## 🚀 Architectural Overview

1. **Client-Side Processing (52 Tools)**:
   - PDF merging, splitting, rotation, extraction, image compression, resizing, cropping, EXIF viewer/remover, developer encoders, converters, and calculators operate 100% in-browser using WebAssembly, `pdf-lib`, and HTML5 Canvas.
   - User files and data never touch remote disks or cloud buckets.

2. **Server-Side API & AI Services (10 Tools + Core Services)**:
   - UTILEX AI Chat and 9 AI utility tools route through secure Node.js proxy endpoints (`/api/ai/*`) using `@google/genai` with model `gemini-3.8-flash`.
   - `GEMINI_API_KEY` is kept server-side and never exposed to browser bundles.
   - Centralized platform context (Website, Founder Daniyal, dynamic registry of 60+ tools) is injected server-side.

3. **Database Architecture**:
   - Production PostgreSQL / Supabase adapter with automatic schema bootstrapping (`server/db/schema.sql`).
   - Supports Users, Sessions, Favorites, Recent Tools, AI Conversations, Messages, Blog Posts, Contact Messages, and Tool Usage Analytics.
   - Graceful fallback: If `DATABASE_URL` is omitted in local development, UTILEX starts cleanly with an in-memory/file resilient adapter.

4. **Transactional Email Service**:
   - Contact form submissions are dispatched server-side to `CONTACT_RECEIVER_EMAIL` via `nodemailer`.
   - Complete delivery status tracking (`pending`, `sent`, `failed`) stored with each message in the database.
   - SMTP credentials remain server-side.

---

## 🛠 Complete Deployment Guide

### 1. GitHub Repository Setup
```bash
# Initialize local Git repository (if not already done)
git init
git add .
git commit -m "feat: production hardened release of UTILEX"

# Create a new repository on GitHub (e.g. 'utilex')
# Link and push your main branch:
git remote add origin https://github.com/<YOUR-USERNAME>/utilex.git
git branch -M main
git push -u origin main
```

**Files Committed to Git:**
- Source files: `src/`, `server.ts`, `server/`, `index.html`, `vite.config.ts`, `tsconfig.json`
- Config & Documentation: `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `README.md`, `metadata.json`

**Files NEVER Committed to Git:**
- Real `.env`, `.env.local`, `.env.production`
- `node_modules/`
- Production bundles (`dist/`, `build/`)
- Log files (`*.log`) or private keys (`*.pem`, `*.key`)

---

### 2. PostgreSQL / Supabase Setup
UTILEX is compatible with Supabase, Neon, AWS RDS, Render PostgreSQL, Railway, or standard PostgreSQL 14+:

1. Create a new PostgreSQL project on [Supabase](https://supabase.com) (or Neon/Render).
2. Retrieve your connection string from the database settings:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
3. Set this connection string as `DATABASE_URL` in your deployment environment variables.
4. **Automated Migration**: Upon startup, UTILEX automatically checks the database connection and runs `server/db/schema.sql` to initialize all 11 tables and indexes. You do not need to manually run SQL scripts.
5. If you prefer to manually run the migration in Supabase SQL Editor, simply paste and run the contents of `server/db/schema.sql`.

---

### 3. Backend & Full-Stack Deployment (Recommended)

> **Important Note:** Static hosting providers like GitHub Pages **CANNOT** run the Node.js backend. While the 52 client-side tools would work on static hosting, the 10 Gemini AI utilities, contact form email delivery, and administrator authentication require the Node.js Express server.
> 
> **Recommended Platforms:** Render, Railway, Google Cloud Run, AWS App Runner, Fly.io, or any Ubuntu/Debian VPS.

#### Deploying on Render / Railway:
1. Connect your GitHub repository to Render or Railway.
2. Select **Web Service** (Node.js runtime).
3. Set the build command:
   ```bash
   npm run build
   ```
4. Set the start command:
   ```bash
   npm run start
   ```
5. Add the required Environment Variables in the service settings dashboard (see section 5).

---

### 4. Separate Frontend Deployment (Optional)
If you deploy the frontend (Vite static build) separately (e.g., Vercel, Netlify, Cloudflare Pages):
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure your API rewrite/proxy in `vercel.json` or `_redirects` to route `/api/*` requests to your deployed Node.js backend URL.

---

### 5. Environment Variables Specification

Configure the following variables in your hosting provider's dashboard:

| Variable | Required | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | Server environment | `production` |
| `PORT` | Auto | Server port (auto-set by cloud host) | `3000` |
| `APP_URL` | Yes | Canonical public URL | `https://utilex.com` |
| `DATABASE_URL` | Recommended | PostgreSQL connection string | `postgresql://postgres:...@...supabase.co:5432/postgres` |
| `SESSION_SECRET` | Yes | Cryptographic secret for auth tokens | `c2a8f8e0d9b4c3...` |
| `GEMINI_API_KEY` | For AI | Google Gemini API key (AI chat & utilities) | `AIzaSy...` |
| `CONTACT_RECEIVER_EMAIL`| Yes | Destination inbox for contact inquiries | `utilex10@gmail.com` |
| `SMTP_HOST` | For Email | Transactional SMTP server hostname | `smtp.sendgrid.net` |
| `SMTP_PORT` | For Email | SMTP server port | `587` |
| `SMTP_USER` | For Email | SMTP account username | `apikey` |
| `SMTP_PASSWORD` | For Email | SMTP account password / API key | `SG.xxxxxxxx...` |
| `SMTP_FROM` | Optional | Outgoing sender header | `"UTILEX Notifications <utilex10@gmail.com>"` |

---

### 6. Google Gemini API Configuration
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set `GEMINI_API_KEY` in your production environment variables.
3. UTILEX AI is powered by `gemini-3.8-flash` via the `@google/genai` TypeScript SDK.
4. When `GEMINI_API_KEY` is missing or invalid, UTILEX safely catches the error and displays a helpful configuration notice on the frontend without crashing.

---

### 7. Transactional Email Configuration
1. Create an account with an SMTP/transactional email provider:
   - **SendGrid**, **Resend**, **Brevo**, **Amazon SES**, or **Postmark**.
2. Generate an SMTP API Key.
3. Fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `CONTACT_RECEIVER_EMAIL`.
4. When visitors submit the Contact Us form, an email with inquiry details, visitor email, and reference ID is delivered to `CONTACT_RECEIVER_EMAIL`. Delivery status is persisted in the database (`pending`, `sent`, `failed`).

---

### 8. Production Verification Commands

Run locally to verify production readiness before pushing:

```bash
# 1. Verify TypeScript types and linter
npm run lint

# 2. Build production assets
npm run build

# 3. Test production start with custom port
PORT=3456 NODE_ENV=production npm run start
```

---

### 9. Health-Check Endpoint
Verify service availability:
```bash
curl -s http://localhost:3000/api/health
```

**Expected JSON Response:**
```json
{
  "success": true,
  "service": "UTILEX"
}
```

---

### 10. Default Administrator Credentials
- **Email:** `admin@utilex.com`
- **Password:** `utilexAdmin2026!`
- **Access Route:** `/admin` (or click user avatar -> Admin Console after signing in).
- **Security:** Protected server-side by role-based access control (RBAC). Non-admin sessions are rejected with HTTP 403.
