
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Play, Pause, Settings } from "lucide-react";

export default function SmsAutoDetectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
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

  if (!user) {
    return null;
  }

  const toggleAutoDetect = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">SMS Auto-Detection</h1>
            <p className="text-slate-600">Configure automatic M-Pesa SMS monitoring</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Detection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Auto-Detection</span>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <Button 
                  onClick={toggleAutoDetect}
                  className="w-full"
                  variant={isActive ? "destructive" : "default"}
                >
                  {isActive ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Detection
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Detection
                    </>
                  )}
                </Button>

                {isActive && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ SMS auto-detection is running. New M-Pesa messages will be processed automatically.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Detection Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Supported SMS Types</label>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div>• M-Pesa payment confirmations</div>
                    <div>• M-Pesa received payments</div>
                    <div>• M-Pesa withdrawal confirmations</div>
                    <div>• M-Pesa deposit confirmations</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Detection works automatically when you receive M-Pesa SMS messages from Safaricom.
                  </p>
                </div>

                <Button 
                  onClick={() => router.push('/sms-confirmation')}
                  variant="outline"
                  className="w-full"
                >
                  View Pending Confirmations
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    1
                  </div>
                  <h3 className="font-semibold mb-2">SMS Detection</h3>
                  <p className="text-sm text-slate-600">
                    When you receive an M-Pesa SMS, our system automatically detects and parses it.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    2
                  </div>
                  <h3 className="font-semibold mb-2">Data Extraction</h3>
                  <p className="text-sm text-slate-600">
                    Transaction details like amount, recipient, and type are extracted automatically.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                    3
                  </div>
                  <h3 className="font-semibold mb-2">Smart Categorization</h3>
                  <p className="text-sm text-slate-600">
                    Transactions are automatically categorized and added to your expense tracker.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
