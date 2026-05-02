import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { lazy, Suspense, useEffect } from "react";
import { toast } from "sonner";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

// Code-split heavy / less-frequent routes so first paint stays fast.
// Each chunk only loads when the user actually visits that route.
const Register = lazy(() => import("./pages/Register.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const Notices = lazy(() => import("./pages/Notices.tsx"));
const Committees = lazy(() => import("./pages/Committees.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Allocations = lazy(() => import("./pages/Allocations.tsx"));
const Secretariat = lazy(() => import("./pages/Secretariat.tsx"));
const NoticesPopup = lazy(() => import("@/components/NoticesPopup"));
const AdminGuard = lazy(() =>
  import("@/components/admin/AdminGuard").then((m) => ({ default: m.AdminGuard })),
);

// Sensible defaults for high-traffic load:
// - long staleTime: avoid refetch storms when many users tab-switch
// - retry once with backoff: don't hammer the DB on transient failures
// - no refetch on window focus by default
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const GlobalErrorListeners = () => {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      console.error("[window.error]", e.error || e.message);
      // Don't spam toasts for low-level resource/script errors users can't act on.
      if (e.error) toast.error(e.message || "Unexpected error");
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      console.error("[unhandledrejection]", e.reason);
      const msg =
        (e.reason && (e.reason.message || String(e.reason))) ||
        "Unexpected error";
      toast.error(msg);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
};

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GlobalErrorListeners />
        <BrowserRouter>
          <Suspense fallback={null}>
            <NoticesPopup />
          </Suspense>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<Register />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/committees" element={<Committees />} />
              <Route path="/about" element={<About />} />
              <Route path="/allocations" element={<Allocations />} />
              <Route path="/secretariat" element={<Secretariat />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
