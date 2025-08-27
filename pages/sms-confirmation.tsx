
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle, 
  XCircle,
  Copy,
  Plus,
  Clock,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

export default function SmsConfirmation() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [newSmsText, setNewSmsText] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const { data: unconfirmedSms, isLoading } = useQuery({
    queryKey: ['/api/sms-transactions/unconfirmed'],
    queryFn: async () => {
      const response = await fetch('/api/sms-transactions/unconfirmed');
      if (!response.ok) throw new Error('Failed to fetch SMS');
      return response.json();
    },
    enabled: !!user
  });

  const processSms = useMutation({
    mutationFn: async (smsText: string) => {
      const response = await fetch('/api/sms-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sms_text: smsText })
      });
      if (!response.ok) throw new Error('Failed to process SMS');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sms-transactions/unconfirmed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setNewSmsText('');
      toast({
        title: 'SMS Processed',
        description: 'SMS has been successfully processed'
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to process SMS',
        variant: 'destructive'
      });
    }
  });

  const confirmSms = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/sms-transactions/${id}/confirm`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to confirm SMS');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sms-transactions/unconfirmed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: 'SMS Confirmed',
        description: 'Transaction has been added'
      });
    }
  });

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setNewSmsText(text);
      toast({
        title: 'SMS Pasted',
        description: 'SMS text has been pasted from clipboard'
      });
    } catch (err) {
      toast({
        title: 'Paste Failed',
        description: 'Could not paste from clipboard',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

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
              <h1 className="text-lg font-semibold text-slate-800">SMS Processing</h1>
            </div>
            {unconfirmedSms?.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unconfirmedSms.length} pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Add New SMS */}
      <div className="p-4 bg-white border-b">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Process New SMS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Textarea
                placeholder="Paste your M-Pesa SMS here..."
                value={newSmsText}
                onChange={(e) => setNewSmsText(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePasteFromClipboard}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Paste
                </Button>
                <Button
                  onClick={() => processSms.mutate(newSmsText)}
                  disabled={!newSmsText.trim() || processSms.isPending}
                  className="flex-1"
                >
                  {processSms.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Process
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending SMS List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : unconfirmedSms?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-2">
              <MessageSquare className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-1">No pending SMS</h3>
            <p className="text-slate-500">All SMS messages have been processed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-slate-600 mb-3">
              Pending SMS ({unconfirmedSms?.length || 0})
            </h2>
            
            {unconfirmedSms?.map((sms: any) => (
              <Card key={sms.id} className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm text-orange-600 font-medium">
                          {format(new Date(sms.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        Pending
                      </Badge>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border">
                      <p className="text-sm text-slate-700 font-mono leading-relaxed">
                        {sms.sms_text}
                      </p>
                    </div>
                    
                    {sms.parsed_amount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Detected Amount:</span>
                        <span className="font-semibold text-green-600">
                          KES {sms.parsed_amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => confirmSms.mutate(sms.id)}
                        disabled={confirmSms.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Guide */}
      <div className="p-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-medium text-blue-800 mb-2 flex items-center">
              <Smartphone className="w-4 h-4 mr-2" />
              Quick Guide
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>1. Copy M-Pesa SMS from your messages app</p>
              <p>2. Paste it here using the Paste button</p>
              <p>3. Review and confirm the transaction</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
