import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Download,
  Brain,
  Timer,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useStudentProgramme, SubjectItem } from '@/contexts/StudentProgrammeContext';
import { featureStorage, StudyPlanItem } from '@/integrations/supabase/featureClient';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { WeeklyReportExportModal } from '@/components/reporting/WeeklyReportExportModal';
import { BadgeShowcase } from '@/components/badges/BadgeShowcase';
import { ProfileCompletionPopup, isProfileAlreadyComplete } from '@/components/onboarding/ProfileCompletionPopup';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export const StudentHome: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, programmeLabel, subjects, coreSubjects, freeSubjects } = useStudentProgramme();
  const { isPro, isSchool } = useSubscription();
  const isPremium = isPro || isSchool;
  const { xpLeaderboard, streakLeaderboard, isLoading: leaderboardLoading } = useLeaderboard(10);
  const [leaderboardTab, setLeaderboardTab] = useState<'xp' | 'streak'>('xp');
  const [todayTasks, setTodayTasks] = useState<StudyPlanItem[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [quizStats, setQuizStats] = useState({ totalQuizzes: 0, avgAccuracy: 0 });
  const [mockStats, setMockStats] = useState({ totalMocks: 0 });
  const [lessonsCompletedCount, setLessonsCompletedCount] = useState(0);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);

  // Show profile completion popup on first visit after login
  useEffect(() => {
    if (user?.id && !isProfileAlreadyComplete(user.id)) {
      const timer = setTimeout(() => setShowProfileCompletion(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user?.id]);

  // Strictly 3 Free Core Subjects on Dashboard (Mathematics, Physics, ICT)
  const displayedHomeSubjects = useMemo(() => {
    const pool = freeSubjects && freeSubjects.length > 0 
      ? freeSubjects 
      : subjects.filter(s => s.isCore);
    return [...pool].sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999)).slice(0, 3);
  }, [freeSubjects, subjects]);

  // Load real academic stats
  useEffect(() => {
    const userId = user?.id || profile.id;
    if (!userId || userId === 'guest_student') return;
    const loadStats = async () => {
      try {
        const [qa, qs, mocks, lessons] = await Promise.all([
          (supabase.from('quiz_attempts') as any).select('*').eq('user_id', userId),
          (supabase.from('quiz_sessions') as any).select('percentage').eq('user_id', userId).eq('status', 'completed'),
          (supabase.from('mock_exam_attempts' as any) as any).select('id').eq('user_id', userId),
          (supabase.from('lesson_progress') as any).select('lesson_id').eq('user_id', userId).eq('video_completed', true),
        ]);
        const allQ = [...((qa as any)?.data || []), ...((qs as any)?.data || [])];
        const totalQ = allQ.length;
        const avgAcc = totalQ > 0 ? Math.round(allQ.reduce((s: number, q: any) => s + (q.percentage || (q.is_correct ? 100 : 0) || 0), 0) / totalQ) : 0;
        setQuizStats({ totalQuizzes: totalQ, avgAccuracy: avgAcc });
        setMockStats({ totalMocks: mocks.data?.length || 0 });
        setLessonsCompletedCount(lessons.data?.length || 0);
      } catch (e) { /* silent */ }
    };
    loadStats();
  }, [user?.id, profile.id]);

  // Compute real exam countdown from profile
  const examCountdownDays = (() => {
    const year = parseInt(profile.examYear) || new Date().getFullYear();
    const month = profile.examSession?.toLowerCase().includes('nov') ? 10 : 4; // Oct=10 for Nov, Apr=4 for May/Jun
    const examDate = new Date(year, month, 15);
    const today = new Date();
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  // Load today's mission tasks from feature storage (real data only)
  useEffect(() => {
    const loadTasks = async () => {
      const plans = await featureStorage.getStudyPlans(profile.id, profile.programme);
      // Only set real saved plans — no fake defaults
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

  // XP progress to next level
  const getXpForNextLevel = (lvl: number) => lvl * 1000;
  const currentLvlXpFloor = (profile.level - 1) * 1000;
  const nextLvlXpCeil = getXpForNextLevel(profile.level);
  const xpInCurrentLevel = Math.max(0, profile.xpPoints - currentLvlXpFloor);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / (nextLvlXpCeil - currentLvlXpFloor)) * 100));

  return (
    <div className="space-y-8 pb-16">
      {/* 0. PROFILE COMPLETION POPUP */}
      {showProfileCompletion && user?.id && (
        <ProfileCompletionPopup
          userId={user.id}
          onComplete={() => setShowProfileCompletion(false)}
        />
      )}

      {/* 0b. PRO SUBSCRIPTION STATUS HEADING */}
      {isPremium && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-extrabold">Pro Subscription</span>
            <span className="text-teal-300/80 font-semibold hidden sm:inline">• 100% Unlocked Cambridge Learning Experience</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/billing')} className="h-7 text-xs text-teal-200 hover:text-white hover:bg-white/10 rounded-lg">
            Subscription Details
          </Button>
        </div>
      )}

      {/* 1. HERO BANNER WITH CLONED LOGO & ACTION ROW */}
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
                onClick={() => navigate('/subjects')}
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
            </div>
          </div>
        </div>
      </div>

      {/* 1b. REAL ACADEMIC STATS BAR — visible only when student has activity */}
      {(quizStats.totalQuizzes > 0 || lessonsCompletedCount > 0 || mockStats.totalMocks > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">{lessonsCompletedCount}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Lessons Mastered</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">{quizStats.totalQuizzes}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Quizzes Taken</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">{mockStats.totalMocks}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Mock Exams</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-black text-slate-900 dark:text-white">{quizStats.avgAccuracy}%</div>
              <div className="text-[10px] text-slate-400 font-semibold">Average Accuracy</div>
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

          {/* Tool 2: Smart Quizzes */}
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

          {/* Tool 3: AI Mock Exam */}
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

          {/* Tool 4: Writing & Grammar Checker */}
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

          {/* Tool 5: AI Tutor */}
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

      {/* WEEKLY REPORT BANNER MATCHING USER IMAGE 3 */}
      <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Weekly Report</h3>
              <p className="text-xs text-slate-400">Download your progress report with spider web cognitive analysis</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setReportModalOpen(true)}
            className="rounded-xl h-9 px-4 text-xs font-bold gap-2 border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:text-teal-600 shrink-0 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Button>
        </div>
      </Card>

      {/* 3. GAMIFICATION LEVEL PROGRESS & STATS */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Level and XP progress bar */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 font-black text-sm">
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
              <Badge variant="secondary" className="text-xs font-bold text-teal-700 bg-teal-50">
                {nextLvlXpCeil - profile.xpPoints} XP to Level {profile.level + 1}
              </Badge>
            </div>

            <Progress value={xpPercent} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* Day Streak */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200/60">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/60 flex items-center justify-center text-orange-600 shrink-0">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{profile.streakDays} Days</div>
              <div className="text-[11px] text-orange-700 dark:text-orange-300 font-semibold">Active Streak</div>
            </div>
          </div>

          {/* Exam Countdown — real computed from profile */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-600 shrink-0">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-lg font-black text-slate-900 dark:text-white">{examCountdownDays} Days</div>
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">{profile.examSession} {profile.examYear}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. TODAY'S MISSION & HOME LEADERBOARD (SIDE BY SIDE & EQUAL DOWN SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column: Today's Mission & Achievements Card (2 Columns) */}
        <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Study Mission</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">AI-recommended daily syllabus milestones</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/quiz')}
                className="text-xs rounded-xl h-8 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
              >
                <Zap className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Quick Practice
              </Button>
            </div>

            <div className="space-y-2.5">
              {todayTasks.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">No study tasks planned yet</div>
                  <div className="text-xs text-slate-400">Use the AI Planner to generate your Cambridge revision schedule</div>
                  <Button size="sm" onClick={() => navigate('/planner')} className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold mt-1">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Plan with AI
                  </Button>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-150 ${
                      task.completed
                        ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-300 dark:hover:border-teal-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
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
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {task.subject_name}
                          </Badge>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.duration_minutes}m
                          </span>
                        </div>
                        <div className={`text-sm font-semibold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {task.topic_title || `${task.activity_type.toUpperCase()} session`}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(`/subjects-hub/${task.subject_id}`)}
                      className="rounded-xl text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-semibold text-xs ml-2"
                    >
                      Start
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ACHIEVEMENTS CARD UNDER THE TASKS CARD */}
          <div className="pt-2 flex-1 flex flex-col justify-end">
            <BadgeShowcase />
          </div>
        </div>

        {/* Right Column: Real Cambridge Leaderboard on Home (Equal Down Side) */}
        <div className="space-y-4 h-full flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Leaderboard
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/challenges')}
              className="text-xs text-teal-600 font-semibold h-7"
            >
              Battles <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              {/* Leaderboard Tabs: ⭐ Top XP / 🔥 Top Streaks */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('xp')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all",
                    leaderboardTab === 'xp'
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  )}
                >
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Top XP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardTab('streak')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all",
                    leaderboardTab === 'streak'
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  )}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span>Top Streaks</span>
                </button>
              </div>

              {/* Leaderboard Student Rows */}
              <div className="space-y-2.5">
                {(() => {
                  const currentList = leaderboardTab === 'xp' ? xpLeaderboard : streakLeaderboard;
                  const displayList = (currentList || []).slice(0, 6);

                  if (displayList.length === 0) {
                    return (
                      <div className="text-center py-6 text-xs text-slate-400">
                        Loading Cambridge scholars...
                      </div>
                    );
                  }

                  return displayList.map((entry: any, index: number) => {
                    const rank = entry.rank || index + 1;
                    const isUser = entry.display_name === profile.displayName || entry.id === profile.id || entry.id === user?.id;

                    const getRankStyle = (r: number) => {
                      if (r === 1) return 'bg-[#fef9ee] dark:bg-amber-950/25 border-[#fde8c5] dark:border-amber-900/40 text-amber-900 dark:text-amber-200';
                      if (r === 2) return 'bg-[#f8f9fa] dark:bg-slate-800/40 border-[#eaedf0] dark:border-slate-700/60 text-slate-800 dark:text-slate-200';
                      if (r === 3) return 'bg-[#fef4ed] dark:bg-orange-950/25 border-[#fbd8c3] dark:border-orange-900/40 text-orange-950 dark:text-orange-200';
                      return 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40';
                    };

                    return (
                      <div
                        key={entry.id || index}
                        className={cn(
                          "flex items-center justify-between p-2.5 px-3 rounded-2xl border transition-all duration-200",
                          getRankStyle(rank),
                          isUser && "ring-2 ring-teal-500 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank Icon / Number */}
                          <div className="w-5 text-center shrink-0 flex items-center justify-center">
                            {rank === 1 ? (
                              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : rank === 2 ? (
                              <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />
                            ) : rank === 3 ? (
                              <Medal className="w-4 h-4 text-amber-700 fill-amber-600" />
                            ) : (
                              <span className="text-xs font-bold text-slate-400">{rank}</span>
                            )}
                          </div>

                          {/* Avatar with fallback color */}
                          <Avatar className="w-8 h-8 shrink-0 border border-black/5 dark:border-white/10">
                            {entry.avatar_url ? (
                              <AvatarImage src={entry.avatar_url} alt={entry.display_name} className="object-cover" />
                            ) : null}
                            <AvatarFallback className={cn("text-xs font-bold", entry.avatar_color || "bg-teal-600 text-white")}>
                              {entry.avatar_fallback || entry.display_name?.charAt(0)?.toUpperCase() || 'S'}
                            </AvatarFallback>
                          </Avatar>

                          {/* Student Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                {entry.display_name}
                              </span>
                              {isUser && (
                                <span className="text-[10px] font-extrabold text-teal-600 dark:text-teal-400">
                                  (You)
                                </span>
                              )}
                              {entry.rankChange && entry.rankChange > 0 ? (
                                <span className="flex items-center text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 rounded-full">
                                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />+{entry.rankChange}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Level {entry.level || 1}
                              {entry.school ? ` · ${entry.school}` : ''}
                            </div>
                          </div>
                        </div>

                        {/* XP or Streak metric */}
                        <div className="shrink-0 font-extrabold text-xs">
                          {leaderboardTab === 'xp' ? (
                            <span className="flex items-center gap-1 text-slate-900 dark:text-white">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span>{entry.xp_points.toLocaleString()}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-500">
                              <Flame className="w-3.5 h-3.5 fill-orange-500" />
                              <span>{entry.streak_days}d</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Bottom Challenge Footer */}
            <div className="pt-3.5 mt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                500+ Community Scholars
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/challenges')}
                className="rounded-xl text-xs font-bold border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 h-8"
              >
                1v1 Battles <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. TUTOPIYA-STYLED SUBJECT CARDS SECTION (3 FREE CORE SUBJECTS ONLY) */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Core Cambridge Subjects</span>
              <Badge variant="outline" className="text-xs font-medium border-slate-300 text-slate-600 dark:text-slate-400">
                {programmeLabel}
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your 3 primary foundation subjects with immediate curriculum & quiz access
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/subjects')}
            className="text-xs rounded-xl self-start sm:self-auto border-slate-200 dark:border-slate-800"
          >
            Explore Full Subjects Catalogue ({subjects.length})
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        {/* Subjects Grid (Strictly 3 Free Core Subjects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedHomeSubjects.map((subject) => (
            <Card 
              key={subject.id}
              onClick={() => {
                navigate(subject.id ? `/subjects-hub/${subject.id}` : `/subjects/${subject.slug || subject.name.toLowerCase().replace(/\s+/g, '-')}`);
              }}
              className="bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                    {subject.subject_code ? `Code ${subject.subject_code}` : subject.syllabusCode}
                  </Badge>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {subject.name}
                  </h3>
                </div>

                {/* Tutopiya Circular Completion Badge */}
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      className="text-slate-100 dark:text-slate-800"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      strokeDasharray={113}
                      strokeDashoffset={113 - (113 * (subject.progressPercent || 0)) / 100}
                      className="text-teal-500 transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {subject.progressPercent || 0}%
                  </span>
                </div>
              </div>

              {/* Progress and Topic metrics */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Topics Covered</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{subject.completedTopics || 0} / {subject.totalTopics || 0}</span>
                </div>
                <Progress value={subject.progressPercent || 0} className="h-1.5 bg-slate-100 dark:bg-slate-800" />

                {/* Weak topic indicator if any */}
                {(subject.weakTopics?.length ?? 0) > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="truncate">Focus: {subject.weakTopics![0]}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {subject.studyTimeHours || 0}h study time
                </span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  Start Learning <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 6. AI WRITING & GRAMMAR CHECKER BANNER (MATCHING USER SCREENSHOT) */}
      <Card className="rounded-3xl border border-teal-100/90 dark:border-teal-900/60 bg-[#E8F7F7] dark:bg-teal-950/30 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#CFEFEF] dark:bg-teal-900/60 flex items-center justify-center text-teal-600 dark:text-teal-300 shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                AI Writing & Grammar Checker
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
                Practice your writing skills with voice typing, IGCSE/O Level evaluation, and AI feedback.
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/writing-checker')}
            className="rounded-xl text-xs font-bold px-6 h-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs shrink-0 self-start sm:self-auto"
          >
            Start Writing
          </Button>
        </div>
      </Card>

      {/* 7. QUICK PRACTICE HUB (MATCHING USER SCREENSHOT) */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Quick Practice Hub
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Quick Quiz */}
          <div
            onClick={() => navigate('/quiz?type=quick')}
            className="p-6 rounded-3xl bg-[#00B4B6] text-white flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all min-h-[175px] group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                <span>⚡ Quick Quiz</span>
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Generate a quick quiz from indexed past papers.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="px-4 py-1 rounded-full text-xs font-bold bg-white/25 hover:bg-white/35 text-white transition-colors">
                Start
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Timed Quiz */}
          <div
            onClick={() => navigate('/quiz?type=timed')}
            className="p-6 rounded-3xl bg-[#F97316] text-white flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all min-h-[175px] group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                <span>⏱️ Timed Quiz</span>
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Test yourself against the clock.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="px-4 py-1 rounded-full text-xs font-bold bg-white/25 hover:bg-white/35 text-white transition-colors">
                Start
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Quiz Center */}
          <div
            onClick={() => navigate('/quiz?type=center')}
            className="p-6 rounded-3xl bg-[#8B5CF6] text-white flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all min-h-[175px] group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white mb-2">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-extrabold flex items-center gap-1.5">
                <span>🧠 Quiz Center</span>
              </h3>
              <p className="text-xs text-white/90 leading-relaxed">
                Generate quizzes by subject, unit, or lesson.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="px-4 py-1 rounded-full text-xs font-bold bg-white/25 hover:bg-white/35 text-white transition-colors">
                Start
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Report Export Modal */}
      <WeeklyReportExportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
      />
    </div>
  );
};
