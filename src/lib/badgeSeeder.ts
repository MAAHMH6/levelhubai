/**
 * Badge Seeder — inserts / upserts 20+ badge definitions into the Supabase `badges` table.
 * Can be triggered from the Admin panel.
 */
import { supabase } from '@/integrations/supabase/client';

export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ─── STREAK ───────────────────────────────────────────────
  {
    name: '3-Day Spark',
    description: 'Study 3 days in a row',
    icon: '⚡',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 3,
    xp_reward: 50,
    rarity: 'common',
  },
  {
    name: '5-Day Fire',
    description: 'Maintain a 5-day learning streak',
    icon: '🔥',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 5,
    xp_reward: 100,
    rarity: 'common',
  },
  {
    name: '14-Day Warrior',
    description: 'Study for 14 consecutive days',
    icon: '⚔️',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 14,
    xp_reward: 300,
    rarity: 'rare',
  },
  {
    name: '30-Day Legend',
    description: '30 days of unstoppable learning',
    icon: '🛡️',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 30,
    xp_reward: 700,
    rarity: 'epic',
  },
  {
    name: '100-Day Immortal',
    description: '100 consecutive days — you are unstoppable',
    icon: '💎',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 100,
    xp_reward: 2500,
    rarity: 'legendary',
  },

  // ─── XP ───────────────────────────────────────────────────
  {
    name: 'XP Starter',
    description: 'Earn your first 500 XP',
    icon: '✨',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 500,
    xp_reward: 50,
    rarity: 'common',
  },
  {
    name: 'XP Collector',
    description: 'Reach 2,000 XP',
    icon: '💫',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 2000,
    xp_reward: 150,
    rarity: 'common',
  },
  {
    name: 'XP Hunter',
    description: 'Amass 5,000 XP',
    icon: '🌟',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 5000,
    xp_reward: 400,
    rarity: 'rare',
  },
  {
    name: 'XP Master',
    description: 'Accumulate 15,000 XP — you\'re a powerhouse',
    icon: '🔮',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 15000,
    xp_reward: 1000,
    rarity: 'epic',
  },
  {
    name: 'XP Grandmaster',
    description: '50,000 XP — an elite scholar',
    icon: '👑',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 50000,
    xp_reward: 5000,
    rarity: 'legendary',
  },

  // ─── QUESTIONS ────────────────────────────────────────────
  {
    name: 'First Question',
    description: 'Answer your very first question',
    icon: '🎯',
    category: 'accuracy',
    requirement_type: 'questions_answered',
    requirement_value: 1,
    xp_reward: 25,
    rarity: 'common',
  },
  {
    name: 'Century',
    description: 'Answer 100 questions',
    icon: '💯',
    category: 'accuracy',
    requirement_type: 'questions_answered',
    requirement_value: 100,
    xp_reward: 200,
    rarity: 'common',
  },
  {
    name: 'Question Master',
    description: 'Answer 500 questions',
    icon: '🧠',
    category: 'accuracy',
    requirement_type: 'questions_answered',
    requirement_value: 500,
    xp_reward: 600,
    rarity: 'rare',
  },
  {
    name: 'Knowledge God',
    description: 'Answer 1,000 questions',
    icon: '🏛️',
    category: 'accuracy',
    requirement_type: 'questions_answered',
    requirement_value: 1000,
    xp_reward: 1500,
    rarity: 'epic',
  },
  {
    name: 'Accuracy King',
    description: 'Get 50 correct answers',
    icon: '🎯',
    category: 'accuracy',
    requirement_type: 'correct_answers',
    requirement_value: 50,
    xp_reward: 150,
    rarity: 'common',
  },
  {
    name: 'Sharp Shooter',
    description: 'Get 250 correct answers',
    icon: '🏹',
    category: 'accuracy',
    requirement_type: 'correct_answers',
    requirement_value: 250,
    xp_reward: 450,
    rarity: 'rare',
  },

  // ─── LEVELS ───────────────────────────────────────────────
  {
    name: 'Level 5',
    description: 'Reach Level 5',
    icon: '⭐',
    category: 'level',
    requirement_type: 'level',
    requirement_value: 5,
    xp_reward: 200,
    rarity: 'common',
  },
  {
    name: 'Level 10',
    description: 'Reach Level 10 — mid-tier champion',
    icon: '🌠',
    category: 'level',
    requirement_type: 'level',
    requirement_value: 10,
    xp_reward: 500,
    rarity: 'rare',
  },
  {
    name: 'Level 20',
    description: 'Reach Level 20 — elite scholar',
    icon: '🏆',
    category: 'level',
    requirement_type: 'level',
    requirement_value: 20,
    xp_reward: 1200,
    rarity: 'epic',
  },
  {
    name: 'Level 50',
    description: 'Reach Level 50 — a true Cambridge legend',
    icon: '🌌',
    category: 'level',
    requirement_type: 'level',
    requirement_value: 50,
    xp_reward: 5000,
    rarity: 'legendary',
  },

  // ─── SOCIAL / SPECIAL ────────────────────────────────────
  {
    name: 'Early Adopter',
    description: 'Joined LevelHubAI in its first year',
    icon: '🚀',
    category: 'special',
    requirement_type: 'level',
    requirement_value: 1,
    xp_reward: 100,
    rarity: 'rare',
  },
  {
    name: 'Night Owl',
    description: 'Studied after 10 PM for the first time',
    icon: '🦉',
    category: 'special',
    requirement_type: 'streak_days',
    requirement_value: 2,
    xp_reward: 75,
    rarity: 'common',
  },
  {
    name: 'Perfect Week',
    description: 'Complete 7 days in a row',
    icon: '📅',
    category: 'streak',
    requirement_type: 'streak_days',
    requirement_value: 7,
    xp_reward: 200,
    rarity: 'rare',
  },
  {
    name: 'High Achiever',
    description: 'Earn 10,000 XP',
    icon: '🎓',
    category: 'xp',
    requirement_type: 'total_xp',
    requirement_value: 10000,
    xp_reward: 700,
    rarity: 'epic',
  },
  {
    name: 'Knowledge Seeker',
    description: 'Answer 250 questions',
    icon: '📖',
    category: 'accuracy',
    requirement_type: 'questions_answered',
    requirement_value: 250,
    xp_reward: 350,
    rarity: 'rare',
  },
];

export const seedBadges = async (): Promise<{ inserted: number; skipped: number; errors: string[] }> => {
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // Fetch existing badge names to avoid duplicates
  const { data: existing } = await supabase.from('badges').select('name');
  const existingNames = new Set((existing || []).map((b: any) => b.name));

  const toInsert = BADGE_DEFINITIONS.filter(b => !existingNames.has(b.name));
  skipped = BADGE_DEFINITIONS.length - toInsert.length;

  if (toInsert.length === 0) {
    return { inserted: 0, skipped, errors: [] };
  }

  const { data, error } = await supabase
    .from('badges')
    .insert(toInsert)
    .select();

  if (error) {
    errors.push(error.message);
  } else {
    inserted = data?.length || 0;
  }

  return { inserted, skipped, errors };
};
