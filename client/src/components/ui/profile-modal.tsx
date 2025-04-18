import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserProfile, ActivityWithHost, Review } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MapPin, Users, X, Camera, Edit, User } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
};

export function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("activities");
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Check if viewing own profile
  const isOwnProfile = user?.id === userId;

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users", userId, "profile"],
    enabled: isOpen,
  });

  // Fetch user's activities
  const { data: activities } = useQuery<ActivityWithHost[]>({
    queryKey: ["/api/users", userId, "activities"],
    enabled: isOpen && activeTab === "activities",
  });

  // Fetch user's reviews
  const { data: reviews } = useQuery<Review[]>({
    queryKey: ["/api/users", userId, "reviews"],
    enabled: isOpen && activeTab === "reviews",
  });

  // Initialize edit form when profile loads
  useState(() => {
    if (profile) {
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio?: string; avatarUrl?: string }) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      bio,
      avatarUrl,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto">
          {profileLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : profile ? (
            <>
              {/* Cover Image and Profile Picture */}
              <div className="relative">
                <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl"></div>
                
                {/* Close Button */}
                <button 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
                
                {/* Profile Picture */}
                <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                  <div className="relative">
                    <img 
                      src={profile.avatarUrl || "https://via.placeholder.com/150"} 
                      alt={profile.username} 
                      className="w-32 h-32 rounded-full border-4 border-white object-cover" 
                    />
                    {isEditing && isOwnProfile && (
                      <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer">
                        <Camera className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-20 px-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{profile.username}</h2>
                  <div className="flex items-center justify-center mt-1">
                    <div className="flex items-center">
                      <Star className="text-yellow-500 h-4 w-4" />
                      <span className="ml-1 font-medium">{profile.rating?.toFixed(1) || "-"}</span>
                    </div>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-gray-600">{profile.reviewCount} reviews</span>
                  </div>
                  
                  {isEditing && isOwnProfile ? (
                    <div className="mt-4">
                      <Input
                        className="mb-3"
                        placeholder="Avatar URL (optional)"
                        value={avatarUrl || ""}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                      />
                      <Textarea
                        placeholder="Tell us about yourself..."
                        value={bio || ""}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="mb-3"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 mt-3">
                      {profile.bio || "No bio provided yet"}
                    </p>
                  )}
                </div>

                {isOwnProfile && !isEditing && (
                  <div className="mb-6 flex justify-center">
                    <Button 
                      variant="outline" 
                      className="flex items-center"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-primary">{profile.activitiesHosted}</div>
                    <div className="text-sm text-gray-600">Hosted</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-primary">{profile.activitiesJoined}</div>
                    <div className="text-sm text-gray-600">Joined</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xl font-bold text-primary">{profile.reviewCount}</div>
                    <div className="text-sm text-gray-600">Reviews</div>
                  </div>
                </div>

                {/* Tabs for Activities and Reviews */}
                <Tabs defaultValue="activities" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="activities">Activities</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="activities" className="space-y-4">
                    {activities && activities.length > 0 ? (
                      activities.map((activity) => (
                        <div key={activity.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium text-gray-800">{activity.title}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-primary mr-1" />
                                  <span>{format(new Date(activity.dateTime), "MMM d, yyyy, h:mm a")}</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-primary mr-1" />
                                  <span>{activity.address || "Location hidden until approved"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <Badge className={activity.hostId === profile.id ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}>
                                {activity.hostId === profile.id ? "Hosting" : "Joining"}
                              </Badge>
                              <div className="mt-2 flex items-center">
                                <Users className="h-4 w-4 text-gray-500 mr-1" />
                                <span className="text-xs text-gray-500">{activity.participantCount} / {activity.capacity}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <User className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p>No activities yet</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="space-y-4">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                          <div className="flex items-start">
                            <img 
                              src={review.reviewer?.avatarUrl || "https://via.placeholder.com/50"} 
                              alt="Reviewer" 
                              className="w-10 h-10 rounded-full mr-3 object-cover" 
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium text-gray-800">{review.reviewer?.username || "Anonymous"}</h4>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mb-1">
                                {format(new Date(review.createdAt), "MMMM d, yyyy")}
                              </div>
                              <p className="text-gray-700 text-sm">
                                {review.comment || "No comment provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Star className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p>No reviews yet</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500">User not found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
