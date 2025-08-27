
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface ConnectedDevice {
  id: string;
  name: string;
  lastSeen: Date;
  isOnline: boolean;
}

export function useRealtimeSync() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const connect = useCallback(async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not available for realtime sync');
        return;
      }

      // Mock connection for demo purposes
      setIsConnected(true);
      setLastSyncTime(new Date());
      
      // Simulate connected devices
      setConnectedDevices([
        {
          id: 'device-1',
          name: 'Main Phone',
          lastSeen: new Date(),
          isOnline: true
        }
      ]);

      console.log('Connected to realtime sync');
    } catch (error) {
      console.error('Failed to connect to realtime sync:', error);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      setIsConnected(false);
      setConnectedDevices([]);
      console.log('Disconnected from realtime sync');
    } catch (error) {
      console.error('Error disconnecting from realtime sync:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    try {
      if (!isConnected || !supabase) {
        console.warn('Not connected to realtime sync');
        return;
      }

      setLastSyncTime(new Date());
      console.log('Manual sync triggered');
      
      // Mock sync success
      return { success: true, timestamp: new Date() };
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [isConnected]);

  useEffect(() => {
    // Auto-connect on mount if supabase is available
    if (supabase) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectedDevices,
    triggerSync,
    disconnect,
    reconnect: connect,
    lastSyncTime
  };
}
