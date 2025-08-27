import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "./sidebar";
import Header from "./header";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { isConnected, connectedDevices } = useRealtimeSync();

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
    <div className="min-h-screen bg-slate-50 app-content ios-safe-area">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          title={getPageTitle()}
        />
        
        {/* Real-time sync status - temporarily disabled */}
        {/* <div className="fixed top-4 right-4 z-50">
          <Badge 
            variant={isConnected ? "default" : "destructive"}
            className="flex items-center space-x-1"
          >
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span>{isConnected ? `${connectedDevices} device(s)` : 'Offline'}</span>
          </Badge>
        </div> */}
        
        <main className="yasinga-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
