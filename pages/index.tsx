import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, BarChart3, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">Yasinga</h1>
          </div>
          <Link href="/dashboard">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
            Track Your M-Pesa Transactions
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Yasinga helps you manage and track your M-Pesa transactions with ease. 
            Get insights, set budgets, and take control of your mobile money.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                <Smartphone className="w-5 h-5 mr-2" />
                Start Tracking
              </Button>
            </Link>
            <Link href="/confirm-sms">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                Add SMS Data
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">
            Why Choose Yasinga?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>SMS Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Automatically import your M-Pesa transaction data from SMS messages
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Get detailed insights and reports on your spending patterns
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Your data is encrypted and stored securely with bank-level security
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}