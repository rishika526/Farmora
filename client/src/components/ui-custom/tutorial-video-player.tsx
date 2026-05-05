import { AlertCircle, ExternalLink, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getYouTubeEmbedUrl } from "@/lib/video";
import { cn } from "@/lib/utils";

interface TutorialVideoPlayerProps {
  title: string;
  thumbnail: string;
  videoUrl?: string | null;
  className?: string;
}

export default function TutorialVideoPlayer({
  title,
  thumbnail,
  videoUrl,
  className,
}: TutorialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFrameLoading, setIsFrameLoading] = useState(true);
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  return (
    <div className={cn("aspect-video overflow-hidden rounded-[2rem] bg-black shadow-xl", className)}>
      <div className="relative h-full w-full">
        {!isPlaying || !embedUrl ? (
          <>
            <img src={thumbnail} alt={title} className="h-full w-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {embedUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="icon"
                  className="h-20 w-20 rounded-full border-2 border-white/50 bg-white/20 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-110 hover:bg-white/30"
                  data-testid="button-play-video"
                  onClick={() => {
                    setIsFrameLoading(true);
                    setIsPlaying(true);
                  }}
                >
                  <Play className="ml-1 h-10 w-10 fill-current" />
                </Button>
              </div>
            ) : videoUrl ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  asChild
                  className="h-14 rounded-full border border-white/40 bg-white/20 px-6 text-white backdrop-blur-md hover:bg-white/30"
                >
                  <a href={videoUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Open resource
                  </a>
                </Button>
              </div>
            ) : (
              <div className="absolute inset-x-4 top-1/2 mx-auto flex max-w-md -translate-y-1/2 items-center gap-3 rounded-2xl border border-white/20 bg-black/55 p-4 text-white shadow-xl backdrop-blur-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Video link unavailable</p>
                  <p className="text-sm text-white/75">Add a valid YouTube watch, short, youtu.be, or embed link.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {isFrameLoading && (
              <div className="absolute inset-0 z-10 bg-black">
                <Skeleton className="h-full w-full rounded-none bg-white/10" />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
                  Loading video...
                </div>
              </div>
            )}
            <iframe
              className="h-full w-full"
              src={`${embedUrl}&autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              data-testid="iframe-tutorial-player"
              onLoad={() => setIsFrameLoading(false)}
            />
          </>
        )}
        <div className="absolute bottom-4 left-4">
          <Badge className="border-none bg-primary text-white">
            <Sparkles className="mr-1 h-3 w-3" /> AI Summarized
          </Badge>
        </div>
      </div>
    </div>
  );
}
