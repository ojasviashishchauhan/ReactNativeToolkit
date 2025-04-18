import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Theme type definitions
type ThemeMode = 'light' | 'dark' | 'system';
type ThemeContextType = {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ColorTheme;
  setThemeMode: (mode: ThemeMode) => void;
};

// Colors interface
interface ColorTheme {
  primary: string;
  accent: string;
  background: string;
  card: string;
  cardLight: string;
  text: string;
  border: string;
  inactive: string;
  error: string;
  success: string;
}

// Light theme colors
const lightColors: ColorTheme = {
  primary: '#2E7CF6',
  accent: '#4AC1A2',
  background: '#F9F9F9',
  card: '#FFFFFF',
  cardLight: '#F3F4F6',
  text: '#1A1C1E',
  border: '#E2E2E2',
  inactive: '#A1A1AA',
  error: '#EF4444',
  success: '#22C55E',
};

// Dark theme colors
const darkColors: ColorTheme = {
  primary: '#4E98FF',
  accent: '#4AC1A2',
  background: '#121212',
  card: '#1E1E1E',
  cardLight: '#2A2A2A',
  text: '#F9F9F9',
  border: '#333333',
  inactive: '#71717A',
  error: '#F87171',
  success: '#4ADE80',
};

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');

  // Load saved theme mode on mount
  useEffect(() => {
    loadThemeMode();
  }, []);

  // Update isDark when system color scheme or theme mode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  // Load theme mode from AsyncStorage
  const loadThemeMode = async () => {
    try {
      const savedThemeMode = await AsyncStorage.getItem('@theme_mode');
      if (savedThemeMode) {
        setThemeMode(savedThemeMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode', error);
    }
  };

  // Save theme mode to AsyncStorage
  const handleSetThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme mode', error);
    }
  };

  // Get current colors based on isDark
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode: handleSetThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};