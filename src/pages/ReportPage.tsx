import { useLocation, useNavigate } from "react-router-dom";
import ServiceReport from "@/components/ServiceReport";
import { Button } from "@/components/ui/button";

const ReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reportData = location.state?.reportData;

  return (
    <div>
      <div className="flex justify-center gap-4 py-4 bg-muted/50 print:hidden">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back to Form
        </Button>
        <Button onClick={() => window.print()}>Print Report</Button>
      </div>
      <ServiceReport data={reportData} />
    </div>
  );
};

export default ReportPage;
