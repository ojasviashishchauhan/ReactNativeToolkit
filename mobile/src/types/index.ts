// Common types used throughout the application

// Navigation parameter types
export type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Profile: { userId: number } | undefined;
  ActivityDetail: { activityId: number };
  CreateActivity: undefined;
  EditActivity: { activityId: number };
  Chat: { activityId: number; activityTitle: string };
  Auth: undefined;
  UserReviews: { userId: number };
};

// Activity type constants
export const ACTIVITY_TYPES = [
  'Sports',
  'Arts',
  'Social',
  'Education',
  'Food',
  'Music',
  'Technology',
  'Outdoors'
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];

// Theme related types
export type ThemeType = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  inactive: string;
  success: string;
  warning: string;
  error: string;
}

// API error format
export interface ApiError {
  message: string;
  errors?: { [key: string]: string[] };
  statusCode?: number;
}

// Participant status
export type ParticipantStatus = 'pending' | 'approved' | 'rejected';

// Location type
export interface Location {
  latitude: number;
  longitude: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
}

// Notification types
export type NotificationType = 
  | 'activity_invite'
  | 'activity_update'
  | 'participant_request'
  | 'request_approved'
  | 'new_message'
  | 'activity_reminder'
  | 'new_review';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  createdAt: string;
}