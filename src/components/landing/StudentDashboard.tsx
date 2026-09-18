import { Progress } from "@/components/ui/progress";
import {
  Flame,
  Trophy,
  Zap,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  Award,
  Sparkles,
} from "lucide-react";

const subjects = [
  { name: "Mathematics", progress: 75, color: "from-blue-500 to-cyan-500", icon: "📐", xp: 2450 },
  { name: "Physics", progress: 60, color: "from-amber-500 to-orange-500", icon: "⚡", xp: 1820 },
  { name: "Chemistry", progress: 45, color: "from-green-500 to-emerald-500", icon: "🧪", xp: 1350 },
  { name: "English", progress: 85, color: "from-purple-500 to-violet-500", icon: "📝", xp: 2980 },
];

const achievements = [
  { name: "First Steps", icon: "🎯", unlocked: true },
  { name: "Math Wizard", icon: "🧙", unlocked: true },
  { name: "Speed Demon", icon: "⚡", unlocked: true },
  { name: "Perfect Score", icon: "💯", unlocked: true },
  { name: "Study Streak", icon: "🔥", unlocked: false },
  { name: "Top 10", icon: "🏆", unlocked: false },
];

const leaderboard = [
  { rank: 1, name: "Fatima K.", xp: 15420, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima" },
  { rank: 2, name: "Ahmed H.", xp: 14890, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed" },
  { rank: 3, name: "Zain M.", xp: 13650, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zain" },
  { rank: 4, name: "You", xp: 12450, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You", isUser: true },
  { rank: 5, name: "Sara A.", xp: 11200, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sara" },
];

export const StudentDashboard = () => {
  
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-level/10 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-level" />
            <span className="text-sm font-medium text-foreground">Student Dashboard Preview</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Your Learning{" "}
            <span className="text-gradient-primary">Command Center</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your progress, earn rewards, and compete with friends - all in one place.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-background rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Dashboard Header */}
          <div className="bg-gradient-hero p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Student"
                    alt="Student"
                    className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-accent rounded-lg flex items-center justify-center text-xs font-bold text-accent-foreground">
                    12
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Welcome back, Ahmed!</h3>
                  <p className="text-white/70">Level 12 • O-Level Student</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 flex-wrap">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Total XP</p>
                    <p className="text-white font-display font-bold">12,450</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-streak rounded-xl flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Day Streak</p>
                    <p className="text-white font-display font-bold">15 Days</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-level rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/70 text-xs">Global Rank</p>
                    <p className="text-white font-display font-bold">#247</p>
                  </div>
                </div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/70 text-sm">Progress to Level 13</span>
                <span className="text-white text-sm font-medium">2,450 / 3,000 XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-accent rounded-full transition-all duration-500" style={{ width: "82%" }} />
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6 md:p-8">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Subjects */}
              <div className="lg:col-span-2 space-y-6">
                {/* Daily Challenge */}
                <div className="bg-gradient-to-r from-primary/10 to-level/10 rounded-2xl p-6 border border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-foreground">Daily Challenge</h4>
                        <p className="text-sm text-muted-foreground">Complete 3 quizzes today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Reward</p>
                      <p className="font-display font-bold text-xp">+150 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={66} className="h-3" />
                    </div>
                    <span className="text-sm font-medium text-foreground">2/3</span>
                  </div>
                </div>

                {/* Subject Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display text-lg font-semibold">Continue Learning</h4>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {subjects.map((subject, i) => (
                      <div
                        key={i}
                        className="bg-card rounded-2xl p-5 border border-border/50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{subject.icon}</span>
                            <div>
                              <h5 className="font-display font-semibold text-foreground">{subject.name}</h5>
                              <p className="text-xs text-muted-foreground">{subject.xp} XP earned</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <span className="text-sm font-medium text-foreground">{subject.progress}%</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${subject.color} rounded-full transition-all duration-500`}
                              style={{ width: `${subject.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Questions Solved", value: "1,247", icon: BookOpen, color: "bg-primary" },
                    { label: "Hours Studied", value: "48.5", icon: Clock, color: "bg-level" },
                    { label: "Accuracy Rate", value: "87%", icon: TrendingUp, color: "bg-success" },
                    { label: "Friends Challenged", value: "23", icon: Users, color: "bg-streak" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border border-border/50 text-center">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl mx-auto mb-3 flex items-center justify-center`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Leaderboard & Badges */}
              <div className="space-y-6">
                {/* Leaderboard */}
                <div className="bg-card rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-xp" />
                      Leaderboard
                    </h4>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">This Week</span>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.map((user, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          user.isUser ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary"
                        }`}
                      >
                        <span className={`w-6 text-center font-display font-bold ${
                          user.rank === 1 ? "text-xp" : user.rank === 2 ? "text-muted-foreground" : user.rank === 3 ? "text-streak" : "text-muted-foreground"
                        }`}>
                          {user.rank}
                        </span>
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full bg-secondary" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${user.isUser ? "text-primary" : "text-foreground"}`}>
                            {user.name}
                          </p>
                        </div>
                        <span className="text-sm font-display font-semibold text-xp">{user.xp.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-card rounded-2xl p-5 border border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-level" />
                      Achievements
                    </h4>
                    <span className="text-xs text-muted-foreground">4/6 unlocked</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {achievements.map((badge, i) => (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-center p-2 transition-all ${
                          badge.unlocked
                            ? "bg-gradient-to-br from-xp/20 to-accent/20 border border-xp/30"
                            : "bg-secondary opacity-50 grayscale"
                        }`}
                      >
                        <span className="text-2xl mb-1">{badge.icon}</span>
                        <span className="text-[10px] font-medium text-foreground leading-tight">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-2xl p-5 border border-border/50">
                  <h4 className="font-display font-semibold mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Start Quick Quiz</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Practice Past Papers</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Challenge a Friend</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
