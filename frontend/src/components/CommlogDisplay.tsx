"use client";

import { useEffect, useState } from 'react';
import { CommlogEntry } from '@/types';

interface CommlogDisplayProps {
  apiBaseUrl: string;
  callSummaryId: number;
}

async function fetchCommlogEntries(apiBaseUrl: string, callSummaryId: number): Promise<CommlogEntry[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/commlog/${callSummaryId}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as CommlogEntry[];
  } catch (error) {
    console.error(`Failed to fetch commlog for summary ${callSummaryId}:`, error);
    return [];
  }
}

export default function CommlogDisplay({ apiBaseUrl, callSummaryId }: CommlogDisplayProps) {
  const [entries, setEntries] = useState<CommlogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCommlog() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedEntries = await fetchCommlogEntries(apiBaseUrl, callSummaryId);
        setEntries(fetchedEntries); // Already sorted by backend (desc)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error fetching commlog");
      } finally {
        setIsLoading(false);
      }
    }
    if (callSummaryId) {
      loadCommlog();
    }
  }, [apiBaseUrl, callSummaryId]);

  if (isLoading) return <p className="text-xs text-slate-400 italic mt-2">Loading commlog...</p>;
  if (error) return <p className="text-xs text-red-400 italic mt-2">Error: {error}</p>;
  if (entries.length === 0) return <p className="text-xs text-slate-500 italic mt-2">No commlog entries found.</p>;

  return (
    <div className="mt-3 pt-3 border-t border-slate-600/50">
      <h4 className="text-sm font-medium text-slate-300 mb-1.5">Communication Log:</h4>
      <ul className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
        {entries.map(entry => (
          <li key={entry.id} className="text-xs p-1.5 bg-slate-700/40 rounded">
            <span className="font-semibold text-sky-400/80 mr-2">[{entry.action.toUpperCase()}]</span>
            <span className="text-slate-400 mr-2">{new Date(entry.created_at).toLocaleTimeString()}</span>
            <span className="text-slate-300/90">{entry.message || 'No message.'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}