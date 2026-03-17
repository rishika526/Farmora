import TutorialCard from "@/components/ui-custom/tutorial-card";
import { MOCK_TUTORIALS } from "@/mock/data";
import { useState } from "react";
import { Search, SlidersHorizontal, Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QuantumToggle from "@/components/ui-custom/quantum-toggle";
import QAOADemoModal from "@/components/ui-custom/qaoa-demo-modal";
import { motion } from "framer-motion";

export default function TutorialsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ category: "all", difficulty: "all" });
  const [quantumMode, setQuantumMode] = useState(false);

  let filteredTutorials = MOCK_TUTORIALS.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = filters.category === "all" || t.category === filters.category;
    const matchesDifficulty = filters.difficulty === "all" || t.difficulty === filters.difficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Mock Quantum Optimization - reorder logic for demo
  if (quantumMode) {
    filteredTutorials = [...filteredTutorials].sort((a, b) => 
      // Example simulated quantum sort: prioritize beginner diversity
      a.difficulty === 'Beginner' ? -1 : 1
    );
  }

  return (
    <div className="container px-4 py-8 min-h-screen relative">
      {quantumMode && (
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      )}
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">Tutorials</h1>
            <p className="text-xl text-muted-foreground">Expert guides structured by AI.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-border/50">
             <QAOADemoModal />
             <QuantumToggle enabled={quantumMode} onToggle={setQuantumMode} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search tutorials..." 
              className="h-14 pl-12 rounded-2xl bg-white border-border shadow-sm focus-visible:ring-primary"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "Compost", "Bio-pesticide", "Fertilizer", "Planting", "Soil Health"].map((cat) => (
              <Button 
                key={cat}
                variant={filters.category === cat.toLowerCase() || (cat === "All" && filters.category === "all") ? "default" : "outline"}
                className="h-14 px-6 rounded-2xl font-medium border-border whitespace-nowrap"
                onClick={() => setFilters(prev => ({ ...prev, category: cat.toLowerCase() }))}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {quantumMode && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-4"
           >
             <Share2 className="w-5 h-5 text-primary mt-1" />
             <div>
               <p className="font-bold text-sm text-primary">Graph-Based Discovery Active</p>
               <p className="text-sm text-muted-foreground">Results are now optimized using simulated quantum annealing, maximizing relevance and category diversity based on shared tags.</p>
             </div>
           </motion.div>
        )}

        {filteredTutorials.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredTutorials.map((tutorial, idx) => (
              <motion.div
                key={tutorial.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <TutorialCard tutorial={tutorial} quantumSelected={quantumMode && idx < 2} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
            <h3 className="text-lg font-medium">No tutorials found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}
