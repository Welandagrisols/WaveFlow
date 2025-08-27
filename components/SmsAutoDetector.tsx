import React, { useState } from 'react';
import { useSmsAutoDetect } from '@/hooks/useSmsAutoDetect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Smartphone, 
  Play, 
  Square, 
  CheckCircle, 
  Clock, 
  MessageSquare,
  Zap,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export function SmsAutoDetector() {
  const {
    isListening,
    detectedSms,
    pendingTransactions,
    startAutoDetection,
    stopAutoDetection,
    addManualSms,
    getUnconfirmedCount,
    confirmTransaction
  } = useSmsAutoDetect();
  
  const [manualSms, setManualSms] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleToggleDetection = () => {
    if (isListening) {
      stopAutoDetection();
    } else {
      startAutoDetection();
    }
  };

  const handleManualSmsSubmit = () => {
    if (manualSms.trim()) {
      addManualSms(manualSms.trim());
      setManualSms('');
      setShowManualInput(false);
    }
  };

  const sampleSmsTemplates = [
    "QR345678 Confirmed. Ksh2,500.00 sent to JOHN KAMAU 0712345678 on 27/8/25 at 2:45 PM. New M-PESA balance is Ksh15,750.50. Transaction cost Ksh25.00",
    "QR456789 Confirmed. You have received Ksh1,200.00 from MARY WANJIKU 0723456789 on 27/8/25 at 3:15 PM. New M-PESA balance is Ksh16,950.50",
    "QR567890 Confirmed. Ksh850.00 sent to HOTEL SUPPLIES 0734567890 on 27/8/25 at 4:30 PM. New M-PESA balance is Ksh14,900.50"
  ];

  return (
    <div className="space-y-6">
      {/* Detection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Automatic M-Pesa SMS Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">
                {isListening ? 'Active - Monitoring SMS Messages' : 'Paused - Not Monitoring'}
              </span>
              {getUnconfirmedCount() > 0 && (
                <Badge variant="destructive">
                  {getUnconfirmedCount()} pending
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleToggleDetection}
                variant={isListening ? "destructive" : "default"}
                size="sm"
              >
                {isListening ? (
                  <>
                    <Square className="w-4 h-4 mr-2" />
                    Pause Monitoring
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Resume Monitoring
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowManualInput(!showManualInput)}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Test SMS
              </Button>
            </div>
          </div>

          {isListening && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Yasinga is now actively monitoring your SMS messages for M-Pesa transactions.
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                All M-Pesa transactions will be automatically detected, parsed, and added to your expense tracking.
              </p>
            </div>
          )}

          {!isListening && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  SMS monitoring is paused. Your transactions won't be automatically tracked.
                </span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Click "Resume Monitoring" to continue automatic expense tracking.
              </p>
            </div>
          )}

          {/* Manual SMS Input for Testing */}
          {showManualInput && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-sm mb-3">Test SMS Detection</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Paste M-Pesa SMS or select template:
                  </label>
                  <div className="flex gap-2 mb-2">
                    {sampleSmsTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setManualSms(template)}
                      >
                        Sample {index + 1}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    value={manualSms}
                    onChange={(e) => setManualSms(e.target.value)}
                    placeholder="Paste M-Pesa SMS message here..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleManualSmsSubmit} size="sm">
                    Process SMS
                  </Button>
                  <Button 
                    onClick={() => setShowManualInput(false)} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detected SMS Messages */}
      {detectedSms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Detected M-Pesa Messages ({detectedSms.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detectedSms.slice().reverse().map((sms) => (
                <div
                  key={sms.id}
                  className="border rounded-lg p-3 bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={sms.accountType === 'business' ? 'default' : 'secondary'}>
                        {sms.simCard} - {sms.accountType}
                      </Badge>
                      {sms.isProcessed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {format(sms.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  
                  {sms.parsedAmount && (
                    <div className="mb-2">
                      <span className="text-sm font-medium">
                        KES {sms.parsedAmount.toLocaleString()}
                      </span>
                      {sms.recipientName && (
                        <span className="text-sm text-gray-600 ml-2">
                          → {sms.recipientName}
                        </span>
                      )}
                      {sms.transactionCode && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({sms.transactionCode})
                        </span>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-4 border-blue-200">
                    {sms.smsText}
                  </p>
                  
                  {!sms.isProcessed && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        onClick={() => confirmTransaction(sms.id)}
                        size="sm"
                        variant="outline"
                      >
                        Confirm & Create Transaction
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900 mb-1">How Automatic Detection Works:</p>
              <ul className="text-gray-600 space-y-1 text-xs">
                <li>• Monitors incoming SMS messages for M-Pesa keywords</li>
                <li>• Automatically parses transaction amounts, recipients, and codes</li>
                <li>• Classifies transactions as business or personal based on time and content</li>
                <li>• Detects which SIM card received the message for dual-SIM users</li>
                <li>• Creates transaction records automatically in the background</li>
                <li>• Shows notifications for quick confirmation of detected transactions</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                Note: In a mobile app, this would run continuously in the background. 
                This web version demonstrates the automatic processing functionality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}