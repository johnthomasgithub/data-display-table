import "./BreakdownServiceReport.scss";

export interface ReportData {
  date?: string;
  reportNo?: string;
  client?: string;
  natureOfComplaint?: string;
  warranty?: boolean;
  amc?: boolean;
  chargeable?: boolean;
  briefInspection?: string;
  equipmentReportNo?: string;
  equipmentCR?: boolean;
  equipmentCB?: boolean;
  condSlNo?: string;
  evapSlNo?: string;
  compModel?: string;
  compSlNo?: string;
  airCooledCond?: boolean;
  waterCooledCond?: boolean;
  voltageRY?: string;
  voltageYB?: string;
  voltageBR?: string;
  rtC?: string;
  sp?: string;
  dp?: string;
  op?: string;
  compA?: string;
  condA?: string;
  evapA?: string;
  compressorOilLevel?: string;
  liquidIndicatorLevel?: string;
  hp?: string;
  lp?: string;
  thermostate?: string;
  coilHeaterNos?: string;
  coilHeaterAmps?: string;
  trayHeaterNos?: string;
  trayHeaterAmps?: string;
  drainHeaterNos?: string;
  drainHeaterAmps?: string;
  cutIn?: string;
  cutOut?: string;
  serviceRendered?: string;
  materialUsed?: string;
  materialChargeable?: boolean;
  materialNonChargeable?: boolean;
  customerRemarks?: string;
  customerName?: string;
  technicianRemarks?: string;
  technicianName?: string;
}

interface Props {
  data?: ReportData;
}

const CB = ({ checked }: { checked?: boolean }) => (
  <span className="cb" style={checked ? { background: "#222" } : undefined} />
);

