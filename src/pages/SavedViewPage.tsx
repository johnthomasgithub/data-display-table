import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Mail, Pencil, Printer, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import PageBar from "@/components/PageBar";
import ServiceReport from "@/components/ServiceReport";
import ExpenseVoucher from "@/components/ExpenseVoucher";
import { LAST_LIST_KEY, RECORD_TYPE_LABEL, type SavedRecord } from "@/lib/records";
import { useApi } from "@/lib/auth";
import { reviveServiceValues, toReportData } from "@/lib/serviceReport";
import { reviveVoucherState, toVoucherData } from "@/lib/voucher";
import { reportShareLines, shareByEmail, shareOnWhatsApp, voucherShareLines } from "@/lib/share";

/** Builds the printable data from the saved form values. */
function printable(record: SavedRecord) {
  if (record.record_type === "voucher") {
    return { kind: "voucher" as const, data: toVoucherData(reviveVoucherState(record.data)) };
  }
  return { kind: "report" as const, data: toReportData(reviveServiceValues(record.data)) };
}

const SavedViewPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { data: record, isLoading, error } = useQuery({ queryKey: ["record", id], queryFn: () => api.getRecord(id) });
  const view = useMemo(() => (record ? printable(record) : null), [record]);

  const listFallback = `/saved?${sessionStorage.getItem(LAST_LIST_KEY) ?? ""}`;

  if (isLoading) {
    return (
      <>
        <PageBar title="Loading…" fallback={listFallback} />
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }
  if (error || !record || !view) {
    return (
      <>
        <PageBar title="Not found" fallback={listFallback} />
        <p className="text-center py-20 text-muted-foreground">Could not load this record.</p>
      </>
    );
  }

  const label = RECORD_TYPE_LABEL[record.record_type];
  const title = `${label}${record.ref_no ? ` #${record.ref_no}` : ""}`;
  const lines = view.kind === "voucher" ? voucherShareLines(view.data) : reportShareLines(view.data);

  const handlePrint = () => {
    const previous = document.title;
    document.title = view.kind === "voucher" ? `Expense_Voucher_${record.ref_no ?? ""}` : `${label.replace(/ /g, "_")}_${record.ref_no ?? ""}`;
    window.print();
    document.title = previous;
  };

  return (
    <div>
      <PageBar title={title} fallback={listFallback}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/saved/${record.id}/edit`)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareOnWhatsApp(lines)}>
            <Share2 className="h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={() => shareByEmail(lines, title)}>
            <Mail className="h-4 w-4" /> Email
          </Button>
        </div>
      </PageBar>
      {view.kind === "voucher" ? <ExpenseVoucher data={view.data} /> : <ServiceReport data={view.data} />}
    </div>
  );
};

export default SavedViewPage;
