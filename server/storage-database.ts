import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool, db } from "./db";
import { eq, and, sql, desc, asc, lt, gt, or, not } from "drizzle-orm";
import { IStorage } from "./storage";
import { 
  users, activities, participants, messages, reviews,
  User, Activity, Participant, Message, Review,
  InsertUser, InsertActivity, InsertParticipant, InsertMessage, InsertReview,
  ActivityWithHost, UserProfile
} from "@shared/schema";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserProfile(userId: number, data: { bio?: string; avatarUrl?: string }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        bio: data.bio,
        avatarUrl: data.avatarUrl,
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return undefined;
    }
    
    // Get reviews and calculate average rating
    const userReviews = await db.select().from(reviews).where(eq(reviews.userId, userId));
    
    let rating = 0;
    if (userReviews.length > 0) {
      rating = userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length;
    }
    
    // Count hosted activities
    const [{ count: hostedCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(activities)
      .where(eq(activities.hostId, userId));
    
    // Count joined activities
    const [{ count: joinedCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(participants)
      .where(and(
        eq(participants.userId, userId),
        eq(participants.status, 'approved')
      ));
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      rating,
      reviewCount: userReviews.length,
      activitiesHosted: hostedCount,
      activitiesJoined: joinedCount
    };
  }

  // Activity operations
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values({
        ...activityData,
        isActive: true,
      })
      .returning();
    
    return activity;
  }

  async getActivityById(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async getActivityWithDetails(id: number, userId?: number): Promise<ActivityWithHost | undefined> {
    // Get activity
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    
    if (!activity) {
      return undefined;
    }
    
    // Get host
    const [host] = await db.select().from(users).where(eq(users.id, activity.hostId));
    
    if (!host) {
      return undefined;
    }
    
    // Get participant count
    const [{ count: participantCount }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(participants)
      .where(and(
        eq(participants.activityId, id),
        eq(participants.status, 'approved')
      ));
    
    // Get user's participation status if provided
    let status: string | undefined;
    if (userId) {
      const [participation] = await db
        .select()
        .from(participants)
        .where(and(
          eq(participants.activityId, id),
          eq(participants.userId, userId)
        ));
      
      if (participation) {
        status = participation.status;
      }
    }
    
    // Get host's reviews and calculate rating
    const hostReviews = await db.select().from(reviews).where(eq(reviews.userId, host.id));
    
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
      participantCount,
      status
    };
  }

  async getNearbyActivities(latitude: number, longitude: number, radiusKm: number): Promise<ActivityWithHost[]> {
    // Using PostgreSQL's earthdistance extension would be ideal here,
    // but for simplicity, we'll use a bounding box approach with Haversine in post-processing
    
    // Create a bounding box (approximate)
    const approxKmPerLat = 111.0; // at equator
    const approxKmPerLng = 111.0 * Math.cos(latitude * (Math.PI / 180));
    
    const latDelta = radiusKm / approxKmPerLat;
    const lngDelta = radiusKm / approxKmPerLng;
    
    const minLat = latitude - latDelta;
    const maxLat = latitude + latDelta;
    const minLng = longitude - lngDelta;
    const maxLng = longitude + lngDelta;
    
    // Get activities in bounding box
    const activitiesInBox = await db
      .select()
      .from(activities)
      .where(and(
        eq(activities.isActive, true),
        gt(activities.latitude, minLat),
        lt(activities.latitude, maxLat),
        gt(activities.longitude, minLng),
        lt(activities.longitude, maxLng)
      ));
    
    // Filter by exact distance and get details
    const nearbyActivities = await Promise.all(
      activitiesInBox
        .filter(activity => {
          const distance = this.getDistanceFromLatLonInKm(
            latitude,
            longitude,
            activity.latitude,
            activity.longitude
          );
          return distance <= radiusKm;
        })
        .map(async activity => {
          return await this.getActivityWithDetails(activity.id);
        })
    );
    
    return nearbyActivities.filter(Boolean) as ActivityWithHost[];
  }

  async getActivitiesByHostId(hostId: number): Promise<ActivityWithHost[]> {
    const hostActivities = await db
      .select()
      .from(activities)
      .where(eq(activities.hostId, hostId));
    
    const activitiesWithDetails = await Promise.all(
      hostActivities.map(async activity => {
        return await this.getActivityWithDetails(activity.id);
      })
    );
    
    return activitiesWithDetails.filter(Boolean) as ActivityWithHost[];
  }

  async getActivitiesByParticipantId(userId: number): Promise<ActivityWithHost[]> {
    // Get all activities where the user is an approved participant
    const participations = await db
      .select()
      .from(participants)
      .where(and(
        eq(participants.userId, userId),
        eq(participants.status, 'approved')
      ));
    
    // Get activity details for each
    const activitiesWithDetails = await Promise.all(
      participations.map(async participation => {
        return await this.getActivityWithDetails(participation.activityId, userId);
      })
    );
    
    return activitiesWithDetails.filter(Boolean) as ActivityWithHost[];
  }

  async didUserParticipateInActivity(userId: number, activityId: number): Promise<boolean> {
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId));
    
    if (!activity) {
      return false;
    }
    
    // User is the host
    if (activity.hostId === userId) {
      return true;
    }
    
    // User is an approved participant
    const [participation] = await db
      .select()
      .from(participants)
      .where(and(
        eq(participants.activityId, activityId),
        eq(participants.userId, userId),
        eq(participants.status, 'approved')
      ));
    
    return !!participation;
  }

  // Participant operations
  async createParticipantRequest(participantData: InsertParticipant): Promise<Participant> {
    const [participant] = await db
      .insert(participants)
      .values(participantData)
      .returning();
    
    return participant;
  }

  async getParticipantRequest(activityId: number, userId: number): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(and(
        eq(participants.activityId, activityId),
        eq(participants.userId, userId)
      ));
    
    return participant;
  }

  async updateParticipantRequest(activityId: number, userId: number, status: string): Promise<Participant | undefined> {
    const [participant] = await db
      .update(participants)
      .set({ status })
      .where(and(
        eq(participants.activityId, activityId),
        eq(participants.userId, userId)
      ))
      .returning();
    
    return participant;
  }

  async getParticipantsByActivityId(activityId: number): Promise<{ participant: Participant; user: User }[]> {
    const participantsList = await db
      .select()
      .from(participants)
      .where(eq(participants.activityId, activityId));
    
    const result = await Promise.all(
      participantsList.map(async participant => {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, participant.userId));
        
        return { participant, user };
      })
    );
    
    return result;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    
    return message;
  }

  async getMessagesByActivityId(activityId: number): Promise<(Message & { senderName?: string })[]> {
    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.activityId, activityId))
      .orderBy(asc(messages.createdAt));
    
    const messagesWithSenders = await Promise.all(
      messagesList.map(async message => {
        const [sender] = await db
          .select()
          .from(users)
          .where(eq(users.id, message.senderId));
        
        return {
          ...message,
          senderName: sender?.username
        };
      })
    );
    
    return messagesWithSenders;
  }

  async getRecentMessagesByActivityId(activityId: number, limit: number = 50): Promise<(Message & { senderName?: string })[]> {
    const messagesList = await db
      .select()
      .from(messages)
      .where(eq(messages.activityId, activityId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
    
    const messagesWithSenders = await Promise.all(
      messagesList.map(async message => {
        const [sender] = await db
          .select()
          .from(users)
          .where(eq(users.id, message.senderId));
        
        return {
          ...message,
          senderName: sender?.username
        };
      })
    );
    
    // Return in chronological order
    return messagesWithSenders.reverse();
  }

  async canUserAccessChat(userId: number, activityId: number): Promise<boolean> {
    const [activity] = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId));
    
    if (!activity) {
      return false;
    }
    
    // User is the host
    if (activity.hostId === userId) {
      return true;
    }
    
    // User is an approved participant
    const [participant] = await db
      .select()
      .from(participants)
      .where(and(
        eq(participants.activityId, activityId),
        eq(participants.userId, userId),
        eq(participants.status, 'approved')
      ));
    
    return !!participant;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    
    return review;
  }

  async getReviewsByUserId(userId: number): Promise<(Review & { reviewer?: { id: number; username: string; avatarUrl?: string } })[]> {
    const reviewsList = await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
    
    const reviewsWithReviewers = await Promise.all(
      reviewsList.map(async review => {
        const [reviewer] = await db
          .select()
          .from(users)
          .where(eq(users.id, review.reviewerId));
        
        return {
          ...review,
          reviewer: reviewer ? {
            id: reviewer.id,
            username: reviewer.username,
            avatarUrl: reviewer.avatarUrl
          } : undefined
        };
      })
    );
    
    return reviewsWithReviewers;
  }

  async getExistingReview(reviewerId: number, userId: number, activityId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(
        eq(reviews.reviewerId, reviewerId),
        eq(reviews.userId, userId),
        eq(reviews.activityId, activityId)
      ));
    
    return review;
  }

  // Helper method for the Haversine formula
  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}