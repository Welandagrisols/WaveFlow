
import { useState, useCallback } from 'react';

interface SmsMessage {
  content: string;
  timestamp: Date;
  sender: string;
}

export function useSmsOptimization() {
  const [processingQueue, setProcessingQueue] = useState<SmsMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const queueSmsForProcessing = useCallback((sms: SmsMessage) => {
    setProcessingQueue(prev => [...prev, sms]);
  }, []);

  const processSmsQueue = useCallback(async () => {
    if (isProcessing || processingQueue.length === 0) return;

    setIsProcessing(true);
    const batch = processingQueue.slice(0, 5); // Process 5 at a time
    
    try {
      // Process SMS messages in batch
      const results = await Promise.allSettled(
        batch.map(async (sms) => {
          // Your SMS parsing logic here
          const response = await fetch('/api/sms-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: sms.content })
          });
          return response.json();
        })
      );

      console.log(`Processed ${results.length} SMS messages`);
      
      // Remove processed messages from queue
      setProcessingQueue(prev => prev.slice(batch.length));
    } catch (error) {
      console.error('SMS processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [processingQueue, isProcessing]);

  return {
    queueSmsForProcessing,
    processSmsQueue,
    isProcessing,
    queueLength: processingQueue.length
  };
}
