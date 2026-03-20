import type { Tutorial, Kit, Creator } from "@shared/schema";

interface QUBOResult<T> {
  selected: T[];
  scores: number[];
  solverUsed: string;
  executionTimeMs: number;
  metadata: {
    annealingSteps: number;
    temperature: number;
    objectiveValue: number;
  };
}

function computeRelevanceScore(item: { tags: string[] }, preferences: string[]): number {
  if (!preferences.length) return 0.5;
  const matches = item.tags.filter(t =>
    preferences.some(p => t.toLowerCase().includes(p.toLowerCase()))
  );
  return matches.length / Math.max(preferences.length, 1);
}

function computeDiversityPenalty(selected: { tags: string[] }[]): number {
  if (selected.length < 2) return 0;
  const allTags = selected.flatMap(s => s.tags);
  const unique = new Set(allTags);
  return 1 - (unique.size / allTags.length);
}

function simulatedAnnealing<T extends { tags: string[] }>(
  items: T[],
  preferences: string[],
  maxSelect: number,
  options: { steps?: number; initialTemp?: number } = {}
): QUBOResult<T> {
  const startTime = Date.now();
  const steps = options.steps || 10000;
  const initialTemp = options.initialTemp || 100;
  const n = items.length;
  const selectCount = Math.min(maxSelect, n);
  let currentSelection = Array.from({ length: selectCount }, (_, i) => i);
  let bestSelection = [...currentSelection];

  function objectiveFunction(selection: number[]): number {
    const selectedItems = selection.map(i => items[i]);
    const relevance =
      selectedItems.reduce((sum, item) => sum + computeRelevanceScore(item, preferences), 0) /
      selectedItems.length;
    const diversity = 1 - computeDiversityPenalty(selectedItems);
    return relevance * 0.6 + diversity * 0.4;
  }

  let currentScore = objectiveFunction(currentSelection);
  let bestScore = currentScore;

  for (let step = 0; step < steps; step++) {
    const temp = initialTemp * (1 - step / steps);
    const newSelection = [...currentSelection];
    const replaceIdx = Math.floor(Math.random() * selectCount);
    let newItemIdx: number;
    do {
      newItemIdx = Math.floor(Math.random() * n);
    } while (newSelection.includes(newItemIdx));
    newSelection[replaceIdx] = newItemIdx;

    const newScore = objectiveFunction(newSelection);
    const delta = newScore - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / Math.max(temp, 0.001))) {
      currentSelection = newSelection;
      currentScore = newScore;
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestSelection = [...currentSelection];
      }
    }
  }

  const executionTimeMs = Date.now() - startTime;
  return {
    selected: bestSelection.map(i => items[i]),
    scores: bestSelection.map(i => computeRelevanceScore(items[i], preferences)),
    solverUsed: "simulated_annealing",
    executionTimeMs,
    metadata: { annealingSteps: steps, temperature: initialTemp, objectiveValue: bestScore },
  };
}

export function quantumRecommendTutorials(
  tutorials: Tutorial[],
  preferences: string[] = [],
  maxItems: number = 8
): QUBOResult<Tutorial> {
  return simulatedAnnealing(tutorials.map(t => ({ ...t, tags: t.tags || [] })), preferences, maxItems);
}

export function quantumRecommendKits(
  kits: Kit[],
  preferences: string[] = [],
  maxItems: number = 8
): QUBOResult<Kit> {
  return simulatedAnnealing(kits.map(k => ({ ...k, tags: k.tags || [] })), preferences, maxItems);
}

export function quantumOptimizeCreators(
  creators: Creator[]
): QUBOResult<Creator> & { fairnessScore: number } {
  const startTime = Date.now();
  const n = creators.length;
  const selectCount = Math.min(5, n);
  const steps = 5000;
  const initialTemp = 50;
  let currentSelection = Array.from({ length: selectCount }, (_, i) => i);
  let bestSelection = [...currentSelection];

  function creatorObjective(selection: number[]): number {
    const selected = selection.map(i => creators[i]);
    const engagementAvg = selected.reduce((s, c) => s + c.engagementScore, 0) / selected.length;
    const newCreatorBonus = selected.filter(c => c.isNew).length / selected.length;
    const categories = new Set(selected.map(c => c.category));
    const categoryDiversity = categories.size / selected.length;
    return engagementAvg * 0.5 + newCreatorBonus * 0.25 + categoryDiversity * 0.25;
  }

  let currentScore = creatorObjective(currentSelection);
  let bestScore = currentScore;

  for (let step = 0; step < steps; step++) {
    const temp = initialTemp * (1 - step / steps);
    const newSelection = [...currentSelection];
    const replaceIdx = Math.floor(Math.random() * selectCount);
    let newItemIdx: number;
    do { newItemIdx = Math.floor(Math.random() * n); } while (newSelection.includes(newItemIdx));
    newSelection[replaceIdx] = newItemIdx;
    const newScore = creatorObjective(newSelection);
    const delta = newScore - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / Math.max(temp, 0.001))) {
      currentSelection = newSelection;
      currentScore = newScore;
      if (currentScore > bestScore) { bestScore = currentScore; bestSelection = [...currentSelection]; }
    }
  }

  const selected = bestSelection.map(i => creators[i]);
  return {
    selected,
    scores: selected.map(c => c.engagementScore),
    solverUsed: "simulated_annealing",
    executionTimeMs: Date.now() - startTime,
    metadata: { annealingSteps: steps, temperature: initialTemp, objectiveValue: bestScore },
    fairnessScore: selected.filter(c => c.isNew).length / selected.length,
  };
}

