import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { isSupportedTutorialVideoUrl } from "./video";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tutorials = pgTable("tutorials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url"),
  category: text("category").notNull(),
  duration: text("duration").notNull(),
  difficulty: text("difficulty").notNull(),
  views: integer("views").notNull().default(0),
  creator: text("creator").notNull(),
  tags: text("tags").array().notNull(),
  description: text("description"),
  language: text("language").notNull().default("English"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const kits = pgTable("kits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  image: text("image").notNull(),
  price: real("price").notNull(),
  rating: real("rating").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  description: text("description").notNull(),
  isAffiliate: boolean("is_affiliate").notNull().default(false),
  commission: real("commission").notNull().default(0),
  tags: text("tags").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const creators = pgTable("creators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  avatar: text("avatar"),
  engagementScore: real("engagement_score").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  tutorialCount: integer("tutorial_count").notNull().default(0),
  category: text("category").notNull(),
  isNew: boolean("is_new").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quantumLogs = pgTable("quantum_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull(),
  inputParams: jsonb("input_params"),
  result: jsonb("result"),
  solverUsed: text("solver_used").notNull(),
  executionTimeMs: integer("execution_time_ms"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTutorialSchema = createInsertSchema(tutorials)
  .omit({
    id: true,
    createdAt: true,
    views: true,
  })
  .extend({
    title: z.string().trim().min(3).max(160),
    thumbnail: z.string().trim().min(1),
    videoUrl: z
      .string()
      .trim()
      .refine((value) => isSupportedTutorialVideoUrl(value), "Use a valid YouTube video link."),
    category: z.string().trim().min(2).max(60),
    duration: z.string().trim().regex(/^\d{1,2}:\d{2}$/, "Use MM:SS format."),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
    creator: z.string().trim().min(2).max(120),
    tags: z.array(z.string().trim().min(1)).min(1).max(10),
    description: z.string().trim().max(2000).nullable().optional(),
    language: z.string().trim().min(2).max(40).default("English"),
  });

export const insertKitSchema = createInsertSchema(kits).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorSchema = createInsertSchema(creators).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tutorial = typeof tutorials.$inferSelect;
export type InsertTutorial = z.infer<typeof insertTutorialSchema>;
export type Kit = typeof kits.$inferSelect;
export type InsertKit = z.infer<typeof insertKitSchema>;
export type Creator = typeof creators.$inferSelect;
export type InsertCreator = z.infer<typeof insertCreatorSchema>;
