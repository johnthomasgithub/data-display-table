import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import PageBar from "@/components/PageBar";
import ServiceReportForm from "@/components/ServiceReportForm";
import ExpenseVoucherForm from "@/components/ExpenseVoucherForm";
import { useApi } from "@/lib/auth";
import type { RecordData } from "@/lib/records";
import {
  reviveServiceValues,
  serviceRecordType,
  serviceSummary,
  type ServiceFormValues,
} from "@/lib/serviceReport";
import { reviveVoucherState, voucherSummary, type VoucherFormState } from "@/lib/voucher";

const SavedEditPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const api = useApi();
  const { data: record, isLoading, error } = useQuery({ queryKey: ["record", id], queryFn: () => api.getRecord(id) });

  const fallback = `/saved/${id}`;

  if (isLoading) {
    return (
      <>
        <PageBar title="Edit" fallback={fallback} />
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }
  if (error || !record) {
    return (
      <>
        <PageBar title="Edit" fallback="/saved" />
        <p className="text-center py-20 text-muted-foreground">Could not load this record.</p>
      </>
    );
  }

  const afterSave = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["records"] });
    queryClient.invalidateQueries({ queryKey: ["record", record.id] });
    toast.success(message);
    // Return to the screen we came from (it reloads the saved data).
    if (location.key !== "default") navigate(-1);
    else navigate(fallback, { replace: true });
  };

  if (record.record_type === "voucher") {
    const handleSave = async (state: VoucherFormState) => {
      await api.updateRecord(record.id, "voucher", state as unknown as RecordData, voucherSummary(state));
      afterSave("Voucher updated");
    };
    return (
      <>
        <PageBar title={`Edit Voucher ${record.ref_no ?? ""}`} fallback={fallback} />
        <ExpenseVoucherForm
          initialState={reviveVoucherState(record.data)}
          employeeName={record.owner_name}
          submitLabel="Save Changes"
          onSave={handleSave}
        />
      </>
    );
  }

  const handleSave = async (values: ServiceFormValues) => {
    await api.updateRecord(record.id, serviceRecordType(values), values as unknown as RecordData, serviceSummary(values));
    afterSave("Report updated");
  };
  return (
    <>
      <PageBar title={`Edit Report ${record.ref_no ?? ""}`} fallback={fallback} />
      <ServiceReportForm
        initialValues={reviveServiceValues(record.data)}
        technicianName={record.owner_name}
        submitLabel="Save Changes"
        onSave={handleSave}
      />
    </>
  );
};

export default SavedEditPage;
