import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import BottomNavBar from "@/components/BottomNavBar";
import Navbar from "@/components/Navbar";
import DemoBanner from "@/components/DemoBanner";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Missions from "./pages/Missions";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import Survey from "./pages/Survey";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicLanding = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
};

/** Mobile app shell with bottom nav + scrollable content */
const MobileAppShell = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col overflow-hidden bg-background" style={{ height: "100dvh" }}>
    <DemoBanner />
    <div className="flex-1 overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
      {children}
    </div>
    <BottomNavBar />
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const appShellPaths = ["/dashboard", "/missions", "/insights", "/profile"];
  const isAppShell = appShellPaths.includes(location.pathname);
  const hideNav = isAppShell || ["/onboarding", "/auth", "/survey"].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <Routes>
        <Route path="/" element={<PublicLanding />} />
        <Route path="/survey" element={<Survey />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MobileAppShell>
                <Dashboard />
              </MobileAppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/missions"
          element={
            <ProtectedRoute>
              <MobileAppShell>
                <Missions />
              </MobileAppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <MobileAppShell>
                <Insights />
              </MobileAppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MobileAppShell>
                <Profile />
              </MobileAppShell>
            </ProtectedRoute>
          }
        />
        {/* Keep /settings as alias for profile */}
        <Route path="/settings" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
