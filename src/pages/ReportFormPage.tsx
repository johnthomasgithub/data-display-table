import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import PageBar from "@/components/PageBar";
import ServiceReportForm from "@/components/ServiceReportForm";
import { useApi, useSession } from "@/lib/auth";
import type { RecordData } from "@/lib/records";
import { serviceRecordType, serviceSummary, type ServiceFormValues } from "@/lib/serviceReport";

const ReportFormPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const api = useApi();
  const { employee } = useSession();

  const handleSave = async (values: ServiceFormValues) => {
    const record = await api.createRecord(serviceRecordType(values), values as unknown as RecordData, serviceSummary(values));
    queryClient.invalidateQueries({ queryKey: ["records"] });
    toast.success("Report saved");
    // Replace the form in history, so "back" from the saved report goes home.
    navigate(`/saved/${record.id}`, { replace: true });
  };

  return (
    <>
      <PageBar title="New Report" fallback="/" />
      <ServiceReportForm
        technicianName={employee.name}
        draftOwnerId={employee.id}
        submitLabel="Save & Generate Report"
        onSave={handleSave}
      />
    </>
  );
};

export default ReportFormPage;
