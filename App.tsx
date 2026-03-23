import React, { useState, useCallback, useEffect } from 'react';
import { Github, Loader2, Sparkles, FolderKanban, PenTool, MessageSquare } from 'lucide-react';
import { GithubUser, GithubRepo } from './types.js';
import { fetchGithubUser, fetchGithubRepos } from './services/githubService.js';
import { generateRepoRationale, generateRepoThumbnail } from './services/geminiService.js';
import { ProfileHeader } from './components/ProfileHeader.js';
import { RepoCard } from './components/RepoCard.js';
import { NostrTab } from './components/NostrTab.js';
import { WritingsTab } from './components/WritingsTab.js';

// Default NPub from env
const DEFAULT_NPUB = process.env.NOSTR_NPUB || 'npub1teprpsvpu8px6vqg4f4d7v5wz968yxkpw0yyr0q52m09ng48p2fq0h53xe';
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || '';
const AI_ENABLED = !!process.env.GEMINI_API_KEY;

type Tab = 'projects' | 'nostr' | 'writings';

// Simple hash-based router
const useHash = () => {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
};

// ─── Admin Login Page ────────────────────────────────────────────────────────
const AdminLoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

    <div className="max-w-sm w-full text-center space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-xl mb-2">
          <Github className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Admin Access</h1>
        <p className="text-gray-400 text-sm">
          Sign in with GitHub to manage your portfolio.
        </p>
      </div>

      <button
        onClick={onLogin}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-white/10"
      >
        <Github size={20} />
        Continue with GitHub
      </button>

      <a
        href="/"
        onClick={(e) => { e.preventDefault(); window.location.hash = ''; }}
        className="block text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        ← Back to portfolio
      </a>
    </div>
  </div>
);

