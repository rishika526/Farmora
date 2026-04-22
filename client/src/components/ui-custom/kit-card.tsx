import { Badge } from "@/components/ui/badge";
import { Star, Sparkles } from "lucide-react";
import { formatRupee } from "@/lib/utils";
import type { Kit } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface KitCardProps {
  kit: Kit;
  recommended?: boolean;
}

export default function KitCard({ kit, recommended }: KitCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  function handleAddToCart() {
    addToCart(kit);
    toast({
      title: "Added to cart",
      description: `${kit.name} was added to your cart.`,
    });
  }

  return (
    <div
      className={`group cursor-pointer relative p-3 rounded-[1.5rem] transition-all duration-300 ${recommended ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}
      data-testid={`card-kit-${kit.id}`}
    >
      {recommended && (
        <div className="absolute -top-3 -right-3 z-10 bg-white dark:bg-card border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Recommended
        </div>
      )}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem] bg-muted mb-4 shadow-sm">
        <img
          src={kit.image}
          alt={kit.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {kit.commission > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-foreground border-none shadow-sm hover:bg-white">
              Commission {kit.commission}%
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="font-bold text-lg leading-tight group-hover:text-primary transition-colors"
            data-testid={`text-kit-name-${kit.id}`}
          >
            {kit.name}
          </h3>
          <span
            className="text-lg font-bold text-primary shrink-0"
            data-testid={`text-kit-price-${kit.id}`}
          >
            {formatRupee(kit.price)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold">{kit.rating}</span>
          <span className="text-sm text-muted-foreground">({kit.reviews} reviews)</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{kit.description}</p>
        <div className="flex items-center gap-2 pt-2">
          <Button className="flex-1" onClick={handleAddToCart}>
            Add to Cart
          </Button>
          <Link href="/cart">
            <Button variant="outline">View Cart</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
