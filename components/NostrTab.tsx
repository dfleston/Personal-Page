import React, { useEffect, useState } from 'react';
import { fetchNostrNotes } from '../services/nostrService.js';
import { NostrNote } from '../types.js';
import { Loader2, MessageSquare, Calendar, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface NostrTabProps {
  npub: string;
}

const NostrCard: React.FC<{ note: NostrNote }> = ({ note }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className={`
        bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 
        hover:bg-gray-800 hover:border-violet-500/30 transition-all duration-300 cursor-pointer
        ${expanded ? 'ring-1 ring-violet-500/50 bg-gray-800 shadow-xl shadow-violet-500/5' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2 text-violet-400">
          <MessageSquare size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Note</span>
        </div>
        <a
          href={`https://njump.me/${note.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-500 hover:text-white transition-colors p-1"
          title="View on Nostr"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      <div className={`text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-mono mb-4 transition-all ${expanded ? '' : 'line-clamp-6'}`}>
        {note.content}
      </div>

      <div className="pt-4 border-t border-gray-700/30 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar size={12} className="mr-2" />
          {new Date(note.created_at * 1000).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
          })}
        </div>

        <div className="flex items-center gap-1 text-violet-400/70">
          {expanded ? (
            <>
              <span>Show less</span>
              <ChevronUp size={14} />
            </>
          ) : (
            <>
              <span>Read more</span>
              <ChevronDown size={14} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const NostrTab: React.FC<NostrTabProps> = ({ npub }) => {
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      const data = await fetchNostrNotes(npub);
      setNotes(data);
      setLoading(false);
    };

    if (npub) {
      loadNotes();
    }
  }, [npub]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-violet-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-mono">Fetching notes from the Nostr network...</span>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p>No public notes found for this Nostr profile.</p>
        <p className="text-xs mt-2 font-mono text-gray-600">{npub}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {notes.map((note) => (
        <NostrCard key={note.id} note={note} />
      ))}
    </div>
  );
};