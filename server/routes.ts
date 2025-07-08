import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertKidSchema, insertCharacterSchema, insertStorySchema } from "@shared/schema";
import { generateStory, generateImages } from "./services/openai";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

const generateStorySchema = z.object({
  kidIds: z.array(z.number()),
  characterIds: z.array(z.number()),
  storyIdea: z.string(),
  tone: z.string()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Guest session management (for demo purposes)
  const GUEST_USER_ID = "guest-session";

  // Kids routes
  app.get("/api/kids", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const kids = await storage.getKidsByUserId(userId);
      res.json(kids);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kids" });
    }
  });

  app.post("/api/kids", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const validatedData = insertKidSchema.parse(req.body);
      const kid = await storage.createKid({
        ...validatedData,
        userId,
      });
      res.json(kid);
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

  // Characters routes
  app.get("/api/characters", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const characters = await storage.getCharactersByUserId(userId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.post("/api/characters", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const validatedData = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter({
        ...validatedData,
        userId,
      });
      res.json(character);
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

  // Stories routes
  app.get("/api/stories", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const stories = await storage.getStoriesByUserId(userId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getStoryById(id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories/generate", async (req: any, res) => {
    try {
      console.log("Received story generation request:", req.body);
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      const validatedData = generateStorySchema.parse(req.body);
      
      // Check if user can create a story (subscription limits)
      if (userId !== GUEST_USER_ID) {
        const canCreate = await storage.canCreateStory(userId);
        if (!canCreate.canCreate) {
          return res.status(403).json({ 
            message: canCreate.reason,
            storiesUsed: canCreate.storiesUsed,
            limit: canCreate.limit
          });
        }
      }
      
      // Get kid and character names
      const allKids = await storage.getKidsByUserId(userId);
      const allCharacters = await storage.getCharactersByUserId(userId);
      
      const selectedKids = allKids.filter(kid => validatedData.kidIds.includes(kid.id));
      const selectedCharacters = allCharacters.filter(char => validatedData.characterIds.includes(char.id));
      
      const kidNames = selectedKids.map(kid => kid.name);
      const characterNames = selectedCharacters.map(char => char.name);
      
      console.log("Selected kids:", kidNames);
      console.log("Selected characters:", characterNames);
      
      // Generate story
      console.log("Starting story generation...");
      const storyResponse = await generateStory({
        kidNames,
        characterNames,
        storyIdea: validatedData.storyIdea,
        tone: validatedData.tone
      });
      
      console.log("Story generated, now generating images...");
      // Generate images with fallback
      let images;
      try {
        images = await generateImages([
          storyResponse.imagePrompt1,
          storyResponse.imagePrompt2,
          storyResponse.imagePrompt3
        ]);
      } catch (imageError: any) {
        console.warn("Image generation failed, creating story without images:", imageError.message);
        images = {
          imageUrl1: null,
          imageUrl2: null,
          imageUrl3: null
        };
      }
      
      console.log("Images generated, saving story...");
      // Save story to database
      const story = await storage.createStory({
        userId,
        title: storyResponse.title,
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
      if (userId !== GUEST_USER_ID) {
        await storage.incrementUserStoryCount(userId);
      }
      
      console.log("Story saved successfully:", story.id);
      res.json(story);
    } catch (error: any) {
      console.error("Error generating story:", error);
      res.status(500).json({ 
        message: "Failed to generate story", 
        error: error.message || "Unknown error" 
      });
    }
  });

  // Test endpoint for OpenAI connection
  app.post("/api/test-openai", async (req, res) => {
    try {
      console.log("Testing OpenAI connection...");
      const storyResponse = await generateStory({
        kidNames: ["Test Child"],
        characterNames: [],
        storyIdea: "A simple test story",
        tone: "cozy"
      });
      res.json({ success: true, title: storyResponse.title });
    } catch (error: any) {
      console.error("OpenAI test failed:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Unknown error" 
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

  const httpServer = createServer(app);
  return httpServer;
}
