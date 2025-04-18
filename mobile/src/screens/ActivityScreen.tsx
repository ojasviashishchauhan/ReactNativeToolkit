import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Sample activities data - this would come from an API
const MY_ACTIVITIES = [
  {
    id: 1,
    title: 'Morning Yoga in the Park',
    type: 'Sports',
    date: new Date(Date.now() + 86400000), // tomorrow
    location: 'Central Park',
    participants: 4,
    capacity: 10,
    description: 'Join us for a refreshing morning yoga session in the park. All levels welcome!',
    isHosting: true
  },
  {
    id: 3,
    title: 'Board Games Night',
    type: 'Social',
    date: new Date(Date.now() + 259200000), // 3 days from now
    location: 'The Game Café',
    participants: 12,
    capacity: 20,
    description: 'Come enjoy a night of board games, snacks, and good company.',
    isHosting: false
  },
];

// Sample data for participants
const PARTICIPANTS = [
  { id: 1, name: 'Jane Smith', status: 'approved', avatar: 'https://via.placeholder.com/50' },
  { id: 2, name: 'John Doe', status: 'approved', avatar: 'https://via.placeholder.com/50' },
  { id: 3, name: 'Alice Johnson', status: 'pending', avatar: 'https://via.placeholder.com/50' },
  { id: 4, name: 'Bob Brown', status: 'approved', avatar: 'https://via.placeholder.com/50' },
  { id: 5, name: 'Carol White', status: 'approved', avatar: 'https://via.placeholder.com/50' },
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

const ActivityScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hosting');
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    date: new Date(),
    capacity: '',
    description: '',
    isActive: true
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [participants, setParticipants] = useState([]);

  // Load activities
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(MY_ACTIVITIES);
      setLoading(false);
    }, 1000);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setActivities(MY_ACTIVITIES);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetails', { activityId: activity.id });
  };

  const toggleEditModal = (activity = null) => {
    if (activity) {
      setSelectedActivity(activity);
      setEditForm({
        title: activity.title,
        location: activity.location,
        date: activity.date,
        capacity: activity.capacity.toString(),
        description: activity.description || '',
        isActive: true
      });
      setIsEditModalVisible(true);
    } else {
      setIsEditModalVisible(false);
    }
  };

  const handleEditSubmit = () => {
    // Simulate API call to update activity
    const updatedActivities = activities.map(act => 
      act.id === selectedActivity.id 
      ? { 
          ...act, 
          title: editForm.title,
          location: editForm.location,
          date: editForm.date,
          capacity: parseInt(editForm.capacity),
          description: editForm.description,
          isActive: editForm.isActive 
        } 
      : act
    );
    
    setActivities(updatedActivities);
    setIsEditModalVisible(false);
    
    Alert.alert('Success', 'Activity updated successfully');
  };

  const handleCancelActivity = (activity) => {
    Alert.alert(
      'Cancel Activity',
      'Are you sure you want to cancel this activity? This will notify all participants.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            // Simulate API call to cancel activity
            const updatedActivities = activities.filter(act => act.id !== activity.id);
            setActivities(updatedActivities);
            Alert.alert('Success', 'Activity cancelled successfully');
          }
        }
      ]
    );
  };

  const toggleParticipantsModal = (activity = null) => {
    if (activity) {
      setSelectedActivity(activity);
      // Simulate API call to get participants
      setTimeout(() => {
        setParticipants(PARTICIPANTS);
        setIsParticipantsModalVisible(true);
      }, 300);
    } else {
      setIsParticipantsModalVisible(false);
    }
  };

  const handleParticipantAction = (participantId, action) => {
    // Simulate API call to update participant status
    const updatedParticipants = participants.map(p => 
      p.id === participantId
      ? { ...p, status: action === 'approve' ? 'approved' : 'rejected' }
      : p
    );
    setParticipants(updatedParticipants);
    
    Alert.alert('Success', `Participant ${action === 'approve' ? 'approved' : 'removed'}`);
  };

  const filteredActivities = activities.filter(activity => 
    activeTab === 'hosting' ? activity.isHosting : !activity.isHosting
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Activities</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hosting' && styles.activeTab]} 
          onPress={() => setActiveTab('hosting')}
        >
          <Text style={[styles.tabText, activeTab === 'hosting' && styles.activeTabText]}>Hosting</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'participating' && styles.activeTab]} 
          onPress={() => setActiveTab('participating')}
        >
          <Text style={[styles.tabText, activeTab === 'participating' && styles.activeTabText]}>Participating</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <TouchableOpacity onPress={() => handleActivityPress(activity)}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={[styles.activityTag, { backgroundColor: getTagColor(activity.type) }]}>
                    <Text style={styles.activityTagText}>{activity.type}</Text>
                  </View>
                </View>
                
                <View style={styles.activityDetails}>
                  <View style={styles.activityDetail}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.activityDetailText}>{formatDate(activity.date)}</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.activityDetailText}>{activity.location}</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.activityDetailText}>{activity.participants}/{activity.capacity} participants</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {activity.isHosting && (
                <View style={styles.hostActions}>
                  <TouchableOpacity 
                    style={[styles.hostButton, styles.editButton]}
                    onPress={() => toggleEditModal(activity)}
                  >
                    <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.hostButton, styles.participantsButton]}
                    onPress={() => toggleParticipantsModal(activity)}
                  >
                    <Ionicons name="people-outline" size={20} color="#4CAF50" />
                    <Text style={styles.participantsButtonText}>Participants</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.hostButton, styles.cancelButton]}
                    onPress={() => handleCancelActivity(activity)}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#FF5252" />
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name={activeTab === 'hosting' ? 'calendar-outline' : 'person-outline'} size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No activities found</Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'hosting' 
                ? "You're not hosting any activities yet." 
                : "You haven't joined any activities yet."}
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>
                {activeTab === 'hosting' ? 'Create Activity' : 'Find Activities'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Edit Activity Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleEditModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Activity</Text>
              <TouchableOpacity onPress={() => toggleEditModal()}>
                <Ionicons name="close-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.title}
                  onChangeText={(text) => setEditForm({...editForm, title: text})}
                  placeholder="Activity title"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                  placeholder="Location"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date & Time</Text>
                <TouchableOpacity 
                  style={styles.formInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text>{formatDate(editForm.date)}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={editForm.date}
                    mode="datetime"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        setEditForm({...editForm, date: selectedDate});
                      }
                    }}
                  />
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Capacity</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.capacity}
                  onChangeText={(text) => setEditForm({...editForm, capacity: text})}
                  placeholder="Maximum participants"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, { height: 100, textAlignVertical: 'top' }]}
                  value={editForm.description}
                  onChangeText={(text) => setEditForm({...editForm, description: text})}
                  placeholder="Activity description"
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Active</Text>
                <View style={styles.switchContainer}>
                  <Switch
                    value={editForm.isActive}
                    onValueChange={(value) => setEditForm({...editForm, isActive: value})}
                    trackColor={{ false: "#ccc", true: "#3b82f6" }}
                    thumbColor={editForm.isActive ? "#fff" : "#f4f3f4"}
                  />
                  <Text style={styles.switchLabel}>
                    {editForm.isActive ? 'Activity is visible and open to join' : 'Activity is hidden and closed'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleEditSubmit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Participants Modal */}
      <Modal
        visible={isParticipantsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleParticipantsModal()}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Participants</Text>
              <TouchableOpacity onPress={() => toggleParticipantsModal()}>
                <Ionicons name="close-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.participantsStats}>
              <View style={styles.participantsStat}>
                <Text style={styles.participantsStatNumber}>{participants.filter(p => p.status === 'approved').length}</Text>
                <Text style={styles.participantsStatLabel}>Approved</Text>
              </View>
              <View style={styles.participantsStat}>
                <Text style={styles.participantsStatNumber}>{participants.filter(p => p.status === 'pending').length}</Text>
                <Text style={styles.participantsStatLabel}>Pending</Text>
              </View>
              <View style={styles.participantsStat}>
                <Text style={styles.participantsStatNumber}>{selectedActivity?.capacity || 0}</Text>
                <Text style={styles.participantsStatLabel}>Capacity</Text>
              </View>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {participants.map((participant) => (
                <View key={participant.id} style={styles.participantItem}>
                  <View style={styles.participantInfo}>
                    <TouchableOpacity>
                      <Ionicons name="person-circle-outline" size={40} color="#666" />
                    </TouchableOpacity>
                    <View style={styles.participantDetails}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      <View style={styles.participantStatus}>
                        <View 
                          style={[
                            styles.statusDot, 
                            { backgroundColor: participant.status === 'approved' ? '#4CAF50' : '#FF9800' }
                          ]} 
                        />
                        <Text style={styles.statusText}>
                          {participant.status === 'approved' ? 'Approved' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.participantActions}>
                    {participant.status === 'pending' ? (
                      <TouchableOpacity 
                        style={styles.approveButton}
                        onPress={() => handleParticipantAction(participant.id, 'approve')}
                      >
                        <Ionicons name="checkmark-outline" size={20} color="#4CAF50" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.messageButton}
                        onPress={() => navigation.navigate('Chat', { participantId: participant.id })}
                      >
                        <Ionicons name="chatbubble-outline" size={20} color="#3b82f6" />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleParticipantAction(participant.id, 'remove')}
                    >
                      <Ionicons name="close-outline" size={20} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => toggleParticipantsModal()}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  activityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activityTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityDetails: {
    marginBottom: 16,
  },
  activityDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  activityDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  hostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  hostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#EBF5FF',
  },
  editButtonText: {
    color: '#3b82f6',
    marginLeft: 4,
    fontWeight: '500',
  },
  participantsButton: {
    backgroundColor: '#E8F5E9',
  },
  participantsButtonText: {
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    color: '#FF5252',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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
  modalScrollView: {
    maxHeight: '70%',
  },
  formGroup: {
    marginTop: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  participantsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  participantsStat: {
    alignItems: 'center',
  },
  participantsStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  participantsStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  participantDetails: {
    marginLeft: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  participantActions: {
    flexDirection: 'row',
  },
  approveButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
  messageButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#EBF5FF',
    borderRadius: 20,
  },
  removeButton: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 20,
  },
  doneButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActivityScreen;