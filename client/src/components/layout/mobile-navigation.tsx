
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { BarChart3, List, Send, MessageSquare, User } from "lucide-react";

export default function MobileNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: BarChart3, label: "Dashboard" },
    { path: "/transactions", icon: List, label: "Transactions" },
    { path: "/send-money", icon: Send, label: "Send" },
    { path: "/sms-confirmation", icon: MessageSquare, label: "SMS" },
    { path: "/personal-tracking", icon: User, label: "Personal" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 lg:hidden z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive 
                  ? "text-yasinga-primary bg-blue-50" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
