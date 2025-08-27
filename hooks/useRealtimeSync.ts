import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { queryClient } from '@/lib/queryClient';
import { useToast } from './use-toast';

interface SyncMessage {
  type: 'sync' | 'transaction_update' | 'category_update' | 'heartbeat' | 'auth';
  data?: any;
  timestamp?: number;
}

// Interface for connected devices, potentially to be used in the future
interface ConnectedDevice {
  id: string;
  name: string;
  lastSeen: Date;
}

export function useRealtimeSync() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  // Use ConnectedDevice[] for connectedDevices state
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.id) return;

    // In development, we'll use mock logic for connection
    if (process.env.NODE_ENV === 'development') {
      setIsConnected(true);
      setConnectedDevices([]); // Reset connected devices in dev mode for simplicity
      console.log('Realtime sync connected (Development Mode)');
      return;
    }

    // Production logic for WebSocket connection
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Assuming Supabase URL or similar structure for WebSocket
      // This part might need adjustment based on actual Supabase WebSocket endpoint
      const wsUrl = `${protocol}//${window.location.host}/realtime/v1/client`; // Example endpoint
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        wsRef.current = ws;
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'auth',
          data: { userId: user.id, // Assuming user ID is available
                  // Potentially add JWT or other auth tokens here
                  // For Supabase, this might involve a token obtained from Supabase client
                 }
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
                // Update connected devices count. The actual data structure might differ.
                // For now, mock data is used as per the edited snippet's direction.
                // If actual device data is sent, this would parse it.
                // setConnectedDevices(message.data.connectedDevices || 1); 
                // As per edited snippet, connectedDevices is an array of ConnectedDevice
                // This part needs actual data structure to be filled correctly
                console.log("Authenticated. Connected devices:", message.data.connectedDevices);
                setConnectedDevices([]); // Reset for mock purposes
                
                toast({
                  title: "Sync Connected",
                  description: `${message.data.connectedDevices || 1} device(s) synced`,
                });
              } else {
                console.error("Authentication failed");
                toast({ title: "Sync Authentication Failed", variant: "destructive" });
              }
              break;

            case 'transaction_update':
              queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
              queryClient.invalidateQueries({ queryKey: ['/api/transactions/summary'] });
              queryClient.invalidateQueries({ queryKey: ['/api/transactions/by-category'] });
              
              toast({
                title: "Transaction Updated",
                description: "New transaction synced across devices",
              });
              break;

            case 'category_update':
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
        setConnectedDevices([]); // Clear devices on disconnect
        wsRef.current = null;
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Attempt to reconnect after 5 seconds if still authenticated
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
        setConnectedDevices([]);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setConnectedDevices([]);
    }
  }, [isAuthenticated, user?.id, toast]); // Include dependencies for useCallback

  const disconnect = useCallback(() => {
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
    setConnectedDevices([]);
    console.log('Real-time sync disconnected');
  }, []);

  const triggerSync = useCallback((data?: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'sync',
        data
      }));
      console.log('Sync triggered with data:', data);
    } else if (process.env.NODE_ENV === 'development') {
      // Mock sync logic for development
      console.log('Triggering sync across devices (Development Mode)');
    } else {
      console.warn('Cannot trigger sync: WebSocket not connected.');
    }
  }, []); // No dependencies needed here if it only checks wsRef.current

  useEffect(() => {
    // Auto-connect in development mode, or if authenticated in production
    if (process.env.NODE_ENV === 'development') {
      connect();
    } else if (isAuthenticated && user?.id) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup function to disconnect when the component unmounts or dependencies change
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.id, connect, disconnect]); // Dependencies for the effect

  // Cleanup on unmount - this effect is redundant given the return in the previous useEffect, but kept for consistency if needed.
  // However, it's better to have a single cleanup in the main useEffect.
  // Removing this redundant effect.

  return {
    isConnected,
    connectedDevices,
    triggerSync,
    disconnect,
    reconnect: connect // Alias for connect
  };
}