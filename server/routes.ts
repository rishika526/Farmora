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

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── TUTORIALS ────────────────────────────────────────────────────────────────
  app.get("/api/tutorials", async (req, res) => {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    res.json(await storage.getTutorials(category, search));
  });

  app.get("/api/tutorials/:id", async (req, res) => {
    const tutorial = await storage.getTutorial(req.params.id);
    if (!tutorial) return res.status(404).json({ message: "Tutorial not found" });
    await storage.incrementTutorialViews(req.params.id);
    res.json(tutorial);
  });

  app.post("/api/tutorials", async (req, res) => {
    const parsed = insertTutorialSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.issues });
    res.status(201).json(await storage.createTutorial(parsed.data));
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
    const { itemCount = 8 } = req.body;
    const result = simulateQAOA(Math.min(itemCount, 12));
    await storage.logQuantumCall("/quantum/qaoa-demo", req.body, { optimalState: result.optimalState }, "qaoa_simulator", result.executionTimeMs);
    res.json(result);
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
