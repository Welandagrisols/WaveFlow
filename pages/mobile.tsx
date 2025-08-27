import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Smartphone, TrendingDown, MessageSquare, List, BarChart3, Plus, Clock, User, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function MobilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [unconfirmedCount, setUnconfirmedCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Simple summary query
  const { data: summary } = useQuery({
    queryKey: ['/api/transactions/summary'],
    queryFn: async () => {
      const response = await fetch('/api/transactions/summary');
      if (!response.ok) throw new Error('Failed to fetch summary');
      return response.json();
    },
    enabled: !!user
  });

  // Recent SMS transactions
  const { data: recentSms } = useQuery({
    queryKey: ['/api/sms-transactions/unconfirmed'],
    queryFn: async () => {
      const response = await fetch('/api/sms-transactions/unconfirmed');
      if (!response.ok) throw new Error('Failed to fetch SMS');
      return response.json();
    },
    enabled: !!user
  });

  useEffect(() => {
    if (recentSms) {
      setUnconfirmedCount(recentSms.length);
    }
  }, [recentSms]);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Yasinga</h1>
            <p className="text-sm text-gray-600">M-Pesa Tracker</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-gray-500">{format(new Date(), 'MMM dd')}</p>
              <p className="text-xs text-gray-600">{user.email?.split('@')[0]}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main SMS Alert - Primary Feature */}
      {unconfirmedCount > 0 ? (
        <div className="mx-4 mt-4">
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500 rounded-full">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-orange-900 text-lg">
                    {unconfirmedCount} M-Pesa SMS
                  </p>
                  <p className="text-sm text-orange-700">
                    Tap to confirm and categorize
                  </p>
                </div>
                <Button 
                  size="default" 
                  onClick={() => router.push('/sms-confirmation')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  data-testid="button-confirm-sms"
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mx-4 mt-4">
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-full">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900 text-lg">
                    All SMS Confirmed
                  </p>
                  <p className="text-sm text-green-700">
                    Your M-Pesa transactions are up to date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mx-4 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">This Month</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Expenses</p>
                  <p className="text-xl font-bold text-gray-900">
                    KSh {(summary?.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {summary?.totalTransactions || 0}
                  </p>
                  <p className="text-xs text-gray-500">transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mx-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Recent SMS</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/transactions')}
            className="text-blue-600"
            data-testid="button-view-all"
          >
            View All
          </Button>
        </div>
        
        {recentSms && recentSms.length > 0 ? (
          <div className="space-y-3">
            {recentSms.slice(0, 4).map((sms: any) => (
              <Card key={sms.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-lg">
                        KSh {(sms.parsed_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {sms.recipient_name || 'M-Pesa Payment'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={sms.account_type === 'business' ? 'default' : 'secondary'} 
                        className="text-xs mb-1"
                      >
                        {sms.account_type}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {format(new Date(sms.timestamp), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="p-8 text-center">
              <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No M-Pesa SMS yet</p>
              <p className="text-sm text-gray-500">Transactions will appear here automatically</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 safe-area-bottom">
        <div className="flex justify-around">
          <Button 
            variant="ghost" 
            className="flex-1 flex flex-col items-center py-3"
            onClick={() => router.push('/sms-confirmation')}
            data-testid="nav-confirm"
          >
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-xs">Confirm</span>
            {unconfirmedCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                {unconfirmedCount}
              </Badge>
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 flex flex-col items-center py-3"
            onClick={() => router.push('/transactions')}
            data-testid="nav-transactions"
          >
            <List className="w-5 h-5 mb-1" />
            <span className="text-xs">History</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 flex flex-col items-center py-3"
            onClick={() => router.push('/reports')}
            data-testid="nav-reports"
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            <span className="text-xs">Reports</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 flex flex-col items-center py-3"
            onClick={() => router.push('/send-money')}
            data-testid="nav-send"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-xs">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}