import { supabase, SIGNATURE_BUCKET } from "@/lib/supabase";

export type RecordType = "service" | "breakdown" | "voucher";
export type RecordData = Record<string, unknown>;

export const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  service: "Service Report",
  breakdown: "Breakdown Report",
  voucher: "Expense Voucher",
};

export interface SavedRecord {
  id: string;
  record_type: RecordType;
  ref_no: string | null;
  client: string | null;
  person: string | null;
  record_date: string | null;
  data: RecordData;
  created_at: string;
  updated_at: string;
}

/** Values copied into the searchable columns. */
export interface RecordSummary {
  refNo: string;
  client: string;
  person: string;
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
}

/** sessionStorage key holding the saved-list filters (URL query string). */
export const LAST_LIST_KEY = "glacetech-last-list-filters";

const isDataUrl = (v: unknown): boolean => typeof v === "string" && v.startsWith("data:");

// ── Signatures ─────────────────────────────────────────────────────────────
// In the form, a signature is a PNG data URL. On save it is uploaded to the
// private "signatures" bucket and the record keeps only the file path.

async function uploadSignatures(id: string, data: RecordData, fields: string[]): Promise<RecordData> {
  if (!supabase) return data;
  const out = { ...data };
  for (const field of fields) {
    const value = out[field];
    if (typeof value !== "string" || !isDataUrl(value)) continue;
    const blob = await (await fetch(value)).blob();
    const path = `${id}/${field}-${Date.now()}.png`;
    const { error } = await supabase.storage
      .from(SIGNATURE_BUCKET)
      .upload(path, blob, { contentType: "image/png", upsert: true });
    if (error) throw new Error(`Could not upload signature: ${error.message}`);
    out[field] = path;
  }
  return out;
}

/** Turns a stored signature value into something an <img> can show. */
export async function signatureSrc(value: unknown): Promise<string> {
  if (typeof value !== "string" || !value) return "";
  if (isDataUrl(value) || value.startsWith("http")) return value;
  if (!supabase) return "";
  const { data, error } = await supabase.storage.from(SIGNATURE_BUCKET).createSignedUrl(value, 60 * 60);
  if (error) return "";
  return data.signedUrl;
}

// ── Local fallback (no Supabase keys) ─────────────────────────────────────

const LOCAL_KEY = "glacetech-records";

function readLocal(): SavedRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeLocal(records: SavedRecord[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(records));
}

function matches(r: SavedRecord, filter: ListFilter) {
  const has = (value: string | null, q?: string) =>
    !q?.trim() || !!value?.toLowerCase().includes(q.trim().toLowerCase());
  if (filter.recordType && filter.recordType !== "all" && r.record_type !== filter.recordType) return false;
  if (!has(r.client, filter.client)) return false;
  if (!has(r.ref_no, filter.number)) return false;
  if (filter.dateFrom && (!r.record_date || r.record_date < filter.dateFrom)) return false;
  if (filter.dateTo && (!r.record_date || r.record_date > filter.dateTo)) return false;
  return true;
}

// ── Public API ─────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().slice(0, 10);

/** Searchable columns. The date falls back so every record can be found by date. */
const toColumns = (type: RecordType, summary: RecordSummary, fallbackDate: string) => ({
  record_type: type,
  ref_no: summary.refNo || null,
  client: summary.client || null,
  person: summary.person || null,
  record_date: summary.date || fallbackDate,
});

/** Strips characters that have a meaning inside a PostgREST filter. */
const clean = (value?: string) => value?.trim().replace(/[%,()*]/g, " ").trim() ?? "";

export async function listRecords(filter: ListFilter = {}): Promise<SavedRecord[]> {
  if (!supabase) {
    return readLocal()
      .filter((r) => matches(r, filter))
      .sort(
        (a, b) => (b.record_date ?? "").localeCompare(a.record_date ?? "") || b.created_at.localeCompare(a.created_at),
      );
  }

  let query = supabase
    .from("records")
    .select("*")
    .order("record_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter.recordType && filter.recordType !== "all") query = query.eq("record_type", filter.recordType);
  const client = clean(filter.client);
  if (client) query = query.ilike("client", `%${client}%`);
  const number = clean(filter.number);
  if (number) query = query.ilike("ref_no", `%${number}%`);
  if (filter.dateFrom) query = query.gte("record_date", filter.dateFrom);
  if (filter.dateTo) query = query.lte("record_date", filter.dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as SavedRecord[];
}

export async function getRecord(id: string): Promise<SavedRecord> {
  if (!supabase) {
    const found = readLocal().find((r) => r.id === id);
    if (!found) throw new Error("Record not found");
    return found;
  }
  const { data, error } = await supabase.from("records").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return data as SavedRecord;
}

export async function createRecord(
  type: RecordType,
  formData: RecordData,
  summary: RecordSummary,
  signatureFields: string[],
): Promise<SavedRecord> {
  const id = crypto.randomUUID();

  if (!supabase) {
    const now = new Date().toISOString();
    const record: SavedRecord = {
      id,
      ...toColumns(type, summary, today()),
      data: formData,
      created_at: now,
      updated_at: now,
    };
    writeLocal([record, ...readLocal()]);
    return record;
  }

  const data = await uploadSignatures(id, formData, signatureFields);
  const { data: row, error } = await supabase
    .from("records")
    .insert({ id, ...toColumns(type, summary, today()), data })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as SavedRecord;
}

export async function updateRecord(
  id: string,
  type: RecordType,
  formData: RecordData,
  summary: RecordSummary,
  signatureFields: string[],
): Promise<SavedRecord> {
  if (!supabase) {
    const records = readLocal();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Record not found");
    records[index] = {
      ...records[index],
      ...toColumns(type, summary, records[index].created_at.slice(0, 10)),
      data: formData,
      updated_at: new Date().toISOString(),
    };
    writeLocal(records);
    return records[index];
  }

  const data = await uploadSignatures(id, formData, signatureFields);
  const columns = toColumns(type, summary, "");
  const { data: row, error } = await supabase
    .from("records")
    // An empty date keeps whatever date the record already has.
    .update({ ...columns, record_date: columns.record_date || undefined, data })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row as SavedRecord;
}
