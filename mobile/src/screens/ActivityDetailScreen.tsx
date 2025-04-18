import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ActivityDetailRouteProp = RouteProp<RootStackParamList, 'ActivityDetail'>;
type ActivityDetailNavigationProp = StackNavigationProp<RootStackParamList>;

type ActivityDetail = {
  id: number;
  title: string;
  type: string;
  date: Date;
  location: string;
  address: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  participants: number;
  capacity: number;
  description: string;
  hostId: number;
  hostName: string;
  hostAvatar: string;
  hostRating: number;
  isHosting: boolean;
  isParticipating: boolean;
  participationStatus: 'approved' | 'pending' | 'rejected' | null;
};

type Participant = {
  id: number;
  name: string;
  avatar: string;
  status: 'approved' | 'pending' | 'rejected';
};

const ActivityDetailScreen = () => {
  const route = useRoute<ActivityDetailRouteProp>();
  const navigation = useNavigation<ActivityDetailNavigationProp>();
  const { colors, isDark } = useTheme();
  
  const { activityId } = route.params;
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  
  useEffect(() => {
    fetchActivityDetails();
  }, [activityId]);
  
  const fetchActivityDetails = () => {
    // Simulating API call to fetch activity details
    setTimeout(() => {
      // Sample data - would be replaced with actual API call
      const mockActivity = {
        id: activityId,
        title: 'Morning Yoga in the Park',
        type: 'Sports',
        date: new Date(2023, 4, 15, 8, 0),
        location: 'Central Park',
        address: 'Central Park, New York, NY 10022',
        coordinate: {
          latitude: 40.7812,
          longitude: -73.9665,
        },
        participants: 8,
        capacity: 15,
        description: 'Join us for a refreshing morning yoga session in Central Park. We\'ll focus on gentle stretches and meditation techniques to start your day with positive energy. Please bring your own yoga mat and water bottle.',
        hostId: 1,
        hostName: 'Alex Johnson',
        hostAvatar: 'https://source.unsplash.com/random/100x100/?portrait',
        hostRating: 4.8,
        isHosting: true,
        isParticipating: true,
        participationStatus: 'approved',
      };
      
      setActivity(mockActivity);
      
      // Fetch participants
      fetchParticipants(activityId);
      
      setLoading(false);
    }, 1000);
  };
  
  const fetchParticipants = (activityId: number) => {
    // Simulating API call to fetch participants
    const mockParticipants = [
      {
        id: 1,
        name: 'Alex Johnson',
        avatar: 'https://source.unsplash.com/random/100x100/?portrait',
        status: 'approved' as const,
      },
      {
        id: 2,
        name: 'Jane Smith',
        avatar: 'https://source.unsplash.com/random/100x100/?woman',
        status: 'approved' as const,
      },
      {
        id: 3,
        name: 'Mike Wilson',
        avatar: 'https://source.unsplash.com/random/100x100/?man',
        status: 'approved' as const,
      },
      {
        id: 4,
        name: 'Sarah Davis',
        avatar: 'https://source.unsplash.com/random/100x100/?girl',
        status: 'pending' as const,
      },
      {
        id: 5,
        name: 'Chris Martin',
        avatar: 'https://source.unsplash.com/random/100x100/?boy',
        status: 'pending' as const,
      },
    ];
    
    setParticipants(mockParticipants);
  };
  
  const handleJoinActivity = () => {
    if (!activity) return;
    
    // Simulating API call to join activity
    Alert.alert(
      'Join Activity',
      'Are you sure you want to join this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Join', 
          onPress: () => {
            // In a real app, make API call
            setActivity({
              ...activity,
              isParticipating: true,
              participationStatus: 'pending',
              participants: activity.participants + 1,
            });
            
            // Show confirmation
            Alert.alert(
              'Request Sent',
              'Your request to join this activity has been sent to the host for approval.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };
  
  const handleLeaveActivity = () => {
    if (!activity) return;
    
    // Simulating API call to leave activity
    Alert.alert(
      'Leave Activity',
      'Are you sure you want to leave this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: () => {
            // In a real app, make API call
            setActivity({
              ...activity,
              isParticipating: false,
              participationStatus: null,
              participants: activity.participants - 1,
            });
          }
        }
      ]
    );
  };
  
  const handleChatPress = () => {
    if (!activity) return;
    
    navigation.navigate('Chat', { activityId: activity.id });
  };
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };
  
  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return date.toLocaleTimeString('en-US', options);
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
  
  const renderParticipantItem = (participant: Participant) => (
    <View key={participant.id} style={[styles.participantItem, { borderBottomColor: colors.border }]}>
      <View style={styles.participantInfo}>
        <Image source={{ uri: participant.avatar }} style={styles.participantAvatar} />
        <View>
          <Text style={[styles.participantName, { color: colors.text }]}>
            {participant.name}
          </Text>
          {participant.status === 'pending' && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.statusText, { color: colors.primary }]}>
                Pending Approval
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {activity?.isHosting && participant.status === 'pending' && (
        <View style={styles.participantActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => {
              // In a real app, make API call to approve participant
              // Update local state for immediate UI update
              const updatedParticipants = participants.map(p => 
                p.id === participant.id ? { ...p, status: 'approved' as const } : p
              );
              setParticipants(updatedParticipants);
            }}
          >
            <Ionicons name="checkmark" size={16} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.error, marginLeft: 8 }]}
            onPress={() => {
              // In a real app, make API call to reject participant
              // Update local state for immediate UI update
              const updatedParticipants = participants.map(p => 
                p.id === participant.id ? { ...p, status: 'rejected' as const } : p
              );
              setParticipants(updatedParticipants.filter(p => p.status !== 'rejected'));
            }}
          >
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  const renderParticipantsModal = () => (
    <Modal
      visible={showParticipantsModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowParticipantsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Participants ({participants.filter(p => p.status === 'approved').length}/{activity?.capacity})
            </Text>
            <TouchableOpacity onPress={() => setShowParticipantsModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {participants.map(renderParticipantItem)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  if (loading || !activity) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading activity details...
        </Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: colors.background }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(activity.type) }]}>
              <Text style={styles.typeText}>{activity.type}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activity.title}
          </Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatDate(activity.date)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {formatTime(activity.date)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {activity.location}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.infoItem}
              onPress={() => setShowParticipantsModal(true)}
            >
              <Ionicons name="people-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>
                {activity.participants}/{activity.capacity} participants
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.inactive} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
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
                title={activity.title}
                description={activity.location}
              >
                <View style={[styles.markerContainer, { backgroundColor: getActivityTypeColor(activity.type) }]}>
                  <Ionicons
                    name={activity.type === 'Sports' ? 'basketball-outline' : 'pin'}
                    size={18}
                    color="white"
                  />
                </View>
              </Marker>
            </MapView>
            
            <TouchableOpacity
              style={[styles.directionsButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Open maps app with directions in a real app
                Alert.alert('Get Directions', 'This would open maps with directions in a real app');
              }}
            >
              <Ionicons name="navigate-outline" size={16} color="white" />
              <Text style={styles.directionsButtonText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About This Activity</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {activity.description}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Host</Text>
            <View style={styles.hostContainer}>
              <Image source={{ uri: activity.hostAvatar }} style={styles.hostAvatar} />
              <View style={styles.hostInfo}>
                <Text style={[styles.hostName, { color: colors.text }]}>
                  {activity.hostName}
                </Text>
                <View style={styles.ratingContainer}>
                  {renderStars(activity.hostRating)}
                  <Text style={[styles.ratingText, { color: colors.text }]}>
                    {activity.hostRating.toFixed(1)}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.viewProfileButton, { borderColor: colors.primary }]}
                onPress={() => {
                  // Navigate to host profile in a real app
                  Alert.alert('View Profile', 'This would navigate to the host profile in a real app');
                }}
              >
                <Text style={[styles.viewProfileText, { color: colors.primary }]}>
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {activity.isHosting ? (
          <View style={styles.hostingButtons}>
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // Navigate to edit screen in a real app
                Alert.alert('Edit Activity', 'This would navigate to the edit screen in a real app');
              }}
            >
              <Ionicons name="create-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Edit Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.chatButton, { backgroundColor: colors.accent }]}
              onPress={handleChatPress}
            >
              <Ionicons name="chatbubble-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Group Chat</Text>
            </TouchableOpacity>
          </View>
        ) : activity.isParticipating ? (
          <View style={styles.participatingButtons}>
            {activity.participationStatus === 'pending' ? (
              <View style={styles.pendingContainer}>
                <Ionicons name="time-outline" size={18} color={colors.primary} />
                <Text style={[styles.pendingText, { color: colors.primary }]}>
                  Pending Approval
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[styles.chatButton, { backgroundColor: colors.accent }]}
                onPress={handleChatPress}
              >
                <Ionicons name="chatbubble-outline" size={18} color="white" />
                <Text style={styles.buttonText}>Group Chat</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.leaveButton, { backgroundColor: colors.error }]}
              onPress={handleLeaveActivity}
            >
              <Ionicons name="exit-outline" size={18} color="white" />
              <Text style={styles.buttonText}>Leave Activity</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[
              styles.joinButton, 
              { backgroundColor: colors.primary },
              activity.participants >= activity.capacity && { 
                backgroundColor: colors.inactive,
                opacity: 0.7,
              }
            ]}
            onPress={handleJoinActivity}
            disabled={activity.participants >= activity.capacity}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.joinButtonText}>
              {activity.participants >= activity.capacity ? 'Activity Full' : 'Join Activity'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {renderParticipantsModal()}
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
    width: '100%',
    height: 200,
    backgroundColor: '#E0E0E0',
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  mapContainer: {
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
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
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
  },
  viewProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  hostingButtons: {
    flexDirection: 'row',
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  participatingButtons: {
    flexDirection: 'row',
  },
  pendingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pendingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  leaveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  joinButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  modalScrollView: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  participantActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActivityDetailScreen;