import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Flame, 
  Coins, 
  Trophy,
  TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  grade_level: string | null;
  xp_points: number;
  level: number;
  streak_days: number;
  coins: number;
}

interface XpStreakDashboardProps {
  profile: Profile | null;
}

export const XpStreakDashboard = ({ profile }: XpStreakDashboardProps) => {
  const currentXp = profile?.xp_points || 0;
  // Calculate dynamic level if database level is lagging
  const effectiveLevel = Math.max(profile?.level || 1, Math.floor(currentXp / 1000) + 1);
  const currentLevelFloor = (effectiveLevel - 1) * 1000;
  const nextLevelCeil = effectiveLevel * 1000;
  const xpInLevel = Math.max(0, currentXp - currentLevelFloor);
  const xpNeeded = Math.max(0, nextLevelCeil - currentXp);
  const xpProgressPercent = Math.min(100, Math.max(0, (xpInLevel / 1000) * 100));

  const stats = [
    {
      icon: Star,
      label: "Level",
      value: profile?.level || 1,
      color: "text-level",
      bgColor: "bg-level/20",
    },
    {
      icon: Flame,
      label: "Streak",
      value: `${profile?.streak_days || 0} days`,
      color: "text-streak",
      bgColor: "bg-streak/20",
    },
    {
      icon: Coins,
      label: "Coins",
      value: profile?.coins || 0,
      color: "text-xp",
      bgColor: "bg-xp/20",
    },
    {
      icon: Trophy,
      label: "Total XP",
      value: profile?.xp_points || 0,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
  ];

  // Calculate streak days display (last 7 days)
  const streakDays = profile?.streak_days || 0;
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Convert Sunday=0 to Sunday=6

  return (
    <Card className="border-2 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Progress
          </CardTitle>
          <Badge className="bg-teal-600 text-white font-bold px-3 py-1">
            Level {effectiveLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* XP Progress to Next Level */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-primary/10 border border-teal-500/20 dark:border-teal-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-teal-600 fill-teal-600/20" />
              <span className="font-bold text-slate-800 dark:text-slate-200">XP to Level {effectiveLevel + 1}</span>
            </div>
            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">
              {xpNeeded} XP needed
            </span>
          </div>
          <Progress value={xpProgressPercent} className="h-3 mb-2 bg-slate-200 dark:bg-slate-700" />
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Level {effectiveLevel}</span>
            <span>{currentXp} / {nextLevelCeil} XP</span>
            <span>Level {effectiveLevel + 1}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  stat.bgColor
                )}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Streak Calendar */}
        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-streak" />
            <span className="font-semibold">Weekly Streak</span>
          </div>
          <div className="flex justify-between">
            {weekDays.map((day, index) => {
              const isActive = index <= adjustedToday && index >= adjustedToday - Math.min(streakDays - 1, adjustedToday);
              const isToday = index === adjustedToday;
              
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center font-semibold transition-all",
                    isActive 
                      ? "bg-gradient-to-br from-streak to-orange-400 text-white" 
                      : "bg-secondary text-muted-foreground",
                    isToday && "ring-2 ring-streak ring-offset-2 ring-offset-background"
                  )}>
                    {isActive && <Flame className="h-4 w-4" />}
                  </div>
                  <span className={cn(
                    "text-xs",
                    isToday ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}>
                    {day}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
