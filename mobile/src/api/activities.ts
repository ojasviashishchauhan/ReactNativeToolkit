import apiClient from './index';

// Type definitions
export interface Activity {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
  participants: number;
  hostId: number;
  hostName: string;
  hostAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityData {
  title: string;
  description: string;
  type: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  capacity: number;
}

export interface ActivityFilters {
  type?: string;
  maxDistance?: number;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
}

// Activities service functions
export const activitiesService = {
  // Get all activities (with optional filters)
  async getActivities(filters?: ActivityFilters): Promise<Activity[]> {
    try {
      const response = await apiClient.get('/activities', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },
  
  // Get activity by id
  async getActivityById(id: number): Promise<Activity> {
    try {
      const response = await apiClient.get(`/activities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity ${id}:`, error);
      throw error;
    }
  },
  
  // Create new activity
  async createActivity(activityData: CreateActivityData): Promise<Activity> {
    try {
      const response = await apiClient.post('/activities', activityData);
      return response.data;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  },
  
  // Update activity
  async updateActivity(id: number, activityData: Partial<CreateActivityData>): Promise<Activity> {
    try {
      const response = await apiClient.put(`/activities/${id}`, activityData);
      return response.data;
    } catch (error) {
      console.error(`Error updating activity ${id}:`, error);
      throw error;
    }
  },
  
  // Delete activity
  async deleteActivity(id: number): Promise<void> {
    try {
      await apiClient.delete(`/activities/${id}`);
    } catch (error) {
      console.error(`Error deleting activity ${id}:`, error);
      throw error;
    }
  },
  
  // Get activities by host
  async getActivitiesByHost(hostId: number): Promise<Activity[]> {
    try {
      const response = await apiClient.get(`/activities/host/${hostId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching host ${hostId} activities:`, error);
      throw error;
    }
  },
  
  // Get nearby activities
  async getNearbyActivities(latitude: number, longitude: number, radius: number = 10): Promise<Activity[]> {
    try {
      const response = await apiClient.get('/activities/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby activities:', error);
      throw error;
    }
  },
  
  // Join activity
  async joinActivity(activityId: number): Promise<void> {
    try {
      await apiClient.post(`/activities/${activityId}/join`);
    } catch (error) {
      console.error(`Error joining activity ${activityId}:`, error);
      throw error;
    }
  },
  
  // Leave activity
  async leaveActivity(activityId: number): Promise<void> {
    try {
      await apiClient.post(`/activities/${activityId}/leave`);
    } catch (error) {
      console.error(`Error leaving activity ${activityId}:`, error);
      throw error;
    }
  }
};

export default activitiesService;