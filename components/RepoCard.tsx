import React from 'react';
import { GithubRepo } from '../types.js';
import { Star, GitFork, ExternalLink, Globe, Sparkles, Image as ImageIcon, Code, Cpu, Calendar } from 'lucide-react';

interface RepoCardProps {
  repo: GithubRepo;
  onGenerateRationale: (repoId: number) => void;
  onGenerateThumbnail: (repoId: number) => void;
}

export const RepoCard: React.FC<RepoCardProps> = ({ repo, onGenerateRationale, onGenerateThumbnail }) => {
  const aiEnabled = !!(typeof process !== 'undefined' && process.env.GEMINI_API_KEY);

  // Create a consistent placeholder gradient based on name
  const getGradient = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-violet-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Format creation date
  const publishDate = new Date(repo.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="group relative bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 overflow-hidden flex flex-col h-full">

      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-900">
        {repo.aiThumbnailUrl ? (
          <img
            src={repo.aiThumbnailUrl}
            alt={repo.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getGradient(repo.name)} opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center`}>
            <span className="text-4xl font-bold text-white/10 uppercase tracking-widest select-none">
              {repo.name.substring(0, 2)}
            </span>
          </div>
        )}

        {/* AI Image Gen Button (Overlay) */}
        {aiEnabled && !repo.aiThumbnailUrl && (
          <button
            onClick={() => onGenerateThumbnail(repo.id)}
            disabled={repo.isAiLoading}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
            title="Generate AI Thumbnail"
          >
            <ImageIcon size={16} className={repo.isAiLoading ? 'animate-pulse text-cyan-400' : 'text-gray-300'} />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate pr-2" title={repo.name}>
            {repo.name}
          </h3>
          <div className="flex items-center gap-3 text-gray-400">
            <div className="flex items-center gap-1 text-xs">
              <Star size={14} /> {repo.stargazers_count}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <GitFork size={14} /> {repo.forks_count}
            </div>
          </div>
        </div>

        {/* Language Badge (Prominent) */}
        {repo.language && (
          <div className="mb-3 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Code size={12} />
              {repo.language}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1">
          {repo.aiRationale ? (
            <div className="mb-4 bg-emerald-900/10 border-l-2 border-emerald-500 p-3 rounded-r-lg">
              <p className="text-sm text-emerald-200/90 italic">
                "{repo.aiRationale}"
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm line-clamp-3 mb-4 min-h-[3rem]">
              {repo.description || "No description provided by the developer."}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5" title="First Published">
              <Calendar size={12} className="text-gray-400" />
              <span>Published: {publishDate}</span>
            </div>
          </div>

          {/* Topics */}
          {repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {repo.topics.slice(0, 3).map(topic => (
                <span key={topic} className="px-2 py-1 text-xs font-medium rounded-md bg-slate-800 border border-slate-700 text-gray-400">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-4">
              <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors" title="View Source">
                <ExternalLink size={18} />
              </a>
              {repo.homepage && (
                <a href={repo.homepage} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-cyan-400 transition-colors" title="Live Demo">
                  <Globe size={18} />
                </a>
              )}
            </div>

            {aiEnabled && !repo.aiRationale && (
              <button
                onClick={() => onGenerateRationale(repo.id)}
                disabled={repo.isAiLoading}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
              >
                <Sparkles size={14} />
                {repo.isAiLoading ? 'Thinking...' : 'AI Rationale'}
              </button>
            )}
          </div>

          {/* AI Footprint */}
          {(repo.aiRationaleModel || repo.aiThumbnailModel) && (
            <div className="flex flex-col gap-1 text-[10px] text-gray-600 font-mono mt-2 pt-2 border-t border-gray-800/50">
              {repo.aiRationaleModel && (
                <div className="flex items-center gap-1">
                  <Cpu size={10} />
                  <span>Analysis: {repo.aiRationaleModel}</span>
                </div>
              )}
              {repo.aiThumbnailModel && (
                <div className="flex items-center gap-1">
                  <ImageIcon size={10} />
                  <span>Image: {repo.aiThumbnailModel}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};