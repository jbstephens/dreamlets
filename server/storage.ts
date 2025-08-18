import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, sql } from "drizzle-orm";
import { users, kids, characters, stories, type User, type UpsertUser, type Kid, type InsertKid, type Character, type InsertCharacter, type Story, type InsertStory } from "@shared/schema";

export interface IStorage {
  // User operations for simple auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { email: string; password: string; firstName?: string | null; lastName?: string | null }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getKidsByUserId(userId: string): Promise<Kid[]>;
  createKid(kid: InsertKid): Promise<Kid>;
  updateKid(id: number, updates: Partial<InsertKid>): Promise<Kid | undefined>;
  deleteKid(id: number): Promise<void>;
  
  getCharactersByUserId(userId: string): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<void>;
  
  getStoriesByUserId(userId: string): Promise<Story[]>;
  getStoryById(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<void>;
  
  // Subscription management
  canCreateStory(userId: string): Promise<{ canCreate: boolean; reason?: string; storiesUsed: number; limit: number }>;
  incrementUserStoryCount(userId: string): Promise<void>;
  updateUserSubscription(userId: string, subscriptionTier: string): Promise<void>;

  // OpenAI Assistant management
  updateUserAssistantInfo(userId: string, assistantId: string, threadId: string): Promise<void>;
  getUserAssistantInfo(userId: string): Promise<{ assistantId?: string; threadId?: string }>;
  
  // Guest session migration
  migrateGuestDataToUser(userId: string, guestData: {
    kids?: any[];
    characters?: any[];
    stories?: any[];
  }): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private kids: Map<number, Kid>;
  private characters: Map<number, Character>;
  private stories: Map<number, Story>;
  private currentUserId: number;
  private currentKidId: number;
  private currentCharacterId: number;
  private currentStoryId: number;

  constructor() {
    this.users = new Map();
    this.kids = new Map();
    this.characters = new Map();
    this.stories = new Map();
    this.currentUserId = 1;
    this.currentKidId = 1;
    this.currentCharacterId = 1;
    this.currentStoryId = 1;
    
    // Add demo user
    this.users.set(1, { id: 1, username: "demo", password: "demo" });
    this.currentUserId = 2;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getKidsByUserId(userId: number): Promise<Kid[]> {
    return Array.from(this.kids.values()).filter(kid => kid.userId === userId);
  }

  async createKid(insertKid: InsertKid): Promise<Kid> {
    const id = this.currentKidId++;
    const kid: Kid = { ...insertKid, id, createdAt: new Date(), description: insertKid.description || null };
    this.kids.set(id, kid);
    return kid;
  }

  async updateKid(id: number, updates: Partial<InsertKid>): Promise<Kid | undefined> {
    const kid = this.kids.get(id);
    if (!kid) return undefined;
    
    const updatedKid = { ...kid, ...updates };
    this.kids.set(id, updatedKid);
    return updatedKid;
  }

  async deleteKid(id: number): Promise<void> {
    this.kids.delete(id);
  }

  async getCharactersByUserId(userId: number): Promise<Character[]> {
    return Array.from(this.characters.values()).filter(character => character.userId === userId);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = this.currentCharacterId++;
    const character: Character = { ...insertCharacter, id, createdAt: new Date(), description: insertCharacter.description || null };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const character = this.characters.get(id);
    if (!character) return undefined;
    
    const updatedCharacter = { ...character, ...updates };
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }

  async deleteCharacter(id: number): Promise<void> {
    this.characters.delete(id);
  }

  async getStoriesByUserId(userId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getStoryById(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const story: Story = { 
      id, 
      userId: insertStory.userId,
      title: insertStory.title,
      kidIds: (insertStory.kidIds as number[]) || [],
      characterIds: (insertStory.characterIds as number[]) || [],
      storyPart1: insertStory.storyPart1,
      storyPart2: insertStory.storyPart2,
      storyPart3: insertStory.storyPart3,
      tone: insertStory.tone,
      createdAt: new Date(),
      imageUrl1: insertStory.imageUrl1 || null,
      imageUrl2: insertStory.imageUrl2 || null,
      imageUrl3: insertStory.imageUrl3 || null
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;
    
    const updatedStory = { ...story, ...updates };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: number): Promise<void> {
    this.stories.delete(id);
  }

  async canCreateStory(userId: string): Promise<{ canCreate: boolean; reason?: string; storiesUsed: number; limit: number }> {
    // Memory storage - simple implementation for guest sessions
    return { canCreate: true, storiesUsed: 0, limit: 3 };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    // Memory storage - no-op for testing
    return undefined;
  }

  async createUser(userData: { email: string; password: string; firstName?: string | null; lastName?: string | null }): Promise<User> {
    // Memory storage - simple implementation for testing
    const id = this.currentUserId++;
    const user: User = { 
      id: id.toString(), 
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: null,
      subscriptionTier: "free",
      storiesThisMonth: 0,
      monthlyResetDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async incrementUserStoryCount(userId: string): Promise<void> {
    // Memory storage - no-op for guest sessions
  }

  async updateUserSubscription(userId: string, subscriptionTier: string): Promise<void> {
    // Memory storage - no-op for testing
  }

  async updateUserAssistantInfo(userId: string, assistantId: string, threadId: string): Promise<void> {
    // Memory storage - no-op for assistant info
  }

  async getUserAssistantInfo(userId: string): Promise<{ assistantId?: string; threadId?: string }> {
    // Memory storage - no assistant info available
    return {};
  }

  async migrateGuestDataToUser(userId: string, guestData: {
    kids?: any[];
    characters?: any[];
    stories?: any[];
  }): Promise<void> {
    // Memory storage - no-op since it's only used for testing
    console.log("MemStorage: Guest data migration not implemented");
  }
}

// Database implementation
class DatabaseStorage implements IStorage {
  private db = drizzle(neon(process.env.DATABASE_URL!));

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: { email: string; password: string; firstName?: string | null; lastName?: string | null }): Promise<User> {
    const id = crypto.randomUUID(); // Generate UUID for new users
    const result = await this.db
      .insert(users)
      .values({
        id,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        subscriptionTier: "free",
        storiesThisMonth: 0,
        monthlyResetDate: new Date(),
      })
      .returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async getKidsByUserId(userId: string): Promise<Kid[]> {
    return await this.db.select().from(kids).where(eq(kids.userId, userId)).orderBy(desc(kids.createdAt));
  }

  async createKid(insertKid: InsertKid): Promise<Kid> {
    const result = await this.db.insert(kids).values(insertKid).returning();
    return result[0];
  }

  async updateKid(id: number, updates: Partial<InsertKid>): Promise<Kid | undefined> {
    const result = await this.db.update(kids).set(updates).where(eq(kids.id, id)).returning();
    return result[0];
  }

  async deleteKid(id: number): Promise<void> {
    await this.db.delete(kids).where(eq(kids.id, id));
  }

  async getCharactersByUserId(userId: string): Promise<Character[]> {
    return await this.db.select().from(characters).where(eq(characters.userId, userId)).orderBy(desc(characters.createdAt));
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const result = await this.db.insert(characters).values(insertCharacter).returning();
    return result[0];
  }

  async updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character | undefined> {
    const result = await this.db.update(characters).set(updates).where(eq(characters.id, id)).returning();
    return result[0];
  }

  async deleteCharacter(id: number): Promise<void> {
    await this.db.delete(characters).where(eq(characters.id, id));
  }

  // Helper methods for repair endpoint
  async getKidsByIds(kidIds: number[]): Promise<Kid[]> {
    if (kidIds.length === 0) return [];
    return await this.db.select().from(kids).where(sql`${kids.id} = ANY(${kidIds})`);
  }

  async getCharactersByIds(characterIds: number[]): Promise<Character[]> {
    if (characterIds.length === 0) return [];
    return await this.db.select().from(characters).where(sql`${characters.id} = ANY(${characterIds})`);
  }

  async getStoriesByUserId(userId: string): Promise<Story[]> {
    return await this.db.select().from(stories).where(eq(stories.userId, userId)).orderBy(desc(stories.createdAt));
  }

  async getStoryById(id: number): Promise<Story | undefined> {
    const result = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    return result[0];
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const result = await this.db.insert(stories).values(insertStory).returning();
    return result[0];
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const result = await this.db.update(stories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(stories.id, id))
      .returning();
    return result[0];
  }

  async deleteStory(id: number): Promise<void> {
    await this.db.delete(stories).where(eq(stories.id, id));
  }

  async canCreateStory(userId: string): Promise<{ canCreate: boolean; reason?: string; storiesUsed: number; limit: number }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { canCreate: false, reason: "User not found", storiesUsed: 0, limit: 0 };
    }

    // Check if monthly reset is needed
    const now = new Date();
    const resetDate = new Date(user.monthlyResetDate);
    if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
      // Reset monthly count
      await this.db.update(users)
        .set({ 
          storiesThisMonth: 0, 
          monthlyResetDate: now,
          updatedAt: now 
        })
        .where(eq(users.id, userId));
      user.storiesThisMonth = 0;
    }

    let limit: number;
    switch (user.subscriptionTier) {
      case "free":
        limit = 3;
        break;
      case "premium_15":
        limit = 15;
        break;
      case "premium_unlimited":
        return { canCreate: true, storiesUsed: user.storiesThisMonth || 0, limit: Infinity };
      default:
        limit = 3;
    }

    const storiesUsed = user.storiesThisMonth || 0;
    if (storiesUsed >= limit) {
      return { 
        canCreate: false, 
        reason: `You've reached your ${limit} story limit for this month. Upgrade to create more stories!`,
        storiesUsed,
        limit
      };
    }

    return { canCreate: true, storiesUsed, limit };
  }

  async incrementUserStoryCount(userId: string): Promise<void> {
    await this.db.update(users)
      .set({ 
        storiesThisMonth: sql`${users.storiesThisMonth} + 1`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserSubscription(userId: string, subscriptionTier: string): Promise<void> {
    await this.db.update(users)
      .set({ 
        subscriptionTier,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserAssistantInfo(userId: string, assistantId: string, threadId: string): Promise<void> {
    await this.db.update(users)
      .set({ 
        openaiAssistantId: assistantId,
        openaiThreadId: threadId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getUserAssistantInfo(userId: string): Promise<{ assistantId?: string; threadId?: string }> {
    const user = await this.getUser(userId);
    console.log("Retrieved user assistant info for", userId, ":", {
      assistantId: user?.openaiAssistantId,
      threadId: user?.openaiThreadId,
      userFound: !!user
    });
    
    // Convert null to undefined for consistency
    const assistantId = user?.openaiAssistantId || undefined;
    const threadId = user?.openaiThreadId || undefined;
    
    console.log("Returning assistant info:", {
      assistantId,
      threadId,
      assistantIdType: typeof assistantId,
      threadIdType: typeof threadId
    });
    
    return {
      assistantId,
      threadId
    };
  }

  async migrateGuestDataToUser(userId: string, guestData: {
    kids?: any[];
    characters?: any[];
    stories?: any[];
  }): Promise<void> {
    console.log("Starting guest data migration for user:", userId);
    console.log("Guest data to migrate:", guestData);

    try {
      // Migrate kids
      if (guestData.kids && guestData.kids.length > 0) {
        for (const guestKid of guestData.kids) {
          await this.createKid({
            userId,
            name: guestKid.name,
            age: guestKid.age,
            description: guestKid.description,
            hairColor: guestKid.hairColor,
            eyeColor: guestKid.eyeColor,
            hairLength: guestKid.hairLength,
            skinTone: guestKid.skinTone,
          });
          console.log("Migrated kid:", guestKid.name);
        }
      }

      // Migrate characters
      if (guestData.characters && guestData.characters.length > 0) {
        for (const guestCharacter of guestData.characters) {
          await this.createCharacter({
            userId,
            name: guestCharacter.name,
            type: guestCharacter.type,
            description: guestCharacter.description,
          });
          console.log("Migrated character:", guestCharacter.name);
        }
      }

      // Migrate stories
      if (guestData.stories && guestData.stories.length > 0) {
        for (const guestStory of guestData.stories) {
          await this.createStory({
            userId,
            title: guestStory.title,
            kidIds: guestStory.kidIds || [],
            characterIds: guestStory.characterIds || [],
            storyPart1: guestStory.storyPart1,
            storyPart2: guestStory.storyPart2,
            storyPart3: guestStory.storyPart3,
            imageUrl1: guestStory.imageUrl1,
            imageUrl2: guestStory.imageUrl2,
            imageUrl3: guestStory.imageUrl3,
            tone: guestStory.tone,
          });
          console.log("Migrated story:", guestStory.title);

          // Increment story count for each migrated story
          await this.incrementUserStoryCount(userId);
        }
      }

      console.log("Guest data migration completed successfully for user:", userId);
    } catch (error) {
      console.error("Error migrating guest data:", error);
      throw error;
    }
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