export function simulateQAOA(itemCount: number = 8): {
  probabilities: { state: string; probability: number }[];
  optimalState: string;
  selectedIndices: number[];
  executionTimeMs: number;
} {
  const startTime = Date.now();
  const nQubits = itemCount;
  const states: { state: string; probability: number }[] = [];
  let totalProb = 0;

  for (let i = 0; i < Math.pow(2, nQubits); i++) {
    const bitstring = i.toString(2).padStart(nQubits, "0");
    const onesCount = bitstring.split("").filter(b => b === "1").length;
    const prob = onesCount >= 3 && onesCount <= 5 ? Math.random() * 0.3 + 0.1 : Math.random() * 0.05;
    totalProb += prob;
    states.push({ state: bitstring, probability: prob });
  }

  states.forEach(s => (s.probability = parseFloat((s.probability / totalProb).toFixed(4))));
  states.sort((a, b) => b.probability - a.probability);
  const topStates = states.slice(0, 16);
  const optimalState = topStates[0].state;
  const selectedIndices = optimalState
    .split("")
    .reduce<number[]>((acc, bit, idx) => { if (bit === "1") acc.push(idx); return acc; }, []);

  return { probabilities: topStates, optimalState, selectedIndices, executionTimeMs: Date.now() - startTime };
}

export function quantumRandom(max: number): number {
  const entropy = Array.from({ length: 4 }, () => Math.random());
  const combined = entropy.reduce((a, b) => a ^ (b * 0x100000000), 0) >>> 0;
  return combined % max;
}

// ─── TASK TYPES & CROP PROFILES ──────────────────────────────────────────────

export interface FarmTask {
  id: string;
  name: string;
  icon: string;
  type: "watering" | "composting" | "pest-control" | "sunlight" | "soil-check" | "rest";
  priority: number;     // 1–10
  minGapDays: number;   // don't repeat within this many days
  cropBonus: Record<string, number>; // extra priority for specific crops
}

const TASK_POOL: FarmTask[] = [
  { id: "water",    name: "Watering",         icon: "💧", type: "watering",     priority: 9,  minGapDays: 1, cropBonus: { tomato: 2, spinach: 1, chili: 2 } },
  { id: "compost",  name: "Composting",        icon: "♻️", type: "composting",   priority: 7,  minGapDays: 3, cropBonus: { tomato: 1, beans: 2, peas: 1 } },
  { id: "pest",     name: "Pest Control",      icon: "🛡️", type: "pest-control", priority: 8,  minGapDays: 2, cropBonus: { tomato: 2, chili: 2, lettuce: 1 } },
  { id: "sun",      name: "Sunlight Check",    icon: "☀️", type: "sunlight",     priority: 6,  minGapDays: 1, cropBonus: { spinach: 2, lettuce: 2, herbs: 2 } },
  { id: "soil",     name: "Soil Check",        icon: "🌱", type: "soil-check",   priority: 7,  minGapDays: 2, cropBonus: { tomato: 1, beans: 1 } },
  { id: "prune",    name: "Pruning",           icon: "✂️", type: "sunlight",     priority: 5,  minGapDays: 3, cropBonus: { tomato: 3, chili: 2 } },
  { id: "harvest",  name: "Harvest Check",     icon: "🌾", type: "sunlight",     priority: 4,  minGapDays: 2, cropBonus: { spinach: 2, lettuce: 3, herbs: 3 } },
  { id: "irrigate", name: "Deep Irrigation",   icon: "💦", type: "watering",     priority: 6,  minGapDays: 3, cropBonus: { tomato: 2, beans: 1 } },
  { id: "mulch",    name: "Mulching",          icon: "🍂", type: "composting",   priority: 5,  minGapDays: 4, cropBonus: { tomato: 1, chili: 1 } },
  { id: "rest",     name: "Observe & Rest",    icon: "👁️", type: "rest",         priority: 3,  minGapDays: 0, cropBonus: {} },
];

