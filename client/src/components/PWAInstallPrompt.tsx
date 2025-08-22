import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, X, Smartphone, Zap, Shield, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show install prompt after user has used the app for a bit
    if (isInstallable && !isInstalled && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !isInstallable || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="pwa-install-overlay">
      <Card className="w-full max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
            data-testid="button-dismiss-install"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl">Install Yasinga App</CardTitle>
          <CardDescription>
            Get the best experience with our native-like app
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Zap className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium">Faster Performance</div>
                <div className="text-gray-600 dark:text-gray-400">Native app speed</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Wifi className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium">Works Offline</div>
                <div className="text-gray-600 dark:text-gray-400">Use without internet</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Shield className="h-5 w-5 text-purple-600" />
              <div className="text-sm">
                <div className="font-medium">Secure & Private</div>
                <div className="text-gray-600 dark:text-gray-400">Your data stays safe</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              No App Store Required
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Instant Install
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleInstall} 
              className="flex-1"
              data-testid="button-install-app"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              data-testid="button-maybe-later"
            >
              Maybe Later
            </Button>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            The app will be added to your home screen and work like any other app
          </p>
        </CardContent>
      </Card>
    </div>
  );
}