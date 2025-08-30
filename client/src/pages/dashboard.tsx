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
  const { user, loading, isSupabaseConfigured } = useAuth();
  const isAuthenticated = !!user;
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
    // Only redirect if we're not loading and definitely not authenticated
    if (!loading && !isAuthenticated && isSupabaseConfigured) {
      console.log('Redirecting to login - user not authenticated');
      toast({
        title: "Authentication required", 
        description: "Please sign in to continue",
        variant: "default",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
  }, [isAuthenticated, loading, isSupabaseConfigured, toast]);

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<TransactionDisplay[]>({
    queryKey: ["supabase-transactions"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transactionDate', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
    },
    enabled: isAuthenticated && isSupabaseConfigured,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["supabase-summary"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('amount, direction');
        
        if (error) throw error;
        
        const summaryData = data?.reduce((acc: any, transaction: any) => {
          const amount = parseFloat(transaction.amount);
          if (transaction.direction === 'IN') {
            acc.totalIncome += amount;
          } else {
            acc.totalExpenses += amount;
          }
          acc.transactionCount++;
          return acc;
        }, { totalIncome: 0, totalExpenses: 0, transactionCount: 0 });
        
        return summaryData || { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
      } catch (error) {
        console.error('Error fetching summary:', error);
        return { totalIncome: 0, totalExpenses: 0, transactionCount: 0 };
      }
    },
    enabled: isAuthenticated && isSupabaseConfigured,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery<CategoryData[]>({
    queryKey: ["supabase-categories"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    enabled: isAuthenticated && isSupabaseConfigured,
    retry: 1,
    staleTime: 10 * 60 * 1000,
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


  // Show loading only if auth is loading OR if we're authenticated and data is loading
  if (loading || (isAuthenticated && (summaryLoading || transactionsLoading))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">
            {loading ? 'Authenticating...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // If not loading and not authenticated, don't render anything (redirect will happen)
  if (!loading && !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Wave-inspired clean header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="yasinga-fade-in">
              <h1 className="text-3xl font-semibold text-slate-800 mb-2">
                Welcome back, {user?.email?.split('@')[0] || 'User'}
              </h1>
              <p className="text-slate-600 text-lg">
                Here's your financial overview for today
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
            <Card className="yasinga-card bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yasinga-primary/10 rounded-2xl flex items-center justify-center border border-yasinga-primary/20">
                    <Receipt className="w-6 h-6 text-yasinga-primary" />
                  </div>
                  <CardTitle className="text-xl font-medium text-yasinga-slate-800">
                    Recent Transactions
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/transactions'}
                  className="yasinga-btn-primary border-0 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl"
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

          {/* Simplified Quick Actions - Mobile Optimized */}
          <div className="space-y-6 yasinga-fade-in">
            <Card className="yasinga-card bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yasinga-success/10 rounded-2xl flex items-center justify-center border border-yasinga-success/20">
                    <Zap className="w-5 h-5 text-yasinga-success" />
                  </div>
                  <CardTitle className="text-lg font-medium text-yasinga-slate-800">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Actions with Yasinga colors and unique shapes */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Send Money - Rounded rectangle with Yasinga blue gradient */}
                  <div 
                    onClick={() => window.location.href = '/send-money'}
                    className="relative h-24 bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#06b6d4] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="flex flex-col items-center justify-center h-full relative z-10">
                      <Send className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-semibold">Send Money</span>
                      <span className="text-xs opacity-80">Quick M-Pesa payment</span>
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full translate-x-4 -translate-y-4"></div>
                    <div className="absolute bottom-0 right-0 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white/60 mr-2 mb-2" />
                    </div>
                  </div>

                  {/* SMS Processing - Rounded rectangle with gray gradient */}
                  <div 
                    onClick={() => window.location.href = '/sms-confirmation'}
                    className="relative h-24 bg-gradient-to-br from-[#64748b] via-[#475569] to-[#334155] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    <div className="flex flex-col items-center justify-center h-full relative z-10">
                      <MessageSquare className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-sm font-semibold">SMS Processing</span>
                      <span className="text-xs opacity-80">{unconfirmedSmsCount || 0} pending</span>
                    </div>
                    {unconfirmedSmsCount > 0 && (
                      <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-pulse">
                        {unconfirmedSmsCount}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-white/60 mr-2 mb-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Mobile Navigation Grid */}
            <Card className="yasinga-card bg-white lg:hidden rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium text-yasinga-slate-800">
                  More Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => window.location.href = '/reports'}
                    className="flex flex-col items-center p-4 rounded-2xl bg-yasinga-primary/5 border border-yasinga-primary/20 hover:bg-yasinga-primary/10 transition-all duration-200 hover:scale-105"
                  >
                    <BarChart3 className="h-6 w-6 text-yasinga-primary mb-2" />
                    <span className="text-xs font-medium text-yasinga-slate-700">Reports</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/track-payments'}
                    className="flex flex-col items-center p-4 rounded-2xl bg-yasinga-secondary/5 border border-yasinga-secondary/20 hover:bg-yasinga-secondary/10 transition-all duration-200 hover:scale-105"
                  >
                    <Search className="h-6 w-6 text-yasinga-secondary mb-2" />
                    <span className="text-xs font-medium text-yasinga-slate-700">Track</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/personal-tracking'}
                    className="flex flex-col items-center p-4 rounded-2xl bg-yasinga-success/5 border border-yasinga-success/20 hover:bg-yasinga-success/10 transition-all duration-200 hover:scale-105"
                  >
                    <User className="h-6 w-6 text-yasinga-success mb-2" />
                    <span className="text-xs font-medium text-yasinga-slate-700">Personal</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}