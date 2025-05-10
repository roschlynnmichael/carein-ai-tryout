// frontend/src/app/page.tsx
"use client"; // Required for useState and useEffect

import Image from "next/image";
import { useEffect, useState } from 'react';
import { CallSummary } from '@/types'; // Adjust path if your types file is elsewhere
import TranscriptForm from '@/components/TranscriptForm'; // <-- Import the new component

// Define the base URL for your API
const API_BASE_URL = 'http://localhost:5005/api/v1';

async function fetchSummaries(): Promise<CallSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/summaries/?limit=10`); // Fetch last 10 for now
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`, await response.text());
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as CallSummary[];
  } catch (error) {
    console.error("Failed to fetch summaries:", error);
    return [];
  }
}

export default function Home() {
  const [summaries, setSummaries] = useState<CallSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rerunStatus, setRerunStatus] = useState<{ [key: number]: 'idle' | 'loading' | 'error' }>({});

  const loadData = async () => { // Made loadData accessible for manual refresh later
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSummaries = await fetchSummaries();
      setSummaries(fetchedSummaries.sort((a, b) => b.id - a.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRerunSummary = async (summaryId: number) => {
    setRerunStatus(prev => ({ ...prev, [summaryId]: 'loading' }));
    try {
      const response = await fetch(`${API_BASE_URL}/summaries/${summaryId}/rerun`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown server error" }));
        throw new Error(errorData.detail || `Failed to re-run summary (status: ${response.status})`);
      }
      const updatedSummary = await response.json() as CallSummary;

      // Update the specific summary in the list
      setSummaries(prevSummaries =>
        prevSummaries.map(s => (s.id === summaryId ? updatedSummary : s))
      );
      setRerunStatus(prev => ({ ...prev, [summaryId]: 'idle' }));
      // Or, for simplicity, just reload all data:
      // await loadData(); 
    } catch (e) {
      console.error(`Error re-running summary ${summaryId}:`, e);
      alert(`Failed to re-run summary: ${e instanceof Error ? e.message : "Unknown error"}`);
      setRerunStatus(prev => ({ ...prev, [summaryId]: 'error' }));
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      {/* Header Section - Keeping existing branding for now */}
      <header className="flex flex-col items-center sm:items-start w-full max-w-5xl">
        <Image
          className="dark:invert filter brightness-0 invert mb-4" // Adjusted for dark theme
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-4xl font-bold text-center sm:text-left mb-2">
          AI Call Summary Dashboard
        </h1>
        <p className="text-slate-400 text-center sm:text-left mb-8">
          Review and manage AI-generated call summaries.
        </p>
      </header>

      {/* Main Content Area for Dashboard */}
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-5xl">
        
        {/* Transcript Input Form */}
        <div className="w-full p-6 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-sky-400">Submit New Transcript</h2>
          {/* Use the TranscriptForm component */}
          <TranscriptForm 
            apiBaseUrl={API_BASE_URL} 
            onSummaryCreated={loadData} // Pass loadData to refresh list
          />
        </div>

        {/* Call Summaries List */}
        <div className="w-full p-6 bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 mt-8"> {/* Added mt-8 for spacing */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-sky-400">Recent Call Summaries</h2>
            <button 
              onClick={loadData} 
              disabled={isLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {isLoading && <p className="text-slate-300">Loading summaries...</p>}
          {error && <p className="text-red-400">Error loading summaries: {error}</p>}
          {!isLoading && !error && summaries.length === 0 && (
            <p className="text-slate-400">No summaries found. Submit a transcript to get started!</p>
          )}
          {!isLoading && !error && summaries.length > 0 && (
            <ul className="space-y-6">
              {summaries.map((summary) => (
                <li key={summary.id} className="bg-slate-700/50 p-6 rounded-lg shadow-lg border border-slate-600 hover:border-sky-500 transition-all duration-300 ease-in-out transform hover:scale-[1.01]">
                  <div className="mb-3 flex justify-between items-center">
                    <span className="font-semibold text-xs text-sky-400 bg-sky-900/50 px-2 py-1 rounded">ID: {summary.id}</span>
                    <span className="text-xs text-slate-400">
                      Created: {new Date(summary.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-200 mb-1">Transcript:</h3>
                    <p className="text-slate-300 whitespace-pre-wrap bg-slate-800 p-3 rounded text-sm max-h-28 overflow-y-auto custom-scrollbar">
                      {summary.transcript}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-emerald-400 mb-1">Summary:</h3>
                    <p className="text-slate-200 whitespace-pre-wrap bg-slate-800 p-3 rounded text-sm">
                      {summary.summary || <span className="text-slate-500 italic">No summary generated yet.</span>}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={() => handleRerunSummary(summary.id)}
                      disabled={rerunStatus[summary.id] === 'loading'}
                      className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                    >
                      {rerunStatus[summary.id] === 'loading' ? 'Re-running...' : 'Re-run Summary'}
                    </button>
                  </div>
                  {rerunStatus[summary.id] === 'error' && (
                    <p className="text-xs text-red-400 mt-2 text-right">Failed to re-run. Please try again.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Footer - Keeping existing for now */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-xs text-slate-500">
        <a
          className="flex items-center gap-2 hover:text-sky-400 transition-colors"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={14} height={14} className="filter brightness-0 invert opacity-70" />
          Learn Next.js
        </a>
        <a
          className="flex items-center gap-2 hover:text-sky-400 transition-colors"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={14} height={14} className="filter brightness-0 invert opacity-70" />
          Next.js Examples
        </a>
      </footer>
    </div>
  );
}