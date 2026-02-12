import React, { useState } from 'react';
import { GithubUser, GithubRepo } from '../types';
import { MapPin, Link as LinkIcon, Users, BookOpen, Sparkles } from 'lucide-react';
import { generateProfileSummary } from '../services/geminiService';

interface ProfileHeaderProps {
  user: GithubUser;
  repos: GithubRepo[];
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, repos }) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const handleAiAnalyze = async () => {
    setLoadingSummary(true);
    const summary = await generateProfileSummary(user.login, repos);
    setAiSummary(summary);
    setLoadingSummary(false);
  };

  return (
    <div className="w-full bg-gray-800/50 border-b border-gray-700/50 backdrop-blur-md p-6 sm:p-10 mb-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-6">
        
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur"></div>
          <img 
            src={user.avatar_url} 
            alt={user.login} 
            className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-gray-900 object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              {user.name || user.login}
              <a 
                href={user.html_url} 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                <LinkIcon size={20} />
              </a>
            </h1>
            <p className="text-gray-400 font-mono text-sm">@{user.login}</p>
          </div>

          <p className="text-gray-300 max-w-2xl leading-relaxed">
            {user.bio || "No bio available."}
          </p>
          
          {/* AI Summary Section */}
          <div className="min-h-[30px]">
             {aiSummary ? (
               <div className="text-emerald-300 font-medium animate-fade-in bg-emerald-900/20 p-3 rounded-lg border border-emerald-500/20 inline-block">
                 <span className="mr-2">✨</span>
                 {aiSummary}
               </div>
             ) : (
               <button 
                onClick={handleAiAnalyze}
                disabled={loadingSummary}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
               >
                 <Sparkles size={14} />
                 {loadingSummary ? 'Analyzing Persona...' : 'Ask AI to Analyze Profile'}
               </button>
             )}
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-400 mt-2">
            {user.location && (
              <div className="flex items-center gap-1.5">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{user.followers} followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen size={16} />
              <span>{user.public_repos} repos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};