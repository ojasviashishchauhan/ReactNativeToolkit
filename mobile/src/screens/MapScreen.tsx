import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ActivityIndicator,
  Animated,
  Platform,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Sample activities data - this would come from an API
const ACTIVITIES = [
  {
    id: 1,
    title: 'Morning Yoga in the Park',
    type: 'Sports',
    coordinate: { latitude: 40.7128, longitude: -74.006 },
    date: new Date(Date.now() + 86400000), // tomorrow
    location: 'Central Park',
    participants: 4,
    capacity: 10,
  },
  {
    id: 2,
    title: 'Photography Walk',
    type: 'Arts',
    coordinate: { latitude: 40.7135, longitude: -74.0085 },
    date: new Date(Date.now() + 172800000), // day after tomorrow
    location: 'Downtown',
    participants: 8,
    capacity: 12,
  },
  {
    id: 3,
    title: 'Board Games Night',
    type: 'Social',
    coordinate: { latitude: 40.7145, longitude: -74.0075 },
    date: new Date(Date.now() + 259200000), // 3 days from now
    location: 'The Game Café',
    participants: 12,
    capacity: 20,
  },
  {
    id: 4,
    title: 'Soccer Game',
    type: 'Sports',
    coordinate: { latitude: 40.7115, longitude: -74.0095 },
    date: new Date(Date.now() + 345600000), // 4 days from now
    location: 'Community Field',
    participants: 14,
    capacity: 22,
  },
  {
    id: 5,
    title: 'Book Club Meeting',
    type: 'Education',
    coordinate: { latitude: 40.7138, longitude: -74.0065 },
    date: new Date(Date.now() + 432000000), // 5 days from now
    location: 'City Library',
    participants: 6,
    capacity: 15,
  },
  {
    id: 6,
    title: 'Cooking Class: Italian Cuisine',
    type: 'Food',
    coordinate: { latitude: 40.7152, longitude: -74.0058 },
    date: new Date(Date.now() + 518400000), // 6 days from now
    location: 'Culinary School',
    participants: 8,
    capacity: 10,
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

const getMarkerColor = (type) => {
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

const MapScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    radius: 5, // miles
    types: [],
  });
  
  const mapRef = useRef(null);
  const filterHeight = useRef(new Animated.Value(0)).current;

  // Get user location and activities data
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(userLoc);
        setRegion({
          ...userLoc,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        
        // This would be a real API call in production
        // Simulating a fetch with timeout
        setTimeout(() => {
          setActivities(ACTIVITIES);
          setLoading(false);
        }, 1000);
      } catch (error) {
        setErrorMsg('Could not fetch location');
        setLoading(false);
      }
    })();
  }, []);

  const toggleFilter = () => {
    if (filterVisible) {
      Animated.timing(filterHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setFilterVisible(false));
    } else {
      setFilterVisible(true);
      Animated.timing(filterHeight, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleMarkerPress = (activity) => {
    setSelectedActivity(activity);
  };

  const handleInfoPress = (activity) => {
    navigation.navigate('ActivityDetails', { activityId: activity.id });
  };

  const zoomToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const toggleTypeFilter = (type) => {
    if (filters.types.includes(type)) {
      setFilters({
        ...filters,
        types: filters.types.filter(t => t !== type)
      });
    } else {
      setFilters({
        ...filters,
        types: [...filters.types, type]
      });
    }
  };

  const filteredActivities = activities.filter(activity => {
    // Filter by type if any types are selected
    if (filters.types.length > 0 && !filters.types.includes(activity.type)) {
      return false;
    }
    
    // Filter by radius (implemented in miles)
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        activity.coordinate.latitude,
        activity.coordinate.longitude
      );
      return distance <= filters.radius;
    }
    
    return true;
  });

  // Calculate distance between two coordinates in miles
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Convert miles to meters for circle radius
  const milesToMeters = (miles) => {
    return miles * 1609.34;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {userLocation && (
            <Circle
              center={userLocation}
              radius={milesToMeters(filters.radius)}
              fillColor="rgba(59, 130, 246, 0.1)"
              strokeColor="rgba(59, 130, 246, 0.5)"
              strokeWidth={1}
            />
          )}
          
          {filteredActivities.map((activity) => (
            <Marker
              key={activity.id}
              coordinate={activity.coordinate}
              onPress={() => handleMarkerPress(activity)}
              pinColor={getMarkerColor(activity.type)}
            >
              <Callout tooltip onPress={() => handleInfoPress(activity)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{activity.title}</Text>
                  <Text style={styles.calloutDetail}>
                    <Ionicons name="calendar-outline" size={14} color="#666" /> {formatDate(activity.date)}
                  </Text>
                  <Text style={styles.calloutDetail}>
                    <Ionicons name="location-outline" size={14} color="#666" /> {activity.location}
                  </Text>
                  <Text style={styles.calloutDetail}>
                    <Ionicons name="people-outline" size={14} color="#666" /> {activity.participants}/{activity.capacity}
                  </Text>
                  <TouchableOpacity style={styles.calloutButton}>
                    <Text style={styles.calloutButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>

        <View style={styles.mapOverlay}>
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={toggleFilter}
          >
            <Ionicons name="options-outline" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={zoomToUserLocation}
          >
            <Ionicons name="locate-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {filterVisible && (
          <Animated.View style={[styles.filterContainer, { height: filterHeight }]}>
            <Text style={styles.filterTitle}>Filter Activities</Text>
            
            <View style={styles.radiusContainer}>
              <Text style={styles.filterLabel}>Radius: {filters.radius} miles</Text>
              <View style={styles.radiusSlider}>
                <TouchableOpacity 
                  style={styles.radiusButton}
                  onPress={() => setFilters({...filters, radius: Math.max(1, filters.radius - 1)})}
                >
                  <Text>-</Text>
                </TouchableOpacity>
                <View style={styles.radiusTrack}>
                  <View style={[styles.radiusFill, { width: `${(filters.radius / 10) * 100}%` }]} />
                </View>
                <TouchableOpacity 
                  style={styles.radiusButton}
                  onPress={() => setFilters({...filters, radius: Math.min(10, filters.radius + 1)})}
                >
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.filterLabel}>Activity Types:</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeContainer}
            >
              {['Sports', 'Arts', 'Social', 'Education', 'Food', 'Music'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[
                    styles.typeButton,
                    filters.types.includes(type) && { backgroundColor: getMarkerColor(type) }
                  ]}
                  onPress={() => toggleTypeFilter(type)}
                >
                  <Text 
                    style={[
                      styles.typeText,
                      filters.types.includes(type) && { color: '#fff' }
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.applyButton} onPress={toggleFilter}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
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
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
  },
  mapButton: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  callout: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  calloutDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginTop: 6,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#555',
  },
  radiusContainer: {
    marginBottom: 16,
  },
  radiusSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  radiusButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radiusTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  radiusFill: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  typeText: {
    fontSize: 14,
    color: '#555',
  },
  applyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MapScreen;