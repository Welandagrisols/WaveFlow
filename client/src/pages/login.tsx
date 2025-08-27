
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, ArrowRight, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Y</span>
            </div>
            <span className="text-xl font-bold text-slate-800">Yasinga</span>
          </div>
          <Badge variant="secondary" className="bg-teal-100 text-teal-700">
            <div className="w-2 h-2 bg-teal-500 rounded-full mr-2 animate-pulse"></div>
            Online
          </Badge>
        </div>
      </header>

      {/* Login Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back!
            </h1>
            <p className="text-slate-600">
              Track your M-Pesa transactions and manage your finances
            </p>
          </div>

          {/* Main Login Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl mb-8">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800">
                Start Automatic M-Pesa Tracking
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <p className="text-slate-600 text-center text-sm leading-relaxed">
                Yasinga automatically detects your M-Pesa transactions from SMS messages and tracks your business expenses in real-time
              </p>
              
              <Button
                onClick={handleLogin}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Zap className="w-5 h-5 mr-2" />
                Automatic SMS Detection
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <p className="text-xs text-slate-500 text-center leading-relaxed">
                The smart way to track M-Pesa transactions. Yasinga monitors your SMS messages, automatically extracts transaction data, and categorizes expenses for your business.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-slate-800 mb-1">Smart Detection</p>
                <p className="text-xs text-slate-600">Auto-process SMS</p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-xs font-medium text-slate-800 mb-1">Secure</p>
                <p className="text-xs text-slate-600">Bank-level security</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
