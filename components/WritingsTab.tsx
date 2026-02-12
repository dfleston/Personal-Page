import React, { useEffect, useState } from 'react';
import { fetchNostrNotes } from '../services/nostrService';
import { NostrNote } from '../types';
import { Loader2, MessageSquare, Calendar, ExternalLink } from 'lucide-react';

interface WritingsTabProps {
  npub: string;
}

export const WritingsTab: React.FC<WritingsTabProps> = ({ npub }) => {
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
        <div key={note.id} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 hover:bg-gray-800 hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-2 text-violet-400">
                <MessageSquare size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Note</span>
             </div>
             <a 
               href={`https://njump.me/${note.id}`} 
               target="_blank" 
               rel="noreferrer" 
               className="text-gray-500 hover:text-white transition-colors"
               title="View on Nostr"
             >
               <ExternalLink size={16} />
             </a>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6 mb-4 font-mono">
            {note.content}
          </p>
          
          <div className="pt-4 border-t border-gray-700/30 flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-2" />
            {new Date(note.created_at * 1000).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
          </div>
        </div>
      ))}
    </div>
  );
};