import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Platform,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type ActivityMarker = {
  id: number;
  title: string;
  type: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  date: Date;
  location: string;
  participants: number;
  capacity: number;
};

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activities, setActivities] = useState<ActivityMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityMarker | null>(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let userLocation = await Location.getCurrentPositionAsync({});
        
        // Update region to user's location
        const userRegion = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };
        
        setRegion(userRegion);
        setLocation({
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        });
        
        // Fetch activities near the user's location
        fetchActivitiesNearLocation(userLocation.coords.latitude, userLocation.coords.longitude);
      } catch (error) {
        console.error('Error getting location', error);
        setErrorMsg('Could not fetch location');
        setLoading(false);
      }
    })();
  }, []);

  const fetchActivitiesNearLocation = (latitude: number, longitude: number) => {
    // Simulating API call
    setTimeout(() => {
      // Sample data - would be replaced with actual API call
      const mockActivities = [
        {
          id: 1,
          title: 'Morning Yoga in the Park',
          type: 'Sports',
          coordinate: {
            latitude: latitude + 0.01,
            longitude: longitude + 0.005,
          },
          date: new Date(2023, 4, 15, 8, 0),
          location: 'Central Park',
          participants: 8,
          capacity: 15,
        },
        {
          id: 2,
          title: 'Street Photography Walk',
          type: 'Arts',
          coordinate: {
            latitude: latitude - 0.005,
            longitude: longitude + 0.01,
          },
          date: new Date(2023, 4, 14, 16, 30),
          location: 'Brooklyn Bridge',
          participants: 12,
          capacity: 20,
        },
        {
          id: 3,
          title: 'Coffee & Conversation',
          type: 'Social',
          coordinate: {
            latitude: latitude - 0.01,
            longitude: longitude - 0.005,
          },
          date: new Date(2023, 4, 16, 10, 0),
          location: 'Blue Bottle Coffee',
          participants: 5,
          capacity: 10,
        },
        {
          id: 4,
          title: 'Tech Meetup: AI in Healthcare',
          type: 'Technology',
          coordinate: {
            latitude: latitude + 0.008,
            longitude: longitude - 0.01,
          },
          date: new Date(2023, 4, 18, 18, 0),
          location: 'WeWork Times Square',
          participants: 45,
          capacity: 100,
        },
        {
          id: 5,
          title: 'Outdoor Rock Climbing',
          type: 'Sports',
          coordinate: {
            latitude: latitude + 0.02,
            longitude: longitude + 0.015,
          },
          date: new Date(2023, 4, 20, 9, 0),
          location: 'Hudson Valley',
          participants: 6,
          capacity: 12,
        },
      ];
      
      setActivities(mockActivities);
      setLoading(false);
    }, 1000);
  };

  const handleActivityMarkerPress = (activity: ActivityMarker) => {
    setSelectedActivity(activity);
    setShowActivityDetails(true);
  };

  const handleViewActivityDetails = (activity: ActivityMarker) => {
    navigation.navigate('ActivityDetail', { activityId: activity.id });
  };

  const centerMapOnMarker = (activity: ActivityMarker) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...activity.coordinate,
        latitudeDelta: LATITUDE_DELTA / 2,
        longitudeDelta: LONGITUDE_DELTA / 2,
      }, 500);
    }
  };

  const handleFilterPress = (type: string) => {
    if (selectedFilter === type) {
      setSelectedFilter(null);
      // Reset to show all activities
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 500);
      }
    } else {
      setSelectedFilter(type);
      
      // Center map on the first matching activity
      const matchingActivities = activities.filter(a => a.type === type);
      if (matchingActivities.length > 0) {
        const firstMatch = matchingActivities[0];
        centerMapOnMarker(firstMatch);
      }
    }
  };

  const getFilteredActivities = () => {
    if (!selectedFilter) return activities;
    return activities.filter(activity => activity.type === selectedFilter);
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

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return formatDistance(distance);
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) {
      // Convert to feet
      const feet = Math.round(miles * 5280);
      return `${feet} ft`;
    } else {
      return `${miles.toFixed(1)} mi`;
    }
  };

  const renderCustomMarker = (activity: ActivityMarker) => {
    const markerColor = getActivityTypeColor(activity.type);
    
    return (
      <Marker
        key={activity.id}
        coordinate={activity.coordinate}
        onPress={() => handleActivityMarkerPress(activity)}
      >
        <View style={styles.customMarker}>
          <View style={[styles.markerOuter, { backgroundColor: markerColor }]}>
            <View style={[styles.markerInner, { backgroundColor: isDark ? colors.card : 'white' }]}>
              <Ionicons 
                name={getIconForType(activity.type)} 
                size={16} 
                color={markerColor} 
              />
            </View>
          </View>
          <View style={[styles.markerTriangle, { borderTopColor: markerColor }]} />
        </View>
      </Marker>
    );
  };

  const getIconForType = (type: string) => {
    const typeIcons = {
      Sports: 'basketball-outline',
      Arts: 'color-palette-outline',
      Social: 'people-outline',
      Education: 'school-outline',
      Food: 'restaurant-outline',
      Music: 'musical-notes-outline',
      Technology: 'hardware-chip-outline',
      Outdoors: 'leaf-outline',
    };
    
    return typeIcons[type] || 'pin-outline';
  };

  const renderActivityCard = ({ item }: { item: ActivityMarker }) => (
    <TouchableOpacity 
      style={[styles.activityCard, { backgroundColor: colors.card }]}
      onPress={() => handleViewActivityDetails(item)}
    >
      <View style={[styles.cardColorBar, { backgroundColor: getActivityTypeColor(item.type) }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <TouchableOpacity onPress={() => centerMapOnMarker(item)}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text style={[styles.cardDate, { color: colors.text }]}>
          <Ionicons name="calendar-outline" size={14} /> {formatDate(item.date)}
        </Text>
        
        <Text style={[styles.cardLocation, { color: colors.text }]} numberOfLines={1}>
          <Ionicons name="location-outline" size={14} /> {item.location}
          {location && (
            <Text style={{ color: colors.primary }}>
              {' • '}
              {calculateDistance(
                location.latitude, 
                location.longitude, 
                item.coordinate.latitude, 
                item.coordinate.longitude
              )}
            </Text>
          )}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.participantsContainer}>
            <Ionicons name="people-outline" size={14} color={colors.text} />
            <Text style={[styles.participantsText, { color: colors.text }]}>
              {item.participants}/{item.capacity}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.viewButton, { backgroundColor: colors.primary }]}
            onPress={() => handleViewActivityDetails(item)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityModal = () => (
    <Modal
      visible={showActivityDetails}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowActivityDetails(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Activity Details</Text>
            <TouchableOpacity onPress={() => setShowActivityDetails(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {selectedActivity && (
            <View style={styles.activityDetails}>
              <View style={[styles.detailsTypeTag, { backgroundColor: getActivityTypeColor(selectedActivity.type) }]}>
                <Text style={styles.detailsTypeText}>{selectedActivity.type}</Text>
              </View>
              
              <Text style={[styles.detailsTitle, { color: colors.text }]}>
                {selectedActivity.title}
              </Text>
              
              <Text style={[styles.detailsDate, { color: colors.text }]}>
                <Ionicons name="calendar-outline" size={16} /> {formatDate(selectedActivity.date)}
              </Text>
              
              <Text style={[styles.detailsLocation, { color: colors.text }]}>
                <Ionicons name="location-outline" size={16} /> {selectedActivity.location}
                {location && (
                  <Text style={{ color: colors.primary }}>
                    {' • '}
                    {calculateDistance(
                      location.latitude, 
                      location.longitude, 
                      selectedActivity.coordinate.latitude, 
                      selectedActivity.coordinate.longitude
                    )}
                  </Text>
                )}
              </Text>
              
              <View style={styles.detailsParticipants}>
                <Ionicons name="people-outline" size={16} color={colors.text} />
                <Text style={[styles.detailsParticipantsText, { color: colors.text }]}>
                  {selectedActivity.participants}/{selectedActivity.capacity} participants
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.detailsButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setShowActivityDetails(false);
                  navigation.navigate('ActivityDetail', { activityId: selectedActivity.id });
                }}
              >
                <Text style={styles.detailsButtonText}>View Full Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading map...</Text>
        </View>
      ) : (
        <>
          <View style={styles.filterContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'Sports' && styles.filterButtonActive,
                  selectedFilter === 'Sports' && { backgroundColor: getActivityTypeColor('Sports') + '20' }
                ]}
                onPress={() => handleFilterPress('Sports')}
              >
                <Ionicons 
                  name="basketball-outline" 
                  size={18} 
                  color={selectedFilter === 'Sports' ? getActivityTypeColor('Sports') : colors.text} 
                />
                <Text 
                  style={[
                    styles.filterText, 
                    { color: selectedFilter === 'Sports' ? getActivityTypeColor('Sports') : colors.text }
                  ]}
                >
                  Sports
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'Arts' && styles.filterButtonActive,
                  selectedFilter === 'Arts' && { backgroundColor: getActivityTypeColor('Arts') + '20' }
                ]}
                onPress={() => handleFilterPress('Arts')}
              >
                <Ionicons 
                  name="color-palette-outline" 
                  size={18} 
                  color={selectedFilter === 'Arts' ? getActivityTypeColor('Arts') : colors.text} 
                />
                <Text 
                  style={[
                    styles.filterText, 
                    { color: selectedFilter === 'Arts' ? getActivityTypeColor('Arts') : colors.text }
                  ]}
                >
                  Arts
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'Social' && styles.filterButtonActive,
                  selectedFilter === 'Social' && { backgroundColor: getActivityTypeColor('Social') + '20' }
                ]}
                onPress={() => handleFilterPress('Social')}
              >
                <Ionicons 
                  name="people-outline" 
                  size={18} 
                  color={selectedFilter === 'Social' ? getActivityTypeColor('Social') : colors.text} 
                />
                <Text 
                  style={[
                    styles.filterText, 
                    { color: selectedFilter === 'Social' ? getActivityTypeColor('Social') : colors.text }
                  ]}
                >
                  Social
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === 'Technology' && styles.filterButtonActive,
                  selectedFilter === 'Technology' && { backgroundColor: getActivityTypeColor('Technology') + '20' }
                ]}
                onPress={() => handleFilterPress('Technology')}
              >
                <Ionicons 
                  name="hardware-chip-outline" 
                  size={18} 
                  color={selectedFilter === 'Technology' ? getActivityTypeColor('Technology') : colors.text} 
                />
                <Text 
                  style={[
                    styles.filterText, 
                    { color: selectedFilter === 'Technology' ? getActivityTypeColor('Technology') : colors.text }
                  ]}
                >
                  Technology
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={region}
              customMapStyle={isDark ? darkMapStyle : []}
              showsUserLocation
              showsMyLocationButton
              showsCompass
              loadingEnabled
            >
              {getFilteredActivities().map(activity => renderCustomMarker(activity))}
            </MapView>
            
            {location && (
              <TouchableOpacity
                style={[styles.recenterButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion({
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    }, 500);
                  }
                }}
              >
                <Ionicons name="locate" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.bottomSheet}>
            <View style={[styles.bottomSheetHandle, { backgroundColor: colors.border }]} />
            <View style={[styles.bottomSheetContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.bottomSheetTitle, { color: colors.text }]}>
                {getFilteredActivities().length} {selectedFilter ? `${selectedFilter} ` : ''}Activities Nearby
              </Text>
              
              <FlatList
                data={getFilteredActivities()}
                renderItem={renderActivityCard}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activityList}
              />
            </View>
          </View>
          
          {renderActivityModal()}
        </>
      )}
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
  filterContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
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
  filterButtonActive: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 190,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
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
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
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
  bottomSheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginTop: 8,
  },
  bottomSheetContent: {
    flex: 1,
    paddingTop: 8,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  activityList: {
    paddingHorizontal: 8,
  },
  activityCard: {
    width: 300,
    borderRadius: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
    flexDirection: 'row',
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
  cardColorBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 14,
    marginLeft: 4,
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  customMarker: {
    alignItems: 'center',
  },
  markerOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  activityDetails: {
    marginBottom: 16,
  },
  detailsTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailsTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailsDate: {
    fontSize: 16,
    marginBottom: 8,
  },
  detailsLocation: {
    fontSize: 16,
    marginBottom: 12,
  },
  detailsParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsParticipantsText: {
    fontSize: 16,
    marginLeft: 6,
  },
  detailsButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Dark mode map style
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default MapScreen;