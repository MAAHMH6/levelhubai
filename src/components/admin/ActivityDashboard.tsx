import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentDetailPanel from "./StudentDetailPanel";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Activity, Users, BookOpen, Video, Brain, FileQuestion,
  TrendingUp, Clock, Star, Flame, Eye
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

interface ActivityEvent {
  type: string;
  user_name: string;
  user_avatar: string | null;
  user_id: string;
  detail: string;
  timestamp: string;
  xp: number;
}

interface DailyStat {
  date: string;
  signups: number;
  quiz_attempts: number;
  videos_watched: number;
  lessons_accessed: number;
}

const ActivityDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
    totalQuizAttempts: 0,
    totalVideosWatched: 0,
    totalLessonsAccessed: 0,
    totalPaperAttempts: 0,
    totalXpEarned: 0,
    avgLevel: 0,
    premiumUsers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const days = timeRange === "1d" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    return { from, days };
  };

  const fetchAllData = async () => {
    setLoading(true);
    const { from } = getDateRange();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel fetches
    const [
      profilesRes,
      quizAttemptsRes,
      lessonProgressRes,
      paperAttemptsRes,
      recentQuizRes,
      recentVideoRes,
      recentSignupsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_url, xp_points, level, streak_days, subscription_plan, created_at, updated_at"),
      supabase.from("quiz_attempts").select("id, user_id, is_correct, xp_earned, created_at").gte("created_at", from).order("created_at", { ascending: false }),
      supabase.from("lesson_progress").select("id, user_id, video_completed, video_completed_at, quiz_status, quiz_completed_at, last_accessed_at, lesson_id, quiz_xp_earned, practice_xp_earned").gte("last_accessed_at", from).order("last_accessed_at", { ascending: false }),
      supabase.from("past_paper_attempts").select("id, user_id, score, percentage, xp_earned, created_at").gte("created_at", from).order("created_at", { ascending: false }),
      supabase.from("quiz_attempts").select("id, user_id, is_correct, xp_earned, created_at").order("created_at", { ascending: false }).limit(50),
      supabase.from("lesson_progress").select("id, user_id, video_completed, video_completed_at, lesson_id").eq("video_completed", true).order("video_completed_at", { ascending: false }).limit(50),
      supabase.from("profiles").select("id, display_name, avatar_url, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    const profiles = profilesRes.data || [];
    const quizAttempts = quizAttemptsRes.data || [];
    const lessonProgress = lessonProgressRes.data || [];
    const paperAttempts = paperAttemptsRes.data || [];

    // Build profile map
    const profileMap: Record<string, { name: string; avatar: string | null }> = {};
    profiles.forEach(p => {
      profileMap[p.id] = { name: p.display_name || "Unknown", avatar: p.avatar_url };
    });

    // Stats
    const activeTodaySet = new Set<string>();
    const activeWeekSet = new Set<string>();

    profiles.forEach(p => {
      const updated = new Date(p.updated_at);
      if (updated >= today) activeTodaySet.add(p.id);
      if (updated >= new Date(weekAgo)) activeWeekSet.add(p.id);
    });

    // Also count quiz/video activity
    quizAttempts.forEach(q => {
      const d = new Date(q.created_at);
      if (d >= today) activeTodaySet.add(q.user_id);
      if (d >= new Date(weekAgo)) activeWeekSet.add(q.user_id);
    });

    const totalXp = profiles.reduce((s, p) => s + p.xp_points, 0);
    const avgLevel = profiles.length ? Math.round(profiles.reduce((s, p) => s + p.level, 0) / profiles.length * 10) / 10 : 0;

    setStats({
      totalUsers: profiles.length,
      activeToday: activeTodaySet.size,
      activeThisWeek: activeWeekSet.size,
      totalQuizAttempts: quizAttempts.length,
      totalVideosWatched: lessonProgress.filter(l => l.video_completed).length,
      totalLessonsAccessed: lessonProgress.length,
      totalPaperAttempts: paperAttempts.length,
      totalXpEarned: totalXp,
      avgLevel,
      premiumUsers: profiles.filter(p => p.subscription_plan && p.subscription_plan !== "free").length,
    });

    // Top students by XP
    const sorted = [...profiles].sort((a, b) => b.xp_points - a.xp_points).slice(0, 10);
    setTopStudents(sorted);

    // Recent activity feed
    const events: ActivityEvent[] = [];

    (recentQuizRes.data || []).slice(0, 20).forEach(q => {
      const p = profileMap[q.user_id];
      events.push({
        type: "quiz",
        user_name: p?.name || "Unknown",
        user_avatar: p?.avatar || null,
        user_id: q.user_id,
        detail: q.is_correct ? "Answered correctly" : "Attempted a question",
        timestamp: q.created_at,
        xp: q.xp_earned,
      });
    });

    (recentVideoRes.data || []).slice(0, 20).forEach(v => {
      const p = profileMap[v.user_id];
      events.push({
        type: "video",
        user_name: p?.name || "Unknown",
        user_avatar: p?.avatar || null,
        user_id: v.user_id,
        detail: "Watched a video lesson",
        timestamp: v.video_completed_at || "",
        xp: 0,
      });
    });

    (recentSignupsRes.data || []).forEach(s => {
      events.push({
        type: "signup",
        user_name: s.display_name || "New User",
        user_avatar: s.avatar_url,
        user_id: s.id,
        detail: "Joined the platform",
        timestamp: s.created_at,
        xp: 0,
      });
    });

    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(events.slice(0, 50));

    setLoading(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "quiz": return <Brain className="h-4 w-4 text-primary" />;
      case "video": return <Video className="h-4 w-4 text-green-500" />;
      case "signup": return <Users className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const timeAgo = (ts: string) => {
    if (!ts) return "";
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  if (selectedStudentId) {
    return (
      <Card>
        <CardContent className="pt-6">
          <StudentDetailPanel studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Student Activity Dashboard
        </CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500" },
                { label: "Active Today", value: stats.activeToday, icon: Eye, color: "text-green-500" },
                { label: "Active This Week", value: stats.activeThisWeek, icon: TrendingUp, color: "text-primary" },
                { label: "Quiz Attempts", value: stats.totalQuizAttempts, icon: Brain, color: "text-purple-500" },
                { label: "Videos Watched", value: stats.totalVideosWatched, icon: Video, color: "text-red-500" },
                { label: "Lessons Accessed", value: stats.totalLessonsAccessed, icon: BookOpen, color: "text-orange-500" },
                { label: "Paper Attempts", value: stats.totalPaperAttempts, icon: FileQuestion, color: "text-teal-500" },
                { label: "Total XP Earned", value: stats.totalXpEarned.toLocaleString(), icon: Star, color: "text-yellow-500" },
                { label: "Avg Level", value: stats.avgLevel, icon: Flame, color: "text-orange-500" },
                { label: "Premium Users", value: stats.premiumUsers, icon: Clock, color: "text-primary" },
              ].map((stat) => (
                <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity Feed */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Live Activity Feed
                </h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((event, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudentId(event.user_id)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={event.user_avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {event.user_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium truncate">{event.user_name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{event.detail}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {event.xp > 0 && (
                            <Badge variant="secondary" className="text-xs mb-0.5">+{event.xp} XP</Badge>
                          )}
                          <p className="text-xs text-muted-foreground">{timeAgo(event.timestamp)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Students */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Top Students by XP
                </h3>
                <div className="space-y-2">
                  {topStudents.map((student, i) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <span className="text-sm font-bold w-6 text-center text-muted-foreground">#{i + 1}</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {(student.display_name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.display_name || "Unknown"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Lv.{student.level}</span>
                          <span>🔥 {student.streak_days}d streak</span>
                          <Badge variant={student.subscription_plan === "free" || !student.subscription_plan ? "secondary" : "default"} className="text-xs">
                            {student.subscription_plan || "free"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <Star className="h-3.5 w-3.5" />
                        {student.xp_points.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityDashboard;
