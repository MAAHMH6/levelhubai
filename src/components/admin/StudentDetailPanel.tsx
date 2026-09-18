import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, Star, Flame, BookOpen, Brain, Video,
  Trophy, Clock, Target, TrendingUp, FileQuestion
} from "lucide-react";

interface StudentDetailPanelProps {
  studentId: string;
  onBack: () => void;
}

interface SubjectDetail {
  subject_id: string;
  subject_name: string;
  subject_icon: string | null;
  questions_attempted: number;
  questions_correct: number;
  total_xp: number;
  accuracy: number;
}

const StudentDetailPanel = ({ studentId, onBack }: StudentDetailPanelProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [subjectProgress, setSubjectProgress] = useState<SubjectDetail[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [lessonStats, setLessonStats] = useState({ videosWatched: 0, lessonsCompleted: 0, totalTimeMinutes: 0 });
  const [badgeCount, setBadgeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setLoading(true);

    const [profileRes, subjectProgressRes, subjectsRes, quizRes, lessonRes, badgesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", studentId).single(),
      supabase.from("subject_progress").select("*").eq("user_id", studentId),
      supabase.from("subjects").select("id, name, icon"),
      supabase.from("quiz_attempts").select("id, is_correct, xp_earned, created_at").eq("user_id", studentId).order("created_at", { ascending: false }).limit(50),
      supabase.from("lesson_progress").select("video_completed, lesson_completed, total_time_spent_seconds").eq("user_id", studentId),
      supabase.from("user_badges").select("id").eq("user_id", studentId),
    ]);

    setProfile(profileRes.data);
    setBadgeCount(badgesRes.data?.length || 0);

    // Subject progress
    const subjectsMap: Record<string, { name: string; icon: string | null }> = {};
    (subjectsRes.data || []).forEach(s => { subjectsMap[s.id] = { name: s.name, icon: s.icon }; });

    const details: SubjectDetail[] = (subjectProgressRes.data || []).map(sp => {
      const sub = subjectsMap[sp.subject_id];
      const accuracy = sp.questions_attempted > 0 ? Math.round((sp.questions_correct / sp.questions_attempted) * 100) : 0;
      return {
        subject_id: sp.subject_id,
        subject_name: sub?.name || "Unknown",
        subject_icon: sub?.icon || null,
        questions_attempted: sp.questions_attempted,
        questions_correct: sp.questions_correct,
        total_xp: sp.total_xp_earned,
        accuracy,
      };
    });
    setSubjectProgress(details.sort((a, b) => b.total_xp - a.total_xp));

    // Quiz stats
    setRecentQuizzes(quizRes.data || []);

    // Lesson stats
    const lessons = lessonRes.data || [];
    setLessonStats({
      videosWatched: lessons.filter(l => l.video_completed).length,
      lessonsCompleted: lessons.filter(l => l.lesson_completed).length,
      totalTimeMinutes: Math.round(lessons.reduce((s, l) => s + l.total_time_spent_seconds, 0) / 60),
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) return <p className="text-sm text-muted-foreground">Student not found.</p>;

  const quizCorrect = recentQuizzes.filter(q => q.is_correct).length;
  const quizAccuracy = recentQuizzes.length > 0 ? Math.round((quizCorrect / recentQuizzes.length) * 100) : 0;
  const totalQuizXp = recentQuizzes.reduce((s, q) => s + q.xp_earned, 0);

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {(profile.display_name || "?").charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-lg font-bold">{profile.display_name || "Unknown"}</h2>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {profile.xp_points.toLocaleString()} XP</span>
            <span>Lv.{profile.level}</span>
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5" /> {profile.streak_days}d streak</span>
            <Badge variant={profile.subscription_plan === "free" || !profile.subscription_plan ? "secondary" : "default"}>
              {profile.subscription_plan || "free"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Total XP", value: profile.xp_points.toLocaleString(), icon: Star, color: "text-yellow-500" },
          { label: "Level", value: profile.level, icon: TrendingUp, color: "text-primary" },
          { label: "Streak", value: `${profile.streak_days}d`, icon: Flame, color: "text-orange-500" },
          { label: "Videos Watched", value: lessonStats.videosWatched, icon: Video, color: "text-red-500" },
          { label: "Lessons Done", value: lessonStats.lessonsCompleted, icon: BookOpen, color: "text-green-500" },
          { label: "Badges Earned", value: badgeCount, icon: Trophy, color: "text-purple-500" },
          { label: "Quiz Accuracy", value: `${quizAccuracy}%`, icon: Target, color: "text-blue-500" },
          { label: "Recent Quizzes", value: recentQuizzes.length, icon: Brain, color: "text-primary" },
          { label: "Quiz XP", value: totalQuizXp, icon: Star, color: "text-yellow-500" },
          { label: "Study Time", value: `${lessonStats.totalTimeMinutes}m`, icon: Clock, color: "text-teal-500" },
          { label: "Coins", value: profile.coins, icon: Star, color: "text-amber-500" },
          { label: "School", value: profile.school || "—", icon: FileQuestion, color: "text-muted-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/50 rounded-lg p-3 text-center">
            <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold truncate">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Subject Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjectProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No subject activity yet.</p>
          ) : (
            <div className="space-y-4">
              {subjectProgress.map((sp) => (
                <div key={sp.subject_id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sp.subject_icon || "📘"}</span>
                      <span className="font-medium text-sm">{sp.subject_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{sp.questions_attempted} attempted</span>
                      <span>{sp.accuracy}% accuracy</span>
                      <Badge variant="secondary" className="text-xs">{sp.total_xp} XP</Badge>
                    </div>
                  </div>
                  <Progress value={sp.accuracy} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Quiz Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" /> Recent Quiz Activity (Last 50)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No quiz attempts yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {recentQuizzes.map((q, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-medium ${
                    q.is_correct
                      ? "bg-green-500/20 text-green-700 dark:text-green-400"
                      : "bg-red-500/20 text-red-700 dark:text-red-400"
                  }`}
                  title={`${q.is_correct ? "✓" : "✗"} | +${q.xp_earned} XP | ${new Date(q.created_at).toLocaleDateString()}`}
                >
                  {q.is_correct ? "✓" : "✗"}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Account Info</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1 text-muted-foreground">
          <p>Joined: {new Date(profile.created_at).toLocaleDateString()}</p>
          <p>Last active: {new Date(profile.updated_at).toLocaleDateString()}</p>
          <p>Grade: {profile.grade_level || "Not set"}</p>
          <p>School: {profile.school || "Not set"}</p>
          <p>Plan: {profile.subscription_plan || "free"}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailPanel;
