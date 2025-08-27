import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface Device {
  id: string;
  name: string;
  lastSync: Date;
}

export function useRealtimeSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  const connect = () => {
    if (!user) {
      console.log('No user authenticated, skipping WebSocket connection');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear existing heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.log('Server-side rendering, skipping WebSocket connection');
      return;
    }

    try {
      // For development, create a mock connection
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock real-time sync');
        setIsConnected(true);

        // Simulate connected devices
        setConnectedDevices([
          {
            id: 'device-1',
            name: 'Primary Phone',
            lastSync: new Date(),
          },
        ]);

        return;
      }

      // Production WebSocket logic would go here
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
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
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'devices':
              setConnectedDevices(data.devices);
              break;
            case 'sync':
              console.log('Sync event received:', data);
              break;
            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    setIsConnected(false);
    setConnectedDevices([]);
  };

  const triggerSync = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'sync' }));
    } else {
      console.log('WebSocket not connected, cannot trigger sync');
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  return {
    isConnected,
    connectedDevices,
    triggerSync,
    disconnect,
    reconnect: connect
  };
}