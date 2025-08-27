
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Shield, Smartphone } from "lucide-react";
import { useRouter } from "next/router";

export default function Landing() {
  const router = useRouter();

  const handleGetStarted = () => {
    // For now, we'll simulate login by setting a user in localStorage
    // In production, this would be handled by your authentication system
    const mockUser = {
      id: "1",
      email: "demo@yasinga.app",
      firstName: "Demo",
      lastName: "User"
    };
    
    localStorage.setItem('yasinga_user', JSON.stringify(mockUser));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-800">Yasinga</h1>
              <p className="text-lg text-slate-600">Secure M-Pesa Expense Tracker</p>
            </div>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Track your M-Pesa transactions, categorize expenses automatically, and gain insights into your financial habits with our beautiful, secure platform.
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-lg"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Smartphone className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">SMS Auto-Detection</h3>
              <p className="text-slate-600">
                Automatically detect and parse M-Pesa SMS messages for seamless expense tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
              <p className="text-slate-600">
                Get insights into your spending patterns with beautiful charts and reports.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-slate-600">
                Your financial data is encrypted and stored securely with industry-standard protection.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Take Control of Your Finances Today
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join thousands of users who trust Yasinga to manage their M-Pesa transactions.
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Start Free Trial
          </Button>
        </div>
      </div>
    </div>
  );
}
