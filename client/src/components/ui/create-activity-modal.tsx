import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertActivitySchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { X, MapPin, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Leaflet type declaration for window
declare global {
  interface Window { 
    L: any;
  }
}

type CreateActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
};

// Create activity schema with ZodResolver
const createActivitySchema = insertActivitySchema.omit({ 
  hostId: true,
});

export function CreateActivityModal({ isOpen, onClose, userLocation }: CreateActivityModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mapLocation, setMapLocation] = useState(userLocation);
  
  // Map reference
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // Create form with extended schema to handle string dates
  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
  const defaultTime = "12:00"; // Default time
  
  // Extended schema with string dateTime handling
  const formSchema = createActivitySchema.extend({
    // Override dateTime to allow string input
    dateTime: z.string(),
    // Add time field
    time: z.string().default(defaultTime),
  });
  
  type FormValues = z.infer<typeof formSchema>;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      latitude: userLocation?.lat || 0,
      longitude: userLocation?.lng || 0,
      exactLatitude: userLocation?.lat || 0,
      exactLongitude: userLocation?.lng || 0,
      address: "",
      dateTime: formattedDate,
      time: defaultTime,
      capacity: 5,
    },
  });

  // Effect to initialize map when modal opens
  useEffect(() => {
    // Cleanup function to handle map destruction
    let mapToDestroy: any = null;
    
    const initMap = () => {
      if (!isOpen || !userLocation) return;
      
      // Wait for DOM to be ready
      setTimeout(() => {
        // Check if map is already initialized
        if (mapInstance) {
          mapInstance.invalidateSize();
          return;
        }
        
        // Check if Leaflet is loaded
        if (!window.L) {
          console.log("Leaflet is not loaded yet");
          return;
        }
        
        const L = window.L;
        
        // Get map container
        const mapContainer = document.getElementById('location-picker-map');
        
        if (!mapContainer) {
          console.log("Map container not found");
          return;
        }
        
        // Create map instance
        const map = L.map(mapContainer, {
          zoomControl: false,
          attributionControl: false
        }).setView([userLocation.lat, userLocation.lng], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Add zoom control in a better position
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
        
        // Add marker for selected location
        const marker = L.marker([userLocation.lat, userLocation.lng], {
          draggable: true
        }).addTo(map);
        
        // Update form when marker is dragged
        marker.on('dragend', function() {
          const position = marker.getLatLng();
          setMapLocation({
            lat: position.lat,
            lng: position.lng
          });
          form.setValue("latitude", position.lat);
          form.setValue("longitude", position.lng);
          form.setValue("exactLatitude", position.lat);
          form.setValue("exactLongitude", position.lng);
        });
        
        // Allow clicking on map to move marker
        map.on('click', function(e: any) {
          marker.setLatLng(e.latlng);
          setMapLocation({
            lat: e.latlng.lat,
            lng: e.latlng.lng
          });
          form.setValue("latitude", e.latlng.lat);
          form.setValue("longitude", e.latlng.lng);
          form.setValue("exactLatitude", e.latlng.lat);
          form.setValue("exactLongitude", e.latlng.lng);
        });
        
        // Force a recalculation of the map's size
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
        
        setMapInstance(map);
        mapToDestroy = map;
      }, 100);
    };
    
    // Initialize map when modal opens
    if (isOpen) {
      initMap();
    }
    
    // Cleanup function
    return () => {
      if (mapToDestroy) {
        mapToDestroy.remove();
        setMapInstance(null);
      }
    };
  }, [isOpen, userLocation, form, mapInstance]);

  // Create activity mutation
  const createActivityMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Get the date and time from the form
      const dateStr = values.dateTime;
      const timeStr = values.time;
      
      // Combine date and time into an ISO string
      const combinedDateTimeStr = `${dateStr}T${timeStr}:00.000Z`;
      
      // Create a Date object from the ISO string
      const dateTimeObject = new Date(combinedDateTimeStr);
      
      // Create the activity data object with proper typing
      const activityData = {
        title: values.title,
        description: values.description,
        type: values.type,
        latitude: values.latitude,
        longitude: values.longitude,
        exactLatitude: values.exactLatitude,
        exactLongitude: values.exactLongitude,
        address: values.address,
        capacity: values.capacity,
        dateTime: dateTimeObject,
        hostId: user?.id || 0,
      };
      
      const res = await apiRequest("POST", "/api/activities", activityData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity Created",
        description: "Your activity has been created successfully",
      });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Activity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createActivityMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Activity</DialogTitle>
          <DialogDescription>
            Fill out the details to create a new activity for others to join
          </DialogDescription>
          <button 
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700" 
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your activity a catchy title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hiking">Hiking</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="food">Food & Drinks</SelectItem>
                      <SelectItem value="arts">Arts & Culture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell people what your activity is about..." 
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Participants</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="50" 
                      placeholder="How many people can join?" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Street address or landmark (this will be visible to all)" 
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="relative">
              <FormLabel>Location</FormLabel>
              <div className="h-40 overflow-hidden rounded-lg mb-2">
                <div 
                  id="location-picker-map"
                  className="h-40 bg-blue-100 rounded-lg relative"
                  style={{ width: '100%' }}
                >
                  {!mapInstance && (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <MapPin className="h-6 w-6 mx-auto mb-2" />
                        <span>Map Location Picker</span><br/>
                        <span className="text-xs">(Click to select location)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <span className="flex items-center">
                  <Lock className="h-4 w-4 mr-1" /> 
                  Exact location will be shared only with approved participants
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createActivityMutation.isPending}
              >
                {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
