import { motion } from 'framer-motion';
import { Trophy, Flame, Star, Crown, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-400" />;
    case 3:
      return <Medal className="w-5 h-5 text-amber-600" />;
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/30';
    case 2:
      return 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-orange-500/10 border-amber-600/30';
    default:
      return 'bg-card hover:bg-muted/50';
  }
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  type: 'xp' | 'streak';
  isCurrentUser: boolean;
  index: number;
}

const LeaderboardRow = ({ entry, type, isCurrentUser, index }: LeaderboardRowProps) => {
  const rank = entry.rank || index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all',
        getRankBg(rank),
        isCurrentUser && 'ring-2 ring-primary'
      )}
    >
      <div className="w-8 flex items-center justify-center">
        {getRankIcon(rank)}
      </div>

      <Avatar className="h-10 w-10 border-2 border-background">
        <AvatarImage src={entry.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {entry.display_name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          isCurrentUser && 'text-primary'
        )}>
          {entry.display_name || 'Anonymous'}
          {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
        </p>
        <p className="text-xs text-muted-foreground">
          Level {entry.level}
        </p>
      </div>

      <div className="flex items-center gap-1.5 font-bold">
        {type === 'xp' ? (
          <>
            <Star className="w-4 h-4 text-primary" />
            <span>{entry.xp_points.toLocaleString()}</span>
          </>
        ) : (
          <>
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{entry.streak_days}</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

interface LeaderboardProps {
  limit?: number;
}

export const Leaderboard = ({ limit = 20 }: LeaderboardProps) => {
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
              <div key={i} className="h-16 bg-muted rounded-xl" />
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
                <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded-full">
                  #{currentUserXpRank}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="streak" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Top Streaks
              {currentUserStreakRank && (
                <span className="text-xs bg-orange-500/20 px-1.5 py-0.5 rounded-full">
                  #{currentUserStreakRank}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="xp" className="mt-0">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {xpLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No students yet. Be the first!
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
                  <p className="text-center text-muted-foreground py-8">
                    No streaks yet. Start learning!
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
