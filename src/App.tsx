import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReportPage from "./pages/ReportPage";
import VoucherFormPage from "./pages/VoucherFormPage";
import VoucherReportPage from "./pages/VoucherReportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/report-form" element={<ReportFormPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/voucher-form" element={<VoucherFormPage />} />
          <Route path="/voucher-report" element={<VoucherReportPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Lazy-style import to keep existing report form on its own route
import ServiceReportForm from "@/components/ServiceReportForm";
const ReportFormPage = () => <ServiceReportForm />;

export default App;
