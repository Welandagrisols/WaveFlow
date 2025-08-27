
import { useAuth } from "@/hooks/useAuth";
import SmsConfirmation from "@/components/pages/sms-confirmation";
import MainLayout from "@/components/layout/main-layout";

export default function ConfirmSmsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-600 font-medium">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <SmsConfirmation />
    </MainLayout>
  );
}
