import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AutoDetectedSms {
  id: string;
  smsText: string;
  senderNumber: string;
  simCard: 'SIM1' | 'SIM2';
  accountType: 'business' | 'personal';
  timestamp: Date;
  isProcessed: boolean;
  parsedAmount?: number;
  recipientName?: string;
  transactionCode?: string;
}

export const useSmsAutoDetect = () => {
  const [isListening, setIsListening] = useState(false);
  const [detectedSms, setDetectedSms] = useState<AutoDetectedSms[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<AutoDetectedSms[]>([]);
  const { user } = useAuth();

  // Start automatic SMS detection simulation
  const startAutoDetection = () => {
    setIsListening(true);
    console.log('🔍 Auto-detection started - Monitoring for M-Pesa SMS...');
    
    // In a real mobile app, this would register the SMS listener
    // For web demo, we'll simulate receiving SMS messages
    simulateIncomingSms();
  };

  const stopAutoDetection = () => {
    setIsListening(false);
    console.log('⏹️ Auto-detection stopped');
  };

  // Simulate incoming M-Pesa SMS for demo purposes
  const simulateIncomingSms = () => {
    // Example M-Pesa SMS templates for simulation
    const sampleMpesaSms = [
      {
        text: "QR345678 Confirmed. Ksh2,500.00 sent to JOHN KAMAU 0712345678 on 27/8/25 at 2:45 PM. New M-PESA balance is Ksh15,750.50. Transaction cost Ksh25.00",
        sender: "MPESA",
        recipient: "JOHN KAMAU",
        amount: 2500,
        type: "business"
      },
      {
        text: "QR456789 Confirmed. You have received Ksh1,200.00 from MARY WANJIKU 0723456789 on 27/8/25 at 3:15 PM. New M-PESA balance is Ksh16,950.50",
        sender: "MPESA", 
        recipient: "MARY WANJIKU",
        amount: 1200,
        type: "business"
      }
    ];

    // Simulate random SMS arrival every 10-30 seconds when listening
    setTimeout(() => {
      if (isListening && Math.random() > 0.7) {
        const randomSms = sampleMpesaSms[Math.floor(Math.random() * sampleMpesaSms.length)];
        processIncomingSms(randomSms.text, randomSms.sender);
      }
      if (isListening) {
        simulateIncomingSms(); // Continue simulation
      }
    }, Math.random() * 20000 + 10000); // 10-30 seconds
  };

  // Process incoming SMS (real or simulated)
  const processIncomingSms = async (smsText: string, sender: string) => {
    if (!isMpesaSms(sender, smsText)) {
      return; // Ignore non-M-Pesa SMS
    }

    const newSms: AutoDetectedSms = {
      id: 'sms_' + Date.now(),
      smsText,
      senderNumber: sender,
      simCard: detectSimCard(smsText),
      accountType: classifyAccountType(smsText),
      timestamp: new Date(),
      isProcessed: false,
      ...parseBasicInfo(smsText)
    };

    console.log('📱 New M-Pesa SMS detected:', newSms);
    
    setDetectedSms(prev => [...prev, newSms]);
    setPendingTransactions(prev => [...prev, newSms]);

    // Auto-create transaction in background
    await createAutoTransaction(newSms);
  };

  // Detect if SMS is from M-Pesa
  const isMpesaSms = (sender: string, body: string): boolean => {
    const mpesaSenders = ['MPESA', 'M-PESA', 'Safaricom'];
    const bodyLower = body.toLowerCase();
    
    return (
      mpesaSenders.some(s => sender.includes(s)) ||
      bodyLower.includes('ksh') ||
      bodyLower.includes('m-pesa') ||
      bodyLower.includes('confirmed')
    );
  };

  // Smart SIM card detection
  const detectSimCard = (smsText: string): 'SIM1' | 'SIM2' => {
    // In real implementation, this would detect which SIM received the SMS
    // For demo, we'll use business hours logic
    const hour = new Date().getHours();
    return hour >= 9 && hour <= 17 ? 'SIM1' : 'SIM2'; // Business hours = SIM1
  };

  // Classify as business or personal transaction
  const classifyAccountType = (smsText: string): 'business' | 'personal' => {
    const businessKeywords = ['hotel', 'restaurant', 'supplies', 'staff', 'guest'];
    const personalKeywords = ['family', 'personal', 'grocery', 'transport'];
    
    const textLower = smsText.toLowerCase();
    
    if (businessKeywords.some(keyword => textLower.includes(keyword))) {
      return 'business';
    }
    if (personalKeywords.some(keyword => textLower.includes(keyword))) {
      return 'personal';
    }
    
    // Default logic: business during work hours
    const hour = new Date().getHours();
    return hour >= 8 && hour <= 18 ? 'business' : 'personal';
  };

  // Parse basic transaction info
  const parseBasicInfo = (smsText: string) => {
    const amountMatch = smsText.match(/ksh([\d,\.]+)/i);
    const codeMatch = smsText.match(/([A-Z]{2}\d{6})/);
    const nameMatch = smsText.match(/(?:sent to|from)\s+([A-Z\s]+)\s+\d{10}/i);

    return {
      parsedAmount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined,
      transactionCode: codeMatch ? codeMatch[1] : undefined,
      recipientName: nameMatch ? nameMatch[1].trim() : undefined
    };
  };

  // Auto-create transaction record
  const createAutoTransaction = async (smsData: AutoDetectedSms) => {
    if (!user) return;

    try {
      const response = await fetch('/api/sms-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smsText: smsData.smsText,
          senderNumber: smsData.senderNumber,
          simCard: smsData.simCard,
          accountType: smsData.accountType
        })
      });

      if (response.ok) {
        console.log('✅ Auto-created transaction record');
        
        // Mark as processed
        setDetectedSms(prev => 
          prev.map(sms => 
            sms.id === smsData.id ? { ...sms, isProcessed: true } : sms
          )
        );
      }
    } catch (error) {
      console.error('Failed to auto-create transaction:', error);
    }
  };

  // Manual SMS input for testing
  const addManualSms = (smsText: string) => {
    processIncomingSms(smsText, 'MPESA');
  };

  // Get unconfirmed transactions
  const getUnconfirmedCount = () => {
    return pendingTransactions.filter(sms => !sms.isProcessed).length;
  };

  // Mark transaction as confirmed
  const confirmTransaction = (smsId: string) => {
    setPendingTransactions(prev => 
      prev.filter(sms => sms.id !== smsId)
    );
  };

  return {
    isListening,
    detectedSms,
    pendingTransactions,
    startAutoDetection,
    stopAutoDetection,
    addManualSms,
    getUnconfirmedCount,
    confirmTransaction
  };
};