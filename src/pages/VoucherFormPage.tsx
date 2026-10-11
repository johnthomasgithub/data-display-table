import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import PageBar from "@/components/PageBar";
import ExpenseVoucherForm from "@/components/ExpenseVoucherForm";
import { useApi, useSession } from "@/lib/auth";
import type { RecordData } from "@/lib/records";
import { voucherSummary, type VoucherFormState } from "@/lib/voucher";

const VoucherFormPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api = useApi();
  const { employee } = useSession();

  const handleSave = async (state: VoucherFormState) => {
    const record = await api.createRecord("voucher", state as unknown as RecordData, voucherSummary(state));
    queryClient.invalidateQueries({ queryKey: ["records"] });
    toast.success("Voucher saved");
    // Replace the form in history, so "back" from the saved voucher goes home.
    navigate(`/saved/${record.id}`, { replace: true });
  };

  return (
    <>
      <PageBar title="New Voucher" fallback="/" />
      <ExpenseVoucherForm
        employeeName={employee.name}
        draftOwnerId={employee.id}
        submitLabel="Save & Generate Voucher"
        onSave={handleSave}
      />
    </>
  );
};

export default VoucherFormPage;
