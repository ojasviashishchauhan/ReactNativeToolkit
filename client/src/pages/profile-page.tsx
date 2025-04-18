import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/ui/sidebar";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { UserProfile, ActivityWithHost, Review } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Camera, 
  Star, 
  Calendar, 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Shield,
  Clock,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [age, setAge] = useState<number | undefined>(undefined);
  const [sex, setSex] = useState<string>("");

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
      setAge(profile.age);
      setSex(profile.sex || "");
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      bio,
      avatarUrl,
      age,
      sex,
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
              <div className="grid grid-cols-4 gap-4 mb-6 max-w-3xl mx-auto">
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
                <div className="bg-white rounded-lg p-3 text-center shadow">
                  <div className="text-xl font-bold text-green-500">
                    {profile.activitiesHosted > 5 ? 'Verified' : 'Basic'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            )}

            {/* Tabbed Content */}
            <div className="max-w-3xl mx-auto mb-6">
              <Tabs defaultValue="activities" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activities">Activities</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  <TabsTrigger value="badges">Badges</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                {/* Activities Tab */}
                <TabsContent value="activities" className="pt-4">
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
                </TabsContent>
                
                {/* Reviews Tab */}
                <TabsContent value="reviews" className="pt-4">
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
                            src={"https://via.placeholder.com/50"} 
                            alt={`User ${review.reviewerId}`} 
                            className="w-10 h-10 rounded-full mr-3 object-cover" 
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-800">
                                {`User ${review.reviewerId}` || "Anonymous"}
                              </h4>
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
                </TabsContent>
                
                {/* Badges Tab */}
                <TabsContent value="badges" className="pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Achievements & Badges</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-100">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Verified User</h4>
                      <p className="text-xs text-gray-500">Complete account verification</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-100">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Social Butterfly</h4>
                      <p className="text-xs text-gray-500">Join 5+ activities</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-100">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Award className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Super Host</h4>
                      <p className="text-xs text-gray-500">Host 3+ successful activities</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-100 opacity-50">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Top Rated</h4>
                      <p className="text-xs text-gray-500">Receive 5+ five-star reviews</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 text-center shadow border border-gray-100 opacity-50">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="h-8 w-8 text-red-600" />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">Early Bird</h4>
                      <p className="text-xs text-gray-500">Member for 1+ year</p>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Settings Tab */}
                <TabsContent value="settings" className="pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Account Settings</h3>
                  
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <h4 className="font-medium text-gray-800 mb-3">Social Media Links</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Facebook className="h-5 w-5 text-blue-600" />
                        <Input placeholder="Facebook username" className="flex-1" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Twitter className="h-5 w-5 text-blue-400" />
                        <Input placeholder="Twitter/X username" className="flex-1" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Instagram className="h-5 w-5 text-pink-600" />
                        <Input placeholder="Instagram username" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <Input value={user.email} disabled className="flex-1 bg-gray-50" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <Input placeholder="Add phone number (optional)" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow p-4 mb-4">
                    <h4 className="font-medium text-gray-800 mb-3">Notifications</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="activity-requests" className="font-medium">Activity Requests</Label>
                          <p className="text-sm text-gray-500">Receive notifications for new activity requests</p>
                        </div>
                        <Switch id="activity-requests" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="new-messages" className="font-medium">New Messages</Label>
                          <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                        </div>
                        <Switch id="new-messages" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifs" className="font-medium">Email Notifications</Label>
                          <p className="text-sm text-gray-500">Receive important updates via email</p>
                        </div>
                        <Switch id="email-notifs" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}