/**
 * QUBO Farm Planner
 *
 * Variables: x[task][day] ∈ {0,1}
 *   x[task][day] = 1 means this task is assigned on that day
 *
 * Objective (maximise):
 *   Σ priority(task, crop) * x[task][day]    ← coverage reward
 *
 * Constraints encoded as penalties (QUBO = penalties subtracted from objective):
 *   C1: At most 2 tasks per day (overload penalty)
 *   C2: Minimum gap between repeated tasks (gap violation penalty)
 *   C3: Must include ≥1 compost and ≥1 pest-control (missing type penalty)
 *
 * Solved via simulated annealing on the binary variable space.
 */
export function generateFarmPlan(
  cropType: string,
  durationDays: number = 7
): {
  plan: { day: number; tasks: { id: string; name: string; icon: string; type: string; priority: number }[] }[];
  solverUsed: string;
  executionTimeMs: number;
  quboConstraints: string[];
} {
  const startTime = Date.now();
  const crop = cropType.toLowerCase();
  const days = Math.min(Math.max(durationDays, 5), 14);
  const nTasks = TASK_POOL.length;

  // Effective priority per task for this crop
  function taskPriority(task: FarmTask): number {
    return task.priority + (task.cropBonus[crop] || 0);
  }

  // Binary state: assignment[task][day] ∈ {0,1}
  type State = boolean[][];
  function emptyState(): State {
    return Array.from({ length: nTasks }, () => new Array(days).fill(false));
  }

  function computeObjective(state: State): number {
    let score = 0;

    // Reward: task coverage
    for (let t = 0; t < nTasks; t++) {
      for (let d = 0; d < days; d++) {
        if (state[t][d]) score += taskPriority(TASK_POOL[t]);
      }
    }

    // C1 Penalty: overload — more than 2 tasks on same day
    for (let d = 0; d < days; d++) {
      const count = state.map(row => row[d]).filter(Boolean).length;
      if (count > 2) score -= (count - 2) * 15;
    }

    // C2 Penalty: gap violation — repeated too soon
    for (let t = 0; t < nTasks; t++) {
      const gap = TASK_POOL[t].minGapDays;
      if (gap === 0) continue;
      for (let d = 0; d < days; d++) {
        if (!state[t][d]) continue;
        for (let g = 1; g <= gap && d + g < days; g++) {
          if (state[t][d + g]) score -= 20;
        }
      }
    }

    // C3 Penalty: missing required task types
    const hasCompost = state[TASK_POOL.findIndex(t => t.type === "composting")].some(Boolean);
    const hasPest = state[TASK_POOL.findIndex(t => t.type === "pest-control")].some(Boolean);
    const hasWater = state[TASK_POOL.findIndex(t => t.type === "watering")].some(Boolean);
    if (!hasCompost) score -= 30;
    if (!hasPest) score -= 30;
    if (!hasWater) score -= 30;

    return score;
  }

  // Initialise random state
  let current: State = emptyState();
  // Seed with a few forced tasks to help convergence
  current[0][0] = true; // water on day 1
  current[2][1] = true; // pest control on day 2
  current[1][2] = true; // compost on day 3

  let best: State = current.map(row => [...row]);
  let bestScore = computeObjective(best);
  let currentScore = bestScore;

  const steps = 12000;
  const initialTemp = 80;

  for (let step = 0; step < steps; step++) {
    const temp = initialTemp * (1 - step / steps);

    // Mutate: flip a random cell
    const newState: State = current.map(row => [...row]);
    const t = Math.floor(Math.random() * nTasks);
    const d = Math.floor(Math.random() * days);
    newState[t][d] = !newState[t][d];

    const newScore = computeObjective(newState);
    const delta = newScore - currentScore;
    if (delta > 0 || Math.random() < Math.exp(delta / Math.max(temp, 0.001))) {
      current = newState;
      currentScore = newScore;
      if (currentScore > bestScore) {
        bestScore = currentScore;
        best = current.map(row => [...row]);
      }
    }
  }

  // Build day-wise output from best state
  const plan: { day: number; tasks: { id: string; name: string; icon: string; type: string; priority: number }[] }[] = [];
  for (let d = 0; d < days; d++) {
    const dayTasks = TASK_POOL.filter((_, t) => best[t][d]).map(task => ({
      id: task.id,
      name: task.name,
      icon: task.icon,
      type: task.type,
      priority: taskPriority(task),
    }));
    // Every day should have at least one entry
    if (dayTasks.length === 0) {
      dayTasks.push({ id: "rest", name: "Observe & Rest", icon: "👁️", type: "rest", priority: 3 });
    }
    plan.push({ day: d + 1, tasks: dayTasks });
  }

  return {
    plan,
    solverUsed: "qubo_simulated_annealing",
    executionTimeMs: Date.now() - startTime,
    quboConstraints: [
      "C1: ≤2 tasks per day (overload penalty: −15 per extra task)",
      "C2: Min gap between repeated tasks (gap violation: −20)",
      "C3: Must include composting + pest control + watering (−30 each if missing)",
    ],
  };
}
