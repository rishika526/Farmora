import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Globe, Bookmark, Share2, Play, CheckCircle, ShoppingBag, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { tutorialQuery, kitsQuery } from "@/lib/api";
import { formatRupee } from "@/lib/utils";
import QuantumDiscovery from "@/components/ui-custom/quantum-discovery";

export default function TutorialDetail() {
  const params = useParams();
  const id = params.id || "t1";
  const { data: tutorial, isLoading } = useQuery(tutorialQuery(id));
  const { data: allKits = [] } = useQuery(kitsQuery());

  if (isLoading || !tutorial) {
    return (
      <div className="container px-4 py-8 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="aspect-video bg-muted rounded-[2rem]" />
          <div className="h-10 bg-muted rounded w-2/3" />
          <div className="h-6 bg-muted rounded w-1/3" />
        </div>
      </div>
    );
  }

  const relatedKits = allKits.slice(0, 2);

  return (
    <div className="container px-4 py-8 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-10">
        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video hero */}
          <div className="aspect-video bg-black rounded-[2rem] overflow-hidden relative group shadow-xl">
            <img src={tutorial.thumbnail} alt={tutorial.title} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="icon"
                className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-2 border-white/50 transition-transform hover:scale-110"
                data-testid="button-play-video"
              >
                <Play className="h-10 w-10 ml-2 fill-current" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-primary text-white border-none">
                <Sparkles className="w-3 h-3 mr-1" /> AI Summarized
              </Badge>
            </div>
          </div>

          {/* Title + meta */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight" data-testid="text-tutorial-title">
                  {tutorial.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                  <span className="text-foreground">{tutorial.creator}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span data-testid="text-tutorial-views">{tutorial.views.toLocaleString()} views</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span>{tutorial.duration}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border"><Bookmark className="h-5 w-5" /></Button>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-border"><Share2 className="h-5 w-5" /></Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-1.5 rounded-full bg-muted/50 text-sm font-medium border border-border/50">{tutorial.category}</span>
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-bold border border-primary/20">{tutorial.difficulty}</span>
              {tutorial.tags?.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-muted/30 text-xs font-medium text-muted-foreground border border-border/30">{tag}</span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start bg-muted/30 p-1.5 rounded-2xl h-auto overflow-x-auto">
              <TabsTrigger value="summary" className="rounded-xl px-6 py-2.5 text-base">AI Summary</TabsTrigger>
              <TabsTrigger value="steps" className="rounded-xl px-6 py-2.5 text-base">Step-by-Step</TabsTrigger>
              <TabsTrigger value="transcript" className="rounded-xl px-6 py-2.5 text-base">Transcript</TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="summary" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <Card className="rounded-[2rem] border-none shadow-lg bg-primary/5">
                  <CardContent className="p-8">
                    <h3 className="font-bold text-2xl mb-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      Key Takeaways
                    </h3>
                    <p className="text-lg text-foreground/80 leading-relaxed">
                      {tutorial.description || `In this tutorial, ${tutorial.creator} demonstrates essential techniques for ${tutorial.category.toLowerCase()}.`}
                    </p>
                    <div className="mt-8 flex gap-4">
                      <Button variant="default" className="rounded-full h-12 px-6 gap-2">
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
                  {[
                    { title: "Gather Materials", desc: "Collect all required supplies listed below." },
                    { title: "Prepare Your Workspace", desc: "Set up with proper drainage and sunlight." },
                    { title: "Follow the Technique", desc: `Apply the ${tutorial.category.toLowerCase()} method as shown.` },
                    { title: "Monitor and Adjust", desc: "Check daily and adjust based on soil and plant response." },
                  ].map((step, idx) => (
                    <div key={idx} className="flex gap-6 p-6 rounded-[1.5rem] border border-border/50 bg-white hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">{idx + 1}</div>
                      <div>
                        <h4 className="font-bold text-xl mb-2">{step.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="transcript">
                <ScrollArea className="h-[400px] w-full rounded-[1.5rem] border border-border/50 p-6 bg-muted/20">
                  <div className="space-y-6 text-muted-foreground text-lg">
                    {[
                      ["00:00", `Welcome back! Today we're talking about ${tutorial.title.toLowerCase()}...`],
                      ["00:15", "First, let's look at the soil composition needed..."],
                      ["01:20", "Make sure you have your materials ready before starting..."],
                      ["02:45", "Now follow along as I demonstrate the key steps..."],
                      ["04:10", "Remember to monitor progress daily and adjust as needed..."],
                    ].map(([ts, line], i) => (
                      <p key={i}>
                        <span className="text-primary font-mono font-bold text-sm bg-primary/10 px-2 py-1 rounded mr-3">{ts}</span>
                        {line}
                      </p>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>

          {/* ── Quantum Discovery ──────────────────────────────────────────── */}
          <QuantumDiscovery sourceType="tutorial" sourceId={id} />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className="space-y-8">
          <Card className="rounded-[2rem] border-none shadow-xl bg-gradient-to-b from-primary/5 to-transparent">
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-2xl">Shop the Look</h3>
                <Badge variant="outline" className="bg-white border-primary/20 text-primary">Optimized Cart</Badge>
              </div>
              <p className="text-muted-foreground">AI-matched kit bundle for this tutorial.</p>
              <div className="space-y-4">
                {relatedKits.map(kit => (
                  <div key={kit.id} className="flex gap-4 items-center p-3 rounded-2xl bg-white shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                    <img src={kit.image} alt={kit.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate leading-tight mb-1">{kit.name}</p>
                      <p className="text-primary font-bold">{formatRupee(kit.price)}</p>
                    </div>
                    <Button size="icon" className="h-10 w-10 rounded-full shadow-md"><ShoppingBag className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
              <Button className="w-full h-14 rounded-full text-lg shadow-lg">View Complete Bundle</Button>
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
