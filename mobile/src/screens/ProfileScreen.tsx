import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type ThemeOption = 'light' | 'dark' | 'system';

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  
  // User data (would come from API)
  const [user, setUser] = useState({
    id: 1,
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex.johnson@example.com',
    bio: 'Yoga enthusiast, nature lover, and tech geek. Always up for new adventures and meeting new people!',
    avatarUrl: 'https://source.unsplash.com/random/400x400/?portrait',
    location: 'New York, NY',
    joinedDate: 'January 2023',
    activitiesHosted: 8,
    activitiesJoined: 15,
    rating: 4.8,
    reviewCount: 12,
  });
  
  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Placeholder stats for hosted and joined activities
  const hostedActivities = [
    { id: 1, title: 'Morning Yoga in the Park', type: 'Sports', date: new Date(2023, 4, 15, 8, 0) },
    { id: 2, title: 'Coffee & Conversation', type: 'Social', date: new Date(2023, 4, 16, 10, 0) },
  ];
  
  const joinedActivities = [
    { id: 3, title: 'Street Photography Walk', type: 'Arts', date: new Date(2023, 4, 14, 16, 30) },
    { id: 4, title: 'Tech Meetup: AI in Healthcare', type: 'Technology', date: new Date(2023, 4, 18, 18, 0) },
  ];
  
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
            // In a real app, call logout API
            // Then navigate to auth screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
        }
      ]
    );
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const renderThemeOption = (option: ThemeOption, label: string) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        themeMode === option && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={() => {
        setThemeMode(option);
        setShowThemeModal(false);
      }}
    >
      <View style={styles.themeOptionContent}>
        <View 
          style={[
            styles.themeIconContainer, 
            { 
              backgroundColor: 
                option === 'light' 
                  ? '#F9FAFB' 
                  : option === 'dark'
                    ? '#1F2937'
                    : isDark ? '#1F2937' : '#F9FAFB'
            }
          ]}
        >
          <Ionicons 
            name={
              option === 'light' 
                ? 'sunny' 
                : option === 'dark'
                  ? 'moon'
                  : 'contrast'
            } 
            size={24} 
            color={
              option === 'light' 
                ? '#FF9800' 
                : option === 'dark'
                  ? '#F9FAFB'
                  : colors.primary
            } 
          />
        </View>
        <Text style={[styles.themeLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
      
      {themeMode === option && (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.userInfoContainer}>
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
              <Text style={[styles.userLocation, { color: colors.inactive }]}>
                <Ionicons name="location-outline" size={14} color={colors.inactive} />
                {' '}{user.location}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.editButton, { borderColor: colors.primary }]}
            onPress={() => Alert.alert('Edit Profile', 'This would open the edit profile screen')}
          >
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.bioContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>{user.activitiesHosted}</Text>
              <Text style={[styles.statLabel, { color: colors.inactive }]}>Hosted</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.text }]}>{user.activitiesJoined}</Text>
              <Text style={[styles.statLabel, { color: colors.inactive }]}>Joined</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <View style={styles.ratingContainer}>
                <Text style={[styles.statValue, { color: colors.text }]}>{user.rating}</Text>
                <Ionicons name="star" size={14} color="#FFD700" style={styles.starIcon} />
              </View>
              <Text style={[styles.statLabel, { color: colors.inactive }]}>Rating</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Activities</Text>
          
          <Text style={[styles.subsectionTitle, { color: colors.text }]}>Hosting</Text>
          {hostedActivities.length > 0 ? (
            hostedActivities.map(activity => (
              <TouchableOpacity 
                key={activity.id}
                style={[styles.activityItem, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
              >
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  <Text style={[styles.activityDate, { color: colors.inactive }]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.inactive} />
                    {' '}{formatDate(activity.date)}
                  </Text>
                </View>
                <View style={[styles.activityType, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.activityTypeText, { color: colors.primary }]}>{activity.type}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.inactive }]}>
              You are not hosting any activities
            </Text>
          )}
          
          <Text style={[styles.subsectionTitle, { color: colors.text, marginTop: 16 }]}>Participating</Text>
          {joinedActivities.length > 0 ? (
            joinedActivities.map(activity => (
              <TouchableOpacity 
                key={activity.id}
                style={[styles.activityItem, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('ActivityDetail', { activityId: activity.id })}
              >
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                  <Text style={[styles.activityDate, { color: colors.inactive }]}>
                    <Ionicons name="calendar-outline" size={14} color={colors.inactive} />
                    {' '}{formatDate(activity.date)}
                  </Text>
                </View>
                <View style={[styles.activityType, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.activityTypeText, { color: colors.primary }]}>{activity.type}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.inactive }]}>
              You are not participating in any activities
            </Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
              ios_backgroundColor={colors.border}
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>
          
          <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={24} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Location Services</Text>
            </View>
            <Switch
              trackColor={{ false: colors.border, true: `${colors.primary}80` }}
              thumbColor={locationEnabled ? colors.primary : '#f4f3f4'}
              ios_backgroundColor={colors.border}
              onValueChange={setLocationEnabled}
              value={locationEnabled}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.card }]}
            onPress={() => setShowThemeModal(true)}
          >
            <View style={styles.settingInfo}>
              <Ionicons 
                name={isDark ? 'moon-outline' : 'sunny-outline'} 
                size={24} 
                color={colors.primary} 
              />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Theme</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: colors.inactive }]}>
                {themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.error }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Choose Theme
              </Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.themeOptions}>
              {renderThemeOption('light', 'Light')}
              {renderThemeOption('dark', 'Dark')}
              {renderThemeOption('system', 'System Default')}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontWeight: '500',
  },
  bioContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  activityInfo: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
  },
  activityType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    marginRight: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
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
  themeOptions: {
    marginBottom: 24,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  themeLabel: {
    fontSize: 16,
  },
});

export default ProfileScreen;