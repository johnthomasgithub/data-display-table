// Development-only stand-in for the Supabase functions in supabase/schema.sql,
// used when no Supabase keys are set. Data lives in this browser's storage.
// It follows the same rules (own records only, admins see all, technician name
// fixed) but uses DEMO PINs – the real PINs exist only in the Supabase database.

import type { Employee, RecordData, RecordSummaryRow, RecordType, SavedRecord } from "./records";

const DEMO_EMPLOYEES: (Employee & { pin: string })[] = [
  { id: "e01", code: "010001", name: "ANSARI MOHD FAISAL SHAMIM", role: "technician", pin: "1001" },
  { id: "e03", code: "010003", name: "MALARVIZHI SUGANTHI EBANEZER", role: "admin", pin: "1003" },
  { id: "e04", code: "010004", name: "BRIJESH KUMAR", role: "technician", pin: "1004" },
  { id: "e05", code: "010005", name: "UMESH KUMAR", role: "technician", pin: "1005" },
  { id: "e06", code: "010006", name: "NADAR ABISHEK SURESH KUMAR", role: "technician", pin: "1006" },
  { id: "e07", code: "010007", name: "KAREEM KHAN", role: "technician", pin: "1007" },
  { id: "e08", code: "010008", name: "ISHTYAK IRSHAD AHAMAD", role: "technician", pin: "1008" },
  { id: "e10", code: "010010", name: "MD WASIM AKRAM", role: "technician", pin: "1010" },
  { id: "e11", code: "010011", name: "MOHAMMAD AASIF MOHAMMAD ANWAR", role: "technician", pin: "1011" },
  { id: "e12", code: "010012", name: "MOHD TAHA SHAHADAT SHAIKH", role: "technician", pin: "1012" },
  { id: "e99", code: null, name: "EBENAZER JEBASEELAN", role: "admin", pin: "1099" },
];

const RECORDS_KEY = "glacetech-demo-records";
const SESSIONS_KEY = "glacetech-demo-sessions";
const DAY_MS = 24 * 60 * 60 * 1000;

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

const publicEmployee = ({ pin: _pin, ...e }: Employee & { pin: string }): Employee => e;

function sessionEmployee(token: string): Employee {
  const sessions = read<Record<string, { employeeId: string; expiresAt: string }>>(SESSIONS_KEY, {});
  const s = sessions[token];
  const emp = s && new Date(s.expiresAt) > new Date() && DEMO_EMPLOYEES.find((e) => e.id === s.employeeId);
  if (!emp) throw new Error("SESSION_EXPIRED");
  return publicEmployee(emp);
}

const withOwnerName = (type: string, data: RecordData, name: string): RecordData =>
  type === "voucher" ? { ...data, name } : { ...data, technicianName: name };

const canSee = (emp: Employee, r: SavedRecord) => emp.role === "admin" || r.owner_id === emp.id;

const today = () => new Date().toISOString().slice(0, 10);

export function login(pin: string) {
  const emp = DEMO_EMPLOYEES.find((e) => e.pin === pin);
  if (!emp) return { ok: false as const, error: "INVALID_PIN" as const };
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + DAY_MS).toISOString();
  const sessions = read<Record<string, { employeeId: string; expiresAt: string }>>(SESSIONS_KEY, {});
  sessions[token] = { employeeId: emp.id, expiresAt: expires_at };
  write(SESSIONS_KEY, sessions);
  return { ok: true as const, token, expires_at, employee: publicEmployee(emp) };
}

export function whoami(token: string) {
  const employee = sessionEmployee(token);
  const sessions = read<Record<string, { expiresAt: string }>>(SESSIONS_KEY, {});
  return { expires_at: sessions[token].expiresAt, employee };
}

export function logout(token: string) {
  const sessions = read<Record<string, unknown>>(SESSIONS_KEY, {});
  delete sessions[token];
  write(SESSIONS_KEY, sessions);
}

export function listRecords(a: {
  p_token: string;
  p_client: string | null;
  p_number: string | null;
  p_type: string | null;
  p_from: string | null;
  p_to: string | null;
  p_owner: string | null;
}): RecordSummaryRow[] {
  const emp = sessionEmployee(a.p_token);
  const has = (value: string | null, q: string | null) => !q || (value ?? "").toLowerCase().includes(q.toLowerCase());
  return read<SavedRecord[]>(RECORDS_KEY, [])
    .filter((r) => canSee(emp, r))
    .filter((r) => !a.p_owner || r.owner_id === a.p_owner)
    .filter((r) => has(r.client, a.p_client) && has(r.ref_no, a.p_number))
    .filter((r) => !a.p_type || r.record_type === a.p_type)
    .filter((r) => (!a.p_from || (r.record_date ?? "") >= a.p_from) && (!a.p_to || (r.record_date ?? "") <= a.p_to))
    .sort((x, y) => (y.record_date ?? "").localeCompare(x.record_date ?? "") || y.created_at.localeCompare(x.created_at))
    .map(({ data: _data, ...row }) => row);
}

export function getRecord(token: string, id: string): SavedRecord {
  const emp = sessionEmployee(token);
  const r = read<SavedRecord[]>(RECORDS_KEY, []).find((x) => x.id === id);
  if (!r || !canSee(emp, r)) throw new Error("Not found, or you do not have access to it.");
  return r;
}

interface SaveArgs {
  p_token: string;
  p_type: RecordType;
  p_ref_no: string;
  p_client: string;
  p_date: string | null;
  p_data: RecordData;
}

export function createRecord(a: SaveArgs): SavedRecord {
  const emp = sessionEmployee(a.p_token);
  const now = new Date().toISOString();
  const record: SavedRecord = {
    id: crypto.randomUUID(),
    record_type: a.p_type,
    ref_no: a.p_ref_no || null,
    client: a.p_client || null,
    owner_id: emp.id,
    owner_name: emp.name,
    record_date: a.p_date || today(),
    data: withOwnerName(a.p_type, a.p_data, emp.name),
    created_at: now,
    updated_at: now,
  };
  write(RECORDS_KEY, [record, ...read<SavedRecord[]>(RECORDS_KEY, [])]);
  return record;
}

export function updateRecord(a: SaveArgs & { p_id: string }): SavedRecord {
  const emp = sessionEmployee(a.p_token);
  const records = read<SavedRecord[]>(RECORDS_KEY, []);
  const i = records.findIndex((x) => x.id === a.p_id);
  if (i === -1 || !canSee(emp, records[i])) throw new Error("Not found, or you do not have access to it.");
  const r = records[i];
  if ((a.p_type === "voucher") !== (r.record_type === "voucher")) throw new Error("INVALID_TYPE");
  records[i] = {
    ...r,
    record_type: a.p_type,
    ref_no: a.p_ref_no || null,
    client: a.p_client || null,
    record_date: a.p_date || r.record_date,
    data: withOwnerName(a.p_type, a.p_data, r.owner_name),
    updated_at: new Date().toISOString(),
  };
  write(RECORDS_KEY, records);
  return records[i];
}

export function listEmployees(token: string): Employee[] {
  if (sessionEmployee(token).role !== "admin") throw new Error("NOT_ALLOWED");
  return DEMO_EMPLOYEES.map(publicEmployee).sort((x, y) => x.name.localeCompare(y.name));
}
