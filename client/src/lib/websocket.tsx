import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@shared/schema";

// Types
type WebSocketContextType = {
  isConnected: boolean;
  sendMessage: (activityId: number, content: string) => void;
  subscribeToActivity: (activityId: number) => Promise<boolean>;
  messages: Record<number, (Message & { senderName?: string })[]>;
  notifications: Notification[];
};

type Notification = {
  id: string;
  message: string;
  type: string;
  data?: any;
  timestamp: Date;
  read: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Record<number, (Message & { senderName?: string })[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Close existing socket if any
    if (socket) {
      socket.close();
    }

    // Create new socket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    // Setup event handlers
    newSocket.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      
      // Authenticate with the WebSocket server
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: user.id
      }));
    };

    newSocket.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === 'auth') {
          console.log("WebSocket authenticated:", data.success);
        } 
        else if (data.type === 'subscribe') {
          if (data.success && data.messages) {
            setMessages(prev => ({
              ...prev,
              [data.activityId]: data.messages
            }));
          }
        } 
        else if (data.type === 'chat') {
          const { activityId } = data;
          setMessages(prev => {
            const activityMessages = prev[activityId] || [];
            return {
              ...prev,
              [activityId]: [...activityMessages, data]
            };
          });
        } 
        else if (data.type === 'notification') {
          const newNotification: Notification = {
            id: Date.now().toString(),
            message: data.message,
            type: data.data?.type || 'general',
            data: data.data,
            timestamp: new Date(),
            read: false
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          toast({
            title: data.data?.type ? `New ${data.data.type.replace('_', ' ')}` : "Notification",
            description: data.message,
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user, toast]);

  // Send a chat message
  const sendMessage = (activityId: number, content: string) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !user) {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
      return;
    }

    socket.send(JSON.stringify({
      type: 'chat',
      activityId,
      senderId: user.id,
      content
    }));
  };

  // Subscribe to an activity's chat
  const subscribeToActivity = (activityId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket || socket.readyState !== WebSocket.OPEN || !user) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to chat. Please try again.",
          variant: "destructive",
        });
        resolve(false);
        return;
      }

      // Create a temporary handler for this subscription
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'subscribe' && data.activityId === activityId) {
            socket.removeEventListener('message', messageHandler);
            resolve(data.success);
          }
        } catch (error) {
          console.error("Error parsing subscription response:", error);
        }
      };

      socket.addEventListener('message', messageHandler);

      // Send subscription request
      socket.send(JSON.stringify({
        type: 'subscribe',
        activityId
      }));

      // Set a timeout in case we don't get a response
      setTimeout(() => {
        socket.removeEventListener('message', messageHandler);
        resolve(false);
      }, 5000);
    });
  };

  return (
    <WebSocketContext.Provider value={{
      isConnected,
      sendMessage,
      subscribeToActivity,
      messages,
      notifications
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}
