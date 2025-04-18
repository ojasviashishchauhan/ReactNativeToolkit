// App Constants
export const APP_NAME = 'Connect';
export const APP_VERSION = '1.0.0';

// Theme/Colors
export const THEME_COLORS = {
  light: {
    primary: '#2E7CF6',
    background: '#F9F9F9',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: '#E0E0E0',
    notification: '#FF3B30',
    inactive: '#8A8A8E',
    success: '#34C759',
    warning: '#FFCC00',
    error: '#FF3B30',
  },
  dark: {
    primary: '#2E7CF6',
    background: '#1A1A1A',
    card: '#2C2C2E',
    text: '#FFFFFF',
    border: '#3A3A3C',
    notification: '#FF453A',
    inactive: '#8A8A8E',
    success: '#30D158',
    warning: '#FFD60A',
    error: '#FF453A',
  },
};

// Activity type colors and icons
export const ACTIVITY_TYPE_COLORS = {
  Sports: '#4CAF50',
  Arts: '#9C27B0',
  Social: '#2196F3',
  Education: '#FF9800',
  Food: '#F44336',
  Music: '#E91E63',
  Technology: '#00BCD4',
  Outdoors: '#8BC34A',
};

export const ACTIVITY_TYPE_ICONS = {
  Sports: 'basketball-outline',
  Arts: 'color-palette-outline',
  Social: 'people-outline',
  Education: 'school-outline',
  Food: 'restaurant-outline',
  Music: 'musical-notes-outline',
  Technology: 'hardware-chip-outline',
  Outdoors: 'leaf-outline',
};

// Defaults
export const DEFAULT_RADIUS_KM = 10;
export const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
};

// Pagination
export const PAGE_SIZE = 20;

// Animation Durations
export const ANIMATION_DURATION = 300;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_PREFERENCE: 'theme_preference',
  LAST_LOCATION: 'last_location',
  ONBOARDING_COMPLETED: 'onboarding_completed',
};

// API Error Messages
export const ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your internet connection.',
  AUTH_FAILED: 'Authentication failed. Please log in again.',
  SERVER: 'Server error. Our team has been notified.',
  NOT_FOUND: 'Resource not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  LOCATION_REQUIRED: 'Location access is required to find nearby activities.',
};

// Rate Limiting
export const API_RATE_LIMIT = {
  // In milliseconds
  DEFAULT: 1000, // 1 second between API calls
  GEOLOCATION: 5000, // 5 seconds between location updates
};

// Platform specific adjustments
export const PLATFORM_ADJUSTMENTS = {
  // Adjust these based on platform differences
  HEADER_HEIGHT: { ios: 44, android: 56 },
  BOTTOM_TAB_HEIGHT: { ios: 49, android: 56 },
  SAFE_AREA_INSET: { ios: true, android: false },
};