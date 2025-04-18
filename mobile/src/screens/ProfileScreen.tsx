import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types';
import authService from '../api/auth';
import usersService from '../api/users';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const route = useRoute<ProfileScreenRouteProp>();
  const { colors, isDark } = useTheme();
  
  // If userId is provided in the route, we're viewing someone else's profile
  const userId = route.params?.userId;
  const isOwnProfile = !userId;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [hostedActivities, setHostedActivities] = useState<any[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<any[]>([]);
  const [showHostedActivities, setShowHostedActivities] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      // Fetch profile data based on whether we're viewing own profile or another user's
      const userIdToFetch = isOwnProfile ? undefined : userId;
      const userData = isOwnProfile 
        ? await authService.getCurrentUser()
        : await usersService.getUserProfile(userIdToFetch!);
      
      setProfileData(userData);
      
      // Fetch user activities
      if (userData) {
        const fetchedActivities = await usersService.getUserActivities(userData.id);
        if (fetchedActivities && Array.isArray(fetchedActivities)) {
          // Split into hosted and joined activities
          setHostedActivities(fetchedActivities.filter(act => act.isHost));
          setJoinedActivities(fetchedActivities.filter(act => !act.isHost));
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchProfileData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              // The App component will handle the authentication state change
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    if (!isOwnProfile) return;
    
    // Request permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload your profile picture.');
      return;
    }
    
    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    setIsUploadingImage(true);
    
    try {
      // Create form data for image upload
      const formData = new FormData();
      formData.append('profilePicture', {
        uri,
        name: 'profile-picture.jpg',
        type: 'image/jpeg',
      } as any);
      
      // Upload image
      const response = await usersService.uploadProfilePicture(formData);
      
      // Update profile data with new avatar URL
      if (response && response.avatarUrl) {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: response.avatarUrl,
        }));
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const renderActivityItem = (activity: any) => (
    <TouchableOpacity
      key={activity.id}
      style={[styles.activityItem, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
    >
      <View style={styles.activityHeader}>
        <View style={[styles.activityTypeTag, { backgroundColor: getActivityTypeColor(activity.type) }]}>
          <Text style={styles.activityTypeText}>{activity.type}</Text>
        </View>
        <Text style={[styles.activityDate, { color: colors.inactive }]}>
          {formatDate(new Date(activity.date))}
        </Text>
      </View>
      
      <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>
        {activity.title}
      </Text>
      
      <View style={styles.activityLocation}>
        <Ionicons name="location-outline" size={14} color={colors.inactive} />
        <Text style={[styles.activityLocationText, { color: colors.inactive }]} numberOfLines={1}>
          {activity.location}
        </Text>
      </View>
      
      <View style={styles.activityParticipants}>
        <Ionicons name="people-outline" size={14} color={colors.inactive} />
        <Text style={[styles.activityParticipantsText, { color: colors.inactive }]}>
          {activity.participants}/{activity.capacity} participants
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getActivityTypeColor = (type: string) => {
    const colors: {[key: string]: string} = {
      Sports: '#4CAF50',
      Arts: '#9C27B0',
      Social: '#2196F3',
      Education: '#FF9800',
      Food: '#F44336',
      Music: '#E91E63',
      Technology: '#00BCD4',
      Outdoors: '#8BC34A',
    };
    
    return colors[type] || '#757575';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>
            Could not load profile
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchProfileData}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onPress={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            onPress={isOwnProfile ? handlePickImage : undefined}
            disabled={isUploadingImage}
          >
            {isUploadingImage ? (
              <View style={[styles.profileImage, styles.uploading, { backgroundColor: colors.card }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : profileData.avatarUrl ? (
              <Image
                source={{ uri: profileData.avatarUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: colors.card }]}>
                <Ionicons name="person" size={60} color={colors.inactive} />
              </View>
            )}
            {isOwnProfile && (
              <View style={[styles.editImageButton, { backgroundColor: colors.primary }]}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.username, { color: colors.text }]}>
            {profileData.username}
          </Text>
          
          {profileData.bio && (
            <Text style={[styles.bio, { color: colors.inactive }]}>
              {profileData.bio}
            </Text>
          )}
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profileData.hostedActivitiesCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.inactive }]}>Hosted</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {profileData.participatedActivitiesCount || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.inactive }]}>Joined</Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {profileData.rating ? profileData.rating.toFixed(1) : '0.0'}
                </Text>
                <Ionicons name="star" size={16} color="#FFD700" />
              </View>
              <TouchableOpacity 
                onPress={() => navigation.navigate('UserReviews', { userId: profileData.id })}
              >
                <Text style={[styles.statLabel, { color: colors.primary }]}>
                  {profileData.reviewCount || 0} Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {isOwnProfile && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateActivity')}
              >
                <Ionicons name="add-circle-outline" size={18} color="white" />
                <Text style={styles.primaryButtonText}>Create Activity</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.error} />
                <Text style={[styles.secondaryButtonText, { color: colors.error }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.activitiesSection}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                showHostedActivities && styles.activeTab,
                showHostedActivities && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setShowHostedActivities(true)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: showHostedActivities ? colors.primary : colors.inactive }
                ]}
              >
                Hosted Activities
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                !showHostedActivities && styles.activeTab,
                !showHostedActivities && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setShowHostedActivities(false)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: !showHostedActivities ? colors.primary : colors.inactive }
                ]}
              >
                Joined Activities
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.activitiesList}>
            {showHostedActivities ? (
              hostedActivities.length > 0 ? (
                hostedActivities.map(renderActivityItem)
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="calendar-outline" size={48} color={colors.inactive} />
                  <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                    No hosted activities
                  </Text>
                  <Text style={[styles.emptyStateMessage, { color: colors.inactive }]}>
                    {isOwnProfile 
                      ? 'Create an activity to share your interests with others'
                      : 'This user hasn\'t hosted any activities yet'}
                  </Text>
                  {isOwnProfile && (
                    <TouchableOpacity
                      style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                      onPress={() => navigation.navigate('CreateActivity')}
                    >
                      <Text style={styles.emptyStateButtonText}>Create Activity</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            ) : (
              joinedActivities.length > 0 ? (
                joinedActivities.map(renderActivityItem)
              ) : (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="people-outline" size={48} color={colors.inactive} />
                  <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                    No joined activities
                  </Text>
                  <Text style={[styles.emptyStateMessage, { color: colors.inactive }]}>
                    {isOwnProfile 
                      ? 'Join activities to connect with others'
                      : 'This user hasn\'t joined any activities yet'}
                  </Text>
                  {isOwnProfile && (
                    <TouchableOpacity
                      style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                      onPress={() => navigation.navigate('Map')}
                    >
                      <Text style={styles.emptyStateButtonText}>Explore Activities</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploading: {
    opacity: 0.7,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android elevation
    elevation: 5,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android elevation
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginLeft: 8,
  },
  secondaryButtonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  activitiesSection: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 16,
  },
  activitiesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  activityItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android elevation
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTypeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityTypeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  activityDate: {
    fontSize: 14,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityLocationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  activityParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityParticipantsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileScreen;