import type { ReportData } from "@/components/ServiceReport";
import type { VoucherData } from "@/lib/voucher";

/** Plain-text summary lines; the first line is the title. */
export function reportShareLines(data: ReportData): string[] {
  const title = data.reportType === "service" ? "Service Report" : "Breakdown Service Report";
  return [
    title,
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
  ];
}

export function voucherShareLines(d: VoucherData): string[] {
  return [
    "Expense Statement Voucher",
    `No: ${d.voucherNo || "-"}`,
    `Date: ${d.voucherDate || "-"}`,
    `Name: ${d.name || "-"}`,
    `Grand Total: ₹${d.grandTotal.toFixed(2)}`,
    `Advance Received: ₹${d.advanceReceived.toFixed(2)}`,
    `Net Total: ₹${d.netTotal.toFixed(2)}`,
  ];
}

export function shareOnWhatsApp(lines: string[]) {
  const [title, ...rest] = lines;
  const text = [`*${title}*`, ...rest].join("\n");
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

export function shareByEmail(lines: string[], subject: string) {
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`, "_self");
}
