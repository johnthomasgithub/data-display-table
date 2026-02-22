import { useLocation, useNavigate } from "react-router-dom";
import ServiceReport from "@/components/ServiceReport";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData;

  const handleWhatsAppShare = () => {
    const data = reportData || {};
    const text = [
      `*Breakdown Service Report*`,
      `Report No: ${data.reportNo || "-"}`,
      `Date: ${data.date || "-"}`,
      `Client: ${data.client || "-"}`,
      `Complaint: ${data.natureOfComplaint || "-"}`,
      `Service: ${data.warranty ? "Warranty" : data.amc ? "AMC" : data.chargeable ? "Chargeable" : "-"}`,
      `Equipment: ${data.equipmentCR ? "CR" : data.equipmentCB ? "CB" : "-"}`,
      `Service Rendered: ${data.serviceRendered || "-"}`,
      `Material Used: ${data.materialUsed || "-"}`,
      `Customer: ${data.customerName || "-"}`,
      `Technician: ${data.technicianName || "-"}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmailShare = () => {
    const data = reportData || {};
    const subject = `Breakdown Service Report #${data.reportNo || ""}`;
    const body = [
      `Breakdown Service Report`,
      `Report No: ${data.reportNo || "-"}`,
      `Date: ${data.date || "-"}`,
      `Client: ${data.client || "-"}`,
      `Complaint: ${data.natureOfComplaint || "-"}`,
      `Service Rendered: ${data.serviceRendered || "-"}`,
      `Material Used: ${data.materialUsed || "-"}`,
      `Customer: ${data.customerName || "-"}`,
      `Technician: ${data.technicianName || "-"}`,
    ].join("\n");
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 py-4 bg-muted/50 print:hidden px-4">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back to Form
        </Button>
        <Button onClick={() => window.print()}>Print / Save PDF</Button>
        <Button variant="outline" onClick={handleWhatsAppShare} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" /> WhatsApp
        </Button>
        <Button variant="outline" onClick={handleEmailShare} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" /> Email
        </Button>
      </div>
      <ServiceReport data={reportData} />
    </div>
  );
};

export default ReportPage;
