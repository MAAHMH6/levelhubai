import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Star, Crown, Medal, TrendingUp, TrendingDown, Minus, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useLeaderboard, LeaderboardEntry } from '@/hooks/useLeaderboard';
import { cn } from '@/lib/utils';

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400 drop-shadow-sm" />;
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
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40 shadow-yellow-500/10 shadow-md';
    case 2:
      return 'bg-gradient-to-r from-slate-400/15 to-slate-300/5 border-slate-400/30';
    case 3:
      return 'bg-gradient-to-r from-amber-600/15 to-orange-500/5 border-amber-600/30';
    default:
      return 'bg-card hover:bg-muted/40 border-border/60';
  }
};

const RankChangeBadge = ({ change }: { change: number }) => {
  if (change === 0) return null;
  if (change > 0) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-0.5 text-[10px] font-bold text-green-500 bg-green-500/15 px-1.5 py-0.5 rounded-full"
      >
        <TrendingUp className="w-2.5 h-2.5" />
        +{change}
      </motion.span>
    );
  }
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-0.5 text-[10px] font-bold text-red-400 bg-red-400/15 px-1.5 py-0.5 rounded-full"
    >
      <TrendingDown className="w-2.5 h-2.5" />
      {change}
    </motion.span>
  );
};

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  type: 'xp' | 'streak';
  isCurrentUser: boolean;
  index: number;
}

const LeaderboardRow = ({ entry, type, isCurrentUser, index }: LeaderboardRowProps) => {
  const rank = entry.rank || index + 1;

  const avatarSrc = entry.avatar_url
    || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(entry.display_name || 'student' + index)}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025 }}
      layout
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border transition-all duration-300',
        getRankBg(rank),
        isCurrentUser && 'ring-2 ring-teal-500 ring-offset-1 ring-offset-background'
      )}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {getRankIcon(rank)}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-background shadow-sm overflow-hidden bg-slate-100 dark:bg-slate-800">
          <AvatarImage src={avatarSrc} alt={entry.display_name || 'Student'} className="object-cover" />
          <AvatarFallback className="bg-teal-600 text-white font-bold text-xs">
            {entry.display_name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>
        {rank <= 3 && (
          <span className={cn(
            'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border border-background',
            rank === 1 ? 'bg-yellow-400 text-yellow-900' :
            rank === 2 ? 'bg-slate-400 text-slate-900' :
            'bg-amber-600 text-white'
          )}>{rank}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={cn('font-semibold text-sm truncate', isCurrentUser && 'text-teal-500')}>
            {entry.display_name || 'Anonymous'}
            {isCurrentUser && <span className="text-xs ml-1 font-normal text-muted-foreground">(You)</span>}
          </p>
          {(entry.rankChange ?? 0) !== 0 && <RankChangeBadge change={entry.rankChange ?? 0} />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          Level {entry.level}
          {entry.school && ` · ${entry.school}`}
        </p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1.5 font-bold shrink-0">
        {type === 'xp' ? (
          <>
            <Star className="w-4 h-4 text-primary" />
            <span className="text-sm">{entry.xp_points.toLocaleString()}</span>
          </>
        ) : (
          <>
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm">{entry.streak_days}d</span>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Top 3 Podium component
const Podium = ({ entries, type }: { entries: LeaderboardEntry[]; type: 'xp' | 'streak' }) => {
  const top3 = entries.slice(0, 3);
  if (top3.length < 1) return null;

  const [first, second, third] = top3;
  const order = [second, first, third].filter(Boolean);
  const heights = second ? ['h-20', 'h-28', 'h-16'] : ['', 'h-28', ''];
  const positions = second ? [1, 0, 2] : [1, 0, 2];

  return (
    <div className="flex items-end justify-center gap-3 mb-4 px-4">
      {order.map((entry, i) => {
        if (!entry) return null;
        const isFist = entry.id === first?.id;
        const avatarSrc = entry.avatar_url
          || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(entry.display_name || 'user')}`;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={cn('relative', isFist && 'mb-2')}>
              {isFist && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow" />
                </div>
              )}
              <Avatar className={cn(
                'border-2 overflow-hidden',
                isFist ? 'h-14 w-14 border-yellow-400' : 'h-10 w-10 border-slate-400/50'
              )}>
                <AvatarImage src={avatarSrc} className="object-cover" />
                <AvatarFallback className="bg-teal-600 text-white font-bold text-sm">
                  {entry.display_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs font-semibold text-center max-w-[60px] truncate">{entry.display_name || 'Anon'}</p>
            <div className={cn(
              'w-16 rounded-t-lg flex flex-col items-center justify-end pb-2 text-white text-xs font-bold',
              heights[i],
              isFist ? 'bg-gradient-to-b from-yellow-400 to-amber-500' :
              i === 0 ? 'bg-gradient-to-b from-slate-400 to-slate-500' :
              'bg-gradient-to-b from-amber-600 to-orange-700'
            )}>
              {entry.rank}
            </div>
          </motion.div>
        );
      })}
    </div>
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Leaderboard
          </div>
          <Badge variant="outline" className="text-xs gap-1 font-normal">
            <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
            Live
          </Badge>
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
            {xpLeaderboard.length >= 2 && (
              <Podium entries={xpLeaderboard} type="xp" />
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {xpLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No students yet. Be the first!
                  </p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {xpLeaderboard.map((entry, index) => (
                      <LeaderboardRow
                        key={entry.id}
                        entry={entry}
                        type="xp"
                        isCurrentUser={entry.id === currentUserId}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="streak" className="mt-0">
            {streakLeaderboard.length >= 2 && (
              <Podium entries={streakLeaderboard} type="streak" />
            )}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {streakLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No streaks yet. Start learning!
                  </p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {streakLeaderboard.map((entry, index) => (
                      <LeaderboardRow
                        key={entry.id}
                        entry={entry}
                        type="streak"
                        isCurrentUser={entry.id === currentUserId}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
