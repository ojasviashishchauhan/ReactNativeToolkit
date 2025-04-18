import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../contexts/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type CreateActivityNavigationProp = StackNavigationProp<RootStackParamList>;

const activityTypes = [
  { id: 'sports', label: 'Sports', icon: 'basketball-outline' },
  { id: 'arts', label: 'Arts', icon: 'color-palette-outline' },
  { id: 'social', label: 'Social', icon: 'people-outline' },
  { id: 'education', label: 'Education', icon: 'school-outline' },
  { id: 'food', label: 'Food', icon: 'restaurant-outline' },
  { id: 'music', label: 'Music', icon: 'musical-notes-outline' },
  { id: 'technology', label: 'Technology', icon: 'hardware-chip-outline' },
  { id: 'outdoors', label: 'Outdoors', icon: 'leaf-outline' },
];

const CreateActivityScreen = () => {
  const navigation = useNavigation<CreateActivityNavigationProp>();
  const { colors, isDark } = useTheme();
  
  // Activity form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  
  // Map and location state
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [activityLocation, setActivityLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [showMap, setShowMap] = useState(false);
  
  // UI state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    getUserLocation();
  }, []);
  
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Please allow location access to create activities in your area.'
      );
      return;
    }
    
    try {
      let location = await Location.getCurrentPositionAsync({});
      const userLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userLocation);
      setRegion({
        ...region,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'There was an error getting your location. Please try again.'
      );
    }
  };
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    
    // Only update the date part, keep the time as is
    const newDate = new Date(date);
    newDate.setFullYear(currentDate.getFullYear());
    newDate.setMonth(currentDate.getMonth());
    newDate.setDate(currentDate.getDate());
    
    setDate(newDate);
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(Platform.OS === 'ios');
    
    // Only update the time part, keep the date as is
    const newDate = new Date(date);
    newDate.setHours(currentTime.getHours());
    newDate.setMinutes(currentTime.getMinutes());
    
    setDate(newDate);
  };
  
  const handleMapPress = (e: any) => {
    setActivityLocation(e.nativeEvent.coordinate);
  };
  
  const handleSelectLocation = () => {
    if (activityLocation) {
      // In a real app, you would use reverse geocoding to get the address from the coordinates
      setAddress(`Selected location at ${activityLocation.latitude.toFixed(6)}, ${activityLocation.longitude.toFixed(6)}`);
      setShowMap(false);
    } else {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location for your activity.');
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const handleCreateActivity = () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your activity.');
      return;
    }
    
    if (!type) {
      Alert.alert('Missing Information', 'Please select an activity type.');
      return;
    }
    
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please enter a location name.');
      return;
    }
    
    if (!address.trim()) {
      Alert.alert('Missing Information', 'Please select a location on the map.');
      return;
    }
    
    if (!capacity.trim() || isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      Alert.alert('Invalid Capacity', 'Please enter a valid capacity (number greater than 0).');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please enter a description for your activity.');
      return;
    }
    
    // Submit form
    setLoading(true);
    
    // Simulating API request
    setTimeout(() => {
      setLoading(false);
      
      // Show success and navigate back
      Alert.alert(
        'Activity Created!',
        'Your activity has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1500);
  };
  
  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Activity Type
            </Text>
            <TouchableOpacity onPress={() => setShowTypeModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.typeList}>
            {activityTypes.map((activityType) => (
              <TouchableOpacity
                key={activityType.id}
                style={[
                  styles.typeItem,
                  type === activityType.label && styles.typeItemSelected,
                  type === activityType.label && { backgroundColor: colors.primary + '20' },
                  { borderBottomColor: colors.border }
                ]}
                onPress={() => {
                  setType(activityType.label);
                  setShowTypeModal(false);
                }}
              >
                <View style={styles.typeItemContent}>
                  <Ionicons 
                    name={activityType.icon as any} 
                    size={24} 
                    color={type === activityType.label ? colors.primary : colors.text} 
                  />
                  <Text 
                    style={[
                      styles.typeItemText, 
                      { 
                        color: type === activityType.label ? colors.primary : colors.text,
                        fontWeight: type === activityType.label ? 'bold' : 'normal'
                      }
                    ]}
                  >
                    {activityType.label}
                  </Text>
                </View>
                {type === activityType.label && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderLocationModal = () => (
    <Modal
      visible={showMap}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Location
            </Text>
            <TouchableOpacity onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion}
              onPress={handleMapPress}
              showsUserLocation
            >
              {activityLocation && (
                <Marker coordinate={activityLocation} />
              )}
            </MapView>
            
            {userLocation && (
              <TouchableOpacity
                style={[styles.recenterButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  setRegion({
                    ...region,
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  });
                }}
              >
                <Ionicons name="locate" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.mapActions}>
            <TouchableOpacity
              style={[styles.cancelMapButton, { borderColor: colors.border }]}
              onPress={() => setShowMap(false)}
            >
              <Text style={[styles.cancelMapButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.selectLocationButton, 
                { backgroundColor: colors.primary },
                !activityLocation && { opacity: 0.5 }
              ]}
              onPress={handleSelectLocation}
              disabled={!activityLocation}
            >
              <Text style={styles.selectLocationButtonText}>
                Select Location
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Activity Details
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }
                ]}
                placeholder="Activity title"
                placeholderTextColor={colors.inactive}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Activity Type
              </Text>
              <TouchableOpacity
                style={[
                  styles.selectInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6' }
                ]}
                onPress={() => setShowTypeModal(true)}
              >
                {type ? (
                  <View style={styles.selectedType}>
                    <Ionicons
                      name={activityTypes.find(t => t.label === type)?.icon as any || 'help-circle-outline'}
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={[styles.selectedTypeText, { color: colors.text }]}>
                      {type}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.inactive }]}>
                    Select activity type
                  </Text>
                )}
                <Ionicons name="chevron-down" size={20} color={colors.inactive} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateInputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Date
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeInput,
                    { backgroundColor: isDark ? colors.cardLight : '#F3F4F6' }
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {formatDate(date)}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.timeInputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Time
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dateTimeInput,
                    { backgroundColor: isDark ? colors.cardLight : '#F3F4F6' }
                  ]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {formatTime(date)}
                  </Text>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={date}
                mode={showDatePicker ? 'date' : 'time'}
                display="default"
                onChange={showDatePicker ? handleDateChange : handleTimeChange}
                minimumDate={new Date()}
              />
            )}
            
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
              Location
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Location Name
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }
                ]}
                placeholder="Location name (e.g. Central Park)"
                placeholderTextColor={colors.inactive}
                value={location}
                onChangeText={setLocation}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Address
              </Text>
              <TouchableOpacity
                style={[
                  styles.mapSelectInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6' }
                ]}
                onPress={() => setShowMap(true)}
              >
                {address ? (
                  <Text 
                    style={[styles.addressText, { color: colors.text }]} 
                    numberOfLines={2}
                  >
                    {address}
                  </Text>
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.inactive }]}>
                    Select location on map
                  </Text>
                )}
                <Ionicons name="map-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16 }]}>
              Additional Details
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Capacity
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }
                ]}
                placeholder="Maximum number of participants"
                placeholderTextColor={colors.inactive}
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textAreaInput,
                  { backgroundColor: isDark ? colors.cardLight : '#F3F4F6', color: colors.text }
                ]}
                placeholder="Describe your activity, what participants should expect, and what they should bring"
                placeholderTextColor={colors.inactive}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: colors.text }]}>
                  Private Activity
                </Text>
                <Text style={[styles.switchDescription, { color: colors.inactive }]}>
                  Only visible to people you invite directly
                </Text>
              </View>
              <Switch
                trackColor={{ false: colors.border, true: `${colors.primary}80` }}
                thumbColor={isPrivate ? colors.primary : '#f4f3f4'}
                ios_backgroundColor={colors.border}
                onValueChange={setIsPrivate}
                value={isPrivate}
              />
            </View>
            
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 }
              ]}
              onPress={handleCreateActivity}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>
                  Create Activity
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {renderTypeModal()}
      {renderLocationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
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
  },
  textAreaInput: {
    minHeight: 120,
    paddingTop: 12,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 48,
  },
  selectedType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedTypeText: {
    fontSize: 16,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 3,
    marginRight: 8,
  },
  timeInputContainer: {
    flex: 2,
    marginLeft: 8,
  },
  dateTimeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 48,
  },
  dateTimeText: {
    fontSize: 16,
  },
  mapSelectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  addressText: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
  },
  createButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  typeList: {
    flex: 1,
  },
  typeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  typeItemSelected: {
    borderRadius: 8,
  },
  typeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  mapContainer: {
    flex: 1,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 16,
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
  mapActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  cancelMapButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelMapButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectLocationButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectLocationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreateActivityScreen;