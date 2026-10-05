import { useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import logo from "@/assets/glacetech-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center flex flex-col items-center">
          <img src={logo} alt="GlaceTech" className="h-16 mb-2" />
          <p className="text-muted-foreground mt-1 text-sm">
            Select what you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate("/report-form")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <FileText className="h-10 w-10 text-primary flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-lg">Report</h2>
                <p className="text-sm text-muted-foreground">
                  Service Report / Breakdown Report
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate("/voucher-form")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <Receipt className="h-10 w-10 text-primary flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-lg">Voucher</h2>
                <p className="text-sm text-muted-foreground">
                  Expense Statement Voucher
                </p>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => navigate("/saved")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <FolderOpen className="h-10 w-10 text-primary flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-lg">Saved</h2>
                <p className="text-sm text-muted-foreground">
                  Find, open, edit and print old reports &amp; vouchers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
