import { useState, useEffect, useRef } from "react";
import { ActivityWithHost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon, MinusIcon, Locate, Plus, MapPin, Wind, Utensils, MapIcon, Ruler } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Types
type MapViewProps = {
  userLocation: { lat: number; lng: number } | null;
  activities: ActivityWithHost[];
  onActivityClick: (activity: ActivityWithHost) => void;
  onCreateActivity: () => void;
};

type FilterType = "all" | "hiking" | "cycling" | "sports" | "food" | "arts" | "other";

export function MapView({ 
  userLocation, 
  activities, 
  onActivityClick,
  onCreateActivity
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [searchRadius, setSearchRadius] = useState<number>(10); // Default 10km radius
  const [showRadiusCircle, setShowRadiusCircle] = useState<boolean>(false);
  const [radiusCircle, setRadiusCircle] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    // Load leaflet script dynamically
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.async = true;
    document.body.appendChild(leafletScript);

    // Load leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    leafletCSS.rel = 'stylesheet';
    document.head.appendChild(leafletCSS);

    leafletScript.onload = () => {
      // Default view if user location not available
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
      const initialLocation = userLocation || defaultLocation;
      
      // Create map instance
      const L = window.L;
      const mapInstance = L.map(mapRef.current).setView(
        [initialLocation.lat, initialLocation.lng], 
        14
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Save map instance
      setMap(mapInstance);
    };

    return () => {
      // Cleanup
      document.body.removeChild(leafletScript);
      document.head.removeChild(leafletCSS);
    };
  }, [mapRef, map, userLocation]);

  // Update map when user location changes
  useEffect(() => {
    if (!map || !userLocation) return;

    // Center map on user location
    map.setView([userLocation.lat, userLocation.lng], map.getZoom());

    // Add user location marker
    const L = window.L;
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

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

    // Always show search radius circle
    // Remove existing circle if any
    if (radiusCircle) {
      map.removeLayer(radiusCircle);
    }
    
    // Create new circle
    const circle = L.circle([userLocation.lat, userLocation.lng], {
      radius: searchRadius * 1000, // Convert km to meters
      color: '#4F46E5',
      fillColor: '#4F46E5',
      fillOpacity: 0.1,
      weight: 2
    }).addTo(map);
    
    setRadiusCircle(circle);
    
    // Set showRadiusCircle to true to always display the control
    setShowRadiusCircle(true);

    return () => {
      map.removeLayer(userMarker);
      if (radiusCircle) {
        map.removeLayer(radiusCircle);
      }
    };
  }, [map, userLocation, searchRadius]);

  // Update activity markers when activities change
  useEffect(() => {
    if (!map || !activities) return;

    // Remove existing markers
    markers.forEach(marker => map.removeLayer(marker));

    // Filter activities
    const filteredActivities = activeFilter === "all" 
      ? activities 
      : activities.filter(activity => activity.type === activeFilter);

    // Create markers for activities
    const L = window.L;
    const newMarkers = filteredActivities.map(activity => {
      // Determine icon color and type based on activity type
      let iconColor = 'bg-primary';
      let iconClass = 'fas fa-map-marker-alt';
      
      switch(activity.type) {
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

      // Create custom icon
      const activityIcon = L.divIcon({
        className: 'activity-marker',
        html: `<div class="w-10 h-10 ${iconColor} rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                <i class="${iconClass} text-white"></i>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      // Create marker
      const marker = L.marker([activity.latitude, activity.longitude], { icon: activityIcon })
        .addTo(map)
        .on('click', () => onActivityClick(activity));

      return marker;
    });

    setMarkers(newMarkers);

    return () => {
      newMarkers.forEach(marker => map.removeLayer(marker));
    };
  }, [map, activities, activeFilter, onActivityClick]);

  // Map zoom controls
  const handleZoomIn = () => {
    if (map) map.setZoom(map.getZoom() + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom(map.getZoom() - 1);
  };

  const handleLocateUser = () => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
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

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full bg-blue-100"
      >
        {/* Placeholder content that will be replaced by the map */}
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <p className="text-center">
              <i className="fas fa-map-marked-alt text-4xl mb-2"></i><br/>
              Loading Map...<br/>
            </p>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col space-y-2">
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
