
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Smartphone,
  Send,
  BarChart3,
  AlertCircle,
  Receipt,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [transactions] = useState([]);
  const [unconfirmedSmsCount] = useState(0);
  const [isAutoDetectActive] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalIncome = 0;
  const totalExpenses = 0;
  const balance = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header with same beautiful styling as landing page */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back!</h1>
                  <p className="text-white/90">Your financial dashboard</p>
                </div>
              </div>
            </div>
            {unconfirmedSmsCount > 0 && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-300" />
                <span className="text-white font-medium">
                  {unconfirmedSmsCount} SMS need confirmation
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => router.push('/sms-confirmation')}
                  className="ml-2 bg-white text-blue-600 hover:bg-white/90 font-semibold"
                >
                  Review
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Primary SMS Auto-Detection Section - Beautiful like landing */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-blue-100 rounded-xl shadow-sm">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-blue-900 mb-3">
                  Automatic M-Pesa SMS Detection
                </h3>
                <p className="text-blue-800 mb-6 text-lg">
                  Your primary expense tracking solution - automatically monitors and processes M-Pesa transactions from SMS messages.
                </p>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                    isAutoDetectActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${isAutoDetectActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    {isAutoDetectActive ? 'Active & Monitoring' : 'Inactive'}
                  </div>
                  <Button
                    onClick={() => router.push('/sms-auto-detect')}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Open SMS Monitor
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Beautiful Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                KSh {balance.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Your current balance</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KSh {totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Money received</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                KSh {totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 mt-1">Money spent</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending SMS</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {unconfirmedSmsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Messages to confirm</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Recent Transactions
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/transactions')}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="h-8 w-8 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Ready to start tracking!</h3>
                    <p className="text-slate-500 mb-6">
                      Your M-Pesa transactions will appear here automatically when SMS detection is active.
                    </p>
                    <Button
                      onClick={() => router.push('/sms-auto-detect')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Start Monitoring SMS
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Transaction items would go here */}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-600" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => router.push('/send-money')}
                  className="w-full bg-blue-600 hover:bg-blue-700 justify-start h-14 text-left shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Send className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-semibold">Send Money</div>
                    <div className="text-xs opacity-90">Transfer funds instantly</div>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/track-payments')}
                  variant="outline"
                  className="w-full justify-start h-14 border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Track Payments</div>
                    <div className="text-xs opacity-70">Monitor transactions</div>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/reports')}
                  variant="outline"
                  className="w-full justify-start h-14 border-cyan-200 text-cyan-600 hover:bg-cyan-50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Reports</div>
                    <div className="text-xs opacity-70">Analyze spending</div>
                  </div>
                  <ArrowDownRight className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
