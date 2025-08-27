import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Heart,
  Utensils,
  Shirt,
  Car,
  HandHeart,
  Calendar,
  Phone
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PersonalExpensesSummary {
  totalPersonalExpenses: number;
  outstandingLoans: number;
  categoryBreakdown: Array<{ categoryName: string; amount: number; count: number }>;
}

interface OutstandingLoan {
  id: string;
  amount: string;
  description: string;
  loanRecipient: string;
  expectedRepaymentDate: string;
  transactionDate: string;
  isRepaid: boolean;
}

const categoryIcons: Record<string, React.ComponentType<any>> = {
  "Personal Food & Dining": Utensils,
  "Clothing & Accessories": Shirt,
  "Transportation": Car,
  "Family & Friends Support": Heart,
  "Loans to Friends/Family": HandHeart,
};

export default function PersonalTracking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeFilter, setTimeFilter] = useState("thisMonth");

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (timeFilter) {
      case "thisWeek":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek;
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last30Days":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Fetch personal expenses summary
  const { data: summary, isLoading: summaryLoading } = useQuery<PersonalExpensesSummary>({
    queryKey: ["/api/personal-expenses/summary", startDate.toISOString(), endDate.toISOString()],
  });

  // Fetch outstanding loans
  const { data: outstandingLoans = [], isLoading: loansLoading } = useQuery<OutstandingLoan[]>({
    queryKey: ["/api/loans/outstanding"],
  });

  // Initialize personal categories
  const initCategoriesMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/categories/init-personal'),
    onSuccess: () => {
      toast({
        title: "Categories initialized",
        description: "Personal expense categories have been set up for your account.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-expenses/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize personal categories.",
        variant: "destructive",
      });
    },
  });

  // Mark loan as repaid
  const markRepaidMutation = useMutation({
    mutationFn: (transactionId: string) => apiRequest('PATCH', `/api/loans/${transactionId}/repaid`),
    onSuccess: () => {
      toast({
        title: "Loan updated",
        description: "The loan has been marked as repaid.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/loans/outstanding"] });
      queryClient.invalidateQueries({ queryKey: ["/api/personal-expenses/summary"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update loan status.",
        variant: "destructive",
      });
    },
  });

  const handleMarkRepaid = (transactionId: string) => {
    markRepaidMutation.mutate(transactionId);
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (summaryLoading || loansLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Expenses</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Personal Expenses</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your personal spending and loans to friends & family
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="last30Days">Last 30 Days</option>
            <option value="thisYear">This Year</option>
          </select>
          <Button 
            onClick={() => initCategoriesMutation.mutate()}
            disabled={initCategoriesMutation.isPending}
            variant="outline"
            size="sm"
          >
            {initCategoriesMutation.isPending ? "Setting up..." : "Setup Categories"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personal Expenses</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary?.totalPersonalExpenses || 0)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {timeFilter === "thisMonth" ? "This month" : 
               timeFilter === "thisWeek" ? "This week" :
               timeFilter === "last30Days" ? "Last 30 days" : "This year"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
            <HandHeart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary?.outstandingLoans || 0)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {outstandingLoans.length} active loan{outstandingLoans.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summary?.categoryBreakdown?.length || 0}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Active expense categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loan Tracking</TabsTrigger>
          <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Personal Expenses by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Your personal expense breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summary?.categoryBreakdown?.slice(0, 5).map((category, index) => {
                    const Icon = categoryIcons[category.categoryName] || DollarSign;
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">{category.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatCurrency(category.amount)}</div>
                          <div className="text-xs text-gray-500">{category.count} transactions</div>
                        </div>
                      </div>
                    );
                  })}
                  {(!summary?.categoryBreakdown || summary.categoryBreakdown.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      No personal expenses found for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Loans Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-orange-600" />
                  Active Loans
                </CardTitle>
                <CardDescription>Money you've lent to others</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {outstandingLoans.slice(0, 3).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{loan.loanRecipient}</div>
                        <div className="text-xs text-gray-600">
                          Due: {formatDate(loan.expectedRepaymentDate)}
                          {isOverdue(loan.expectedRepaymentDate) && (
                            <Badge variant="destructive" className="ml-2">Overdue</Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">
                          {formatCurrency(parseFloat(loan.amount))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {outstandingLoans.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      No outstanding loans
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="h-5 w-5 text-orange-600" />
                Outstanding Loans ({outstandingLoans.length})
              </CardTitle>
              <CardDescription>
                Track money you've lent to friends and family
              </CardDescription>
            </CardHeader>
            <CardContent>
              {outstandingLoans.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No outstanding loans
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    All your loans have been repaid or you haven't lent money to anyone yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {outstandingLoans.map((loan) => (
                    <Card key={loan.id} className={`${isOverdue(loan.expectedRepaymentDate) ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-orange-200 bg-orange-50 dark:bg-orange-900/20'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">{loan.loanRecipient}</h4>
                              {isOverdue(loan.expectedRepaymentDate) && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {loan.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Given: {formatDate(loan.transactionDate)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Due: {formatDate(loan.expectedRepaymentDate)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="text-xl font-bold text-orange-600">
                              {formatCurrency(parseFloat(loan.amount))}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkRepaid(loan.id)}
                              disabled={markRepaidMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {markRepaidMutation.isPending ? "Updating..." : "Mark Repaid"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Expense Categories</CardTitle>
              <CardDescription>
                Detailed breakdown of your personal spending by category for {timeFilter}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!summary?.categoryBreakdown || summary.categoryBreakdown.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No personal expenses yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Mark transactions as "personal" in SMS confirmation to see them here.
                  </p>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure to click "Setup Categories" above to initialize personal expense categories.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.categoryBreakdown.map((category, index) => {
                    const Icon = categoryIcons[category.categoryName] || DollarSign;
                    const percentage = summary.totalPersonalExpenses > 0 ? 
                      (category.amount / summary.totalPersonalExpenses) * 100 : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <span className="font-medium">{category.categoryName}</span>
                              <div className="text-sm text-gray-600">
                                {category.count} transaction{category.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{formatCurrency(category.amount)}</div>
                            <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}