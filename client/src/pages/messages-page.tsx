import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatModal } from "@/components/ui/chat-modal";
import { ActivityWithHost } from "@shared/schema";

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithHost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch activities where user is participating
  const { data: activities, isLoading } = useQuery<{
    hosting: ActivityWithHost[];
    participating: ActivityWithHost[];
  }>({
    queryKey: ["/api/users/activities"],
    enabled: !!user,
  });

  // All activities with chat access (both hosting and participating)
  const allActivities = [
    ...(activities?.hosting || []),
    ...(activities?.participating || []),
  ];

  // Filter activities by search term
  const filteredActivities = allActivities.filter(
    activity => 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.host.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    return date.toLocaleDateString();
  };

  const handleOpenChat = (activity: ActivityWithHost) => {
    setSelectedActivity(activity);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="mt-3 relative">
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredActivities.length > 0 ? (
            <ScrollArea className="h-full">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleOpenChat(activity)}
                >
                  <div className="flex items-center">
                    <div className="relative">
                      <img 
                        src={activity.host.avatarUrl || "https://via.placeholder.com/50"} 
                        alt={activity.title} 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div 
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          new Date(activity.dateTime) > new Date() ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-gray-900">{activity.title}</h3>
                        <span className="text-xs text-gray-500">{formatDate(activity.dateTime)}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {activity.hostId === user.id 
                            ? "You're hosting this activity" 
                            : `Hosted by ${activity.host.username}`}
                        </p>
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                            {activity.participantCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? "No matching conversations found" 
                  : "Join or create activities to start chatting with participants"}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Chat Modal */}
      {selectedActivity && (
        <ChatModal 
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          activity={selectedActivity}
        />
      )}
    </div>
  );
}
