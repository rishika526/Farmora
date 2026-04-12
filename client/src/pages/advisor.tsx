import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Sprout, Leaf, CalendarDays, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { quantumFarmPlan } from "@/lib/api";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  links?: { title: string; href: string }[];
  plan?: { day: number; tasks: { name: string; icon: string; type: string }[] }[];
}

// ─── SMART RESPONSE ROUTER ────────────────────────────────────────────────────
function getSmartResponse(text: string): Omit<Message, "role"> | null {
  const t = text.toLowerCase().trim();

  if (/^(hi|hello|hey|hiya|howdy|good (morning|afternoon|evening))/.test(t)) {
    return { content: "Hi there! 👋 How can I help you with your farming today? You can ask me about crops, soil health, pest control, or request a personalised care plan." };
  }

  if (t.includes("tomato") || t.includes("tomatoes")) {
    return {
      content: "Tomatoes love full sun (6–8 hrs/day) and consistent moisture — never let the soil dry out completely. Feed with a low-nitrogen, high-phosphorus fertiliser once flowering starts. Watch for blight: if you see brown patches on leaves, remove them immediately and apply a copper-based spray.",
      links: [
        { title: "Companion Planting for Tomatoes", href: "/tutorials/t7" },
        { title: "Professional Soil Test Kit", href: "/kits" },
      ],
    };
  }

  if (t.includes("pest") || t.includes("aphid") || t.includes("mite") || t.includes("insect") || t.includes("bug")) {
    return {
      content: "For organic pest control, neem oil is your best friend. Mix 5ml cold-pressed neem oil + 1 litre water + a drop of liquid soap. Spray every 7 days at dusk (protects beneficial insects). For aphid clusters, a strong jet of water knocks most off instantly.",
      links: [
        { title: "Neem Oil & Garlic Spray Tutorial", href: "/tutorials/t2" },
        { title: "Neem Oil Cold-Pressed Concentrate", href: "/kits" },
      ],
    };
  }

  if (t.includes("soil") || t.includes("compost") || t.includes("fertiliser") || t.includes("fertilizer") || t.includes("nutrient")) {
    return {
      content: "Healthy soil = healthy plants. Start by testing your pH — most vegetables prefer 6.0–7.0. Add compost (vermicompost is excellent) to improve water retention and microbial life. Avoid synthetic fertilisers which disrupt the soil food web.",
      links: [
        { title: "Soil Health 101", href: "/tutorials/t3" },
        { title: "Urban Composter Starter Kit", href: "/kits" },
      ],
    };
  }

  if (t.includes("water") || t.includes("irrigation") || t.includes("drip")) {
    return {
      content: "Water deeply and infrequently — this encourages roots to grow down rather than stay shallow. Drip irrigation is the gold standard for organic farms: it keeps foliage dry (reducing fungal risk) and reduces usage by up to 50%. Water in the morning to minimise evaporation.",
      links: [
        { title: "Automatic Drip Irrigation System", href: "/kits" },
      ],
    };
  }

  if (t.includes("seed") || t.includes("seedling") || t.includes("germination") || t.includes("grow")) {
    return {
      content: "Start seeds in a warm, humid environment — a simple damp paper towel in a zip-lock bag works perfectly for testing viability. Once sprouted, move to a seedling tray with well-draining compost. Harden off seedlings over 7–10 days before transplanting outdoors.",
      links: [
        { title: "Organic Heirloom Seed Collection", href: "/kits" },
      ],
    };
  }

  if (t.includes("winter") || t.includes("cold") || t.includes("frost") || t.includes("season")) {
    return {
      content: "Extend your growing season with cold frames or fleece cloches. Frost-hardy crops like kale, spinach, and hardy herbs can survive temperatures down to -5°C. Mulch heavily around root vegetables to insulate the soil and harvest through winter.",
      links: [
        { title: "Winter Gardening Tutorial", href: "/tutorials/t5" },
      ],
    };
  }

  if (t.includes("raised bed") || t.includes("raised-bed") || t.includes("container")) {
    return {
      content: "Raised beds are one of the best investments for organic growers. Fill with a mix of topsoil, compost, and aged manure. Cedar is the best wood — it's naturally rot-resistant without chemical treatment. Aim for at least 30cm deep for root vegetables.",
      links: [
        { title: "Building Raised Beds Tutorial", href: "/tutorials/t6" },
        { title: "Raised Bed Garden Kit (Cedar)", href: "/kits" },
      ],
    };
  }

  return null;
}

// ─── QUICK PROMPTS ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: "Best compost for tomatoes?", icon: Leaf },
  { label: "How to treat aphids naturally?", icon: Leaf },
  { label: "How do I improve my soil?", icon: Leaf },
  { label: "Plan for Spinach", icon: CalendarDays },
  { label: "Schedule for Tomatoes", icon: CalendarDays },
];

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-4">
      {[0, 150, 300].map(delay => (
        <motion.div
          key={delay}
          className="w-2 h-2 rounded-full bg-primary/50"
          animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000 }}
        />
      ))}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────────────────
function BotAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-7 w-7" : "h-10 w-10";
  return (
    <div className={`${s} rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm`}>
      <Sprout className={size === "sm" ? "w-3.5 h-3.5 text-white" : "w-5 h-5 text-white"} />
    </div>
  );
}

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={cn("flex gap-3 items-end", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser && <BotAvatar />}

      <div className={cn("max-w-[80%] space-y-3", isUser && "items-end")}>
        <div className={cn(
          "px-5 py-4 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-white rounded-[1.5rem] rounded-br-md"
            : "bg-card border border-border/50 text-foreground rounded-[1.5rem] rounded-bl-md shadow-sm"
        )}>
          {msg.content}

          {msg.links && (
            <div className="mt-4 pt-3 border-t border-border/20 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-70">Related Resources</p>
              <div className="flex flex-wrap gap-2">
                {msg.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.href}
                    className="text-xs bg-primary/10 hover:bg-primary/20 text-primary font-medium px-3 py-1.5 rounded-full border border-primary/20 transition-colors"
                  >
                    {link.title} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {msg.plan && (
          <Card className="bg-primary/5 border-primary/20 rounded-[1.5rem] overflow-hidden">
            <div className="bg-primary/10 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="font-bold text-sm text-primary">{msg.plan.length}-Day Care Plan</span>
            </div>
            <CardContent className="p-3 space-y-2">
              {msg.plan.map((day, i) => (
                <div key={i} className="bg-background rounded-xl border border-border/50 px-3 py-2.5 flex items-start gap-3" data-testid={`plan-day-${i}`}>
                  <span className="text-xs font-bold text-primary w-10 shrink-0 pt-0.5">Day {day.day}</span>
                  <div className="flex flex-wrap gap-2">
                    {day.tasks.map((task, j) => (
                      <span key={j} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {task.icon} {task.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdvisorPage() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! 👋 I'm Farmora AI, your organic farming assistant. Ask me anything — crops, soil health, pest control — or type \"Plan for [Crop]\" to get a personalised care schedule.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));

    const isPlan = /\b(plan|schedule)\b/i.test(text);

    if (isPlan) {
      try {
        const cropMatch = text.match(/(?:plan|schedule)\s+(?:for\s+)?(.+)/i);
        const crop = cropMatch?.[1]?.trim() || "Spinach";
        const result = await quantumFarmPlan(crop, 7);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Here's your personalised 7-day care plan for ${crop}. It's optimised around the crop's specific needs — watering, composting, and pest control are all scheduled to avoid overload.`,
          plan: result.plan,
        }]);
      } catch {
        setMessages(prev => [...prev, { role: "assistant", content: "I wasn't able to generate the plan right now. Please try again in a moment." }]);
      }
    } else {
      const smart = getSmartResponse(text);
      if (smart) {
        setMessages(prev => [...prev, { role: "assistant", ...smart }]);
      } else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Great question! Based on organic farming best practices, I'd recommend starting with a soil health assessment — it's the foundation of everything. Test your pH, check your compost levels, and make sure you have good drainage before planting. Would you like me to build a care plan for a specific crop?",
          links: [
            { title: "Soil Health 101", href: "/tutorials/t3" },
            { title: "Explore Farm Planner", href: "/farm-plan" },
          ],
        }]);
      }
    }

    setIsTyping(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="container max-w-6xl px-4 py-8 h-[calc(100vh-5rem)] flex gap-6">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 space-y-5 shrink-0">
        <div>
          <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-foreground">
            <MessageCircle className="w-4 h-4 text-primary" />
            Quick Prompts
          </h3>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((p, i) => (
              <button
                key={i}
                className="w-full text-left text-sm px-4 py-3 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground flex items-start gap-2.5 shadow-sm"
                onClick={() => sendMessage(p.label)}
                data-testid={`button-prompt-${i}`}
              >
                <p.icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            Farmora AI
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Powered by smart agronomic models trained on thousands of organic farming guides. Always improving.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-primary font-medium">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Online &middot; Ready to help
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden border border-border/50 shadow-xl bg-background rounded-[2rem]">
        {/* Header */}
        <div className="bg-card p-4 border-b border-border/50 flex items-center gap-3">
          <BotAvatar />
          <div>
            <p className="font-bold text-base leading-none">Farmora AI</p>
            <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block animate-pulse" />
              Organic Farming Assistant
            </p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-5">
          <div className="space-y-5 pb-2">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 items-end"
              >
                <BotAvatar />
                <div className="bg-card border border-border/50 rounded-[1.5rem] rounded-bl-md shadow-sm">
                  <TypingDots />
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about crops, soil, or farming plans…"
              rows={1}
              disabled={isTyping}
              className="flex-1 resize-none min-h-[44px] max-h-32 rounded-2xl px-4 py-3 text-sm border-border/60 bg-background focus-visible:ring-primary/50 shadow-inner"
              data-testid="input-chat"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 rounded-full shrink-0 shadow-md hover:scale-105 transition-transform"
              data-testid="button-send"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Press Enter to send &middot; Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
