import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  avatarUrl: true,
  bio: true,
});

// Activity types
export const ACTIVITY_TYPES = [
  "hiking",
  "cycling",
  "sports",
  "food",
  "arts",
  "other",
] as const;

// Activity schema
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  hostId: integer("host_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // One of ACTIVITY_TYPES
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  exactLatitude: real("exact_latitude").notNull(),
  exactLongitude: real("exact_longitude").notNull(),
  address: text("address"),
  dateTime: timestamp("date_time").notNull(),
  capacity: integer("capacity").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  hostId: true,
  title: true,
  description: true,
  type: true,
  latitude: true,
  longitude: true,
  exactLatitude: true,
  exactLongitude: true,
  address: true,
  dateTime: true,
  capacity: true,
});

// Participant status types
export type ParticipantStatus = "pending" | "approved" | "rejected";

// Participants schema
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull(), // "pending", "approved", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).pick({
  activityId: true,
  userId: true,
  status: true,
});

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  activityId: true,
  senderId: true,
  content: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull(),
  userId: integer("user_id").notNull(),
  activityId: integer("activity_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  reviewerId: true,
  userId: true,
  activityId: true,
  rating: true,
  comment: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

// Extended schemas for API responses
export const activityWithHostSchema = z.object({
  id: z.number(),
  hostId: z.number(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  dateTime: z.date(),
  capacity: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  host: z.object({
    id: z.number(),
    username: z.string(),
    avatarUrl: z.string().optional(),
    rating: z.number().optional(),
  }),
  participantCount: z.number(),
  status: z.string().optional(),
});

export const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number(),
  activitiesHosted: z.number(),
  activitiesJoined: z.number(),
});

export type ActivityWithHost = z.infer<typeof activityWithHostSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
