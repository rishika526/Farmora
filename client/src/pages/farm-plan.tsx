import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Cpu, Sparkles, Leaf, ChevronRight, Info } from "lucide-react";
import { quantumFarmPlan, type FarmPlan, type FarmPlanDay } from "@/lib/api";
import { cn } from "@/lib/utils";

const CROPS = [
  { value: "tomato",   label: "🍅 Tomato",   tip: "Needs frequent watering and pest watch." },
  { value: "spinach",  label: "🌿 Spinach",   tip: "Fast-growing, loves sunlight checks." },
  { value: "chili",    label: "🌶️ Chili",     tip: "High pest-control priority." },
  { value: "beans",    label: "🫘 Beans",     tip: "Benefits from extra composting." },
  { value: "lettuce",  label: "🥬 Lettuce",   tip: "Shade-sensitive, needs sunlight checks." },
  { value: "herbs",    label: "🌱 Herbs",     tip: "Frequent harvest checks." },
  { value: "peas",     label: "🫛 Peas",      tip: "Good with compost and soil checks." },
];

const TYPE_COLOURS: Record<string, string> = {
  watering:     "bg-blue-100   text-blue-700   border-blue-200",
  composting:   "bg-amber-100  text-amber-700  border-amber-200",
  "pest-control": "bg-red-100  text-red-700    border-red-200",
  sunlight:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  "soil-check": "bg-green-100  text-green-700  border-green-200",
  rest:         "bg-gray-100   text-gray-500   border-gray-200",
};

function TaskBadge({ task }: { task: FarmPlanDay["tasks"][number] }) {
  const colour = TYPE_COLOURS[task.type] || TYPE_COLOURS.rest;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium", colour)}>
      <span>{task.icon}</span>
      {task.name}
    </span>
  );
}

function DayCard({ dayPlan, index }: { dayPlan: FarmPlanDay; index: number }) {
  const isLight = dayPlan.tasks.length === 1 && dayPlan.tasks[0].type === "rest";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative p-6 rounded-[1.5rem] border transition-all",
        isLight ? "bg-muted/30 border-border/40" : "bg-white border-border/60 shadow-md"
      )}
      data-testid={`farm-day-${dayPlan.day}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm border",
          isLight ? "bg-muted text-muted-foreground border-border/30" : "bg-primary/10 text-primary border-primary/20"
        )}>
          {dayPlan.day}
        </div>
        <span className="font-bold text-base text-foreground">Day {dayPlan.day}</span>
        {!isLight && (
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">
            {dayPlan.tasks.length} task{dayPlan.tasks.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {dayPlan.tasks.map(t => <TaskBadge key={t.id} task={t} />)}
      </div>
    </motion.div>
  );
}

export default function FarmPlanPage() {
  const [crop, setCrop] = useState("tomato");
  const [days, setDays] = useState(7);
  const [plan, setPlan] = useState<FarmPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCrop = CROPS.find(c => c.value === crop)!;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await quantumFarmPlan(crop, days);
      setPlan(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container max-w-5xl px-4 py-12 min-h-screen relative">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header */}
      <div className="space-y-4 mb-12">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-5xl font-bold tracking-tight">My Farm Plan</h1>
          <span className="bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> AI Powered
          </span>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Generate a smart, personalised organic farming schedule. Our AI maximises task coverage while ensuring proper spacing and essential care steps.
        </p>
      </div>

      {/* Config card */}
      <Card className="rounded-[2rem] border-border/50 shadow-xl mb-10 overflow-hidden">
        <div className="bg-primary/5 border-b border-primary/10 px-8 py-5 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">Configure Your Plan</span>
        </div>
        <CardContent className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Crop selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Leaf className="w-4 h-4 text-primary" />
                Select Crop
              </label>
              <Select value={crop} onValueChange={setCrop}>
                <SelectTrigger className="h-14 rounded-2xl border-border text-base" data-testid="select-crop">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {CROPS.map(c => (
                    <SelectItem key={c.value} value={c.value} className="text-base py-3">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                {selectedCrop.tip}
              </p>
            </div>

            {/* Duration slider */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Duration: <span className="text-primary">{days} days</span>
              </label>
              <div className="pt-3 pb-2 px-1">
                <Slider
                  min={5}
                  max={14}
                  step={1}
                  value={[days]}
                  onValueChange={([v]) => setDays(v)}
                  className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
                  data-testid="slider-days"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>5 days</span>
                <span>14 days</span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="h-16 px-10 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 gap-3"
            onClick={handleGenerate}
            disabled={loading}
            data-testid="button-generate-plan"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Cpu className="w-5 h-5" />
                Generate My Plan
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Plan header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="space-y-1">
                <p className="font-bold text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Your Smart Plan — {selectedCrop.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  Generated in {plan.executionTimeMs}ms · {plan.plan.length} days scheduled
                </p>
              </div>
              <div className="text-xs space-y-1 text-right">
                <p className="font-mono text-muted-foreground">Max 2 tasks per day</p>
                <p className="font-mono text-muted-foreground">Proper rest gaps enforced</p>
                <p className="font-mono text-muted-foreground">Key tasks always included</p>
              </div>
            </div>

            {/* Day cards grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plan.plan.map((day, i) => (
                <DayCard key={day.day} dayPlan={day} index={i} />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
              <span className="text-sm font-semibold text-muted-foreground">Task types:</span>
              {Object.entries({
                watering: "💧 Watering",
                composting: "♻️ Composting",
                "pest-control": "🛡️ Pest Control",
                sunlight: "☀️ Sunlight",
                "soil-check": "🌱 Soil Check",
              }).map(([type, label]) => (
                <span key={type} className={cn("text-xs px-3 py-1 rounded-full border font-medium", TYPE_COLOURS[type])}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!plan && !loading && (
        <div className="text-center py-20 text-muted-foreground">
          <CalendarDays className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Select a crop and duration, then generate your plan.</p>
          <p className="text-sm mt-2">The AI will optimise task coverage, spacing, and crop-specific priorities.</p>
        </div>
      )}
    </div>
  );
}
