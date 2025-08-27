import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SummaryCards from "@/components/financial/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionItem from "@/components/financial/transaction-item";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, TrendingDown, Clock, CheckCircle, Star, Smartphone, PlusCircle, BarChart3, FileText, User, MessageSquare, Wallet, Send, Search, Filter, Download, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Transaction } from "@shared/schema";

interface TransactionDisplay {
  id: string;
  amount: string;
  direction: "IN" | "OUT";
  description: string;
  transactionDate: string;
  transactionType: string;
  categoryId?: string;
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
}

// Mock data for demonstration purposes (replace with actual data fetching logic)
const currentBalance = 15000;
const totalReceived = 25000;
const totalSent = 10000;
const receivedCount = 120;
const sentCount = 80;
const unconfirmedSmsCount = 5;

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [confirmationFilter, setConfirmationFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<SummaryData>({
    queryKey: ["/api/transactions/summary"],
    enabled: isAuthenticated,
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery<CategoryData[]>({
    queryKey: ["/api/transactions/by-category"],
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
    <div className="p-2 sm:p-4 lg:p-8 yasinga-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yasinga Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your M-Pesa transactions and expenses
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 lg:w-fit">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Welcome Experience for New Users */}
          {showWelcome && (
            <div className="mb-6 sm:mb-8">
              <Card className="yasinga-card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-4">
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 text-center">Welcome to Yasinga!</h2>
                      <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                    </div>
                    <p className="text-sm sm:text-lg text-slate-600 mb-4 sm:mb-6 text-center px-2">
                      Your smart M-Pesa expense tracker is ready to help you manage your business finances.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-blue-100">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg mx-auto mb-2 sm:mb-3">
                          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base text-center">1. Connect M-Pesa</h3>
                        <p className="text-xs sm:text-sm text-slate-600 text-center">Add M-Pesa transactions or SMS confirmations</p>
                      </div>

                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg mx-auto mb-2 sm:mb-3">
                          <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base text-center">2. Categorize</h3>
                        <p className="text-xs sm:text-sm text-slate-600 text-center">Organize into business categories</p>
                      </div>

                      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-purple-100">
                        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg mx-auto mb-2 sm:mb-3">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-sm sm:text-base text-center">3. Track & Analyze</h3>
                        <p className="text-xs sm:text-sm text-slate-600 text-center">View reports and insights</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
                      <Link href="/confirm-sms" className="w-full sm:w-auto">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]" data-testid="button-add-sms">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Add M-Pesa SMS
                        </Button>
                      </Link>
                      <Link href="/transactions" className="w-full sm:w-auto">
                        <Button variant="outline" className="px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]" data-testid="button-add-transaction">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Transaction
                        </Button>
                      </Link>
                      <Link href="/reports" className="w-full sm:w-auto">
                        <Button variant="ghost" className="px-4 sm:px-6 py-3 sm:py-3 text-sm sm:text-base w-full sm:w-auto min-h-[44px]" data-testid="button-view-reports">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View Reports
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  KSh {currentBalance.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  KSh {totalReceived.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {receivedCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  KSh {totalSent.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {sentCount} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unconfirmed SMS</CardTitle>
                <MessageSquare className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {unconfirmedSmsCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending confirmation
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Send className="h-5 w-5 text-blue-500" />
                  Send Money
                </CardTitle>
                <CardDescription>Transfer money to contacts</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-green-500" />
                  Track Payment
                </CardTitle>
                <CardDescription>Track transaction status</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PlusCircle className="h-5 w-5 text-purple-500" />
                  Add Expense
                </CardTitle>
                <CardDescription>Record personal expenses</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction Management */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View and manage your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:w-80"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={confirmationFilter} onValueChange={setConfirmationFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="unconfirmed">Unconfirmed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'received' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'sent' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'received' ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : transaction.type === 'sent' ? (
                            <ArrowUpRight className="h-4 w-4" />
                          ) : (
                            <Wallet className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                            {transaction.phone && (
                              <>
                                <span>•</span>
                                <span>{transaction.phone}</span>
                              </>
                            )}
                            {!transaction.isConfirmed && (
                              <Badge variant="secondary" className="ml-2">
                                Unconfirmed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'received' ? '+' : '-'}KSh {transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Balance: KSh {transaction.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Tab */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMS Management</CardTitle>
              <CardDescription>Manage and confirm SMS transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {unconfirmedSmsCount > 0
                    ? `You have ${unconfirmedSmsCount} unconfirmed SMS messages`
                    : 'All SMS messages are confirmed'
                  }
                </p>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Manage SMS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Expenses</CardTitle>
              <CardDescription>Track your personal spending and budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Manage your personal expense categories and budgets
                </p>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  View comprehensive financial reports and spending analytics
                </p>
                <Button>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SIM & Settings</CardTitle>
              <CardDescription>Manage your SIM cards and application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Configure SIM cards and customize your app settings
                </p>
                <Button>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Manage SIMs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}