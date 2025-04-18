import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// Sample data
const ACTIVITY = {
  id: 1,
  title: 'Morning Yoga in the Park',
  type: 'Sports',
  date: new Date(Date.now() + 86400000), // tomorrow
  location: 'Central Park',
  address: '59th to 110th Street, New York, NY 10022',
  coordinate: { latitude: 40.7812, longitude: -73.9665 },
  participants: 4,
  capacity: 10,
  description: 'Join us for a refreshing morning yoga session in the park. All levels welcome! We'll focus on gentle stretches and meditation techniques to start your day with positive energy. Please bring your own yoga mat and water bottle.',
  isHosting: false,
  host: {
    id: 101,
    name: 'Sarah Johnson',
    avatar: 'https://via.placeholder.com/100',
    rating: 4.8,
    activities: 12
  },
  images: [
    'https://via.placeholder.com/400x250/4A90E2/FFFFFF?text=Yoga',
    'https://via.placeholder.com/400x250/50C878/FFFFFF?text=Park',
    'https://via.placeholder.com/400x250/9370DB/FFFFFF?text=Morning'
  ],
  participantsList: [
    { id: 1, name: 'Jane Smith', avatar: 'https://via.placeholder.com/50' },
    { id: 2, name: 'John Doe', avatar: 'https://via.placeholder.com/50' },
    { id: 3, name: 'Alice Johnson', avatar: 'https://via.placeholder.com/50' },
    { id: 4, name: 'Bob Brown', avatar: 'https://via.placeholder.com/50' }
  ],
  status: null // null (not joined), 'pending', 'approved', 'rejected'
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit'
  });
};

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

const ActivityDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { activityId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [participating, setParticipating] = useState(false);
  
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setActivity(ACTIVITY);
      setParticipating(ACTIVITY.status === 'approved');
      setLoading(false);
    }, 1000);
  }, [activityId]);
  
  const handleParticipate = () => {
    if (activity.status === null) {
      // Request to join
      Alert.alert(
        'Join Activity',
        'Would you like to request to join this activity?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Join', 
            onPress: () => {
              // Simulate API call
              setActivity({
                ...activity,
                status: 'pending'
              });
              Alert.alert('Success', 'Request sent! The host will review your request.');
            }
          }
        ]
      );
    } else if (activity.status === 'approved') {
      // Leave activity
      Alert.alert(
        'Leave Activity',
        'Are you sure you want to leave this activity?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => {
              // Simulate API call
              setActivity({
                ...activity,
                status: null,
                participants: activity.participants - 1
              });
              setParticipating(false);
              Alert.alert('Success', 'You have left the activity.');
            }
          }
        ]
      );
    }
  };
  
  const handleChatPress = () => {
    navigation.navigate('Chat', { activityId: activity.id });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading activity details...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
          >
            {activity.images.map((image, index) => (
              <Image 
                key={index}
                source={{ uri: image }} 
                style={styles.image} 
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{`1/${activity.images.length}`}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: getTagColor(activity.type) }]}>
            <Text style={styles.tagText}>{activity.type}</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{activity.title}</Text>
          
          <View style={styles.hostContainer}>
            <TouchableOpacity style={styles.hostInfo}>
              <Ionicons name="person-circle-outline" size={40} color="#666" />
              <View style={styles.hostDetails}>
                <Text style={styles.hostName}>{activity.host.name}</Text>
                <View style={styles.hostRating}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.hostRatingText}>{activity.host.rating}</Text>
                  <Text style={styles.hostActivityCount}>{activity.host.activities} activities</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={22} color="#3b82f6" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailText}>{formatDate(activity.date)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={22} color="#3b82f6" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailText}>{formatTime(activity.date)}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={22} color="#3b82f6" style={styles.detailIcon} />
              <View style={styles.locationDetail}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailText}>{activity.location}</Text>
                <Text style={styles.addressText}>{activity.address}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={22} color="#3b82f6" style={styles.detailIcon} />
              <View>
                <Text style={styles.detailLabel}>Participants</Text>
                <View style={styles.participantsInfo}>
                  <Text style={styles.detailText}>{activity.participants}/{activity.capacity}</Text>
                  <TouchableOpacity 
                    style={styles.viewParticipantsButton}
                    onPress={() => setParticipantsModalVisible(true)}
                  >
                    <Text style={styles.viewParticipantsText}>View all</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.avatarRow}>
                  {activity.participantsList.slice(0, 3).map((participant) => (
                    <TouchableOpacity key={participant.id} style={styles.avatarContainer}>
                      <Ionicons name="person-circle-outline" size={30} color="#666" />
                    </TouchableOpacity>
                  ))}
                  {activity.participantsList.length > 3 && (
                    <TouchableOpacity style={styles.avatarContainer}>
                      <View style={styles.moreAvatar}>
                        <Text style={styles.moreAvatarText}>+{activity.participantsList.length - 3}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{activity.description}</Text>
          </View>
          
          <View style={styles.mapContainer}>
            <Text style={styles.sectionTitle}>Location</Text>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: activity.coordinate.latitude,
                longitude: activity.coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={activity.coordinate}
                title={activity.location}
              />
            </MapView>
            <TouchableOpacity style={styles.openMapButton}>
              <Ionicons name="navigate-outline" size={16} color="#3b82f6" />
              <Text style={styles.openMapText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusContainer}>
            {activity.status === 'pending' && (
              <View style={styles.statusCard}>
                <Ionicons name="hourglass-outline" size={24} color="#FF9800" />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>Request Pending</Text>
                  <Text style={styles.statusText}>The host will review your request to join.</Text>
                </View>
              </View>
            )}
            
            {activity.status === 'rejected' && (
              <View style={styles.statusCard}>
                <Ionicons name="close-circle-outline" size={24} color="#FF5252" />
                <View style={styles.statusInfo}>
                  <Text style={styles.statusTitle}>Request Rejected</Text>
                  <Text style={styles.statusText}>The host has declined your request to join.</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        {activity.isHosting ? (
          <View style={styles.hostActionsContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditActivity', { activityId: activity.id })}
            >
              <Ionicons name="create-outline" size={20} color="#3b82f6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={handleChatPress}
            >
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
              <Text style={styles.chatButtonText}>Group Chat</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.participantActionsContainer}>
            <View style={styles.capacityContainer}>
              <Text style={styles.capacityText}>
                {activity.participants}/{activity.capacity} spots filled
              </Text>
              <View style={styles.capacityBarContainer}>
                <View 
                  style={[
                    styles.capacityBar,
                    { width: `${(activity.participants / activity.capacity) * 100}%` }
                  ]}
                />
              </View>
            </View>
            
            {activity.status === 'approved' ? (
              <View style={styles.approvedActionsContainer}>
                <TouchableOpacity 
                  style={styles.chatButton}
                  onPress={handleChatPress}
                >
                  <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                  <Text style={styles.chatButtonText}>Group Chat</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.leaveButton}
                  onPress={handleParticipate}
                >
                  <Text style={styles.leaveButtonText}>Leave</Text>
                </TouchableOpacity>
              </View>
            ) : activity.status === 'pending' ? (
              <TouchableOpacity 
                style={styles.pendingButton}
                disabled={true}
              >
                <Text style={styles.pendingButtonText}>Pending Approval</Text>
              </TouchableOpacity>
            ) : activity.participants >= activity.capacity ? (
              <TouchableOpacity 
                style={styles.fullButton}
                disabled={true}
              >
                <Text style={styles.fullButtonText}>Activity Full</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.joinButton}
                onPress={handleParticipate}
              >
                <Text style={styles.joinButtonText}>Join Activity</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {/* Participants Modal */}
      <Modal
        visible={participantsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setParticipantsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Participants</Text>
              <TouchableOpacity onPress={() => setParticipantsModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.participantsList}>
              {activity.participantsList.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <TouchableOpacity style={styles.participantInfo}>
                    <Ionicons name="person-circle-outline" size={40} color="#666" />
                    <Text style={styles.participantName}>{participant.name}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.messageButton}>
                    <Ionicons name="chatbubble-outline" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setParticipantsModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  imageContainer: {
    position: 'relative',
    height: 250,
  },
  image: {
    width: '100%',
    height: 250,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
  },
  tag: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  hostContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostDetails: {
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  hostRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hostRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  hostActivityCount: {
    fontSize: 12,
    color: '#999',
  },
  detailsContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
  },
  locationDetail: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewParticipantsButton: {
    marginLeft: 10,
  },
  viewParticipantsText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  avatarContainer: {
    marginRight: -8,
  },
  moreAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarText: {
    fontSize: 10,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  mapContainer: {
    marginBottom: 20,
  },
  map: {
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  openMapText: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    padding: 16,
    borderRadius: 8,
  },
  statusInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  hostActionsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#EBF5FF',
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    marginLeft: 6,
  },
  chatButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  chatButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  participantActionsContainer: {},
  capacityContainer: {
    marginBottom: 12,
  },
  capacityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  capacityBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
  },
  capacityBar: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  approvedActionsContainer: {
    flexDirection: 'row',
  },
  leaveButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginLeft: 8,
  },
  leaveButtonText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  },
  pendingButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
  },
  pendingButtonText: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
  },
  fullButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  fullButtonText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  joinButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  participantsList: {
    maxHeight: '60%',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  messageButton: {
    padding: 8,
    backgroundColor: '#EBF5FF',
    borderRadius: 20,
  },
  closeModalButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityDetailsScreen;