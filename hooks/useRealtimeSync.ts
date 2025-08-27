
import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface SyncMessage {
  type: 'sync' | 'transaction_update' | 'category_update' | 'heartbeat' | 'auth';
  data?: any;
  timestamp?: number;
}

export function useRealtimeSync() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (!isAuthenticated || !user?.id) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        wsRef.current = ws;
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          data: { userId: user.id }
        }));

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000);

        console.log('Real-time sync connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: SyncMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'auth':
              if (message.data?.authenticated) {
                setConnectedDevices(message.data.connectedDevices || 1);
                toast({
                  title: "Sync Connected",
                  description: `${message.data.connectedDevices} device(s) synced`,
                });
              }
              break;

            case 'transaction_update':
              // Invalidate transaction queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/transactions/summary'] });
              queryClient.invalidateQueries({ queryKey: ['/api/transactions/by-category'] });
              
              toast({
                title: "Transaction Updated",
                description: "New transaction synced across devices",
              });
              break;

            case 'category_update':
              // Invalidate category queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
              
              toast({
                title: "Category Updated", 
                description: "Categories synced across devices",
              });
              break;

            case 'heartbeat':
              // Server heartbeat response
              break;

            case 'sync':
              // General sync message - refresh all data
              queryClient.invalidateQueries();
              break;
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setConnectedDevices(0);
        wsRef.current = null;
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt to reconnect after 5 seconds
        if (isAuthenticated) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    setIsConnected(false);
    setConnectedDevices(0);
  };

  const triggerSync = (data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'sync',
        data
      }));
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectedDevices,
    triggerSync,
    disconnect,
    reconnect: connect
  };
}
