
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Settings
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

  const navigationCards = [
    {
      title: 'Transactions',
      description: 'View all transactions',
      icon: List,
      href: '/transactions',
      color: 'blue',
      count: summary?.totalTransactions || 0
    },
    {
      title: 'Send Money',
      description: 'Send M-Pesa payments',
      icon: Send,
      href: '/send-money',
      color: 'green',
      highlight: true
    },
    {
      title: 'SMS Processing',
      description: 'Process M-Pesa SMS',
      icon: MessageSquare,
      href: '/sms-confirmation',
      color: 'orange',
      count: unconfirmedSms?.length || 0,
      urgent: (unconfirmedSms?.length || 0) > 0
    },
    {
      title: 'Reports',
      description: 'View analytics',
      icon: BarChart3,
      href: '/reports',
      color: 'purple'
    },
    {
      title: 'Track Payments',
      description: 'Monitor payment status',
      icon: Clock,
      href: '/track-payments',
      color: 'amber'
    },
    {
      title: 'Personal Tracking',
      description: 'Personal expenses',
      icon: User,
      href: '/personal-tracking',
      color: 'indigo'
    },
    {
      title: 'SIM Management',
      description: 'Manage SIM cards',
      icon: Smartphone,
      href: '/sim-management',
      color: 'cyan'
    }
  ];

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

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
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

        {/* Navigation Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
          
          {navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card 
                key={card.title} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md active:scale-98 ${
                  card.highlight ? 'ring-2 ring-green-500 bg-green-50' : ''
                } ${card.urgent ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
                onClick={() => router.push(card.href)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-${card.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 text-${card.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{card.title}</h3>
                        <p className="text-sm text-slate-600">{card.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {card.count !== undefined && (
                        <Badge 
                          variant={card.urgent ? "destructive" : "secondary"}
                          className="ml-2"
                        >
                          {card.count}
                        </Badge>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Add Transaction */}
        <div className="mt-6">
          <Button 
            onClick={() => router.push('/send-money')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Quick Send Money
          </Button>
        </div>
      </div>
    </div>
  );
}
