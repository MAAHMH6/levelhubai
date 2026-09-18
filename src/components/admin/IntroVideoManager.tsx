import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, PlayCircle, Save } from "lucide-react";
import { extractYouTubeId, useIntroVideoUrl } from "@/hooks/useIntroVideoUrl";

const IntroVideoManager = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { url: currentUrl, isLoading } = useIntroVideoUrl();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentUrl) setUrl(currentUrl);
  }, [currentUrl]);

  const previewId = extractYouTubeId(url);

  const save = async () => {
    if (!previewId) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .upsert(
        { key: "intro_video_url", value: url, updated_by: user?.id },
        { onConflict: "key" }
      );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Intro video updated");
    qc.invalidateQueries({ queryKey: ["app_setting", "intro_video_url"] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Intro Video
        </CardTitle>
        <CardDescription>
          Update the YouTube intro video shown to new signups and returning users. Existing users will see the new video once.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="intro-url">YouTube URL</Label>
          <Input
            id="intro-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Accepts youtube.com/watch?v=..., youtu.be/..., or /embed/... links.
          </p>
        </div>

        {previewId && (
          <div className="relative w-full overflow-hidden rounded-xl bg-black aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${previewId}?rel=0&modestbranding=1`}
              title="Preview"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <Button onClick={save} disabled={saving || isLoading || !previewId}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save intro video
        </Button>
      </CardContent>
    </Card>
  );
};

export default IntroVideoManager;
