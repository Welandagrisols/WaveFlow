import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Dashboard from "@/components/pages/Dashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <Dashboard />;
}