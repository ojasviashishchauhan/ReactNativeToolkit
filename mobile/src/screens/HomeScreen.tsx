import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Activity = {
  id: number;
  title: string;
  type: string;
  date: Date;
  location: string;
  participants: number;
  capacity: number;
  image: string;
  distance: string;
  matchReason?: string;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = () => {
    setRefreshing(true);
    
    // Simulating API call to fetch activities
    setTimeout(() => {
      // Sample data - would be replaced with actual API call
      const mockNearbyActivities = [
        {
          id: 1,
          title: 'Morning Yoga in the Park',
          type: 'Sports',
          date: new Date(2023, 4, 15, 8, 0),
          location: 'Central Park, New York',
          participants: 8,
          capacity: 15,
          image: 'https://source.unsplash.com/random/300x200/?yoga',
          distance: '0.5 mi'
        },
        {
          id: 2,
          title: 'Street Photography Walk',
          type: 'Arts',
          date: new Date(2023, 4, 14, 16, 30),
          location: 'Brooklyn Bridge, New York',
          participants: 12,
          capacity: 20,
          image: 'https://source.unsplash.com/random/300x200/?photography',
          distance: '1.2 mi'
        },
        {
          id: 3,
          title: 'Coffee & Conversation',
          type: 'Social',
          date: new Date(2023, 4, 16, 10, 0),
          location: 'Blue Bottle Coffee, New York',
          participants: 5,
          capacity: 10,
          image: 'https://source.unsplash.com/random/300x200/?coffee',
          distance: '0.8 mi'
        }
      ];
      
      const mockRecommendedActivities = [
        {
          id: 4,
          title: 'Tech Meetup: AI in Healthcare',
          type: 'Technology',
          date: new Date(2023, 4, 18, 18, 0),
          location: 'WeWork Times Square, New York',
          participants: 45,
          capacity: 100,
          image: 'https://source.unsplash.com/random/300x200/?tech',
          distance: '2.5 mi',
          matchReason: 'Based on your interest in AI'
        },
        {
          id: 5,
          title: 'Outdoor Rock Climbing',
          type: 'Sports',
          date: new Date(2023, 4, 20, 9, 0),
          location: 'Hudson Valley, New York',
          participants: 6,
          capacity: 12,
          image: 'https://source.unsplash.com/random/300x200/?climbing',
          distance: '15 mi',
          matchReason: 'Similar to activities you joined'
        },
        {
          id: 6,
          title: 'Painting Workshop',
          type: 'Arts',
          date: new Date(2023, 4, 17, 14, 0),
          location: 'Creative Studio, Manhattan',
          participants: 10,
          capacity: 15,
          image: 'https://source.unsplash.com/random/300x200/?painting',
          distance: '1.5 mi',
          matchReason: 'Matched to your Arts interests'
        }
      ];

      setNearbyActivities(mockNearbyActivities);
      setRecommendedActivities(mockRecommendedActivities);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    fetchActivities();
  };

  const handleActivityPress = (activity: Activity) => {
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleString('en-US', options);
  };

  const getActivityTypeColor = (type: string) => {
    const typeColors = {
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

  const renderNearbyActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity 
      style={[styles.activityCard, { backgroundColor: colors.card }]}
      onPress={() => handleActivityPress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.activityImage} 
        resizeMode="cover"
      />
      <View style={styles.cardOverlay}>
        <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
        <Text style={[styles.distanceText, { color: colors.background }]}>
          {item.distance}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.activityDate, { color: colors.text }]}>
          <Ionicons name="calendar-outline" size={14} /> {formatDate(item.date)}
        </Text>
        <Text style={[styles.activityLocation, { color: colors.text }]} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} /> {item.location}
        </Text>
        <View style={styles.participantsContainer}>
          <Ionicons name="people-outline" size={14} color={colors.text} />
          <Text style={[styles.participantsText, { color: colors.text }]}>
            {item.participants}/{item.capacity} joined
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendedActivity = ({ item }: { item: Activity }) => (
    <TouchableOpacity 
      style={[styles.recommendedCard, { backgroundColor: colors.card }]}
      onPress={() => handleActivityPress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.recommendedImage} 
        resizeMode="cover"
      />
      <View style={styles.cardOverlay}>
        <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
          <Text style={styles.typeText}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.recommendedContent}>
        <Text style={[styles.recommendedTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.recommendedDate, { color: colors.text }]}>
          <Ionicons name="calendar-outline" size={12} /> {formatDate(item.date)}
        </Text>
        <Text style={[styles.recommendedLocation, { color: colors.text }]} numberOfLines={1}>
          <Ionicons name="location-outline" size={12} /> {item.location}
        </Text>
        <View style={styles.recommendedBottom}>
          <View style={styles.participantsContainer}>
            <Ionicons name="people-outline" size={12} color={colors.text} />
            <Text style={[styles.recommendedParticipants, { color: colors.text }]}>
              {item.participants}/{item.capacity}
            </Text>
          </View>
          <Text style={[styles.distanceTag, { color: colors.primary }]}>{item.distance}</Text>
        </View>
        {item.matchReason && (
          <View style={[styles.matchReasonTag, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="thumbs-up-outline" size={12} color={colors.primary} />
            <Text style={[styles.matchReasonText, { color: colors.primary }]}>
              {item.matchReason}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>Hello!</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>Find activities nearby</Text>
          </View>
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateActivity')}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Activities</Text>
          <FlatList
            horizontal
            data={nearbyActivities}
            renderItem={renderNearbyActivity}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nearbyList}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended For You</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text }]}>
            Based on your interests and past activities
          </Text>
          <View style={styles.recommendedGrid}>
            {recommendedActivities.map((item) => (
              <View key={item.id} style={styles.recommendedWrapper}>
                {renderRecommendedActivity({ item })}
              </View>
            ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  createButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  nearbyList: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  activityCard: {
    width: 280,
    borderRadius: 12,
    marginLeft: 16,
    marginVertical: 8,
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
  activityImage: {
    width: '100%',
    height: 140,
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  distanceText: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  cardContent: {
    padding: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  activityDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  recommendedWrapper: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  recommendedCard: {
    borderRadius: 12,
    overflow: 'hidden',
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
  recommendedImage: {
    width: '100%',
    height: 100,
  },
  recommendedContent: {
    padding: 10,
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recommendedDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  recommendedLocation: {
    fontSize: 12,
    marginBottom: 6,
  },
  recommendedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedParticipants: {
    fontSize: 12,
    marginLeft: 4,
  },
  distanceTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  matchReasonTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchReasonText: {
    fontSize: 10,
    marginLeft: 4,
  },
});

export default HomeScreen;