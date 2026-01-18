import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertKidSchema, insertCharacterSchema, insertStorySchema } from "@shared/schema";
import { generateStory, generateImages, getStorageRoot } from "./services/openai";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { z } from "zod";
import express from "express";
import path from "path";
import Stripe from "stripe";
import rateLimit from "express-rate-limit";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const generateStorySchema = z.object({
  kidIds: z.array(z.number()),
  characterIds: z.array(z.number()),
  storyIdea: z.string(),
  tone: z.string()
});

// Rate limiters for security
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login/register attempts per hour per IP
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 story generations per hour per IP
  message: { error: 'Story generation limit reached, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to API routes
  app.use('/api/', apiLimiter);
  
  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Serve user-specific images from storage directory
  // Route: /user-assets/:userId/images/:filename
  app.get("/user-assets/:userId/images/:filename", async (req, res) => {
    try {
      const { userId, filename } = req.params;
      const storageRoot = getStorageRoot();
      const filePath = path.join(storageRoot, "users", userId, "images", filename);
      
      res.set({
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000",
      });
      
      res.sendFile(filePath, (err) => {
        if (err) {
          console.error("Error serving user image:", err);
          res.status(404).json({ error: "Image not found" });
        }
      });
    } catch (error) {
      console.error("Error serving user image:", error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  // Auth middleware
  await setupSimpleAuth(app);

  // Auth routes are now handled in setupSimpleAuth

  // Guest session management (for demo purposes)
  const GUEST_USER_ID = "guest-session";

  // Kids routes - support guest sessions
  app.get("/api/kids", async (req: any, res) => {
    try {
      let kids = [];
      
      if (req.session?.userId) {
        // Authenticated user - get from database
        const userId = req.session.userId;
        kids = await storage.getKidsByUserId(userId);
        console.log("DEBUG - Authenticated user kids:", kids);
      } else {
        // Guest user - get from session
        kids = req.session.guestKids || [];
        console.log("DEBUG - Guest session kids:", kids);
        console.log("DEBUG - Full session:", JSON.stringify(req.session, null, 2));
      }
      
      res.json(kids);
    } catch (error) {
      console.error("Error fetching kids:", error);
      res.status(500).json({ message: "Failed to fetch kids" });
    }
  });

  app.post("/api/kids", async (req: any, res) => {
    try {
      const isAuthenticated = !!req.session?.userId;
      const userId = req.session?.userId || GUEST_USER_ID;
      
      if (isAuthenticated) {
        // Authenticated user - save to database
        const validatedData = insertKidSchema.parse({
          ...req.body,
          userId, // Add userId to validation data
        });
        const kid = await storage.createKid(validatedData);
        res.json(kid);
      } else {
        // Guest user - save to session
        const guestKids = req.session.guestKids || [];
        const newKid = {
          id: Date.now(), // Simple ID for guest kids
          userId: GUEST_USER_ID,
          name: req.body.name,
          age: req.body.age,
          description: req.body.description || null,
          hairColor: req.body.hairColor || null,
          eyeColor: req.body.eyeColor || null,
          hairLength: req.body.hairLength || null,
          skinTone: req.body.skinTone || null,
          createdAt: new Date()
        };
        
        guestKids.push(newKid);
        req.session.guestKids = guestKids;
        console.log("DEBUG - Saved guest kid:", newKid);
        console.log("DEBUG - Guest kids now:", req.session.guestKids);
        res.json(newKid);
      }
    } catch (error) {
      console.error("Error creating kid:", error);
      res.status(500).json({ message: "Failed to create kid" });
    }
  });

  app.put("/api/kids/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertKidSchema.partial().parse(req.body);
      const kid = await storage.updateKid(id, updates);
      if (!kid) {
        return res.status(404).json({ message: "Kid not found" });
      }
      res.json(kid);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/kids/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKid(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete kid" });
    }
  });

  // Characters routes - support guest sessions
  app.get("/api/characters", async (req: any, res) => {
    try {
      let characters = [];
      
      if (req.session?.userId) {
        // Authenticated user - get from database
        const userId = req.session.userId;
        characters = await storage.getCharactersByUserId(userId);
      } else {
        // Guest user - get from session
        characters = req.session.guestCharacters || [];
      }
      
      res.json(characters);
    } catch (error) {
      console.error("Error fetching characters:", error);
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.post("/api/characters", async (req: any, res) => {
    try {
      const isAuthenticated = !!req.session?.userId;
      const userId = req.session?.userId || GUEST_USER_ID;
      
      if (isAuthenticated) {
        // Authenticated user - save to database
        const validatedData = insertCharacterSchema.parse({
          ...req.body,
          userId,
        });
        const character = await storage.createCharacter(validatedData);
        res.json(character);
      } else {
        // Guest user - save to session
        const guestCharacters = req.session.guestCharacters || [];
        const newCharacter = {
          id: Date.now(), // Simple ID for guest characters
          userId: GUEST_USER_ID,
          name: req.body.name,
          type: req.body.type,
          description: req.body.description || null,
          createdAt: new Date()
        };
        
        guestCharacters.push(newCharacter);
        req.session.guestCharacters = guestCharacters;
        res.json(newCharacter);
      }
    } catch (error) {
      console.error("Error creating character:", error);
      res.status(500).json({ message: "Failed to create character" });
    }
  });

  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertCharacterSchema.partial().parse(req.body);
      const character = await storage.updateCharacter(id, updates);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCharacter(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character" });
    }
  });

  // Stories routes - support both authenticated and guest users
  app.get("/api/stories", async (req: any, res) => {
    try {
      let stories = [];
      
      if (req.session?.userId) {
        // Authenticated user - get from database
        const userId = req.session.userId;
        stories = await storage.getStoriesByUserId(userId);
      } else {
        // Guest user - get from session
        stories = req.session.guestStories || [];
      }
      
      res.json(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (req.session?.userId) {
        // Authenticated user - get from database
        const story = await storage.getStoryById(id);
        if (!story) {
          return res.status(404).json({ message: "Story not found" });
        }
        
        // Check if user owns this story
        const userId = req.session.userId;
        if (story.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(story);
      } else {
        // Guest user - get from session
        const guestStories = req.session.guestStories || [];
        const story = guestStories.find((s: any) => s.id === id);
        if (story) {
          res.json(story);
        } else {
          res.status(404).json({ message: "Story not found" });
        }
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories/generate", generateLimiter, async (req: any, res) => {
    try {
      const validatedData = generateStorySchema.parse(req.body);
      const isAuthenticated = !!req.session?.userId;
      const userId = req.session?.userId || GUEST_USER_ID;
      
      // Check story limits
      if (isAuthenticated) {
        // Authenticated user - check subscription limits
        const canCreate = await storage.canCreateStory(userId);
        if (!canCreate.canCreate) {
          return res.status(403).json({ 
            message: canCreate.reason,
            storiesUsed: canCreate.storiesUsed,
            limit: canCreate.limit
          });
        }
      } else {
        // Guest user - allow up to 3 free stories
        const guestStories = req.session.guestStories || [];
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Filter out stories older than 30 days
        const recentStories = guestStories.filter((story: any) => 
          new Date(story.createdAt) > thirtyDaysAgo
        );
        
        // Update session with only recent stories
        req.session.guestStories = recentStories;
        
        if (recentStories.length >= 3) {
          return res.status(403).json({ 
            message: "You've reached your 3 free story limit. Create an account to continue with unlimited stories!",
            isGuest: true,
            storiesUsed: recentStories.length,
            limit: 3
          });
        }
      }
      
      // Get kid and character names
      let allKids, allCharacters;
      
      if (isAuthenticated) {
        // Authenticated user - get from database
        allKids = await storage.getKidsByUserId(userId);
        allCharacters = await storage.getCharactersByUserId(userId);
      } else {
        // Guest user - get from session
        allKids = req.session.guestKids || [];
        allCharacters = req.session.guestCharacters || [];
      }
      
      const selectedKids = allKids.filter(kid => validatedData.kidIds.includes(kid.id));
      const selectedCharacters = allCharacters.filter(char => validatedData.characterIds.includes(char.id));
      
      const kidNames = selectedKids.map(kid => kid.name);
      const characterNames = selectedCharacters.map(char => char.name);
      
      // Build physical attributes for selected kids
      const kidPhysicalAttributes = selectedKids.map(kid => ({
        name: kid.name,
        age: kid.age,
        description: kid.description || undefined,
        hairColor: kid.hairColor || undefined,
        eyeColor: kid.eyeColor || undefined,
        hairLength: kid.hairLength || undefined,
        skinTone: kid.skinTone || undefined,
      }));
      
      // Build character descriptions for selected characters
      const characterDescriptions = selectedCharacters.map(char => ({
        name: char.name,
        description: char.description || undefined,
      }));
      
      // Generate story using Assistant API for authenticated users, traditional for guests
      let storyResponse;
      let assistantInfo = { runId: "", messageId: "" };
      
      if (isAuthenticated) {
        // Use OpenAI Assistant for authenticated users to get persistent context
        const { getOrCreateAssistant, generateStoryWithAssistant } = await import("./services/assistant");
        
        // Get or create assistant and thread for this user
        console.log("=== RETRIEVING ASSISTANT INFO ===");
        console.log("UserId:", userId);
        let userAssistantInfo = await storage.getUserAssistantInfo(userId);
        console.log("Raw userAssistantInfo:", userAssistantInfo);
        console.log("typeof userAssistantInfo.threadId:", typeof userAssistantInfo.threadId);
        console.log("userAssistantInfo.threadId === 'undefined':", userAssistantInfo.threadId === 'undefined');
        
        if (!userAssistantInfo.assistantId || !userAssistantInfo.threadId) {
          // First time - create assistant and thread
          const newAssistantInfo = await getOrCreateAssistant(userId);
          userAssistantInfo = newAssistantInfo;
          
          // Save to database
          await storage.updateUserAssistantInfo(userId, newAssistantInfo.assistantId, newAssistantInfo.threadId);
          console.log("Created new assistant and thread for user:", userId);
        }
        
        console.log("Using assistant:", userAssistantInfo.assistantId, "thread:", userAssistantInfo.threadId);
        console.log("Assistant info validation - assistantId type:", typeof userAssistantInfo.assistantId, "threadId type:", typeof userAssistantInfo.threadId);
        console.log("Assistant info validation - assistantId:", userAssistantInfo.assistantId, "threadId:", userAssistantInfo.threadId);
        
        // Ensure we have valid IDs
        if (!userAssistantInfo.assistantId || !userAssistantInfo.threadId || 
            userAssistantInfo.assistantId === 'undefined' || userAssistantInfo.threadId === 'undefined') {
          console.log("Invalid assistant info detected, creating new ones");
          const newAssistantInfo = await getOrCreateAssistant(userId);
          userAssistantInfo = newAssistantInfo;
          
          // Save to database
          await storage.updateUserAssistantInfo(userId, newAssistantInfo.assistantId, newAssistantInfo.threadId);
          console.log("Created new assistant and thread for user:", userId);
        }
        
        // Check if this is first interaction by checking if user has any stories
        const userStories = await storage.getStoriesByUserId(userId);
        const isFirstInteraction = userStories.length === 0;
        
        // Generate story using assistant with persistent context, fallback to traditional if it fails
        try {
          const assistantResult = await generateStoryWithAssistant(
            userAssistantInfo.threadId!,
            userAssistantInfo.assistantId!,
            {
              kidNames,
              characterNames,
              storyIdea: validatedData.storyIdea,
              tone: validatedData.tone,
              kidPhysicalAttributes,
              characterDescriptions
            },
            userId,
            isFirstInteraction
          );
          
          // Convert assistant response to standard story response format 
          storyResponse = {
            title: assistantResult.title,
            part1: assistantResult.part1,
            part2: assistantResult.part2,
            part3: assistantResult.part3,
            characterDescriptions: assistantResult.characterDescriptions,
            imagePrompt1: `Children's book illustration based on: ${assistantResult.part1.substring(0, 100)}...`,
            imagePrompt2: `Children's book illustration based on: ${assistantResult.part2.substring(0, 100)}...`,
            imagePrompt3: `Children's book illustration based on: ${assistantResult.part3.substring(0, 100)}...`,
            imageUrl1: assistantResult.imageUrl1,
            imageUrl2: assistantResult.imageUrl2,
            imageUrl3: assistantResult.imageUrl3
          };
          
          assistantInfo = {
            runId: assistantResult.runId,
            messageId: assistantResult.messageId
          };
          
          console.log("Story generated with assistant context - this story will build on previous family interactions");
        } catch (assistantError) {
          console.error("Assistant API failed, falling back to traditional completion:", assistantError.message);
          
          // Fallback to traditional OpenAI completion
          const { generateStory } = await import("./services/openai");
          storyResponse = await generateStory({
            kidNames,
            characterNames,
            storyIdea: validatedData.storyIdea,
            tone: validatedData.tone,
            kidPhysicalAttributes,
            characterDescriptions
          });
          
          console.log("Story generated with traditional completion as fallback for authenticated user");
        }
      } else {
        // Use traditional OpenAI completion for guest users (no persistent context)
        const { generateStory } = await import("./services/openai");
        storyResponse = await generateStory({
          kidNames,
          characterNames,
          storyIdea: validatedData.storyIdea,
          tone: validatedData.tone,
          kidPhysicalAttributes,
          characterDescriptions
        });
        console.log("Story generated with traditional completion for guest user");
      }
      
      console.log("Story generated, now generating images...");
      // Generate images with fallback
      let images;
      try {
        images = await generateImages([
          storyResponse.imagePrompt1,
          storyResponse.imagePrompt2,
          storyResponse.imagePrompt3
        ], storyResponse.characterDescriptions, userId);
      } catch (imageError: any) {
        console.warn("Image generation failed, creating story without images:", imageError.message);
        images = {
          imageUrl1: null,
          imageUrl2: null,
          imageUrl3: null
        };
      }
      
      console.log("Images generated, saving story...");
      
      let story;
      
      if (isAuthenticated) {
        // Authenticated user - save to database with assistant metadata
        story = await storage.createStory({
          userId,
          title: storyResponse.title,
          openaiRunId: assistantInfo.runId || null,
          openaiMessageId: assistantInfo.messageId || null,
          kidIds: validatedData.kidIds,
          characterIds: validatedData.characterIds,
          storyPart1: storyResponse.part1,
          storyPart2: storyResponse.part2,
          storyPart3: storyResponse.part3,
          imageUrl1: images.imageUrl1,
          imageUrl2: images.imageUrl2,
          imageUrl3: images.imageUrl3,
          tone: validatedData.tone
        });
        
        // Increment story count for authenticated users
        await storage.incrementUserStoryCount(userId);
        console.log("Story saved to database successfully:", story.id);
      } else {
        // Guest user - save to session with a temporary ID
        const guestStoryId = Date.now(); // Simple ID for guest stories
        story = {
          id: guestStoryId,
          userId: GUEST_USER_ID,
          title: storyResponse.title,
          kidIds: validatedData.kidIds,
          characterIds: validatedData.characterIds,
          storyPart1: storyResponse.part1,
          storyPart2: storyResponse.part2,
          storyPart3: storyResponse.part3,
          imageUrl1: images.imageUrl1,
          imageUrl2: images.imageUrl2,
          imageUrl3: images.imageUrl3,
          tone: validatedData.tone,
          createdAt: new Date()
        };
        
        // Store in session array
        const guestStories = req.session.guestStories || [];
        guestStories.push(story);
        req.session.guestStories = guestStories;
        console.log("Story saved to session successfully:", story.id);
      }
      
      res.json(story);
    } catch (error: any) {
      console.error("Error generating story:", error);
      res.status(500).json({ 
        message: "Failed to generate story", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Test endpoint for OpenAI text generation
  app.post("/api/test-openai", async (req, res) => {
    try {
      console.log("Testing OpenAI text generation...");
      const storyResponse = await generateStory({
        kidNames: ["Test Child"],
        characterNames: [],
        storyIdea: "A simple test story",
        tone: "cozy"
      });
      res.json({ success: true, title: storyResponse.title });
    } catch (error: any) {
      console.error("OpenAI text test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Test endpoint for DALL-E image generation
  app.post("/api/test-images", async (req: any, res) => {
    try {
      console.log("Testing DALL-E image generation...");
      const userId = req.session?.userId || "test-user";
      const { generateImages } = await import("./services/openai");
      const images = await generateImages([
        "A cozy bedroom scene with a child reading a book"
      ], "A young child with brown hair wearing pajamas", userId);
      res.json({ success: true, imageUrl: images.imageUrl1 });
    } catch (error: any) {
      console.error("DALL-E test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Repair ALL broken story images for a user
  app.post("/api/repair-all-story-images", async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized - please log in" });
      }
      
      console.log(`Repairing ALL broken images for user ${userId}`);
      
      // Get all stories for this user
      const userStories = await storage.getStoriesByUserId(userId);
      const brokenStories = [];
      
      // Check which stories have missing image files
      const fs = await import('fs/promises');
      const path = await import('path');
      
      for (const story of userStories) {
        let hasMissingImages = false;
        const imageUrls = [story.imageUrl1, story.imageUrl2, story.imageUrl3];
        
        for (const imageUrl of imageUrls) {
          if (imageUrl && imageUrl.startsWith('/story-images/')) {
            const filePath = path.join(process.cwd(), 'public', imageUrl);
            try {
              await fs.access(filePath);
            } catch {
              hasMissingImages = true;
              break;
            }
          }
        }
        
        if (hasMissingImages) {
          brokenStories.push(story);
        }
      }
      
      console.log(`Found ${brokenStories.length} stories with missing images`);
      
      if (brokenStories.length === 0) {
        return res.json({ 
          success: true, 
          message: "No broken images found - all stories are working correctly!",
          repairedCount: 0
        });
      }
      
      // Repair each broken story
      let repairedCount = 0;
      const { generateImages } = await import("./services/openai");
      
      for (const story of brokenStories) {
        try {
          console.log(`Repairing story ${story.id}: ${story.title}`);
          
          // Get kids and characters for this story
          const kids = await storage.getKidsByIds(story.kidIds);
          const characters = await storage.getCharactersByIds(story.characterIds);
          
          // Generate image prompts based on story content
          const imagePrompts = [
            story.storyPart1.substring(0, 200) + "...",
            story.storyPart2.substring(0, 200) + "...",
            story.storyPart3.substring(0, 200) + "..."
          ];
          
          // Create character descriptions
          const kidDescriptions = kids.map(kid => 
            `${kid.name} (age ${kid.age}): ${kid.description}, ${kid.skinTone} skin, ${kid.eyeColor} eyes, ${kid.hairLength} ${kid.hairColor} hair`
          ).join(". ");
          
          const characterDescriptions = characters.map(char =>
            `${char.name}: ${char.description}`
          ).join(". ");
          
          const allDescriptions = [kidDescriptions, characterDescriptions].filter(Boolean).join(". ");
          
          // Generate new images
          const images = await generateImages(imagePrompts, allDescriptions, userId);
          
          // Update story with new image URLs
          await storage.updateStory(story.id, {
            imageUrl1: images.imageUrl1,
            imageUrl2: images.imageUrl2,
            imageUrl3: images.imageUrl3
          });
          
          repairedCount++;
          console.log(`Successfully repaired story ${story.id}`);
          
        } catch (error: any) {
          console.error(`Failed to repair story ${story.id}:`, error);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Successfully repaired ${repairedCount} out of ${brokenStories.length} broken stories`,
        repairedCount,
        totalBroken: brokenStories.length
      });
      
    } catch (error: any) {
      console.error(`Error repairing all story images:`, error);
      res.status(500).json({ 
        message: "Failed to repair story images",
        error: error.message 
      });
    }
  });

  // Repair broken story images
  app.post("/api/repair-story-images/:id", async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStoryById(id);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      
      // Check if user owns this story
      const userId = req.session?.userId;
      if (story.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      console.log(`Repairing images for story ${id}: ${story.title}`);
      
      // Get kids and characters for this story
      const kids = await storage.getKidsByIds(story.kidIds);
      const characters = await storage.getCharactersByIds(story.characterIds);
      
      // Generate image prompts based on story content
      const imagePrompts = [
        story.storyPart1.substring(0, 200) + "...",
        story.storyPart2.substring(0, 200) + "...",
        story.storyPart3.substring(0, 200) + "..."
      ];
      
      // Create character descriptions
      const kidDescriptions = kids.map(kid => 
        `${kid.name} (age ${kid.age}): ${kid.description}, ${kid.skinTone} skin, ${kid.eyeColor} eyes, ${kid.hairLength} ${kid.hairColor} hair`
      ).join(". ");
      
      const characterDescriptions = characters.map(char =>
        `${char.name}: ${char.description}`
      ).join(". ");
      
      const allDescriptions = [kidDescriptions, characterDescriptions].filter(Boolean).join(". ");
      
      // Generate new images
      const { generateImages } = await import("./services/openai");
      const images = await generateImages(imagePrompts, allDescriptions, userId);
      
      // Update story with new image URLs
      await storage.updateStory(id, {
        imageUrl1: images.imageUrl1,
        imageUrl2: images.imageUrl2,
        imageUrl3: images.imageUrl3
      });
      
      console.log(`Successfully repaired images for story ${id}`);
      res.json({ 
        success: true, 
        message: "Images repaired successfully",
        images: images
      });
      
    } catch (error: any) {
      console.error(`Error repairing story images:`, error);
      res.status(500).json({ 
        message: "Failed to repair story images",
        error: error.message 
      });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  });

  // Stripe routes for subscription management
  app.post("/api/create-checkout-session", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ error: "User email is required" });
      }

      // Create Stripe checkout session
      const priceId = process.env.STRIPE_PRICE_ID || 'price_PLACEHOLDER';
      console.log("DEBUG - Using STRIPE_PRICE_ID:", priceId);
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            // Use the Stripe Price ID from your dashboard
            // You'll need to create a price for product prod_SeOo5WigYEkAFI
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${req.protocol}://${req.get('host')}/api/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get('host')}/pricing`,
        metadata: {
          userId: userId,
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check subscription status
  app.get("/api/subscription-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.json({ hasActiveSubscription: false });
      }

      // Get customer from Stripe by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return res.json({ hasActiveSubscription: false });
      }

      // Get active subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customers.data[0].id,
        status: 'active',
        limit: 1,
      });

      const hasActiveSubscription = subscriptions.data.length > 0;
      
      // If user has active subscription but our DB shows free, update it
      if (hasActiveSubscription && user.subscriptionTier === 'free') {
        await storage.updateUserSubscription(userId, 'premium_unlimited');
      }
      
      res.json({ hasActiveSubscription });
    } catch (error: any) {
      console.error("Error checking subscription status:", error);
      res.json({ hasActiveSubscription: false });
    }
  });



  // Create Stripe customer portal session for subscription management
  app.post("/api/create-customer-portal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      
      if (!user || !user.email) {
        return res.status(400).json({ error: "User email is required" });
      }

      // Get or create customer in Stripe
      let customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      let customerId;
      if (customers.data.length === 0) {
        // Create customer if they don't exist
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || undefined,
        });
        customerId = customer.id;
      } else {
        customerId = customers.data[0].id;
      }

      // Create customer portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.protocol}://${req.get('host')}/profile`,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle successful checkout completion
  app.get("/api/checkout-success", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.query.session_id;
      const userId = req.session.userId;
      
      if (sessionId) {
        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
          // Update user subscription status
          await storage.updateUserSubscription(userId, 'premium_unlimited');
          console.log(`✓ Updated user ${userId} to premium subscription via checkout success`);
        }
      }
      
      res.redirect('/create?success=true');
    } catch (error: any) {
      console.error("Error handling checkout success:", error);
      res.redirect('/create');
    }
  });

  // Stripe webhook handler for production reliability
  // Note: This route uses express.raw() middleware (configured in index.ts)
  app.post("/api/webhook/stripe", async (req, res) => {
    try {
      let event: Stripe.Event;
      
      // Verify webhook signature in production
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (webhookSecret && sig) {
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            webhookSecret
          );
        } catch (err: any) {
          console.error('Webhook signature verification failed:', err.message);
          return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }
      } else {
        // Development mode - parse body directly (less secure)
        event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (process.env.NODE_ENV === 'production') {
          console.warn('Warning: STRIPE_WEBHOOK_SECRET not set. Webhook signature verification disabled.');
        }
      }
      
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          const userId = session.metadata?.userId;
          
          if (userId && session.payment_status === 'paid') {
            await storage.updateUserSubscription(userId, 'premium_unlimited');
            console.log(`✓ Updated user ${userId} to premium via webhook`);
          }
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object;
          if (subscription.status === 'active') {
            // Find user by customer ID and upgrade
            const customer = await stripe.customers.retrieve(subscription.customer);
            if (customer && !customer.deleted && customer.email) {
              const user = await storage.getUserByEmail(customer.email);
              if (user) {
                await storage.updateUserSubscription(user.id, 'premium_unlimited');
                console.log(`✓ Updated user ${user.id} to premium via subscription webhook`);
              }
            }
          }
          break;
          
        case 'customer.subscription.deleted':
          const canceledSub = event.data.object;
          const canceledCustomer = await stripe.customers.retrieve(canceledSub.customer);
          if (canceledCustomer && !canceledCustomer.deleted && canceledCustomer.email) {
            const user = await storage.getUserByEmail(canceledCustomer.email);
            if (user) {
              await storage.updateUserSubscription(user.id, 'free');
              console.log(`✓ Downgraded user ${user.id} to free via cancellation webhook`);
            }
          }
          break;
          
        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
