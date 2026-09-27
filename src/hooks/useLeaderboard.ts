import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';

export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  avatar_fallback?: string;
  avatar_color?: string;
  xp_points: number;
  level: number;
  streak_days: number;
  subscription_plan?: string | null;
  school?: string | null;
  rank?: number;
  rankChange?: number;
}

// Exported for backward compatibility if referenced elsewhere
export const ADMIN_TOP_STUDENTS: LeaderboardEntry[] = [];

const XP_QUERY_KEY = (limit: number) => ['leaderboard', 'xp', limit];
const STREAK_QUERY_KEY = (limit: number) => ['leaderboard', 'streak', limit];

const fetchXpLeaderboard = async (limit: number): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp_points, level, streak_days, subscription_plan, school')
      .order('xp_points', { ascending: false })
      .order('streak_days', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching profiles for xp leaderboard:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((d: any, index: number) => {
      const rawName = d.display_name?.trim();
      const safeName = rawName?.includes('@') 
        ? rawName.split('@')[0] 
        : (rawName || 'Student');

      return {
        id: d.id,
        display_name: safeName,
        avatar_url: d.avatar_url || null,
        xp_points: Math.max(0, Number(d.xp_points || 0)),
        level: Math.max(1, Number(d.level || 1)),
        streak_days: Math.max(0, Number(d.streak_days || 0)),
        subscription_plan: d.subscription_plan || 'free',
        school: d.school || null,
        rank: index + 1,
      };
    });
  } catch (err) {
    console.warn('Leaderboard XP fetch error:', err);
    return [];
  }
};

const fetchStreakLeaderboard = async (limit: number): Promise<LeaderboardEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp_points, level, streak_days, subscription_plan, school')
      .order('streak_days', { ascending: false })
      .order('xp_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching profiles for streak leaderboard:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((d: any, index: number) => {
      const rawName = d.display_name?.trim();
      const safeName = rawName?.includes('@') 
        ? rawName.split('@')[0] 
        : (rawName || 'Student');

      return {
        id: d.id,
        display_name: safeName,
        avatar_url: d.avatar_url || null,
        xp_points: Math.max(0, Number(d.xp_points || 0)),
        level: Math.max(1, Number(d.level || 1)),
        streak_days: Math.max(0, Number(d.streak_days || 0)),
        subscription_plan: d.subscription_plan || 'free',
        school: d.school || null,
        rank: index + 1,
      };
    });
  } catch (err) {
    console.warn('Leaderboard streak fetch error:', err);
    return [];
  }
};

export const useLeaderboard = (limit: number = 50) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prevXpRanksRef = useRef<Map<string, number>>(new Map());
  const prevStreakRanksRef = useRef<Map<string, number>>(new Map());

  const [userExactXpRank, setUserExactXpRank] = useState<number | undefined>(undefined);
  const [userExactStreakRank, setUserExactStreakRank] = useState<number | undefined>(undefined);

  const { data: xpLeaderboard = [], isLoading: xpLoading } = useQuery({
    queryKey: XP_QUERY_KEY(limit),
    queryFn: () => fetchXpLeaderboard(limit),
    refetchInterval: 15_000,
  });

  const { data: streakLeaderboard = [], isLoading: streakLoading } = useQuery({
    queryKey: STREAK_QUERY_KEY(limit),
    queryFn: () => fetchStreakLeaderboard(limit),
    refetchInterval: 15_000,
  });

  // Calculate dynamic rank changes (🔺+1 / 🔻-1)
  const xpWithChanges = xpLeaderboard.map(entry => {
    const prevRank = prevXpRanksRef.current.get(entry.id);
    const rankChange = prevRank !== undefined ? prevRank - (entry.rank ?? 0) : 0;
    return { ...entry, rankChange };
  });

  const streakWithChanges = streakLeaderboard.map(entry => {
    const prevRank = prevStreakRanksRef.current.get(entry.id);
    const rankChange = prevRank !== undefined ? prevRank - (entry.rank ?? 0) : 0;
    return { ...entry, rankChange };
  });

  useEffect(() => {
    if (xpLeaderboard.length > 0) {
      const newMap = new Map<string, number>();
      xpLeaderboard.forEach(e => newMap.set(e.id, e.rank ?? 0));
      prevXpRanksRef.current = newMap;
    }
  }, [xpLeaderboard]);

  useEffect(() => {
    if (streakLeaderboard.length > 0) {
      const newMap = new Map<string, number>();
      streakLeaderboard.forEach(e => newMap.set(e.id, e.rank ?? 0));
      prevStreakRanksRef.current = newMap;
    }
  }, [streakLeaderboard]);

  // If current user is not in top limit, fetch their exact rank by counting profiles above them
  useEffect(() => {
    if (!user) {
      setUserExactXpRank(undefined);
      setUserExactStreakRank(undefined);
      return;
    }

    const inXpList = xpLeaderboard.find(e => e.id === user.id);
    const inStreakList = streakLeaderboard.find(e => e.id === user.id);

    if (inXpList) {
      setUserExactXpRank(inXpList.rank);
    } else {
      // Query exact rank for current user
      supabase
        .from('profiles')
        .select('xp_points')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: userProf }) => {
          if (userProf) {
            const userXp = Number(userProf.xp_points || 0);
            supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .gt('xp_points', userXp)
              .then(({ count }) => {
                setUserExactXpRank((count ?? 0) + 1);
              });
          }
        });
    }

    if (inStreakList) {
      setUserExactStreakRank(inStreakList.rank);
    } else {
      supabase
        .from('profiles')
        .select('streak_days')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data: userProf }) => {
          if (userProf) {
            const userStreak = Number(userProf.streak_days || 0);
            supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .gt('streak_days', userStreak)
              .then(({ count }) => {
                setUserExactStreakRank((count ?? 0) + 1);
              });
          }
        });
    }
  }, [user, xpLeaderboard, streakLeaderboard]);

  // Realtime subscription on profiles table and window event listeners
  useEffect(() => {
    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    };

    window.addEventListener('levelhub:xp_updated', handleInvalidate);
    window.addEventListener('levelhub:streak_updated', handleInvalidate);
    window.addEventListener('levelhub:student_stats_updated', handleInvalidate);
    window.addEventListener('levelhub:profile_updated', handleInvalidate);

    const channel = supabase
      .channel('leaderboard-live-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        handleInvalidate();
      })
      .subscribe();

    return () => {
      window.removeEventListener('levelhub:xp_updated', handleInvalidate);
      window.removeEventListener('levelhub:streak_updated', handleInvalidate);
      window.removeEventListener('levelhub:student_stats_updated', handleInvalidate);
      window.removeEventListener('levelhub:profile_updated', handleInvalidate);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const currentUserId = user?.id;
  const currentUserXpRank = userExactXpRank ?? xpWithChanges.find(e => e.id === currentUserId)?.rank;
  const currentUserStreakRank = userExactStreakRank ?? streakWithChanges.find(e => e.id === currentUserId)?.rank;

  return {
    xpLeaderboard: xpWithChanges,
    streakLeaderboard: streakWithChanges,
    isLoading: xpLoading || streakLoading,
    currentUserId,
    currentUserXpRank,
    currentUserStreakRank,
  };
};
