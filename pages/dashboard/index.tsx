import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to home
        router.replace("/");
      } else {
        // User is authenticated, ready to show dashboard
        setDashboardLoading(false);
      }
    }
  }, [user, loading, router]);

  if (loading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-blue-600 font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render a simple working dashboard for now
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yasinga Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your M-Pesa expense tracker</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Balance</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">KSh 0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">This Month Income</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">KSh 0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">This Month Expenses</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">KSh 0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions yet. Connect your M-Pesa account to start tracking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}