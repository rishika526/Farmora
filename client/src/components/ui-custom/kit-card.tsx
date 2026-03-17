import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, TrendingUp, Sparkles } from "lucide-react";
import { Kit } from "@/mock/data";
import { formatRupee } from "@/lib/utils";

interface KitCardProps {
  kit: Kit;
  quantumSelected?: boolean;
}

export default function KitCard({ kit, quantumSelected }: KitCardProps) {
  return (
    <div className={`group cursor-pointer relative p-3 rounded-[1.5rem] transition-all duration-300 ${quantumSelected ? 'bg-primary/5 shadow-[0_0_20px_rgba(0,119,51,0.08)] border border-primary/20' : 'hover:bg-muted/50'}`}>
      {quantumSelected && (
        <div className="absolute -top-3 -right-3 z-10 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Quantum Pick
        </div>
      )}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-muted mb-4 shadow-sm">
        <img 
          src={kit.image} 
          alt={kit.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-foreground border-none shadow-sm hover:bg-white">
            Commission {kit.id === "1" ? "10%" : kit.id === "2" ? "15%" : kit.id === "3" ? "8%" : "12%"}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {kit.name}
          </h3>
          <span className="text-lg font-bold text-primary">
            {formatRupee(kit.price)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{kit.rating}</span>
          <span className="text-sm text-muted-foreground">({kit.reviews} reviews)</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {kit.description}
        </p>
      </div>
    </div>
  );
}
