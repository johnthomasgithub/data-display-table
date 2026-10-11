import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { isCloudEnabled } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import AuthProvider from "@/components/AuthProvider";
import UserBar from "@/components/UserBar";
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import ReportFormPage from "./pages/ReportFormPage";
import VoucherFormPage from "./pages/VoucherFormPage";
import SavedListPage from "./pages/SavedListPage";
import SavedViewPage from "./pages/SavedViewPage";
import SavedEditPage from "./pages/SavedEditPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  // Keep screens cached for a moment so going back is instant.
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30_000 } },
});

/** Every screen is behind the PIN login. */
const AppRoutes = () => {
  const { session } = useAuth();
  if (!session) return <LoginPage />;

  return (
    <>
      <UserBar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/report-form" element={<ReportFormPage />} />
        <Route path="/voucher-form" element={<VoucherFormPage />} />
        <Route path="/saved" element={<SavedListPage />} />
        <Route path="/saved/:id" element={<SavedViewPage />} />
        <Route path="/saved/:id/edit" element={<SavedEditPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      {!isCloudEnabled && (
        <div className="bg-amber-100 text-amber-900 text-xs text-center px-4 py-1.5 print:hidden">
          Local demo mode: Supabase is not configured, so records are saved in this browser only.
        </div>
      )}
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
