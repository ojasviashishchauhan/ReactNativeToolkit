import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  FlatList,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type UserProfile = {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  joinDate: Date;
  age: number;
  sex: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  interests: string[];
  totalHosted: number;
  totalParticipated: number;
  rating: number;
};

type Review = {
  id: number;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatar: string;
  activityId: number;
  activityTitle: string;
  rating: number;
  comment: string;
  date: Date;
};

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('profile');
  
  // Edit profile state
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editSex, setEditSex] = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [isInterestsModalVisible, setIsInterestsModalVisible] = useState(false);
  
  useEffect(() => {
    fetchUserProfile();
    fetchUserReviews();
  }, []);
  
  const fetchUserProfile = () => {
    // Simulating API call to fetch user profile
    setTimeout(() => {
      const mockProfile = {
        id: 1,
        username: 'alexjohnson',
        email: 'alex.johnson@example.com',
        bio: 'Passionate about photography, hiking, and meeting new people. Love exploring new places and trying different activities.',
        avatarUrl: 'https://source.unsplash.com/random/300x300/?portrait',
        joinDate: new Date(2022, 8, 15),
        age: 28,
        sex: 'Male' as const,
        interests: ['Photography', 'Hiking', 'Technology', 'Arts', 'Social'],
        totalHosted: 12,
        totalParticipated: 24,
        rating: 4.8,
      };
      
      setProfile(mockProfile);
      
      // Initialize edit form with current values
      setEditUsername(mockProfile.username);
      setEditBio(mockProfile.bio);
      setEditAge(mockProfile.age.toString());
      setEditSex(mockProfile.sex);
      setEditInterests([...mockProfile.interests]);
      
      setLoading(false);
    }, 1000);
  };
  
  const fetchUserReviews = () => {
    // Simulating API call to fetch user reviews
    setTimeout(() => {
      const mockReviews = [
        {
          id: 1,
          reviewerId: 2,
          reviewerName: 'Jane Smith',
          reviewerAvatar: 'https://source.unsplash.com/random/100x100/?woman',
          activityId: 5,
          activityTitle: 'Photography Workshop in Central Park',
          rating: 5,
          comment: 'Alex organized an amazing photography workshop! Learned a lot of new techniques and had a great time with the group.',
          date: new Date(2023, 2, 10),
        },
        {
          id: 2,
          reviewerId: 3,
          reviewerName: 'Mike Johnson',
          reviewerAvatar: 'https://source.unsplash.com/random/100x100/?man',
          activityId: 8,
          activityTitle: 'Hiking Trip to Bear Mountain',
          rating: 4,
          comment: 'Well-organized hiking trip with a friendly group. Alex was a great guide and made sure everyone was comfortable.',
          date: new Date(2023, 1, 20),
        },
        {
          id: 3,
          reviewerId: 4,
          reviewerName: 'Sarah Williams',
          reviewerAvatar: 'https://source.unsplash.com/random/100x100/?girl',
          activityId: 12,
          activityTitle: 'Tech Meetup: AI in Healthcare',
          rating: 5,
          comment: 'This was such an informative session! Alex facilitated great discussions and made complex topics accessible.',
          date: new Date(2023, 0, 5),
        },
      ];
      
      setReviews(mockReviews);
    }, 1200);
  };
  
  const handleSaveProfile = () => {
    if (!profile) return;
    
    // Validate inputs
    if (editUsername.trim() === '') {
      Alert.alert('Error', 'Username cannot be empty');
      return;
    }
    
    const ageNum = parseInt(editAge, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (18-120)');
      return;
    }
    
    // In a real app, make API call to update profile
    const updatedProfile = {
      ...profile,
      username: editUsername,
      bio: editBio,
      age: ageNum,
      sex: editSex as 'Male' | 'Female' | 'Other' | 'Prefer not to say',
      interests: editInterests,
    };
    
    setProfile(updatedProfile);
    setEditMode(false);
  };
  
  const handleToggleInterest = (interest: string) => {
    if (editInterests.includes(interest)) {
      setEditInterests(editInterests.filter(i => i !== interest));
    } else {
      setEditInterests([...editInterests, interest]);
    }
  };
  
  const formatJoinDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long',
    };
    return date.toLocaleString('en-US', options);
  };
  
  const formatReviewDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleString('en-US', options);
  };
  
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <Ionicons key={i} name="star" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <Ionicons key={i} name="star-half" size={16} color="#FFD700" style={styles.starIcon} />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={16} color="#FFD700" style={styles.starIcon} />
        );
      }
    }
    return stars;
  };
  
  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Image 
            source={{ uri: item.reviewerAvatar }} 
            style={styles.reviewerAvatar} 
          />
          <View>
            <Text style={[styles.reviewerName, { color: colors.text }]}>
              {item.reviewerName}
            </Text>
            <Text style={[styles.reviewDate, { color: colors.inactive }]}>
              {formatReviewDate(item.date)}
            </Text>
          </View>
        </View>
        <View style={styles.ratingContainer}>
          {renderStars(item.rating)}
          <Text style={[styles.ratingText, { color: colors.text }]}>
            {item.rating.toFixed(1)}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.activityTitle, { color: colors.text }]}>
        For: {item.activityTitle}
      </Text>
      
      <Text style={[styles.reviewComment, { color: colors.text }]}>
        "{item.comment}"
      </Text>
    </View>
  );
  
  const renderInterestsModal = () => (
    <Modal
      visible={isInterestsModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsInterestsModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Your Interests
            </Text>
            <TouchableOpacity onPress={() => setIsInterestsModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.interestsList}>
            {['Sports', 'Arts', 'Music', 'Technology', 'Food', 'Education', 'Social', 'Outdoors', 'Photography', 'Gaming', 'Reading', 'Travel', 'Fitness', 'Cooking', 'Dancing', 'Movies', 'Nature', 'Science', 'Writing', 'Fashion', 'Pets'].map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.interestItem,
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => handleToggleInterest(interest)}
              >
                <Text style={[styles.interestText, { color: colors.text }]}>
                  {interest}
                </Text>
                {editInterests.includes(interest) ? (
                  <View style={[styles.checkboxChecked, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                ) : (
                  <View style={[styles.checkboxUnchecked, { borderColor: colors.border }]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={() => setIsInterestsModalVisible(false)}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  
  if (!profile) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="person-circle-outline" size={60} color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'profile' && styles.tabButtonActive,
            selectedTab === 'profile' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('profile')}
        >
          <Ionicons 
            name="person" 
            size={18} 
            color={selectedTab === 'profile' ? colors.primary : colors.inactive} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: selectedTab === 'profile' ? colors.primary : colors.inactive }
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'reviews' && styles.tabButtonActive,
            selectedTab === 'reviews' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('reviews')}
        >
          <Ionicons 
            name="star" 
            size={18} 
            color={selectedTab === 'reviews' ? colors.primary : colors.inactive} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: selectedTab === 'reviews' ? colors.primary : colors.inactive }
            ]}
          >
            Reviews
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'settings' && styles.tabButtonActive,
            selectedTab === 'settings' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('settings')}
        >
          <Ionicons 
            name="settings" 
            size={18} 
            color={selectedTab === 'settings' ? colors.primary : colors.inactive} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: selectedTab === 'settings' ? colors.primary : colors.inactive }
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {selectedTab === 'profile' && (
          <>
            {!editMode ? (
              // View mode
              <View style={styles.profileContainer}>
                <View style={styles.profileHeader}>
                  <Image 
                    source={{ uri: profile.avatarUrl }} 
                    style={styles.profileAvatar} 
                  />
                  <View style={styles.profileInfo}>
                    <Text style={[styles.username, { color: colors.text }]}>
                      {profile.username}
                    </Text>
                    <Text style={[styles.joinDate, { color: colors.inactive }]}>
                      Joined {formatJoinDate(profile.joinDate)}
                    </Text>
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {profile.totalHosted}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.inactive }]}>
                          Hosted
                        </Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                          {profile.totalParticipated}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.inactive }]}>
                          Joined
                        </Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={[styles.statValue, { color: colors.text }]}>
                            {profile.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={[styles.statLabel, { color: colors.inactive }]}>
                          Rating
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      About Me
                    </Text>
                    <TouchableOpacity 
                      style={[styles.editButton, { borderColor: colors.primary }]}
                      onPress={() => setEditMode(true)}
                    >
                      <Ionicons name="pencil" size={16} color={colors.primary} />
                      <Text style={[styles.editButtonText, { color: colors.primary }]}>
                        Edit Profile
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.bioText, { color: colors.text }]}>
                    {profile.bio || 'No bio provided.'}
                  </Text>
                </View>
                
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Personal Information
                  </Text>
                  <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.infoLabel, { color: colors.inactive }]}>
                      Age
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {profile.age} years
                    </Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.infoLabel, { color: colors.inactive }]}>
                      Sex
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {profile.sex}
                    </Text>
                  </View>
                  <View style={[styles.infoItem, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.infoLabel, { color: colors.inactive }]}>
                      Email
                    </Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>
                      {profile.email}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.sectionContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Interests
                  </Text>
                  <View style={styles.interestsContainer}>
                    {profile.interests.map((interest) => (
                      <View 
                        key={interest} 
                        style={[
                          styles.interestTag,
                          { backgroundColor: colors.primary + '20' }
                        ]}
                      >
                        <Text style={[styles.interestTagText, { color: colors.primary }]}>
                          {interest}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              // Edit mode
              <View style={styles.editContainer}>
                <View style={styles.editAvatarContainer}>
                  <Image 
                    source={{ uri: profile.avatarUrl }} 
                    style={styles.editAvatar} 
                  />
                  <TouchableOpacity style={styles.changeAvatarButton}>
                    <Ionicons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Username
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? colors.cardLight : '#F3F4F6',
                        color: colors.text
                      }
                    ]}
                    value={editUsername}
                    onChangeText={setEditUsername}
                    placeholder="Username"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Bio
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textAreaInput,
                      { 
                        backgroundColor: isDark ? colors.cardLight : '#F3F4F6',
                        color: colors.text
                      }
                    ]}
                    value={editBio}
                    onChangeText={setEditBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Age
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { 
                        backgroundColor: isDark ? colors.cardLight : '#F3F4F6',
                        color: colors.text
                      }
                    ]}
                    value={editAge}
                    onChangeText={setEditAge}
                    placeholder="Age"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                    keyboardType="number-pad"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Sex
                  </Text>
                  <View style={styles.sexButtonsContainer}>
                    {['Male', 'Female', 'Other', 'Prefer not to say'].map((sex) => (
                      <TouchableOpacity
                        key={sex}
                        style={[
                          styles.sexButton,
                          editSex === sex && styles.sexButtonSelected,
                          editSex === sex && { backgroundColor: colors.primary },
                          { borderColor: colors.border }
                        ]}
                        onPress={() => setEditSex(sex)}
                      >
                        <Text
                          style={[
                            styles.sexButtonText,
                            { color: editSex === sex ? 'white' : colors.text }
                          ]}
                        >
                          {sex}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>
                    Interests
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.interestsSelector,
                      { 
                        backgroundColor: isDark ? colors.cardLight : '#F3F4F6',
                        borderColor: colors.border
                      }
                    ]}
                    onPress={() => setIsInterestsModalVisible(true)}
                  >
                    <View style={styles.interestsPreview}>
                      {editInterests.length > 0 ? (
                        <Text style={[styles.interestsText, { color: colors.text }]}>
                          {editInterests.join(', ')}
                        </Text>
                      ) : (
                        <Text style={[styles.interestsPlaceholder, { color: colors.inactive }]}>
                          Select your interests
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-down" size={20} color={colors.inactive} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => setEditMode(false)}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.saveButtonText}>
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
        
        {selectedTab === 'reviews' && (
          <View style={styles.reviewsContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={[styles.reviewsTitle, { color: colors.text }]}>
                Reviews from Others
              </Text>
              <View style={styles.ratingSummary}>
                <Text style={[styles.ratingNumber, { color: colors.text }]}>
                  {profile.rating.toFixed(1)}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(profile.rating)}
                </View>
                <Text style={[styles.reviewCount, { color: colors.inactive }]}>
                  ({reviews.length} reviews)
                </Text>
              </View>
            </View>
            
            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.reviewsList}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyReviews}>
                <Ionicons name="star-outline" size={60} color={colors.inactive} />
                <Text style={[styles.emptyReviewsText, { color: colors.text }]}>
                  No reviews yet
                </Text>
                <Text style={[styles.emptyReviewsSubtext, { color: colors.inactive }]}>
                  Host or join activities to start receiving reviews!
                </Text>
              </View>
            )}
          </View>
        )}
        
        {selectedTab === 'settings' && (
          <View style={styles.settingsContainer}>
            <View style={[styles.settingSection, { borderBottomColor: colors.border }]}>
              <Text style={[styles.settingSectionTitle, { color: colors.text }]}>
                App Settings
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="moon-outline" size={24} color={colors.text} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Dark Mode
                  </Text>
                </View>
                <View style={styles.themeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      themeMode === 'light' && styles.themeOptionSelected,
                      themeMode === 'light' && { borderColor: colors.primary }
                    ]}
                    onPress={() => setThemeMode('light')}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        { 
                          color: themeMode === 'light' 
                            ? colors.primary 
                            : colors.text 
                        }
                      ]}
                    >
                      Light
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      themeMode === 'dark' && styles.themeOptionSelected,
                      themeMode === 'dark' && { borderColor: colors.primary }
                    ]}
                    onPress={() => setThemeMode('dark')}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        { 
                          color: themeMode === 'dark'
                            ? colors.primary
                            : colors.text
                        }
                      ]}
                    >
                      Dark
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.themeOption,
                      themeMode === 'system' && styles.themeOptionSelected,
                      themeMode === 'system' && { borderColor: colors.primary }
                    ]}
                    onPress={() => setThemeMode('system')}
                  >
                    <Text
                      style={[
                        styles.themeOptionText,
                        { 
                          color: themeMode === 'system'
                            ? colors.primary
                            : colors.text
                        }
                      ]}
                    >
                      System
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications-outline" size={24} color={colors.text} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Notifications
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                  thumbColor={true ? colors.primary : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={true}
                  onValueChange={() => {}}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="location-outline" size={24} color={colors.text} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Location Services
                  </Text>
                </View>
                <Switch
                  trackColor={{ false: '#767577', true: `${colors.primary}80` }}
                  thumbColor={true ? colors.primary : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={true}
                  onValueChange={() => {}}
                />
              </View>
            </View>
            
            <View style={styles.settingSection}>
              <Text style={[styles.settingSectionTitle, { color: colors.text }]}>
                Account
              </Text>
              
              <TouchableOpacity style={styles.settingButton}>
                <View style={styles.settingInfo}>
                  <Ionicons name="shield-outline" size={24} color={colors.text} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Privacy Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingButton}>
                <View style={styles.settingInfo}>
                  <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>
                    Change Password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={() => {
                  Alert.alert(
                    'Log Out',
                    'Are you sure you want to log out?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Log Out', 
                        style: 'destructive',
                        onPress: () => {
                          // Handle logout in a real app
                          navigation.navigate('Auth');
                        }
                      }
                    ]
                  );
                }}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
                <Text style={[styles.logoutText, { color: colors.error }]}>
                  Log Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      
      {renderInterestsModal()}
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
    marginTop: 16,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bioText: {
    fontSize: 16,
    lineHeight: 22,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 16,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  interestTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editContainer: {
    padding: 16,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  editAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textAreaInput: {
    height: 100,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  sexButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  sexButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  sexButtonSelected: {
    borderWidth: 0,
  },
  sexButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  interestsPreview: {
    flex: 1,
  },
  interestsText: {
    fontSize: 16,
  },
  interestsPlaceholder: {
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewsContainer: {
    padding: 16,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  reviewCount: {
    fontSize: 14,
    marginLeft: 8,
  },
  reviewsList: {
    paddingBottom: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
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
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  activityTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  emptyReviews: {
    alignItems: 'center',
    padding: 30,
  },
  emptyReviewsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyReviewsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  settingsContainer: {
    padding: 16,
  },
  settingSection: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  settingSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  themeSelector: {
    flexDirection: 'row',
  },
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginLeft: 8,
  },
  themeOptionSelected: {
    borderWidth: 1,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  interestsList: {
    flex: 1,
  },
  interestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  interestText: {
    fontSize: 16,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  doneButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ProfileScreen;