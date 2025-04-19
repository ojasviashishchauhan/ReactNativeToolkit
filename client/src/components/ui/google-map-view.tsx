import { useState, useEffect, useRef, useCallback } from "react";
import { ActivityWithHost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, Locate, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

// Types
type MapViewProps = {
  userLocation: { lat: number; lng: number } | null;
  activities: ActivityWithHost[];
  onActivityClick: (activity: ActivityWithHost) => void;
  onCreateActivity: () => void;
};

type FilterType = "all" | "hiking" | "cycling" | "sports" | "food" | "arts" | "other";

// Styling for the Google Map
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Activity marker icons
const getActivityIconUrl = (type: string) => {
  switch(type) {
    case 'hiking':
      return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    case 'cycling':
      return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    case 'sports':
      return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
    case 'food':
      return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
    case 'arts':
      return 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png';
    default:
      return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
  }
};

// Activity type to color mapping for filter buttons
const activityTypeColors = {
  all: 'bg-gray-700',
  hiking: 'bg-green-600',
  cycling: 'bg-blue-600',
  sports: 'bg-purple-600',
  food: 'bg-orange-600',
  arts: 'bg-pink-600',
  other: 'bg-gray-600'
};

function FilterButton({ 
  label, 
  type, 
  active, 
  onClick 
}: { 
  label: string; 
  icon?: string; 
  type: FilterType; 
  active: boolean; 
  onClick: () => void 
}) {
  const bgColor = active ? activityTypeColors[type] : 'bg-white';
  const textColor = active ? 'text-white' : 'text-gray-700';
  
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={`${bgColor} ${textColor} px-3 py-1 rounded-full shadow-sm hover:opacity-90 transition-all`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

export function GoogleMapView({ 
  userLocation, 
  activities, 
  onActivityClick,
  onCreateActivity
}: MapViewProps) {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedActivity, setSelectedActivity] = useState<ActivityWithHost | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Save and retrieve the last location from localStorage
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const savedLocation = localStorage.getItem('lastMapLocation');
    return savedLocation ? JSON.parse(savedLocation) : null;
  });

  // Default view if user location not available
  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
  const mapCenter = userLocation || lastLocation || defaultLocation;
  
  // Always try to use the user's location when first loading
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.panTo(userLocation);
    }
  }, [userLocation, mapRef.current]);

  // Access the Google Maps API key from environment secrets
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    id: 'google-map-script'
  });

  // Filter activities based on selected filter
  const filteredActivities = activeFilter === "all" 
    ? activities 
    : activities.filter(activity => activity.type === activeFilter);

  // Store map reference when it loads
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    
    // Add listener for idle event to save location after movement
    map.addListener('idle', () => {
      const center = map.getCenter();
      if (center) {
        const newLocation = { lat: center.lat(), lng: center.lng() };
        setLastLocation(newLocation);
        localStorage.setItem('lastMapLocation', JSON.stringify(newLocation));
      }
    });
  }, []);

  // Cleanup function when component unmounts
  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMap(null);
  }, []);

  // Handle map click for location selection
  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      
      setSelectedLocation({ lat, lng });
      
      toast({
        title: "Location selected",
        description: `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`,
        duration: 3000,
      });
    }
  }, [toast]);

  // Map control functions
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 14) + 1);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom((mapRef.current.getZoom() || 14) - 1);
    }
  }, []);

  const handleLocateUser = useCallback(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);
      mapRef.current.setZoom(15);
    }
  }, [userLocation]);

  // Filter handlers
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };
  
  // Handle activity marker click
  const handleActivityMarkerClick = (activity: ActivityWithHost) => {
    setSelectedActivity(activity);
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setSelectedActivity(null);
  };

  // Show error if there's no API key
  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <div className="text-center p-4">
          <h3 className="text-lg font-bold text-red-600">Google Maps API Key Missing</h3>
          <p className="text-gray-600 mt-2 mb-4">
            Please provide a valid Google Maps API key in your environment variables.
          </p>
          <div className="text-sm text-gray-500 p-2 bg-gray-100 rounded border border-gray-300 mt-2 text-left">
            <p className="font-mono">VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if map fails to load
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-bold text-red-600">Error loading map</h3>
          <p className="text-gray-600">Please check your Google Maps API key or try again later</p>
        </div>
      </div>
    );
  }

  // Show loading state while map loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <div className="text-center">
          <h3 className="text-lg font-bold">Loading map...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={14}
        onClick={handleMapClick}
        onLoad={onMapLoad}
        onUnmount={onUnmount}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
        
        {/* Activity markers */}
        {filteredActivities.map(activity => (
          <Marker
            key={activity.id}
            position={{ lat: activity.latitude, lng: activity.longitude }}
            icon={{
              url: getActivityIconUrl(activity.type),
              scaledSize: new window.google.maps.Size(32, 32),
            }}
            onClick={() => handleActivityMarkerClick(activity)}
          />
        ))}
        
        {/* Activity info window */}
        {selectedActivity && (
          <InfoWindow
            position={{ lat: selectedActivity.latitude, lng: selectedActivity.longitude }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 max-w-[200px]">
              <h3 className="font-bold text-sm">{selectedActivity.title}</h3>
              <p className="text-xs text-gray-600 mb-1">
                Hosted by {selectedActivity.host.username}
              </p>
              <Button 
                size="sm" 
                className="w-full mt-1 text-xs"
                onClick={() => onActivityClick(selectedActivity)}
              >
                View Details
              </Button>
            </div>
          </InfoWindow>
        )}
        
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            position={selectedLocation}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        )}
      </GoogleMap>

      {/* Map Controls - moved to bottom left */}
      <div className="absolute left-4 bottom-20 flex space-x-2 z-[1000]">
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleZoomIn}
        >
          <PlusIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleZoomOut}
        >
          <MinusIcon className="h-6 w-6" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-12 w-12 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleLocateUser}
        >
          <Locate className="h-6 w-6" />
        </Button>
      </div>

      {/* Activity Filters */}
      <div className="absolute left-4 top-4 right-16 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2">
          <FilterButton 
            label="All Activities" 
            type="all" 
            active={activeFilter === "all"} 
            onClick={() => handleFilterChange("all")} 
          />
          <FilterButton 
            label="Hiking" 
            type="hiking" 
            active={activeFilter === "hiking"} 
            onClick={() => handleFilterChange("hiking")} 
          />
          <FilterButton 
            label="Cycling" 
            type="cycling" 
            active={activeFilter === "cycling"} 
            onClick={() => handleFilterChange("cycling")} 
          />
          <FilterButton 
            label="Sports" 
            type="sports" 
            active={activeFilter === "sports"} 
            onClick={() => handleFilterChange("sports")} 
          />
          <FilterButton 
            label="Food" 
            type="food" 
            active={activeFilter === "food"} 
            onClick={() => handleFilterChange("food")} 
          />
          <FilterButton 
            label="Arts" 
            type="arts" 
            active={activeFilter === "arts"} 
            onClick={() => handleFilterChange("arts")} 
          />
          <FilterButton 
            label="Other" 
            type="other" 
            active={activeFilter === "other"} 
            onClick={() => handleFilterChange("other")} 
          />
        </div>
      </div>

      {/* Create Activity Button */}
      <Button
        className="absolute bottom-4 right-4 shadow-lg rounded-full"
        size="lg"
        onClick={onCreateActivity}
      >
        <PlusIcon className="h-5 w-5 mr-1" />
        Create Activity
      </Button>
    </div>
  );
}