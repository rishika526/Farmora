import { queryOptions } from "@tanstack/react-query";

const API_BASE = "/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── SHARED TYPES ─────────────────────────────────────────────────────────────

export interface Tutorial {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string | null;
  category: string;
  duration: string;
  difficulty: string;
  views: number;
  creator: string;
  tags: string[];
  description: string | null;
  language: string;
  createdAt: string | null;
}

export interface CreateTutorialInput {
  title: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  creator: string;
  tags: string[];
  description?: string | null;
  language?: string;
}

export interface Kit {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  description: string;
  isAffiliate: boolean;
  commission: number;
  tags: string[];
  createdAt: string | null;
}

export interface Creator {
  id: string;
  name: string;
  avatar: string | null;
  engagementScore: number;
  totalViews: number;
  tutorialCount: number;
  category: string;
  isNew: boolean;
  createdAt: string | null;
}

export interface QuantumResult<T> {
  selected: T[];
  scores: number[];
  solverUsed: string;
  executionTimeMs: number;
  metadata: { annealingSteps: number; temperature: number; objectiveValue: number };
}

export interface QAOAResult {
  probabilities: { state: string; probability: number }[];
  optimalState: string;
  selectedIndices: number[];
  executionTimeMs: number;
}

export type GraphNode =
  | { type: "tutorial"; data: Tutorial }
  | { type: "kit"; data: Kit }
  | { type: "creator"; data: Creator };

export interface QuantumRelatedResult {
  sourceType: string;
  sourceId: string;
  related: GraphNode[];
  scores: number[];
  solverUsed: string;
  executionTimeMs: number;
  edgeCount: number;
}

export interface FarmDayTask {
  id: string;
  name: string;
  icon: string;
  type: string;
  priority: number;
}

export interface FarmPlanDay {
  day: number;
  tasks: FarmDayTask[];
}

export interface FarmPlan {
  plan: FarmPlanDay[];
  solverUsed: string;
  executionTimeMs: number;
  quboConstraints: string[];
}

// ── QUERY OPTIONS ─────────────────────────────────────────────────────────────

export function tutorialsQuery(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  const qs = params.toString();
  return queryOptions({
    queryKey: ["tutorials", category, search],
    queryFn: () => fetchJSON<Tutorial[]>(`${API_BASE}/tutorials${qs ? `?${qs}` : ""}`),
  });
}

export function tutorialQuery(id: string) {
  return queryOptions({
    queryKey: ["tutorial", id],
    queryFn: () => fetchJSON<Tutorial>(`${API_BASE}/tutorials/${id}`),
  });
}

export function kitsQuery(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  const qs = params.toString();
  return queryOptions({
    queryKey: ["kits", search],
    queryFn: () => fetchJSON<Kit[]>(`${API_BASE}/kits${qs ? `?${qs}` : ""}`),
  });
}

export function creatorsQuery() {
  return queryOptions({
    queryKey: ["creators"],
    queryFn: () => fetchJSON<Creator[]>(`${API_BASE}/creators`),
  });
}

export function quantumRelatedQuery(type: "tutorial" | "kit" | "creator", id: string) {
  return queryOptions({
    queryKey: ["quantum-related", type, id],
    queryFn: () => fetchJSON<QuantumRelatedResult>(`${API_BASE}/quantum/related/${type}/${id}`),
    enabled: !!id,
  });
}

// ── MUTATION HELPERS ─────────────────────────────────────────────────────────

export async function quantumRecommend(type: "tutorials" | "kits", preferences: string[] = [], maxItems = 8) {
  return fetchJSON<QuantumResult<Tutorial | Kit>>(`${API_BASE}/quantum/recommend`, {
    method: "POST",
    body: JSON.stringify({ type, preferences, maxItems }),
  });
}

export async function quantumQAOADemo(itemCount = 8) {
  return fetchJSON<QAOAResult>(`${API_BASE}/quantum/qaoa-demo`, {
    method: "POST",
    body: JSON.stringify({ itemCount }),
  });
}

export async function quantumCreatorOptimize() {
  return fetchJSON<QuantumResult<Creator> & { fairnessScore: number }>(`${API_BASE}/quantum/creator-optimize`, {
    method: "POST",
  });
}

export async function quantumRandomCreator() {
  return fetchJSON<{ creator: Creator | null; method: string }>(`${API_BASE}/quantum/random`);
}

export async function quantumFarmPlan(crop: string, days = 7) {
  return fetchJSON<FarmPlan>(`${API_BASE}/quantum/farm-plan`, {
    method: "POST",
    body: JSON.stringify({ crop, days }),
  });
}

export async function createTutorial(data: CreateTutorialInput) {
  return fetchJSON<Tutorial>(`${API_BASE}/tutorials`, { method: "POST", body: JSON.stringify(data) });
}
