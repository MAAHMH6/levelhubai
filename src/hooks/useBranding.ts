import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/logo.png";

export interface Branding {
  brand_name: string;
  short_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  footer_copyright: string;
  site_title: string;
  seo_title: string;
  seo_description: string;
}

const DEFAULT: Branding = {
  brand_name: "LevelHubAI",
  short_name: "LevelHub AI",
  logo_url: defaultLogo,
  favicon_url: "/logo.png",
  footer_copyright: `© ${new Date().getFullYear()} LevelHubAI (Cybertrends SMC PVT LTD). All rights reserved.`,
  site_title: "LevelHubAI — O Level, IGCSE & A Level AI Learning Platform",
  seo_title: "LevelHubAI — Cambridge O Level, IGCSE & A Level Exam Prep with AI",
  seo_description:
    "AI-powered Cambridge O Level, IGCSE & A Level exam preparation: notes, quizzes, past papers, and an AI tutor across every core subject.",
};

export function useBranding(): Branding {
  const { data } = useQuery({
    queryKey: ["app_branding"],
    queryFn: async () => {
      const { data } = await supabase.from("app_branding" as any).select("*").eq("id", 1).maybeSingle();
      return (data as any) ?? null;
    },
    staleTime: 5 * 60_000,
  });
  const finalBranding = { ...DEFAULT };
  if (data) {
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== "") {
        (finalBranding as any)[key] = data[key];
      }
    });
  }
  return finalBranding as Branding;
}
