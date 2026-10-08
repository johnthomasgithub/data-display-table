import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import PageBar from "@/components/PageBar";
import ServiceReportForm from "@/components/ServiceReportForm";
import ExpenseVoucherForm from "@/components/ExpenseVoucherForm";
import { getRecord, updateRecord, type RecordData } from "@/lib/records";
import {
  SERVICE_SIGNATURE_FIELDS,
  reviveServiceValues,
  serviceRecordType,
  serviceSummary,
  type ServiceFormValues,
} from "@/lib/serviceReport";
import { VOUCHER_SIGNATURE_FIELDS, reviveVoucherState, voucherSummary, type VoucherFormState } from "@/lib/voucher";

const SavedEditPage = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: record, isLoading, error } = useQuery({ queryKey: ["record", id], queryFn: () => getRecord(id) });

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
      await updateRecord(record.id, "voucher", state as unknown as RecordData, voucherSummary(state), VOUCHER_SIGNATURE_FIELDS);
      afterSave("Voucher updated");
    };
    return (
      <>
        <PageBar title={`Edit Voucher ${record.ref_no ?? ""}`} fallback={fallback} />
        <ExpenseVoucherForm
          initialState={reviveVoucherState(record.data)}
          submitLabel="Save Changes"
          onSave={handleSave}
        />
      </>
    );
  }

  const handleSave = async (values: ServiceFormValues) => {
    await updateRecord(
      record.id,
      serviceRecordType(values),
      values as unknown as RecordData,
      serviceSummary(values),
      SERVICE_SIGNATURE_FIELDS,
    );
    afterSave("Report updated");
  };
  return (
    <>
      <PageBar title={`Edit Report ${record.ref_no ?? ""}`} fallback={fallback} />
      <ServiceReportForm initialValues={reviveServiceValues(record.data)} submitLabel="Save Changes" onSave={handleSave} />
    </>
  );
};

export default SavedEditPage;
