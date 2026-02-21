import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/card";
import SelectWithOther from "@/components/SelectWithOther";
import type { ReportData } from "@/components/ServiceReport";

const CLIENT_OPTIONS = [
  "ABC Industries",
  "XYZ Corporation",
  "DEF Enterprises",
  "GHI Solutions",
];

const COMPLAINT_OPTIONS = [
  "Not Cooling",
  "Gas Leakage",
  "Compressor Failure",
  "Electrical Issue",
  "Noise / Vibration",
  "Water Leakage",
];

const INSPECTION_OPTIONS = [
  "Routine Check",
  "Breakdown Call",
  "Preventive Maintenance",
  "Installation",
  "Commissioning",
];

interface FormValues {
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
}

const ServiceReportForm = () => {
  const navigate = useNavigate();
  const { control, register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      client: "",
      date: undefined,
      natureOfComplaint: "",
      natureOfService: "",
      briefInspection: "",
      reportNo: "",
      equipment: "",
      condSlNo: "",
      evapSlNo: "",
      compModel: "",
      compSlNo: "",
      coolingCondition: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    const reportData: ReportData = {
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
    };

    // Navigate to report with data
    navigate("/report", { state: { reportData } });
  };

  return (
    <div className="min-h-screen bg-muted/50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Breakdown Service Report
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fill in the details below to generate the service report
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Client & Date */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Client */}
              <div className="space-y-2">
                <Label>Client</Label>
                <Controller
                  control={control}
                  name="client"
                  render={({ field }) => (
                    <SelectWithOther
                      options={CLIENT_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select client"
                    />
                  )}
                />
              </div>

              {/* Date */}
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
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
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

              {/* Report No */}
              <div className="space-y-2">
                <Label htmlFor="reportNo">Report No.</Label>
                <Input
                  id="reportNo"
                  placeholder="e.g. 810"
                  {...register("reportNo")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complaint & Service */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nature of Complaint */}
              <div className="space-y-2">
                <Label>Nature of Complaint</Label>
                <Controller
                  control={control}
                  name="natureOfComplaint"
                  render={({ field }) => (
                    <SelectWithOther
                      options={COMPLAINT_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select complaint type"
                    />
                  )}
                />
              </div>

              {/* Nature of Service - Radio */}
              <div className="space-y-2">
                <Label>Nature of Service</Label>
                <Controller
                  control={control}
                  name="natureOfService"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-4"
                    >
                      {[
                        { value: "warranty", label: "Warranty" },
                        { value: "amc", label: "AMC" },
                        { value: "chargeable", label: "Chargeable" },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`service-${opt.value}`}
                          />
                          <Label
                            htmlFor={`service-${opt.value}`}
                            className="font-normal cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Brief Report Inspection */}
              <div className="space-y-2">
                <Label>Brief Report Inspection</Label>
                <Controller
                  control={control}
                  name="briefInspection"
                  render={({ field }) => (
                    <SelectWithOther
                      options={INSPECTION_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select inspection type"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Equipment Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Equipment - Radio */}
              <div className="space-y-2">
                <Label>Equipment</Label>
                <Controller
                  control={control}
                  name="equipment"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-4"
                    >
                      {[
                        { value: "CR", label: "CR" },
                        { value: "CB", label: "CB" },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`equip-${opt.value}`}
                          />
                          <Label
                            htmlFor={`equip-${opt.value}`}
                            className="font-normal cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>

              {/* Serial numbers - 2-col grid on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condSlNo">Cond. Sl. No.</Label>
                  <Input
                    id="condSlNo"
                    placeholder="Enter serial no."
                    {...register("condSlNo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evapSlNo">Evap. Sl. No.</Label>
                  <Input
                    id="evapSlNo"
                    placeholder="Enter serial no."
                    {...register("evapSlNo")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compModel">Comp. Model</Label>
                  <Input
                    id="compModel"
                    placeholder="Enter model"
                    {...register("compModel")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compSlNo">Comp. Sl. No.</Label>
                  <Input
                    id="compSlNo"
                    placeholder="Enter serial no."
                    {...register("compSlNo")}
                  />
                </div>
              </div>

              {/* Cooling Condition - Radio */}
              <div className="space-y-2">
                <Label>Cooling Condition</Label>
                <Controller
                  control={control}
                  name="coolingCondition"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-4"
                    >
                      {[
                        { value: "air", label: "Air Cooled Cond." },
                        { value: "water", label: "Water Cooled Cond." },
                      ].map((opt) => (
                        <div
                          key={opt.value}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={opt.value}
                            id={`cool-${opt.value}`}
                          />
                          <Label
                            htmlFor={`cool-${opt.value}`}
                            className="font-normal cursor-pointer"
                          >
                            {opt.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button type="submit" className="w-full" size="lg">
            Generate Report
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ServiceReportForm;
