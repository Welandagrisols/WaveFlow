import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, PieChart, ShoppingCart, Building2, Receipt, 
  CalendarDays, DollarSign, Package, Store 
} from "lucide-react";
import { format } from "date-fns";

export default function TrackPayments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [timePeriod, setTimePeriod] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

  // Fetch analytics data
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  const { data: categoryData = [], isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/transactions/by-category"],
    enabled: isAuthenticated,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["/api/suppliers"],
    enabled: isAuthenticated,
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/items"],
    enabled: isAuthenticated,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  // Helper functions for analytics
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(numAmount);
  };

  const filterTransactionsByPeriod = (transactions: any[]) => {
    const now = new Date();
    const daysAgo = parseInt(timePeriod);
    const filterDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    return transactions.filter((t: any) => new Date(t.transactionDate) >= filterDate);
  };

  // Analytics calculations
  const filteredTransactions = filterTransactionsByPeriod(transactions as any[]);
  const businessTransactions = filteredTransactions.filter((t: any) => !t.isPersonal);
  const personalTransactions = filteredTransactions.filter((t: any) => t.isPersonal);

  const totalSpent = filteredTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
  const businessSpent = businessTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
  const personalSpent = personalTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);

  // Top suppliers analysis
  const supplierSpending = (suppliers as any[]).map((supplier: any) => {
    const supplierTransactions = filteredTransactions.filter((t: any) => t.payeePhone === supplier.phone);
    const totalAmount = supplierTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
    return {
      ...supplier,
      totalSpent: totalAmount,
      transactionCount: supplierTransactions.length,
      lastTransaction: supplierTransactions.length > 0 ? 
        Math.max(...supplierTransactions.map((t: any) => new Date(t.transactionDate).getTime())) : 0
    };
  }).filter((s: any) => s.totalSpent > 0)
    .sort((a: any, b: any) => b.totalSpent - a.totalSpent);

  // Top items analysis
  const itemSpending = (items as any[]).map((item: any) => {
    const itemTransactions = filteredTransactions.filter((t: any) => 
      t.description?.toLowerCase().includes(item.name.toLowerCase())
    );
    const totalAmount = itemTransactions.reduce((sum, t: any) => sum + parseFloat(t.amount), 0);
    return {
      ...item,
      totalSpent: totalAmount,
      transactionCount: itemTransactions.length
    };
  }).filter((i: any) => i.totalSpent > 0)
    .sort((a: any, b: any) => b.totalSpent - a.totalSpent);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 yasinga-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your spending by category, supplier, items and more</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Expenses</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(businessSpent)}
                </p>
                <p className="text-sm text-gray-500">
                  {businessTransactions.length} transactions
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personal Expenses</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(personalSpent)}
                </p>
                <p className="text-sm text-gray-500">
                  {personalTransactions.length} transactions
                </p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (categoryData as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(categoryData as any[]).map((category: any) => (
                    <div key={category.categoryId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.categoryName}</h3>
                        <p className="text-sm text-gray-500">{category.count} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(category.totalAmount)}</p>
                        <p className="text-sm text-gray-500">
                          {Math.round((category.totalAmount / totalSpent) * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              {suppliersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : supplierSpending.length > 0 ? (
                <div className="space-y-4">
                  {supplierSpending.slice(0, 10).map((supplier: any) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                        <p className="text-sm text-gray-500">
                          {supplier.phone} • {supplier.transactionCount} transactions
                        </p>
                        <p className="text-xs text-gray-400">
                          Common items: {supplier.commonItems?.slice(0, 2).join(', ') || 'None'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(supplier.totalSpent)}</p>
                        <p className="text-sm text-gray-500">
                          {supplier.lastTransaction > 0 ? 
                            format(new Date(supplier.lastTransaction), 'MMM dd') : 'No recent'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No supplier data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Purchased Items</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : itemSpending.length > 0 ? (
                <div className="space-y-4">
                  {itemSpending.slice(0, 10).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          {item.transactionCount} purchases • Avg: {formatCurrency(item.avgPrice || 0)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Category: {(categories as any[]).find((c: any) => c.id === item.categoryId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(item.totalSpent)}</p>
                        <p className="text-sm text-gray-500">
                          Last: {formatCurrency(item.lastPrice || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No item data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business vs Personal</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Business Expenses</span>
                      <span className="font-semibold text-green-900">{formatCurrency(businessSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-orange-800">Personal Expenses</span>
                      <span className="font-semibold text-orange-900">{formatCurrency(personalSpent)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Transaction Volume</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">Total Transactions</span>
                      <span className="font-semibold text-blue-900">{filteredTransactions.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-800">Average Amount</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalSpent / (filteredTransactions.length || 1))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}