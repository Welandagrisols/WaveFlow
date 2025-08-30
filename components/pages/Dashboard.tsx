import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Wallet, 
  MessageSquare, 
  User, 
  FileText, 
  Smartphone,
  TrendingUp,
  TrendingDown,
  Plus,
  Filter,
  Search,
  Send,
  Eye,
  Settings
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [unconfirmedSmsCount, setUnconfirmedSmsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transactionsResponse = await fetch('/api/transactions');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);

          // Calculate summary
          const income = transactionsData
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
          const expenses = transactionsData
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

          setSummary({
            totalIncome: income,
            totalExpenses: expenses,
            transactionCount: transactionsData.length
          });
        }

        // Fetch unconfirmed SMS count
        const smsResponse = await fetch('/api/sms-transactions/unconfirmed');
        if (smsResponse.ok) {
          const smsData = await smsResponse.json();
          setUnconfirmedSmsCount(smsData.length || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user?.firstName || user?.email || 'User'}!
          </h1>
          <p className="text-slate-600">Here's your financial overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                KSh {summary.totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                KSh {summary.totalExpenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SMS Auto-Detection Status */}
        <Card className="yasinga-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yasinga-slate-800">
              <Smartphone className="h-5 w-5 text-yasinga-success" />
              Automatic SMS Detection
              <Badge variant="default" className="bg-yasinga-success">
                Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yasinga-slate-600 mb-4">
              Your M-Pesa SMS messages are being monitored automatically. 
              {unconfirmedSmsCount > 0 && (
                <span className="text-yasinga-warning font-medium">
                  {' '}You have {unconfirmedSmsCount} unconfirmed transactions.
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleNavigation('/sms-confirmation')}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Confirm SMS ({unconfirmedSmsCount})
              </Button>
              <Button
                onClick={() => handleNavigation('/sms-auto-detect')}
                variant="outline"
                size="sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                SMS Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="yasinga-card bg-gradient-to-br from-yasinga-primary/5 to-yasinga-secondary/5 border border-yasinga-primary/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-yasinga-primary" />
                <span className="text-yasinga-slate-800">Send Money</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">Send M-Pesa payments and track them</p>
              <Button 
                onClick={() => handleNavigation('/send-money')}
                className="w-full yasinga-btn-primary rounded-xl"
              >
                Send Payment
              </Button>
            </CardContent>
          </Card>

          <Card className="yasinga-card bg-gradient-to-br from-yasinga-success/5 to-yasinga-secondary/5 border border-yasinga-success/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-yasinga-success" />
                <span className="text-yasinga-slate-800">Track Payments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">Monitor your payment status</p>
              <Button 
                onClick={() => handleNavigation('/track-payments')}
                className="w-full yasinga-btn-outline rounded-xl"
                variant="outline"
              >
                View Payments
              </Button>
            </CardContent>
          </Card>

          <Card className="yasinga-card bg-gradient-to-br from-yasinga-secondary/5 to-yasinga-primary/5 border border-yasinga-secondary/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-yasinga-secondary" />
                <span className="text-yasinga-slate-800">View Reports</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">Analyze your spending patterns</p>
              <Button 
                onClick={() => handleNavigation('/reports')}
                className="w-full yasinga-btn-outline rounded-xl"
                variant="outline"
              >
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="yasinga-card bg-gradient-to-br from-yasinga-warning/5 to-yasinga-primary/5 border border-yasinga-warning/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yasinga-warning" />
                <span className="text-yasinga-slate-800">Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">View all your transaction history</p>
              <Button 
                onClick={() => handleNavigation('/transactions')}
                className="w-full yasinga-btn-outline rounded-xl"
                variant="outline"
              >
                View All
              </Button>
            </CardContent>
          </Card>

          <Card className="yasinga-card bg-gradient-to-br from-yasinga-primary/5 to-yasinga-success/5 border border-yasinga-primary/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-yasinga-primary" />
                <span className="text-yasinga-slate-800">Personal Tracking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">Track personal expenses</p>
              <Button 
                onClick={() => handleNavigation('/personal-tracking')}
                className="w-full yasinga-btn-outline rounded-xl"
                variant="outline"
              >
                Personal View
              </Button>
            </CardContent>
          </Card>

          <Card className="yasinga-card bg-gradient-to-br from-yasinga-error/5 to-yasinga-warning/5 border border-yasinga-error/20 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-yasinga-error" />
                <span className="text-yasinga-slate-800">SIM Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yasinga-slate-600 mb-4">Manage your SIM cards and settings</p>
              <Button 
                onClick={() => handleNavigation('/sim-management')}
                className="w-full yasinga-btn-outline rounded-xl"
                variant="outline"
              >
                Manage SIMs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}`} />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-slate-600">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-600">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={() => handleNavigation('/transactions')}
                  variant="outline" 
                  className="w-full"
                >
                  View All Transactions
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No transactions yet</p>
                <p className="text-sm text-slate-500 mb-4">
                  Start by sending money or enable SMS auto-detection to track your M-Pesa transactions
                </p>
                <Button 
                  onClick={() => handleNavigation('/send-money')}
                  className="mr-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Send Money
                </Button>
                <Button 
                  onClick={() => handleNavigation('/sms-auto-detect')}
                  variant="outline"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enable SMS Detection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}