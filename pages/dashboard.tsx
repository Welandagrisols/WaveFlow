
export default function DashboardRedirect() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yasinga-primary mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting to dashboard...</p>
        <script dangerouslySetInnerHTML={{
          __html: `window.location.href = '/';`
        }} />
      </div>
    </div>
  );
}
