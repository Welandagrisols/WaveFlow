
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/pages/Dashboard";
import Landing from "@/components/pages/Landing";

export default function HomePage() {
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

  return user ? <Dashboard /> : <Landing />;
}
