import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Star, 
  Swords, 
  Award, 
  ShieldCheck, 
  Zap, 
  Coins,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useStudentProgramme } from '@/contexts/StudentProgrammeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { useBadges } from '@/hooks/useBadges';

export const StudentGamificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, programmeLabel } = useStudentProgramme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard'>('overview');
  const [quizCount, setQuizCount] = useState(0);
  const [mockCount, setMockCount] = useState(0);

  const { allBadges, userBadges, userStats, badgesLoading, checkAndAwardBadges } = useBadges();

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [quizRes, mockRes] = await Promise.all([
        supabase.from('quiz_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('mock_exam_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);
      setQuizCount(quizRes.count || 0);
      setMockCount(mockRes.count || 0);
    };
    fetchStats();
  }, [user]);

  // Check and award any newly qualified badges on page open
  useEffect(() => {
    if (userStats && checkAndAwardBadges) {
      checkAndAwardBadges.mutate();
    }
  }, [userStats]);

  // Fallback earned badges derived from REAL student stats if badges table is empty
  const derivedBadges = [
    { id: 'sb-1', title: '7-Day Streak Master', desc: 'Maintained 7 consecutive days of revision', icon: '🔥', earned: profile.streakDays >= 7, type: 'streak', val: 7, current: profile.streakDays },
    { id: 'sb-2', title: 'Streak Starter', desc: 'Started your daily Cambridge revision habit', icon: '⚡', earned: profile.streakDays >= 1, type: 'streak', val: 1, current: profile.streakDays },
    { id: 'sb-3', title: 'XP Pioneer', desc: 'Earned your first 100 XP', icon: '🌟', earned: profile.xpPoints >= 100, type: 'xp', val: 100, current: profile.xpPoints },
    { id: 'sb-4', title: 'XP Scholar', desc: 'Earned 500+ XP through consistent practice', icon: '🎓', earned: profile.xpPoints >= 500, type: 'xp', val: 500, current: profile.xpPoints },
    { id: 'sb-5', title: 'Quiz Starter', desc: 'Completed your first practice quiz', icon: '✅', earned: quizCount >= 1, type: 'quiz', val: 1, current: quizCount },
    { id: 'sb-6', title: 'Quiz Champion', desc: 'Completed 10 practice quizzes', icon: '🏆', earned: quizCount >= 10, type: 'quiz', val: 10, current: quizCount },
    { id: 'sb-7', title: 'Mock Exam Taker', desc: 'Attempted your first mock exam', icon: '📝', earned: mockCount >= 1, type: 'mock', val: 1, current: mockCount },
    { id: 'sb-8', title: 'Level Up!', desc: `Reached Level ${profile.level}`, icon: '🚀', earned: profile.level >= 2, type: 'level', val: 2, current: profile.level },
  ];

  const totalUnlocked = userBadges.length > 0 
    ? userBadges.length 
    : derivedBadges.filter(b => b.earned).length;

  const totalBadgesCount = allBadges.length > 0 ? allBadges.length : derivedBadges.length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/70 dark:border-amber-800 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-2">
          <Trophy className="w-3.5 h-3.5" />
          Cambridge Scholars League • {programmeLabel}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Gamification & Rewards
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Earn XP, maintain streaks, and level up with every Cambridge revision session.
        </p>
      </div>

      {/* Gamification Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Current Level</span>
            <Star className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Level {profile.level}</div>
          <div className="text-[11px] text-teal-600 font-semibold mt-1">{profile.xpPoints} XP Total</div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Day Streak</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-600">{profile.streakDays} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">Don't break the chain!</div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Earned Coins</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{profile.coins}</div>
          <div className="text-[11px] text-slate-400 mt-1">Active reward balance</div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Badges Unlocked</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600">{totalUnlocked}</div>
          <div className="text-[11px] text-slate-400 mt-1">Of {totalBadgesCount} available</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overview & Peer Battles
        </button>
        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'badges' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Badges Showcase ({totalUnlocked}/{totalBadgesCount})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'leaderboard' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Weekly Leaderboard
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <Badge className="bg-teal-600 text-white text-[10px]">Multiplayer Challenge</Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Challenge a Classmate to a Quiz Battle</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg">
                  Compete head-to-head in real time on 5 timed Cambridge questions. Winner takes +50 bonus XP and custom badges!
                </p>
              </div>
              <Button 
                onClick={() => navigate('/challenges')}
                className="bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold h-10 px-5 shadow-xs shrink-0"
              >
                <Swords className="w-4 h-4 mr-2" /> Start Quiz Battle
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: BADGES */}
      {activeTab === 'badges' && (
        <div className="space-y-6">
          {badgesLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
              Loading Cambridge badges...
            </div>
          ) : allBadges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allBadges.map((badge) => {
                const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
                const isEarned = !!userBadge;

                // Calculate progress towards requirement
                let progress = 0;
                let currentVal = 0;
                if (userStats) {
                  if (badge.requirement_type === 'streak') currentVal = userStats.streak_days;
                  else if (badge.requirement_type === 'xp') currentVal = userStats.total_xp;
                  else if (badge.requirement_type === 'questions') currentVal = userStats.questions_answered;
                  else if (badge.requirement_type === 'correct') currentVal = userStats.correct_answers;
                  else if (badge.requirement_type === 'level') currentVal = userStats.level;
                  progress = Math.min(100, Math.round((currentVal / (badge.requirement_value || 1)) * 100));
                }

                return (
                  <Card 
                    key={badge.id} 
                    className={`p-5 rounded-3xl border text-center space-y-3 shadow-xs transition-all ${
                      isEarned 
                        ? 'bg-white dark:bg-slate-900 border-teal-200/80 dark:border-teal-800/60' 
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-85'
                    }`}
                  >
                    <div className="relative inline-flex items-center justify-center mx-auto">
                      <div className="text-4xl p-2">{badge.icon || '🏅'}</div>
                      {isEarned && (
                        <div className="absolute -top-1 -right-1 bg-teal-600 text-white p-1 rounded-full shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{badge.name}</div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{badge.description}</p>
                    </div>

                    {isEarned ? (
                      <div className="pt-1">
                        <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-[10px] font-bold">
                          Earned • +{badge.xp_reward} XP
                        </Badge>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> Locked</span>
                          <span>{currentVal}/{badge.requirement_value}</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <div className="text-[10px] text-slate-400 pt-0.5">+{badge.xp_reward} XP reward</div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Fallback derived from real stats */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {derivedBadges.map((b) => (
                <Card 
                  key={b.id} 
                  className={`p-5 rounded-3xl border text-center space-y-3 shadow-xs ${
                    b.earned 
                      ? 'bg-white dark:bg-slate-900 border-teal-200/80 dark:border-teal-800' 
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                  }`}
                >
                  <div className="text-4xl mb-1">{b.icon}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{b.title}</div>
                  <p className="text-xs text-slate-500">{b.desc}</p>
                  {b.earned ? (
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] font-bold">
                      Earned
                    </Badge>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] text-slate-400">Goal: {b.val}</div>
                      <Progress value={Math.min(100, Math.round((b.current / b.val) * 100))} className="h-1.5" />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <Leaderboard limit={20} />
        </div>
      )}
    </div>
  );
};
