import { useLocation, useNavigate } from "react-router-dom";
import ExpenseVoucher from "@/components/ExpenseVoucher";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

const VoucherReportPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const voucherData = location.state?.voucherData;

  const handleWhatsAppShare = () => {
    const d = voucherData || {};
    const text = [
      `*Expense Statement Voucher*`,
      `No: ${d.voucherNo || "-"}`,
      `Date: ${d.voucherDate || "-"}`,
      `Name: ${d.name || "-"}`,
      `Grand Total: ₹${d.grandTotal?.toFixed(2) || "0.00"}`,
      `Advance Received: ₹${d.advanceReceived?.toFixed(2) || "0.00"}`,
      `Net Total: ₹${d.netTotal?.toFixed(2) || "0.00"}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleEmailShare = () => {
    const d = voucherData || {};
    const subject = `Expense Statement Voucher #${d.voucherNo || ""}`;
    const body = [
      `Expense Statement Voucher`,
      `No: ${d.voucherNo || "-"}`,
      `Date: ${d.voucherDate || "-"}`,
      `Name: ${d.name || "-"}`,
      `Grand Total: ₹${d.grandTotal?.toFixed(2) || "0.00"}`,
      `Advance Received: ₹${d.advanceReceived?.toFixed(2) || "0.00"}`,
      `Net Total: ₹${d.netTotal?.toFixed(2) || "0.00"}`,
    ].join("\n");
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_self");
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 py-4 bg-muted/50 print:hidden px-4">
        <Button variant="outline" onClick={() => navigate("/voucher-form")}>
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
      <ExpenseVoucher data={voucherData} />
    </div>
  );
};

export default VoucherReportPage;
