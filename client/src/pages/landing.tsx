import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated]);

  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-800 to-red-700 rounded-lg flex items-center justify-center">
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

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-800 mb-4">
              Welcome to <span className="bg-gradient-to-r from-yasinga-primary to-yasinga-primary-dark bg-clip-text text-transparent">Yasinga</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Track your M-Pesa transactions and manage your finances with intelligent automation
            </p>
          </div>

          {/* Main Feature Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl max-w-2xl mx-auto mb-12">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-red-600" />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Start Automatic M-Pesa Tracking
              </h2>

              <p className="text-slate-600 mb-8 leading-relaxed">
                Yasinga automatically detects your M-Pesa transactions from SMS messages and tracks your business expenses in real-time
              </p>

              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#8B2635] hover:bg-[#6B1F2A] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Zap className="w-5 h-5 mr-2" />
                Automatic SMS Detection
              </Button>

              <p className="text-sm text-slate-500 mt-4">
                The smart way to track M-Pesa transactions. Yasinga monitors your SMS messages, automatically extracts transaction data, and categorizes expenses for your business.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Smart Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Automatically processes M-Pesa SMS messages and extracts transaction details.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg">Smart Categorization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Transactions are automatically categorized and added to your expense tracker.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-slate-600" />
                </div>
                <CardTitle className="text-lg">Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">
                  Your financial data is encrypted and stored securely with industry-standard protection.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-red-50 to-red-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Ready to get started?
              </h3>
              <p className="text-slate-600 mb-6">
                Join thousands of businesses already using Yasinga to streamline their expense tracking
              </p>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-[#8B2635] hover:bg-[#6B1F2A] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}