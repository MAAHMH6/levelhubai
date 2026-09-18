import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useIntroVideoUrl } from "@/hooks/useIntroVideoUrl";

const seenKey = (userId?: string) => `intro_popup_seen_${userId ?? "anon"}`;

type DialogBodyProps = {
  videoId: string | null;
  onDismiss: () => void;
  title?: string;
  description?: string;
};

const IntroDialogBody = ({ videoId, onDismiss, title, description }: DialogBodyProps) => (
  <DialogContent className="max-w-3xl sm:max-w-4xl p-6 rounded-2xl">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl font-bold">
        <PlayCircle className="h-5 w-5 text-primary text-teal-600" />
        {title ?? "LevelHubAI Platform Walkthrough"}
      </DialogTitle>
      <DialogDescription>
        {description ?? "Watch this quick walkthrough to explore core subjects, AI tutor, past papers, and student leaderboard."}
      </DialogDescription>
    </DialogHeader>

    <div className="relative w-full overflow-hidden rounded-2xl bg-black aspect-video shadow-2xl my-2 border border-slate-200 dark:border-slate-800">
      {videoId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
          title="LevelHubAI Intro"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex items-center justify-center h-full text-slate-400">
          Loading video player...
        </div>
      )}
    </div>

    <DialogFooter className="gap-2 sm:gap-2 pt-2">
      <Button variant="ghost" onClick={onDismiss} className="rounded-xl">
        Close
      </Button>
      <Button onClick={onDismiss} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">
        Done Watching
      </Button>
    </DialogFooter>
  </DialogContent>
);

// Auto-show popup for returning users (once per URL version)
export const IntroVideoPopup = () => {
  const { user } = useAuth();
  const { url, videoId } = useIntroVideoUrl();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };
    window.addEventListener('open-intro-video', handleOpen);
    return () => window.removeEventListener('open-intro-video', handleOpen);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const seenUrl = localStorage.getItem(seenKey(user.id));
      if (seenUrl !== url) {
        const t = setTimeout(() => setOpen(true), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [user?.id, url]);

  const dismiss = () => {
    try {
      if (user?.id) localStorage.setItem(seenKey(user.id), url);
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : dismiss())}>
      <IntroDialogBody
        videoId={videoId}
        onDismiss={dismiss}
        title="Welcome — Platform Walkthrough"
        description="Here is a quick walkthrough to get the most out of LevelHubAI."
      />
    </Dialog>
  );
};

// On-demand button — lets users rewatch anytime
type ButtonSize = "default" | "sm" | "lg" | "icon";
type ButtonVariant = "default" | "outline" | "ghost" | "secondary";

export const WatchIntroButton = ({
  size = "sm",
  variant = "outline",
  label = "Intro",
}: {
  size?: ButtonSize;
  variant?: ButtonVariant;
  label?: string;
}) => {
  const { videoId } = useIntroVideoUrl();
  const [open, setOpen] = useState(false);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5">
          <PlayCircle className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <IntroDialogBody
        videoId={videoId}
        onDismiss={() => handleOpenChange(false)}
        title="Platform Intro & Walkthrough"
        description="Explore how to master your Cambridge subjects with LevelHubAI."
      />
    </Dialog>
  );
};
