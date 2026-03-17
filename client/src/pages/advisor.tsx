import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Sparkles, Sprout, Leaf, CalendarDays, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
  links?: { title: string; href: string }[];
  plan?: { day: string; task: string; type: string }[];
}

export default function AdvisorPage() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your Farmora AI advisor. Ask me anything about soil health, pest control, or type 'Generate Quantum Plan for [Crop]' to see our QUBO-optimized task scheduler." 
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI / Quantum response
    setTimeout(() => {
      setIsTyping(false);
      
      const isPlannerRequest = userMsg.content.toLowerCase().includes("plan") || userMsg.content.toLowerCase().includes("schedule");
      
      if (isPlannerRequest) {
         const planMsg: Message = {
            role: "assistant",
            content: "I've run a Simulated Annealing algorithm (QUBO formulation) to optimize your 7-day crop schedule. This maximizes resource usage while respecting biological constraints.",
            plan: [
              { day: "Day 1", task: "Soil Aeration & pH Balancing", type: "Prep" },
              { day: "Day 2", task: "Sow Seeds (Morning) & Light Watering", type: "Planting" },
              { day: "Day 3", task: "Rest / Sun Exposure", type: "Passive" },
              { day: "Day 4", task: "Apply Organic Fertilizer (Nitrogen rich)", type: "Nutrients" },
              { day: "Day 5", task: "Pest Inspection & Neem Oil Spray", type: "Protection" },
              { day: "Day 6", task: "Deep Watering (Evening)", type: "Hydration" },
              { day: "Day 7", task: "Prune first true leaves (if applicable)", type: "Maintenance" }
            ]
         };
         setMessages(prev => [...prev, planMsg]);
      } else {
        const aiMsg: Message = {
          role: "assistant",
          content: "Based on organic farming principles, for that issue I recommend using a neem oil solution. Mix 5ml of neem oil with 1 liter of water and a drop of soap. Apply every 7 days.",
          links: [
            { title: "Neem Oil Mastery Tutorial", href: "/tutorials/3" },
            { title: "Buy Cold Pressed Neem Oil", href: "/kits/3" }
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    }, 1500);
  };

  return (
    <div className="container max-w-6xl px-4 py-8 h-[calc(100vh-5rem)] flex gap-6 relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Sidebar Suggestions */}
      <div className="hidden md:flex flex-col w-72 space-y-6">
        <div>
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Prompts
          </h3>
          <div className="space-y-3">
            {[
              "Best compost for tomatoes?",
              "How to treat aphids naturally?",
              "Generate Quantum Plan for Spinach",
              "Improving clay soil"
            ].map((prompt, i) => (
              <Button 
                key={i} 
                variant="outline" 
                className="w-full justify-start text-sm h-auto py-4 px-4 whitespace-normal text-left border-border/50 hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all shadow-sm"
                onClick={() => setInput(prompt)}
              >
                {prompt.includes("Quantum") ? (
                  <Activity className="w-4 h-4 mr-3 text-primary shrink-0" />
                ) : (
                  <Leaf className="w-4 h-4 mr-3 text-primary shrink-0" />
                )}
                {prompt}
              </Button>
            ))}
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20 rounded-2xl shadow-sm">
           <CardHeader className="p-4 pb-2">
             <CardTitle className="text-sm flex items-center gap-2">
               <Activity className="w-4 h-4 text-primary" />
               Engine Status
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2 font-mono">
             <div className="flex justify-between">
               <span>QUBO Solver:</span>
               <span className="text-primary font-bold">ONLINE</span>
             </div>
             <div className="flex justify-between">
               <span>Annealing Steps:</span>
               <span>10,000</span>
             </div>
             <div className="flex justify-between">
               <span>Constraint strictness:</span>
               <span>High</span>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50 shadow-xl bg-background/80 backdrop-blur-md rounded-[2rem]">
        <div className="bg-white/50 p-5 border-b flex items-center gap-3 backdrop-blur-sm">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Sprout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-none">Farmora Advisor</h2>
            <span className="text-xs text-primary font-bold tracking-wider uppercase flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" /> Quantum-Optimized
            </span>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={cn("flex gap-4 max-w-[85%]", m.role === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <Avatar className={cn("h-10 w-10 border shadow-sm", m.role === "assistant" ? "bg-primary border-primary" : "bg-white border-border")}>
                  {m.role === "assistant" ? (
                    <div className="flex items-center justify-center w-full h-full text-white"><Sprout className="w-5 h-5" /></div>
                  ) : (
                    <AvatarFallback className="bg-white text-foreground font-bold">U</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="space-y-4 w-full">
                  <div className={cn(
                    "p-5 text-sm shadow-sm",
                    m.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-[1.5rem] rounded-tr-sm" 
                      : "bg-white border border-border/50 rounded-[1.5rem] rounded-tl-sm text-foreground/90"
                  )}>
                    <p className="leading-relaxed text-base">{m.content}</p>
                    
                    {/* Recommendations */}
                    {m.links && (
                      <div className="mt-5 space-y-3 pt-4 border-t border-border/10">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recommended Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {m.links.map((link, idx) => (
                            <a 
                              key={idx} 
                              href={link.href}
                              className="text-sm bg-primary/5 hover:bg-primary/10 text-primary font-medium px-4 py-2 rounded-full border border-primary/20 transition-colors inline-block"
                            >
                              {link.title} →
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quantum Plan Output */}
                  {m.plan && (
                    <Card className="bg-primary/5 border-primary/20 rounded-[1.5rem] overflow-hidden shadow-md">
                       <div className="bg-primary/10 p-4 border-b border-primary/10 flex items-center gap-2">
                         <CalendarDays className="w-5 h-5 text-primary" />
                         <span className="font-bold text-primary">Optimized 7-Day Schedule</span>
                       </div>
                       <div className="p-4 space-y-3">
                         {m.plan.map((step, idx) => (
                           <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-border/50 shadow-sm">
                             <span className="font-bold text-primary w-12 text-sm">{step.day}</span>
                             <div className="flex-1">
                               <p className="text-sm font-medium">{step.task}</p>
                             </div>
                             <span className="text-[10px] uppercase font-bold tracking-wider bg-muted px-2 py-1 rounded-full text-muted-foreground">
                               {step.type}
                             </span>
                           </div>
                         ))}
                       </div>
                    </Card>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
                <Avatar className="h-10 w-10 bg-primary border border-primary shadow-sm">
                  <div className="flex items-center justify-center w-full h-full text-white"><Sprout className="w-5 h-5" /></div>
                </Avatar>
                <div className="bg-white border border-border/50 rounded-[1.5rem] rounded-tl-sm p-5 shadow-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="p-5 bg-white border-t border-border/50">
          <form onSubmit={handleSend} className="flex gap-3 relative">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about crops, soil, or request an optimized plan..." 
              className="flex-1 bg-muted/30 border-border/50 h-14 rounded-full pl-6 pr-14 text-base focus-visible:ring-primary/50 shadow-inner"
              disabled={isTyping}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-2 h-10 w-10 rounded-full shadow-md hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4 ml-1" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
