import { type User, type InsertUser, type Tutorial, type InsertTutorial, type Kit, type InsertKit, type Creator, type InsertCreator, users, tutorials, kits, creators, quantumLogs } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTutorials(category?: string, search?: string): Promise<Tutorial[]>;
  getTutorial(id: string): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  incrementTutorialViews(id: string): Promise<void>;

  getKits(search?: string): Promise<Kit[]>;
  getKit(id: string): Promise<Kit | undefined>;
  createKit(kit: InsertKit): Promise<Kit>;

  getCreators(): Promise<Creator[]>;
  getCreator(id: string): Promise<Creator | undefined>;
  createCreator(creator: InsertCreator): Promise<Creator>;

  logQuantumCall(endpoint: string, inputParams: any, result: any, solverUsed: string, executionTimeMs: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTutorials(category?: string, search?: string): Promise<Tutorial[]> {
    const conditions = [];

    if (category && category !== "all") {
      conditions.push(ilike(tutorials.category, category));
    }
    if (search) {
      conditions.push(ilike(tutorials.title, `%${search}%`));
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(tutorials)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(tutorials.views));
    }

    return db.select().from(tutorials).orderBy(desc(tutorials.views));
  }

  async getTutorial(id: string): Promise<Tutorial | undefined> {
    const [tutorial] = await db.select().from(tutorials).where(eq(tutorials.id, id));
    return tutorial;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    const [created] = await db.insert(tutorials).values(tutorial).returning();
    return created;
  }

  async incrementTutorialViews(id: string): Promise<void> {
    await db.update(tutorials).set({ views: sql`${tutorials.views} + 1` }).where(eq(tutorials.id, id));
  }

  async getKits(search?: string): Promise<Kit[]> {
    if (search) {
      return db.select().from(kits).where(ilike(kits.name, `%${search}%`)).orderBy(desc(kits.rating));
    }
    return db.select().from(kits).orderBy(desc(kits.rating));
  }

  async getKit(id: string): Promise<Kit | undefined> {
    const [kit] = await db.select().from(kits).where(eq(kits.id, id));
    return kit;
  }

  async createKit(kit: InsertKit): Promise<Kit> {
    const [created] = await db.insert(kits).values(kit).returning();
    return created;
  }

  async getCreators(): Promise<Creator[]> {
    return db.select().from(creators).orderBy(desc(creators.engagementScore));
  }

  async getCreator(id: string): Promise<Creator | undefined> {
    const [creator] = await db.select().from(creators).where(eq(creators.id, id));
    return creator;
  }

  async createCreator(creator: InsertCreator): Promise<Creator> {
    const [created] = await db.insert(creators).values(creator).returning();
    return created;
  }

  async logQuantumCall(endpoint: string, inputParams: any, result: any, solverUsed: string, executionTimeMs: number): Promise<void> {
    await db.insert(quantumLogs).values({
      endpoint,
      inputParams,
      result,
      solverUsed,
      executionTimeMs,
    });
  }
}

export const storage = new DatabaseStorage();
