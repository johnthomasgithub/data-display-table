import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectWithOther from "@/components/SelectWithOther";
import SignatureCanvas from "@/components/SignatureCanvas";
import type { ReportData } from "@/components/ServiceReport";

const CLIENT_OPTIONS = [
"Castle rock Fisheries Pvt Ltd",
"SFP Foodstuff Pvt Ltd",
"Danson Food",
"MJ Bio Pharma",
"GCC Clip",
"Imagicaworld Entertainment",
"Novotel",
"Shree Sadhk Storage",
"Cranberry Foods",
];

const COMPLAINT_OPTIONS = [
"Temperature Not maintaining",
"MCB tripping",
"HP/LP Tripping",
"SPPR Alarm",
];

const INSPECTION_OPTIONS = [
"Short of Gas",
"Gas leakage",
"MCB Faulty",
"Wiring Problem",
"HP/LP Switch Faulty",
"Conductor Faulty",
"SPPR Faulty",
];

const STORAGE_KEY = "service-report-form-data";

interface FormValues {
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

const defaultValues: FormValues = {
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

function loadSaved(): FormValues {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultValues;
    const parsed = JSON.parse(raw);
    if (parsed.date) parsed.date = new Date(parsed.date);
    return { ...defaultValues, ...parsed };
  } catch {
    return defaultValues;
  }
}

const ServiceReportForm = () => {
  const navigate = useNavigate();
  const { control, register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: loadSaved(),
  });

  const formValues = watch();
  const reportType = watch("reportType");

