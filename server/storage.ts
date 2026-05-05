import { type User, type InsertUser, type Tutorial, type InsertTutorial, type Kit, type InsertKit, type Creator, type InsertCreator, users, tutorials, kits, creators, quantumLogs } from "@shared/schema";
import { db } from "./db";
import { and, eq, ilike, sql, desc, or } from "drizzle-orm";

export type AuthUserInput = {
  email: string;
  name?: string | null;
  photoUrl?: string | null;
  role: "admin" | "creator" | "user";
};

export type TutorialStatus = "pending" | "approved" | "rejected";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertAuthUser(user: AuthUserInput): Promise<User>;

  getTutorials(category?: string, search?: string, status?: TutorialStatus | "all"): Promise<Tutorial[]>;
  getTutorial(id: string, includeHidden?: boolean): Promise<Tutorial | undefined>;
  createTutorial(tutorial: InsertTutorial): Promise<Tutorial>;
  getTutorialStatusCounts(): Promise<{ total: number; pending: number; approved: number; rejected: number }>;
  getPendingTutorials(): Promise<Tutorial[]>;
  updateTutorialStatus(id: string, status: TutorialStatus, reviewedBy: string): Promise<Tutorial | undefined>;
  deleteTutorial(id: string): Promise<boolean>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(sql`lower(${users.email}) = lower(${email})`);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async upsertAuthUser(authUser: AuthUserInput): Promise<User> {
    const [existing] = await db.select().from(users).where(sql`lower(${users.email}) = lower(${authUser.email})`);

    if (existing) {
      const [updated] = await db
        .update(users)
        .set({
          name: authUser.name || existing.name,
          photoUrl: authUser.photoUrl || existing.photoUrl,
          role: authUser.role,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db
      .insert(users)
      .values({
        email: authUser.email,
        username: authUser.email,
        password: null,
        name: authUser.name || authUser.email.split("@")[0],
        photoUrl: authUser.photoUrl || null,
        role: authUser.role,
      })
      .returning();
    return created;
  }

  async getTutorials(category?: string, search?: string, status: TutorialStatus | "all" = "approved"): Promise<Tutorial[]> {
    const conditions = [];

    if (status !== "all") {
      conditions.push(eq(tutorials.status, status));
    }

    if (category && category !== "all") {
      conditions.push(ilike(tutorials.category, category));
    }
    if (search) {
      conditions.push(
        or(
          ilike(tutorials.title, `%${search}%`),
          ilike(tutorials.creator, `%${search}%`),
          ilike(sql`COALESCE(${tutorials.description}, '')`, `%${search}%`),
        )!,
      );
    }

    if (conditions.length > 0) {
      return db
        .select()
        .from(tutorials)
        .where(and(...conditions))
        .orderBy(desc(tutorials.createdAt), desc(tutorials.views));
    }

    return db.select().from(tutorials).orderBy(desc(tutorials.createdAt), desc(tutorials.views));
  }

  async getTutorial(id: string, includeHidden = false): Promise<Tutorial | undefined> {
    const [tutorial] = await db
      .select()
      .from(tutorials)
      .where(includeHidden ? eq(tutorials.id, id) : and(eq(tutorials.id, id), eq(tutorials.status, "approved")));
    return tutorial;
  }

  async createTutorial(tutorial: InsertTutorial): Promise<Tutorial> {
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(tutorials)
        .values({
          ...tutorial,
          description: tutorial.description?.trim() || null,
          language: tutorial.language || "English",
          status: tutorial.status || "pending",
          submittedByEmail: tutorial.submittedByEmail || null,
          submittedByName: tutorial.submittedByName || tutorial.creator,
        })
        .returning();

      if (created.status !== "approved") return created;

      const [existingCreator] = await tx
        .select()
        .from(creators)
        .where(sql`lower(${creators.name}) = lower(${tutorial.creator})`);

      if (existingCreator) {
        await tx
          .update(creators)
          .set({
            tutorialCount: sql`${creators.tutorialCount} + 1`,
          })
          .where(eq(creators.id, existingCreator.id));
      } else {
        await tx.insert(creators).values({
          name: tutorial.creator,
          category: tutorial.category,
          tutorialCount: 1,
          totalViews: 0,
          engagementScore: 60,
          isNew: true,
        });
      }

      return created;
    });
  }

  async getTutorialStatusCounts(): Promise<{ total: number; pending: number; approved: number; rejected: number }> {
    const rows = await db
      .select({
        status: tutorials.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tutorials)
      .groupBy(tutorials.status);

    const counts = { total: 0, pending: 0, approved: 0, rejected: 0 };
    rows.forEach((row) => {
      counts.total += row.count;
      if (row.status === "pending" || row.status === "approved" || row.status === "rejected") {
        counts[row.status] = row.count;
      }
    });
    return counts;
  }

  async getPendingTutorials(): Promise<Tutorial[]> {
    return db.select().from(tutorials).where(eq(tutorials.status, "pending")).orderBy(desc(tutorials.createdAt));
  }

  async updateTutorialStatus(id: string, status: TutorialStatus, reviewedBy: string): Promise<Tutorial | undefined> {
    return db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tutorials)
        .set({ status, reviewedAt: new Date(), reviewedBy })
        .where(eq(tutorials.id, id))
        .returning();

      if (!updated || status !== "approved") return updated;

      const [existingCreator] = await tx.select().from(creators).where(sql`lower(${creators.name}) = lower(${updated.creator})`);
      if (existingCreator) {
        await tx
          .update(creators)
          .set({ tutorialCount: sql`${creators.tutorialCount} + 1` })
          .where(eq(creators.id, existingCreator.id));
      } else {
        await tx.insert(creators).values({
          name: updated.creator,
          category: updated.category,
          tutorialCount: 1,
          totalViews: 0,
          engagementScore: 60,
          isNew: true,
        });
      }

      return updated;
    });
  }

  async deleteTutorial(id: string): Promise<boolean> {
    const deleted = await db.delete(tutorials).where(eq(tutorials.id, id)).returning({ id: tutorials.id });
    return deleted.length > 0;
  }

  async incrementTutorialViews(id: string): Promise<void> {
    const [updatedTutorial] = await db
      .update(tutorials)
      .set({ views: sql`${tutorials.views} + 1` })
      .where(eq(tutorials.id, id))
      .returning({ creator: tutorials.creator });

    if (!updatedTutorial) return;

    await db
      .update(creators)
      .set({ totalViews: sql`${creators.totalViews} + 1` })
      .where(sql`lower(${creators.name}) = lower(${updatedTutorial.creator})`);
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
