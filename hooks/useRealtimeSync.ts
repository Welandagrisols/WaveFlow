import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface SyncMessage {
  type: 'sync' | 'transaction_update' | 'category_update' | 'heartbeat' | 'auth';
  data?: any;
  timestamp?: number;
}

export function useRealtimeSync() {
  // Demo mode - return mock values
  return {
    isConnected: true,
    connectedDevices: 1,
    lastSyncTime: new Date(),
    pendingSync: 0,
    triggerSync: () => {},
    disconnect: () => {},
    reconnect: () => {}
  };
}