import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { THEME_COLORS } from './constants';

// Keep splash screen visible while we check authentication
SplashScreen.preventAutoHideAsync();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const MainApp: React.FC = () => {
  const { isDark, colors } = useTheme();
  const [isAppReady, setIsAppReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication state and prepare the app
    const prepareApp = async () => {
      try {
        // Check for auth token to determine if user is logged in
        const token = await SecureStore.getItemAsync('auth_token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error preparing app:', error);
        setIsAuthenticated(false);
      } finally {
        setIsAppReady(true);
        // Hide splash screen once app is ready
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, []);

  if (!isAppReady) {
    // This will briefly show while we check authentication
    // before splash screen is hidden
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.notification,
        },
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator isAuthenticated={isAuthenticated === true} />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;