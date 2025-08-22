import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Search, Bell, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PWAStatus } from "@/components/PWAStatus";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
}

export default function Header({ onMenuClick, title }: HeaderProps) {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-slate-600 hover:text-slate-800 p-2"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-semibold text-slate-800" data-testid="page-title">
            {title}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* PWA Status */}
          <PWAStatus />
          
          {/* Search */}
          <div className="relative hidden sm:block">
            <Input
              type="search"
              placeholder="Search transactions..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-64 pl-10 pr-4"
              data-testid="input-search"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          </div>
          
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-slate-600 hover:text-slate-800 hover:bg-slate-100 p-2"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-3 h-3 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>
          
          {/* User Avatar */}
          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-yasinga-primary hover:ring-offset-2 transition-all" data-testid="avatar-user">
            <AvatarImage src={user?.profileImageUrl} alt={user?.firstName} />
            <AvatarFallback className="bg-slate-300 text-slate-600">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
