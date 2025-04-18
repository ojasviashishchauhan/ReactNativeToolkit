import { useState, useEffect, useRef } from "react";
import { ActivityWithHost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, Locate, Plus, MapPin, Wind, Utensils, MapIcon, Ruler } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Types
type MapViewProps = {
  userLocation: { lat: number; lng: number } | null;
  activities: ActivityWithHost[];
  onActivityClick: (activity: ActivityWithHost) => void;
  onCreateActivity: () => void;
};

type FilterType = "all" | "hiking" | "cycling" | "sports" | "food" | "arts" | "other";

// Component to handle map controls and events
function MapController({ 
  userLocation, 
  searchRadius, 
  onMapClick 
}: { 
  userLocation: { lat: number; lng: number } | null, 
  searchRadius: number,
  onMapClick: (latlng: L.LatLng) => void
}) {
  const map = useMap();
  
  // Set up map click event
  useMapEvents({
    click: (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng);
    }
  });
  
  // Center map on user location when it changes
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], map.getZoom());
    }
  }, [userLocation, map]);
  
  return null;
}

export function MapView({ 
  userLocation, 
  activities, 
  onActivityClick,
  onCreateActivity
}: MapViewProps) {
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchRadius, setSearchRadius] = useState<number>(10); // Default 10km radius
  const [showRadiusCircle, setShowRadiusCircle] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Default view if user location not available
  const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
  const mapCenter = userLocation || defaultLocation;
  
  // Create custom icon for user location
  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="relative">
        <div class="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-full absolute -top-6 -left-6"></div>
        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [6, 6],
    iconAnchor: [3, 3]
  });

  // Filter activities based on selected filter
  const filteredActivities = activeFilter === "all" 
    ? activities 
    : activities.filter(activity => activity.type === activeFilter);
    
  // Handle map click for location selection
  const handleMapClick = (latlng: L.LatLng) => {
    setSelectedLocation({
      lat: latlng.lat,
      lng: latlng.lng
    });
    
    toast({
      title: "Location selected",
      description: `Latitude: ${latlng.lat.toFixed(6)}, Longitude: ${latlng.lng.toFixed(6)}`,
      duration: 3000,
    });
  };

  // Map control component reference for zoom and pan functions
  const mapControllerRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    locateUser: () => void;
  }>({
    zoomIn: () => {},
    zoomOut: () => {},
    locateUser: () => {}
  });

  // MapControl - child component to access map instance
  const MapControl = () => {
    const map = useMap();
    
    // Set control functions
    useEffect(() => {
      if (map) {
        mapControllerRef.current = {
          zoomIn: () => map.setZoom(map.getZoom() + 1),
          zoomOut: () => map.setZoom(map.getZoom() - 1),
          locateUser: () => {
            if (userLocation) {
              map.setView([userLocation.lat, userLocation.lng], 15);
            }
          }
        };
      }
    }, [map, userLocation]);
    
    return null;
  };
  
  // Map zoom controls
  const handleZoomIn = () => {
    mapControllerRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    mapControllerRef.current.zoomOut();
  };

  const handleLocateUser = () => {
    mapControllerRef.current.locateUser();
  };

  // Filter handlers
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };
  
  // Toggle search radius visibility
  const toggleSearchRadius = () => {
    setShowRadiusCircle(!showRadiusCircle);
  };
  
  // Update search radius
  const handleRadiusChange = (value: number[]) => {
    setSearchRadius(value[0]);
  };

  // Create custom activity icon based on activity type
  const getActivityIcon = (activityType: string) => {
    // Determine icon color and type based on activity type
    let iconColor = 'bg-primary';
    let iconClass = 'fas fa-map-marker-alt';
    
    switch(activityType) {
      case 'hiking':
        iconClass = 'fas fa-hiking';
        break;
      case 'cycling':
        iconClass = 'fas fa-bicycle';
        iconColor = 'bg-green-500';
        break;
      case 'sports':
        iconClass = 'fas fa-volleyball-ball';
        iconColor = 'bg-purple-500';
        break;
      case 'food':
        iconClass = 'fas fa-utensils';
        iconColor = 'bg-orange-500';
        break;
      case 'arts':
        iconClass = 'fas fa-paint-brush';
        iconColor = 'bg-pink-500';
        break;
      default:
        iconClass = 'fas fa-map-marker-alt';
    }

    return L.divIcon({
      className: 'activity-marker',
      html: `<div class="w-10 h-10 ${iconColor} rounded-full flex items-center justify-center shadow-lg cursor-pointer">
              <i class="${iconClass} text-white"></i>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <MapContainer 
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={14} 
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        
        {/* Map Controller for events and controls */}
        <MapController 
          userLocation={userLocation} 
          searchRadius={searchRadius}
          onMapClick={handleMapClick}
        />
        
        {/* Map Controls for zoom/locate */}
        <MapControl />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          />
        )}
        
        {/* Search radius circle */}
        {userLocation && showRadiusCircle && (
          <Circle 
            center={[userLocation.lat, userLocation.lng]}
            radius={searchRadius * 1000}
            pathOptions={{
              color: '#4F46E5',
              fillColor: '#4F46E5',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        )}
        
        {/* Activity markers */}
        {filteredActivities.map(activity => (
          <Marker
            key={activity.id}
            position={[activity.latitude, activity.longitude]}
            icon={getActivityIcon(activity.type)}
            eventHandlers={{
              click: () => onActivityClick(activity)
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold">{activity.title}</h3>
                <p className="text-sm text-gray-600">
                  Hosted by {activity.host.username}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Selected location marker */}
        {selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              className: 'selected-location-marker',
              html: `<div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <i class="fas fa-map-pin text-white text-sm"></i>
                    </div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16]
            })}
          />
        )}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col space-y-2 z-[1000]">
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleZoomIn}
        >
          <PlusIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleZoomOut}
        >
          <MinusIcon className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-lg bg-white text-gray-700 hover:bg-gray-100 shadow-md"
          onClick={handleLocateUser}
        >
          <Locate className="h-5 w-5" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className={`h-10 w-10 rounded-lg ${showRadiusCircle ? 'bg-primary text-white' : 'bg-white text-gray-700'} hover:bg-gray-100 shadow-md`}
          onClick={toggleSearchRadius}
          title="Set search radius"
        >
          <Ruler className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Search Radius Control */}
      {showRadiusCircle && (
        <Card className="absolute left-4 bottom-16 p-4 shadow-lg w-64">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Search Radius</span>
              <Badge variant="outline">{searchRadius} km</Badge>
            </div>
            <Slider 
              defaultValue={[searchRadius]} 
              max={50} 
              min={1} 
              step={1} 
              onValueChange={handleRadiusChange}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1km</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Filters */}
      <div className="absolute left-4 top-4 right-16 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2">
          <FilterButton 
            label="All Activities" 
            icon="fas fa-filter" 
            type="all" 
            active={activeFilter === "all"} 
            onClick={() => handleFilterChange("all")} 
          />
          <FilterButton 
            label="Hiking" 
            icon="fas fa-hiking" 
            type="hiking" 
            active={activeFilter === "hiking"} 
            onClick={() => handleFilterChange("hiking")} 
          />
          <FilterButton 
            label="Cycling" 
            icon="fas fa-bicycle" 
            type="cycling" 
            active={activeFilter === "cycling"} 
            onClick={() => handleFilterChange("cycling")} 
          />
          <FilterButton 
            label="Sports" 
            icon="fas fa-volleyball-ball" 
            type="sports" 
            active={activeFilter === "sports"} 
            onClick={() => handleFilterChange("sports")} 
          />
          <FilterButton 
            label="Food & Drinks" 
            icon="fas fa-utensils" 
            type="food" 
            active={activeFilter === "food"} 
            onClick={() => handleFilterChange("food")} 
          />
          <FilterButton 
            label="Arts & Culture" 
            icon="fas fa-paint-brush" 
            type="arts" 
            active={activeFilter === "arts"} 
            onClick={() => handleFilterChange("arts")} 
          />
        </div>
      </div>

      {/* Create Activity Button */}
      <div className="absolute right-6 bottom-6 md:right-8 md:bottom-8">
        <Button
          size="lg"
          className="w-14 h-14 rounded-full shadow-lg"
          onClick={onCreateActivity}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

// Filter Button Component
function FilterButton({
  label,
  icon,
  type,
  active,
  onClick
}: {
  label: string;
  icon: string;
  type: FilterType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button 
      className={`
        px-4 py-2 rounded-full shadow-md text-sm font-medium flex items-center whitespace-nowrap
        ${active ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}
      `}
      onClick={onClick}
    >
      <i className={`${icon} ${active ? '' : 'text-gray-600'} mr-2`}></i>
      {label}
    </button>
  );
}
