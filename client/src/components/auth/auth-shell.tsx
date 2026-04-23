import { Link } from "wouter";
import { Leaf, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: React.ReactNode;
  variant: "user" | "creator";
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function AuthShell({ children, variant, eyebrow, title, subtitle }: AuthShellProps) {
  const isCreator = variant === "creator";

  return (
    <div
      className={cn(
        "min-h-screen overflow-hidden",
        isCreator
          ? "bg-[radial-gradient(circle_at_top_left,_rgba(245,181,56,0.22),_transparent_34%),linear-gradient(135deg,_#080b0b,_#13201b_56%,_#080b0b)] text-white"
          : "bg-[radial-gradient(circle_at_top_left,_rgba(36,159,94,0.22),_transparent_32%),linear-gradient(135deg,_#f7fbf6,_#eaf7ef_48%,_#ffffff)]"
      )}
    >
      <div className="container grid min-h-screen items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_0.92fr]">
        <div className="space-y-8">
          <Link
            href="/"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md",
              isCreator ? "border-white/15 bg-white/10 text-white" : "border-primary/15 bg-white/70 text-primary shadow-sm"
            )}
          >
            <Leaf className="h-4 w-4" />
            Farmora
          </Link>

          <div className="max-w-xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase",
                isCreator ? "bg-amber-300/15 text-amber-200" : "bg-primary/10 text-primary"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">{title}</h1>
            <p className={cn("text-lg leading-8 md:text-xl", isCreator ? "text-white/72" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "mx-auto w-full max-w-md rounded-[2rem] border p-5 shadow-2xl backdrop-blur-xl md:p-7 animate-in fade-in zoom-in-95 duration-700",
            isCreator ? "border-white/12 bg-white/10" : "border-white/80 bg-white/80"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
