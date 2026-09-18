import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubjectBadge {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  created_at: string;
}

export interface UserSubjectBadge {
  id: string;
  user_id: string;
  subject_badge_id: string;
  earned_at: string;
}

export const useSubjectBadges = (subjectId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: allSubjectBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['subject-badges', subjectId],
    queryFn: async () => {
      let query = supabase.from('subject_badges').select('*');
      
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data, error } = await query.order('requirement_value');
      if (error) throw error;
      return data as SubjectBadge[];
    },
  });

  const { data: userSubjectBadges = [], isLoading: userBadgesLoading } = useQuery({
    queryKey: ['user-subject-badges', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_subject_badges')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data as UserSubjectBadge[];
    },
    enabled: !!user,
  });

  const hasBadge = (badgeId: string) => {
    return userSubjectBadges.some(ub => ub.subject_badge_id === badgeId);
  };

  const getBadgesForSubject = (subId: string) => {
    return allSubjectBadges.filter(b => b.subject_id === subId);
  };

  const earnedBadgesForSubject = (subId: string) => {
    const subjectBadgeIds = allSubjectBadges
      .filter(b => b.subject_id === subId)
      .map(b => b.id);
    return userSubjectBadges.filter(ub => subjectBadgeIds.includes(ub.subject_badge_id));
  };

  return {
    allSubjectBadges,
    userSubjectBadges,
    isLoading: badgesLoading || userBadgesLoading,
    hasBadge,
    getBadgesForSubject,
    earnedBadgesForSubject,
  };
};
