import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Mock data for demo
const ACTIVITIES = [
  {
    id: 1,
    title: 'Morning Yoga in the Park',
    type: 'Sports',
    date: new Date(Date.now() + 86400000), // tomorrow
    location: 'Central Park',
    participants: 4,
    capacity: 10,
    image: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Yoga',
    distance: '0.8 miles'
  },
  {
    id: 2,
    title: 'Photography Walk',
    type: 'Arts',
    date: new Date(Date.now() + 172800000), // day after tomorrow
    location: 'Downtown',
    participants: 8,
    capacity: 12,
    image: 'https://via.placeholder.com/300x200/50C878/FFFFFF?text=Photography',
    distance: '1.2 miles'
  },
  {
    id: 3,
    title: 'Board Games Night',
    type: 'Social',
    date: new Date(Date.now() + 259200000), // 3 days from now
    location: 'The Game Café',
    participants: 12,
    capacity: 20,
    image: 'https://via.placeholder.com/300x200/9370DB/FFFFFF?text=Games',
    distance: '2.5 miles'
  },
];

// Mock data for recommended activities
const RECOMMENDED_ACTIVITIES = [
  {
    id: 4,
    title: 'Soccer Game',
    type: 'Sports',
    date: new Date(Date.now() + 345600000), // 4 days from now
    location: 'Community Field',
    participants: 14,
    capacity: 22,
    image: 'https://via.placeholder.com/300x200/FF6347/FFFFFF?text=Soccer',
    distance: '1.5 miles',
    matchReason: 'Based on your sports interests'
  },
  {
    id: 5,
    title: 'Book Club Meeting',
    type: 'Education',
    date: new Date(Date.now() + 432000000), // 5 days from now
    location: 'City Library',
    participants: 6,
    capacity: 15,
    image: 'https://via.placeholder.com/300x200/20B2AA/FFFFFF?text=Books',
    distance: '0.7 miles',
    matchReason: 'Similar to events you joined before'
  },
  {
    id: 6,
    title: 'Cooking Class: Italian Cuisine',
    type: 'Food',
    date: new Date(Date.now() + 518400000), // 6 days from now
    location: 'Culinary School',
    participants: 8,
    capacity: 10,
    image: 'https://via.placeholder.com/300x200/FFA500/FFFFFF?text=Cooking',
    distance: '3.2 miles',
    matchReason: 'Popular in your area'
  },
];

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ActivityCard = ({ activity, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(activity)}>
    <Image source={{ uri: activity.image }} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle} numberOfLines={1}>{activity.title}</Text>
      <View style={styles.cardDetails}>
        <View style={styles.cardDetail}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.cardDetailText}>{formatDate(activity.date)}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="location-outline" size={16} color="#666" />
          <Text style={styles.cardDetailText}>{activity.location}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.cardDetailText}>{activity.participants}/{activity.capacity}</Text>
        </View>
        <View style={styles.cardDetail}>
          <Ionicons name="navigate-outline" size={16} color="#666" />
          <Text style={styles.cardDetailText}>{activity.distance}</Text>
        </View>
      </View>
      <View style={[styles.cardTag, { backgroundColor: getTagColor(activity.type) }]}>
        <Text style={styles.cardTagText}>{activity.type}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const RecommendedActivityCard = ({ activity, onPress }) => (
  <TouchableOpacity style={styles.recCard} onPress={() => onPress(activity)}>
    <Image source={{ uri: activity.image }} style={styles.recCardImage} />
    <View style={styles.recCardContent}>
      <Text style={styles.recCardTitle} numberOfLines={1}>{activity.title}</Text>
      <View style={styles.recCardDetail}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.recCardDetailText}>{formatDate(activity.date)}</Text>
      </View>
      <View style={styles.recCardDetail}>
        <Ionicons name="navigate-outline" size={14} color="#666" />
        <Text style={styles.recCardDetailText}>{activity.distance}</Text>
      </View>
      <View style={styles.recMatchReason}>
        <Ionicons name="thumbs-up-outline" size={14} color="#3b82f6" />
        <Text style={styles.recMatchReasonText}>{activity.matchReason}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

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

const HomeScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  // Simulate data loading
  useEffect(() => {
    // This would be a real API call in production
    setTimeout(() => {
      setActivities(ACTIVITIES);
      setRecommendations(RECOMMENDED_ACTIVITIES);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // This would be a real API call in production
    setTimeout(() => {
      setActivities(ACTIVITIES);
      setRecommendations(RECOMMENDED_ACTIVITIES);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetails', { activityId: activity.id });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading activities...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Connect</Text>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search activities...</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Activities</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {activities.map(activity => (
              <ActivityCard 
                key={activity.id} 
                activity={activity} 
                onPress={handleActivityPress} 
              />
            ))}
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>View All</Text>
              <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          <Text style={styles.sectionSubtitle}>Based on your interests and history</Text>
          
          <View style={styles.recommendationsGrid}>
            {recommendations.map(activity => (
              <RecommendedActivityCard 
                key={activity.id} 
                activity={activity} 
                onPress={handleActivityPress} 
              />
            ))}
          </View>

          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All Recommendations</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {['Sports', 'Arts', 'Social', 'Education', 'Food', 'Music', 'Technology', 'Outdoors'].map(category => (
              <TouchableOpacity 
                key={category} 
                style={[styles.categoryButton, { backgroundColor: getTagColor(category) + '20' }]}
              >
                <Text style={[styles.categoryText, { color: getTagColor(category) }]}>{category}</Text>
              </TouchableOpacity>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  headerButton: {
    padding: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#999',
    fontSize: 16,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    marginTop: -8,
  },
  horizontalScroll: {
    paddingBottom: 8,
  },
  card: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#eee',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDetails: {
    marginBottom: 8,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  cardTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  viewMoreButton: {
    width: 100,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 4,
  },
  recommendationsSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f0f4ff',
  },
  recommendationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recCardImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#eee',
  },
  recCardContent: {
    padding: 10,
  },
  recCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  recCardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  recCardDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  recMatchReason: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  recMatchReasonText: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  viewAllText: {
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontWeight: '500',
  },
});

export default HomeScreen;