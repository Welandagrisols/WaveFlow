import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SummaryCards from "@/components/financial/summary-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TransactionItem from "@/components/financial/transaction-item";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, TrendingUp, TrendingDown, Clock, CheckCircle, Star, Smartphone, PlusCircle, BarChart3 } from "lucide-react";
import type { Transaction } from "@shared/schema";

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

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

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

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
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
    <div className="p-4 lg:p-8 yasinga-fade-in">
      {/* Welcome Experience for New Users */}
      {showWelcome && (
        <div className="mb-8">
          <Card className="yasinga-card bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Star className="w-8 h-8 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-slate-800">Welcome to Yasinga!</h2>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-lg text-slate-600 mb-6">
                  Your smart M-Pesa expense tracker is ready to help you manage your business finances.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">1. Connect Your M-Pesa</h3>
                    <p className="text-sm text-slate-600">Start by adding your first M-Pesa transaction or SMS confirmation</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                      <PlusCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">2. Categorize Expenses</h3>
                    <p className="text-sm text-slate-600">Organize transactions into business categories like food, supplies, etc.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">3. Track & Analyze</h3>
                    <p className="text-sm text-slate-600">View reports and insights to optimize your business spending</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/confirm-sms">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3" data-testid="button-add-sms">
                      <Smartphone className="w-4 h-4 mr-2" />
                      Add M-Pesa SMS
                    </Button>
                  </Link>
                  <Link href="/transactions">
                    <Button variant="outline" className="px-6 py-3" data-testid="button-add-transaction">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="ghost" className="px-6 py-3" data-testid="button-view-reports">
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
      <div className="mb-8">
        <SummaryCards summary={summary} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card className="yasinga-card">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Recent Transactions</CardTitle>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm" className="text-yasinga-primary hover:text-blue-700" data-testid="link-view-all-transactions">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {transactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                        <div>
                          <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
                          <div className="h-3 bg-slate-200 rounded w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((transaction: Transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" data-testid="text-no-transactions">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No transactions yet</h3>
                  <p className="text-slate-500">Your M-Pesa transactions will appear here once connected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div>
          <Card className="yasinga-card">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="text-lg font-semibold text-slate-800">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {categoryLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-slate-200 rounded-full" />
                          <div className="h-4 bg-slate-200 rounded w-24" />
                        </div>
                        <div className="h-4 bg-slate-200 rounded w-20" />
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2" />
                    </div>
                  ))}
                </div>
              ) : topCategories.length > 0 ? (
                <div className="space-y-4">
                  {topCategories.map((category: CategoryData, index: number) => {
                    const colors = ['bg-yasinga-primary', 'bg-yasinga-secondary', 'bg-yasinga-warning', 'bg-yasinga-success'];
                    const totalAmount = topCategories.reduce((sum: number, cat: CategoryData) => sum + cat.amount, 0);
                    const percentage = totalAmount > 0 ? (category.amount / totalAmount) * 100 : 0;
                    
                    return (
                      <div key={category.categoryName} data-testid={`category-${category.categoryName.toLowerCase()}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`} />
                            <span className="text-sm text-slate-600">{category.categoryName}</span>
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            KES {category.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`${colors[index % colors.length]} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8" data-testid="text-no-categories">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingDown className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-500">No spending data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
