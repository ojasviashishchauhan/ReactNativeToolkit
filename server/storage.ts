import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  users, activities, participants, messages, reviews,
  User, Activity, Participant, Message, Review,
  InsertUser, InsertActivity, InsertParticipant, InsertMessage, InsertReview,
  ActivityWithHost, UserProfile
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Interface defining all storage operations
export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: number, data: { bio?: string; avatarUrl?: string }): Promise<User>;
  getUserProfile(userId: number): Promise<UserProfile | undefined>;

  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivityById(id: number): Promise<Activity | undefined>;
  getActivityWithDetails(id: number, userId?: number): Promise<ActivityWithHost | undefined>;
  getNearbyActivities(latitude: number, longitude: number, radiusKm: number): Promise<ActivityWithHost[]>;
  getActivitiesByHostId(hostId: number): Promise<ActivityWithHost[]>;
  getActivitiesByParticipantId(userId: number): Promise<ActivityWithHost[]>;
  didUserParticipateInActivity(userId: number, activityId: number): Promise<boolean>;

  // Participant operations
  createParticipantRequest(participant: InsertParticipant): Promise<Participant>;
  getParticipantRequest(activityId: number, userId: number): Promise<Participant | undefined>;
  updateParticipantRequest(activityId: number, userId: number, status: string): Promise<Participant | undefined>;
  getParticipantsByActivityId(activityId: number): Promise<{ participant: Participant; user: User }[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByActivityId(activityId: number): Promise<(Message & { senderName?: string })[]>;
  getRecentMessagesByActivityId(activityId: number, limit?: number): Promise<(Message & { senderName?: string })[]>;
  canUserAccessChat(userId: number, activityId: number): Promise<boolean>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUserId(userId: number): Promise<(Review & { reviewer?: { id: number; username: string; avatarUrl?: string } })[]>;
  getExistingReview(reviewerId: number, userId: number, activityId: number): Promise<Review | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private activitiesData: Map<number, Activity>;
  private participantsData: Map<number, Participant>;
  private messagesData: Map<number, Message>;
  private reviewsData: Map<number, Review>;
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private activityIdCounter: number;
  private participantIdCounter: number;
  private messageIdCounter: number;
  private reviewIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.activitiesData = new Map();
    this.participantsData = new Map();
    this.messagesData = new Map();
    this.reviewsData = new Map();
    
    this.userIdCounter = 1;
    this.activityIdCounter = 1;
    this.participantIdCounter = 1;
    this.messageIdCounter = 1;
    this.reviewIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...userData, id, createdAt };
    this.usersData.set(id, user);
    return user;
  }

  async updateUserProfile(userId: number, data: { bio?: string; avatarUrl?: string }): Promise<User> {
    const user = this.usersData.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      bio: data.bio !== undefined ? data.bio : user.bio,
      avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : user.avatarUrl
    };
    
    this.usersData.set(userId, updatedUser);
    return updatedUser;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const user = this.usersData.get(userId);
    if (!user) {
      return undefined;
    }
    
    // Get reviews
    const userReviews = Array.from(this.reviewsData.values()).filter(
      review => review.userId === userId
    );
    
    // Calculate average rating
    let rating = 0;
    if (userReviews.length > 0) {
      rating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length;
    }
    
    // Count hosted activities
    const hostedActivities = Array.from(this.activitiesData.values()).filter(
      activity => activity.hostId === userId
    ).length;
    
    // Count joined activities
    const joinedActivities = Array.from(this.participantsData.values()).filter(
      participant => participant.userId === userId && participant.status === 'approved'
    ).length;
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      rating,
      reviewCount: userReviews.length,
      activitiesHosted: hostedActivities,
      activitiesJoined: joinedActivities
    };
  }

  // Activity operations
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const activity: Activity = { 
      ...activityData, 
      id,
      isActive: true,
      createdAt
    };
    this.activitiesData.set(id, activity);
    return activity;
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    return this.activitiesData.get(id);
  }

  async getActivityWithDetails(id: number, userId?: number): Promise<ActivityWithHost | undefined> {
    const activity = this.activitiesData.get(id);
    if (!activity) {
      return undefined;
    }
    
    const host = this.usersData.get(activity.hostId);
    if (!host) {
      return undefined;
    }
    
    // Count participants
    const approvedParticipants = Array.from(this.participantsData.values()).filter(
      p => p.activityId === id && p.status === 'approved'
    ).length;
    
    // Get user's participation status if provided
    let status: string | undefined;
    if (userId) {
      const participation = Array.from(this.participantsData.values()).find(
        p => p.activityId === id && p.userId === userId
      );
      if (participation) {
        status = participation.status;
      }
    }
    
    // Get host's reviews
    const hostReviews = Array.from(this.reviewsData.values()).filter(
      review => review.userId === host.id
    );
    
    // Calculate host rating
    let hostRating = 0;
    if (hostReviews.length > 0) {
      hostRating = hostReviews.reduce((sum, review) => sum + review.rating, 0) / hostReviews.length;
    }
    
    return {
      ...activity,
      host: {
        id: host.id,
        username: host.username,
        avatarUrl: host.avatarUrl,
        rating: hostRating
      },
      participantCount: approvedParticipants,
      status
    };
  }

  async getNearbyActivities(latitude: number, longitude: number, radiusKm: number): Promise<ActivityWithHost[]> {
    // Helper function to calculate distance between coordinates using Haversine formula
    const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = this.deg2rad(lat2 - lat1);
      const dLon = this.deg2rad(lon2 - lon1); 
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const d = R * c; // Distance in km
      return d;
    };
    
    // Filter activities by distance and active status
    const nearbyActivities = Array.from(this.activitiesData.values())
      .filter(activity => {
        // Skip inactive activities
        if (!activity.isActive) return false;
        
        // Calculate distance
        const distance = getDistanceFromLatLonInKm(
          latitude, 
          longitude, 
          activity.latitude, 
          activity.longitude
        );
        
        // Return activities within radius
        return distance <= radiusKm;
      });
    
    // Get full details for each activity
    const activitiesWithDetails = await Promise.all(
      nearbyActivities.map(async activity => {
        const details = await this.getActivityWithDetails(activity.id);
        return details!;
      })
    );
    
    return activitiesWithDetails;
  }

  async getActivitiesByHostId(hostId: number): Promise<ActivityWithHost[]> {
    const activities = Array.from(this.activitiesData.values())
      .filter(activity => activity.hostId === hostId);
    
    const activitiesWithDetails = await Promise.all(
      activities.map(async activity => {
        const details = await this.getActivityWithDetails(activity.id);
        return details!;
      })
    );
    
    return activitiesWithDetails;
  }

  async getActivitiesByParticipantId(userId: number): Promise<ActivityWithHost[]> {
    // Get all activities where the user is an approved participant
    const participations = Array.from(this.participantsData.values())
      .filter(p => p.userId === userId && p.status === 'approved')
      .map(p => p.activityId);
    
    // Get activity details for each
    const activitiesWithDetails = await Promise.all(
      participations.map(async activityId => {
        const details = await this.getActivityWithDetails(activityId, userId);
        return details!;
      })
    );
    
    return activitiesWithDetails.filter(Boolean);
  }

  async didUserParticipateInActivity(userId: number, activityId: number): Promise<boolean> {
    const activity = this.activitiesData.get(activityId);
    if (!activity) {
      return false;
    }
    
    // User is the host
    if (activity.hostId === userId) {
      return true;
    }
    
    // User is an approved participant
    const participation = Array.from(this.participantsData.values()).find(
      p => p.activityId === activityId && p.userId === userId && p.status === 'approved'
    );
    
    return !!participation;
  }

  // Participant operations
  async createParticipantRequest(participantData: InsertParticipant): Promise<Participant> {
    const id = this.participantIdCounter++;
    const createdAt = new Date();
    const participant: Participant = { ...participantData, id, createdAt };
    this.participantsData.set(id, participant);
    return participant;
  }

  async getParticipantRequest(activityId: number, userId: number): Promise<Participant | undefined> {
    return Array.from(this.participantsData.values()).find(
      p => p.activityId === activityId && p.userId === userId
    );
  }

  async updateParticipantRequest(activityId: number, userId: number, status: string): Promise<Participant | undefined> {
    const participant = Array.from(this.participantsData.values()).find(
      p => p.activityId === activityId && p.userId === userId
    );
    
    if (!participant) {
      return undefined;
    }
    
    const updatedParticipant = { ...participant, status };
    this.participantsData.set(participant.id, updatedParticipant);
    return updatedParticipant;
  }

  async getParticipantsByActivityId(activityId: number): Promise<{ participant: Participant; user: User }[]> {
    const participants = Array.from(this.participantsData.values())
      .filter(p => p.activityId === activityId);
    
    return participants.map(participant => {
      const user = this.usersData.get(participant.userId)!;
      return { participant, user };
    });
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date();
    const message: Message = { ...messageData, id, createdAt };
    this.messagesData.set(id, message);
    return message;
  }

  async getMessagesByActivityId(activityId: number): Promise<(Message & { senderName?: string })[]> {
    const messages = Array.from(this.messagesData.values())
      .filter(m => m.activityId === activityId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Add sender names
    return messages.map(message => {
      const sender = this.usersData.get(message.senderId);
      return {
        ...message,
        senderName: sender?.username
      };
    });
  }

  async getRecentMessagesByActivityId(activityId: number, limit: number = 50): Promise<(Message & { senderName?: string })[]> {
    const messages = await this.getMessagesByActivityId(activityId);
    return messages.slice(-limit);
  }

  async canUserAccessChat(userId: number, activityId: number): Promise<boolean> {
    const activity = this.activitiesData.get(activityId);
    if (!activity) {
      return false;
    }
    
    // User is the host
    if (activity.hostId === userId) {
      return true;
    }
    
    // User is an approved participant
    const participant = Array.from(this.participantsData.values()).find(
      p => p.activityId === activityId && p.userId === userId && p.status === 'approved'
    );
    
    return !!participant;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date();
    const review: Review = { ...reviewData, id, createdAt };
    this.reviewsData.set(id, review);
    return review;
  }

  async getReviewsByUserId(userId: number): Promise<(Review & { reviewer?: { id: number; username: string; avatarUrl?: string } })[]> {
    const reviews = Array.from(this.reviewsData.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Add reviewer info
    return reviews.map(review => {
      const reviewer = this.usersData.get(review.reviewerId);
      return {
        ...review,
        reviewer: reviewer ? {
          id: reviewer.id,
          username: reviewer.username,
          avatarUrl: reviewer.avatarUrl
        } : undefined
      };
    });
  }

  async getExistingReview(reviewerId: number, userId: number, activityId: number): Promise<Review | undefined> {
    return Array.from(this.reviewsData.values()).find(
      r => r.reviewerId === reviewerId && r.userId === userId && r.activityId === activityId
    );
  }

  // Helper method for the Haversine formula
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const storage = new MemStorage();
