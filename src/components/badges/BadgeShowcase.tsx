import { motion } from 'framer-motion';
import { Award, Flame, Star, Brain, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BadgeCard } from './BadgeCard';
import { useBadges } from '@/hooks/useBadges';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', icon: Award },
  { id: 'streak', label: 'Streaks', icon: Flame },
  { id: 'xp', label: 'XP', icon: Star },
  { id: 'accuracy', label: 'Questions', icon: Target },
  { id: 'level', label: 'Level', icon: TrendingUp },
  { id: 'special', label: 'Special', icon: Sparkles },
];

export const BadgeShowcase = () => {
  const { allBadges, userBadges, hasBadge, getBadgeProgress, isLoading } = useBadges();

  const earnedCount = userBadges.length;
  const totalCount = allBadges.length;

  const getBadgesForCategory = (category: string) => {
    if (category === 'all') return allBadges;
    return allBadges.filter(b => b.category === category);
  };

  const getEarnedDate = (badgeId: string) => {
    const userBadge = userBadges.find(ub => ub.badge_id === badgeId);
    return userBadge?.earned_at;
  };

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

  return (
    <Card className="overflow-hidden h-full flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Achievements
            </CardTitle>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-bold text-primary">{earnedCount}</span>
              <span className="text-muted-foreground">/ {totalCount}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs defaultValue="all" className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex h-9 w-full justify-start bg-transparent p-0 mb-3">
                {categories.map(({ id, label, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
                      'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
                      'rounded-full transition-all'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {categories.map(({ id }) => (
              <TabsContent key={id} value={id} className="mt-0">
                <ScrollArea className="h-[290px] w-full pr-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 py-2">
                    {getBadgesForCategory(id).map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex justify-center"
                      >
                        <BadgeCard
                          badge={badge}
                          earned={hasBadge(badge.id)}
                          earnedAt={getEarnedDate(badge.id)}
                          progress={getBadgeProgress(badge)}
                          size="sm"
                        />
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </div>

      {/* Next Milestone Footer pinned to the bottom of the card */}
      <div className="p-3.5 mx-6 mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Next Unlock: Quiz Champion</div>
            <div className="text-[11px] text-slate-500">Score 80%+ on 3 Cambridge Quizzes to claim</div>
          </div>
        </div>
        <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/80 border border-teal-200/60 dark:border-teal-800 px-2.5 py-1 rounded-full shrink-0">
          +100 XP
        </span>
      </div>
    </Card>
  );
};
