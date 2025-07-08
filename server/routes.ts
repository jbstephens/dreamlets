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

  // Kids routes - support guest sessions
  app.get("/api/kids", async (req: any, res) => {
    try {
      let kids = [];
      
      if (req.user?.claims?.sub) {
        // Authenticated user - get from database
        const userId = req.user.claims.sub;
        kids = await storage.getKidsByUserId(userId);
      } else {
        // Guest user - get from session
        kids = req.session.guestKids || [];
      }
      
      res.json(kids);
    } catch (error) {
      console.error("Error fetching kids:", error);
      res.status(500).json({ message: "Failed to fetch kids" });
    }
  });

  app.post("/api/kids", async (req: any, res) => {
    try {
      const isAuthenticated = !!req.user?.claims?.sub;
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      
      if (isAuthenticated) {
        // Authenticated user - save to database
        const validatedData = insertKidSchema.parse(req.body);
        const kid = await storage.createKid({
          ...validatedData,
          userId,
        });
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
          createdAt: new Date()
        };
        
        guestKids.push(newKid);
        req.session.guestKids = guestKids;
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
      
      if (req.user?.claims?.sub) {
        // Authenticated user - get from database
        const userId = req.user.claims.sub;
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
      const isAuthenticated = !!req.user?.claims?.sub;
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      
      if (isAuthenticated) {
        // Authenticated user - save to database
        const validatedData = insertCharacterSchema.parse(req.body);
        const character = await storage.createCharacter({
          ...validatedData,
          userId,
        });
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
      
      if (req.user?.claims?.sub) {
        // Authenticated user - get from database
        const userId = req.user.claims.sub;
        stories = await storage.getStoriesByUserId(userId);
      } else {
        // Guest user - get from session
        if (req.session.guestStory) {
          stories = [req.session.guestStory];
        }
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
      
      if (req.user?.claims?.sub) {
        // Authenticated user - get from database
        const story = await storage.getStoryById(id);
        if (!story) {
          return res.status(404).json({ message: "Story not found" });
        }
        
        // Check if user owns this story
        const userId = req.user.claims.sub;
        if (story.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(story);
      } else {
        // Guest user - get from session
        if (req.session.guestStory && req.session.guestStory.id === id) {
          res.json(req.session.guestStory);
        } else {
          res.status(404).json({ message: "Story not found" });
        }
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories/generate", async (req: any, res) => {
    try {
      console.log("Received story generation request:", req.body);
      const validatedData = generateStorySchema.parse(req.body);
      const isAuthenticated = !!req.user?.claims?.sub;
      const userId = req.user?.claims?.sub || GUEST_USER_ID;
      
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
        // Guest user - only allow one story
        if (req.session.guestStory) {
          return res.status(403).json({ 
            message: "You can only create one story as a guest. Sign up to create more!",
            isGuest: true
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
      
      let story;
      
      if (isAuthenticated) {
        // Authenticated user - save to database
        story = await storage.createStory({
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
        
        // Store in session
        req.session.guestStory = story;
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
