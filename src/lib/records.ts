import { supabase } from "@/lib/supabase";

// All data goes through checked database functions (see supabase/schema.sql),
// called with the session token from the PIN login. The database decides what
// each employee may see: technicians their own records, admins everyone's.

export type RecordType = "service" | "breakdown" | "voucher";
export type RecordData = Record<string, unknown>;
export type Role = "technician" | "admin";

export const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  service: "Service Report",
  breakdown: "Breakdown Report",
  voucher: "Expense Voucher",
};

export interface Employee {
  id: string;
  code: string | null;
  name: string;
  role: Role;
}

export interface Session {
  token: string;
  expiresAt: string; // ISO time
  employee: Employee;
}

export type LoginResult = { ok: true; session: Session } | { ok: false; error: "INVALID_PIN" | "TOO_MANY_ATTEMPTS" };

/** List row (no form data). */
export interface RecordSummaryRow {
  id: string;
  record_type: RecordType;
  ref_no: string | null;
  client: string | null;
  owner_id: string;
  owner_name: string;
  record_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedRecord extends RecordSummaryRow {
  data: RecordData;
}

/** Values copied into the searchable columns. */
export interface RecordSummary {
  refNo: string;
  client: string;
  date: string; // yyyy-MM-dd or ""
}

export interface ListFilter {
  /** Part of the client name. */
  client?: string;
  /** Part of the Report No. / Voucher No. */
  number?: string;
  recordType?: RecordType | "all";
  /** yyyy-MM-dd, inclusive */
  dateFrom?: string;
  dateTo?: string;
  /** Admins only: one technician's records. */
  ownerId?: string;
}

/** sessionStorage key holding the saved-list filters (URL query string). */
export const LAST_LIST_KEY = "glacetech-last-list-filters";

/** The session has ended (24 hours passed, or logged out elsewhere). */
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired. Please enter your PIN again.");
  }
}

// ── Backend selection ─────────────────────────────────────────────────────
// Without Supabase keys, development builds use an in-browser demo backend.
// Production builds never include it (the import is removed at build time).

type LocalBackend = typeof import("./localBackend");

function localBackend(): Promise<LocalBackend> {
  return import.meta.env.DEV
    ? import("./localBackend")
    : Promise.reject(new Error("The app is not connected to Supabase. Add the keys and redeploy."));
}

function toError(message: string): Error {
  if (message.includes("SESSION_EXPIRED")) return new SessionExpiredError();
  if (message.includes("NOT_FOUND")) return new Error("Not found, or you do not have access to it.");
  if (message.includes("Could not find the function")) {
    return new Error("The database is not set up for PIN login yet. Run supabase/schema.sql in Supabase.");
  }
  return new Error(message);
}

/** Runs a demo-backend call with the same error handling as Supabase. */
async function viaLocal<T>(fn: (backend: LocalBackend) => T): Promise<T> {
  const backend = await localBackend();
  try {
    return fn(backend);
  } catch (err) {
    throw toError(err instanceof Error ? err.message : String(err));
  }
}

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.rpc(fn, args);
  if (error) throw toError(error.message);
  return data as T;
}

// ── API ────────────────────────────────────────────────────────────────────

interface LoginResponse {
  ok: boolean;
  error?: "INVALID_PIN" | "TOO_MANY_ATTEMPTS";
  token?: string;
  expires_at?: string;
  employee?: Employee;
}

export async function login(pin: string): Promise<LoginResult> {
  const res = supabase ? await rpc<LoginResponse>("login", { p_pin: pin }) : await viaLocal((b) => b.login(pin));
  if (!res.ok || !res.token || !res.expires_at || !res.employee) {
    return { ok: false, error: res.error ?? "INVALID_PIN" };
  }
  return { ok: true, session: { token: res.token, expiresAt: res.expires_at, employee: res.employee } };
}

/** Confirms a stored session is still valid; returns it refreshed, or null. */
export async function checkSession(session: Session): Promise<Session | null> {
  try {
    const res = supabase
      ? await rpc<{ expires_at: string; employee: Employee }>("whoami", { p_token: session.token })
      : await viaLocal((b) => b.whoami(session.token));
    return { token: session.token, expiresAt: res.expires_at, employee: res.employee };
  } catch (err) {
    if (err instanceof SessionExpiredError) return null;
    throw err;
  }
}

export async function logout(token: string): Promise<void> {
  if (supabase) await rpc("logout", { p_token: token });
  else await viaLocal((b) => b.logout(token));
}

export async function listRecords(token: string, filter: ListFilter = {}): Promise<RecordSummaryRow[]> {
  const args = {
    p_token: token,
    p_client: filter.client?.trim() || null,
    p_number: filter.number?.trim() || null,
    p_type: filter.recordType && filter.recordType !== "all" ? filter.recordType : null,
    p_from: filter.dateFrom || null,
    p_to: filter.dateTo || null,
    p_owner: filter.ownerId || null,
  };
  return supabase ? rpc("list_records", args) : viaLocal((b) => b.listRecords(args));
}

export async function getRecord(token: string, id: string): Promise<SavedRecord> {
  if (!supabase) return viaLocal((b) => b.getRecord(token, id));
  const rows = await rpc<SavedRecord[]>("get_record", { p_token: token, p_id: id });
  if (!rows[0]) throw toError("NOT_FOUND");
  return rows[0];
}

export async function createRecord(
  token: string,
  type: RecordType,
  data: RecordData,
  summary: RecordSummary,
): Promise<SavedRecord> {
  const args = {
    p_token: token,
    p_type: type,
    p_ref_no: summary.refNo,
    p_client: summary.client,
    p_date: summary.date || null,
    p_data: JSON.parse(JSON.stringify(data)), // Dates → ISO text
  };
  if (!supabase) return viaLocal((b) => b.createRecord(args));
  const rows = await rpc<SavedRecord[]>("create_record", args);
  return rows[0];
}

export async function updateRecord(
  token: string,
  id: string,
  type: RecordType,
  data: RecordData,
  summary: RecordSummary,
): Promise<SavedRecord> {
  const args = {
    p_token: token,
    p_id: id,
    p_type: type,
    p_ref_no: summary.refNo,
    p_client: summary.client,
    p_date: summary.date || null,
    p_data: JSON.parse(JSON.stringify(data)),
  };
  if (!supabase) return viaLocal((b) => b.updateRecord(args));
  const rows = await rpc<SavedRecord[]>("update_record", args);
  return rows[0];
}

/** Admins only. */
export async function listEmployees(token: string): Promise<Employee[]> {
  return supabase ? rpc("list_employees", { p_token: token }) : viaLocal((b) => b.listEmployees(token));
}
