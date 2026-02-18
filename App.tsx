import React, { useState, useCallback } from 'react';
import { Search, Github, Loader2, Sparkles, FolderKanban, PenTool, MessageSquare } from 'lucide-react';
import { GithubUser, GithubRepo } from './types';
import { fetchGithubUser, fetchGithubRepos, extractUsername } from './services/githubService';
import { generateRepoRationale, generateRepoThumbnail } from './services/geminiService';
import { ProfileHeader } from './components/ProfileHeader';
import { RepoCard } from './components/RepoCard';
import { NostrTab } from './components/NostrTab';
import { WritingsTab } from './components/WritingsTab';

// Default NPub from env or fallback to test provided one
const DEFAULT_NPUB = (typeof process !== 'undefined' && process.env.NOSTR_NPUB) || 'npub1teprpsvpu8px6vqg4f4d7v5wz968yxkpw0yyr0q52m09ng48p2fq0h53xe';

type Tab = 'projects' | 'nostr' | 'writings';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<GithubUser | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loading, setLoading] = useState(typeof process !== 'undefined' && !!process.env.GITHUB_USERNAME);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [isDefaultUser, setIsDefaultUser] = useState(typeof process !== 'undefined' && !!process.env.GITHUB_USERNAME);
  const [adminUser, setAdminUser] = useState<any>(null);

  // Check auth on mount
  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setAdminUser(data.user);
        }
      })
      .catch(err => console.error('Auth check failed', err));
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setAdminUser(null);
    window.location.reload();
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setUser(null);
    setRepos([]);

    const cleanUsername = extractUsername(query);
    setUsername(cleanUsername);

    try {
      const [userData, reposData] = await Promise.all([
        fetchGithubUser(cleanUsername),
        fetchGithubRepos(cleanUsername)
      ]);

      setUser(userData);
      setRepos(reposData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handlers
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Auto-load if environment variable is set
  React.useEffect(() => {
    const envUser = typeof process !== 'undefined' ? process.env.GITHUB_USERNAME : null;
    // Only trigger if we have an envUser and haven't loaded a user/repos yet, and aren't currently loading
    if (envUser && !user && repos.length === 0 && !loading) {
      setIsDefaultUser(true);
      performSearch(envUser);
    }
  }, [performSearch, user, repos.length, loading]);

  const updateRepoState = useCallback((repoId: number, updates: Partial<GithubRepo>) => {
    setRepos(prev => prev.map(r => r.id === repoId ? { ...r, ...updates } : r));
  }, []);

  const handleGenerateRationale = async (repoId: number) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;

    updateRepoState(repoId, { isAiLoading: true });

    const { rationale, model } = await generateRepoRationale(repo);

    updateRepoState(repoId, {
      isAiLoading: false,
      aiRationale: rationale,
      aiRationaleModel: model
    });
  };

  const handleGenerateThumbnail = async (repoId: number) => {
    const repo = repos.find(r => r.id === repoId);
    if (!repo) return;

    updateRepoState(repoId, { isAiLoading: true });

    const { imageUrl, model } = await generateRepoThumbnail(repo);

    updateRepoState(repoId, {
      isAiLoading: false,
      aiThumbnailUrl: imageUrl || undefined,
      aiThumbnailModel: model
    });
  };

  // Landing Page
  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-xl mb-4">
              <Github className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 tracking-tight">
              GitFolio AI
            </h1>
            <p className="text-gray-400 text-lg">
              Turn any GitHub profile into a stunning portfolio with Gemini AI.
            </p>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-lg backdrop-blur-sm"
              placeholder="Enter GitHub username or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 rounded-lg font-medium transition-all shadow-lg shadow-cyan-500/20"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="text-xs text-gray-500 pt-8">
            Powered by Gemini 2.5 & 3.0 • React • Tailwind
          </div>
        </div>
      </div>
    );
  }

  // Main App View
  return (
    <div className="min-h-screen bg-slate-900 pb-20">
      {/* Navbar / Search Bar minimized */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => { setUser(null); setRepos([]); setSearchQuery(''); }}
          >
            <Github size={24} />
            <span className="hidden sm:inline">GitFolio AI</span>
          </div>

          {!isDefaultUser && (
            <form onSubmit={handleSearch} className="relative w-full max-w-md ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Search another user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          )}

          <div className="flex items-center gap-4 ml-4">
            {adminUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-emerald-400">Admin</span>
                  <span className="text-[10px] text-gray-500">{adminUser.login}</span>
                </div>
                <img src={adminUser.avatar} alt="Admin" className="w-8 h-8 rounded-full border border-emerald-500/50" />
                <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-white transition-colors">Logout</button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition-all border border-slate-700"
              >
                <Github size={14} />
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[80vh] flex flex-col items-center justify-center text-cyan-400 gap-4">
          <Loader2 className="w-12 h-12 animate-spin" />
          <span className="text-lg font-medium animate-pulse">Scanning GitHub Universe...</span>
        </div>
      ) : (
        <>
          {/* Profile Header */}
          {user && <ProfileHeader user={user} repos={repos} />}

          {/* Tab Navigation */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-6 mb-8 border-b border-gray-800 overflow-x-auto">
              <button
                onClick={() => setActiveTab('projects')}
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
                onClick={() => setActiveTab('nostr')}
                className={`flex items-center gap-2 pb-3 px-1 transition-all duration-300 whitespace-nowrap ${activeTab === 'nostr'
                  ? 'text-violet-400 border-b-2 border-violet-400 font-medium'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <MessageSquare size={18} />
                Nostr
              </button>

              <button
                onClick={() => setActiveTab('writings')}
                className={`flex items-center gap-2 pb-3 px-1 transition-all duration-300 whitespace-nowrap ${activeTab === 'writings'
                  ? 'text-emerald-400 border-b-2 border-emerald-400 font-medium'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                <PenTool size={18} />
                Writings
              </button>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'projects' && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      Repositories
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Sparkles size={12} className="text-violet-400" />
                      <span>AI features enabled</span>
                    </div>
                  </div>

                  {repos.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                      This user doesn't have any public repositories yet.
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
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    Nostr Notes
                  </h2>
                  <NostrTab npub={DEFAULT_NPUB} />
                </div>
              )}

              {activeTab === 'writings' && (
                <div className="animate-fade-in">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                    Long-form Articles
                  </h2>
                  <WritingsTab isAdmin={!!adminUser?.isAdmin} />
                </div>
              )}
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default App;