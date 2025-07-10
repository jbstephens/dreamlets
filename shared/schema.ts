import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth + subscription info
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"), // For simple email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  subscriptionTier: varchar("subscription_tier").default("free"), // 'free', 'premium_15', 'premium_unlimited'
  storiesThisMonth: integer("stories_this_month").default(0),
  monthlyResetDate: timestamp("monthly_reset_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kids = pgTable("kids", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match users.id
  name: text("name").notNull(),
  age: integer("age").notNull(),
  description: text("description"),
  hairColor: text("hair_color"),
  eyeColor: text("eye_color"),
  hairLength: text("hair_length"),
  skinTone: text("skin_tone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match users.id
  name: text("name").notNull(),
  type: text("type").notNull(), // 'manual' or 'image'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Changed to varchar to match users.id
  title: text("title").notNull(),
  kidIds: jsonb("kid_ids").$type<number[]>().notNull(),
  characterIds: jsonb("character_ids").$type<number[]>().default([]),
  storyPart1: text("story_part_1").notNull(),
  storyPart2: text("story_part_2").notNull(),
  storyPart3: text("story_part_3").notNull(),
  imageUrl1: text("image_url_1"),
  imageUrl2: text("image_url_2"),
  imageUrl3: text("image_url_3"),
  tone: text("tone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertKidSchema = createInsertSchema(kids).omit({
  id: true,
  createdAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertKid = z.infer<typeof insertKidSchema>;
export type Kid = typeof kids.$inferSelect;

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
