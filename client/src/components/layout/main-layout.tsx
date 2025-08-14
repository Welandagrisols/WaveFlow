import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const getPageTitle = () => {
    const titles: { [key: string]: string } = {
      '/': 'Dashboard',
      '/transactions': 'Transactions',
      '/send-money': 'Send Money',
      '/track-payments': 'Track Payments',
      '/reports': 'Reports',
    };
    return titles[location] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle()}
        />
        
        <main className="yasinga-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
