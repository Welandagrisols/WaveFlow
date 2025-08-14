import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import SendMoney from "@/pages/send-money";
import TrackPayments from "@/pages/track-payments";
import Reports from "@/pages/reports";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          )} />
          <Route path="/transactions" component={() => (
            <MainLayout>
              <Transactions />
            </MainLayout>
          )} />
          <Route path="/send-money" component={() => (
            <MainLayout>
              <SendMoney />
            </MainLayout>
          )} />
          <Route path="/track-payments" component={() => (
            <MainLayout>
              <TrackPayments />
            </MainLayout>
          )} />
          <Route path="/reports" component={() => (
            <MainLayout>
              <Reports />
            </MainLayout>
          )} />
        </>
      )}
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