  useEffect(() => {
    const timeout = setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formValues));
    }, 300);
    return () => clearTimeout(timeout);
  }, [formValues]);

  const handleClearForm = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    reset(defaultValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const onSubmit = (values: FormValues) => {
    const reportData: ReportData = {
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
    navigate("/report", { state: { reportData } });
  };

  const formTitle = reportType === "service" ? "Service Report" : "Breakdown Report";

  return (
    <div className="min-h-screen bg-muted/50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formTitle}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill in the details below to generate the service report
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className="space-y-6">

          {/* ── Report Type Selector ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Report Type</CardTitle>
              <CardDescription>Select the type of report to generate.</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="reportType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakdown">Breakdown Report</SelectItem>
                      <SelectItem value="service">Service Report</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </CardContent>
          </Card>

          {/* ── General Information ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">General Information</CardTitle>
              <CardDescription>Basic top-level details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Controller
                    control={control}
                    name="date"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportNo">Report No.</Label>
                  <Input id="reportNo" placeholder="e.g. 810" {...register("reportNo")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Client</Label>
                <Controller
                  control={control}
                  name="client"
                  render={({ field }) => (
                    <SelectWithOther options={CLIENT_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select client" />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Nature of Complaint</Label>
                <Controller
                  control={control}
                  name="natureOfComplaint"
                  render={({ field }) => (
                    <SelectWithOther options={COMPLAINT_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select complaint type" />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Service Details ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Service Details</CardTitle>
              <CardDescription>Service classification related info.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nature of Service</Label>
                <Controller
                  control={control}
                  name="natureOfService"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                      {[
                        { value: "warranty", label: "Warranty" },
                        { value: "amc", label: "AMC" },
                        { value: "chargeable", label: "Chargeable" },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`service-${opt.value}`} />
                          <Label htmlFor={`service-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Brief Report Inspection</Label>
                <Controller
                  control={control}
                  name="briefInspection"
                  render={({ field }) => (
                    <SelectWithOther options={INSPECTION_OPTIONS} value={field.value} onChange={field.onChange} placeholder="Select inspection type" />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Equipment Information ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Equipment Information</CardTitle>
              <CardDescription>Core equipment identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Equipment Type</Label>
                <Controller
                  control={control}
                  name="equipment"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                      {[{ value: "CR", label: "CR" }, { value: "CB", label: "CB" }].map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`equip-${opt.value}`} />
                          <Label htmlFor={`equip-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condSlNo">Cond. Sl. No.</Label>
                  <Input id="condSlNo" placeholder="Enter serial no." {...register("condSlNo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evapSlNo">Evap. Sl. No.</Label>
                  <Input id="evapSlNo" placeholder="Enter serial no." {...register("evapSlNo")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compModel">Comp. Model</Label>
                  <Input id="compModel" placeholder="Enter model" {...register("compModel")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compSlNo">Comp. Sl. No.</Label>
                  <Input id="compSlNo" placeholder="Enter serial no." {...register("compSlNo")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Condenser Type</Label>
                <Controller
                  control={control}
                  name="coolingCondition"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                      {[
                        { value: "air", label: "Air Cooled" },
                        { value: "water", label: "Water Cooled" },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`cool-${opt.value}`} />
                          <Label htmlFor={`cool-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Electrical / Voltage Details ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Electrical / Voltage Details</CardTitle>
              <CardDescription>Voltage measurement section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Voltage</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="voltageRY" className="text-xs">RY</Label>
                    <Input id="voltageRY" {...register("voltageRY")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="voltageYB" className="text-xs">YB</Label>
                    <Input id="voltageYB" {...register("voltageYB")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="voltageBR" className="text-xs">BR</Label>
                    <Input id="voltageBR" {...register("voltageBR")} />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Readings</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {[
                    { id: "rtC", label: "RT °C" },
                    { id: "sp", label: "SP" },
                    { id: "dp", label: "DP" },
                    { id: "op", label: "OP" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1">
                      <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                      <Input id={f.id} {...register(f.id as keyof FormValues)} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Amperage</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { id: "compA", label: "Comp A" },
                    { id: "condA", label: "Cond A" },
                    { id: "evapA", label: "Evap A" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1">
                      <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                      <Input id={f.id} {...register(f.id as keyof FormValues)} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Pressure & Control Settings ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pressure & Control Settings</CardTitle>
              <CardDescription>Cut In / Cut Out section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cut In</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="cutInHp" className="text-xs">HP</Label>
                    <Input id="cutInHp" {...register("cutInHp")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cutInLp" className="text-xs">LP</Label>
                    <Input id="cutInLp" {...register("cutInLp")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cutInThermostate" className="text-xs">Thermostat</Label>
                    <Input id="cutInThermostate" {...register("cutInThermostate")} />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Cut Out</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="cutOutHp" className="text-xs">HP</Label>
                    <Input id="cutOutHp" {...register("cutOutHp")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cutOutLp" className="text-xs">LP</Label>
                    <Input id="cutOutLp" {...register("cutOutLp")} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cutOutThermostate" className="text-xs">Thermostat</Label>
                    <Input id="cutOutThermostate" {...register("cutOutThermostate")} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Compressor & Indicator ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Compressor & Indicator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="compressorOilLevel">Compressor Oil Level</Label>
                  <Input id="compressorOilLevel" {...register("compressorOilLevel")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liquidIndicatorLevel">Liquid Indicator Level</Label>
                  <Input id="liquidIndicatorLevel" {...register("liquidIndicatorLevel")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Heater Details ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Heater Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Coil Heater", nos: "coilHeaterNos", amps: "coilHeaterAmps" },
                { label: "Tray Heater", nos: "trayHeaterNos", amps: "trayHeaterAmps" },
                { label: "Drain Heater", nos: "drainHeaterNos", amps: "drainHeaterAmps" },
              ].map((heater) => (
                <div key={heater.label}>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">{heater.label}</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-1">
                      <Label htmlFor={heater.nos} className="text-xs">Nos</Label>
                      <Input id={heater.nos} {...register(heater.nos as keyof FormValues)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={heater.amps} className="text-xs">Amps</Label>
                      <Input id={heater.amps} {...register(heater.amps as keyof FormValues)} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ── Service Summary ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Service Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="serviceRendered">Service Rendered</Label>
                <Textarea id="serviceRendered" rows={4} placeholder="Describe the service rendered..." {...register("serviceRendered")} />
              </div>
            </CardContent>
          </Card>

          {/* ── Material Usage ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Material Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="materialUsed">Material Used</Label>
                <Textarea id="materialUsed" rows={3} placeholder="List materials used..." {...register("materialUsed")} />
              </div>
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Controller
                  control={control}
                  name="materialType"
                  render={({ field }) => (
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-4">
                      {[
                        { value: "chargeable", label: "Chargeable" },
                        { value: "nonChargeable", label: "Non Chargeable" },
                      ].map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value} id={`mat-${opt.value}`} />
                          <Label htmlFor={`mat-${opt.value}`} className="font-normal cursor-pointer">{opt.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Customer Section ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Customer Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerRemarks">Customer's Remarks</Label>
                <Textarea id="customerRemarks" rows={3} placeholder="Customer remarks..." {...register("customerRemarks")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input id="customerName" placeholder="Enter name" {...register("customerName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerMobile">Mobile No.</Label>
                  <Input id="customerMobile" placeholder="Enter mobile number" {...register("customerMobile")} />
                </div>
              </div>
              <Controller
                control={control}
                name="customerSignature"
                render={({ field }) => (
                  <SignatureCanvas value={field.value} onChange={field.onChange} label="Customer Signature with Seal" />
                )}
              />
            </CardContent>
          </Card>

          {/* ── Technician Section ── */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Technician Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="technicianRemarks">Technician's Remarks</Label>
                <Textarea id="technicianRemarks" rows={3} placeholder="Technician remarks..." {...register("technicianRemarks")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technicianName">Technician Name</Label>
                  <Input id="technicianName" placeholder="Enter name" {...register("technicianName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technicianMobile">Mobile No.</Label>
                  <Input id="technicianMobile" placeholder="Enter mobile number" {...register("technicianMobile")} />
                </div>
              </div>
              <Controller
                control={control}
                name="technicianSignature"
                render={({ field }) => (
                  <SignatureCanvas value={field.value} onChange={field.onChange} label="Technician Signature with Mob. No." />
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" className="flex-1" size="lg">
              Generate Report
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={handleClearForm} className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Clear Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceReportForm;
