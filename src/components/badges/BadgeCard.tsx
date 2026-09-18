import { motion } from 'framer-motion';
import { 
  Flame, Star, Trophy, Crown, CheckCircle, Brain, Target, Zap,
  Calculator, Microscope, BookOpen, TrendingUp, Award, Lock
} from 'lucide-react';
import { Badge } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Star,
  Trophy,
  Crown,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Calculator,
  Microscope,
  BookOpen,
  TrendingUp,
  Award,
};

const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
  common: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-slate-300 dark:border-slate-600',
    glow: '',
  },
  uncommon: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    border: 'border-emerald-400 dark:border-emerald-600',
    glow: 'shadow-emerald-200/50 dark:shadow-emerald-500/20',
  },
  rare: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-400 dark:border-blue-500',
    glow: 'shadow-blue-200/50 dark:shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    border: 'border-purple-400 dark:border-purple-500',
    glow: 'shadow-purple-300/60 dark:shadow-purple-500/40',
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30',
    border: 'border-amber-400 dark:border-amber-500',
    glow: 'shadow-amber-300/60 dark:shadow-amber-500/40',
  },
};

const rarityTextColors: Record<string, string> = {
  common: 'text-slate-600 dark:text-slate-300',
  uncommon: 'text-emerald-600 dark:text-emerald-400',
  rare: 'text-blue-600 dark:text-blue-400',
  epic: 'text-purple-600 dark:text-purple-400',
  legendary: 'text-amber-600 dark:text-amber-400',
};

const sizeConfig = {
  sm: { container: 'w-16 h-16', icon: 'w-6 h-6', text: 'text-xs', emoji: 'text-xl' },
  md: { container: 'w-20 h-20', icon: 'w-8 h-8', text: 'text-sm', emoji: 'text-2xl' },
  lg: { container: 'w-24 h-24', icon: 'w-10 h-10', text: 'text-base', emoji: 'text-3xl' },
};

export const BadgeCard = ({
  badge,
  earned,
  earnedAt,
  progress = 0,
  size = 'md',
  showProgress = true,
}: BadgeCardProps) => {
  const isEmoji = badge.icon && !iconMap[badge.icon] && /[\p{Emoji}\u200d]+/u.test(badge.icon);
  const IconComponent = iconMap[badge.icon] || Award;
  const rarity = rarityColors[badge.rarity] || rarityColors.common;
  const rarityText = rarityTextColors[badge.rarity] || rarityTextColors.common;
  const sizeClasses = sizeConfig[size];

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1.02 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={cn(
          'relative rounded-full border-2 flex items-center justify-center transition-all',
          sizeClasses.container,
          earned ? rarity.bg : 'bg-muted/50',
          earned ? rarity.border : 'border-muted-foreground/20',
          earned && rarity.glow && `shadow-lg ${rarity.glow}`,
          !earned && 'opacity-50 grayscale'
        )}
      >
        {earned ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {isEmoji ? (
              <span className={sizeClasses.emoji}>{badge.icon}</span>
            ) : (
              <IconComponent className={cn(sizeClasses.icon, rarityText)} />
            )}
          </motion.div>
        ) : (
          <Lock className={cn(sizeClasses.icon, 'text-muted-foreground/50')} />
        )}

        {/* Progress ring for locked badges */}
        {!earned && showProgress && progress > 0 && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary/30"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.89} 289`}
              className="text-primary"
            />
          </svg>
        )}

        {/* Legendary glow effect */}
        {earned && badge.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      <div className="text-center max-w-20">
        <p className={cn('font-medium line-clamp-2', sizeClasses.text, earned ? '' : 'text-muted-foreground')}>
          {badge.name}
        </p>
        {earned && earnedAt && size === 'lg' && (
          <p className="text-xs text-muted-foreground">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
        {!earned && showProgress && (
          <p className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </p>
        )}
      </div>
    </motion.div>
  );
};
