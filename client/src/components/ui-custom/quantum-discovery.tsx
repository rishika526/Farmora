import { useQuery } from "@tanstack/react-query";
import { quantumRelatedQuery, type GraphNode, type Tutorial, type Kit, type Creator } from "@/lib/api";
import { Network, Sparkles, BookOpen, ShoppingBag, User, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { formatRupee } from "@/lib/utils";

interface QuantumDiscoveryProps {
  sourceType: "tutorial" | "kit" | "creator";
  sourceId: string;
}

function NodeCard({ node, score, index }: { node: GraphNode; score: number; index: number }) {
  const isTop = index === 0;

  if (node.type === "tutorial") {
    const t = node.data as Tutorial;
    return (
      <Link href={`/tutorials/${t.id}`}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className={`flex-shrink-0 w-64 p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group ${isTop ? "bg-primary/5 border-primary/30 shadow-[0_0_16px_rgba(0,119,51,0.1)]" : "bg-white border-border/50 hover:border-primary/30"}`}
          data-testid={`quantum-related-tutorial-${t.id}`}
        >
          <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
            <img src={t.thumbnail} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            {isTop && (
              <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Top Match
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Tutorial</span>
          </div>
          <p className="font-bold text-sm leading-tight mb-2 line-clamp-2">{t.title}</p>
          <div className="flex flex-wrap gap-1">
            {(t.tags || []).slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{tag}</span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-primary font-mono">
            match {(score * 100).toFixed(0)}%
          </div>
        </motion.div>
      </Link>
    );
  }

  if (node.type === "kit") {
    const k = node.data as Kit;
    return (
      <Link href="/kits">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.06 }}
          className={`flex-shrink-0 w-56 p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group ${isTop ? "bg-primary/5 border-primary/30 shadow-[0_0_16px_rgba(0,119,51,0.1)]" : "bg-white border-border/50 hover:border-primary/30"}`}
          data-testid={`quantum-related-kit-${k.id}`}
        >
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
            <img src={k.image} alt={k.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Kit</span>
          </div>
          <p className="font-bold text-sm leading-tight mb-1 line-clamp-2">{k.name}</p>
          <p className="text-primary font-bold text-sm">{formatRupee(k.price)}</p>
          <div className="mt-2 text-[10px] text-primary font-mono">
            match {(score * 100).toFixed(0)}%
          </div>
        </motion.div>
      </Link>
    );
  }

  const c = node.data as Creator;
  return (
    <Link href="/creator">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
        className={`flex-shrink-0 w-48 p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-center ${isTop ? "bg-primary/5 border-primary/30 shadow-[0_0_16px_rgba(0,119,51,0.1)]" : "bg-white border-border/50 hover:border-primary/30"}`}
        data-testid={`quantum-related-creator-${c.id}`}
      >
        {c.avatar && <img src={c.avatar} alt={c.name} className="h-14 w-14 rounded-full mx-auto mb-3 ring-2 ring-primary/20" />}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <User className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Creator</span>
        </div>
        <p className="font-bold text-sm">{c.name}</p>
        <p className="text-[11px] text-muted-foreground">{c.category}</p>
        <div className="mt-2 text-[10px] text-primary font-mono">
          match {(score * 100).toFixed(0)}%
        </div>
      </motion.div>
    </Link>
  );
}

export default function QuantumDiscovery({ sourceType, sourceId }: QuantumDiscoveryProps) {
  const { data, isLoading } = useQuery(quantumRelatedQuery(sourceType, sourceId));

  return (
    <section className="pt-12 border-t border-border/50 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <h3 className="text-2xl font-bold">Related Content</h3>
            <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-primary/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Recommended
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Handpicked based on topic similarity and category match.
            {data ? ` ${data.edgeCount} connections analysed in ${data.executionTimeMs}ms.` : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex-shrink-0 w-64 h-52 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : data && data.related.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          {data.related.map((node, i) => (
            <NodeCard key={`${node.type}:${node.data.id}`} node={node} score={data.scores[i] || 0} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed">
          <p className="text-muted-foreground text-sm">No related content found.</p>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Tag className="w-3.5 h-3.5" />
        <span>Smart Discovery analyses tag similarity and category overlap to surface the most relevant tutorials, kits, and creators for you.</span>
      </div>
    </section>
  );
}
