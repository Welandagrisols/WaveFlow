import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, PieChart, ShoppingCart, Building2, Receipt, 
  CalendarDays, DollarSign, Package, Store 
} from "lucide-react";
import { format } from "date-fns";

export default function TrackPayments() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("30");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-blue-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock data for now since we don't have real analytics yet
  const mockAnalytics = {
    totalSpent: 45000,
    transactions: 23,
    topCategory: "Food & Supplies",
    avgTransaction: 1956
  };

  return (
    <div className="p-4 lg:p-8 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Analytics</h1>
          <p className="text-slate-600">Analyze your spending by category, supplier, items and more</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {mockAnalytics.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.transactions}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAnalytics.topCategory}</div>
            <p className="text-xs text-muted-foreground">
              35% of total spending
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {mockAnalytics.avgTransaction.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="categories" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">Category Analytics</h3>
                <p className="text-slate-600 mb-4">
                  View spending breakdown by category
                </p>
                <p className="text-sm text-slate-500">
                  Analytics will appear here once you have more transaction data
                </p>
              </div>
            </TabsContent>

            <TabsContent value="suppliers" className="space-y-4">
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">Supplier Analytics</h3>
                <p className="text-slate-600 mb-4">
                  Track spending by supplier
                </p>
                <p className="text-sm text-slate-500">
                  Analytics will appear here once you have more transaction data
                </p>
              </div>
            </TabsContent>

            <TabsContent value="items" className="space-y-4">
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">Item Analytics</h3>
                <p className="text-slate-600 mb-4">
                  Analyze spending on specific items
                </p>
                <p className="text-sm text-slate-500">
                  Analytics will appear here once you have more transaction data
                </p>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">Spending Trends</h3>
                <p className="text-slate-600 mb-4">
                  View spending patterns over time
                </p>
                <p className="text-sm text-slate-500">
                  Analytics will appear here once you have more transaction data
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}