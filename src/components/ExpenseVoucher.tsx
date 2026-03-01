import "./ExpenseVoucher.scss";
import glacetechLogo from "@/assets/glacetech-logo.png";
import type { VoucherData } from "./ExpenseVoucherForm";

interface Props {
  data?: VoucherData;
}

const formatAmt = (v: number) => v > 0 ? v.toFixed(2) : "";

const TOTAL_ROWS = 15; // fixed rows to match printed form

const ExpenseVoucher = ({ data }: Props) => {
  if (!data) return null;

  const rows = data.rows || [];
  const emptyRowsCount = Math.max(0, TOTAL_ROWS - rows.length);

  return (
    <div className="voucher-wrapper">
      <div className="voucher-page">
        {/* Title Bar */}
        <div className="voucher-title-bar">EXPENSE STATEMENT</div>

        {/* Header */}
        <div className="voucher-header">
          <div className="voucher-logo">
            <img src={glacetechLogo} alt="GlaceTech" className="voucher-logo-img" />
          </div>
          <div className="voucher-header-right">
            <div className="voucher-field">
              <span className="voucher-field-label">No.</span>
              <span className="voucher-field-value">{data.voucherNo}</span>
            </div>
            <div className="voucher-field">
              <span className="voucher-field-label">Date</span>
              <span className="voucher-field-value">{data.voucherDate}</span>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="voucher-name-row">
          <span className="voucher-field-label">NAME</span>
          <span className="voucher-field-value">{data.name}</span>
        </div>

        {/* Expense Table */}
        <table className="voucher-table">
          <thead>
            <tr>
              <th rowSpan={2} style={{ width: "10%" }}>Date</th>
              <th rowSpan={2} style={{ width: "28%" }}>Description</th>
              <th rowSpan={2} style={{ width: "15%" }}>Client</th>
              <th rowSpan={2} style={{ width: "15%" }}>Travel<br />Expenses</th>
              <th rowSpan={2} style={{ width: "15%" }}>Material<br />Expenses</th>
              <th rowSpan={2} style={{ width: "17%" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td className="text-left">{row.description}</td>
                <td>{row.client}</td>
                <td className="text-right">{formatAmt(row.travelExpenses)}</td>
                <td className="text-right">{formatAmt(row.materialExpenses)}</td>
                <td className="text-right">{formatAmt(row.total)}</td>
              </tr>
            ))}
            {[...Array(emptyRowsCount)].map((_, i) => (
              <tr key={`empty-${i}`}>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            {/* TOTAL row */}
            <tr className="total-row">
              <td></td>
              <td className="text-left font-bold">TOTAL</td>
              <td></td>
              <td className="text-right font-bold">
                {formatAmt(rows.reduce((s, r) => s + r.travelExpenses, 0))}
              </td>
              <td className="text-right font-bold">
                {formatAmt(rows.reduce((s, r) => s + r.materialExpenses, 0))}
              </td>
              <td className="text-right font-bold">{formatAmt(data.grandTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Summary rows */}
        <table className="voucher-summary-table">
          <tbody>
            <tr>
              <td className="text-right summary-label">Advance Received :</td>
              <td className="text-right summary-value">{formatAmt(data.advanceReceived)}</td>
            </tr>
            <tr>
              <td className="text-right summary-label">Total :</td>
              <td className="text-right summary-value font-bold">{formatAmt(data.netTotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer signatures */}
        <div className="voucher-footer">
          <div className="voucher-footer-item">
            <div className="voucher-sign-space"></div>
            <div className="voucher-footer-label">Checked</div>
          </div>
          <div className="voucher-footer-item">
            {data.technicianSignatureImg && (
              <img src={data.technicianSignatureImg} alt="Signature" className="voucher-sig-img" />
            )}
            <div className="voucher-footer-label">Signature<br />(Claimed)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseVoucher;
