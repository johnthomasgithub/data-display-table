import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import SignatureCanvas from "@/components/SignatureCanvas";

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

const STORAGE_KEY = "expense-voucher-form-data";

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

interface AmountModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  title: string;
  initialValue: number;
}

const AmountModal = ({ open, onClose, onSave, title, initialValue }: AmountModalProps) => {
  const [rupees, setRupees] = useState(Math.floor(initialValue).toString());
  const [paise, setPaise] = useState(Math.round((initialValue % 1) * 100).toString().padStart(2, "0"));

  useEffect(() => {
    if (open) {
      setRupees(Math.floor(initialValue).toString());
      setPaise(Math.round((initialValue % 1) * 100).toString().padStart(2, "0"));
    }
  }, [open, initialValue]);

  const handleSave = () => {
    const r = parseInt(rupees || "0", 10);
    const p = parseInt(paise || "0", 10);
    onSave(r + p / 100);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Rupees (₹)</Label>
            <Input
              type="number"
              min="0"
              value={rupees}
              onChange={(e) => setRupees(e.target.value)}
              placeholder="0"
            />
          </div>
          <span className="text-xl font-bold mt-5">.</span>
          <div className="space-y-1 w-20">
            <Label className="text-xs">Paise</Label>
            <Input
              type="number"
              min="0"
              max="99"
              value={paise}
              onChange={(e) => setPaise(e.target.value.slice(0, 2))}
              placeholder="00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function loadSaved(): { name: string; voucherNo: string; voucherDate: Date | undefined; rows: ExpenseRow[]; advanceReceived: number; technicianSignature: string } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaults();
    const parsed = JSON.parse(raw);
    if (parsed.voucherDate) parsed.voucherDate = new Date(parsed.voucherDate);
    if (parsed.rows) {
      parsed.rows = parsed.rows.map((r: any) => ({
        ...r,
        date: r.date ? new Date(r.date) : undefined,
      }));
    }
    return { ...getDefaults(), ...parsed };
  } catch {
    return getDefaults();
  }
}

function getDefaults() {
  return {
    name: "",
    voucherNo: "",
    voucherDate: undefined as Date | undefined,
    rows: [{ id: generateId(), date: undefined, description: "", client: "", travelExpenses: 0, materialExpenses: 0 }] as ExpenseRow[],
    advanceReceived: 0,
    technicianSignature: "",
  };
}

