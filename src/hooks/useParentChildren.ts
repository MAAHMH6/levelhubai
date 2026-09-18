import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ChildPerformance {
  id: string;
  name: string;
  grade: string;
  overall_score: number;
  last_activity: string | null;
  improvement: number;
}

export function useParentChildren() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["parent_children", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // 1. Get linked children
      const { data: links, error: linkError } = await supabase
        .from("parent_children")
        .select("child_id")
        .eq("parent_id", user!.id);
        
      if (linkError) throw linkError;
      if (!links || links.length === 0) return [];
      
      const childIds = links.map(l => l.child_id);
      
      // 2. Get profiles for children
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, target_grade, programme, updated_at")
        .in("id", childIds);
        
      if (profileError) throw profileError;

      // 3. For each child, fetch real quiz_sessions, quiz_attempts, and lesson_progress
      const childrenData = await Promise.all(
        (profiles || []).map(async (p) => {
          // Fetch quiz attempts / sessions
          const [attemptsRes, sessionsRes, lessonsRes] = await Promise.all([
            supabase
              .from("quiz_attempts")
              .select("percentage, created_at")
              .eq("user_id", p.id)
              .order("created_at", { ascending: false })
              .limit(20),
            supabase
              .from("quiz_sessions")
              .select("percentage, completed_at")
              .eq("user_id", p.id)
              .order("completed_at", { ascending: false })
              .limit(20),
            supabase
              .from("lesson_progress")
              .select("updated_at")
              .eq("user_id", p.id)
              .order("updated_at", { ascending: false })
              .limit(1)
          ]);

          // Collect all percentage scores
          const scores: number[] = [];
          if (attemptsRes.data) {
            attemptsRes.data.forEach(a => {
              if (typeof a.percentage === 'number') scores.push(a.percentage);
            });
          }
          if (sessionsRes.data) {
            sessionsRes.data.forEach(s => {
              if (typeof s.percentage === 'number') scores.push(s.percentage);
            });
          }

          // Calculate average overall score
          let overallScore = 0;
          if (scores.length > 0) {
            const sum = scores.reduce((acc, curr) => acc + curr, 0);
            overallScore = Math.round(sum / scores.length);
          }

          // Calculate trend / improvement (first half vs second half if at least 4 scores)
          let improvement = 0;
          if (scores.length >= 4) {
            const recent = scores.slice(0, Math.floor(scores.length / 2));
            const older = scores.slice(Math.floor(scores.length / 2));
            const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
            const avgOlder = older.reduce((a, b) => a + b, 0) / older.length;
            improvement = Math.round(avgRecent - avgOlder);
          }

          // Determine latest activity timestamp
          const dates: string[] = [];
          if (attemptsRes.data?.[0]?.created_at) dates.push(attemptsRes.data[0].created_at);
          if (sessionsRes.data?.[0]?.completed_at) dates.push(sessionsRes.data[0].completed_at);
          if (lessonsRes.data?.[0]?.updated_at) dates.push(lessonsRes.data[0].updated_at);
          if (p.updated_at) dates.push(p.updated_at);

          const lastActivity = dates.length > 0 
            ? dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
            : null;

          // Programme label formatting
          const progLabel = p.programme === 'a_level' 
            ? 'A-Level' 
            : p.programme === 'igcse' 
            ? 'Cambridge IGCSE' 
            : p.programme === 'o_level' 
            ? 'Cambridge O-Level' 
            : (p.target_grade ? `Target Grade ${p.target_grade}` : 'Cambridge Student');

          return {
            id: p.id,
            name: p.display_name || "Student",
            grade: progLabel,
            overall_score: overallScore,
            last_activity: lastActivity,
            improvement: improvement
          } as ChildPerformance;
        })
      );
      
      return childrenData;
    }
  });
}
