import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "./useSubscription";

/**
 * Server-authoritative check: does the current user (or guest) have access
 * to a given subject by name? Uses the SECURITY DEFINER function
 * public.user_can_access_subject.
 * 
 * To prevent exact-match failures in the RPC, we first resolve the exact
 * database subject name using a wildcard fallback search.
 */
export function useSubjectAccess(subjectName: string | undefined | null) {
  const { user } = useAuth();
  const sub = useSubscription();

  // 1. Resolve exact subject name to prevent RPC strict-match failures
  const { data: exactSubjectName } = useQuery({
    queryKey: ["resolve_exact_subject", subjectName],
    enabled: !!subjectName,
    staleTime: Infinity,
    queryFn: async () => {
      if (!subjectName) return null;
      
      // UUID resolution
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subjectName);
      if (isUuid) {
        const { data: byId } = await supabase
          .from('subjects')
          .select('name')
          .eq('id', subjectName)
          .maybeSingle();
        if (byId?.name) return byId.name;
      }

      // Check subject_code
      const { data: byCode } = await supabase
        .from('subjects')
        .select('name')
        .eq('subject_code', subjectName)
        .limit(1)
        .maybeSingle();
      if (byCode?.name) return byCode.name;

      // Try exact ilike first
      let { data } = await supabase
        .from('subjects')
        .select('name')
        .ilike('name', subjectName)
        .limit(1)
        .maybeSingle();
        
      if (!data) {
        // Fallback to wildcard search (e.g. "pakistan-studies" -> "%pakistan%studies%")
        const fallbackQuery = subjectName.replace(/-/g, ' ').replace(/ /g, '%');
        const { data: fallbackData } = await supabase
          .from('subjects')
          .select('name')
          .ilike('name', `%${fallbackQuery}%`)
          .limit(1)
          .maybeSingle();
        data = fallbackData;
      }
      
      return data?.name || subjectName;
    }
  });

  const targetName = exactSubjectName || subjectName;

  // 2. Perform the actual access check using the resolved exact name
  return useQuery({
    queryKey: ["subject_access", targetName, user?.id, sub.plan],
    enabled: targetName !== undefined && targetName !== null,
    queryFn: async () => {
      // Pro & School subscribers always have full access to all Cambridge subjects
      if (sub.isPro || sub.isSchool) return true;

      // Check database subscription_tier / is_premium directly
      const { data: subjRecord } = await supabase
        .from('subjects')
        .select('is_premium, subscription_tier')
        .ilike('name', targetName)
        .limit(1)
        .maybeSingle();
      if (subjRecord && (subjRecord.is_premium === false || subjRecord.subscription_tier === 'free')) {
        return true;
      }

      // Core free fallback subjects: Mathematics, Physics, and ICT
      const lower = (targetName || '').toLowerCase().trim();
      if (
        lower.includes('math') || 
        lower.includes('physic') || 
        lower.includes('ict')
      ) {
        return true;
      }
      
      const { data, error } = await supabase.rpc("user_can_access_subject" as any, {
        _user: user?.id ?? null,
        _subject_name: targetName,
      });
      if (error) return false;
      return Boolean(data);
    },
    staleTime: 60_000,
  });
}
