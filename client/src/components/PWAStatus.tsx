import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, WifiOff, Wifi, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAStatus() {
  const { isInstallable, isInstalled, isOffline, installApp } = usePWA();

  return (
    <div className="flex items-center gap-2">
      {/* Offline/Online Status */}
      {isOffline ? (
        <Badge variant="destructive" className="text-xs" data-testid="status-offline">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </Badge>
      ) : (
        <Badge variant="default" className="text-xs bg-green-600" data-testid="status-online">
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </Badge>
      )}

      {/* Installation Status */}
      {isInstalled ? (
        <Badge variant="secondary" className="text-xs" data-testid="status-installed">
          <Smartphone className="h-3 w-3 mr-1" />
          App Mode
        </Badge>
      ) : isInstallable ? (
        <Button
          size="sm"
          variant="outline"
          onClick={installApp}
          className="h-6 text-xs px-2"
          data-testid="button-quick-install"
        >
          <Download className="h-3 w-3 mr-1" />
          Install
        </Button>
      ) : null}
    </div>
  );
}