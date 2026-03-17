import KitCard from "@/components/ui-custom/kit-card";
import { MOCK_KITS } from "@/mock/data";
import { useState } from "react";
import { SlidersHorizontal, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuantumToggle from "@/components/ui-custom/quantum-toggle";
import { motion } from "framer-motion";

export default function KitsPage() {
  const [search, setSearch] = useState("");
  const [quantumMode, setQuantumMode] = useState(false);
  // In a real app, we'd have a price filter, etc.
  
  let filteredKits = MOCK_KITS.filter(k => 
    k.name.toLowerCase().includes(search.toLowerCase())
  );

  // Mock Quantum Optimization
  if (quantumMode) {
    filteredKits = [...filteredKits].sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="container px-4 py-8 min-h-screen relative">
      {quantumMode && (
        <div className="absolute top-40 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      )}
      <div className="space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">DIY Kits & Tools</h1>
            <p className="text-xl text-muted-foreground">Curated sustainable tools to help you get started.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-sm border border-border/50">
             <QuantumToggle enabled={quantumMode} onToggle={setQuantumMode} />
             <Button variant="outline" className="h-10 px-6 rounded-full gap-2 font-medium border-primary/20 text-primary">
               <SlidersHorizontal className="h-4 w-4" />
               Filters
             </Button>
          </div>
        </div>

        {quantumMode && (
           <motion.div 
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-4 max-w-4xl"
           >
             <Share2 className="w-5 h-5 text-primary mt-1" />
             <div>
               <p className="font-bold text-sm text-primary">Quantum Recommendations Active</p>
               <p className="text-sm text-muted-foreground">These kits have been selected by analyzing the optimal path through our community's success graph using simulated annealing.</p>
             </div>
           </motion.div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredKits.map((kit, idx) => (
            <motion.div
               key={kit.id}
               layout
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <KitCard kit={kit} quantumSelected={quantumMode && idx < 2} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
