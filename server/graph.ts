import type { Tutorial, Kit, Creator } from "@shared/schema";

// ─── GRAPH NODE TYPE ─────────────────────────────────────────────────────────
export type GraphNode =
  | { type: "tutorial"; data: Tutorial }
  | { type: "kit"; data: Kit }
  | { type: "creator"; data: Creator };

interface GraphEdge {
  from: string; // nodeId
  to: string;   // nodeId
  weight: number; // 0–1 similarity score
}

function nodeId(node: GraphNode): string {
  return `${node.type}:${node.data.id}`;
}

function nodeTags(node: GraphNode): string[] {
  if (node.type === "creator") return [node.data.category.toLowerCase()];
  return (node.data.tags || []).map((t: string) => t.toLowerCase());
}

function nodeCategory(node: GraphNode): string {
  if (node.type === "tutorial") return node.data.category.toLowerCase();
  if (node.type === "creator") return node.data.category.toLowerCase();
  return (node.data as Kit).tags?.[0]?.toLowerCase() || "";
}

/**
 * Compute tag-based Jaccard similarity between two nodes.
 * |A ∩ B| / |A ∪ B|
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter(x => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

/**
 * Build a weighted undirected graph from all nodes.
 * Edges are created between nodes sharing tags or category.
 */
function buildGraph(nodes: GraphNode[]): Map<string, { node: GraphNode; edges: Map<string, number> }> {
  const graph = new Map<string, { node: GraphNode; edges: Map<string, number> }>();

  for (const node of nodes) {
    graph.set(nodeId(node), { node, edges: new Map() });
  }

  // Connect nodes based on shared tags / category (O(n²) — dataset is small)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const tagsA = nodeTags(a);
      const tagsB = nodeTags(b);
      const tagSim = jaccardSimilarity(tagsA, tagsB);
      const catBonus = nodeCategory(a) === nodeCategory(b) ? 0.3 : 0;
      const weight = Math.min(1, tagSim + catBonus);

      if (weight > 0.05) { // prune very weak edges
        const idA = nodeId(a);
        const idB = nodeId(b);
        graph.get(idA)!.edges.set(idB, weight);
        graph.get(idB)!.edges.set(idA, weight);
      }
    }
  }

  return graph;
}

/**
 * Quantum-Walk Inspired Scoring
 *
 * Classical approximation of a quantum walk:
 * - Instead of collapsing immediately (classical random walk), we keep
 *   a probability distribution over ALL reachable nodes (superposition).
 * - We perform `steps` iterations of spreading probability mass along edges.
 * - At each step every node with non-zero amplitude passes some amplitude
 *   to its neighbours, weighted by edge similarity.
 * - This explores multiple paths simultaneously (the "superposition effect").
 * - Final visit counts = squared amplitudes = sampling probabilities.
 */
function quantumWalk(
  graph: Map<string, { node: GraphNode; edges: Map<string, number> }>,
  startId: string,
  steps: number = 6
): Map<string, number> {
  // Initialise: all probability mass at start node (|start⟩)
  const amplitude = new Map<string, number>();
  amplitude.set(startId, 1.0);

  for (let step = 0; step < steps; step++) {
    const next = new Map<string, number>();

    // Propagate amplitude from each node to neighbours (superposition spread)
    for (const [id, amp] of amplitude.entries()) {
      if (amp < 1e-6) continue;
      const entry = graph.get(id);
      if (!entry) continue;

      let totalWeight = 0;
      for (const w of entry.edges.values()) totalWeight += w;
      if (totalWeight === 0) continue;

      for (const [nid, w] of entry.edges.entries()) {
        // Each neighbour receives amplitude proportional to edge weight
        // Decay factor (0.6) models decoherence — prevents all mass reaching
        // only distant nodes after many steps
        const transfer = amp * (w / totalWeight) * 0.6;
        next.set(nid, (next.get(nid) || 0) + transfer);
      }

      // The node also retains some of its own amplitude (self-loop)
      next.set(id, (next.get(id) || 0) + amp * 0.4);
    }

    // Merge next into amplitude
    for (const [id, val] of next.entries()) {
      amplitude.set(id, (amplitude.get(id) || 0) + val);
    }
  }

  return amplitude;
}

/**
 * Main function: given a source node id and all nodes,
 * return the top-N related nodes using quantum-walk scoring.
 */
export function quantumRelated(
  sourceId: string,
  sourceType: "tutorial" | "kit" | "creator",
  tutorials: Tutorial[],
  kitsData: Kit[],
  creators: Creator[],
  topN: number = 8
): {
  related: GraphNode[];
  scores: number[];
  executionTimeMs: number;
  edgeCount: number;
} {
  const startTime = Date.now();

  // Build unified node list
  const nodes: GraphNode[] = [
    ...tutorials.map(t => ({ type: "tutorial" as const, data: t })),
    ...kitsData.map(k => ({ type: "kit" as const, data: k })),
    ...creators.map(c => ({ type: "creator" as const, data: c })),
  ];

  const graph = buildGraph(nodes);

  const startKey = `${sourceType}:${sourceId}`;
  if (!graph.has(startKey)) {
    // fallback: return first N nodes
    return { related: nodes.slice(0, topN), scores: [], executionTimeMs: Date.now() - startTime, edgeCount: 0 };
  }

  const amplitudes = quantumWalk(graph, startKey, 6);

  // Convert amplitude to score; exclude the source itself
  const scored: { id: string; node: GraphNode; score: number }[] = [];
  for (const [id, amp] of amplitudes.entries()) {
    if (id === startKey) continue;
    const entry = graph.get(id);
    if (!entry) continue;
    scored.push({ id, node: entry.node, score: amp });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, topN);

  // Count total edges for metadata
  let edgeCount = 0;
  for (const entry of graph.values()) edgeCount += entry.edges.size;

  return {
    related: top.map(s => s.node),
    scores: top.map(s => parseFloat(s.score.toFixed(4))),
    executionTimeMs: Date.now() - startTime,
    edgeCount: edgeCount / 2, // undirected
  };
}
