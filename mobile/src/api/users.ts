import apiClient from './index';

// Type definitions
export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  createdAt: string;
}

export interface UserProfile extends User {
  hostedActivitiesCount: number;
  participatedActivitiesCount: number;
  interests?: string[];
  rating?: number;
  reviewCount?: number;
}

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  location?: string;
  interests?: string[];
}

export interface Review {
  id: number;
  reviewerId: number;
  reviewerName: string;
  reviewerAvatar?: string;
  userId: number;
  activityId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewData {
  userId: number;
  activityId: number;
  rating: number;
  comment?: string;
}

// Users service functions
export const usersService = {
  // Get user profile
  async getUserProfile(userId: number): Promise<UserProfile> {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user profile ${userId}:`, error);
      throw error;
    }
  },
  
  // Update user profile
  async updateProfile(profileData: UpdateProfileData): Promise<User> {
    try {
      const response = await apiClient.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  // Upload profile picture
  async uploadProfilePicture(formData: FormData): Promise<{ avatarUrl: string }> {
    try {
      const response = await apiClient.post('/users/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  },
  
  // Get user activities
  async getUserActivities(userId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/users/${userId}/activities`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user activities ${userId}:`, error);
      throw error;
    }
  },
  
  // Get user reviews
  async getUserReviews(userId: number): Promise<Review[]> {
    try {
      const response = await apiClient.get(`/users/${userId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user reviews ${userId}:`, error);
      throw error;
    }
  },
  
  // Create a review
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const response = await apiClient.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }
};

export default usersService;