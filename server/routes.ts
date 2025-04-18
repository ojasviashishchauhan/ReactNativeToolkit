import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebsocket } from "./websocket";
import { z } from "zod";
import { insertActivitySchema, insertParticipantSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Set up authentication
  setupAuth(app);

  // Set up WebSocket server for chat
  const wsService = setupWebsocket(httpServer);

  // API Routes
  
  // Activities
  app.get("/api/activities", async (req, res, next) => {
    try {
      const { lat, lng, radius } = req.query;
      
      // Validate parameters
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const searchRadius = parseInt(radius as string) || 2; // Default 2km
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: "Invalid coordinates" });
      }
      
      const activities = await storage.getNearbyActivities(latitude, longitude, searchRadius);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      
      // Validate request body
      const activityData = {
        ...req.body,
        hostId: userId
      };
      
      const validatedData = insertActivitySchema.parse(activityData);
      const activity = await storage.createActivity(validatedData);
      
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/activities/:id", async (req, res, next) => {
    try {
      const activityId = parseInt(req.params.id);
      
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const userId = req.isAuthenticated() ? req.user!.id : undefined;
      const activity = await storage.getActivityWithDetails(activityId, userId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      res.json(activity);
    } catch (error) {
      next(error);
    }
  });

  // Participants (Join Requests)
  app.post("/api/activities/:id/join", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }

      // Check if user is the host
      const activity = await storage.getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      if (activity.hostId === userId) {
        return res.status(400).json({ message: "You cannot join your own activity" });
      }
      
      // Check if already a participant
      const existingRequest = await storage.getParticipantRequest(activityId, userId);
      if (existingRequest) {
        return res.status(400).json({ message: "Already requested to join" });
      }
      
      // Create join request
      const participantRequest = await storage.createParticipantRequest({
        activityId,
        userId,
        status: "pending"
      });
      
      // Send notification to activity host
      wsService.sendNotification({
        type: 'notification',
        recipientId: activity.hostId,
        message: `${req.user!.username} has requested to join your activity "${activity.title}"`,
        data: {
          activityId,
          requestId: participantRequest.id,
          type: 'join_request'
        }
      });
      
      res.status(201).json(participantRequest);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/activities/:activityId/participants/:userId", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const activityId = parseInt(req.params.activityId);
      const participantUserId = parseInt(req.params.userId);
      const hostId = req.user!.id;
      const { status } = req.body;
      
      if (isNaN(activityId) || isNaN(participantUserId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      // Validate status
      if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }
      
      // Check if user is the host
      const activity = await storage.getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      if (activity.hostId !== hostId) {
        return res.status(403).json({ message: "Only the host can approve/reject requests" });
      }
      
      // Update the request
      const updatedRequest = await storage.updateParticipantRequest(activityId, participantUserId, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Send notification to requester
      const participant = await storage.getUser(participantUserId);
      if (participant) {
        wsService.sendNotification({
          type: 'notification',
          recipientId: participantUserId,
          message: `Your request to join "${activity.title}" has been ${status}`,
          data: {
            activityId,
            type: 'request_update',
            status
          }
        });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/activities/:id/participants", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if user is host or participant
      const activity = await storage.getActivityById(activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const isHost = activity.hostId === userId;
      let isParticipant = false;
      
      if (!isHost) {
        const participant = await storage.getParticipantRequest(activityId, userId);
        isParticipant = participant?.status === 'approved';
      }
      
      if (!isHost && !isParticipant) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const participants = await storage.getParticipantsByActivityId(activityId);
      res.json(participants);
    } catch (error) {
      next(error);
    }
  });

  // User Activities
  app.get("/api/users/activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const { type } = req.query;
      
      if (type === 'hosting') {
        const activities = await storage.getActivitiesByHostId(userId);
        res.json(activities);
      } else if (type === 'participating') {
        const activities = await storage.getActivitiesByParticipantId(userId);
        res.json(activities);
      } else {
        // Return both
        const [hosting, participating] = await Promise.all([
          storage.getActivitiesByHostId(userId),
          storage.getActivitiesByParticipantId(userId)
        ]);
        
        res.json({
          hosting,
          participating
        });
      }
    } catch (error) {
      next(error);
    }
  });

  // Messages
  app.get("/api/activities/:id/messages", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const activityId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if user can access this chat
      const canAccess = await storage.canUserAccessChat(userId, activityId);
      
      if (!canAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getMessagesByActivityId(activityId);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  });

  // Reviews
  app.post("/api/users/:id/reviews", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const reviewerId = req.user!.id;
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      if (reviewerId === userId) {
        return res.status(400).json({ message: "You cannot review yourself" });
      }
      
      // Validate body
      const reviewData = {
        ...req.body,
        reviewerId,
        userId
      };
      
      const validatedData = insertReviewSchema.parse(reviewData);
      
      // Check if they participated in the same activity
      const activity = await storage.getActivityById(validatedData.activityId);
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      const sharedActivity = await storage.didUserParticipateInActivity(userId, validatedData.activityId);
      const reviewerParticipated = await storage.didUserParticipateInActivity(reviewerId, validatedData.activityId);
      
      if (!sharedActivity || !reviewerParticipated) {
        return res.status(403).json({ message: "You can only review users you've participated with" });
      }
      
      // Check if already reviewed
      const existingReview = await storage.getExistingReview(reviewerId, userId, validatedData.activityId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this user for this activity" });
      }
      
      // Create review
      const review = await storage.createReview(validatedData);
      
      // Send notification to reviewed user
      wsService.sendNotification({
        type: 'notification',
        recipientId: userId,
        message: `${req.user!.username} has left you a review`,
        data: {
          reviewId: review.id,
          type: 'new_review'
        }
      });
      
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id/reviews", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const reviews = await storage.getReviewsByUserId(userId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  });

  // User Profile
  app.get("/api/users/:id/profile", async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const profile = await storage.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(profile);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const userId = req.user!.id;
      const { bio, avatarUrl } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, { bio, avatarUrl });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
