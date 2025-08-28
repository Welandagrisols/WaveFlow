import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useRealtimeSync(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState(0);

  // Since we can't use WebSockets in serverless, we'll implement polling
  useEffect(() => {
    if (!userId) return;

    // Simulate connection status
    setIsConnected(true);
    setConnectedDevices(1);

    // Optional: Implement periodic data refresh
    const interval = setInterval(async () => {
      try {
        // Refresh transaction data periodically
        await api.getTransactions();
      } catch (error) {
        console.error('Sync error:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [userId]);

  const syncData = async () => {
    try {
      await api.getTransactions();
      return true;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return false;
    }
  };

  return {
    isConnected,
    connectedDevices,
    syncData
  };
}