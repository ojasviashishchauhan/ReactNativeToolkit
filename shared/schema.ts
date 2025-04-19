import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  age: integer("age"),
  sex: text("sex"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  hostedActivities: many(activities, { relationName: "host" }),
  participations: many(participants, { relationName: "user_participations" }),
  sentMessages: many(messages, { relationName: "sender" }),
  givenReviews: many(reviews, { relationName: "reviewer" }),
  receivedReviews: many(reviews, { relationName: "reviewed_user" }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  avatarUrl: true,
  bio: true,
  age: true,
  sex: true,
  logoUrl: true,
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
  hostId: integer("host_id").notNull().references(() => users.id),
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

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  host: one(users, {
    fields: [activities.hostId],
    references: [users.id],
    relationName: "host",
  }),
  participants: many(participants, { relationName: "activity_participants" }),
  messages: many(messages, { relationName: "activity_messages" }),
  reviews: many(reviews, { relationName: "activity_reviews" }),
}));

export const insertActivitySchema = createInsertSchema(activities)
  .pick({
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
  })
  .extend({
    // Transform string dates to Date objects for the dateTime field
    dateTime: z.preprocess(
      (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
      z.date()
    ),
  });

// Participant status types
export type ParticipantStatus = "pending" | "approved" | "rejected";

// Participants schema
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status").notNull(), // "pending", "approved", "rejected"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participantsRelations = relations(participants, ({ one }) => ({
  activity: one(activities, {
    fields: [participants.activityId],
    references: [activities.id],
    relationName: "activity_participants"
  }),
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
    relationName: "user_participations"
  })
}));

export const insertParticipantSchema = createInsertSchema(participants).pick({
  activityId: true,
  userId: true,
  status: true,
});

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  activity: one(activities, {
    fields: [messages.activityId],
    references: [activities.id],
    relationName: "activity_messages"
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  })
}));

export const insertMessageSchema = createInsertSchema(messages).pick({
  activityId: true,
  senderId: true,
  content: true,
});

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  userId: integer("user_id").notNull().references(() => users.id),
  activityId: integer("activity_id").notNull().references(() => activities.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
    relationName: "reviewer"
  }),
  reviewedUser: one(users, {
    fields: [reviews.userId],
    references: [users.id],
    relationName: "reviewed_user"
  }),
  activity: one(activities, {
    fields: [reviews.activityId],
    references: [activities.id],
    relationName: "activity_reviews"
  })
}));

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
  exactLatitude: z.number(),
  exactLongitude: z.number(),
  address: z.string().nullable().transform(val => val === null ? undefined : val),
  dateTime: z.date(),
  capacity: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  host: z.object({
    id: z.number(),
    username: z.string(),
    avatarUrl: z.string().nullable().transform(val => val === null ? undefined : val),
    rating: z.number().optional(),
  }),
  participantCount: z.number(),
  status: z.string().optional(),
});

export const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string().nullable().transform(val => val === null ? undefined : val),
  bio: z.string().nullable().transform(val => val === null ? undefined : val),
  age: z.number().nullable().transform(val => val === null ? undefined : val),
  sex: z.string().nullable().transform(val => val === null ? undefined : val),
  logoUrl: z.string().nullable().transform(val => val === null ? undefined : val),
  rating: z.number().optional(),
  reviewCount: z.number(),
  activitiesHosted: z.number(),
  activitiesJoined: z.number(),
});

export type ActivityWithHost = z.infer<typeof activityWithHostSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