const ExpenseVoucherForm = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(loadSaved);
  const [amountModal, setAmountModal] = useState<{
    open: boolean;
    rowIndex: number;
    field: "travelExpenses" | "materialExpenses" | "advanceReceived";
    title: string;
    value: number;
  }>({ open: false, rowIndex: -1, field: "travelExpenses", title: "", value: 0 });

  useEffect(() => {
    const timeout = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formState]);

  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const updateRow = (index: number, field: keyof ExpenseRow, value: any) => {
    setFormState((prev) => {
      const rows = [...prev.rows];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, rows };
    });
  };

  const addRow = () => {
    setFormState((prev) => ({
      ...prev,
      rows: [...prev.rows, { id: generateId(), date: undefined, description: "", client: "", travelExpenses: 0, materialExpenses: 0 }],
    }));
  };

  const deleteRow = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, i) => i !== index),
    }));
  };

  const grandTotal = formState.rows.reduce((sum, r) => sum + r.travelExpenses + r.materialExpenses, 0);
  const netTotal = grandTotal - formState.advanceReceived;

  const handleClear = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setFormState(getDefaults());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const voucherData: VoucherData = {
      voucherType: "Expense Statement",
      voucherNo: formState.voucherNo,
      voucherDate: formState.voucherDate ? format(formState.voucherDate, "dd/MM/yyyy") : "",
      name: formState.name,
      rows: formState.rows.map((r) => ({
        date: r.date ? format(r.date, "dd/MM/yyyy") : "",
        description: r.description,
        client: r.client,
        travelExpenses: r.travelExpenses,
        materialExpenses: r.materialExpenses,
        total: r.travelExpenses + r.materialExpenses,
      })),
      grandTotal,
      advanceReceived: formState.advanceReceived,
      netTotal,
      technicianSignatureImg: formState.technicianSignature,
    };
    navigate("/voucher-report", { state: { voucherData } });
  };

  const openAmountModal = (rowIndex: number, field: "travelExpenses" | "materialExpenses", title: string) => {
    setAmountModal({
      open: true,
      rowIndex,
      field,
      title,
      value: formState.rows[rowIndex][field],
    });
  };

  const openAdvanceModal = () => {
    setAmountModal({
      open: true,
      rowIndex: -1,
      field: "advanceReceived",
      title: "Advance Received",
      value: formState.advanceReceived,
    });
  };

  const handleAmountSave = (amount: number) => {
    if (amountModal.field === "advanceReceived") {
      updateField("advanceReceived", amount);
    } else {
      updateRow(amountModal.rowIndex, amountModal.field, amount);
    }
  };

  const formatAmount = (v: number) => v > 0 ? `₹ ${v.toFixed(2)}` : "₹ 0.00";

  return (
    <div className="min-h-screen bg-muted/50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Expense Statement Voucher
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill in the expense details below
          </p>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6">
          {/* Voucher Type (default selected, future-proof) */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Voucher Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value="expense-statement" disabled>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense-statement">Expense Statement</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* General Info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>No.</Label>
                  <Input
                    value={formState.voucherNo}
                    onChange={(e) => updateField("voucherNo", e.target.value)}
                    placeholder="Voucher No."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formState.voucherDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formState.voucherDate ? format(formState.voucherDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formState.voucherDate}
                        onSelect={(d) => updateField("voucherDate", d)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formState.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Technician / Employee name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Expense Rows */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Expense Details</CardTitle>
              <CardDescription>Add each expense line item.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formState.rows.map((row, index) => (
                <div key={row.id} className="border rounded-lg p-4 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Item #{index + 1}</span>
                    {formState.rows.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => deleteRow(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left font-normal text-xs",
                              !row.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-1 h-3 w-3" />
                            {row.date ? format(row.date, "dd/MM/yyyy") : "Pick date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={row.date}
                            onSelect={(d) => updateRow(index, "date", d)}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Client</Label>
                      <Input
                        value={row.client}
                        onChange={(e) => updateRow(index, "client", e.target.value)}
                        placeholder="Client name"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={row.description}
                      onChange={(e) => updateRow(index, "description", e.target.value)}
                      placeholder="Expense description..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Travel Expenses</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start"
                        onClick={() => openAmountModal(index, "travelExpenses", "Travel Expenses")}
                      >
                        {formatAmount(row.travelExpenses)}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Material Expenses</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs justify-start"
                        onClick={() => openAmountModal(index, "materialExpenses", "Material Expenses")}
                      >
                        {formatAmount(row.materialExpenses)}
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-8 flex items-center text-xs font-semibold px-3 bg-muted rounded-md">
                        {formatAmount(row.travelExpenses + row.materialExpenses)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRow} className="w-full flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Row
              </Button>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="font-medium text-sm">Grand Total</span>
                <span className="font-bold text-base">{formatAmount(grandTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Advance Received</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={openAdvanceModal}
                >
                  {formatAmount(formState.advanceReceived)}
                </Button>
              </div>
              <div className="flex justify-between items-center py-2 border-t">
                <span className="font-semibold">Net Total</span>
                <span className="font-bold text-lg">{formatAmount(netTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Technician Signature */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Signature (Claimed)</CardTitle>
            </CardHeader>
            <CardContent>
              <SignatureCanvas
                value={formState.technicianSignature}
                onChange={(v) => updateField("technicianSignature", v)}
                label="Signature"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1" size="lg">
              Generate Voucher
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleClear} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Clear Form
            </Button>
          </div>
        </form>

        <AmountModal
          open={amountModal.open}
          onClose={() => setAmountModal((p) => ({ ...p, open: false }))}
          onSave={handleAmountSave}
          title={amountModal.title}
          initialValue={amountModal.value}
        />
      </div>
    </div>
  );
};

export default ExpenseVoucherForm;
