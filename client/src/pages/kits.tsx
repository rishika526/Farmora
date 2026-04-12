import KitCard from "@/components/ui-custom/kit-card";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { kitsQuery, quantumRecommend, type Kit } from "@/lib/api";

export default function KitsPage() {
  const [recommended, setRecommended] = useState<string[]>([]);

  const { data: allKits = [], isLoading } = useQuery(kitsQuery(""));

  useEffect(() => {
    quantumRecommend("kits", [], 3)
      .then(r => setRecommended((r.selected as Kit[]).map(k => k.id)))
      .catch(() => {});
  }, []);

  return (
    <div className="container px-4 py-8 min-h-screen">
      <div className="space-y-12">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">DIY Kits & Tools</h1>
          <p className="text-xl text-muted-foreground">Curated sustainable tools to help you get started.</p>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {allKits.map((kit, idx) => (
              <motion.div
                key={kit.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <KitCard kit={kit} recommended={recommended.includes(kit.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
