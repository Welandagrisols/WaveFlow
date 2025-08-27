
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export function useErrorBoundary() {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const { toast } = useToast();

  const logError = useCallback((error: Error, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    setErrors(prev => [...prev.slice(-9), errorInfo]); // Keep last 10 errors

    // Show user-friendly message
    toast({
      title: "Something went wrong",
      description: context || "Please try again or contact support if the issue persists.",
      variant: "destructive"
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // In production, you could send to monitoring service
    // sendToMonitoringService(errorInfo);
  }, [toast]);

  return { logError, errors };
}
