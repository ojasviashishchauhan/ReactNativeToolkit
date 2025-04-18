import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { Message } from "@shared/schema";

// Chat message structure for WebSocket
interface ChatMessage {
  type: 'chat';
  activityId: number;
  senderId: number;
  content: string;
  timestamp?: Date;
}

// Notification message structure
interface NotificationMessage {
  type: 'notification';
  recipientId: number;
  message: string;
  data?: any;
}

// Connection tracking by user ID
const userConnections = new Map<number, WebSocket[]>();

// Connection tracking by activity ID
const activityConnections = new Map<number, Set<WebSocket>>();

export function setupWebsocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;
    let subscribedActivities = new Set<number>();

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        // Handle authentication
        if (data.type === 'auth') {
          userId = data.userId;
          
          // Register this connection for the user
          if (!userConnections.has(userId)) {
            userConnections.set(userId, []);
          }
          userConnections.get(userId)?.push(ws);
          
          // Send confirmation
          ws.send(JSON.stringify({ type: 'auth', success: true }));
        }
        // Handle subscribing to activity chat rooms
        else if (data.type === 'subscribe') {
          const activityId = data.activityId;
          
          // Verify user is allowed to join this chat (must be approved participant or host)
          const isAllowed = await storage.canUserAccessChat(userId!, activityId);
          
          if (isAllowed) {
            // Add to activity connections
            if (!activityConnections.has(activityId)) {
              activityConnections.set(activityId, new Set());
            }
            activityConnections.get(activityId)?.add(ws);
            subscribedActivities.add(activityId);
            
            // Get recent messages
            const recentMessages = await storage.getRecentMessagesByActivityId(activityId);
            
            // Send confirmation with recent messages
            ws.send(JSON.stringify({ 
              type: 'subscribe', 
              success: true, 
              activityId,
              messages: recentMessages
            }));
          } else {
            ws.send(JSON.stringify({ 
              type: 'subscribe', 
              success: false, 
              activityId,
              error: 'Not authorized to join this chat' 
            }));
          }
        }
        // Handle chat messages
        else if (data.type === 'chat' && userId) {
          const { activityId, content } = data as ChatMessage;
          
          // Verify user can send to this chat
          const isAllowed = await storage.canUserAccessChat(userId, activityId);
          
          if (isAllowed) {
            // Save message to database
            const message = await storage.createMessage({
              activityId,
              senderId: userId,
              content
            });
            
            // Broadcast to all connections for this activity
            const outgoingMessage = {
              id: message.id,
              type: 'chat',
              activityId,
              senderId: userId,
              senderName: (await storage.getUser(userId))?.username,
              content,
              timestamp: message.createdAt
            };
            
            const connections = activityConnections.get(activityId);
            if (connections) {
              for (const client of connections) {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(outgoingMessage));
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      // Remove from user connections
      if (userId) {
        const userWs = userConnections.get(userId);
        if (userWs) {
          const index = userWs.indexOf(ws);
          if (index !== -1) {
            userWs.splice(index, 1);
          }
          if (userWs.length === 0) {
            userConnections.delete(userId);
          }
        }
      }

      // Remove from activity connections
      subscribedActivities.forEach(activityId => {
        const connections = activityConnections.get(activityId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            activityConnections.delete(activityId);
          }
        }
      });
    });
  });

  return {
    // Helper function to send notification to a specific user
    sendNotification: (notification: NotificationMessage) => {
      const { recipientId } = notification;
      const connections = userConnections.get(recipientId) || [];
      
      connections.forEach(conn => {
        if (conn.readyState === WebSocket.OPEN) {
          conn.send(JSON.stringify(notification));
        }
      });
    }
  };
}
