import { useState } from "react";
import { ActivityWithHost } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Calendar, Clock, Users, MapPin, InfoIcon, Star } from "lucide-react";

type ActivityDetailsProps = {
  activity: ActivityWithHost;
  isOpen: boolean;
  onToggle: () => void;
  onOpenChat: (activity: ActivityWithHost) => void;
  onViewProfile: (userId: number) => void;
  userLocation?: { lat: number; lng: number } | null;
};

export function ActivityDetails({
  activity,
  isOpen,
  onToggle,
  onOpenChat,
  onViewProfile,
  userLocation
}: ActivityDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [joinRequestStatus, setJoinRequestStatus] = useState(activity.status || null);
  
  // Join Request Mutation
  const joinRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/activities/${activity.id}/join`, {});
      return await res.json();
    },
    onSuccess: () => {
      setJoinRequestStatus("pending");
      queryClient.invalidateQueries({ queryKey: ["/api/activities", activity.id] });
      toast({
        title: "Request Sent",
        description: "Your request to join this activity has been sent to the host",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinRequest = () => {
    joinRequestMutation.mutate();
  };

  const handleOpenChat = () => {
    onOpenChat(activity);
  };

  const handleViewHostProfile = () => {
    onViewProfile(activity.host.id);
  };

  // Format date
  const formattedDateTime = format(
    new Date(activity.dateTime),
    "MMMM d, yyyy 'at' h:mm a"
  );

  const isPast = new Date(activity.dateTime) < new Date();
  const isHost = user && activity.hostId === user.id;
  const isParticipant = joinRequestStatus === "approved";
  const isPending = joinRequestStatus === "pending";
  const isRejected = joinRequestStatus === "rejected";
  const canJoin = !isPast && !isHost && !isParticipant && !isPending && !isRejected;
  const canChat = isHost || isParticipant;

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl shadow-lg transform transition-transform duration-300 ease-in-out`}
      style={{ 
        height: '350px', 
        transform: isOpen ? 'translateY(0)' : 'translateY(290px)'
      }}
    >
      <div 
        className="absolute -top-0 left-0 right-0 flex justify-center cursor-pointer"
        style={{ transform: 'translateY(-50%)' }}
        onClick={onToggle}
      >
        <div className="w-12 h-12 bg-background border border-border shadow-lg rounded-full flex items-center justify-center">
          {isOpen ? 
            <ChevronDown className="text-muted-foreground" size={22} /> : 
            <ChevronUp className="text-muted-foreground" size={22} />
          }
        </div>
      </div>

      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">{activity.title}</h2>
          <Badge variant="outline" className="px-3 py-1 text-sm text-primary border-primary/40 font-medium">
            {activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center mb-4 cursor-pointer group" onClick={handleViewHostProfile}>
          {activity.host.avatarUrl ? (
            <img 
              src={activity.host.avatarUrl} 
              alt={`${activity.host.username}'s avatar`} 
              className="w-10 h-10 rounded-full mr-3 object-cover border border-border" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-border mr-3">
              <span className="text-primary font-semibold">
                {activity.host.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
              Hosted by <span>{activity.host.username}</span>
              {isHost && <span className="ml-1 text-xs text-primary">(You)</span>}
            </p>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs ml-1 text-muted-foreground">
                {activity.host.rating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-accent/40 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground text-sm mb-1">Date & Time</div>
            <div className="font-medium text-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-primary" />
              {format(new Date(activity.dateTime), "MMMM d, yyyy")}
            </div>
            <div className="font-medium text-foreground flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1 text-primary" />
              {format(new Date(activity.dateTime), "h:mm a")}
            </div>
          </div>
          <div className="bg-accent/40 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground text-sm mb-1">Participants</div>
            <div className="font-medium text-foreground flex items-center">
              <Users className="h-4 w-4 mr-1 text-primary" />
              {activity.participantCount}/{activity.capacity} joined
            </div>
            <div className="flex mt-1">
              {/* Participant avatars would go here */}
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary border border-border">
                {activity.participantCount}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-foreground mb-2">About This Activity</h3>
          <p className="text-muted-foreground">
            {activity.description}
          </p>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-foreground mb-2">Location</h3>
          <div className="text-muted-foreground flex items-start">
            <MapPin className="h-4 w-4 mt-1 mr-2 text-primary" />
            <span>
              {activity.address || 
                (userLocation ? 
                  `Approximately ${Math.round(
                    getDistanceInKm(
                      userLocation.lat,
                      userLocation.lng,
                      activity.latitude, 
                      activity.longitude
                    )
                  )} km from your location` : 
                  "Location will be shared when you join")
              }
            </span>
          </div>
          {!isParticipant && !isHost && (
            <div className="flex items-center text-xs text-muted-foreground mt-2 ml-6">
              <InfoIcon className="h-3 w-3 mr-1" /> 
              Exact location will be revealed after your request is approved
            </div>
          )}
        </div>

        {canJoin ? (
          <Button 
            className="w-full" 
            disabled={joinRequestMutation.isPending}
            onClick={handleJoinRequest}
          >
            {joinRequestMutation.isPending ? "Sending Request..." : "Request to Join"}
          </Button>
        ) : canChat ? (
          <Button 
            className="w-full" 
            onClick={handleOpenChat}
          >
            Open Chat
          </Button>
        ) : isPending ? (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            Request Pending
          </Button>
        ) : isRejected ? (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            Request Rejected
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full" 
            disabled
          >
            {isPast ? "Activity Has Ended" : "Unable to Join"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate distance between two coordinates
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}
