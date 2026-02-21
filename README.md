# 🚀 GitFolio AI

**GitFolio AI** is a personal portfolio platform powered by **Google Gemini AI**. It auto-loads your GitHub profile, generates AI rationales and thumbnails for your projects, surfaces your Nostr notes, and hosts your long-form technical writings — all in one place.

> This is a **single-owner portfolio** app. The GitHub username is set via environment variable, not by visitors.

## ✨ Features

- **Auto-loaded Profile**: Your GitHub repos load automatically on visit — no search required.
- **AI Rationales**: Gemini 2.0 Flash generates technical insights per repo.
- **AI Thumbnails**: Gemini generates beautiful, context-aware project thumbnails.
- **Nostr Feed**: Pulls your latest Nostr notes directly from relays.
- **Technical Writings**: Rich notebook-style editor for long-form articles (stored in Redis).
- **Admin Auth**: Secure GitHub OAuth login — only the repo owner can create/edit articles.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS (CDN, dark mode) |
| AI | Google Gemini API |
| Social | Nostr (nostr-tools) |
| Backend | Vercel Serverless Functions |
| Database | Redis (Upstash recommended) |
| Auth | GitHub OAuth 2.0 + JWT |

---

## 🚀 Deploying to Vercel

### 1. Fork and connect

1. Fork this repo to your GitHub account.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your fork.
3. Vercel will auto-detect the Vite framework.

### 2. Set Environment Variables

In Vercel project settings → **Environment Variables**, add:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key
GITHUB_USERNAME=your_github_username

# GitHub OAuth (see below)
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
JWT_SECRET=a_long_random_string_for_signing_tokens

# Redis (see below)
REDIS_URL=rediss://default:PASSWORD@endpoint.upstash.io:6380

# Optional
NOSTR_NPUB=your_nostr_npub
```

### 3. Set up GitHub OAuth App

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Set **Homepage URL** to your Vercel deployment URL (e.g. `https://yourproject.vercel.app`).
3. Set **Authorization callback URL** to `https://yourproject.vercel.app/api/auth/callback`.
4. Copy the **Client ID** and generate a **Client Secret**.

### 4. Set up Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) → create a free Redis database.
2. On the database page, copy the **Redis URL** (starts with `rediss://`).
3. Add it to Vercel as `REDIS_URL`.

### 5. Deploy

Click **Deploy** in Vercel. Your portfolio will be live at your Vercel URL.

---

## 💻 Local Development

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/gitfolio.git
cd gitfolio
npm install
```

### 2. Create `.env.local`

```env
GEMINI_API_KEY=your_key
GITHUB_USERNAME=your_github_username
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
JWT_SECRET=any_random_string
REDIS_URL=rediss://default:PASSWORD@endpoint.upstash.io:6380
NOSTR_NPUB=your_npub
```

> For local OAuth to work, create a **separate** GitHub OAuth App with callback URL: `http://localhost:3001/api/auth/callback`

### 3. Run the dev server

```bash
npm run dev:local
```

Open [http://localhost:3001](http://localhost:3001).

### 4. Admin access (local)

Navigate to [http://localhost:3001/#admin](http://localhost:3001/#admin) to access the login page.

---

## 🛠️ Development Commands

You can run the project in two modes:

| Feature | `npm run dev` | `npm run dev:local` |
| :--- | :--- | :--- |
| **Command** | `vite` | `vercel dev` |
| **Port** | 3000 | 3001 |
| **Backend** | ❌ None (API calls 404) | ✅ Full Serverless Support |
| **Articles** | Static fallback (`data/articles.json`) | Live Redis Persistence |
| **Auth** | ❌ Disabled | ✅ GitHub OAuth enabled |

> [!TIP]
> Use `npm run dev:local` for the full experience. To sync your remote environment variables (like Redis credentials) to your local machine, run:
> ```bash
> vercel env pull .env.development.local
> ```

---

## 📁 Project Structure

```
├── api/                  # Vercel Serverless Functions
│   ├── articles.ts       # Articles CRUD (Redis)
│   └── auth/
│       ├── login.ts      # GitHub OAuth redirect
│       ├── callback.ts   # OAuth token exchange
│       ├── logout.ts     # Session clear
│       └── me.ts         # Session check
├── components/
│   ├── WritingsTab.tsx   # Article notebook editor + viewer
│   ├── NostrTab.tsx      # Nostr notes feed
│   ├── ProfileHeader.tsx # GitHub profile banner
│   └── RepoCard.tsx      # Repository card with AI features
├── services/
│   ├── geminiService.ts  # Gemini AI integration
│   ├── githubService.ts  # GitHub API with caching
│   └── articleService.ts # Articles API client
├── App.tsx               # Main app, routing, auth state
├── index.html            # Entry point
└── vercel.json           # Vercel routing + CSP headers
```

---

Built with ⚡ by [dfleston](https://github.com/dfleston)
