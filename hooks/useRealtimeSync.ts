
import { useState, useCallback, useRef } from 'react';

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
  const cleanupRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    try {
      // Prevent multiple connections
      if (isConnected) return;

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
  }, [isConnected]);

  const disconnect = useCallback(() => {
    try {
      if (!isConnected) return;
      
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      
      setIsConnected(false);
      setConnectedDevices([]);
      console.log('Disconnected from realtime sync');
    } catch (error) {
      console.error('Error disconnecting from realtime sync:', error);
    }
  }, [isConnected]);

  const triggerSync = useCallback(async () => {
    try {
      if (!isConnected) {
        console.warn('Not connected to realtime sync');
        return;
      }

      setLastSyncTime(new Date());
      console.log('Manual sync triggered');
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    }
  }, [isConnected]);

  return {
    isConnected,
    connectedDevices,
    lastSyncTime,
    connect,
    disconnect,
    triggerSync
  };
}
