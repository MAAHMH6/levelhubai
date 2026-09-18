import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  key: string;
  label: string;
  url: string | null;
  enabled: boolean;
  sort_order: number;
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async (): Promise<SocialLink[]> => {
      const { data } = await supabase
        .from("social_links" as any)
        .select("*")
        .order("sort_order");
      return ((data as any) ?? []) as SocialLink[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useEnabledSocialLinks() {
  const q = useSocialLinks();
  return { ...q, data: (q.data ?? []).filter((s) => s.enabled && s.url) };
}
