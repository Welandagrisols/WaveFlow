import { WebSocketServer, WebSocket } from 'ws';
import { log } from './vite';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface SyncMessage {
  type: 'sync' | 'transaction_update' | 'category_update' | 'heartbeat' | 'auth';
  data?: any;
  userId?: string;
  timestamp?: number;
}

class WebSocketManager {
  private clients = new Map<string, Set<AuthenticatedWebSocket>>();

  addClient(userId: string, ws: AuthenticatedWebSocket) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)!.add(ws);
    ws.userId = userId;
    ws.isAlive = true;
    
    log(`WebSocket client connected for user: ${userId.substring(0, 8)}...`);
  }

  removeClient(userId: string, ws: AuthenticatedWebSocket) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }
    log(`WebSocket client disconnected for user: ${userId.substring(0, 8)}...`);
  }

  broadcastToUser(userId: string, message: SyncMessage) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const messageStr = JSON.stringify({
        ...message,
        timestamp: Date.now()
      });
      
      userClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageStr);
        }
      });
    }
  }

  broadcastTransactionUpdate(userId: string, transaction: any) {
    this.broadcastToUser(userId, {
      type: 'transaction_update',
      data: transaction
    });
  }

  broadcastCategoryUpdate(userId: string, category: any) {
    this.broadcastToUser(userId, {
      type: 'category_update', 
      data: category
    });
  }

  getConnectedDevices(userId: string): number {
    return this.clients.get(userId)?.size || 0;
  }

  heartbeat() {
    this.clients.forEach((userClients, userId) => {
      userClients.forEach((ws) => {
        if (!ws.isAlive) {
          this.removeClient(userId, ws);
          ws.terminate();
          return;
        }
        
        ws.isAlive = false;
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      });
    });
  }
}

const wsManager = new WebSocketManager();

export function setupWebSocket(wss: WebSocketServer) {
  // Heartbeat interval to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wsManager.heartbeat();
  }, 30000);

  wss.on('connection', (ws: AuthenticatedWebSocket, request) => {
    ws.isAlive = true;
    
    // Extract user info from request headers or query params
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const authToken = url.searchParams.get('token') || request.headers.authorization;
    
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const message: SyncMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'auth':
            // In a real implementation, verify the auth token here
            if (message.data?.userId) {
              wsManager.addClient(message.data.userId, ws);
              ws.send(JSON.stringify({
                type: 'auth',
                data: { authenticated: true, connectedDevices: wsManager.getConnectedDevices(message.data.userId) }
              }));
            }
            break;
            
          case 'heartbeat':
            ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
            break;
            
          case 'sync':
            // Handle sync requests - could trigger data sync across devices
            if (ws.userId) {
              wsManager.broadcastToUser(ws.userId, {
                type: 'sync',
                data: message.data
              });
            }
            break;
        }
      } catch (error) {
        log(`WebSocket message error: ${error}`);
      }
    });

    ws.on('close', () => {
      if (ws.userId) {
        wsManager.removeClient(ws.userId, ws);
      }
    });

    ws.on('error', (error) => {
      log(`WebSocket error: ${error}`);
      if (ws.userId) {
        wsManager.removeClient(ws.userId, ws);
      }
    });
  });

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}

// Export the manager so routes can use it for broadcasting updates
export { wsManager };