import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: string;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    accent: string;
    success: string;
    error: string;
    inactive: string;
    cardLight: string;
  };
}

const lightColors = {
  primary: '#3B82F6',
  background: '#F9FAFB',
  card: '#FFFFFF',
  text: '#1F2937',
  border: '#E5E7EB',
  notification: '#EF4444',
  accent: '#8B5CF6',
  success: '#10B981',
  error: '#EF4444',
  inactive: '#9CA3AF',
  cardLight: '#F3F4F6',
};

const darkColors = {
  primary: '#3B82F6',
  background: '#121212',
  card: '#1E1E1E',
  text: '#F9FAFB',
  border: '#374151',
  notification: '#EF4444',
  accent: '#8B5CF6',
  success: '#10B981',
  error: '#EF4444',
  inactive: '#6B7280',
  cardLight: '#262626',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('@theme_mode');
        if (savedThemeMode) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }
      } catch (e) {
        console.error('Failed to load theme preference:', e);
      }
    };
    
    loadThemePreference();
  }, []);
  
  // Save theme preference when it changes
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('@theme_mode', mode);
      setThemeModeState(mode);
    } catch (e) {
      console.error('Failed to save theme preference:', e);
    }
  };

  // Determine if we should use dark mode
  const isDark = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark');

  // Get the appropriate color scheme based on theme
  const colors = isDark ? darkColors : lightColors;
  
  const theme = isDark ? 'dark' : 'light';

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        themeMode, 
        isDark, 
        setThemeMode, 
        colors 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};