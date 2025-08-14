import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Download, Calendar, PieChart, TrendingUp, Trophy, FileText, Mail } from "lucide-react";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/transactions/summary"],
    enabled: isAuthenticated,
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/transactions/by-category"],
    enabled: isAuthenticated,
  });

  const totalExpenses = summary?.totalExpenses || 0;
  const totalIncome = summary?.totalIncome || 0;
  const netIncome = totalIncome - totalExpenses;

  // Calculate business vs personal split (mock calculation)
  const businessExpenses = totalExpenses * 0.66;
  const personalExpenses = totalExpenses * 0.34;

  // Find top category
  const topCategory = categoryData.reduce((max, category) => 
    category.amount > (max?.amount || 0) ? category : max, 
    categoryData[0] || { categoryName: 'N/A', amount: 0 }
  );

  const topCategoryPercentage = totalExpenses > 0 ? (topCategory.amount / totalExpenses) * 100 : 0;

  const handleExport = (format: string) => {
    toast({
      title: "Export Started",
      description: `Preparing your ${format.toUpperCase()} report...`,
    });
    // In a real app, this would trigger a download
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 yasinga-fade-in space-y-8">
      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="yasinga-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-800">Monthly Summary</h4>
              <Calendar className="w-5 h-5 text-yasinga-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between" data-testid="summary-income">
                <span className="text-slate-600">Total Income</span>
                <span className="font-semibold text-yasinga-success">
                  KES {totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between" data-testid="summary-expenses">
                <span className="text-slate-600">Total Expenses</span>
                <span className="font-semibold text-yasinga-error">
                  KES {totalExpenses.toLocaleString()}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between" data-testid="summary-net">
                <span className="font-medium text-slate-800">Net Income</span>
                <span className={`font-bold ${netIncome >= 0 ? 'text-yasinga-success' : 'text-yasinga-error'}`}>
                  KES {netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="yasinga-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-800">Business vs Personal</h4>
              <PieChart className="w-5 h-5 text-yasinga-secondary" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between" data-testid="business-expenses">
                <span className="text-slate-600">Business Expenses</span>
                <span className="font-semibold">KES {businessExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between" data-testid="personal-expenses">
                <span className="text-slate-600">Personal Expenses</span>
                <span className="font-semibold">KES {personalExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                <div className="bg-yasinga-primary h-2 rounded-full" style={{ width: '66%' }} />
              </div>
              <p className="text-xs text-slate-500">66% Business, 34% Personal</p>
            </div>
          </CardContent>
        </Card>

        <Card className="yasinga-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-slate-800">Top Category</h4>
              <Trophy className="w-5 h-5 text-yasinga-warning" />
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yasinga-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-yasinga-primary" />
              </div>
              <p className="font-semibold text-slate-800" data-testid="top-category-name">
                {topCategory.categoryName}
              </p>
              <p className="text-2xl font-bold text-yasinga-primary" data-testid="top-category-amount">
                KES {topCategory.amount.toLocaleString()}
              </p>
              <p className="text-sm text-slate-500">{topCategoryPercentage.toFixed(1)}% of expenses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends */}
        <Card className="yasinga-card">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Monthly Trends</CardTitle>
              <Select defaultValue="6">
                <SelectTrigger className="w-32" data-testid="select-trend-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Placeholder for chart */}
            <div className="h-64 bg-slate-50 rounded-lg flex flex-col items-center justify-center" data-testid="chart-monthly-trends">
              <TrendingUp className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-slate-500 text-center">
                Monthly Trends Chart
                <br />
                <span className="text-sm">(Chart integration needed)</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="yasinga-card">
          <CardHeader className="border-b border-slate-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-slate-800">Expense Categories</CardTitle>
              <Select defaultValue="month">
                <SelectTrigger className="w-32" data-testid="select-category-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="last-month">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {categoryLoading ? (
              <div className="h-64 animate-pulse bg-slate-200 rounded-lg" />
            ) : categoryData.length > 0 ? (
              <div className="space-y-4">
                {categoryData.slice(0, 5).map((category, index) => {
                  const colors = ['bg-yasinga-primary', 'bg-yasinga-secondary', 'bg-yasinga-warning', 'bg-yasinga-success', 'bg-yasinga-error'];
                  const percentage = totalExpenses > 0 ? (category.amount / totalExpenses) * 100 : 0;
                  
                  return (
                    <div key={category.categoryName} data-testid={`chart-category-${category.categoryName.toLowerCase()}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
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
                      <p className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center" data-testid="text-no-category-data">
                <div className="text-center text-slate-500">
                  <PieChart className="w-12 h-12 mx-auto mb-4" />
                  <p>No category data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Section */}
      <Card className="yasinga-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800">Export Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              onClick={() => handleExport('csv')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-yasinga-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
              data-testid="button-export-csv"
            >
              <FileText className="w-4 h-4" />
              <span>Export as CSV</span>
            </Button>
            
            <Button 
              onClick={() => handleExport('pdf')}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-yasinga-error text-white rounded-lg hover:bg-red-700 transition-colors"
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4" />
              <span>Export as PDF</span>
            </Button>
            
            <Button 
              onClick={() => handleExport('email')}
              variant="outline"
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              data-testid="button-email-report"
            >
              <Mail className="w-4 h-4" />
              <span>Email Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
