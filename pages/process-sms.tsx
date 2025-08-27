import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Smartphone, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ParsedSms {
  amount: number;
  recipient: string;
  code: string;
  type: 'business' | 'personal';
  simCard: 'SIM1' | 'SIM2';
}

export default function ProcessSmsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [smsText, setSmsText] = useState('');
  const [parsedSms, setParsedSms] = useState<ParsedSms | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    // Get shared SMS data from URL params or form data
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedText = urlParams.get('text') || '';
      
      if (sharedText) {
        setSmsText(sharedText);
        parseSharedSms(sharedText);
      }
    }
  }, []);

  const parseSharedSms = (text: string) => {
    // Check if this is M-Pesa SMS
    if (!isMpesaSms(text)) {
      return;
    }

    // Parse the SMS content
    const parsed = parseMpesaSms(text);
    if (parsed) {
      setParsedSms(parsed);
      // Auto-process if user is logged in
      if (user) {
        processAutomatically(text, parsed);
      }
    }
  };

  const isMpesaSms = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return lowerText.includes('mpesa') || 
           lowerText.includes('m-pesa') || 
           lowerText.includes('confirmed') || 
           lowerText.includes('ksh');
  };

  const parseMpesaSms = (text: string): ParsedSms | null => {
    // Extract amount
    const amountMatch = text.match(/ksh\s*([\d,\.]+)/i);
    if (!amountMatch) return null;

    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    
    // Extract transaction code
    const codeMatch = text.match(/([A-Z]{2}\d{6})/);
    const code = codeMatch ? codeMatch[1] : '';

    // Extract recipient name
    const recipientMatch = text.match(/(?:sent to|from)\s+([A-Z\s]+)\s+\d{10}/i);
    const recipient = recipientMatch ? recipientMatch[1].trim() : 'Unknown';

    // Smart categorization
    const hour = new Date().getHours();
    const isBusinessHours = hour >= 8 && hour <= 18;
    const isLargeAmount = amount > 5000;
    
    const type = (isBusinessHours && isLargeAmount) || 
                 text.toLowerCase().includes('hotel') || 
                 text.toLowerCase().includes('supplies') ? 'business' : 'personal';
                 
    const simCard = type === 'business' ? 'SIM1' : 'SIM2';

    return {
      amount,
      recipient,
      code,
      type,
      simCard
    };
  };

  const processAutomatically = async (smsText: string, parsed: ParsedSms) => {
    if (!user || isProcessing) return;

    setIsProcessing(true);

    try {
      // Create SMS transaction record
      const response = await fetch('/api/sms-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smsText,
          senderNumber: 'MPESA',
          simCard: parsed.simCard,
          accountType: parsed.type,
        }),
      });

      if (response.ok) {
        const smsRecord = await response.json();

        // Create transaction record
        await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parsed.amount.toString(),
            description: `Auto: ${parsed.recipient}`,
            transaction_date: new Date().toISOString().split('T')[0],
            direction: 'OUT',
            category_id: 1,
            sim_card: parsed.simCard,
            account_type: parsed.type,
            source: 'sms_share'
          }),
        });

        setIsProcessed(true);
      }
    } catch (error) {
      console.error('Failed to process SMS:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!smsText) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <Smartphone className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>SMS Share Target</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Share M-Pesa SMS messages directly to Yasinga for automatic processing.
              </p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        
        {/* Processing Status */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              SMS Automatically Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessed ? (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Successfully processed and saved to your expenses</span>
              </div>
            ) : isProcessing ? (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="animate-pulse text-blue-700">
                  🔄 Processing transaction...
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="text-yellow-700">
                  Please log in to automatically save this transaction
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parsed Transaction Details */}
        {parsedSms && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-lg">KES {parsedSms.amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-medium">{parsedSms.recipient}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Code:</span>
                <span className="text-sm text-gray-500">{parsedSms.code}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type:</span>
                <div className="flex gap-2">
                  <Badge variant={parsedSms.type === 'business' ? 'default' : 'secondary'}>
                    {parsedSms.type}
                  </Badge>
                  <Badge variant="outline">
                    {parsedSms.simCard}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original SMS Text */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Original SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 border-l-4 border-blue-200">
              {smsText}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {isProcessed && (
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              View Dashboard
            </Button>
          )}
          
          {!user && (
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full"
            >
              Login to Save Transaction
            </Button>
          )}
          
          <Button 
            onClick={() => router.push('/dashboard')} 
            variant="outline" 
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Next time, share M-Pesa SMS directly to Yasinga from your messaging app for instant processing.
          </p>
        </div>
      </div>
    </div>
  );
}