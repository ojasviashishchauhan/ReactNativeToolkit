import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';
import ChatScreen from '../screens/ChatScreen';
import UserReviewsScreen from '../screens/UserReviewsScreen';

// Create navigators
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const TabNavigator = () => {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          // iOS-specific shadow
          shadowColor: isDark ? '#000' : '#888',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // Android-specific elevation
          elevation: 8,
          // More padding for iOS to match standard
          paddingBottom: Platform.OS === 'ios' ? 6 : 4,
          paddingTop: Platform.OS === 'ios' ? 10 : 4,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Main App Navigator with Authentication Flow
const AppNavigator: React.FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          shadowColor: colors.border,
          elevation: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {isAuthenticated ? (
        // Authenticated Stack
        <>
          <Stack.Screen 
            name="Main" 
            component={TabNavigator} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="ActivityDetail" 
            component={ActivityDetailScreen} 
            options={({ route }) => ({ 
              title: 'Activity Details',
              headerBackTitleVisible: false,
            })} 
          />
          <Stack.Screen 
            name="CreateActivity" 
            component={CreateActivityScreen} 
            options={{ 
              title: 'Create Activity',
              headerBackTitleVisible: false,
            }} 
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={({ route }) => ({ 
              title: route.params?.activityTitle || 'Chat',
              headerBackTitleVisible: false,
            })} 
          />
          <Stack.Screen 
            name="UserReviews" 
            component={UserReviewsScreen}
            options={{ 
              title: 'Reviews',
              headerBackTitleVisible: false,
            }} 
          />
        </>
      ) : (
        // Authentication Stack
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;