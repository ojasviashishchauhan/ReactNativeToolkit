import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

// Sample user data - would come from API
const USER = {
  id: 1,
  username: 'johndoe',
  email: 'john.doe@example.com',
  bio: 'Hiking enthusiast and adventure seeker. Always looking for new experiences and activities to join!',
  avatarUrl: 'https://via.placeholder.com/150',
  age: 28,
  sex: 'male',
  rating: 4.7,
  reviewCount: 15,
  activitiesHosted: 8,
  activitiesJoined: 23,
  interestTags: ['Sports', 'Outdoors', 'Education', 'Technology'],
  createdAt: new Date(2023, 5, 15)
};

// Sample activities data
const ACTIVITIES = [
  {
    id: 1,
    title: 'Morning Yoga in the Park',
    type: 'Sports',
    date: new Date(Date.now() + 86400000), // tomorrow
    location: 'Central Park',
    participants: 4,
    capacity: 10,
    isHosting: true
  },
  {
    id: 3,
    title: 'Board Games Night',
    type: 'Social',
    date: new Date(Date.now() + 259200000), // 3 days from now
    location: 'The Game Café',
    participants: 12,
    capacity: 20,
    isHosting: false
  },
];

// Sample reviews data
const REVIEWS = [
  {
    id: 1,
    reviewer: {
      id: 5,
      username: 'janedoe',
      avatarUrl: 'https://via.placeholder.com/50'
    },
    rating: 5,
    comment: 'Great person to have at an event! Very friendly and engaged with everyone.',
    createdAt: new Date(2023, 10, 5)
  },
  {
    id: 2,
    reviewer: {
      id: 8,
      username: 'mikesmith',
      avatarUrl: 'https://via.placeholder.com/50'
    },
    rating: 4,
    comment: 'Showed up on time and was very helpful during the activity.',
    createdAt: new Date(2023, 9, 22)
  },
];

