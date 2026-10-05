import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import PageBar from "@/components/PageBar";
import ExpenseVoucherForm from "@/components/ExpenseVoucherForm";
import { createRecord, type RecordData } from "@/lib/records";
import { VOUCHER_SIGNATURE_FIELDS, voucherSummary, type VoucherFormState } from "@/lib/voucher";

const VoucherFormPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSave = async (state: VoucherFormState) => {
    const record = await createRecord(
      "voucher",
      state as unknown as RecordData,
      voucherSummary(state),
      VOUCHER_SIGNATURE_FIELDS,
    );
    queryClient.invalidateQueries({ queryKey: ["records"] });
    toast.success("Voucher saved");
    // Replace the form in history, so "back" from the saved voucher goes home.
    navigate(`/saved/${record.id}`, { replace: true });
  };

  return (
    <>
      <PageBar title="New Voucher" fallback="/" />
      <ExpenseVoucherForm submitLabel="Save & Generate Voucher" onSave={handleSave} />
    </>
  );
};

export default VoucherFormPage;
