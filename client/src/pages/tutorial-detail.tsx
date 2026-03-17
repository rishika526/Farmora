import { useParams } from "wouter";
import { MOCK_TUTORIALS, MOCK_KITS } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, Bookmark, Share2, Play, CheckCircle, ShoppingBag, Sparkles, Network } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import KitCard from "@/components/ui-custom/kit-card";
import TutorialCard from "@/components/ui-custom/tutorial-card";

export default function TutorialDetail() {
  const params = useParams();
  const tutorial = MOCK_TUTORIALS.find(t => t.id === params.id) || MOCK_TUTORIALS[0];
  
  // Mock Graph-Based Discovery
  const relatedTutorials = MOCK_TUTORIALS.filter(t => t.id !== tutorial.id && t.category === tutorial.category).slice(0, 2);

  return (
    <div className="container px-4 py-8 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main Content (Left 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player Placeholder */}
          <div className="aspect-video bg-black rounded-[2rem] overflow-hidden relative group shadow-xl">
             <img 
               src={tutorial.thumbnail} 
               alt={tutorial.title} 
               className="w-full h-full object-cover opacity-60"
             />
             <div className="absolute inset-0 flex items-center justify-center">
               <Button size="icon" className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/50 transition-transform hover:scale-110">
                 <Play className="h-10 w-10 ml-2 fill-current" />
               </Button>
             </div>
             <div className="absolute bottom-4 left-4 flex gap-2">
               <Badge className="bg-primary text-white border-none backdrop-blur-md shadow-lg">
                 <Sparkles className="w-3 h-3 mr-1" />
                 AI Summarized
               </Badge>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">{tutorial.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                  <span className="text-foreground">{tutorial.creator}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span>{tutorial.views.toLocaleString()} views</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span>{tutorial.duration}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border" title="Save"><Bookmark className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border" title="Share"><Share2 className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
               <span className="px-4 py-1.5 rounded-full bg-muted/50 text-sm font-medium border border-border/50">{tutorial.category}</span>
               <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-bold border border-primary/20">{tutorial.difficulty}</span>
            </div>
          </div>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-muted/30 p-1.5 rounded-2xl h-auto">
              <TabsTrigger value="summary" className="rounded-xl px-6 py-2.5 text-base">AI Summary</TabsTrigger>
              <TabsTrigger value="steps" className="rounded-xl px-6 py-2.5 text-base">Step-by-Step</TabsTrigger>
              <TabsTrigger value="transcript" className="rounded-xl px-6 py-2.5 text-base">Transcript</TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="summary" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-[2rem] border-none shadow-lg bg-primary/5">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-2xl mb-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      Key Takeaways
                    </h3>
                    <p className="text-lg text-foreground/80 leading-relaxed">
                      In this tutorial, <strong>{tutorial.creator}</strong> demonstrates the essential techniques for growing organic {tutorial.category.toLowerCase()}. 
                      Key points include soil preparation using compost, proper spacing for optimal growth, and natural pest control methods. 
                      The video emphasizes the importance of consistent watering and early intervention for common issues.
                    </p>
                    <div className="mt-8 flex gap-4">
                      <Button variant="default" className="rounded-full h-12 px-6 shadow-md gap-2">
                        <Download className="h-4 w-4" /> Download PDF Guide
                      </Button>
                      <Button variant="outline" className="rounded-full h-12 px-6 bg-white gap-2">
                        <Globe className="h-4 w-4" /> Translate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="steps">
                <div className="space-y-4">
                   {[1, 2, 3, 4].map((step) => (
                     <div key={step} className="flex gap-6 p-6 rounded-[1.5rem] border border-border/50 bg-white hover:shadow-md transition-shadow">
                       <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                         {step}
                       </div>
                       <div>
                         <h4 className="font-bold text-xl mb-2">Step {step} Title</h4>
                         <p className="text-muted-foreground leading-relaxed">Detailed description of this step extracted by AI from the video content. Shows exactly what to do and when.</p>
                       </div>
                     </div>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="transcript">
                <ScrollArea className="h-[400px] w-full rounded-[1.5rem] border border-border/50 p-6 bg-muted/20">
                   <div className="space-y-6 text-muted-foreground text-lg">
                     <p><span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">00:00</span> Welcome back to the channel. Today we are talking about...</p>
                     <p><span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">00:15</span> First, let's look at the soil composition needed for...</p>
                     <p><span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">01:20</span> Make sure you have your compost ready. If not, check my other video...</p>
                     <p><span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">02:45</span> Now, gently plant the seeds about 2 inches deep...</p>
                     <p><span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">04:10</span> Water thoroughly immediately after planting to ensure good soil contact...</p>
                   </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>

          <div className="pt-12 border-t">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Network className="h-6 w-6 text-primary" />
              Graph-Based Discovery
            </h3>
            <p className="text-muted-foreground mb-8">Quantum-inspired recommendations based on shared tags and user learning paths.</p>
            <div className="grid sm:grid-cols-2 gap-8">
              {relatedTutorials.length > 0 ? (
                 relatedTutorials.map((t, idx) => (
                   <TutorialCard key={t.id} tutorial={t} quantumSelected={idx === 0} />
                 ))
              ) : (
                 <p className="text-muted-foreground italic">No closely related tutorials found in this category.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right 1/3) */}
        <div className="space-y-8">
          <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-2xl">Shop the Look</h3>
                <Badge variant="outline" className="bg-white border-primary/20 text-primary">Optimized Cart</Badge>
              </div>
              <p className="text-muted-foreground">Quantum-optimized kit bundle to perfectly match this tutorial.</p>
              
              <div className="space-y-4">
                 {MOCK_KITS.slice(0, 2).map((kit) => (
                   <div key={kit.id} className="flex gap-4 items-center p-3 rounded-2xl bg-white shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                     <img src={kit.image} alt={kit.name} className="h-16 w-16 rounded-xl object-cover" />
                     <div className="flex-1 min-w-0">
                       <p className="font-bold text-sm truncate leading-tight mb-1">{kit.name}</p>
                       <p className="text-primary font-bold">{kit.price}</p>
                     </div>
                     <Button size="icon" className="h-10 w-10 rounded-full shadow-md"><ShoppingBag className="h-4 w-4" /></Button>
                   </div>
                 ))}
              </div>
              <Button className="w-full h-14 rounded-full text-lg shadow-lg" variant="default">View Complete Bundle</Button>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-md bg-muted/30">
             <CardContent className="p-8">
               <h4 className="font-bold text-lg mb-4">Required Materials</h4>
               <ul className="space-y-3">
                 {["Organic Compost", "Seedling Tray", "Water Spray Bottle", "Neem Oil"].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-foreground/80 font-medium">
                     <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                       <CheckCircle className="h-4 w-4 text-primary" />
                     </div>
                     {item}
                   </li>
                 ))}
               </ul>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
