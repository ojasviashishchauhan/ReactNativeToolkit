import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Platform,
  Alert,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ActivityScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type Activity = {
  id: number;
  title: string;
  type: string;
  date: Date;
  location: string;
  participants: number;
  capacity: number;
  description: string;
  isHosting: boolean;
};

type Participant = {
  id: number;
  name: string;
  status: string;
  avatar: string;
};

const ActivityScreen = () => {
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedTab, setSelectedTab] = useState('hosting');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Edit activity state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [editLocation, setEditLocation] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [selectedTab]);

  const fetchActivities = () => {
    setRefreshing(true);
    
    // Simulating API call to fetch activities
    setTimeout(() => {
      // Sample data for hosting activities
      const hostingActivities = [
        {
          id: 1,
          title: 'Morning Yoga in the Park',
          type: 'Sports',
          date: new Date(2023, 4, 15, 8, 0),
          location: 'Central Park, New York',
          participants: 8,
          capacity: 15,
          description: 'Join us for a refreshing morning yoga session in Central Park. All levels welcome!',
          isHosting: true,
        },
        {
          id: 2,
          title: 'Tech Meetup: AI in Healthcare',
          type: 'Technology',
          date: new Date(2023, 4, 18, 18, 0),
          location: 'WeWork Times Square, New York',
          participants: 45,
          capacity: 100,
          description: 'Discussion on the latest applications of AI in healthcare with industry experts.',
          isHosting: true,
        },
      ];
      
      // Sample data for participating activities
      const participatingActivities = [
        {
          id: 3,
          title: 'Street Photography Walk',
          type: 'Arts',
          date: new Date(2023, 4, 14, 16, 30),
          location: 'Brooklyn Bridge, New York',
          participants: 12,
          capacity: 20,
          description: 'Capture the essence of NYC in this guided photography walk across the Brooklyn Bridge.',
          isHosting: false,
        },
        {
          id: 4,
          title: 'Coffee & Conversation',
          type: 'Social',
          date: new Date(2023, 4, 16, 10, 0),
          location: 'Blue Bottle Coffee, New York',
          participants: 5,
          capacity: 10,
          description: 'Casual meetup for coffee and interesting conversation. Topics range from books to current events.',
          isHosting: false,
        },
      ];
      
      if (selectedTab === 'hosting') {
        setActivities(hostingActivities);
      } else {
        setActivities(participatingActivities);
      }
      
      setRefreshing(false);
    }, 1000);
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

  const onRefresh = () => {
    fetchActivities();
  };

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity);
    
    // Fetch participants for this activity
    fetchParticipants(activity.id);
    
    setIsModalVisible(true);
    
    if (activity.isHosting) {
      // Set up edit fields with current values
      setEditTitle(activity.title);
      setEditDate(activity.date);
      setEditLocation(activity.location);
      setEditCapacity(activity.capacity.toString());
      setEditDescription(activity.description);
      setEditType(activity.type);
    }
  };

  const fetchParticipants = (activityId: number) => {
    // Simulating API call to fetch participants
    const mockParticipants = [
      {
        id: 1,
        name: 'John Doe',
        status: 'approved',
        avatar: 'https://source.unsplash.com/100x100/?portrait,man,1',
      },
      {
        id: 2,
        name: 'Jane Smith',
        status: 'approved',
        avatar: 'https://source.unsplash.com/100x100/?portrait,woman,1',
      },
      {
        id: 3,
        name: 'Alex Johnson',
        status: 'pending',
        avatar: 'https://source.unsplash.com/100x100/?portrait,person,1',
      },
      {
        id: 4,
        name: 'Sam Wilson',
        status: 'approved',
        avatar: 'https://source.unsplash.com/100x100/?portrait,man,2',
      },
    ];
    
    setParticipants(mockParticipants);
  };

  const handleParticipantAction = (participantId: number, action: string) => {
    // In a real app, this would make an API call
    const updatedParticipants = participants.map(p => {
      if (p.id === participantId) {
        return { ...p, status: action === 'approve' ? 'approved' : 'rejected' };
      }
      return p;
    });
    
    setParticipants(updatedParticipants);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={[styles.activityCard, { backgroundColor: colors.card }]}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <View style={[styles.typeTag, { backgroundColor: getActivityTypeColor(item.type) }]}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          {item.isHosting && (
            <View style={styles.hostBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.hostText}>Host</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.activityTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        
        <Text style={[styles.activityDate, { color: colors.text }]}>
          <Ionicons name="calendar-outline" size={14} /> {formatDate(item.date)}
        </Text>
        
        <Text style={[styles.activityLocation, { color: colors.text }]}>
          <Ionicons name="location-outline" size={14} /> {item.location}
        </Text>
        
        <View style={styles.activityFooter}>
          <View style={styles.participantsContainer}>
            <Ionicons name="people-outline" size={14} color={colors.text} />
            <Text style={[styles.participantsText, { color: colors.text }]}>
              {item.participants}/{item.capacity} joined
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.viewButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
          >
            <Text style={styles.viewButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityModal = () => {
    if (!selectedActivity) return null;
    
    return (
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          setEditMode(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editMode ? 'Edit Activity' : 'Activity Details'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsModalVisible(false);
                  setEditMode(false);
                }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {!editMode ? (
                // View mode
                <View style={styles.activityDetailsContainer}>
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
                  </Text>
                  
                  <View style={styles.detailsCapacity}>
                    <Ionicons name="people-outline" size={16} color={colors.text} />
                    <Text style={[styles.detailsCapacityText, { color: colors.text }]}>
                      {selectedActivity.participants}/{selectedActivity.capacity} participants
                    </Text>
                  </View>
                  
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                  <Text style={[styles.descriptionText, { color: colors.text }]}>
                    {selectedActivity.description}
                  </Text>
                  
                  {selectedActivity.isHosting && (
                    <>
                      <View style={styles.actionsContainer}>
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => setEditMode(true)}
                        >
                          <Ionicons name="create-outline" size={18} color="white" />
                          <Text style={styles.actionButtonText}>Edit Activity</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[styles.actionButton, { backgroundColor: colors.error }]}
                          onPress={() => {
                            Alert.alert(
                              'Cancel Activity',
                              'Are you sure you want to cancel this activity? This cannot be undone.',
                              [
                                { text: 'No', style: 'cancel' },
                                { 
                                  text: 'Yes, Cancel', 
                                  style: 'destructive',
                                  onPress: () => {
                                    // Handle cancellation in a real app
                                    setActivities(activities.filter(a => a.id !== selectedActivity.id));
                                    setIsModalVisible(false);
                                  }
                                }
                              ]
                            );
                          }}
                        >
                          <Ionicons name="close-circle-outline" size={18} color="white" />
                          <Text style={styles.actionButtonText}>Cancel Activity</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Participants</Text>
                      {participants.length > 0 ? (
                        participants.map((participant) => (
                          <View key={participant.id} style={[styles.participantItem, { borderBottomColor: colors.border }]}>
                            <View style={styles.participantInfo}>
                              <Text style={[styles.participantName, { color: colors.text }]}>
                                {participant.name}
                              </Text>
                              <View style={[
                                styles.statusBadge, 
                                { 
                                  backgroundColor: participant.status === 'approved' 
                                    ? colors.success + '20' 
                                    : colors.primary + '20' 
                                }
                              ]}>
                                <Text style={[
                                  styles.statusText,
                                  { 
                                    color: participant.status === 'approved' 
                                      ? colors.success 
                                      : colors.primary 
                                  }
                                ]}>
                                  {participant.status === 'approved' ? 'Approved' : 'Pending'}
                                </Text>
                              </View>
                            </View>
                            
                            {participant.status === 'pending' && (
                              <View style={styles.participantActions}>
                                <TouchableOpacity 
                                  style={[styles.participantAction, { backgroundColor: colors.success }]}
                                  onPress={() => handleParticipantAction(participant.id, 'approve')}
                                >
                                  <Ionicons name="checkmark" size={16} color="white" />
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                  style={[styles.participantAction, { backgroundColor: colors.error }]}
                                  onPress={() => handleParticipantAction(participant.id, 'reject')}
                                >
                                  <Ionicons name="close" size={16} color="white" />
                                </TouchableOpacity>
                              </View>
                            )}
                            
                            {participant.status === 'approved' && (
                              <TouchableOpacity 
                                style={[styles.participantAction, { backgroundColor: colors.error }]}
                                onPress={() => {
                                  Alert.alert(
                                    'Remove Participant',
                                    `Are you sure you want to remove ${participant.name} from this activity?`,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      { 
                                        text: 'Remove', 
                                        style: 'destructive',
                                        onPress: () => {
                                          // In a real app, make API call
                                          setParticipants(participants.filter(p => p.id !== participant.id));
                                        }
                                      }
                                    ]
                                  );
                                }}
                              >
                                <Ionicons name="person-remove" size={16} color="white" />
                              </TouchableOpacity>
                            )}
                          </View>
                        ))
                      ) : (
                        <Text style={[styles.emptyText, { color: colors.text }]}>
                          No participants yet
                        </Text>
                      )}
                    </>
                  )}
                  
                  {!selectedActivity.isHosting && (
                    <TouchableOpacity 
                      style={[styles.leaveButton, { backgroundColor: colors.error }]}
                      onPress={() => {
                        Alert.alert(
                          'Leave Activity',
                          'Are you sure you want to leave this activity?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Leave', 
                              style: 'destructive',
                              onPress: () => {
                                // Handle leaving in a real app
                                setActivities(activities.filter(a => a.id !== selectedActivity.id));
                                setIsModalVisible(false);
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="exit-outline" size={18} color="white" />
                      <Text style={styles.leaveButtonText}>Leave Activity</Text>
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                      style={[styles.detailsButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        setIsModalVisible(false);
                        navigation.navigate('ActivityDetail', { activityId: selectedActivity.id });
                      }}
                    >
                      <Text style={styles.detailsButtonText}>View Full Details</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.chatButton, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}
                      onPress={() => {
                        setIsModalVisible(false);
                        navigation.navigate('Chat', { activityId: selectedActivity.id });
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={18} color={colors.primary} />
                      <Text style={[styles.chatButtonText, { color: colors.primary }]}>Group Chat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Edit mode
                <View style={styles.editFormContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Title</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }]}
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="Activity title"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                  />
                  
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Date & Time</Text>
                  <TouchableOpacity
                    style={[styles.textInput, { backgroundColor: isDark ? colors.cardLight : '#F3F4F6' }]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: colors.text }}>{formatDate(editDate)}</Text>
                  </TouchableOpacity>
                  
                  {showDatePicker && (
                    <DateTimePicker
                      value={editDate}
                      mode="datetime"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setEditDate(selectedDate);
                        }
                      }}
                    />
                  )}
                  
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }]}
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="Activity location"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                  />
                  
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Capacity</Text>
                  <TextInput
                    style={[styles.textInput, { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }]}
                    value={editCapacity}
                    onChangeText={setEditCapacity}
                    placeholder="Maximum participants"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                    keyboardType="number-pad"
                  />
                  
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
                  <TextInput
                    style={[
                      styles.textInput, 
                      styles.textAreaInput, 
                      { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }
                    ]}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="Describe your activity"
                    placeholderTextColor={isDark ? colors.inactive : '#9CA3AF'}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity 
                      style={[styles.cancelButton, { borderColor: colors.border }]}
                      onPress={() => setEditMode(false)}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.saveButton, { backgroundColor: colors.primary }]}
                      onPress={() => {
                        // In a real app, make API call to update the activity
                        const updatedActivity = {
                          ...selectedActivity,
                          title: editTitle,
                          date: editDate,
                          location: editLocation,
                          capacity: parseInt(editCapacity, 10),
                          description: editDescription,
                        };
                        
                        // Update the activities list with the edited activity
                        setActivities(activities.map(a => 
                          a.id === selectedActivity.id ? updatedActivity : a
                        ));
                        
                        // Update the selected activity with the edited values
                        setSelectedActivity(updatedActivity);
                        
                        // Exit edit mode
                        setEditMode(false);
                      }}
                    >
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'hosting' && styles.tabButtonActive,
            selectedTab === 'hosting' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('hosting')}
        >
          <Ionicons 
            name="star" 
            size={18} 
            color={selectedTab === 'hosting' ? colors.primary : colors.inactive} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: selectedTab === 'hosting' ? colors.primary : colors.inactive }
            ]}
          >
            Hosting
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'participating' && styles.tabButtonActive,
            selectedTab === 'participating' && { borderBottomColor: colors.primary }
          ]}
          onPress={() => setSelectedTab('participating')}
        >
          <Ionicons 
            name="people" 
            size={18} 
            color={selectedTab === 'participating' ? colors.primary : colors.inactive} 
          />
          <Text 
            style={[
              styles.tabText, 
              { color: selectedTab === 'participating' ? colors.primary : colors.inactive }
            ]}
          >
            Participating
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerContainer}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My {selectedTab === 'hosting' ? 'Hosted' : 'Joined'} Activities
        </Text>
        {selectedTab === 'hosting' && (
          <TouchableOpacity
            style={[styles.createButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateActivity')}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create New</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.activitiesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={selectedTab === 'hosting' ? 'calendar-outline' : 'people-outline'} 
              size={60} 
              color={colors.inactive} 
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No {selectedTab === 'hosting' ? 'Hosted' : 'Joined'} Activities
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.inactive }]}>
              {selectedTab === 'hosting' 
                ? 'Create a new activity and start connecting with people!' 
                : 'Join activities to connect with like-minded people!'}
            </Text>
            {selectedTab === 'hosting' ? (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateActivity')}
              >
                <Text style={styles.emptyButtonText}>Create Activity</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.emptyButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('Map')}
              >
                <Text style={styles.emptyButtonText}>Find Activities</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {renderActivityModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  activitiesList: {
    padding: 16,
  },
  activityCard: {
    borderRadius: 12,
    marginBottom: 16,
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
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hostText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activityDate: {
    fontSize: 14,
    marginBottom: 6,
  },
  activityLocation: {
    fontSize: 14,
    marginBottom: 12,
  },
  activityFooter: {
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
    marginLeft: 6,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  emptyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    flex: 1,
  },
  activityDetailsContainer: {
    padding: 16,
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
    fontSize: 22,
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
  detailsCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  detailsCapacityText: {
    fontSize: 16,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  participantActions: {
    flexDirection: 'row',
  },
  participantAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonsContainer: {
    marginTop: 24,
  },
  detailsButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editFormContainer: {
    padding: 16,
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
    marginBottom: 16,
  },
  textAreaInput: {
    height: 100,
    paddingTop: 10,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginVertical: 12,
    textAlign: 'center',
  }
});

export default ActivityScreen;