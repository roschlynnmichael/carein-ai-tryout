export interface CallSummary {
    id: number;
    transcript: string;
    summary: string | null;
    created_at: string; // ISO date string
    updated_at: string | null; // ISO date string
  }
  
  // You can add Commlog types here later if needed
  // export interface CommlogEntry {
  //   id: number;
  //   call_summary_id: number;
  //   action: string;
  //   message: string | null;
  //   created_at: string;
  // }