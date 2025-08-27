import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import SendMoney from "@/pages/send-money";
import TrackPayments from "@/pages/track-payments";
import Reports from "@/pages/reports";
import SmsConfirmation from "@/pages/sms-confirmation";
import PersonalTracking from "@/pages/personal-tracking";
import SIMManagement from "@/pages/sim-management";
import MainLayout from "@/components/layout/main-layout";
import Login from "@/pages/login"; // Assuming Login component is in '@/pages/login'

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading Yasinga...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={user ? Dashboard : Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={user ? () => <MainLayout><Dashboard /></MainLayout> : () => <Login />} />
      <Route path="/transactions" component={user ? () => <MainLayout><Transactions /></MainLayout> : () => <Login />} />
      <Route path="/send-money" component={user ? () => <MainLayout><SendMoney /></MainLayout> : () => <Login />} />
      <Route path="/track-payments" component={user ? () => <MainLayout><TrackPayments /></MainLayout> : () => <Login />} />
      <Route path="/reports" component={user ? () => <MainLayout><Reports /></MainLayout> : () => <Login />} />
      <Route path="/sms-confirmation" component={user ? () => <MainLayout><SmsConfirmation /></MainLayout> : () => <Login />} />
      <Route path="/personal-tracking" component={user ? () => <MainLayout><PersonalTracking /></MainLayout> : () => <Login />} />
      <Route path="/sim-management" component={user ? () => <MainLayout><SIMManagement /></MainLayout> : () => <Login />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;