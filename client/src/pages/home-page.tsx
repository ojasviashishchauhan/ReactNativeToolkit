import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ActivityWithHost } from "@shared/schema";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { GoogleMapView } from "@/components/ui/google-map-view";
import { ActivityDetails } from "@/components/ui/activity-details";
import { CreateActivityModal } from "@/components/ui/create-activity-modal";
import { ChatModal } from "@/components/ui/chat-modal";
import { ProfileModal } from "@/components/ui/profile-modal";
import { Bell, Search, Activity } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithHost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location if geolocation is denied
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC as fallback
        }
      );
    } else {
      // Browser doesn't support geolocation
      setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC as fallback
    }
  }, []);

  // Fetch nearby activities
  const { data: activities, isLoading } = useQuery<ActivityWithHost[]>({
    queryKey: [
      "/api/activities", 
      userLocation ? `lat=${userLocation.lat}&lng=${userLocation.lng}` : null
    ],
    enabled: !!userLocation,
  });

  const handleActivityClick = (activity: ActivityWithHost) => {
    setSelectedActivity(activity);
    setDetailsPanelOpen(true);
  };

  const handleTogglePanel = () => {
    setDetailsPanelOpen(!detailsPanelOpen);
  };

  const handleCreateActivity = () => {
    setShowCreateModal(true);
  };

  const handleOpenChat = (activity: ActivityWithHost) => {
    setSelectedActivity(activity);
    setShowChatModal(true);
  };

  const handleViewProfile = (userId: number) => {
    // This would generally fetch the profile data for the user
    setShowProfileModal(true);
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex justify-between items-center md:justify-end p-4">
            {/* Mobile Logo */}
            <div className="flex md:hidden items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity size={20} className="text-primary" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent ml-2">
                Connect
              </h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative flex-1 max-w-lg mx-4">
              <input 
                type="text" 
                placeholder="Search activities nearby..." 
                className="py-2 px-4 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search size={18} className="absolute left-3 text-gray-400" />
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <button className="md:flex hidden items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100">
                <Search size={20} />
              </button>
              <div className="md:hidden relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                  <Bell size={16} className="text-white" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">3</span>
                </div>
              </div>
              <div className="md:hidden" onClick={() => handleViewProfile(user?.id || 0)}>
                {user?.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="User avatar" 
                    className="w-9 h-9 rounded-full object-cover border border-gray-200" 
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-gray-200">
                    <span className="text-primary font-semibold">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Map View */}
        <div className="flex-1 overflow-hidden">
          <GoogleMapView 
            userLocation={userLocation}
            activities={activities || []}
            onActivityClick={handleActivityClick}
            onCreateActivity={handleCreateActivity}
          />

          {/* Activity Details Panel */}
          {selectedActivity && (
            <ActivityDetails 
              activity={selectedActivity}
              isOpen={detailsPanelOpen}
              onToggle={handleTogglePanel}
              onOpenChat={handleOpenChat}
              onViewProfile={handleViewProfile}
              userLocation={userLocation}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Modals */}
      <CreateActivityModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userLocation={userLocation}
      />

      {selectedActivity && (
        <ChatModal 
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          activity={selectedActivity}
        />
      )}

      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={user?.id || 0}
      />
    </div>
  );
}
