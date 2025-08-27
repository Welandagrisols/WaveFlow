
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

  // Render action cards for each section
  const renderActionCards = (actions: any[]) => (
    <div className="grid grid-cols-1 gap-4">
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={action.title}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
              action.highlight ? 'ring-2 ring-green-500 bg-green-50' : ''
            } ${action.urgent ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
            onClick={() => router.push(action.href)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
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

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Quick Actions</h2>
              {renderActionCards(quickActions.home)}
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
