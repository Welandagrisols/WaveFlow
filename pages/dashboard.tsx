
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { 
  Smartphone, 
  TrendingDown, 
  MessageSquare, 
  List, 
  BarChart3, 
  Plus, 
  Clock, 
  User, 
  LogOut,
  ArrowRight,
  Wallet,
  Send,
  Settings,
  Home,
  CreditCard,
  Activity,
  Bell
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Get summary data
  const { data: summary } = useQuery({
    queryKey: ['/api/transactions/summary'],
    queryFn: async () => {
      const response = await fetch('/api/transactions/summary');
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },
    enabled: !!user
  });

  // Get unconfirmed SMS count
  const { data: unconfirmedSms } = useQuery({
    queryKey: ['/api/sms-transactions/unconfirmed'],
    queryFn: async () => {
      const response = await fetch('/api/sms-transactions/unconfirmed');
      if (!response.ok) throw new Error('Failed to fetch SMS');
      return response.json();
    },
    enabled: !!user
  });

  // Get recent transactions by category
  const { data: categoryData } = useQuery({
    queryKey: ['/api/transactions/by-category'],
    queryFn: async () => {
      const response = await fetch('/api/transactions/by-category?period=month');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    enabled: !!user
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Quick Action Cards for each section
  const quickActions = {
    home: [
      {
        title: 'Send Money',
        description: 'Quick M-Pesa payment',
        icon: Send,
        href: '/send-money',
        color: 'bg-green-500',
        highlight: true
      },
      {
        title: 'SMS Processing',
        description: `${unconfirmedSms?.length || 0} pending`,
        icon: MessageSquare,
        href: '/sms-confirmation',
        color: 'bg-orange-500',
        urgent: (unconfirmedSms?.length || 0) > 0
      }
    ],
    transactions: [
      {
        title: 'All Transactions',
        description: `${summary?.totalTransactions || 0} total`,
        icon: List,
        href: '/transactions',
        color: 'bg-blue-500'
      },
      {
        title: 'Send Money',
        description: 'New payment',
        icon: Send,
        href: '/send-money',
        color: 'bg-green-500'
      },
      {
        title: 'Track Payments',
        description: 'Monitor status',
        icon: Clock,
        href: '/track-payments',
        color: 'bg-amber-500'
      }
    ],
    sms: [
      {
        title: 'Process SMS',
        description: `${unconfirmedSms?.length || 0} unconfirmed`,
        icon: MessageSquare,
        href: '/sms-confirmation',
        color: 'bg-orange-500',
        urgent: (unconfirmedSms?.length || 0) > 0
      },
      {
        title: 'SMS Guide',
        description: 'Setup instructions',
        icon: Settings,
        href: '/sms-guide',
        color: 'bg-purple-500'
      }
    ],
    analytics: [
      {
        title: 'Reports',
        description: 'Business insights',
        icon: BarChart3,
        href: '/reports',
        color: 'bg-purple-500'
      },
      {
        title: 'Personal Tracking',
        description: 'Personal expenses',
        icon: User,
        href: '/personal-tracking',
        color: 'bg-indigo-500'
      }
    ],
    settings: [
      {
        title: 'SIM Management',
        description: 'Manage SIM cards',
        icon: Smartphone,
        href: '/sim-management',
        color: 'bg-cyan-500'
      },
      {
        title: 'Account Settings',
        description: 'Profile & preferences',
        icon: Settings,
        href: '/settings',
        color: 'bg-gray-500'
      }
    ]
  };

  // Render action cards for each section with blue gradient styling
  const renderActionCards = (actions: any[]) => (
    <div className="grid grid-cols-1 gap-4">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={action.title}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white"
            onClick={() => router.push(action.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{action.title}</h3>
                  <p className="text-sm text-blue-100">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-100" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Yasinga</h1>
              <p className="text-sm text-slate-600">Welcome back, {user.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-slate-600"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="p-4">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="home" className="text-xs">
              <Home className="w-4 h-4 mr-1" />
              Home
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs">
              <CreditCard className="w-4 h-4 mr-1" />
              Money
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">
              <MessageSquare className="w-4 h-4 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings className="w-4 h-4 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total In</p>
                      <p className="text-lg font-bold text-green-800">
                        KES {summary?.totalIn?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <TrendingDown className="w-6 h-6 text-green-600 rotate-180" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Total Out</p>
                      <p className="text-lg font-bold text-red-800">
                        KES {summary?.totalOut?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notifications */}
            {unconfirmedSms?.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        You have {unconfirmedSms.length} unconfirmed SMS transactions
                      </p>
                      <Button 
                        variant="link" 
                        className="text-orange-600 p-0 h-auto"
                        onClick={() => router.push('/sms-confirmation')}
                      >
                        Process now →
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - Side by Side */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Send Money Card */}
                <Card 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white"
                  onClick={() => router.push('/send-money')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Send className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">Send Money</h3>
                        <p className="text-sm text-blue-100">Quick M-Pesa payment</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-100" />
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Processing Card */}
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-[0.98] ${
                    (unconfirmedSms?.length || 0) > 0 
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 border-0 text-white' 
                      : 'bg-gradient-to-r from-gray-500 to-slate-500 border-0 text-white'
                  }`}
                  onClick={() => router.push('/sms-confirmation')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">SMS Processing</h3>
                        <p className="text-sm text-orange-100">
                          {unconfirmedSms?.length || 0} pending
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-orange-100" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Business vs Personal Expenses */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Expense Breakdown</h2>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-100 font-medium">Business</p>
                        <p className="text-xl font-bold text-white">
                          KES {summary?.businessExpenses?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-emerald-200 mt-1">This month</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500 to-purple-600 border-0 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-violet-100 font-medium">Personal</p>
                        <p className="text-xl font-bold text-white">
                          KES {summary?.personalExpenses?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-violet-200 mt-1">This month</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Top Categories */}
            {categoryData && categoryData.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-800">Top Spending Categories</h2>
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {categoryData.slice(0, 4).map((category: any, index: number) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-blue-100' :
                              index === 1 ? 'bg-green-100' :
                              index === 2 ? 'bg-orange-100' : 'bg-purple-100'
                            }`}>
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-green-500' :
                                index === 2 ? 'bg-orange-500' : 'bg-purple-500'
                              }`}></div>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{category.name}</p>
                              <p className="text-sm text-slate-500">{category.count} transactions</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              KES {category.total?.toLocaleString() || '0'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">
                      {summary?.totalTransactions || 0}
                    </p>
                    <p className="text-xs text-slate-600">Total Transactions</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">
                      {categoryData?.length || 0}
                    </p>
                    <p className="text-xs text-slate-600">Categories Used</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">
                      {unconfirmedSms?.length || 0}
                    </p>
                    <p className="text-xs text-slate-600">Pending SMS</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Money Management</CardTitle>
              </CardHeader>
              <CardContent>
                {renderActionCards(quickActions.transactions)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMS Tab */}
          <TabsContent value="sms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SMS Processing</CardTitle>
              </CardHeader>
              <CardContent>
                {renderActionCards(quickActions.sms)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                {renderActionCards(quickActions.analytics)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings & Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                {renderActionCards(quickActions.settings)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
