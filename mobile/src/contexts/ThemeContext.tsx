import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName, useColorScheme as nativeUseColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { THEME_COLORS } from '../constants';
import { ThemeColors, ThemeType } from '../types';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const deviceTheme = nativeUseColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  const [isDark, setIsDark] = useState<boolean>(deviceTheme === 'dark');

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await SecureStore.getItemAsync('theme_preference');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
          setThemeState(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // Update isDark when theme changes
  useEffect(() => {
    const updateIsDark = () => {
      if (theme === 'system') {
        setIsDark(deviceTheme === 'dark');
      } else {
        setIsDark(theme === 'dark');
      }
    };

    updateIsDark();

    // Listen for system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        setIsDark(colorScheme === 'dark');
      }
    });

    return () => subscription.remove();
  }, [theme, deviceTheme]);

  // Save theme preference when it changes
  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await SecureStore.setItemAsync('theme_preference', newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine current colors based on isDark
  const colors = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, colors, setTheme }}>
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