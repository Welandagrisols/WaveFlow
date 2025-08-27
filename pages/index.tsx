
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/pages/Dashboard';
import Landing from '@/components/pages/Landing';

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Ensure client-side rendering
    if (typeof window === 'undefined') return;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Dashboard />;
  }

  return <Landing />;
}
