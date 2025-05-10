"use client";

import { useState, FormEvent } from 'react';

interface TranscriptFormProps {
  apiBaseUrl: string;
  onSummaryCreated: () => void; // Callback to refresh the list after creation
}

export default function TranscriptForm({ apiBaseUrl, onSummaryCreated }: TranscriptFormProps) {
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    if (!transcript.trim()) {
      setError("Transcript cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/summaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown server error" }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      // const newSummary = await response.json(); // You can use this if needed
      await response.json(); 
      
      setSuccessMessage("Transcript submitted successfully! Summary is being generated.");
      setTranscript(''); // Clear the form
      onSummaryCreated(); // Trigger refresh in parent component
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      // Clear messages after a delay
      setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="transcript" className="block text-sm font-medium text-slate-300 mb-1">
          Enter Call Transcript:
        </label>
        <textarea
          id="transcript"
          name="transcript"
          rows={6}
          className="block w-full p-3 bg-slate-700 border border-slate-600 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-100 placeholder-slate-400 custom-scrollbar"
          placeholder="Paste or type the call transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit & Summarize'}
        </button>
      </div>
      {successMessage && (
        <p className="text-sm text-emerald-400 bg-emerald-900/50 p-3 rounded-md">{successMessage}</p>
      )}
      {error && (
        <p className="text-sm text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>
      )}
    </form>
  );
}
