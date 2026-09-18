import { motion } from 'framer-motion';
import { Award, Lock, BookOpen, Compass, GraduationCap, Crown, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useSubjectBadges, SubjectBadge } from '@/hooks/useSubjectBadges';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SubjectBadgeShowcaseProps {
  subjectId: string;
  subjectName: string;
}

const iconMap: Record<string, any> = {
  BookOpen,
  Compass,
  GraduationCap,
  Crown,
  Target,
  Award,
};

const rarityColors: Record<string, string> = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBg: Record<string, string> = {
  common: 'bg-slate-100 dark:bg-slate-800',
  rare: 'bg-blue-100 dark:bg-blue-900/30',
  epic: 'bg-purple-100 dark:bg-purple-900/30',
  legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
};

export const SubjectBadgeShowcase = ({ subjectId, subjectName }: SubjectBadgeShowcaseProps) => {
  const { getBadgesForSubject, hasBadge, isLoading } = useSubjectBadges(subjectId);
  const badges = getBadgesForSubject(subjectId);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-20 h-20 rounded-full bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedCount = badges.filter(b => hasBadge(b.id)).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {subjectName} Badges
          </CardTitle>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-bold text-primary">{earnedCount}</span>
            <span className="text-muted-foreground">/ {badges.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="flex gap-6 pb-4">
            {badges.map((badge, index) => {
              const Icon = iconMap[badge.icon] || Award;
              const earned = hasBadge(badge.id);

              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-center gap-2 shrink-0"
                    >
                      <div
                        className={cn(
                          "relative w-16 h-16 rounded-full flex items-center justify-center transition-all",
                          earned 
                            ? `bg-gradient-to-br ${rarityColors[badge.rarity]} shadow-lg` 
                            : "bg-muted/50 border-2 border-dashed border-muted-foreground/30"
                        )}
                      >
                        {earned ? (
                          <Icon className="w-7 h-7 text-white" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className={cn(
                          "text-xs font-medium truncate max-w-[80px]",
                          !earned && "text-muted-foreground"
                        )}>
                          {badge.name.replace(subjectName + ' ', '')}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-[10px] px-1.5 py-0 capitalize",
                            earned && rarityBg[badge.rarity]
                          )}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-primary mt-1">+{badge.xp_reward} XP</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
