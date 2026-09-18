import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Star, 
  Target, 
  BookOpen, 
  FileText, 
  Zap, 
  Bot, 
  Clock, 
  CheckCircle2, 
  Play,
  BrainCircuit,
  PenTool,
  ChevronRight,
  Trophy,
  Crown,
  Medal,
  Award,
  Layers,
  Coins,
  Compass,
  GraduationCap,
  Gift,
  Copy,
  Check
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { featureStorage, StudyPlanItem } from '@/integrations/supabase/featureClient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { BadgeShowcase } from '@/components/badges/BadgeShowcase';
import { SubjectProgressMap } from '@/components/learn/SubjectProgressMap';
import { QuickPracticeHub } from '@/components/learn/QuickPracticeHub';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ComebackPopup } from '@/components/comeback/ComebackPopup';
import { IntroVideoPopup } from '@/components/onboarding/IntroVideoPopup';
import { ProfileCompletionPopup, isProfileAlreadyComplete } from '@/components/onboarding/ProfileCompletionPopup';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, programmeLabel, subjects, coreSubjects } = useStudentProgramme();
  const [todayTasks, setTodayTasks] = useState<StudyPlanItem[]>([]);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [quizStats, setQuizStats] = useState({ totalQuizzes: 0, avgAccuracy: 0 });
  const [mockStats, setMockStats] = useState({ totalMocks: 0 });
  const [lessonsCompletedCount, setLessonsCompletedCount] = useState(0);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  // Show profile completion popup on first dashboard visit
  useEffect(() => {
    if (user?.id && !isProfileAlreadyComplete(user.id)) {
      // Delay slightly so dashboard loads first
      const timer = setTimeout(() => setShowProfileCompletion(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Load real student academic stats
  useEffect(() => {
    const userId = user?.id || profile.id;
    if (!userId || userId === 'guest_student') return;

    const loadRealHomeStats = async () => {
      try {
        const [quizAttemptsRes, quizSessionsRes, mocksRes, lessonsRes] = await Promise.all([
          supabase.from('quiz_attempts').select('percentage').eq('user_id', userId),
          supabase.from('quiz_sessions').select('percentage').eq('user_id', userId).eq('status', 'completed'),
          supabase.from('mock_exam_attempts').select('id').eq('user_id', userId),
          supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId).eq('video_completed', true),
        ]);

        const allQuizzes = [
          ...(quizAttemptsRes.data || []),
          ...(quizSessionsRes.data || []),
        ];

        const totalQuizzes = allQuizzes.length;
        const avgAccuracy = totalQuizzes > 0 
          ? Math.round(allQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / totalQuizzes) 
          : 0;

        setQuizStats({ totalQuizzes, avgAccuracy });
        setMockStats({ totalMocks: mocksRes.data?.length || 0 });
        setLessonsCompletedCount(lessonsRes.data?.length || 0);
      } catch (err) {
        console.error('Error fetching home stats:', err);
      }
    };

    loadRealHomeStats();
  }, [user?.id, profile.id]);

  const totalSyllabusLessons = subjects.reduce((sum, s) => sum + (s.totalTopics || 0), 0);
  const syllabusCoveragePercent = totalSyllabusLessons > 0 
    ? Math.min(100, Math.round((lessonsCompletedCount / totalSyllabusLessons) * 100)) 
    : 0;

  // Load today's mission tasks from feature storage (strictly real user plans)
  useEffect(() => {
    const loadTasks = async () => {
      const plans = await featureStorage.getStudyPlans(profile.id, profile.programme);
      setTodayTasks(plans.slice(0, 3));
    };
    loadTasks();
  }, [profile.id, profile.programme]);

  const handleToggleTask = async (taskId: string) => {
    await featureStorage.toggleStudyPlanComplete(taskId);
    setTodayTasks(prev => 
      prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    );
    toast.success('Task progress updated!');
  };

  const resumeSubject = coreSubjects[0] || subjects[0];

  // XP progress calculation
  const getXpForNextLevel = (lvl: number) => lvl * 1000;
  const currentLvlXpFloor = (profile.level - 1) * 1000;
  const nextLvlXpCeil = getXpForNextLevel(profile.level);
  const xpInCurrentLevel = Math.max(0, profile.xpPoints - currentLvlXpFloor);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / (nextLvlXpCeil - currentLvlXpFloor)) * 100));

  // Weekly streak calendar
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  // Referral code
  const referralCode = `LH-${profile.id?.slice(0, 6)?.toUpperCase() || 'STUDENT'}`;
  const referralUrl = `https://olevel.com.pk/auth?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedReferral(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Popups */}
      <ComebackPopup />
      <IntroVideoPopup />
      {showProfileCompletion && user?.id && (
        <ProfileCompletionPopup
          userId={user.id}
          onComplete={() => setShowProfileCompletion(false)}
        />
      )}

      {/* 1. HERO BANNER WITH CLONED LOGO & WELCOME */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-teal-900/50">
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="LevelHubAI Logo" className="h-10 w-auto object-contain brightness-110" />
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-teal-200">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                {programmeLabel} • {profile.examSession} {profile.examYear}
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {profile.displayName} 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Target Cambridge Grade: <span className="text-teal-300 font-extrabold">{profile.targetGrade}</span>. Access your diagnostic assessment, smart quizzes, mock exams, and AI tutor right away.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button 
                onClick={() => navigate('/subjects-hub')}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl px-5 h-11 shadow-lg shadow-teal-500/25 transition-all"
              >
                <span>Go to Subjects</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/planner')}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl h-11"
              >
                <Sparkles className="w-4 h-4 mr-2 text-teal-300" />
                Plan with AI
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/challenges')}
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl h-11"
              >
                <Trophy className="w-4 h-4 mr-2 text-amber-300" />
                1v1 Quiz Battle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 1b. REAL ACADEMIC STATS BAR — after hero banner */}
      {(quizStats.totalQuizzes > 0 || lessonsCompletedCount > 0 || mockStats.totalMocks > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{quizStats.totalQuizzes}</div>
              <div className="text-[11px] text-slate-500 font-medium">Quizzes Done</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{quizStats.avgAccuracy}%</div>
              <div className="text-[11px] text-slate-500 font-medium">Quiz Accuracy</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{lessonsCompletedCount}</div>
              <div className="text-[11px] text-slate-500 font-medium">Lessons Done</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{mockStats.totalMocks}</div>
              <div className="text-[11px] text-slate-500 font-medium">Mock Exams</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. THE 5 CORE LEARNING TOOLS OF LEVELHUBAI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Core Learning Tools
          </h2>
          <span className="text-xs text-slate-400">Launch any tool instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Tool 1: AI Assessment */}
          <button
            onClick={() => navigate('/performance')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">AI Assessment</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Diagnostic test & syllabus mastery</p>
            </div>
          </button>

          {/* USP 2: Smart Quizzes */}
          <button
            onClick={() => navigate('/quiz?type=quick')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Smart Quizzes</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Timed, topical & quick quizzes</p>
            </div>
          </button>

          {/* USP 3: AI Mock Exam */}
          <button
            onClick={() => navigate('/mock-exams')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">AI Mock Exam</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Real Cambridge exam condition</p>
            </div>
          </button>

          {/* USP 4: Writing & Grammar Checker */}
          <button
            onClick={() => navigate('/writing-checker')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Writing Checker</div>
              <p className="text-[11px] text-slate-400 mt-0.5">AI grammar & essay examiner</p>
            </div>
          </button>

          {/* USP 5: AI Tutor */}
          <button
            onClick={() => navigate('/ai-tutor')}
            className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-500 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Cambridge AI Tutor</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Step-by-step syllabus tutor</p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. YOUR PROGRESS CARD & DAILY MISSIONS (SIDE BY SIDE IN 2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Col 1: Your Progress */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 font-black text-sm border border-teal-200/50">
                  {profile.level}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Level {profile.level} Cambridge Scholar
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {profile.xpPoints.toLocaleString()} Total XP Points
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60">
                {Math.max(0, nextLvlXpCeil - profile.xpPoints)} XP to Lvl {profile.level + 1}
              </Badge>
            </div>

            <Progress value={xpPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800" />

            {/* Streak & Coins */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/60">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-600 shrink-0">
                  <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">{profile.streakDays} Days</div>
                  <div className="text-[10px] text-orange-700 dark:text-orange-300 font-semibold">Active Streak</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 shrink-0">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">{profile.coins} Coins</div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">Study Rewards</div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Weekly Streak Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Streak</span>
            </div>
            <div className="flex items-center gap-2">
              {weekDays.map((day, idx) => {
                const isToday = idx === todayDayIndex;
                const isPassed = idx <= todayDayIndex && profile.streakDays > (todayDayIndex - idx);
                return (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${
                      isToday
                        ? 'border-2 border-orange-500 bg-orange-500/10 text-orange-600'
                        : isPassed
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {isPassed ? <Flame className="w-3 h-3 fill-white" /> : day}
                    </div>
                    <span className={`text-[9px] ${isToday ? 'font-bold text-orange-600' : 'text-slate-400'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Col 2: Daily Missions */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Missions</h2>
                <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 text-[10px] font-bold">
                  {todayTasks.filter(t => t.completed).length}/{todayTasks.length} Complete
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/planner')}
                className="text-xs rounded-xl h-8 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Planner
              </Button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Complete daily tasks to maintain your streak and earn bonus XP
            </p>

            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 ${
                    task.completed 
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400' 
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        task.completed 
                          ? 'bg-teal-500 border-teal-500 text-white' 
                          : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                      }`}
                    >
                      {task.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          {task.subject_name}
                        </Badge>
                        <span className="text-xs text-teal-600 font-bold">
                          +20 XP
                        </span>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.topic_title}
                      </div>
                    </div>
                  </div>

                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => navigate(`/subjects-hub/${task.subject_id}`)}
                    className="rounded-xl text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold text-xs ml-2 shrink-0"
                  >
                    Start
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 4. ACHIEVEMENTS & LEADERBOARD (SIDE BY SIDE & HORIZONTALLY ALIGNED AS IN IMAGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left: Achievements */}
        <div className="h-full flex flex-col">
          <BadgeShowcase />
        </div>

        {/* Right: Leaderboard with Visible Pictures */}
        <div className="h-full flex flex-col">
          <Leaderboard limit={5} />
        </div>
      </div>

      {/* 5. REFERRAL SYSTEM BANNER (PROMINENT ON DASHBOARD) */}
      <Card className="overflow-hidden rounded-3xl border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/70 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300/40">
              <Gift className="w-3.5 h-3.5 text-teal-600" />
              <span>Free Cambridge Pro Rewards</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Refer a Friend & Earn Free Pro
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Invite your Cambridge classmates to LevelHubAI. When they join using your link, you both unlock 
              <strong className="text-teal-700 dark:text-teal-300 font-bold"> 1 Month of Free Pro Access</strong> + 
              <strong className="text-amber-600 font-bold"> 500 Bonus XP</strong>!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/90 dark:bg-slate-900/90 p-2.5 rounded-2xl border border-teal-200/80 dark:border-teal-800 shrink-0 max-w-md w-full">
            <Input
              value={referralUrl}
              readOnly
              className="font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 h-9"
            />
            <Button
              onClick={handleCopyReferral}
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs px-4 h-9 shrink-0"
            >
              {copiedReferral ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-300" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* 6. SUBJECTS PROGRESS MAP (MATCHING TUTOPIYA IMAGE 4) */}
      <SubjectProgressMap subjects={subjects as any} />

      {/* 7. AI WRITING CHECKER BANNER */}
      <div>
        <Link to="/writing-checker" className="block group">
          <div className="bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-cyan-500/10 border border-teal-500/20 dark:border-teal-500/30 rounded-3xl p-6 transition-all duration-300 hover:shadow-md hover:border-teal-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <PenTool className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  AI Writing & Grammar Checker
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Practice your writing skills with voice typing, IGCSE/O Level evaluation, and AI feedback.
                </p>
              </div>
            </div>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shrink-0 group-hover:shadow-md transition-all self-start sm:self-auto">
              Start Writing
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </Link>
      </div>

      {/* 8. QUICK PRACTICE HUB (3 CARDS + SUBJECT PILLS) */}
      <QuickPracticeHub subjects={subjects as any} />
    </div>
  );
}
