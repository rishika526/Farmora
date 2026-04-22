import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload as UploadIcon, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
    setIsSubmitting(true);
    
    // Mock upload progress
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setLocation("/tutorials/t1"); // Redirect to a seeded detail page
        }, 500);
      }
    }, 100);
  };

  return (
    <div className="container max-w-2xl px-4 py-12 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Upload Tutorial</CardTitle>
          <CardDescription>Share your organic farming knowledge with the world.</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 4 ? (
            <div className="py-8 text-center space-y-6">
               <div className="relative h-24 w-24 mx-auto flex items-center justify-center">
                 <Loader2 className="h-full w-full text-primary animate-spin opacity-20" />
                 <span className="absolute text-xl font-bold text-primary">{progress}%</span>
               </div>
               <div className="space-y-2">
                 <h3 className="font-medium text-lg">Processing your video...</h3>
                 <p className="text-sm text-muted-foreground">
                   {progress < 30 ? "Uploading..." : 
                    progress < 60 ? "Transcribing audio..." : 
                    progress < 90 ? "Generating summary..." : "Finalizing..."}
                 </p>
               </div>
               <Progress value={progress} className="h-2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tutorial Title</Label>
                    <Input id="title" placeholder="e.g., How to grow organic spinach" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">Vegetables</SelectItem>
                          <SelectItem value="compost">Composting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beg">Beginner</SelectItem>
                          <SelectItem value="int">Intermediate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea id="desc" placeholder="Briefly describe what you'll cover..." />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="border-2 border-dashed rounded-xl p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-1">Drag and drop your video file</h3>
                    <p className="text-sm text-muted-foreground">or click to browse (MP4, MOV)</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                    AI will automatically generate captions and summaries.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                   <div className="space-y-2">
                      <Label>Spoken Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   
                   <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                     <h4 className="font-medium text-primary">AI Analysis</h4>
                     <p className="text-xs text-muted-foreground">
                       Our smart AI will analyze your video to extract the most effective farming patterns and surface them across our knowledge graph.
                     </p>
                   </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button type="button" className="ml-auto" onClick={() => setStep(s => s + 1)}>
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto bg-primary hover:bg-primary/90">
                    Upload & Process
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
