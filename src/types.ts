// ─────────────────────────────────────────────────────────────
// types.ts — all shared TypeScript types for the Enkel app
// ─────────────────────────────────────────────────────────────

// The 13 pages in the sidebar navigation
export type Page =
  | "Home"
  | "Reminders"
  | "Clients"
  | "Leads"
  | "Tasks"
  | "Catalogue"
  | "Design & Creative"
  | "Notes / Ideas"
  | "HR"
  | "Attendance"
  | "Sales"
  | "Expenses"
  | "Files";

// Attendance backend types
export type AttendanceProfile = {
  employee_id: string;
  name: string;
  sample_count: number;
  state: string; // "sampling" | "ready"
};

export type AttendanceRow = {
  id: number;
  employee_id: string;
  name: string;
  attendance_date: string; // "YYYY-MM-DD"
  check_in_time: string;   // "HH:MM:SS" IST
  distance: number;        // LBPH distance (lower = better match)
  corrected: number;       // 1 if manually corrected
};

export type AttendanceDashboard = {
  profiles: AttendanceProfile[];
  records: AttendanceRow[];
  registered: number;
  checked_in_today: number;
  not_checked_in: number;
  model_ready: boolean;
};

// Recognition result returned by POST /recognize
export type RecognizeResult = {
  matched: boolean;
  verified?: boolean;
  duplicate?: boolean;
  tier?: "good" | "uncertain" | "unknown";
  name?: string;
  checked_in_at?: string;
  stable_matches?: number;
  confidence?: number;
};

// Live UI state while recognition loop is running
export type RecogState = {
  tier: "good" | "uncertain" | "unknown" | null;
  name: string;
  confidence: number;
  streak: number;       // 0–3 consecutive solid matches
  checkedIn: boolean;
  checkedInAt: string;
  duplicate: boolean;
};
