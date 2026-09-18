import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  rarity: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface UserStats {
  streak_days: number;
  total_xp: number;
  questions_answered: number;
  correct_answers: number;
  level: number;
}

export const useBadges = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all available badges
  const { data: allBadges = [], isLoading: badgesLoading } = useQuery({
    queryKey: ['badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('requirement_value', { ascending: true });
      
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Fetch user's earned badges
  const { data: userBadges = [], isLoading: userBadgesLoading } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      
      if (error) throw error;
      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!user,
  });

  // Fetch user stats for badge checking
  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_days, xp_points, level')
        .eq('id', user.id)
        .single();

      // Get quiz attempt stats
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('is_correct')
        .eq('user_id', user.id);

      const questionsAnswered = attempts?.length || 0;
      const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;

      return {
        streak_days: profile?.streak_days || 0,
        total_xp: profile?.xp_points || 0,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        level: profile?.level || 1,
      } as UserStats;
    },
    enabled: !!user,
  });

  // Award badge mutation
  const awardBadge = useMutation({
    mutationFn: async (badgeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: badgeId,
        })
        .select(`
          *,
          badge:badges(*)
        `)
        .single();

      if (error) {
        if (error.code === '23505') {
          // Already has this badge
          return null;
        }
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['user-badges'] });
        toast.success(`🏆 Badge Earned: ${data.badge.name}!`, {
          description: `+${data.badge.xp_reward} XP`,
        });
      }
    },
  });

  // Check and award eligible badges
  const checkAndAwardBadges = async () => {
    if (!user || !userStats) return;

    const earnedBadgeIds = userBadges.map(ub => ub.badge_id);
    const eligibleBadges = allBadges.filter(badge => {
      if (earnedBadgeIds.includes(badge.id)) return false;

      switch (badge.requirement_type) {
        case 'streak_days':
          return userStats.streak_days >= badge.requirement_value;
        case 'total_xp':
          return userStats.total_xp >= badge.requirement_value;
        case 'questions_answered':
          return userStats.questions_answered >= badge.requirement_value;
        case 'correct_answers':
          return userStats.correct_answers >= badge.requirement_value;
        case 'level':
          return userStats.level >= badge.requirement_value;
        default:
          return false;
      }
    });

    for (const badge of eligibleBadges) {
      await awardBadge.mutateAsync(badge.id);
    }
  };

  // Get badges by category
  const getBadgesByCategory = (category: string) => {
    return allBadges.filter(b => b.category === category);
  };

  // Check if user has specific badge
  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  // Get progress towards a badge
  const getBadgeProgress = (badge: Badge): number => {
    if (!userStats) return 0;

    let current = 0;
    switch (badge.requirement_type) {
      case 'streak_days':
        current = userStats.streak_days;
        break;
      case 'total_xp':
        current = userStats.total_xp;
        break;
      case 'questions_answered':
        current = userStats.questions_answered;
        break;
      case 'correct_answers':
        current = userStats.correct_answers;
        break;
      case 'level':
        current = userStats.level;
        break;
    }

    return Math.min((current / badge.requirement_value) * 100, 100);
  };

  return {
    allBadges,
    userBadges,
    userStats,
    isLoading: badgesLoading || userBadgesLoading,
    checkAndAwardBadges,
    getBadgesByCategory,
    hasBadge,
    getBadgeProgress,
    awardBadge: awardBadge.mutate,
  };
};
