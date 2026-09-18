import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_URL = "https://www.youtube.com/watch?v=8SJpJZG75ZA";

export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([^/?]+)/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
};

export const useIntroVideoUrl = () => {
  const query = useQuery({
    queryKey: ["app_setting", "intro_video_url"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "intro_video_url")
        .maybeSingle();
      if (error) throw error;
      const raw = (data?.value as string) ?? DEFAULT_URL;
      return typeof raw === "string" ? raw : DEFAULT_URL;
    },
    staleTime: 1000 * 60 * 5,
  });
  const url = query.data ?? DEFAULT_URL;
  return { url, videoId: extractYouTubeId(url), isLoading: query.isLoading };
};
