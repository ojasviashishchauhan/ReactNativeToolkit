import apiClient from './index';

// Type definitions
export interface Message {
  id: number;
  activityId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export interface SendMessageData {
  activityId: number;
  content: string;
}

// Messages service functions
export const messagesService = {
  // Get messages for an activity
  async getActivityMessages(activityId: number, limit: number = 50, before?: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/messages/activity/${activityId}`, {
        params: { limit, before }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for activity ${activityId}:`, error);
      throw error;
    }
  },
  
  // Send a message
  async sendMessage(messageData: SendMessageData): Promise<Message> {
    try {
      const response = await apiClient.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // Delete a message (for moderation)
  async deleteMessage(messageId: number): Promise<void> {
    try {
      await apiClient.delete(`/messages/${messageId}`);
    } catch (error) {
      console.error(`Error deleting message ${messageId}:`, error);
      throw error;
    }
  },
  
  // Get unread message count
  async getUnreadCount(): Promise<{ activityId: number; count: number }[]> {
    try {
      const response = await apiClient.get('/messages/unread');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      throw error;
    }
  },
  
  // Mark activity messages as read
  async markAsRead(activityId: number): Promise<void> {
    try {
      await apiClient.post(`/messages/activity/${activityId}/read`);
    } catch (error) {
      console.error(`Error marking messages as read for activity ${activityId}:`, error);
      throw error;
    }
  }
};

export default messagesService;