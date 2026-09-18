import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  CheckCircle,
  Circle,
  BookOpen,
  HelpCircle,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DailyGoal {
  id: string;
  target_xp: number;
  earned_xp: number;
  target_questions: number;
  completed_questions: number;
  streak_maintained: boolean;
}

interface DailyGoalsProps {
  dailyGoal: DailyGoal | null;
}

export const DailyGoals = ({ dailyGoal }: DailyGoalsProps) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];

  // Count quizzes completed today
  const { data: quizzesToday = 0 } = useQuery({
    queryKey: ['quizzes-today', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return 0;
      const startOfDay = `${today}T00:00:00.000Z`;
      const endOfDay = `${today}T23:59:59.999Z`;
      
      // Count distinct quiz sessions (group by approximate time)
      const { data } = await supabase
        .from('quiz_attempts')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);
      
      if (!data || data.length === 0) return 0;
      // A "quiz" = at least 1 attempt exists today means at least 1 quiz done
      // Simple: count unique 5-minute windows as separate quizzes
      const windows = new Set<string>();
      data.forEach(a => {
        const t = new Date(a.created_at);
        const key = `${t.getHours()}-${Math.floor(t.getMinutes() / 5)}`;
        windows.add(key);
      });
      return windows.size;
    },
    enabled: !!user?.id,
  });

  // Count videos watched today
  const { data: videosToday = 0 } = useQuery({
    queryKey: ['videos-today', user?.id, today],
    queryFn: async () => {
      if (!user?.id) return 0;
      const startOfDay = `${today}T00:00:00.000Z`;
      const { count } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('video_completed', true)
        .gte('video_completed_at', startOfDay);
      return count || 0;
    },
    enabled: !!user?.id,
  });

  const questionsToday = dailyGoal?.completed_questions || 0;

  const missions = [
    {
      icon: BookOpen,
      title: "Complete 1 Quiz",
      current: Math.min(quizzesToday, 1),
      target: 1,
      progress: quizzesToday >= 1 ? 100 : 0,
      xp: 20,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      icon: HelpCircle,
      title: "Solve 5 Questions",
      current: Math.min(questionsToday, 5),
      target: 5,
      progress: Math.min((questionsToday / 5) * 100, 100),
      xp: 15,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
    {
      icon: PlayCircle,
      title: "Watch 1 Video Lesson",
      current: Math.min(videosToday, 1),
      target: 1,
      progress: videosToday >= 1 ? 100 : 0,
      xp: 15,
      color: "text-primary",
      bgColor: "bg-primary/20",
    },
  ];

  const completedCount = missions.filter(m => m.progress >= 100).length;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Daily Missions
          </CardTitle>
          <Badge variant="secondary" className="gap-1">
            {completedCount}/{missions.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-xl border transition-all",
              mission.progress >= 100 
                ? "bg-success/10 border-success/30" 
                : "bg-card border-border/50"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                mission.progress >= 100 ? "bg-success/20" : mission.bgColor
              )}>
                <mission.icon className={cn(
                  "h-5 w-5",
                  mission.progress >= 100 ? "text-success" : mission.color
                )} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{mission.title}</span>
                  {mission.progress >= 100 ? (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">+{mission.xp} XP</Badge>
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-xs">+{mission.xp} XP</Badge>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {mission.current} / {mission.target}
                </span>
              </div>
            </div>
            <Progress 
              value={mission.progress} 
              className={cn(
                "h-2",
                mission.progress >= 100 && "[&>div]:bg-success"
              )}
            />
          </motion.div>
        ))}

        {completedCount === missions.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center"
          >
            <p className="font-semibold">🎉 All Missions Complete!</p>
            <p className="text-sm opacity-80">+50 Bonus XP Earned</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
