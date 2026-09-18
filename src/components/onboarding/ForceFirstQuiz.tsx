import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle, SkipForward } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIntroVideoUrl } from "@/hooks/useIntroVideoUrl";

const introSkipKey = (userId?: string) => `intro_video_skipped_${userId ?? "anon"}`;

export const markIntroSkipped = (userId?: string) => {
  try {
    localStorage.setItem(introSkipKey(userId), "1");
  } catch {}
};

export const hasSkippedIntro = (userId?: string) => {
  try {
    return localStorage.getItem(introSkipKey(userId)) === "1";
  } catch {
    return false;
  }
};

export const ForceFirstQuiz = () => {
  const { user } = useAuth();
  const { videoId } = useIntroVideoUrl();

  const handleSkip = () => {
    markIntroSkipped(user?.id);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <PlayCircle className="h-4 w-4" />
            Welcome to LevelHubAI
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Watch this quick intro to get started
          </h1>
          <p className="text-muted-foreground text-lg">
            A short walkthrough of how to level up on our platform.
          </p>
        </div>

        <div className="relative w-full overflow-hidden rounded-2xl border border-border/50 shadow-lg bg-black aspect-video">
          {videoId && (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              title="LevelHubAI Intro"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="flex justify-center">
          <Button size="lg" variant="outline" onClick={handleSkip} className="text-base">
            <SkipForward className="h-5 w-5 mr-2" />
            Skip & continue to dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
