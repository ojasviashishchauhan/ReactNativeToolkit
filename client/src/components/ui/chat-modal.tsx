import { useState, useEffect, useRef } from "react";
import { ActivityWithHost, Message } from "@shared/schema";
import { useWebSocket } from "@/lib/websocket";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { X, PaperclipIcon, Send } from "lucide-react";

type ChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityWithHost;
};

export function ChatModal({ isOpen, onClose, activity }: ChatModalProps) {
  const { user } = useAuth();
  const { messages, sendMessage, subscribeToActivity } = useWebSocket();
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activityMessages = messages[activity.id] || [];

  // Subscribe to activity chat when modal opens
  useEffect(() => {
    if (isOpen && user && activity) {
      setLoading(true);
      subscribeToActivity(activity.id)
        .then((success) => {
          if (!success) {
            setError("Unable to join chat. You may not have permission.");
          }
          setLoading(false);
        })
        .catch(() => {
          setError("An error occurred while connecting to chat.");
          setLoading(false);
        });
    }
  }, [isOpen, user, activity, subscribeToActivity]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activityMessages]);

  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageText.trim() || !user) return;
    
    sendMessage(activity.id, messageText);
    setMessageText("");
  };

  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date for showing date separators
  const groupedMessages: { [date: string]: (Message & { senderName?: string })[] } = {};
  activityMessages.forEach(message => {
    const date = new Date(message.createdAt).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 h-[90vh] flex flex-col max-h-[90vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center">
          <button className="mr-3 text-gray-500" onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center flex-1">
            <img 
              src={activity.host.avatarUrl || "https://via.placeholder.com/100"} 
              alt={activity.title} 
              className="w-10 h-10 rounded-full object-cover mr-3" 
            />
            <div>
              <h3 className="font-medium">{activity.title}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <span>{activity.participantCount} participants</span>
                <span className="mx-1">•</span>
                <span>{format(new Date(activity.dateTime), "MMM d")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="text-red-500 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-700">{error}</p>
                <Button className="mt-2" onClick={onClose}>Close</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="flex justify-center">
                <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-600">
                  Welcome to the chat for "{activity.title}"
                </div>
              </div>
              
              {/* System Message about joining */}
              <div className="flex justify-center">
                <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-600">
                  {activity.hostId === user?.id 
                    ? "You're hosting this activity" 
                    : `${activity.host.username} added you to the group`}
                </div>
              </div>
              
              {/* Messages by Date */}
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-200 rounded-full px-4 py-1 text-xs text-gray-600">
                      {new Date(date).toLocaleDateString(undefined, { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  {/* Messages for this date */}
                  {dateMessages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id;
                    return (
                      <div 
                        key={message.id} 
                        className={`flex items-end space-x-2 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                      >
                        {!isCurrentUser && (
                          <img 
                            src={message.senderId === activity.host.id 
                              ? activity.host.avatarUrl || "https://via.placeholder.com/40" 
                              : "https://via.placeholder.com/40"} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full" 
                          />
                        )}
                        <div className={`message-bubble ${
                          isCurrentUser 
                            ? 'bg-primary text-white rounded-lg rounded-br-none' 
                            : 'bg-white rounded-lg rounded-bl-none shadow-sm'
                        } p-3 max-w-[80%] w-fit`}>
                          {!isCurrentUser && (
                            <div className="text-xs font-medium text-gray-700 mb-1">
                              {message.senderName || `User ${message.senderId}`}
                            </div>
                          )}
                          <p className={isCurrentUser ? 'text-white' : 'text-gray-800'}>
                            {message.content}
                          </p>
                          <span className={`text-xs mt-1 block ${
                            isCurrentUser ? 'text-blue-100' : 'text-gray-400'
                          }`}>
                            {format(new Date(message.createdAt), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              
              {/* Auto-scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        {!error && (
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <PaperclipIcon className="h-5 w-5" />
              </button>
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 py-2 px-3 border border-gray-300 rounded-full mx-2"
              />
              <Button
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
