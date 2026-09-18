import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DailyGoals } from "@/components/learn/DailyGoals";
import { SubjectProgressMap } from "@/components/learn/SubjectProgressMap";
import { XpStreakDashboard } from "@/components/learn/XpStreakDashboard";
import { QuickPracticeHub } from "@/components/learn/QuickPracticeHub";
import { BadgeShowcase } from "@/components/badges/BadgeShowcase";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { useBadges } from "@/hooks/useBadges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { WeeklyReportExporter } from "@/components/report/WeeklyReportExporter";
import { ChallengeDialog } from "@/components/challenge/ChallengeDialog";
import { FriendRequestDialog } from "@/components/friends/FriendRequestDialog";
import { 
  Loader2, 
  LogOut, 
  Coins, 
  Flame, 
  Compass,
  BookOpen,
  Swords,
  PenTool
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subscription_tier: string;
  qualification?: string;
}

interface SubjectProgress {
  subject_id: string;
  questions_attempted: number;
  questions_correct: number;
  total_xp_earned: number;
}

interface DailyGoal {
  id: string;
  target_xp: number;
  earned_xp: number;
  target_questions: number;
  completed_questions: number;
  streak_maintained: boolean;
}

const Learn = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChallengeDialog, setShowChallengeDialog] = useState(false);
  const [showFriendsDialog, setShowFriendsDialog] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<string>("All");
  const { checkAndAwardBadges } = useBadges();

  const qualifications = ["All", ...Array.from(new Set(subjects.map(s => s.qualification).filter(Boolean)))];

  const filteredSubjects = selectedQualification === "All" 
    ? subjects
    : subjects.filter(s => s.qualification === selectedQualification);

  const formatQualification = (q: string) => {
    if (q === "All") return "All Qualifications";
    if (q === "o_level") return "O Level";
    if (q === "a_level") return "A Level";
    if (q === "igcse") return "IGCSE";
    return q;
  };

  // Check for new badges when data loads
  useEffect(() => {
    if (!loading && profile) {
      checkAndAwardBadges();
    }
  }, [loading, profile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (subjectsData) setSubjects(subjectsData);

      // Fetch subject progress
      const { data: progressData } = await supabase
        .from("subject_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressData) setSubjectProgress(progressData);

      // Fetch today's goals
      const today = new Date().toISOString().split("T")[0];
      const { data: goalData } = await supabase
        .from("daily_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("goal_date", today)
        .maybeSingle();

      if (goalData) {
        setDailyGoal(goalData);
      } else {
        // Create today's goal if it doesn't exist
        const { data: newGoal } = await supabase
          .from("daily_goals")
          .insert({
            user_id: user.id,
            goal_date: today,
            target_xp: 100,
            target_questions: 20,
          })
          .select()
          .single();

        if (newGoal) setDailyGoal(newGoal);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">LevelHubAI</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Beta</Badge>
          </Link>

          <div className="flex items-center gap-2">
            <WeeklyReportExporter profile={profile} />

            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
              onClick={() => setShowChallengeDialog(true)}
            >
              <Swords className="h-4 w-4" />
              Challenge
            </Button>

            <div className="hidden sm:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{profile?.coins || 0}</span>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-full">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{profile?.streak_days || 0}</span>
            </div>

            <NotificationBell />
            <LanguageToggle />
            <ThemeToggle />

            <Avatar className="h-9 w-9 border-2 border-primary">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>

            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Compass className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Learning Command Center</h1>
          </div>
          <p className="text-muted-foreground">
            Track your progress, complete daily goals, and practice your subjects.
          </p>
        </div>

        {/* Top Row: XP Dashboard + Daily Goals */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <XpStreakDashboard profile={profile} />
          <DailyGoals dailyGoal={dailyGoal} />
        </div>

        {/* Achievements + Leaderboard Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <BadgeShowcase />
          <Leaderboard limit={10} />
        </div>

        {/* Qualification Filter */}
        {qualifications.length > 1 && (
          <div className="flex justify-end mb-4">
            <Select value={selectedQualification} onValueChange={setSelectedQualification}>
              <SelectTrigger className="w-[200px] bg-card">
                <SelectValue placeholder="All Qualifications" />
              </SelectTrigger>
              <SelectContent>
                {qualifications.map(q => (
                  <SelectItem key={q} value={q}>{formatQualification(q as string)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject Progress Map */}
        <div className="mb-8">
          <SubjectProgressMap 
            subjects={filteredSubjects} 
            progress={subjectProgress}
          />
        </div>

        {/* AI Writing Tools */}
        <div className="mb-8">
          <Link to="/writing-checker" className="block group">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">AI Writing & Grammar Checker</h3>
                  <p className="text-muted-foreground text-sm">Practice your writing skills with voice typing, IGCSE/O Level evaluation, and AI feedback.</p>
                </div>
              </div>
              <Button variant="ghost" className="hidden sm:flex group-hover:bg-primary group-hover:text-primary-foreground">
                Start Writing
              </Button>
            </div>
          </Link>
        </div>

        {/* Quick Practice Hub */}
        <QuickPracticeHub subjects={filteredSubjects} />
      </main>

      <ChallengeDialog 
        open={showChallengeDialog} 
        onOpenChange={setShowChallengeDialog}
        subjects={subjects}
        onOpenFriends={() => setShowFriendsDialog(true)}
      />

      <FriendRequestDialog
        open={showFriendsDialog}
        onOpenChange={setShowFriendsDialog}
      />
    </div>
  );
};

export default Learn;
