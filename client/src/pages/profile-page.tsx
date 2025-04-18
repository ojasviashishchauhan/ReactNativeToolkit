import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { UserProfile, ActivityWithHost, Review } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Star, Calendar, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/users", user?.id, "profile"],
    enabled: !!user,
  });

  // Fetch user's upcoming activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<{
    hosting: ActivityWithHost[];
    participating: ActivityWithHost[];
  }>({
    queryKey: ["/api/users/activities"],
    enabled: !!user,
  });

  // Fetch user's reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: ["/api/users", user?.id, "reviews"],
    enabled: !!user,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio?: string; avatarUrl?: string }) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "profile"] });
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

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      bio,
      avatarUrl,
    });
  };

  if (!user || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingActivities = [
    ...(activities?.hosting || []),
    ...(activities?.participating || []),
  ].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">My Profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Profile Header */}
            <div className="relative mb-6">
              {/* Cover Image */}
              <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"></div>
              
              {/* Profile Picture */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
                <div className="relative">
                  <img 
                    src={avatarUrl || "https://via.placeholder.com/150"} 
                    alt={user.username} 
                    className="w-32 h-32 rounded-full border-4 border-white object-cover" 
                  />
                  {isEditing && (
                    <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer">
                      <Camera size={16} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-20 text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
              {profile && (
                <div className="flex items-center justify-center mt-1">
                  <div className="flex items-center">
                    <Star className="text-yellow-500 h-4 w-4" />
                    <span className="ml-1 font-medium">{profile.rating?.toFixed(1) || "-"}</span>
                  </div>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">{profile.reviewCount} reviews</span>
                </div>
              )}

              {isEditing ? (
                <div className="mt-4 max-w-lg mx-auto">
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
                    <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-3 max-w-lg mx-auto">
                  {bio || "No bio provided yet"}
                </p>
              )}
            </div>

            {!isEditing && (
              <div className="mb-6 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </div>
            )}

            {/* Stats */}
            {profile && (
              <div className="grid grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-xl font-bold text-primary">{profile.activitiesHosted}</div>
                  <div className="text-sm text-gray-600">Hosted</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-xl font-bold text-primary">{profile.activitiesJoined}</div>
                  <div className="text-sm text-gray-600">Joined</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-xl font-bold text-primary">{profile.reviewCount}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            )}

            {/* Upcoming Activities */}
            <div className="mb-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Upcoming Activities</h3>
              {activitiesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-lg shadow p-4 mb-3 border border-gray-100">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">{activity.title}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-primary mr-1" />
                            <span>
                              {new Date(activity.dateTime).toLocaleDateString()} at{" "}
                              {new Date(activity.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
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
                        <span className={`
                          px-2 py-0.5 rounded text-xs font-medium
                          ${activity.hostId === user.id 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-blue-100 text-blue-800"}
                        `}>
                          {activity.hostId === user.id ? "Hosting" : "Joining"}
                        </span>
                        <div className="mt-2 flex">
                          <div className="flex">
                            <span className="text-xs text-gray-500 ml-1 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {activity.participantCount} / {activity.capacity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  <p>You don't have any upcoming activities</p>
                  <Button variant="link" className="mt-2">Find activities to join</Button>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Reviews</h3>
              </div>

              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-lg shadow p-4 mb-3 border border-gray-100">
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
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-gray-700 text-sm">
                          {review.comment || "No comment provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg p-6 text-center text-gray-500">
                  <p>No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}
