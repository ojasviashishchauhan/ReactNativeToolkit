import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Import screens
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import ActivityScreen from './screens/ActivityScreen';
import AuthScreen from './screens/AuthScreen';
import MessagesScreen from './screens/MessagesScreen';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen';
import ChatScreen from './screens/ChatScreen';

// Create navigation
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const queryClient = new QueryClient();

// Authentication stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Auth" component={AuthScreen} />
  </Stack.Navigator>
);

// Main app stack with tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Map') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'Activities') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        } else if (route.name === 'Messages') {
          iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: 'gray',
      tabBarStyle: { 
        height: 60,
        paddingBottom: 5,
        paddingTop: 5,
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Activities" component={ActivityScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Root navigator with auth check
const RootNavigator = () => {
  // Use state for authentication status
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  // We'd normally check authentication status here
  React.useEffect(() => {
    // Check authentication status
    // For now, we'll just simulate being logged in
    setIsAuthenticated(false);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      ) : (
        <Stack.Screen name="MainApp" component={MainTabs} />
      )}
      <Stack.Screen 
        name="ActivityDetails" 
        component={ActivityDetailsScreen} 
        options={{ headerShown: true, title: 'Activity Details' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ headerShown: true, title: 'Chat' }}
      />
    </Stack.Navigator>
  );
};

// Main app stack with themed navigation
const AppWithTheme = () => {
  const { isDark } = useTheme();
  
  return (
    <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </QueryClientProvider>
  );
}