const BreakdownServiceReport = ({ data = {} }: Props) => {
  return (
    <div className="report-wrapper">
      <div className="report-page">

        {/* ── Header ── */}
        <div className="report-header">
          <div className="logo-area">
            <div className="logo-placeholder">GlaceTech</div>
            <div className="tagline">FOR EVERLASTING CHILLINESS</div>
          </div>
          <div className="contact-info">
            <div className="contact-title">PLEASE CONTACT US</div>
            <div>Cont No. : 7709422833</div>
            <div>Email : glacetech@gmail.com</div>
          </div>
        </div>
        <div className="report-address">
          1404, Bldg no 9, Serene Housing society, haware city, Thane – 400615. Maharashtra.
        </div>

        {/* ── Title Bar ── */}
        <div className="report-title-bar">
          <div className="title-label">Breakdown Service Report</div>
          <div className="report-no-area">
            <span className="report-no-label">Report No.:</span>
            <span className="report-no-value">{data.reportNo ?? "810"}</span>
          </div>
        </div>

        {/* ── Main Table ── */}
        <table className="report-table">
          <colgroup>
            <col style={{ width: "48%" }} />
            <col style={{ width: "52%" }} />
          </colgroup>
          <tbody>

            {/* Date */}
            <tr>
              <td>
                <span className="cell-label">Date :</span>&nbsp;&nbsp;{data.date ?? ""}
              </td>
              <td />
            </tr>

            {/* Client | Nature of Complaint */}
            <tr>
              <td className="cell-tall">
                <div className="cell-label">Client. :</div>
                <div>{data.client ?? ""}</div>
              </td>
              <td className="cell-tall">
                <div className="cell-label">Nature of Complaint :</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{data.natureOfComplaint ?? ""}</div>
              </td>
            </tr>

            {/* Nature of Service */}
            <tr>
              <td colSpan={2}>
                <div className="cell-label" style={{ marginBottom: 5 }}>Nature of Service</div>
                <div className="checkbox-group">
                  <label><CB checked={data.warranty} /> Warranty</label>
                  <label><CB checked={data.amc} /> AMC</label>
                  <label><CB checked={data.chargeable} /> Chargeable</label>
                </div>
              </td>
            </tr>

            {/* Brief Inspection (rowspan 7) | Equipment detail rows */}
            <tr>
              <td className="cell-xlarge" rowSpan={7} style={{ verticalAlign: "top" }}>
                <div className="cell-label">Brief report Inspection :</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{data.briefInspection ?? ""}</div>
              </td>
              <td>
                <span className="cell-label">Report No.</span>&nbsp;&nbsp;{data.equipmentReportNo ?? ""}
              </td>
            </tr>
            <tr>
              <td>
                <span className="cell-label">Equipment</span>&nbsp;&nbsp;
                <label style={{ marginRight: 10 }}><CB checked={data.equipmentCR} /> CR</label>
                <label><CB checked={data.equipmentCB} /> CB</label>
              </td>
            </tr>
            <tr>
              <td><span className="cell-label">Cond. Sl. No. :</span>&nbsp;&nbsp;{data.condSlNo ?? ""}</td>
            </tr>
            <tr>
              <td><span className="cell-label">Evap. Sl. No. :</span>&nbsp;&nbsp;{data.evapSlNo ?? ""}</td>
            </tr>
            <tr>
              <td><span className="cell-label">Comp. Model :</span>&nbsp;&nbsp;{data.compModel ?? ""}</td>
            </tr>
            <tr>
              <td><span className="cell-label">Comp. Sl.No.:</span>&nbsp;&nbsp;{data.compSlNo ?? ""}</td>
            </tr>
            <tr>
              <td>
                <label style={{ marginRight: 12 }}><CB checked={data.airCooledCond} /> Air Cooled Cond.</label>
                <label><CB checked={data.waterCooledCond} /> Water Cooled Cond</label>
              </td>
            </tr>

          </tbody>
        </table>

        {/* ── Measurements Table (7-col) ── */}
        <table className="report-table" style={{ marginTop: -1 }}>
          <colgroup>
            {[...Array(7)].map((_, i) => (
              <col key={i} style={{ width: `${100 / 7}%` }} />
            ))}
          </colgroup>
          <tbody>

            {/* Voltage */}
            <tr>
              <td><span className="cell-label">Voltage</span></td>
              <td><span className="cell-label">RY</span>&nbsp;&nbsp;{data.voltageRY ?? ""}</td>
              <td colSpan={2}><span className="cell-label">YB</span>&nbsp;&nbsp;{data.voltageYB ?? ""}</td>
              <td colSpan={3}><span className="cell-label">BR</span>&nbsp;&nbsp;{data.voltageBR ?? ""}</td>
            </tr>

            {/* Header row */}
            <tr>
              <td className="cell-section cell-center">RT °C</td>
              <td className="cell-section cell-center">SP</td>
              <td className="cell-section cell-center">DP</td>
              <td className="cell-section cell-center">OP</td>
              <td className="cell-section cell-center">Comp A</td>
              <td className="cell-section cell-center">Cond A</td>
              <td className="cell-section cell-center">Evap A</td>
            </tr>
            {/* Values */}
            <tr>
              <td className="cell-medium cell-center">{data.rtC ?? ""}</td>
              <td className="cell-medium cell-center">{data.sp ?? ""}</td>
              <td className="cell-medium cell-center">{data.dp ?? ""}</td>
              <td className="cell-medium cell-center">{data.op ?? ""}</td>
              <td className="cell-medium cell-center">{data.compA ?? ""}</td>
              <td className="cell-medium cell-center">{data.condA ?? ""}</td>
              <td className="cell-medium cell-center">{data.evapA ?? ""}</td>
            </tr>

            {/* Oil / Liquid level */}
            <tr>
              <td colSpan={3}>
                <span className="cell-label">Compressor Oil Level</span>&nbsp;&nbsp;{data.compressorOilLevel ?? ""}
              </td>
              <td colSpan={4}>
                <span className="cell-label">Liquid Indicator Level</span>&nbsp;&nbsp;{data.liquidIndicatorLevel ?? ""}
              </td>
            </tr>

            {/* Pressure switch / heater header */}
            <tr>
              <td className="cell-section" />
              <td className="cell-section cell-center">HP</td>
              <td className="cell-section cell-center">LP</td>
              <td className="cell-section cell-center">Thermostate</td>
              <td colSpan={1} className="cell-section" />
              <td className="cell-section cell-center">Nos</td>
              <td className="cell-section cell-center">Amps</td>
            </tr>
            {/* Coil heater row */}
            <tr>
              <td rowSpan={3} />
              <td className="cell-medium cell-center" rowSpan={3}>{data.hp ?? ""}</td>
              <td className="cell-medium cell-center" rowSpan={3}>{data.lp ?? ""}</td>
              <td className="cell-medium cell-center" rowSpan={3}>{data.thermostate ?? ""}</td>
              <td><span className="cell-label">Coil Heater</span></td>
              <td className="cell-center">{data.coilHeaterNos ?? ""}</td>
              <td className="cell-center">{data.coilHeaterAmps ?? ""}</td>
            </tr>
            <tr>
              <td><span className="cell-label">Tray Heater</span></td>
              <td className="cell-center">{data.trayHeaterNos ?? ""}</td>
              <td className="cell-center">{data.trayHeaterAmps ?? ""}</td>
            </tr>
            <tr>
              <td><span className="cell-label">Drain Heater</span></td>
              <td className="cell-center">{data.drainHeaterNos ?? ""}</td>
              <td className="cell-center">{data.drainHeaterAmps ?? ""}</td>
            </tr>

            {/* Cut In / Cut Out */}
            <tr>
              <td><span className="cell-label">Cut In</span></td>
              <td className="cell-center">{data.cutIn ?? ""}</td>
              <td colSpan={5} />
            </tr>
            <tr>
              <td><span className="cell-label">Cut Out</span></td>
              <td className="cell-center">{data.cutOut ?? ""}</td>
              <td colSpan={5} />
            </tr>

            {/* Service Rendered */}
            <tr>
              <td colSpan={7} className="cell-xlarge">
                <div className="cell-label" style={{ marginBottom: 4 }}>Service Rendered</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{data.serviceRendered ?? ""}</div>
              </td>
            </tr>

            {/* Material Used */}
            <tr>
              <td colSpan={3} className="cell-medium" style={{ verticalAlign: "top" }}>
                <div className="cell-label">Material Used</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{data.materialUsed ?? ""}</div>
              </td>
              <td colSpan={2} className="cell-center" style={{ verticalAlign: "middle" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <CB checked={data.materialChargeable} /> Chargeable
                </label>
              </td>
              <td colSpan={2} className="cell-center" style={{ verticalAlign: "middle" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
                  <CB checked={data.materialNonChargeable} /> Non Chargeable
                </label>
              </td>
            </tr>

            {/* Customer Remarks */}
            <tr>
              <td colSpan={7}>
                <div className="cell-label">Customer's Remark's</div>
                <div style={{ whiteSpace: "pre-wrap", minHeight: 20 }}>{data.customerRemarks ?? ""}</div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="cell-sig">
                <div className="cell-label">Name</div>
                <div>{data.customerName ?? ""}</div>
              </td>
              <td colSpan={3} className="cell-sig" style={{ textAlign: "right" }}>
                <div className="cell-label">Signature with Seal</div>
              </td>
            </tr>

            {/* Technician Remarks */}
            <tr>
              <td colSpan={7}>
                <div className="cell-label">Technician's Remark's</div>
                <div style={{ whiteSpace: "pre-wrap", minHeight: 20 }}>{data.technicianRemarks ?? ""}</div>
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="cell-sig">
                <div className="cell-label">Name :</div>
                <div>{data.technicianName ?? ""}</div>
              </td>
              <td colSpan={3} className="cell-sig" style={{ textAlign: "right" }}>
                <div className="cell-label">Signature with Mob. No.</div>
              </td>
            </tr>

          </tbody>
        </table>

      </div>
    </div>
  );
};

export default BreakdownServiceReport;
