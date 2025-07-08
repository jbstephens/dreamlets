import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { users, kids, characters, stories, type User, type InsertUser, type Kid, type InsertKid, type Character, type InsertCharacter, type Story, type InsertStory } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getKidsByUserId(userId: number): Promise<Kid[]>;
  createKid(kid: InsertKid): Promise<Kid>;
  updateKid(id: number, updates: Partial<InsertKid>): Promise<Kid | undefined>;
  deleteKid(id: number): Promise<void>;
  
  getCharactersByUserId(userId: number): Promise<Character[]>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: number, updates: Partial<InsertCharacter>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<void>;
  
  getStoriesByUserId(userId: number): Promise<Story[]>;
  getStoryById(id: number): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  deleteStory(id: number): Promise<void>;
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

  async deleteStory(id: number): Promise<void> {
    this.stories.delete(id);
  }
}

// Database implementation
class DatabaseStorage implements IStorage {
  private db = drizzle(neon(process.env.DATABASE_URL!));

  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getKidsByUserId(userId: number): Promise<Kid[]> {
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

  async getCharactersByUserId(userId: number): Promise<Character[]> {
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

  async getStoriesByUserId(userId: number): Promise<Story[]> {
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

  async deleteStory(id: number): Promise<void> {
    await this.db.delete(stories).where(eq(stories.id, id));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
