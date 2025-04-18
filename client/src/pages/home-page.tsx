import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { ActivityWithHost } from "@shared/schema";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { MapView } from "@/components/ui/map-view";
import { ActivityDetails } from "@/components/ui/activity-details";
import { CreateActivityModal } from "@/components/ui/create-activity-modal";
import { ChatModal } from "@/components/ui/chat-modal";
import { ProfileModal } from "@/components/ui/profile-modal";

export default function HomePage() {
  const { user } = useAuth();
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithHost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [detailsPanelOpen, setDetailsPanelOpen] = useState(false);

  // Get current location
  useState(() => {
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
    }
  });

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
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <i className="fas fa-users text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-bold text-gray-800 ml-2">ActivityHub</h1>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex items-center relative flex-1 max-w-lg mx-4">
              <input 
                type="text" 
                placeholder="Search activities nearby..." 
                className="py-2 px-4 pl-10 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 text-gray-400"></i>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <button className="md:flex hidden items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100">
                <i className="fas fa-bell"></i>
              </button>
              <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100">
                <i className="fas fa-search"></i>
              </button>
              <div className="md:hidden relative">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center cursor-pointer">
                  <i className="fas fa-bell text-white text-sm"></i>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
                </div>
              </div>
              <div className="md:hidden" onClick={() => handleViewProfile(user?.id || 0)}>
                <img 
                  src={user?.avatarUrl || "https://via.placeholder.com/150"} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
              </div>
            </div>
          </div>
        </header>

        {/* Map View */}
        <div className="flex-1 overflow-hidden">
          <MapView 
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
