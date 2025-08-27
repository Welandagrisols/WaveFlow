
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  PieChart,
  Download,
  Eye
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export default function Reports() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { data: summary } = useQuery({
    queryKey: ['/api/transactions/summary', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/summary?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },
    enabled: !!user
  });

  const { data: categoryData } = useQuery({
    queryKey: ['/api/transactions/by-category', selectedPeriod],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/by-category?period=${selectedPeriod}`);
      if (!response.ok) throw new Error('Failed to fetch category data');
      return response.json();
    },
    enabled: !!user
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const balance = (summary?.totalIn || 0) - (summary?.totalOut || 0);
  
  const periodOptions = [
    { value: 'week', label: '7 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: '3 Months' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-slate-800">Reports</h1>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="p-4 bg-white border-b">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {periodOptions.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="whitespace-nowrap"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Net Balance</p>
                      <p className="text-2xl font-bold">
                        KES {balance.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-200" />
                  </div>
                  <div className="mt-4 flex items-center">
                    {balance >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-200 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-200 mr-1" />
                    )}
                    <span className="text-sm text-blue-100">
                      {balance >= 0 ? 'Positive' : 'Negative'} balance
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-600 text-sm font-medium">Money In</p>
                        <p className="text-xl font-bold text-green-800">
                          KES {summary?.totalIn?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <TrendingDown className="w-6 h-6 text-green-600 rotate-180" />
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {summary?.totalInTransactions || 0} transactions
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-600 text-sm font-medium">Money Out</p>
                        <p className="text-xl font-bold text-red-800">
                          KES {summary?.totalOut?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-xs text-red-600 mt-2">
                      {summary?.totalOutTransactions || 0} transactions
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Transactions</span>
                  <Badge variant="secondary">
                    {(summary?.totalInTransactions || 0) + (summary?.totalOutTransactions || 0)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Average Transaction</span>
                  <span className="text-sm font-medium">
                    KES {summary?.averageTransaction?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Largest Transaction</span>
                  <span className="text-sm font-medium text-green-600">
                    KES {summary?.largestTransaction?.toLocaleString() || '0'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <PieChart className="w-4 h-4 mr-2" />
                  Spending by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryData?.length > 0 ? (
                  <div className="space-y-3">
                    {categoryData.map((category: any, index: number) => (
                      <div key={category.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-700">
                            {category.name}
                          </span>
                          <span className="text-sm font-semibold">
                            KES {category.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(category.amount / categoryData[0].amount) * 100}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{category.count} transactions</span>
                          <span>
                            {((category.amount / summary?.totalOut) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Transaction Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 mb-2">Trend analysis coming soon</p>
                  <p className="text-xs text-slate-400">
                    We're working on detailed trend charts
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
