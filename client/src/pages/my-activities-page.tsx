import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { ActivityWithHost } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Calendar, MapPin, Users, Clock, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatModal } from "@/components/ui/chat-modal";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function MyActivitiesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithHost | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Fetch user's activities
  const { data: activities, isLoading } = useQuery<{
    hosting: ActivityWithHost[];
    participating: ActivityWithHost[];
  }>({
    queryKey: ["/api/users/activities"],
    enabled: !!user,
  });

  // Handle approve/reject participant
  const handleParticipantAction = async (activityId: number, userId: number, status: 'approved' | 'rejected') => {
    try {
      await apiRequest(
        "PATCH", 
        `/api/activities/${activityId}/participants/${userId}`, 
        { status }
      );
      
      // Invalidate activities cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/users/activities"] });
      
      toast({
        title: `Request ${status}`,
        description: status === 'approved' 
          ? "Participant has been approved to join" 
          : "Participant request has been rejected",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Unable to process the request. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle opening chat
  const handleOpenChat = (activity: ActivityWithHost) => {
    setSelectedActivity(activity);
    setShowChatModal(true);
  };

  // Format date helper
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filtering activities based on active tab
  const filteredActivities = activities ? {
    hosting: activities.hosting,
    participating: activities.participating,
    all: [...activities.hosting, ...activities.participating]
  } : { hosting: [], participating: [], all: [] };

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
          <h1 className="text-xl font-bold">My Activities</h1>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="hosting">Hosting</TabsTrigger>
              <TabsTrigger value="participating">Participating</TabsTrigger>
            </TabsList>
          </Tabs>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <TabsContent value="all" className="mt-0 space-y-4">
                {filteredActivities.all.length > 0 ? (
                  filteredActivities.all.map((activity) => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      user={user}
                      onOpenChat={handleOpenChat}
                      onParticipantAction={handleParticipantAction}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </TabsContent>

              <TabsContent value="hosting" className="mt-0 space-y-4">
                {filteredActivities.hosting.length > 0 ? (
                  filteredActivities.hosting.map((activity) => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      user={user}
                      onOpenChat={handleOpenChat}
                      onParticipantAction={handleParticipantAction}
                      showRequests={true}
                    />
                  ))
                ) : (
                  <EmptyState type="hosting" />
                )}
              </TabsContent>

              <TabsContent value="participating" className="mt-0 space-y-4">
                {filteredActivities.participating.length > 0 ? (
                  filteredActivities.participating.map((activity) => (
                    <ActivityCard 
                      key={activity.id}
                      activity={activity}
                      user={user}
                      onOpenChat={handleOpenChat}
                      onParticipantAction={handleParticipantAction}
                    />
                  ))
                ) : (
                  <EmptyState type="participating" />
                )}
              </TabsContent>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Chat Modal */}
      {selectedActivity && (
        <ChatModal 
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          activity={selectedActivity}
        />
      )}
    </div>
  );
}

// Activity Card Component
function ActivityCard({ 
  activity, 
  user, 
  onOpenChat, 
  onParticipantAction,
  showRequests = false
}: { 
  activity: ActivityWithHost; 
  user: any;
  onOpenChat: (activity: ActivityWithHost) => void;
  onParticipantAction: (activityId: number, userId: number, status: 'approved' | 'rejected') => void;
  showRequests?: boolean;
}) {
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const isHost = activity.hostId === user.id;
  const activityDate = new Date(activity.dateTime);
  const isPast = activityDate < new Date();
  
  // Fetch participants if showing requests
  const { data: participants } = useQuery<{ participant: any; user: any }[]>({
    queryKey: ["/api/activities", activity.id, "participants"],
    enabled: isHost && showRequests,
  });

  // Get pending requests
  const pendingRequests = participants?.filter(p => p.participant.status === 'pending') || [];

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{activity.title}</h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>{formatDate(activity.dateTime)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{activity.address || "Location hidden until approved"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>{activity.participantCount} / {activity.capacity} participants</span>
              </div>
              {!isPast && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary" />
                  <span>Starts {formatDistanceToNow(activityDate, { addSuffix: true })}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={isHost ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
              {isHost ? "Hosting" : "Participating"}
            </Badge>
            {activity.type && (
              <Badge variant="outline" className="mt-2">
                {activity.type}
              </Badge>
            )}
            {isPast && (
              <Badge variant="outline" className="mt-2 bg-gray-100">
                Past
              </Badge>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onOpenChat(activity)}
          >
            Chat
          </Button>
          
          {isHost && pendingRequests.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowPendingRequests(!showPendingRequests)}
            >
              Requests ({pendingRequests.length})
            </Button>
          )}
        </div>
      </div>
      
      {/* Pending Requests Section */}
      {isHost && showPendingRequests && pendingRequests.length > 0 && (
        <div className="bg-gray-50 p-4 border-t border-gray-100">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <UserCheck className="h-4 w-4 mr-1" />
            Pending Join Requests
          </h4>
          <div className="space-y-3">
            {pendingRequests.map(({ participant, user: requester }) => (
              <div key={participant.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <img 
                    src={requester.avatarUrl || "https://via.placeholder.com/40"} 
                    alt={requester.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="ml-2 font-medium">{requester.username}</span>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onParticipantAction(activity.id, requester.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onParticipantAction(activity.id, requester.id, 'approved')}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ type = 'all' }: { type?: 'all' | 'hosting' | 'participating' }) {
  let message = "You don't have any activities yet";
  let actionText = "Explore Activities";
  let actionLink = "/";
  
  if (type === 'hosting') {
    message = "You're not hosting any activities yet";
    actionText = "Create an Activity";
  } else if (type === 'participating') {
    message = "You're not participating in any activities yet";
    actionText = "Find Activities to Join";
  }
  
  return (
    <div className="bg-white rounded-lg p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium mb-2">{message}</h3>
      <p className="text-gray-500 mb-4">
        {type === 'hosting' 
          ? "Host your own activity and invite others to join!"
          : "Discover activities happening around you and connect with people."}
      </p>
      <Button asChild>
        <a href={actionLink}>{actionText}</a>
      </Button>
    </div>
  );
}
