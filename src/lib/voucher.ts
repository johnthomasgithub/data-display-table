import { format } from "date-fns";
import type { RecordSummary } from "@/lib/records";

// Data model for the Expense Statement Voucher form. The form state is what
// gets saved, so a saved voucher can be opened again in the same form.

export interface ExpenseRow {
  id: string;
  date: Date | undefined;
  description: string;
  client: string;
  travelExpenses: number;
  materialExpenses: number;
}

export interface VoucherData {
  voucherType: string;
  voucherNo: string;
  voucherDate: string;
  name: string;
  rows: {
    date: string;
    description: string;
    client: string;
    travelExpenses: number;
    materialExpenses: number;
    total: number;
  }[];
  grandTotal: number;
  advanceReceived: number;
  netTotal: number;
  technicianSignatureImg?: string;
}

export interface VoucherFormState {
  name: string;
  voucherNo: string;
  voucherDate: Date | undefined;
  rows: ExpenseRow[];
  advanceReceived: number;
  technicianSignature: string;
}

export const VOUCHER_SIGNATURE_FIELDS = ["technicianSignature"];

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export const emptyRow = (): ExpenseRow => ({
  id: generateId(),
  date: undefined,
  description: "",
  client: "",
  travelExpenses: 0,
  materialExpenses: 0,
});

export const defaultVoucherState = (): VoucherFormState => ({
  name: "",
  voucherNo: "",
  voucherDate: undefined,
  rows: [emptyRow()],
  advanceReceived: 0,
  technicianSignature: "",
});

/** Restores Date objects after the state went through JSON (storage or database). */
export function reviveVoucherState(raw: Record<string, unknown>): VoucherFormState {
  const state = { ...defaultVoucherState(), ...raw } as VoucherFormState;
  state.voucherDate = typeof raw.voucherDate === "string" && raw.voucherDate ? new Date(raw.voucherDate) : undefined;
  state.rows = (Array.isArray(raw.rows) ? raw.rows : state.rows).map((r: Record<string, unknown>) => ({
    ...emptyRow(),
    ...r,
    date: typeof r.date === "string" && r.date ? new Date(r.date) : undefined,
  })) as ExpenseRow[];
  return state;
}

export const voucherTotals = (state: VoucherFormState) => {
  const grandTotal = state.rows.reduce((sum, r) => sum + r.travelExpenses + r.materialExpenses, 0);
  return { grandTotal, netTotal: grandTotal - state.advanceReceived };
};

export function voucherSummary(state: VoucherFormState): RecordSummary {
  const clients = [...new Set(state.rows.map((r) => r.client.trim()).filter(Boolean))];
  return {
    refNo: state.voucherNo,
    client: clients.join(", "),
    person: state.name,
    date: state.voucherDate ? format(state.voucherDate, "yyyy-MM-dd") : "",
  };
}

/** Form state → what the printable voucher shows. */
export function toVoucherData(state: VoucherFormState): VoucherData {
  const { grandTotal, netTotal } = voucherTotals(state);
  return {
    voucherType: "Expense Statement",
    voucherNo: state.voucherNo,
    voucherDate: state.voucherDate ? format(state.voucherDate, "dd/MM/yyyy") : "",
    name: state.name,
    rows: state.rows.map((r) => ({
      date: r.date ? format(r.date, "dd/MM/yyyy") : "",
      description: r.description,
      client: r.client,
      travelExpenses: r.travelExpenses,
      materialExpenses: r.materialExpenses,
      total: r.travelExpenses + r.materialExpenses,
    })),
    grandTotal,
    advanceReceived: state.advanceReceived,
    netTotal,
    technicianSignatureImg: state.technicianSignature,
  };
}
