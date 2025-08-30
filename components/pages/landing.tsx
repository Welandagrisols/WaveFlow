import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Shield, Smartphone } from "lucide-react";

export default function Landing() {
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
            onClick={() => window.location.href = '/api/login'}
            className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 text-lg px-8 py-3"
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:transform hover:-translate-y-1 hover:transition-transform hover:duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">M-Pesa Integration</h3>
              <p className="text-sm text-slate-600">Automatically capture and categorize your M-Pesa transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:transform hover:-translate-y-1 hover:transition-transform hover:duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Smart Analytics</h3>
              <p className="text-sm text-slate-600">Get insights into your spending patterns and financial health</p>
            </CardContent>
          </Card>

          <Card className="bg-white p-6 rounded-xl shadow-sm border border-yasinga-slate-200 hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-yasinga-primary/20 transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yasinga-success/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-yasinga-success/20">
                <Shield className="w-6 h-6 text-yasinga-success" />
              </div>
              <h3 className="text-lg font-semibold text-yasinga-slate-800 mb-2">Bank-Level Security</h3>
              <p className="text-sm text-yasinga-slate-600">Your financial data is encrypted and protected with enterprise security</p>
            </CardContent>
          </Card>

          <Card className="bg-white p-6 rounded-xl shadow-sm border border-yasinga-slate-200 hover:transform hover:-translate-y-1 hover:shadow-lg hover:border-yasinga-warning/20 transition-all duration-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yasinga-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4 border border-yasinga-warning/20">
                <Wallet className="w-6 h-6 text-yasinga-warning" />
              </div>
              <h3 className="text-lg font-semibold text-yasinga-slate-800 mb-2">Expense Tracking</h3>
              <p className="text-sm text-yasinga-slate-600">Track business and personal expenses with intelligent categorization</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to take control of your finances?</h2>
              <p className="text-slate-600 mb-6">
                Join thousands of users who trust Yasinga to manage their M-Pesa transactions and financial tracking.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                data-testid="button-signup"
              >
                Start Tracking Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