// ─── Not Configured Page ─────────────────────────────────────────────────────
const NotConfiguredPage: React.FC = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
    <Github className="w-12 h-12 text-gray-600 mb-4" />
    <h1 className="text-2xl font-bold text-white mb-2">Not Configured</h1>
    <p className="text-gray-400 max-w-sm">
      Set the <code className="text-cyan-400 bg-slate-800 px-1 rounded">GITHUB_USERNAME</code> environment variable and redeploy to show your portfolio.
    </p>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const hash = useHash();
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const defaultHash = window.location.hash;
    if (defaultHash.startsWith('#writings')) return 'writings';
    if (defaultHash.startsWith('#nostr')) return 'nostr';
    return 'projects';
  });
  const [adminUser, setAdminUser] = useState<any>(null);

  // Sync tab clicks to hash
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
  };

  useEffect(() => {
    if (hash.startsWith('#writings')) setActiveTab('writings');
    else if (hash.startsWith('#nostr')) setActiveTab('nostr');
    else if (hash === '#projects' || hash === '') setActiveTab('projects');
  }, [hash]);

  // Check auth session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => { if (data.authenticated) setAdminUser(data.user); })
      .catch(() => { /* silent fail */ });
  }, []);

  const handleLogin = () => { window.location.href = '/api/auth/login'; };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAdminUser(null);
    window.location.reload();
  };

  const loadProfile = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);
    try {
      const [userData, reposData] = await Promise.all([
        fetchGithubUser(username),
        fetchGithubRepos(username)
      ]);
      setUser(userData);
      setRepos(reposData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profile on mount from env
  useEffect(() => {
    if (GITHUB_USERNAME) loadProfile(GITHUB_USERNAME);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRepoState = useCallback((repoId: number, updates: Partial<GithubRepo>) => {
    setRepos(prev => prev.map(r => r.id === repoId ? { ...r, ...updates } : r));
  }, []);

  const handleGenerateRationale = async (repoId: number) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;
    updateRepoState(repoId, { isAiLoading: true });
    const { rationale, model } = await generateRepoRationale(repo);
    updateRepoState(repoId, { isAiLoading: false, aiRationale: rationale, aiRationaleModel: model });
  };

  const handleGenerateThumbnail = async (repoId: number) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;
    updateRepoState(repoId, { isAiLoading: true });
    const { imageUrl, model } = await generateRepoThumbnail(repo);
    updateRepoState(repoId, { isAiLoading: false, aiThumbnailUrl: imageUrl || undefined, aiThumbnailModel: model });
  };

  // ── Route: #admin ──
  if (hash === '#admin') {
    if (adminUser) {
      // Already logged in — redirect to home
      window.location.hash = '';
      return null;
    }
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  // ── Route: not configured ──
  if (!GITHUB_USERNAME) return <NotConfiguredPage />;

  // ── Loading / Error state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-cyan-400">
        <Loader2 className="w-12 h-12 animate-spin" />
        <span className="text-lg font-medium animate-pulse">Loading portfolio...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-red-400 p-4 text-center">
        <Github className="w-12 h-12" />
        <p className="font-medium">{error}</p>
        <button onClick={() => loadProfile(GITHUB_USERNAME)} className="text-sm text-gray-400 hover:text-white underline">
          Try again
        </button>
      </div>
    );
  }

  // ── Main Portfolio View ──
  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Navbar */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white">
            <Github size={24} />
            <span className="hidden sm:inline">GitFolio AI</span>
          </div>

          <div className="flex items-center gap-4">
            {adminUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-emerald-400">Admin</span>
                  <span className="text-[10px] text-gray-500">{adminUser.login}</span>
                </div>
                <img src={adminUser.avatar} alt="Admin" className="w-8 h-8 rounded-full border border-emerald-500/50" />
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white transition-colors">
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Profile Header */}
      {user && <ProfileHeader user={user} repos={repos} />}

      {/* Tab Navigation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 mb-8 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => switchTab('projects')}
            className={`flex items-center gap-2 pb-3 px-1 transition-all duration-300 whitespace-nowrap ${activeTab === 'projects'
              ? 'text-cyan-400 border-b-2 border-cyan-400 font-medium'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <FolderKanban size={18} />
            Projects
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full ml-1">
              {repos.length}
            </span>
          </button>

          <button
            onClick={() => switchTab('nostr')}
            className={`flex items-center gap-2 pb-3 px-1 transition-all duration-300 whitespace-nowrap ${activeTab === 'nostr'
              ? 'text-violet-400 border-b-2 border-violet-400 font-medium'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <MessageSquare size={18} />
            Nostr
          </button>

          <button
            onClick={() => switchTab('writings')}
            className={`flex items-center gap-2 pb-3 px-1 transition-all duration-300 whitespace-nowrap ${activeTab === 'writings'
              ? 'text-emerald-400 border-b-2 border-emerald-400 font-medium'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            <PenTool size={18} />
            Digital Garden
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'projects' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Repositories
                </h2>
                {AI_ENABLED && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Sparkles size={12} className="text-violet-400" />
                    <span>AI features enabled</span>
                  </div>
                )}
              </div>

              {repos.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No public repositories found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
                  {repos.map(repo => (
                    <RepoCard
                      key={repo.id}
                      repo={repo}
                      onGenerateRationale={handleGenerateRationale}
                      onGenerateThumbnail={handleGenerateThumbnail}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'nostr' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                Nostr Notes
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
                Nostr is a non-censorship, sovereign, and open way to publish and maintain a network. There are no platforms, only protocols, ensuring freedom of speech and data ownership.
              </p>
              <NostrTab npub={DEFAULT_NPUB} />
            </div>
          )}

          {activeTab === 'writings' && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                Digital Garden
              </h2>
              <p className="text-gray-400 text-sm mb-6 max-w-3xl leading-relaxed">
                A digital garden is an evolving space where ideas are planted, cultivated, and grown over time. It's a collection of notes, drafts, and thoughts in various stages of refinement. For more long form finished text, we refer to <a href="https://dleston.substack.com/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">https://dleston.substack.com/</a>.
              </p>
              <WritingsTab isAdmin={!!adminUser?.isAdmin} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;