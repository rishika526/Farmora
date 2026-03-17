import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Sprout, ShoppingBag, Brain, Leaf, Users, Check, Globe, Award, Sparkles, Shuffle } from "lucide-react";
import { Link } from "wouter";
import TutorialCard from "@/components/ui-custom/tutorial-card";
import KitCard from "@/components/ui-custom/kit-card";
import { MOCK_TUTORIALS, MOCK_KITS } from "@/mock/data";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import QuantumToggle from "@/components/ui-custom/quantum-toggle";
import { useState } from "react";

export default function Home() {
  const [quantumMode, setQuantumMode] = useState(false);
  const featuredTutorials = MOCK_TUTORIALS.slice(0, 3);
  const featuredKits = MOCK_KITS.slice(0, 4);

  // Mock Quantum Reordering
  const displayTutorials = quantumMode 
    ? [...featuredTutorials].reverse() 
    : featuredTutorials;

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

          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-muted overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm font-medium">Joined by <span className="text-primary">10,000+</span> growers</p>
          </div>
        </div>
        
        <div className="relative group">
          <motion.div 
            whileHover={{ rotateY: 5, rotateX: -5, perspective: 1000 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative aspect-square overflow-hidden rounded-[4rem] shadow-2xl border-8 border-white bg-muted"
          >
            <img 
              src="/images/farmora-hero.png" 
              alt="Organic Growth" 
              className="w-full h-full object-cover scale-110"
            />
          </motion.div>
          
          <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-border/50 animate-bounce-subtle max-w-[200px] z-10">
             <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2 text-primary font-bold text-xs">
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                 LIVE ANALYSIS
               </div>
               <p className="text-sm font-bold leading-tight">Nitrogen levels optimal for leafy greens.</p>
             </div>
          </div>

          {/* Quantum Random Feature Badge */}
          <div className="absolute top-8 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-border/50 z-10 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shuffle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quantum Pick</p>
                <p className="text-sm font-bold">Creator of the Day</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cultivate Knowledge */}
      <section className="py-24 bg-[#fcfbf7]/50">
        <div className="container px-4 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">Cultivate Knowledge</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform turns raw video content into structured, actionable farming guides.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { icon: PlayCircle, title: "Watch", desc: "Browse expert video tutorials" },
              { icon: Sprout, title: "Transcribe", desc: "AI extracts key steps instantly" },
              { icon: Leaf, title: "Learn", desc: "Get summarized insights & tips" },
              { icon: Award, title: "Apply", desc: "Put knowledge into practice" },
            ].map((feature, i) => (
              <div key={i} className="space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/5 text-primary flex items-center justify-center mx-auto border border-primary/10">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-24 bg-background relative overflow-hidden">
        {quantumMode && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        )}
        <div className="container px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-5xl font-bold tracking-tight">Popular Guides</h2>
              </div>
              <p className="text-xl text-muted-foreground">Trending organic farming techniques.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <QuantumToggle enabled={quantumMode} onToggle={setQuantumMode} />
              <Link href="/tutorials">
                <Button variant="ghost" className="hidden md:flex items-center gap-2 text-lg font-medium hover:bg-transparent hover:text-primary">
                  View All <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {displayTutorials.map((tutorial, idx) => (
              <motion.div 
                key={tutorial.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <TutorialCard tutorial={tutorial} quantumSelected={quantumMode && idx === 0} />
              </motion.div>
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

      {/* CTA Section - Matching Image */}
      <section className="relative py-32 overflow-hidden bg-primary text-primary-foreground text-center">
        <div className="absolute inset-0 opacity-10">
           <img src="/images/farmora-hero.png" alt="Overlay" className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="container relative z-10 space-y-8">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight">Ready to grow your own food?</h2>
          <p className="text-xl text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of organic farmers sharing their knowledge and earning rewards.
          </p>
          <Link href="/upload">
            <Button size="lg" className="h-16 px-12 text-xl rounded-full bg-[#fdfaf3] text-foreground hover:bg-white shadow-2xl">
              Start Sharing Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
