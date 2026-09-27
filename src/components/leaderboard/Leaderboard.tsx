import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

const getRankBadge = (rank: number) => {
  if (rank === 1) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs font-black text-amber-500">
        <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs font-black text-slate-400">
        <Medal className="w-3.5 h-3.5 fill-slate-300 text-slate-400" />
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs font-black text-amber-700">
        <Medal className="w-3.5 h-3.5 fill-amber-600 text-amber-700" />
        #3
      </span>
    );
  }
  return <span className="text-xs font-bold text-muted-foreground">#{rank}</span>;
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  type: 'xp' | 'streak';
  isCurrentUser: boolean;
  index: number;
}

const LeaderboardRow = ({ entry, type, isCurrentUser, index }: LeaderboardRowProps) => {
  const rank = entry.rank || index + 1;
  const isPro = entry.subscription_plan === 'pro' || entry.subscription_plan === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-200 select-none",
        rank === 1 ? "bg-amber-500/5 border-amber-500/20" :
        rank === 2 ? "bg-slate-400/5 border-slate-300/30 dark:border-slate-700/50" :
        rank === 3 ? "bg-orange-500/5 border-orange-500/20" :
        "bg-card hover:bg-muted/40 border-border/80",
        isCurrentUser && "ring-2 ring-primary border-primary/40 shadow-xs"
      )}
    >
      {/* Rank Indicator (#1, #2, #3...) */}
      <div className="w-9 shrink-0 text-center flex items-center justify-center">
        {getRankBadge(rank)}
      </div>

      {/* Avatar using same supplier (Google/uploaded avatar or initial fallback) */}
      <Avatar className="h-8 w-8 shrink-0 border border-border/60">
        <AvatarImage 
          src={entry.avatar_url || undefined} 
          alt={entry.display_name || 'Student'} 
          className="object-cover"
        />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
          {(entry.display_name || '?').charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Student Details: Name, (You), Level, Streak, Subscription Plan */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={cn(
            "text-sm font-medium truncate max-w-[160px]",
            isCurrentUser && "font-bold text-primary"
          )}>
            {entry.display_name || "Unknown"}
          </p>
          {isCurrentUser && (
            <span className="text-[10px] font-bold text-primary bg-primary/15 px-1.5 py-0.2 rounded-full">
              (You)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
          <span>Lv.{entry.level || 1}</span>
          <span className="flex items-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-500 fill-orange-500 inline" />
            {entry.streak_days || 0}d streak
          </span>
          <Badge
            variant={isPro ? "default" : "secondary"}
            className={cn(
              "text-[10px] px-1.5 py-0 h-4 capitalize font-semibold",
              isPro && "bg-teal-600 text-white hover:bg-teal-600"
            )}
          >
            {entry.subscription_plan || "free"}
          </Badge>
          {entry.school && (
            <span className="truncate max-w-[120px] hidden sm:inline opacity-80">
              · {entry.school}
            </span>
          )}
        </div>
      </div>

      {/* Real XP / Metric Display */}
      <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
        {type === 'xp' ? (
          <span className="flex items-center gap-1 text-primary">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>{(entry.xp_points || 0).toLocaleString()}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-orange-500">
            <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
            <span>{entry.streak_days || 0}d</span>
          </span>
        )}
      </div>
    </motion.div>
  );
};

interface LeaderboardProps {
  limit?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ limit = 20 }) => {
  const { 
    xpLeaderboard, 
    streakLeaderboard, 
    isLoading, 
    currentUserId,
    currentUserXpRank,
    currentUserStreakRank 
  } = useLeaderboard(limit);

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="xp" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="xp" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Top XP
              {currentUserXpRank && (
                <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded-full font-bold">
                  #{currentUserXpRank}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Top Streaks
              {currentUserStreakRank && (
                <span className="text-xs bg-orange-500/20 px-1.5 py-0.5 rounded-full font-bold">
                  #{currentUserStreakRank}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {xpLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No students yet. Start learning to take #1!
                  </p>
                ) : (
                  xpLeaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      type="xp"
                      isCurrentUser={entry.id === currentUserId}
                      index={index}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="streak" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {streakLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No streaks yet. Start daily practice!
                  </p>
                ) : (
                  streakLeaderboard.map((entry, index) => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      type="streak"
                      isCurrentUser={entry.id === currentUserId}
                      index={index}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
