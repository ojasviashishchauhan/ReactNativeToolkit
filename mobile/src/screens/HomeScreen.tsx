import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Activity = {
  id: number;
  title: string;
  type: string;
  date: Date;
  location: string;
  distance: string;
  participants: number;
  capacity: number;
  hostName: string;
  hostAvatar: string;
};

type Recommendation = {
  id: number;
  title: string;
  type: string;
  reason: string;
};

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingActivities, setUpcomingActivities] = useState<Activity[]>([]);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    
    // In a real app, all these would be real API calls
    await Promise.all([
      fetchUpcomingActivities(),
      fetchNearbyActivities(),
      fetchRecommendations(),
    ]);
    
    setLoading(false);
  };
  
  const fetchUpcomingActivities = async () => {
    // Simulating API call
    setTimeout(() => {
      const mockActivities = [
        {
          id: 1,
          title: 'Morning Yoga in the Park',
          type: 'Sports',
          date: new Date(2023, 4, 15, 8, 0),
          location: 'Central Park',
          distance: '0.8 mi',
          participants: 8,
          capacity: 15,
          hostName: 'Alex Johnson',
          hostAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
        },
        {
          id: 2,
          title: 'Coffee & Conversation',
          type: 'Social',
          date: new Date(2023, 4, 16, 10, 0),
          location: 'Blue Bottle Coffee',
          distance: '1.2 mi',
          participants: 5,
          capacity: 10,
          hostName: 'Jane Smith',
          hostAvatar: 'https://source.unsplash.com/random/100x100/?woman',
        },
      ];
      
      setUpcomingActivities(mockActivities);
    }, 1000);
  };
  
  const fetchNearbyActivities = async () => {
    // Simulating API call
    setTimeout(() => {
      const mockActivities = [
        {
          id: 3,
          title: 'Street Photography Walk',
          type: 'Arts',
          date: new Date(2023, 4, 14, 16, 30),
          location: 'Brooklyn Bridge',
          distance: '1.5 mi',
          participants: 12,
          capacity: 20,
          hostName: 'Mike Wilson',
          hostAvatar: 'https://source.unsplash.com/random/100x100/?man',
        },
        {
          id: 4,
          title: 'Tech Meetup: AI in Healthcare',
          type: 'Technology',
          date: new Date(2023, 4, 18, 18, 0),
          location: 'WeWork Times Square',
          distance: '2.0 mi',
          participants: 45,
          capacity: 100,
          hostName: 'Sarah Davis',
          hostAvatar: 'https://source.unsplash.com/random/100x100/?girl',
        },
        {
          id: 5,
          title: 'Rooftop Jazz Night',
          type: 'Music',
          date: new Date(2023, 4, 17, 19, 30),
          location: 'The Standard Highline',
          distance: '1.7 mi',
          participants: 28,
          capacity: 50,
          hostName: 'David Brown',
          hostAvatar: 'https://source.unsplash.com/random/100x100/?musician',
        },
      ];
      
      setNearbyActivities(mockActivities);
    }, 1200);
  };
  
  const fetchRecommendations = async () => {
    // Simulating API call
    setTimeout(() => {
      const mockRecommendations = [
        {
          id: 6,
          title: 'Hiking Trip to Bear Mountain',
          type: 'Outdoors',
          reason: 'Based on your interest in outdoor activities',
        },
        {
          id: 7,
          title: 'Wine Tasting in SoHo',
          type: 'Food',
          reason: 'Popular in your area',
        },
        {
          id: 8,
          title: 'Beginner's Pottery Class',
          type: 'Arts',
          reason: 'Similar to activities you've joined before',
        },
      ];
      
      setRecommendations(mockRecommendations);
    }, 1500);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dateString = '';
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateString = 'Tomorrow';
    } else {
      // Format as "Mon, May 15"
      dateString = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
    
    // Add time "8:00 AM"
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    
    return `${dateString} at ${timeString}`;
  };
  
  const getActivityTypeColor = (type: string) => {
    const typeColors: {[key: string]: string} = {
      Sports: '#4CAF50',
      Arts: '#9C27B0',
      Social: '#2196F3',
      Education: '#FF9800',
      Food: '#F44336',
      Music: '#E91E63',
      Technology: '#00BCD4',
      Outdoors: '#8BC34A',
    };
    
    return typeColors[type] || '#757575';
  };
  
  const getActivityTypeIcon = (type: string) => {
    const typeIcons: {[key: string]: string} = {
      Sports: 'basketball-outline',
      Arts: 'color-palette-outline',
      Social: 'people-outline',
      Education: 'school-outline',
      Food: 'restaurant-outline',
      Music: 'musical-notes-outline',
      Technology: 'hardware-chip-outline',
      Outdoors: 'leaf-outline',
    };
    
    return typeIcons[type] || 'help-circle-outline';
  };
  
  const renderUpcomingActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[styles.upcomingCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    >
      <View style={styles.upcomingCardHeader}>
        <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
          <Ionicons name={getActivityTypeIcon(item.type)} size={14} color="white" />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <Text style={[styles.upcomingDate, { color: colors.primary }]}>
          {formatDate(item.date)}
        </Text>
      </View>
      
      <Text style={[styles.upcomingTitle, { color: colors.text }]}>
        {item.title}
      </Text>
      
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color={colors.inactive} />
        <Text style={[styles.locationText, { color: colors.inactive }]}>
          {item.location} • {item.distance}
        </Text>
      </View>
      
      <View style={styles.hostContainer}>
        <Image source={{ uri: item.hostAvatar }} style={styles.hostAvatar} />
        <Text style={[styles.hostText, { color: colors.text }]}>
          Hosted by {item.hostName}
        </Text>
      </View>
      
      <View style={styles.participantsContainer}>
        <View style={styles.participantsInfo}>
          <Ionicons name="people-outline" size={14} color={colors.inactive} />
          <Text style={[styles.participantsText, { color: colors.inactive }]}>
            {item.participants}/{item.capacity} joined
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.detailsButton, { backgroundColor: colors.primary + '20' }]}
        >
          <Text style={[styles.detailsButtonText, { color: colors.primary }]}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const renderNearbyActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[styles.nearbyCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    >
      <View style={styles.nearbyCardContent}>
        <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
          <Ionicons name={getActivityTypeIcon(item.type)} size={14} color="white" />
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        
        <Text numberOfLines={1} style={[styles.nearbyTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        
        <View style={styles.nearbyDetailsContainer}>
          <View style={styles.nearbyDetail}>
            <Ionicons name="calendar-outline" size={12} color={colors.inactive} />
            <Text style={[styles.nearbyDetailText, { color: colors.inactive }]}>
              {formatDate(item.date)}
            </Text>
          </View>
          
          <View style={styles.nearbyDetail}>
            <Ionicons name="location-outline" size={12} color={colors.inactive} />
            <Text style={[styles.nearbyDetailText, { color: colors.inactive }]}>
              {item.distance} away
            </Text>
          </View>
          
          <View style={styles.nearbyDetail}>
            <Ionicons name="people-outline" size={12} color={colors.inactive} />
            <Text style={[styles.nearbyDetailText, { color: colors.inactive }]}>
              {item.participants}/{item.capacity}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const renderRecommendation = ({ item }: { item: Recommendation }) => (
    <TouchableOpacity
      style={[styles.recommendationItem, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    >
      <View style={styles.recommendationContent}>
        <View style={[styles.recommendationIconContainer, { backgroundColor: getActivityTypeColor(item.type) + '20' }]}>
          <Ionicons name={getActivityTypeIcon(item.type)} size={24} color={getActivityTypeColor(item.type)} />
        </View>
        
        <View style={styles.recommendationTextContainer}>
          <Text numberOfLines={1} style={[styles.recommendationTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.recommendationReason, { color: colors.inactive }]}>
            {item.reason}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.inactive} />
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your activities...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Hello, Alex</Text>
            <Text style={[styles.subGreeting, { color: colors.inactive }]}>Ready to connect?</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateActivity')}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Upcoming Activities</Text>
          {upcomingActivities.length > 0 ? (
            <FlatList
              data={upcomingActivities}
              renderItem={renderUpcomingActivity}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.upcomingList}
              scrollEnabled={false}
            />
          ) : (
            <View style={[styles.emptyStateContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={40} color={colors.inactive} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                No upcoming activities
              </Text>
              <Text style={[styles.emptyStateDescription, { color: colors.inactive }]}>
                Join activities or create your own to see them here
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Map')}
              >
                <Text style={styles.emptyStateButtonText}>Find Activities</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Activities Near You</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('Map')}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={nearbyActivities}
            renderItem={renderNearbyActivity}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbyList}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended For You</Text>
          <FlatList
            data={recommendations}
            renderItem={renderRecommendation}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.recommendationsList}
          />
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
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  seeAllButton: {
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingList: {
    paddingLeft: 16,
    paddingBottom: 8,
  },
  upcomingCard: {
    width: 300,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
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
  upcomingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  upcomingDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  upcomingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  hostText: {
    fontSize: 14,
  },
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nearbyList: {
    paddingLeft: 16,
  },
  nearbyCard: {
    width: 200,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
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
  nearbyCardContent: {
    padding: 12,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  nearbyDetailsContainer: {
    marginTop: 4,
  },
  nearbyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nearbyDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  recommendationsList: {
    paddingHorizontal: 16,
  },
  recommendationItem: {
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationTextContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 12,
  },
  emptyStateContainer: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;