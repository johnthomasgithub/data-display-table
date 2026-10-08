import { format } from "date-fns";
import type { ReportData } from "@/components/ServiceReport";
import type { RecordSummary, RecordType } from "@/lib/records";

// Data model for the Service / Breakdown report form. The form values are what
// gets saved, so a saved report can be opened again in the same form.

export interface ServiceFormValues {
  reportType: "service" | "breakdown";
  client: string;
  date: Date | undefined;
  natureOfComplaint: string;
  natureOfService: string;
  briefInspection: string;
  reportNo: string;
  equipment: string;
  condSlNo: string;
  evapSlNo: string;
  compModel: string;
  compSlNo: string;
  coolingCondition: string;
  voltageRY: string;
  voltageYB: string;
  voltageBR: string;
  rtC: string;
  sp: string;
  dp: string;
  op: string;
  compA: string;
  condA: string;
  evapA: string;
  cutInHp: string;
  cutInLp: string;
  cutInThermostate: string;
  cutOutHp: string;
  cutOutLp: string;
  cutOutThermostate: string;
  compressorOilLevel: string;
  liquidIndicatorLevel: string;
  coilHeaterNos: string;
  coilHeaterAmps: string;
  trayHeaterNos: string;
  trayHeaterAmps: string;
  drainHeaterNos: string;
  drainHeaterAmps: string;
  serviceRendered: string;
  materialUsed: string;
  materialType: string;
  customerRemarks: string;
  customerName: string;
  customerMobile: string;
  customerSignature: string;
  technicianRemarks: string;
  technicianName: string;
  technicianMobile: string;
  technicianSignature: string;
}

export const defaultServiceValues: ServiceFormValues = {
  reportType: "breakdown",
  client: "", date: undefined, natureOfComplaint: "", natureOfService: "",
  briefInspection: "", reportNo: "", equipment: "", condSlNo: "", evapSlNo: "",
  compModel: "", compSlNo: "", coolingCondition: "",
  voltageRY: "", voltageYB: "", voltageBR: "",
  rtC: "", sp: "", dp: "", op: "", compA: "", condA: "", evapA: "",
  cutInHp: "", cutInLp: "", cutInThermostate: "",
  cutOutHp: "", cutOutLp: "", cutOutThermostate: "",
  compressorOilLevel: "", liquidIndicatorLevel: "",
  coilHeaterNos: "", coilHeaterAmps: "",
  trayHeaterNos: "", trayHeaterAmps: "",
  drainHeaterNos: "", drainHeaterAmps: "",
  serviceRendered: "", materialUsed: "", materialType: "",
  customerRemarks: "", customerName: "", customerMobile: "", customerSignature: "",
  technicianRemarks: "", technicianName: "", technicianMobile: "", technicianSignature: "",
};

export const SERVICE_SIGNATURE_FIELDS = ["customerSignature", "technicianSignature"];

/** Restores Date objects after the values went through JSON (storage or database). */
export function reviveServiceValues(raw: Record<string, unknown>): ServiceFormValues {
  const values = { ...defaultServiceValues, ...raw } as ServiceFormValues;
  values.date = typeof raw.date === "string" && raw.date ? new Date(raw.date) : undefined;
  return values;
}

export const serviceRecordType = (values: ServiceFormValues): RecordType =>
  values.reportType === "service" ? "service" : "breakdown";

export function serviceSummary(values: ServiceFormValues): RecordSummary {
  return {
    refNo: values.reportNo,
    client: values.client,
    person: values.technicianName,
    date: values.date ? format(values.date, "yyyy-MM-dd") : "",
  };
}

/** Form values → what the printable report shows. */
export function toReportData(values: ServiceFormValues): ReportData {
  return {
    reportType: values.reportType,
    client: values.client,
    date: values.date ? format(values.date, "dd/MM/yyyy") : "",
    natureOfComplaint: values.natureOfComplaint,
    warranty: values.natureOfService === "warranty",
    amc: values.natureOfService === "amc",
    chargeable: values.natureOfService === "chargeable",
    briefInspection: values.briefInspection,
    reportNo: values.reportNo,
    equipmentCR: values.equipment === "CR",
    equipmentCB: values.equipment === "CB",
    condSlNo: values.condSlNo,
    evapSlNo: values.evapSlNo,
    compModel: values.compModel,
    compSlNo: values.compSlNo,
    airCooledCond: values.coolingCondition === "air",
    waterCooledCond: values.coolingCondition === "water",
    voltageRY: values.voltageRY,
    voltageYB: values.voltageYB,
    voltageBR: values.voltageBR,
    rtC: values.rtC,
    sp: values.sp,
    dp: values.dp,
    op: values.op,
    compA: values.compA,
    condA: values.condA,
    evapA: values.evapA,
    cutInHp: values.cutInHp,
    cutInLp: values.cutInLp,
    cutInThermostate: values.cutInThermostate,
    cutOutHp: values.cutOutHp,
    cutOutLp: values.cutOutLp,
    cutOutThermostate: values.cutOutThermostate,
    compressorOilLevel: values.compressorOilLevel,
    liquidIndicatorLevel: values.liquidIndicatorLevel,
    coilHeaterNos: values.coilHeaterNos,
    coilHeaterAmps: values.coilHeaterAmps,
    trayHeaterNos: values.trayHeaterNos,
    trayHeaterAmps: values.trayHeaterAmps,
    drainHeaterNos: values.drainHeaterNos,
    drainHeaterAmps: values.drainHeaterAmps,
    serviceRendered: values.serviceRendered,
    materialUsed: values.materialUsed,
    materialChargeable: values.materialType === "chargeable",
    materialNonChargeable: values.materialType === "nonChargeable",
    customerRemarks: values.customerRemarks,
    customerName: values.customerName,
    customerMobile: values.customerMobile,
    customerSignatureImg: values.customerSignature,
    technicianRemarks: values.technicianRemarks,
    technicianName: values.technicianName,
    technicianMobile: values.technicianMobile,
    technicianSignatureImg: values.technicianSignature,
  };
}
