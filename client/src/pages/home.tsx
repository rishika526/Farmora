import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Sprout, ShoppingBag, Brain, Leaf } from "lucide-react";
import { Link } from "wouter";
import TutorialCard from "@/components/ui-custom/tutorial-card";
import KitCard from "@/components/ui-custom/kit-card";
import { MOCK_TUTORIALS, MOCK_KITS } from "@/mock/data";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const featuredTutorials = MOCK_TUTORIALS.slice(0, 3);
  const featuredKits = MOCK_KITS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="container px-4 py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">The Future of Organic Farming</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
            Organic made <br />
            <span className="text-primary italic">practical.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            Learn, grow, and thrive with AI-powered tutorials, community wisdom, and sustainable tools. From soil to solution.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/tutorials">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">
                Explore Tutorials
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/advisor">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-border bg-white shadow-sm hover:bg-muted">
                Ask Farmora AI
                <Leaf className="ml-2 h-5 w-5 text-primary" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
          <div className="relative aspect-square overflow-hidden rounded-[4rem] rotate-3 shadow-2xl border-8 border-white">
            <img 
              src="/images/farmora-hero.png" 
              alt="Organic Growth" 
              className="w-full h-full object-cover -rotate-3 scale-110"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-border/50 animate-bounce-subtle">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                 <Sprout className="h-6 w-6 text-primary" />
               </div>
               <div>
                 <p className="text-sm font-bold">12k+ Farmers</p>
                 <p className="text-xs text-muted-foreground">Growing organically</p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight">Popular Guides</h2>
              <p className="text-xl text-muted-foreground">Trending organic farming techniques.</p>
            </div>
            <Link href="/tutorials">
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-lg font-medium hover:bg-transparent hover:text-primary">
                View All <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredTutorials.map(tutorial => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </div>
      </section>

      {/* Essential Tools */}
      <section className="py-24 bg-background border-t border-border/50">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-16">
             <div className="space-y-2">
              <h2 className="text-5xl font-bold tracking-tight">Essential Tools</h2>
              <p className="text-xl text-muted-foreground">Curated kits to get you started.</p>
            </div>
             <Link href="/kits">
              <Button variant="ghost" className="hidden md:flex items-center gap-2 text-lg font-medium hover:bg-transparent hover:text-primary">
                Visit Shop <ShoppingBag className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {featuredKits.map(kit => (
              <KitCard key={kit.id} kit={kit} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container px-4 py-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-primary px-8 py-20 text-center text-primary-foreground">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <h2 className="relative text-4xl md:text-6xl font-bold mb-8">Ready to start your garden?</h2>
          <Link href="/tutorials">
            <Button size="lg" className="relative h-16 px-12 text-xl rounded-full bg-white text-primary hover:bg-white/90 shadow-2xl">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
