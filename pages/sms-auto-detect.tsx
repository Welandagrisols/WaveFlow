import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SmsAutoDetector } from "@/components/SmsAutoDetector";
import { ArrowLeft, Smartphone, Zap } from "lucide-react";
import Link from "next/link";

export default function SmsAutoDetectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-800">
                  M-Pesa Expense Tracking
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user.firstName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Banner */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Your Primary Expense Tracking Solution
                </h3>
                <p className="text-blue-800 text-sm mb-3">
                  Yasinga's core functionality automatically monitors your SMS messages for M-Pesa transactions 
                  and creates expense records without any manual input. This is the main way you'll track 
                  business expenses - perfect for busy restaurant and hotel owners processing multiple daily transactions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Key Features:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Real-time SMS monitoring</li>
                      <li>• Automatic transaction parsing</li>
                      <li>• Dual-SIM card support</li>
                      <li>• Business/personal classification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Smart Detection:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Recognizes M-Pesa message formats</li>
                      <li>• Extracts amounts and recipient names</li>
                      <li>• Suggests expense categories</li>
                      <li>• Creates transaction records automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SMS Auto-Detector Component */}
        <SmsAutoDetector />

        {/* Mobile App Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Mobile App Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                In the full mobile app version, these additional features are available:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Background Processing</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Continuous SMS monitoring even when app is closed</li>
                    <li>• Instant push notifications for new transactions</li>
                    <li>• Battery-optimized background processing</li>
                    <li>• Automatic sync across devices</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Advanced Detection</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Support for all network operators (Safaricom, Airtel, etc.)</li>
                    <li>• Historical SMS import and processing</li>
                    <li>• Machine learning for better categorization</li>
                    <li>• Supplier recognition and auto-tagging</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Note:</span> This web version demonstrates 
                  the automatic processing capabilities. To use full SMS detection on your 
                  phone, you would need to install the mobile app version with appropriate 
                  SMS permissions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}