import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplets,
  Filter,
  Leaf,
  Pencil,
  Plus,
  Printer,
  RefreshCcw,
  ShieldCheck,
  Sprout,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { quantumFarmPlan, type FarmPlanDay } from "@/lib/api";
import { cn } from "@/lib/utils";

type TaskCategory = "watering" | "composting" | "pest control" | "soil preparation" | "harvesting" | "monitoring";
type TaskPriority = "high" | "medium" | "low";
type FilterType = "all" | "pending" | "completed" | "high";

interface PlannerTask {
  id: string;
  title: string;
  note: string;
  day: number;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedTime: string;
  completed: boolean;
}

const STORAGE_KEY = "farmora:smart-farm-planner";

const CROPS = ["Tomato", "Spinach", "Chili", "Beans", "Lettuce", "Herbs", "Peas", "Carrot", "Cucumber"];
const SOILS = ["Loamy", "Sandy", "Clay", "Silty", "Compost-rich", "Mixed balcony soil"];
const GOALS = ["Maximum yield", "Low water use", "Soil health", "Pest prevention", "Beginner friendly"];
const EXPERIENCE = ["Beginner", "Intermediate", "Experienced"];
const CATEGORIES: TaskCategory[] = ["watering", "composting", "pest control", "soil preparation", "harvesting", "monitoring"];
const PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

const categoryStyles: Record<TaskCategory, string> = {
  watering: "bg-blue-50 text-blue-700 border-blue-200",
  composting: "bg-amber-50 text-amber-700 border-amber-200",
  "pest control": "bg-rose-50 text-rose-700 border-rose-200",
  "soil preparation": "bg-emerald-50 text-emerald-700 border-emerald-200",
  harvesting: "bg-lime-50 text-lime-700 border-lime-200",
  monitoring: "bg-sky-50 text-sky-700 border-sky-200",
};

const priorityStyles: Record<TaskPriority, string> = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

function categoryIcon(category: TaskCategory) {
  const icons = {
    watering: Droplets,
    composting: Leaf,
    "pest control": ShieldCheck,
    "soil preparation": Sprout,
    harvesting: CheckCircle2,
    monitoring: CalendarDays,
  };
  return icons[category];
}

function normalizeCategory(type: string): TaskCategory {
  if (type.includes("water")) return "watering";
  if (type.includes("compost")) return "composting";
  if (type.includes("pest")) return "pest control";
  if (type.includes("soil")) return "soil preparation";
  if (type.includes("harvest")) return "harvesting";
  return "monitoring";
}

function priorityFromScore(score?: number): TaskPriority {
  if ((score || 0) >= 9) return "high";
  if ((score || 0) >= 6) return "medium";
  return "low";
}

function estimateTime(category: TaskCategory, experienceLevel: string) {
  const base: Record<TaskCategory, string> = {
    watering: "20 min",
    composting: "35 min",
    "pest control": "30 min",
    "soil preparation": "45 min",
    harvesting: "40 min",
    monitoring: "15 min",
  };
  return experienceLevel === "Beginner" && category !== "monitoring" ? `${base[category]} - 1 hr` : base[category];
}

function createTaskFromApiTask(task: FarmPlanDay["tasks"][number], day: number, experienceLevel: string): PlannerTask {
  const category = normalizeCategory(task.type);
  return {
    id: `${day}-${task.id}-${crypto.randomUUID()}`,
    title: task.name,
    note: "This task helps balance crop needs, workload, timing, and sustainability.",
    day,
    category,
    priority: priorityFromScore(task.priority),
    estimatedTime: estimateTime(category, experienceLevel),
    completed: false,
  };
}

function blankTask(day = 1): PlannerTask {
  return {
    id: crypto.randomUUID(),
    title: "New farm task",
    note: "Add a short note for this task.",
    day,
    category: "monitoring",
    priority: "medium",
    estimatedTime: "20 min",
    completed: false,
  };
}

function EditableTaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: PlannerTask;
  onUpdate: (task: PlannerTask) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const Icon = categoryIcon(task.category);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Card className={cn("rounded-2xl border bg-card shadow-sm transition-all", task.completed && "bg-muted/40 opacity-75")}>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => onUpdate({ ...task, completed: checked === true })}
              className="mt-1"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold", categoryStyles[task.category])}>
                  <Icon className="h-3.5 w-3.5" />
                  {task.category}
                </span>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold capitalize", priorityStyles[task.priority])}>
                  {task.priority} priority
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {task.estimatedTime}
                </span>
              </div>
              <h3 className={cn("mt-3 text-lg font-bold", task.completed && "line-through")}>{task.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{task.note}</p>
              <p className="mt-2 text-xs font-semibold text-primary">Day {task.day}</p>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setEditing((value) => !value)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full text-destructive" onClick={() => onDelete(task.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {editing && (
            <div className="grid gap-3 rounded-2xl border bg-muted/25 p-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Task title</Label>
                <Input value={task.title} onChange={(event) => onUpdate({ ...task, title: event.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Task note</Label>
                <Textarea value={task.note} onChange={(event) => onUpdate({ ...task, note: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Day</Label>
                <Input type="number" min={1} value={task.day} onChange={(event) => onUpdate({ ...task, day: Number(event.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Estimated time</Label>
                <Input value={task.estimatedTime} onChange={(event) => onUpdate({ ...task, estimatedTime: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={task.priority} onValueChange={(value) => onUpdate({ ...task, priority: value as TaskPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={task.category} onValueChange={(value) => onUpdate({ ...task, category: value as TaskCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function FarmPlanPage() {
  const [crop, setCrop] = useState("Tomato");
  const [farmSize, setFarmSize] = useState("0.5 acre");
  const [soilType, setSoilType] = useState("Loamy");
  const [days, setDays] = useState(7);
  const [goal, setGoal] = useState("Maximum yield");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const completed = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        if (filter === "high") return task.priority === "high";
        return true;
      })
      .sort((a, b) => a.day - b.day);
  }, [filter, tasks]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce<Record<number, PlannerTask[]>>((acc, task) => {
      acc[task.day] = acc[task.day] || [];
      acc[task.day].push(task);
      return acc;
    }, {});
  }, [filteredTasks]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await quantumFarmPlan({ crop, days, farmSize, soilType, goal, experienceLevel });
      const nextTasks = result.plan.flatMap((dayPlan) =>
        dayPlan.tasks.map((task) => createTaskFromApiTask(task, dayPlan.day, experienceLevel)),
      );
      setTasks(nextTasks.length ? nextTasks : [blankTask(1)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateTask(updated: PlannerTask) {
    setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function addTask() {
    setTasks((current) => [...current, blankTask(current.at(-1)?.day || 1)]);
  }

  function resetPlan() {
    setTasks([]);
    setError(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(22,163,74,0.12),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.45)]">
      <div className="container max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          <aside className="space-y-5">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Leaf className="h-3.5 w-3.5" />
                Smart Farm Planner
              </span>
              <h1 className="text-4xl font-bold tracking-tight">Build a practical day-wise farm plan</h1>
              <p className="text-muted-foreground">
                Create an AI-optimized plan that balances crop needs, workload, timing, and sustainability.
              </p>
            </div>

            <Card className="rounded-[2rem] border-border/60 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  Farm details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Crop type</Label>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{CROPS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Farm size</Label>
                  <Input className="h-12 rounded-2xl" value={farmSize} onChange={(event) => setFarmSize(event.target.value)} placeholder="0.5 acre or 500 sq ft" />
                </div>
                <div className="space-y-2">
                  <Label>Soil type</Label>
                  <Select value={soilType} onValueChange={setSoilType}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{SOILS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Duration: <span className="text-primary">{days} days</span></Label>
                  <Slider min={5} max={21} step={1} value={[days]} onValueChange={([value]) => setDays(value)} />
                </div>
                <div className="space-y-2">
                  <Label>Farming goal</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{GOALS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{EXPERIENCE.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="h-13 w-full rounded-full text-base shadow-lg" onClick={handleGenerate} disabled={loading}>
                  {loading ? "Creating your smart farm plan..." : "Generate Smart Plan"}
                </Button>
                {error && <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              </CardContent>
            </Card>
          </aside>

          <main className="space-y-6">
            <Card className="rounded-[2rem] border-primary/15 bg-primary/5 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-primary">AI-Optimized Plan</p>
                    <h2 className="mt-1 text-2xl font-bold">Checklist progress</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {completed} of {tasks.length} tasks completed - {progress}% done
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-full gap-2" onClick={addTask}>
                      <Plus className="h-4 w-4" />
                      Add Task
                    </Button>
                    <Button variant="outline" className="rounded-full gap-2" onClick={() => window.print()}>
                      <Printer className="h-4 w-4" />
                      Print / Save Plan
                    </Button>
                    <Button variant="ghost" className="rounded-full gap-2 text-destructive" onClick={resetPlan}>
                      <RefreshCcw className="h-4 w-4" />
                      Reset Plan
                    </Button>
                  </div>
                </div>
                <Progress value={progress} className="mt-5 h-3" />
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              {[
                ["all", "All"],
                ["pending", "Pending"],
                ["completed", "Completed"],
                ["high", "High priority"],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  size="sm"
                  variant={filter === value ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setFilter(value as FilterType)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <AnimatePresence mode="popLayout">
              {loading ? (
                <Card className="rounded-[2rem] border-dashed">
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                    Creating your smart farm plan...
                  </CardContent>
                </Card>
              ) : tasks.length === 0 ? (
                <Card className="rounded-[2rem] border-dashed bg-card/70">
                  <CardContent className="p-12 text-center">
                    <CalendarDays className="mx-auto mb-4 h-14 w-14 text-primary/40" />
                    <h3 className="text-xl font-bold">No plan yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                      Fill in your farm details and generate a day-wise schedule, or add your first custom task manually.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredTasks.length === 0 ? (
                <Card className="rounded-[2rem] border-dashed">
                  <CardContent className="p-10 text-center text-muted-foreground">No tasks match this filter.</CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTasks).map(([day, dayTasks]) => (
                    <section key={day} className="relative">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md">
                          {day}
                        </div>
                        <div>
                          <h3 className="font-bold">Day {day}</h3>
                          <p className="text-xs text-muted-foreground">Best task schedule for this day</p>
                        </div>
                      </div>
                      <div className="grid gap-3">
                        {dayTasks.map((task) => (
                          <EditableTaskCard key={task.id} task={task} onUpdate={updateTask} onDelete={deleteTask} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
