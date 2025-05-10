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
    const response = await fetch(`${API_BASE_URL}/summaries/?limit=20`); // Fetch more to test scroll
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
    <div className="flex flex-col h-screen font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 overflow-hidden">
      {/* Header: Fixed height, no scroll */}
      <header className="flex-shrink-0 p-6 sm:px-12 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row items-center sm:items-start w-full max-w-7xl mx-auto">
          <Image
            className="filter brightness-0 invert mb-2 sm:mb-0 sm:mr-6"
            src="/next.svg"
            alt="Next.js logo"
            width={150}
            height={32}
            priority
          />
          <div>
            <h1 className="text-3xl font-bold text-center sm:text-left">
              AI Call Summary Dashboard
            </h1>
            <p className="text-slate-400 text-center sm:text-left text-sm">
              Review and manage AI-generated call summaries.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area: Takes remaining space, flex row for two columns */}
      <main className="flex-grow flex flex-col lg:flex-row gap-6 p-6 sm:p-8 overflow-hidden w-full max-w-7xl mx-auto">
        
        {/* Left Panel: Summaries List (Scrollable) */}
        <section className="w-full lg:w-3/5 flex flex-col bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700">
            <h2 className="text-xl font-semibold text-sky-400">Recent Call Summaries</h2>
            <button 
              onClick={loadData} 
              disabled={isLoading || Object.values(rerunStatus).some(s => s === 'loading')}
              className="px-3 py-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white rounded-md disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          {/* Scrollable Content Area for Summaries */}
          <div className="flex-grow p-4 space-y-4 overflow-y-auto custom-scrollbar">
            {isLoading && <p className="text-slate-300 text-center py-10">Loading summaries...</p>}
            {error && <p className="text-red-400 text-center py-10">Error: {error}</p>}
            {!isLoading && !error && summaries.length === 0 && (
              <p className="text-slate-400 text-center py-10">No summaries found. Submit one to get started!</p>
            )}
            {!isLoading && !error && summaries.length > 0 && (
              summaries.map((summary) => (
                <li key={summary.id} className="list-none bg-slate-700/60 p-4 rounded-lg shadow-lg border border-slate-600 hover:border-sky-500 transition-all duration-300 ease-in-out transform hover:scale-[1.005]">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="font-semibold text-xs text-sky-400 bg-sky-900/50 px-2 py-1 rounded">ID: {summary.id}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(summary.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-slate-200 mb-1">Transcript:</h3>
                    <p className="text-slate-300 whitespace-pre-wrap bg-slate-800 p-2.5 rounded text-xs max-h-24 overflow-y-auto custom-scrollbar">
                      {summary.transcript}
                    </p>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-base font-medium text-emerald-400 mb-1">Summary:</h3>
                    <p className="text-slate-200 whitespace-pre-wrap bg-slate-800 p-2.5 rounded text-xs">
                      {summary.summary || <span className="text-slate-500 italic">No summary.</span>}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => handleRerunSummary(summary.id)}
                      disabled={rerunStatus[summary.id] === 'loading'}
                      className="px-2.5 py-1 text-xs bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed text-white rounded-md transition-colors"
                    >
                      {rerunStatus[summary.id] === 'loading' ? 'Re-running...' : 'Re-run'}
                    </button>
                  </div>
                  {rerunStatus[summary.id] === 'error' && (
                    <p className="text-xs text-red-400 mt-1 text-right">Failed to re-run.</p>
                  )}
                </li>
              ))
            )}
          </div>
        </section>

        {/* Right Panel: Transcript Form (Can also be made scrollable if its content grows) */}
        <section className="w-full lg:w-2/5 flex flex-col bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 p-4 lg:overflow-y-auto custom-scrollbar"> {/* Added overflow for form too if needed */}
          <h2 className="flex-shrink-0 text-xl font-semibold mb-3 text-sky-400">Submit New Transcript</h2>
          <div className="flex-grow"> {/* Allows form to take space if section scrolls */}
            <TranscriptForm 
              apiBaseUrl={API_BASE_URL} 
              onSummaryCreated={loadData}
            />
          </div>
        </section>
      </main>

      {/* Footer: Fixed height, no scroll */}
      <footer className="flex-shrink-0 p-3 border-t border-slate-700 text-center">
        <p className="text-xs text-slate-500">
          CareIN AI Call Summary Module &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}