import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTutorialSchema, insertKitSchema, insertCreatorSchema } from "@shared/schema";
import {
  quantumRecommendTutorials,
  quantumRecommendKits,
  quantumOptimizeCreators,
  simulateQAOA,
  quantumRandom,
  generateFarmPlan,
} from "./quantum";
import { quantumRelated } from "./graph";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email?: string | null) {
  return !!email && getAdminEmails().includes(email.toLowerCase());
}

function requireAdmin(req: any, res: any, next: any) {
  const email = (req.headers["x-user-email"] as string | undefined) || req.query.adminEmail;
  if (!isAdminEmail(email)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── TUTORIALS ────────────────────────────────────────────────────────────────
  app.get("/api/tutorials", async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    res.json(await storage.getTutorials(category, search, "approved"));
  });

  app.get("/api/tutorials/:id", async (req, res) => {
    const tutorial = await storage.getTutorial(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    await storage.incrementTutorialViews(req.params.id);
    res.json({ ...tutorial, views: tutorial.views + 1 });
  });

  app.post("/api/tutorials", async (req, res) => {
    const parsed = insertTutorialSchema.safeParse({
      ...req.body,
      status: "pending",
    });
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.issues });
    res.status(201).json(await storage.createTutorial(parsed.data));
  });

  // ── AUTH ─────────────────────────────────────────────────────────────
  app.post("/api/auth/firebase", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) return res.status(400).json({ message: "Email is required" });

    const preferredRole = req.body?.preferredRole === "creator" ? "creator" : "user";
    const role = isAdminEmail(email) ? "admin" : preferredRole;
    const user = await storage.upsertAuthUser({
      email,
      name: typeof req.body?.name === "string" ? req.body.name : null,
      photoUrl: typeof req.body?.photoURL === "string" ? req.body.photoURL : null,
      role,
    });

    res.json(user);
  });

  app.get("/api/auth/me", async (req, res) => {
    const email = (req.headers["x-user-email"] as string | undefined)?.trim().toLowerCase();
    if (!email) return res.status(401).json({ message: "Not signed in" });
    const user = await storage.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // ── ADMIN MODERATION ────────────────────────────────────────────────
  app.get("/api/admin/tutorials/pending", requireAdmin, async (_req, res) => {
    const [counts, pending] = await Promise.all([
      storage.getTutorialStatusCounts(),
      storage.getPendingTutorials(),
    ]);
    res.json({ counts, pending });
  });

  app.patch("/api/admin/tutorials/:id/approve", requireAdmin, async (req, res) => {
    const reviewedBy = ((req.headers["x-user-email"] as string | undefined) || "admin").toLowerCase();
    const tutorial = await storage.updateTutorialStatus(req.params.id, "approved", reviewedBy);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.json(tutorial);
  });

  app.patch("/api/admin/tutorials/:id/reject", requireAdmin, async (req, res) => {
    const reviewedBy = ((req.headers["x-user-email"] as string | undefined) || "admin").toLowerCase();
    const tutorial = await storage.updateTutorialStatus(req.params.id, "rejected", reviewedBy);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    res.json(tutorial);
  });

  app.delete("/api/admin/tutorials/:id", requireAdmin, async (req, res) => {
    const deleted = await storage.deleteTutorial(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Tutorial not found" });
    res.status(204).end();
  });

  // ── KITS ─────────────────────────────────────────────────────────────────────
  app.get("/api/kits", async (req, res) => {
    const search = req.query.search as string | undefined;
    res.json(await storage.getKits(search));
  });

  app.get("/api/kits/:id", async (req, res) => {
    const kit = await storage.getKit(req.params.id);
    if (!kit) return res.status(404).json({ message: "Kit not found" });
    res.json(kit);
  });

  app.post("/api/kits", async (req, res) => {
    const parsed = insertKitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.issues });
    res.status(201).json(await storage.createKit(parsed.data));
  });

  // ── CREATORS ─────────────────────────────────────────────────────────────────
  app.get("/api/creators", async (_req, res) => {
    res.json(await storage.getCreators());
  });

  // ── QUANTUM: RECOMMENDATIONS ─────────────────────────────────────────────────
  app.post("/api/quantum/recommend", async (req, res) => {
    const { type = "tutorials", preferences = [], maxItems = 8 } = req.body;
    if (type === "tutorials") {
      const all = await storage.getTutorials();
      const result = quantumRecommendTutorials(all, preferences, maxItems);
      await storage.logQuantumCall("/quantum/recommend", req.body, { count: result.selected.length }, result.solverUsed, result.executionTimeMs);
      res.json(result);
    } else if (type === "kits") {
      const all = await storage.getKits();
      const result = quantumRecommendKits(all, preferences, maxItems);
      await storage.logQuantumCall("/quantum/recommend", req.body, { count: result.selected.length }, result.solverUsed, result.executionTimeMs);
      res.json(result);
    } else {
      res.status(400).json({ message: "Invalid type. Use 'tutorials' or 'kits'." });
    }
  });

  // ── QUANTUM: GRAPH-BASED DISCOVERY (QUANTUM WALK) ────────────────────────────
  /**
   * GET /api/quantum/related/:type/:id
   * Returns top-N related nodes (tutorials, kits, creators) using quantum-walk
   * scoring on a tag/category similarity graph.
   */
  app.get("/api/quantum/related/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    if (!["tutorial", "kit", "creator"].includes(type)) {
      return res.status(400).json({ message: "type must be tutorial, kit, or creator" });
    }

    const [tutorials, kits, creators] = await Promise.all([
      storage.getTutorials(),
      storage.getKits(),
      storage.getCreators(),
    ]);

    const result = quantumRelated(
      id,
      type as "tutorial" | "kit" | "creator",
      tutorials,
      kits,
      creators,
      8
    );

    await storage.logQuantumCall(
      `/quantum/related/${type}/${id}`,
      { sourceType: type, sourceId: id },
      { relatedCount: result.related.length, edgeCount: result.edgeCount },
      "quantum_walk",
      result.executionTimeMs
    );

    res.json({
      sourceType: type,
      sourceId: id,
      related: result.related,
      scores: result.scores,
      solverUsed: "quantum_walk_classical_approx",
      executionTimeMs: result.executionTimeMs,
      edgeCount: result.edgeCount,
    });
  });

  // ── QUANTUM: QAOA DEMO ───────────────────────────────────────────────────────
  app.post("/api/quantum/qaoa-demo", async (req, res) => {
    try {
      console.log("[qaoa-demo] request received, itemCount:", req.body?.itemCount ?? 6);
      const { itemCount = 6 } = req.body;
      const result = simulateQAOA(Math.min(itemCount, 8)); // cap at 8 qubits (256 states max)
      console.log("[qaoa-demo] done in", result.executionTimeMs, "ms, optimal:", result.optimalState);
      await storage.logQuantumCall("/quantum/qaoa-demo", req.body, { optimalState: result.optimalState }, "qaoa_simulator", result.executionTimeMs);
      res.json(result);
    } catch (err: any) {
      console.error("[qaoa-demo] error:", err.message);
      res.status(500).json({ error: "QAOA simulation failed", message: err.message });
    }
  });

  // ── QUANTUM: CREATOR OPTIMIZE ────────────────────────────────────────────────
  app.post("/api/quantum/creator-optimize", async (_req, res) => {
    const creators = await storage.getCreators();
    if (!creators.length) return res.json({ selected: [], scores: [], solverUsed: "none", executionTimeMs: 0, metadata: {}, fairnessScore: 0 });
    const result = quantumOptimizeCreators(creators);
    await storage.logQuantumCall("/quantum/creator-optimize", {}, { count: result.selected.length }, result.solverUsed, result.executionTimeMs);
    res.json(result);
  });

  // ── QUANTUM: RANDOM PICK ─────────────────────────────────────────────────────
  app.get("/api/quantum/random", async (_req, res) => {
    const creators = await storage.getCreators();
    if (!creators.length) return res.json({ creator: null });
    const creator = creators[quantumRandom(creators.length)];
    res.json({ creator, method: "quantum_random" });
  });

  // ── QUANTUM: FARM PLAN (QUBO) ────────────────────────────────────────────────
  /**
   * POST /api/quantum/farm-plan
   * Body: { crop: string, days: number }
   * Returns a QUBO-optimised day-wise task schedule.
   */
  app.post("/api/quantum/farm-plan", async (req, res) => {
    const { crop = "spinach", days = 7, cropType } = req.body;
    // Support both old (cropType) and new (crop) param names
    const effectiveCrop = crop || cropType || "spinach";
    const result = generateFarmPlan(effectiveCrop, Math.min(days, 14));
    await storage.logQuantumCall("/quantum/farm-plan", req.body, { planLength: result.plan.length }, result.solverUsed, result.executionTimeMs);
    res.json(result);
  });

  return httpServer;
}
