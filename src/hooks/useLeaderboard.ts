import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef } from 'react';

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

// EXACT top students from Admin Dashboard (No fake emails)
export const ADMIN_TOP_STUDENTS: LeaderboardEntry[] = [
  {
    id: 'user-shams-ejaz',
    display_name: 'Shams Ejaz',
    avatar_url: null,
    avatar_fallback: 'S',
    avatar_color: 'bg-blue-600 text-white',
    xp_points: 11018,
    level: 5,
    streak_days: 21,
    subscription_plan: 'free',
    school: 'Cambridge Academy',
  },
  {
    id: 'user-hamid-918',
    display_name: 'Hamid_918',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    avatar_fallback: 'H',
    avatar_color: 'bg-emerald-600 text-white',
    xp_points: 4905,
    level: 4,
    streak_days: 16,
    subscription_plan: 'pro',
    school: 'Beaconhouse Jubilee',
  },
  {
    id: 'user-unzila-mahar',
    display_name: 'Unzila Mahar',
    avatar_url: null,
    avatar_fallback: 'U',
    avatar_color: 'bg-rose-500 text-white',
    xp_points: 4200,
    level: 3,
    streak_days: 14,
    subscription_plan: 'free',
    school: 'Karachi Grammar School',
  },
  {
    id: 'user-mohammed-shams',
    display_name: 'Mohammed Shams',
    avatar_url: null,
    avatar_fallback: 'M',
    avatar_color: 'bg-teal-500 text-white',
    xp_points: 3641,
    level: 3,
    streak_days: 11,
    subscription_plan: 'pro',
    school: 'Dubai College',
  },
  {
    id: 'user-amirah-shams',
    display_name: 'Amirah Shams',
    avatar_url: null,
    avatar_fallback: 'A',
    avatar_color: 'bg-purple-600 text-white',
    xp_points: 1305,
    level: 2,
    streak_days: 9,
    subscription_plan: 'free',
    school: 'Raffles Institution',
  },
  {
    id: 'user-ishtiaq-ahmad',
    display_name: 'Ishtiaq Ahmad',
    avatar_url: null,
    avatar_fallback: 'I',
    avatar_color: 'bg-cyan-600 text-white',
    xp_points: 1140,
    level: 2,
    streak_days: 7,
    subscription_plan: 'free',
    school: 'British Council International',
  },
  {
    id: 'user-aj',
    display_name: 'AJ',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatar_fallback: 'AJ',
    avatar_color: 'bg-slate-700 text-white',
    xp_points: 1113,
    level: 2,
    streak_days: 6,
    subscription_plan: 'free',
    school: 'Singapore American School',
  },
  {
    id: 'user-khizarsalman',
    display_name: 'khizarsalman',
    avatar_url: null,
    avatar_fallback: 'k',
    avatar_color: 'bg-slate-800 text-white',
    xp_points: 855,
    level: 1,
    streak_days: 5,
    subscription_plan: 'free',
    school: 'Lahore Grammar School',
  },
  {
    id: 'user-sahab-malik',
    display_name: 'Sahab malik',
    avatar_url: null,
    avatar_fallback: 'S',
    avatar_color: 'bg-emerald-500 text-white',
    xp_points: 645,
    level: 1,
    streak_days: 4,
    subscription_plan: 'free',
    school: 'City School',
  },
  {
    id: 'user-khadija-samiullah',
    display_name: 'khadija samiullah',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    avatar_fallback: 'K',
    avatar_color: 'bg-amber-600 text-white',
    xp_points: 565,
    level: 1,
    streak_days: 3,
    subscription_plan: 'free',
    school: 'Army Public School',
  }
];

const XP_QUERY_KEY = (limit: number) => ['leaderboard', 'xp', limit];
const STREAK_QUERY_KEY = (limit: number) => ['leaderboard', 'streak', limit];

const fetchXpLeaderboard = async (limit: number): Promise<LeaderboardEntry[]> => {
  let dbUsers: LeaderboardEntry[] = [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp_points, level, streak_days, subscription_plan, school')
      .order('xp_points', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      // Filter out any raw email strings from display_name
      dbUsers = data.map((d: any) => ({
        ...d,
        display_name: d.display_name?.includes('@') ? d.display_name.split('@')[0] : d.display_name,
      })) as LeaderboardEntry[];
    }
  } catch (err) {
    console.warn('Error fetching profiles for xp leaderboard:', err);
  }

  // Combine database users and canonical admin students
  const existingNames = new Set(dbUsers.map(u => (u.display_name || '').toLowerCase()));
  const merged = [
    ...dbUsers,
    ...ADMIN_TOP_STUDENTS.filter(s => !existingNames.has((s.display_name || '').toLowerCase())),
  ];

  // Sort strictly by XP descending
  merged.sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0));

  return merged.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

const fetchStreakLeaderboard = async (limit: number): Promise<LeaderboardEntry[]> => {
  let dbUsers: LeaderboardEntry[] = [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, xp_points, level, streak_days, subscription_plan, school')
      .order('streak_days', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      dbUsers = data.map((d: any) => ({
        ...d,
        display_name: d.display_name?.includes('@') ? d.display_name.split('@')[0] : d.display_name,
      })) as LeaderboardEntry[];
    }
  } catch (err) {
    console.warn('Error fetching profiles for streak leaderboard:', err);
  }

  const existingNames = new Set(dbUsers.map(u => (u.display_name || '').toLowerCase()));
  const merged = [
    ...dbUsers,
    ...ADMIN_TOP_STUDENTS.filter(s => !existingNames.has((s.display_name || '').toLowerCase())),
  ];

  // Sort strictly by streak_days descending, secondary by xp_points
  merged.sort((a, b) => {
    if ((b.streak_days || 0) !== (a.streak_days || 0)) {
      return (b.streak_days || 0) - (a.streak_days || 0);
    }
    return (b.xp_points || 0) - (a.xp_points || 0);
  });

  return merged.slice(0, limit).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
};

export const useLeaderboard = (limit: number = 50) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const prevXpRanksRef = useRef<Map<string, number>>(new Map());
  const prevStreakRanksRef = useRef<Map<string, number>>(new Map());

  const initialXpData = [...ADMIN_TOP_STUDENTS]
    .sort((a, b) => b.xp_points - a.xp_points)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const initialStreakData = [...ADMIN_TOP_STUDENTS]
    .sort((a, b) => b.streak_days - a.streak_days)
    .slice(0, limit)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const { data: xpLeaderboard = initialXpData, isLoading: xpLoading } = useQuery({
    queryKey: XP_QUERY_KEY(limit),
    queryFn: () => fetchXpLeaderboard(limit),
    initialData: initialXpData,
    refetchInterval: 30_000,
  });

  const { data: streakLeaderboard = initialStreakData, isLoading: streakLoading } = useQuery({
    queryKey: STREAK_QUERY_KEY(limit),
    queryFn: () => fetchStreakLeaderboard(limit),
    initialData: initialStreakData,
    refetchInterval: 30_000,
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

  // Realtime subscription on profiles table
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const currentUserId = user?.id;
  const currentUserXpRank = xpWithChanges.find(e => e.id === currentUserId)?.rank;
  const currentUserStreakRank = streakWithChanges.find(e => e.id === currentUserId)?.rank;

  return {
    xpLeaderboard: xpWithChanges,
    streakLeaderboard: streakWithChanges,
    isLoading: xpLoading || streakLoading,
    currentUserId,
    currentUserXpRank,
    currentUserStreakRank,
  };
};
