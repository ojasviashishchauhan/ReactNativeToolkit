import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import CreateActivityScreen from '../screens/CreateActivityScreen';
import { useTheme } from '../contexts/ThemeContext';

// Navigation Types
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  CreateActivity: undefined;
  ActivityDetail: { activityId: number };
  Chat: { activityId: number };
};

export type BottomTabParamList = {
  Home: undefined;
  Map: undefined;
  Activities: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Activities') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: colors.text,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: 'Connect',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{
          title: 'Explore',
        }}
      />
      <Tab.Screen 
        name="Activities" 
        component={ActivityScreen} 
        options={{
          title: 'My Activities',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isDark, colors } = useTheme();
  
  const customTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.notification,
    },
  };

  return (
    <NavigationContainer theme={customTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen 
          name="CreateActivity" 
          component={CreateActivityScreen} 
          options={{
            headerShown: true,
            title: 'Create Activity',
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen 
          name="ActivityDetail" 
          component={ActivityDetailScreen} 
          options={{
            headerShown: true,
            title: 'Activity Details',
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            headerTintColor: colors.primary,
          }}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{
            headerShown: true,
            title: 'Activity Chat',
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTitleStyle: {
              fontWeight: 'bold',
              color: colors.text,
            },
            headerTintColor: colors.primary,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;