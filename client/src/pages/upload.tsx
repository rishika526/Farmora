import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Upload as UploadIcon, Check, Loader2 } from "lucide-react";
import { createTutorial } from "@/lib/api";
import { isSupportedTutorialVideoUrl } from "@/lib/video";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categoryOptions = ["Compost", "Bio-pesticide", "Fertilizer", "Planting", "Soil Health"];
const difficultyOptions = ["Beginner", "Intermediate", "Advanced"] as const;
const languageOptions = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Marathi"];

const categoryThumbnails: Record<string, string> = {
  Compost: "/images/tutorial-garden.png",
  "Bio-pesticide": "/images/tutorial-pest.png",
  Fertilizer: "/images/tutorial-compost-tea.png",
  Planting: "/images/tutorial-raised-bed.png",
  "Soil Health": "/images/tutorial-soil.png",
};

const durationPattern = /^\d{1,2}:\d{2}$/;

export default function UploadPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    creator: "",
    category: "Compost",
    difficulty: "Beginner" as (typeof difficultyOptions)[number],
    description: "",
    videoUrl: "",
    duration: "",
    thumbnail: "",
    tags: "",
    language: "English",
  });
  const progressTimerRef = useRef<number | null>(null);

  const uploadMutation = useMutation({
    mutationFn: createTutorial,
  });

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  function startProgressAnimation() {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
    }

    setProgress(8);
    progressTimerRef.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + 8, 92);
      });
    }, 180);
  }

  function stopProgressAnimation() {
    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }

  function updateField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const title = form.title.trim();
    const creator = form.creator.trim();
    const duration = form.duration.trim();
    const description = form.description.trim();
    const videoUrl = form.videoUrl.trim();
    const thumbnail = form.thumbnail.trim() || categoryThumbnails[form.category] || "/images/tutorial-garden.png";
    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!title || !creator) {
      toast({
        title: "Missing basics",
        description: "Add a tutorial title and creator name before uploading.",
        variant: "destructive",
      });
      return;
    }

    if (!durationPattern.test(duration)) {
      toast({
        title: "Invalid duration",
        description: "Use MM:SS format, for example 12:45.",
        variant: "destructive",
      });
      return;
    }

    if (!isSupportedTutorialVideoUrl(videoUrl)) {
      toast({
        title: "Unsupported video link",
        description: "Paste a valid YouTube watch, short, embed, or youtu.be link.",
        variant: "destructive",
      });
      return;
    }

    setStep(4);
    setIsSubmitting(true);
    startProgressAnimation();

    try {
      const createdTutorial = await uploadMutation.mutateAsync({
        title,
        creator,
        category: form.category,
        difficulty: form.difficulty,
        description: description || null,
        videoUrl,
        duration,
        thumbnail,
        tags: tags.length > 0 ? tags : [form.category.toLowerCase()],
        language: form.language,
      });

      stopProgressAnimation();
      setProgress(100);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tutorials"] }),
        queryClient.invalidateQueries({ queryKey: ["creators"] }),
      ]);

      toast({
        title: "Tutorial uploaded",
        description: "Your new video is live and ready in the tutorials page.",
      });

      window.setTimeout(() => {
        setLocation(`/tutorials/${createdTutorial.id}`);
      }, 450);
    } catch (error) {
      stopProgressAnimation();
      setProgress(0);
      setIsSubmitting(false);
      setStep(3);

      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong while saving the tutorial.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container min-h-screen max-w-2xl px-4 py-12 flex items-center justify-center">
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
                <h3 className="font-medium text-lg">Publishing your tutorial...</h3>
                <p className="text-sm text-muted-foreground">
                  {progress < 30
                    ? "Saving video metadata..."
                    : progress < 60
                      ? "Indexing tutorial content..."
                      : progress < 90
                        ? "Refreshing Farmora discovery..."
                        : "Finalizing your tutorial page..."}
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
                    <Input
                      id="title"
                      placeholder="e.g., How to grow organic spinach"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creator">Creator Name</Label>
                    <Input
                      id="creator"
                      placeholder="e.g., EcoGardener Jane"
                      value={form.creator}
                      onChange={(e) => updateField("creator", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={form.category} onValueChange={(value) => updateField("category", value)}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={form.difficulty}
                        onValueChange={(value) => updateField("difficulty", value as (typeof difficultyOptions)[number])}
                      >
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Description</Label>
                    <Textarea
                      id="desc"
                      placeholder="Briefly describe what you'll cover..."
                      value={form.description}
                      onChange={(e) => updateField("description", e.target.value)}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="border-2 border-dashed rounded-xl p-12 text-center bg-muted/20">
                    <UploadIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-1">Paste your tutorial video link</h3>
                    <p className="text-sm text-muted-foreground">
                      Farmora currently supports YouTube watch, short, embed, and youtu.be links.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={form.videoUrl}
                      onChange={(e) => updateField("videoUrl", e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="12:45"
                        value={form.duration}
                        onChange={(e) => updateField("duration", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Thumbnail URL</Label>
                      <Input
                        id="thumbnail"
                        placeholder={categoryThumbnails[form.category]}
                        value={form.thumbnail}
                        onChange={(e) => updateField("thumbnail", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                    <Check className="h-4 w-4 text-green-600" />
                    A matching category thumbnail is used automatically if you leave the thumbnail blank.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <Label>Spoken Language</Label>
                    <Select value={form.language} onValueChange={(value) => updateField("language", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="compost, balcony garden, beginner"
                      value={form.tags}
                      onChange={(e) => updateField("tags", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate tags with commas so Farmora can surface the video in search and recommendations.
                    </p>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-primary">AI Analysis</h4>
                    <p className="text-xs text-muted-foreground">
                      Farmora stores the new tutorial instantly, then uses your category, tags, and language to keep discovery and creator stats aligned.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} disabled={isSubmitting}>
                    Back
                  </Button>
                )}

                {step < 3 ? (
                  <Button type="button" className="ml-auto" onClick={() => setStep((current) => current + 1)} disabled={isSubmitting}>
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" className="ml-auto bg-primary hover:bg-primary/90" disabled={isSubmitting}>
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
