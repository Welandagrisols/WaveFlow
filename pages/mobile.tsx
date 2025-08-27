import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function MobilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}