
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Smartphone, PlusCircle, BarChart3, TrendingUp, TrendingDown, Wallet, Zap } from "lucide-react";
import Link from "next/link";

interface TransactionDisplay {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [showWelcome, setShowWelcome] = useState(true);

  // Mock data for demo
  const summary: SummaryData = {
    totalIncome: 0,
    totalExpenses: 0,
    transactionCount: 0
  };

  const transactions: TransactionDisplay[] = [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h1>
              <p className="text-slate-600 mt-1">Track your M-Pesa transactions and manage your finances</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
        </div>

        {/* Welcome Section for New Users */}
        {showWelcome && transactions.length === 0 && (
          <Card className="mb-6 sm:mb-8 border-2 border-dashed border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6 sm:p-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Start Automatic M-Pesa Tracking</h2>
                  <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                    Yasinga automatically detects your M-Pesa transactions from SMS messages and tracks your business expenses in real-time
                  </p>
                </div>

                {/* Main Feature: Auto-Detection */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 mb-6 text-white">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-white" />
                    <h3 className="font-bold text-white text-xl">Automatic SMS Detection</h3>
                  </div>
                  <p className="text-blue-100 text-center text-sm mb-6 max-w-lg mx-auto">
                    The smart way to track M-Pesa transactions. Yasinga monitors your SMS messages, 
                    automatically extracts transaction data, and categorizes expenses for your business.
                  </p>
                  <div className="text-center">
                    <Link href="/sms-auto-detect">
                      <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-medium">
                        <Zap className="w-5 h-5 mr-3" />
                        Start Auto-Detection
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">Real-time</div>
                      <div className="text-blue-200">SMS Monitoring</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">Dual-SIM</div>
                      <div className="text-blue-200">Business & Personal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white mb-1">Smart</div>
                      <div className="text-blue-200">Auto-Categorization</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-lg mx-auto">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <PlusCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-800 mb-1">Manual Entry</h3>
                    <p className="text-xs sm:text-sm text-slate-600 text-center">Add transactions manually when needed</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-slate-800 mb-1">View Reports</h3>
                    <p className="text-xs sm:text-sm text-slate-600 text-center">Analyze your business expenses</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
                  <Link href="/transactions" className="w-full sm:w-auto">
                    <Button variant="outline" className="px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                  <Link href="/reports" className="w-full sm:w-auto">
                    <Button variant="outline" className="px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                  </Link>
                  <Link href="/confirm-sms" className="w-full sm:w-auto">
                    <Button variant="ghost" className="px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Manual SMS Entry (Optional)
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Income</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    KSh {summary.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    KSh {summary.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-lg sm:col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Net Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    KSh {(summary.totalIncome - summary.totalExpenses).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white border-0 shadow-lg">
          <CardHeader className="border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 mb-4">No transactions yet</p>
                <Link href="/confirm-sms">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{transaction.description}</p>
                      <p className="text-sm text-slate-600">{transaction.category} • {transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
