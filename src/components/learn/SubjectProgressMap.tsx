import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Lock, 
  ChevronRight,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Receipt,
  Monitor,
  Globe,
  Languages,
  Crown,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useStudentProgramme } from "@/contexts/StudentProgrammeContext";
import { PaidSubjectModal } from "@/components/subscription/PaidSubjectModal";

export interface SubjectItemMap {
  id: string;
  name: string;
  syllabusCode?: string;
  qualification?: string;
  icon?: string;
  color?: string;
  description?: string;
  subscription_tier?: string;
}

export interface SubjectProgressItem {
  subject_id: string;
  questions_attempted: number;
  questions_correct: number;
  total_xp_earned?: number;
}

interface SubjectProgressMapProps {
  subjects?: SubjectItemMap[];
  progress?: SubjectProgressItem[];
}

const getSubjectVisuals = (name: string, defaultIcon?: string, defaultColor?: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('account')) {
    return { icon: Receipt, bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border-rose-200/60' };
  }
  if (lower.includes('bio')) {
    return { icon: Dna, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200/60' };
  }
  if (lower.includes('busin')) {
    return { icon: Receipt, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-200/60' };
  }
  if (lower.includes('chem')) {
    return { icon: FlaskConical, bg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 border-cyan-200/60' };
  }
  if (lower.includes('comp') || lower.includes('cs')) {
    return { icon: Monitor, bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200/60' };
  }
  if (lower.includes('econ')) {
    return { icon: Receipt, bg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 border-orange-200/60' };
  }
  if (lower.includes('eng')) {
    return { icon: Languages, bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-200/60' };
  }
  if (lower.includes('ict')) {
    return { icon: Monitor, bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 border-sky-200/60' };
  }
  if (lower.includes('math')) {
    return { icon: Calculator, bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 border-teal-200/60' };
  }
  if (lower.includes('phys')) {
    return { icon: Atom, bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 border-purple-200/60' };
  }
  if (lower.includes('psych')) {
    return { icon: BookOpen, bg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 border-pink-200/60' };
  }
  if (lower.includes('islam')) {
    return { icon: BookOpen, bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 border-emerald-200/60' };
  }
  if (lower.includes('pakistan')) {
    return { icon: Globe, bg: 'bg-green-50 dark:bg-green-950/40 text-green-700 border-green-200/60' };
  }
  if (lower.includes('urdu')) {
    return { icon: Languages, bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 border-amber-200/60' };
  }
  return { icon: BookOpen, bg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 border-teal-200/60' };
};

const getSyllabusSubtitle = (name: string, code?: string, qual?: string) => {
  const cleanQual = qual === 'a_level' ? 'Cambridge International AS and A Level' : 'Cambridge IGCSE';
  return `${cleanQual} ${name} ${code ? `(${code})` : ''}`;
};

export const SubjectProgressMap: React.FC<SubjectProgressMapProps> = ({ 
  subjects: propSubjects, 
  progress: propProgress = [] 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { programmeLabel, subjects: ctxSubjects } = useStudentProgramme();
  const { isPro, isSchool } = useSubscription();

  const isFreePlan = !isPro && !isSchool;

  // Use props subjects or fallback to student programme context subjects
  const rawList = propSubjects && propSubjects.length > 0 ? propSubjects : ctxSubjects;

  // Fetch completed lessons count per subject
  const { data: lecturesWatched = {} } = useQuery({
    queryKey: ['lectures-watched', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data: lessonProgressData } = await supabase
        .from('lesson_progress')
        .select('lesson_id, video_completed, lessons(unit_id, units(subject_id))')
        .eq('user_id', user.id)
        .eq('video_completed', true);

      const counts: Record<string, number> = {};
      (lessonProgressData || []).forEach((lp: any) => {
        const subjectId = lp.lessons?.units?.subject_id;
        if (subjectId) {
          counts[subjectId] = (counts[subjectId] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!user,
  });

  // Fetch real quiz attempts stats per subject from Supabase
  const { data: realSubjectQuizStats = {} } = useQuery({
    queryKey: ['subject-quiz-stats', user?.id],
    queryFn: async () => {
      if (!user) return {};
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('subject_id, percentage, is_correct')
        .eq('user_id', user.id);

      const stats: Record<string, { attempted: number; correct: number }> = {};
      (attempts || []).forEach((a: any) => {
        if (a.subject_id) {
          if (!stats[a.subject_id]) stats[a.subject_id] = { attempted: 0, correct: 0 };
          stats[a.subject_id].attempted += 1;
          if (a.is_correct || (a.percentage && a.percentage >= 60)) {
            stats[a.subject_id].correct += 1;
          }
        }
      });
      return stats;
    },
    enabled: !!user,
  });

  const getProgress = (subjectId: string) => {
    const p = propProgress.find(item => item.subject_id === subjectId);
    if (p && p.questions_attempted > 0) {
      return Math.round((p.questions_correct / p.questions_attempted) * 100);
    }
    const realStat = realSubjectQuizStats[subjectId];
    if (realStat && realStat.attempted > 0) {
      return Math.round((realStat.correct / realStat.attempted) * 100);
    }
    return 0;
  };

  const getAttempts = (subjectId: string) => {
    const p = propProgress.find(item => item.subject_id === subjectId);
    if (p) return p.questions_attempted;
    return realSubjectQuizStats[subjectId]?.attempted || 0;
  };

  const [paidModalOpen, setPaidModalOpen] = useState(false);
  const [paidModalSubject, setPaidModalSubject] = useState<{ name: string; code?: string }>({ name: "" });

  const isSubjectLocked = (s: SubjectItemMap) => {
    if (!isFreePlan) return false;
    return s.subscription_tier !== 'free' && s.subscription_tier !== undefined;
  };

  const freeList = isFreePlan ? rawList.filter(s => s.subscription_tier === 'free') : rawList;
  const limitedList = isFreePlan ? rawList.filter(s => s.subscription_tier !== 'free') : [];

  const handleOpenSubject = (s: SubjectItemMap) => {
    const slug = s.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/subjects-hub/${s.id || slug}`);
  };

  const renderSubjectCard = (subject: SubjectItemMap, index: number, isLimited: boolean) => {
    const { icon: VisualIcon, bg: visualBg } = getSubjectVisuals(subject.name);
    const accuracyVal = getProgress(subject.id);
    const attempts = getAttempts(subject.id);
    const watched = lecturesWatched[subject.id] || 0;
    const locked = isSubjectLocked(subject);
    const subtitle = getSyllabusSubtitle(subject.name, subject.syllabusCode, subject.qualification);

    return (
      <motion.div
        key={subject.id || index}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
      >
        <div
          onClick={() => handleOpenSubject(subject)}
          className={cn(
            "p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer flex flex-col justify-between group",
            locked
              ? "border-amber-200/80 dark:border-amber-900/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md"
              : "border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md"
          )}
        >
          <div>
            {/* Top row: Icon box and New/Pro badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105", visualBg)}>
                <VisualIcon className="w-5 h-5" />
              </div>

              {locked ? (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 text-[10px] font-bold gap-1">
                  <Lock className="w-3 h-3" /> Pro Access
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200">
                  {attempts > 0 ? "In Progress" : "Active Syllabus"}
                </Badge>
              )}
            </div>

            {/* Subject Name & Cambridge Syllabus Subtitle */}
            <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {subject.name}
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5 mb-3">
              {subtitle}
            </p>

            {/* Accuracy Bar */}
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Accuracy</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{accuracyVal}%</span>
              </div>
              <Progress value={accuracyVal} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>

            {/* Lectures watched & Questions attempted */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span>{watched} lectures watched</span>
              <span>{attempts} questions attempted</span>
            </div>
          </div>

          {/* Bottom Action: Start Learning > */}
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            {locked ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/billing');
                  }}
                  className="text-[11px] font-bold text-amber-600 flex items-center gap-1 hover:underline"
                >
                  <Crown className="w-3 h-3" /> Upgrade to Pro
                </button>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                  Preview <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </>
            ) : (
              <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ml-auto">
                Start Learning <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Subject Progress Map
          </h2>
          <Badge variant="outline" className="text-xs font-semibold text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 ml-1">
            {programmeLabel}
          </Badge>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/subjects-hub')}
          className="text-xs rounded-xl self-start sm:self-auto text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500 font-bold"
        >
          <span>All Subjects Catalogue</span>
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      {/* 1. SUBJECTS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>{isPro ? "All Cambridge Syllabus Subjects" : "Free Access Subjects"} ({freeList.length})</span>
            <Badge className={`text-[9px] font-bold border-none ${isPro ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
              {isPro ? "100% Unlocked with Pro" : "Included in Free Plan"}
            </Badge>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {freeList.map((subject, index) => renderSubjectCard(subject, index, false))}
        </div>
      </div>

      {/* 2. PRO SUBJECTS (ONLY FOR FREE USERS) */}
      {limitedList.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Cambridge Pro Subjects ({limitedList.length})</span>
              <Badge className="bg-amber-100 text-amber-800 text-[9px] font-bold border-none">Pro Plan</Badge>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 h-7 px-2"
            >
              <Crown className="w-3 h-3 mr-1" /> Upgrade to Pro
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitedList.map((subject, index) => renderSubjectCard(subject, index, true))}
          </div>
        </div>
      )}
    </div>
  );
};
