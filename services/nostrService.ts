import { nip19 } from 'nostr-tools';
import { NostrNote } from '../types';

// Default relays to try
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band'
];

export const fetchNostrNotes = async (npub: string): Promise<NostrNote[]> => {
  let hexPubkey: string;

  try {
    const { type, data } = nip19.decode(npub);
    if (type !== 'npub') {
      throw new Error('Invalid npub');
    }
    hexPubkey = data as string;
  } catch (error) {
    console.error('Error decoding npub:', error);
    return [];
  }

  // Simple one-off fetch using WebSocket for minimal overhead without complex Pool logic
  // in a simple browser environment.
  const fetchFromRelay = (relayUrl: string): Promise<any[]> => {
    return new Promise((resolve) => {
      const ws = new WebSocket(relayUrl);
      const notes: any[] = [];
      const timeout = setTimeout(() => {
        ws.close();
        resolve(notes);
      }, 3000); // 3 second timeout per relay

      ws.onopen = () => {
        // Request Text Notes (Kind 1) for the specific author, limit 20
        const req = [
          "REQ", 
          "my-sub", 
          { 
            kinds: [1], 
            authors: [hexPubkey], 
            limit: 20 
          }
        ];
        ws.send(JSON.stringify(req));
      };

      ws.onmessage = (event) => {
        try {
          const [type, subId, data] = JSON.parse(event.data);
          if (type === 'EVENT' && subId === 'my-sub') {
            notes.push(data);
          }
          if (type === 'EOSE') {
            ws.close();
            clearTimeout(timeout);
            resolve(notes);
          }
        } catch (e) {
          // ignore parsing errors
        }
      };

      ws.onerror = () => {
        resolve(notes); // Resolve with whatever we have
      };
    });
  };

  // Try relays concurrently
  const results = await Promise.all(RELAYS.map(relay => fetchFromRelay(relay)));
  
  // Flatten and deduplicate by ID
  const allNotes = results.flat();
  const uniqueNotesMap = new Map();
  
  allNotes.forEach(note => {
    if (!uniqueNotesMap.has(note.id)) {
      uniqueNotesMap.set(note.id, note);
    }
  });

  const uniqueNotes: NostrNote[] = Array.from(uniqueNotesMap.values());

  // Sort by created_at desc
  return uniqueNotes.sort((a, b) => b.created_at - a.created_at);
};