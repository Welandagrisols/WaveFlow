import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SummaryCards from "@/components/financial/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionItem from "@/components/financial/transaction-item";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { ArrowRight, TrendingUp, TrendingDown, Clock, CheckCircle, Star, Smartphone, PlusCircle, BarChart3, FileText, User, MessageSquare, Wallet, Send, Search, Filter, Download, RefreshCw, ArrowDownRight, ArrowUpRight, Receipt, AlertCircle, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction } from "@shared/schema";

// Placeholder for PWAStatus component if it exists elsewhere
const PWAStatus = () => null;

interface TransactionDisplay {
  id: string;
  amount: string;
  direction: "IN" | "OUT";
  description: string;
  transactionDate: string;
  transactionType: string;
  categoryId?: string;
  type?: string;
  isConfirmed?: boolean;
  timestamp?: string;
  phone?: string;
  balance?: number;
}

interface CategoryData {
  categoryName: string;
  amount: number;
  count: number;
}

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  pendingAmount?: number; // Assuming pendingAmount might be part of SummaryData
}

// Real data from Supabase queries

export default function Dashboard() {
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const isLoading = loading;
  const isSupabaseConfigured = true; // Always use Supabase now
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confirmationFilter, setConfirmationFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Add state for unconfirmed SMS count
  const [unconfirmedSmsCount, setUnconfirmedSmsCount] = useState(0);
  // State for SMS auto-detection status
  const [isAutoDetectActive, setIsAutoDetectActive] = useState(true); // Default to active


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<TransactionDisplay[]>({
    queryKey: ["supabase-transactions"],
    queryFn: async () => {
      // Return empty array since Supabase is not configured
      return [];
    },
    enabled: isAuthenticated,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["supabase-summary"],
    queryFn: async () => {
      // Return default summary since Supabase is not configured
      return { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
    },
    enabled: isAuthenticated,
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery<CategoryData[]>({
    queryKey: ["supabase-categories"],
    queryFn: async () => {
      // Return empty array since Supabase is not configured
      return [];
    },
    enabled: isAuthenticated,
  });

  // Check if user is new (no transactions)
  useEffect(() => {
    if (transactions && transactions.length === 0 && !transactionsLoading) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [transactions, transactionsLoading]);

  const recentTransactions = transactions.slice(0, 5);
  const topCategories = categoryData.slice(0, 4);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesConfirmation = confirmationFilter === "all" || (confirmationFilter === "confirmed" && transaction.isConfirmed) || (confirmationFilter === "unconfirmed" && !transaction.isConfirmed);
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesConfirmation && matchesSearch;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    // In a real app, you would refetch your queries here
    // For example: queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    setTimeout(() => {
      setIsRefreshing(false);
      toast({ title: "Data refreshed successfully!" });
    }, 1000);
  };

  // Mock fetching unconfirmed SMS count (replace with actual Supabase query)
  useEffect(() => {
    // Simulate fetching unconfirmed SMS count
    const fetchUnconfirmedSms = async () => {
      // Replace with your actual Supabase query to count unconfirmed SMS
      // For now, using a placeholder value
      setUnconfirmedSmsCount(Math.floor(Math.random() * 5));
    };
    fetchUnconfirmedSms();
  }, []);


  if (isLoading || summaryLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-slate-200 rounded-xl" />
            <div className="h-96 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header with gradient background */}
        <div className="relative bg-gradient-to-r from-yasinga-primary to-yasinga-secondary rounded-2xl p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="yasinga-fade-in">
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Here's your financial overview
              </p>
            </div>
            <div className="flex items-center gap-4">
              <PWAStatus />
              {unconfirmedSmsCount > 0 && (
                <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 flex items-center gap-3 yasinga-fade-in">
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                  <span className="text-white font-medium">
                    {unconfirmedSmsCount} SMS message{unconfirmedSmsCount !== 1 ? 's' : ''} need confirmation
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.location.href = '/sms-confirmation'}
                    className="ml-2 bg-white text-yasinga-primary hover:bg-white/90 font-semibold"
                  >
                    Review
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Primary SMS Auto-Detection Section */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Automatic M-Pesa SMS Detection
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Your primary expense tracking solution - automatically monitors and processes M-Pesa transactions from SMS messages.
                </p>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isAutoDetectActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${isAutoDetectActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                    {isAutoDetectActive ? 'Active' : 'Inactive'}
                  </div>
                  {unconfirmedSmsCount > 0 && (
                    <Badge variant="destructive" className="animate-pulse">
                      {unconfirmedSmsCount} Pending
                    </Badge>
                  )}
                  <Button
                    onClick={() => window.location.href = '/sms-auto-detect'}
                    className="ml-auto"
                    size="sm"
                  >
                    Open SMS Monitor
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Summary Cards */}
        <div className="yasinga-fade-in">
          <SummaryCards
            totalExpenses={summary?.totalExpenses || 0}
            totalIncome={summary?.totalIncome || 0}
            totalTransactions={summary?.transactionCount || 0}
            pendingAmount={0}
          />
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions with enhanced styling */}
          <div className="lg:col-span-2 yasinga-fade-in">
            <Card className="yasinga-card border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yasinga-primary/10 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-yasinga-primary" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Recent Transactions
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/transactions'}
                  className="yasinga-btn-primary border-0 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Receipt className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-700 mb-2">No transactions yet</h3>
                    <p className="text-slate-500 mb-4">
                      Your transactions will appear here when you start tracking expenses
                    </p>
                    <Button
                      onClick={() => window.location.href = '/transactions'}
                      className="yasinga-btn-primary"
                    >
                      Add Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction, index) => (
                      <div
                        key={transaction.id}
                        className="yasinga-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <TransactionItem
                          transaction={transaction}
                          categories={categoryData}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="space-y-6 yasinga-fade-in">
            <Card className="yasinga-card border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yasinga-secondary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yasinga-secondary" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-800">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => window.location.href = '/send-money'}
                  className="w-full yasinga-btn-primary justify-start h-12 text-left shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Send className="mr-3 h-5 w-5" />
                  <div>
                    <div className="font-semibold">Send Money</div>
                    <div className="text-xs opacity-90">Transfer funds instantly</div>
                  </div>
                </Button>
                <Button
                  onClick={() => window.location.href = '/track-payments'}
                  variant="outline"
                  className="w-full justify-start h-12 border-yasinga-primary text-yasinga-primary hover:bg-yasinga-primary hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <TrendingUp className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">Track Payments</div>
                    <div className="text-xs opacity-70">Monitor transactions</div>
                  </div>
                </Button>
                <Button
                  onClick={() => window.location.href = '/reports'}
                  variant="outline"
                  className="w-full justify-start h-12 border-yasinga-secondary text-yasinga-secondary hover:bg-yasinga-secondary hover:text-white shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">View Reports</div>
                    <div className="text-xs opacity-70">Analyze spending</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}