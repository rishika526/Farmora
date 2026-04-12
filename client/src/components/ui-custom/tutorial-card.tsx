import { Badge } from "@/components/ui/badge";
import { Eye, PlayCircle, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Tutorial } from "@/lib/api";

interface TutorialCardProps {
  tutorial: Tutorial;
  recommended?: boolean;
}

export default function TutorialCard({ tutorial, recommended }: TutorialCardProps) {
  return (
    <Link
      href={`/tutorials/${tutorial.id}`}
      className={`group block relative p-3 rounded-[1.5rem] transition-all duration-300 cursor-pointer ${recommended ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}
      data-testid={`card-tutorial-${tutorial.id}`}
    >
      {recommended && (
        <div className="absolute -top-3 -right-3 z-10 bg-white dark:bg-card border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Recommended
        </div>
      )}
      <div className="relative aspect-video overflow-hidden rounded-[1rem] bg-muted mb-4 shadow-sm">
        <img
          src={tutorial.thumbnail}
          alt={tutorial.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-foreground border-none shadow-sm hover:bg-white text-[10px] h-5">
            {tutorial.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
          {tutorial.duration}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <PlayCircle className="w-12 h-12 text-white fill-white/20" />
        </div>
      </div>

      <div className="space-y-2">
        <h3
          className="font-bold text-xl leading-tight group-hover:text-primary transition-colors"
          data-testid={`text-title-${tutorial.id}`}
        >
          {tutorial.title}
        </h3>
        {tutorial.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{tutorial.description}</p>
        )}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span>{tutorial.creator}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {tutorial.views.toLocaleString()}
            </span>
            <span className="text-primary font-medium">{tutorial.difficulty}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