// Helper to format dates
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper for activity card tag colors
const getTagColor = (type) => {
  const colors = {
    'Sports': '#4A90E2',
    'Arts': '#50C878',
    'Social': '#9370DB',
    'Education': '#20B2AA',
    'Food': '#FFA500',
    'Music': '#FF6347',
    'Technology': '#8A2BE2',
    'Outdoors': '#228B22'
  };
  return colors[type] || '#888';
};

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('activities');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: '',
    age: '',
    sex: '',
    interestTags: []
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    darkMode: isDark,
    notifications: true,
    locationSharing: true,
    privacyMode: false
  });
  
  // Load user data
  useEffect(() => {
    // This would be a real API call in production
    setTimeout(() => {
      setUser(USER);
      setFormData({
        username: USER.username,
        bio: USER.bio || '',
        avatarUrl: USER.avatarUrl || '',
        age: USER.age ? USER.age.toString() : '',
        sex: USER.sex || '',
        interestTags: USER.interestTags || []
      });
      setActivities(ACTIVITIES);
      setReviews(REVIEWS);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data
    setFormData({
      username: user.username,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      age: user.age ? user.age.toString() : '',
      sex: user.sex || '',
      interestTags: user.interestTags || []
    });
  };
  
  const handleSaveProfile = () => {
    setLoading(true);
    
    // This would be a real API call in production
    setTimeout(() => {
      const updatedUser = {
        ...user,
        username: formData.username,
        bio: formData.bio,
        avatarUrl: formData.avatarUrl,
        age: formData.age ? parseInt(formData.age) : null,
        sex: formData.sex,
        interestTags: formData.interestTags
      };
      
      setUser(updatedUser);
      setIsEditing(false);
      setLoading(false);
      
      Alert.alert('Success', 'Profile updated successfully');
    }, 1000);
  };
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change your profile picture.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setFormData({ ...formData, avatarUrl: result.assets[0].uri });
    }
  };
  
  const handleToggleInterest = (tag) => {
    if (formData.interestTags.includes(tag)) {
      setFormData({
        ...formData,
        interestTags: formData.interestTags.filter(t => t !== tag)
      });
    } else {
      setFormData({
        ...formData,
        interestTags: [...formData.interestTags, tag]
      });
    }
  };
  
  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetails', { activityId: activity.id });
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // This would be a real logout API call in production
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            });
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, isDark && styles.textDark]}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Ionicons name="settings-outline" size={24} color={isDark ? "#fff" : "#333"} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.profileSection, isDark && styles.sectionDark]}>
          <View style={styles.profileHeader}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={isEditing ? handlePickImage : null}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#ccc" />
                </View>
              )}
              {isEditing && (
                <View style={styles.editAvatarOverlay}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={[styles.usernameInput, isDark && styles.inputDark]}
                  value={formData.username}
                  onChangeText={(text) => setFormData({...formData, username: text})}
                  placeholder="Username"
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                />
              ) : (
                <Text style={[styles.username, isDark && styles.textDark]}>{user.username}</Text>
              )}
              
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Ionicons 
                      key={i} 
                      name={i < Math.floor(user.rating) ? "star" : (i < user.rating ? "star-half" : "star-outline")} 
                      size={16} 
                      color="#FFD700" 
                    />
                  ))}
                </View>
                <Text style={[styles.rating, isDark && styles.textDark]}>{user.rating.toFixed(1)}</Text>
                <Text style={[styles.reviewCount, isDark && styles.textLightDark]}>({user.reviewCount} reviews)</Text>
              </View>
              
              <Text style={[styles.memberSince, isDark && styles.textLightDark]}>
                Member since {formatDate(user.createdAt)}
              </Text>
            </View>
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Bio</Text>
                <TextInput
                  style={[styles.bioInput, isDark && styles.inputDark]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData({...formData, bio: text})}
                  placeholder="Tell others about yourself"
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                  multiline
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.formLabel, isDark && styles.textDark]}>Age</Text>
                  <TextInput
                    style={[styles.input, isDark && styles.inputDark]}
                    value={formData.age}
                    onChangeText={(text) => setFormData({...formData, age: text.replace(/[^0-9]/g, '')})}
                    placeholder="Age"
                    placeholderTextColor={isDark ? "#999" : "#ccc"}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.formLabel, isDark && styles.textDark]}>Sex</Text>
                  <View style={styles.segmentedControl}>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton, 
                        formData.sex === 'male' && styles.activeSegment,
                        isDark && styles.segmentDark,
                        formData.sex === 'male' && isDark && styles.activeSegmentDark
                      ]}
                      onPress={() => setFormData({...formData, sex: 'male'})}
                    >
                      <Text 
                        style={[
                          styles.segmentText, 
                          formData.sex === 'male' && styles.activeSegmentText,
                          isDark && styles.textDark,
                          formData.sex === 'male' && isDark && styles.activeSegmentTextDark
                        ]}
                      >
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton, 
                        formData.sex === 'female' && styles.activeSegment,
                        isDark && styles.segmentDark,
                        formData.sex === 'female' && isDark && styles.activeSegmentDark
                      ]}
                      onPress={() => setFormData({...formData, sex: 'female'})}
                    >
                      <Text 
                        style={[
                          styles.segmentText, 
                          formData.sex === 'female' && styles.activeSegmentText,
                          isDark && styles.textDark,
                          formData.sex === 'female' && isDark && styles.activeSegmentTextDark
                        ]}
                      >
                        Female
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segmentButton, 
                        formData.sex === 'other' && styles.activeSegment,
                        isDark && styles.segmentDark,
                        formData.sex === 'other' && isDark && styles.activeSegmentDark
                      ]}
                      onPress={() => setFormData({...formData, sex: 'other'})}
                    >
                      <Text 
                        style={[
                          styles.segmentText, 
                          formData.sex === 'other' && styles.activeSegmentText,
                          isDark && styles.textDark,
                          formData.sex === 'other' && isDark && styles.activeSegmentTextDark
                        ]}
                      >
                        Other
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, isDark && styles.textDark]}>Interests</Text>
                <View style={styles.interestsContainer}>
                  {['Sports', 'Arts', 'Social', 'Education', 'Food', 'Music', 'Technology', 'Outdoors'].map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.interestTag,
                        formData.interestTags.includes(tag) && { backgroundColor: getTagColor(tag) },
                        isDark && !formData.interestTags.includes(tag) && styles.interestTagDark
                      ]}
                      onPress={() => handleToggleInterest(tag)}
                    >
                      <Text 
                        style={[
                          styles.interestTagText,
                          formData.interestTags.includes(tag) && { color: '#fff' },
                          isDark && !formData.interestTags.includes(tag) && styles.textDark
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={[styles.cancelButton, isDark && styles.buttonDark]}
                  onPress={handleCancelEdit}
                >
                  <Text style={[styles.cancelButtonText, isDark && styles.buttonTextDark]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.bioSection}>
              <View style={styles.bioHeader}>
                <Text style={[styles.bioTitle, isDark && styles.textDark]}>About</Text>
                <TouchableOpacity onPress={handleEditProfile}>
                  <Text style={styles.editButton}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
              
              {user.age || user.sex ? (
                <View style={styles.infoRow}>
                  {user.age && (
                    <View style={styles.infoItem}>
                      <Ionicons name="calendar-outline" size={16} color={isDark ? "#ccc" : "#666"} />
                      <Text style={[styles.infoText, isDark && styles.textLightDark]}>{user.age} years old</Text>
                    </View>
                  )}
                  {user.sex && (
                    <View style={styles.infoItem}>
                      <Ionicons name="person-outline" size={16} color={isDark ? "#ccc" : "#666"} />
                      <Text style={[styles.infoText, isDark && styles.textLightDark]}>
                        {user.sex.charAt(0).toUpperCase() + user.sex.slice(1)}
                      </Text>
                    </View>
                  )}
                </View>
              ) : null}
              
              <Text style={[styles.bio, isDark && styles.textLightDark]}>
                {user.bio || "No bio provided yet."}
              </Text>
              
              {user.interestTags && user.interestTags.length > 0 && (
                <View style={styles.interestsSection}>
                  <Text style={[styles.interestsTitle, isDark && styles.textDark]}>Interests</Text>
                  <View style={styles.interestsContainer}>
                    {user.interestTags.map((tag) => (
                      <View
                        key={tag}
                        style={[styles.interestTag, { backgroundColor: getTagColor(tag) }]}
                      >
                        <Text style={styles.interestTagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
        
        <View style={[styles.statsSection, isDark && styles.sectionDark]}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, isDark && styles.textDark]}>{user.activitiesHosted}</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Hosted</Text>
          </View>
          <View style={[styles.statDivider, isDark && { backgroundColor: '#444' }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, isDark && styles.textDark]}>{user.activitiesJoined}</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Joined</Text>
          </View>
          <View style={[styles.statDivider, isDark && { backgroundColor: '#444' }]} />
          <View style={styles.stat}>
            <Text style={[styles.statNumber, isDark && styles.textDark]}>{user.reviewCount}</Text>
            <Text style={[styles.statLabel, isDark && styles.textLightDark]}>Reviews</Text>
          </View>
        </View>
        
        <View style={[styles.contentSection, isDark && styles.sectionDark]}>
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'activities' && styles.activeTab]} 
              onPress={() => setActiveTab('activities')}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'activities' && styles.activeTabText,
                  isDark && styles.textDark,
                  activeTab === 'activities' && isDark && { color: '#3b82f6' }
                ]}
              >
                Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]} 
              onPress={() => setActiveTab('reviews')}
            >
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'reviews' && styles.activeTabText,
                  isDark && styles.textDark,
                  activeTab === 'reviews' && isDark && { color: '#3b82f6' }
                ]}
              >
                Reviews
              </Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'activities' && (
            <View style={styles.activitiesContainer}>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <TouchableOpacity 
                    key={activity.id} 
                    style={[styles.activityCard, isDark && styles.cardDark]}
                    onPress={() => handleActivityPress(activity)}
                  >
                    <View style={styles.activityHeader}>
                      <Text style={[styles.activityTitle, isDark && styles.textDark]} numberOfLines={1}>
                        {activity.title}
                      </Text>
                      <View style={[styles.activityTag, { backgroundColor: getTagColor(activity.type) }]}>
                        <Text style={styles.activityTagText}>{activity.type}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.activityDetails}>
                      <View style={styles.activityDetail}>
                        <Ionicons name="calendar-outline" size={16} color={isDark ? "#ccc" : "#666"} />
                        <Text style={[styles.activityDetailText, isDark && styles.textLightDark]}>
                          {formatDate(activity.date)}
                        </Text>
                      </View>
                      <View style={styles.activityDetail}>
                        <Ionicons name="location-outline" size={16} color={isDark ? "#ccc" : "#666"} />
                        <Text style={[styles.activityDetailText, isDark && styles.textLightDark]}>
                          {activity.location}
                        </Text>
                      </View>
                      <View style={styles.activityDetail}>
                        <Ionicons name="people-outline" size={16} color={isDark ? "#ccc" : "#666"} />
                        <Text style={[styles.activityDetailText, isDark && styles.textLightDark]}>
                          {activity.participants}/{activity.capacity} participants
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.activityFooter, isDark && { borderTopColor: '#444' }]}>
                      <Text style={[styles.activityRole, isDark && styles.textLightDark]}>
                        {activity.isHosting ? 'You\'re hosting' : 'You\'re participating'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color={isDark ? "#555" : "#ccc"} />
                  <Text style={[styles.emptyStateTitle, isDark && styles.textDark]}>No activities yet</Text>
                  <Text style={[styles.emptyStateText, isDark && styles.textLightDark]}>
                    Join or create an activity to get started
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {activeTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <View key={review.id} style={[styles.reviewCard, isDark && styles.cardDark]}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewerInfo}>
                        <Ionicons name="person-circle-outline" size={36} color={isDark ? "#ccc" : "#666"} />
                        <Text style={[styles.reviewerName, isDark && styles.textDark]}>
                          {review.reviewer.username}
                        </Text>
                      </View>
                      <Text style={[styles.reviewDate, isDark && styles.textLightDark]}>
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>
                    
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons 
                          key={i} 
                          name={i < review.rating ? "star" : "star-outline"} 
                          size={16} 
                          color="#FFD700" 
                        />
                      ))}
                    </View>
                    
                    <Text style={[styles.reviewComment, isDark && styles.textLightDark]}>
                      {review.comment}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="star-outline" size={64} color={isDark ? "#555" : "#ccc"} />
                  <Text style={[styles.emptyStateTitle, isDark && styles.textDark]}>No reviews yet</Text>
                  <Text style={[styles.emptyStateText, isDark && styles.textLightDark]}>
                    Participate in activities to receive reviews
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, isDark && styles.logoutButtonDark]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={isDark ? "#fff" : "#FF5252"} />
          <Text style={[styles.logoutButtonText, isDark && { color: '#fff' }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDark && styles.textDark]}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color={isDark ? "#fff" : "#333"} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.settingsContainer}>
              <View style={[styles.settingItem, isDark && { borderBottomColor: '#444' }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, isDark && styles.textDark]}>Dark Mode</Text>
                  <Text style={[styles.settingDescription, isDark && styles.textLightDark]}>
                    Switch between light and dark theme
                  </Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={(value) => setSettings({...settings, darkMode: value})}
                  trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  thumbColor={settings.darkMode ? "#fff" : "#f4f3f4"}
                />
              </View>
              
              <View style={[styles.settingItem, isDark && { borderBottomColor: '#444' }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, isDark && styles.textDark]}>Notifications</Text>
                  <Text style={[styles.settingDescription, isDark && styles.textLightDark]}>
                    Receive push notifications
                  </Text>
                </View>
                <Switch
                  value={settings.notifications}
                  onValueChange={(value) => setSettings({...settings, notifications: value})}
                  trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  thumbColor={settings.notifications ? "#fff" : "#f4f3f4"}
                />
              </View>
              
              <View style={[styles.settingItem, isDark && { borderBottomColor: '#444' }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, isDark && styles.textDark]}>Location Sharing</Text>
                  <Text style={[styles.settingDescription, isDark && styles.textLightDark]}>
                    Share your location with other users
                  </Text>
                </View>
                <Switch
                  value={settings.locationSharing}
                  onValueChange={(value) => setSettings({...settings, locationSharing: value})}
                  trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  thumbColor={settings.locationSharing ? "#fff" : "#f4f3f4"}
                />
              </View>
              
              <View style={[styles.settingItem, isDark && { borderBottomColor: '#444' }]}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, isDark && styles.textDark]}>Privacy Mode</Text>
                  <Text style={[styles.settingDescription, isDark && styles.textLightDark]}>
                    Hide your profile from public searches
                  </Text>
                </View>
                <Switch
                  value={settings.privacyMode}
                  onValueChange={(value) => setSettings({...settings, privacyMode: value})}
                  trackColor={{ false: "#ccc", true: "#3b82f6" }}
                  thumbColor={settings.privacyMode ? "#fff" : "#f4f3f4"}
                />
              </View>
              
              <TouchableOpacity style={styles.settingButton}>
                <Text style={styles.settingButtonText}>Change Password</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingButton}>
                <Text style={styles.settingButtonText}>Privacy Policy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingButton}>
                <Text style={styles.settingButtonText}>Terms of Service</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.deleteAccountButton, isDark && { backgroundColor: '#442' }]}>
                <Text style={[styles.deleteAccountText, isDark && { color: '#f88' }]}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.saveSettingsButton}
              onPress={() => {
                // This would be a real API call in production
                // For now, just close the modal
                setSettingsModalVisible(false);
              }}
            >
              <Text style={styles.saveSettingsText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  textLightDark: {
    color: '#ccc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 4,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 6,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
  },
  memberSince: {
    fontSize: 12,
    color: '#666',
  },
  bioSection: {
    marginTop: 8,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 16,
  },
  interestsSection: {
    marginTop: 8,
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  interestTagDark: {
    backgroundColor: '#333',
  },
  interestTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  editForm: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  inputDark: {
    borderColor: '#444',
    backgroundColor: '#333',
    color: '#fff',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  usernameInput: {
    fontSize: 18,
    color: '#333',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segmentDark: {
    borderColor: '#444',
    backgroundColor: '#333',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeSegment: {
    backgroundColor: '#3b82f6',
  },
  activeSegmentDark: {
    backgroundColor: '#1a56db',
  },
  segmentText: {
    fontSize: 14,
    color: '#666',
  },
  activeSegmentText: {
    color: '#fff',
    fontWeight: '600',
  },
  activeSegmentTextDark: {
    color: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    marginRight: 8,
  },
  buttonDark: {
    backgroundColor: '#333',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDark: {
    color: '#ccc',
  },
  saveButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  contentSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  activitiesContainer: {
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardDark: {
    backgroundColor: '#333',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  activityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityDetails: {
    marginBottom: 12,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  activityFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  activityRole: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutButtonDark: {
    backgroundColor: '#422',
  },
  logoutButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsContainer: {
    maxHeight: '70%',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  settingButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  deleteAccountButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5252',
  },
  saveSettingsButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveSettingsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;