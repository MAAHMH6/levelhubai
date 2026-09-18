import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  Video, 
  FileText, 
  Zap, 
  Bot, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Clock, 
  Layers,
  Trophy,
  Star,
  FolderOpen,
  GraduationCap,
  Crown,
  Lock,
  CheckCircle,
  CreditCard,
  Sparkles,
  X,
  ChevronRightSquare,
  Copy,
  Printer,
  Shuffle,
  Check,
  HelpCircle,
  RotateCw
} from 'lucide-react';
import { useStudentProgramme, SubjectItem } from '@/contexts/StudentProgrammeContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';
import { EmbeddedAIChatModel } from '@/components/ai/EmbeddedAIChatModel';
import { SyllabusPlanner } from '@/components/subjects/SyllabusPlanner';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubjectCurriculum } from '@/hooks/useSubjectCurriculum';
import { useUnitDetails } from '@/hooks/useUnitDetails';
import { useLessonDetails } from '@/hooks/useLessonDetails';
import { cn, formatSubjectSlug } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { adminDataStore } from '@/lib/adminDataStore';
import { resolveCuratedStudyMaterial, TopicFlashcard, TopicCheatsheet } from '@/data/topicStudyMaterials';

// Workspace Tab options
type WorkspaceTab = 
  | 'video' 
  | 'notes' 
  | 'flashcards' 
  | 'cheatsheet' 
  | 'quiz' 
  | 'ai_tutor'
  | 'syllabus'
  | 'assessment';

interface VideoLessonItem {
  id: string;
  title: string;
  video_url: string;
  duration_minutes: number;
  unit_title?: string;
}

// Lesson Completion Popup
interface LessonCompletePopupProps {
  open: boolean;
  onClose: () => void;
  lessonTitle: string;
  xpEarned: number;
  nextLessonTitle?: string;
  onNextLesson?: () => void;
  onBackToUnit?: () => void;
  unitUnlocked?: boolean;
  nextUnitTitle?: string;
}

const LessonCompletePopup: React.FC<LessonCompletePopupProps> = ({
  open, onClose, lessonTitle, xpEarned, nextLessonTitle, onNextLesson, onBackToUnit, unitUnlocked, nextUnitTitle
}) => {
  const hasFired = useRef(false);

  useEffect(() => {
    if (open && !hasFired.current) {
      hasFired.current = true;
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#14b8a6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'];
      const fire = () => {
        confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors });
        if (Date.now() < end) requestAnimationFrame(fire);
      };
      fire();
    }
    if (!open) hasFired.current = false;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-0 shadow-2xl">
        {/* Top gradient banner */}
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 p-8 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Lesson Complete!</h2>
          <p className="text-teal-100 text-sm mt-1 font-medium">🎉 Outstanding work!</p>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-slate-900 p-6 space-y-5">
          {/* Lesson title */}
          <div className="text-center">
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-1">Lesson Completed</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{lessonTitle}</div>
          </div>

          {/* XP badge */}
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-white rounded-2xl px-8 py-4 text-center shadow-md">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 fill-white" />
                <span className="text-3xl font-black">+{xpEarned}</span>
              </div>
              <p className="text-xs font-bold text-amber-100 mt-0.5">XP Earned</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🎬', label: 'Video', val: 'Done' },
              { icon: '⚡', label: 'Quiz', val: 'Ready' },
              { icon: '📖', label: 'Notes', val: 'Saved' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center border border-slate-200 dark:border-slate-700">
                <div className="text-xl mb-1">{s.icon}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{s.label}</div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{s.val}</div>
              </div>
            ))}
          </div>

          {/* Unit unlocked notice */}
          {unitUnlocked && nextUnitTitle && (
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-center">
              <div className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center justify-center gap-1.5">
                <span>🔓</span> Next Unit Unlocked!
              </div>
              <div className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5 font-medium">{nextUnitTitle}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5 pt-1">
            {nextLessonTitle && onNextLesson && (
              <Button
                onClick={() => { onClose(); onNextLesson(); }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl h-11"
              >
                Next Lesson <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => { onClose(); onBackToUnit && onBackToUnit(); }}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold h-10"
              >
                Back to Unit
              </Button>
              <Button
                variant="outline"
                onClick={() => { onClose(); }}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold h-10"
              >
                Continue Here
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================================
// MAIN WORKSPACE COMPONENT
// =====================================================================
export const StudentSubjectWorkspace: React.FC = () => {
  const { subjectId, subjectSlug } = useParams<{ subjectId?: string; subjectSlug?: string }>();
  const [searchParams] = useSearchParams();
  const targetKey = subjectId || subjectSlug || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSubjectById, getSubjectBySlug, programmeLabel, profile, awardXp } = useStudentProgramme();
  const { isPro, isSchool } = useSubscription();
  const isFreePlan = !isPro && !isSchool;

  // Navigation levels
  const [viewLevel, setViewLevel] = useState<'units' | 'unit_lessons' | 'lesson_workspace' | 'cheatsheet' | 'flashcards'>('units');
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(undefined);
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('video');

  // URL Query Params listener (e.g. ?tab=flashcards&unit=123)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as WorkspaceTab | null;
    const unitParam = searchParams.get('unit');
    const lessonParam = searchParams.get('lesson');
    if (unitParam) setSelectedUnitId(unitParam);
    if (lessonParam) setSelectedLessonId(lessonParam);
    if (tabParam === 'cheatsheet') {
      setViewLevel('cheatsheet');
      setActiveTab('cheatsheet');
    } else if (tabParam === 'flashcards') {
      setViewLevel('flashcards');
      setActiveTab('flashcards');
    } else if (tabParam) {
      setActiveTab(tabParam);
      setViewLevel('lesson_workspace');
    }
  }, [searchParams]);

  // Subject — derive synchronous initial values from URL without calling context functions
  const isTargetUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetKey);
  // Safe initial name: use formatted slug for non-UUID targetKeys so the hook never starts with ''
  const initialSubjectName = isTargetUuid ? '' : formatSubjectSlug(targetKey);
  const [subject, setSubject] = useState<SubjectItem | null>(null);
  const [subjectName, setSubjectName] = useState<string>(initialSubjectName);
  const isALevelRoute = window.location.pathname.startsWith('/a-level');

  // Video/playlist state
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [playlistOpen, setPlaylistOpen] = useState(true);

  // Flashcards & Cheatsheet
  const [flashcards, setFlashcards] = useState<{ id?: string; q: string; a: string; hint?: string }[]>([]);
  const [cheatsheet, setCheatsheet] = useState<TopicCheatsheet | null>(null);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState(false);

  // Assessment stats
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [examsCount, setExamsCount] = useState(0);
  const [avgQuizScore, setAvgQuizScore] = useState(0);
  const [overallAssessmentScore, setOverallAssessmentScore] = useState(0);

  // Lesson completion popup
  const [completionPopup, setCompletionPopup] = useState<{
    open: boolean;
    lessonTitle: string;
    xpEarned: number;
    nextLessonTitle?: string;
    nextLessonId?: string;
    unitUnlocked?: boolean;
    nextUnitTitle?: string;
  }>({ open: false, lessonTitle: '', xpEarned: 0 });

  // Marking state
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Resolve subject from URL — runs after context has hydrated
  useEffect(() => {
    if (!targetKey) return;
    const found = getSubjectById(targetKey) || getSubjectBySlug(targetKey);
    if (found) {
      const expected = isTargetUuid ? targetKey : formatSubjectSlug(targetKey).toLowerCase();
      const actual = isTargetUuid ? found.id : found.name.toLowerCase();
      if (isTargetUuid || actual.includes(expected) || expected.includes(actual)) {
        setSubject(found);
        setSubjectName(found.name);
        return;
      }
    }
    if (!isTargetUuid) {
      const formatted = formatSubjectSlug(targetKey);
      setSubjectName(formatted);
    }
  }, [targetKey, getSubjectById, getSubjectBySlug]);

  // Derived active subject query key: always respect targetKey over any hardcoded defaults
  const activeSubjectQueryKey = subjectName || (isTargetUuid ? targetKey : formatSubjectSlug(targetKey)) || '';

  // useSubjectCurriculum — same hook as old platform with proper fallbacks
  const targetQualification = isALevelRoute ? 'a_level' : (subject?.qualification || profile.programme || 'o_level');
  const { units: curriculumUnits, loading: unitsLoading, subjectId: resolvedSubjectId, exactSubjectName, getTotalStats, refetch: refetchCurriculum } = useSubjectCurriculum(
    activeSubjectQueryKey || (targetKey ? formatSubjectSlug(targetKey) : 'Mathematics'),
    targetQualification
  );

  useEffect(() => {
    if (!targetKey || !exactSubjectName) return;
    const expectedNormalized = formatSubjectSlug(targetKey).toLowerCase();
    const exactNormalized = exactSubjectName.toLowerCase();
    const nameMatches = exactNormalized.includes(expectedNormalized) || expectedNormalized.includes(exactNormalized);
    if (nameMatches) {
      const found = getSubjectBySlug(exactSubjectName.toLowerCase().replace(/\s+/g, '-'));
      if (found) setSubject(found);
    }
  }, [exactSubjectName, targetKey, getSubjectBySlug]);

  // Unit details (includes lessons with progress & isUnlocked)
  const { unit: unitDetails, lessons: unitLessons, loading: unitLoading, refetch: refetchUnit } = useUnitDetails(selectedUnitId);

  // Lesson details & mark complete logic
  const activeLessonId = selectedLessonId || unitLessons[0]?.id;
  const { markLessonComplete, initializeProgress, progress: lessonProgress } = useLessonDetails(activeLessonId);

  // Initialize progress when a lesson is opened
  useEffect(() => {
    if (activeLessonId && user && viewLevel === 'lesson_workspace') {
      initializeProgress.mutate();
    }
  }, [activeLessonId, user, viewLevel]);

  const currentLesson = useMemo(() => {
    if (!selectedLessonId) return unitLessons[0] || null;
    return unitLessons.find(l => l.id === selectedLessonId) || unitLessons[0] || null;
  }, [selectedLessonId, unitLessons]);

  // All lessons from current unit as video items
  const videoLessons: VideoLessonItem[] = useMemo(() => {
    if (viewLevel === 'lesson_workspace' && unitLessons.length > 0) {
      return unitLessons.map(l => ({
        id: l.id,
        title: l.title,
        video_url: (l as any).video_url || '',
        duration_minutes: l.duration_minutes || 20,
        unit_title: unitDetails?.title || '',
      }));
    }
    const allLessons = curriculumUnits.flatMap(u => u.lessons.map(l => ({
      id: l.id,
      title: l.title,
      video_url: (l as any).video_url || '',
      duration_minutes: l.duration_minutes || 20,
      unit_title: u.title,
    })));
    return allLessons;
  }, [curriculumUnits, unitLessons, viewLevel, unitDetails]);

  const currentVideo = videoLessons[activeVideoIndex] || videoLessons[0];
  const currentTopicTitle = currentLesson?.title || currentVideo?.title || 'Core Topic';
  const stats = getTotalStats();
  const isLimitedAccess = isFreePlan && subject?.subscription_tier !== 'free';

  const formattedSlugName = targetKey && !isTargetUuid ? formatSubjectSlug(targetKey) : '';
  const displaySubjectName = formattedSlugName || subject?.name || exactSubjectName || subjectName || 'Subject';
  const displaySyllabusCode = subject?.syllabusCode || (formattedSlugName === 'ICT' ? '0417' : 'Cambridge');

  // ──────────────────────────────────────────────────────────────────────────
  // MARK LESSON COMPLETE — full XP + unlock logic
  // ──────────────────────────────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!currentLesson || isMarkingComplete) return;
    const alreadyDone = currentLesson.progress?.lesson_completed;
    if (alreadyDone) { toast.info('This lesson is already completed!'); return; }

    setIsMarkingComplete(true);
    try {
      // Use the existing hook to mark complete + update unit_progress
      const result = await markLessonComplete.mutateAsync();
      const xpEarned = result?.xpToAward || (currentLesson as any).xp_reward || 50;

      // Award XP to student profile (context-level)
      await awardXp(xpEarned);

      // Find next lesson in same unit
      const currentIdx = unitLessons.findIndex(l => l.id === currentLesson.id);
      const nextLesson = currentIdx < unitLessons.length - 1 ? unitLessons[currentIdx + 1] : null;
      const isLastLesson = currentIdx === unitLessons.length - 1;

      // If this was the last lesson, check if we should unlock the next unit
      let nextUnit: any = null;
      let nextUnitTitle: string | undefined;
      if (isLastLesson && resolvedSubjectId) {
        const currentUnitIdx = curriculumUnits.findIndex(u => u.id === selectedUnitId);
        if (currentUnitIdx < curriculumUnits.length - 1) {
          nextUnit = curriculumUnits[currentUnitIdx + 1];
          nextUnitTitle = nextUnit?.title;
          // Unlock the next unit in DB
          if (nextUnit?.id && user?.id) {
            const { data: existingUP } = await supabase
              .from('unit_progress')
              .select('id, is_unlocked')
              .eq('unit_id', nextUnit.id)
              .eq('user_id', user.id)
              .maybeSingle();
            if (existingUP) {
              await supabase.from('unit_progress').update({ is_unlocked: true }).eq('id', existingUP.id);
            } else {
              await supabase.from('unit_progress').insert({
                unit_id: nextUnit.id,
                user_id: user.id,
                lessons_completed: 0,
                total_lessons: nextUnit.lessons?.length || 0,
                progress_percentage: 0,
                is_unlocked: true,
              });
            }
          }
        }
      }

      // Refresh data
      await refetchUnit();
      await refetchCurriculum();

      // Show completion popup
      setCompletionPopup({
        open: true,
        lessonTitle: currentLesson.title,
        xpEarned,
        nextLessonTitle: nextLesson?.title,
        nextLessonId: nextLesson?.id,
        unitUnlocked: isLastLesson && !!nextUnit,
        nextUnitTitle,
      });

    } catch (err) {
      console.error('Error marking complete:', err);
      toast.error('Failed to mark lesson complete. Please try again.');
    } finally {
      setIsMarkingComplete(false);
    }
  };

  // Navigate to next lesson (called from popup)
  const handleGoNextLesson = () => {
    if (!completionPopup.nextLessonId) return;
    const nextLesson = unitLessons.find(l => l.id === completionPopup.nextLessonId);
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      const vidIdx = videoLessons.findIndex(v => v.id === nextLesson.id);
      if (vidIdx !== -1) setActiveVideoIndex(vidIdx);
      setActiveTab('video');
    }
  };

  // Navigate to quiz with pre-filled context
  const goToQuiz = () => {
    const params = new URLSearchParams();
    if (resolvedSubjectId) params.set('subject_id', resolvedSubjectId);
    if (selectedUnitId) params.set('unit_id', selectedUnitId);
    if (currentLesson?.id) params.set('lesson_id', currentLesson.id);
    navigate(`/quiz?${params.toString()}`);
  };

  // Dynamic topic-specific flashcards and cheatsheet loader
  useEffect(() => {
    const topicTitle = currentTopicTitle || currentLesson?.title || unitDetails?.title || '';
    const targetSubjectName = displaySubjectName || '';

    const lessonKey = currentLesson?.id ? `lesson_${currentLesson.id}` : '';
    const unitKey = selectedUnitId ? `unit_${selectedUnitId}` : '';
    const subjectKey = resolvedSubjectId ? `subject_${resolvedSubjectId}` : '';

    const loadStudyMaterials = () => {
      setLoadingFlashcards(true);
      try {
        // 1. Check custom admin overrides first
        const customCards = (lessonKey && adminDataStore.getTopicFlashcards(lessonKey))
          || (unitKey && adminDataStore.getTopicFlashcards(unitKey))
          || (subjectKey && adminDataStore.getTopicFlashcards(subjectKey));

        const customSheet = (lessonKey && adminDataStore.getTopicCheatsheet(lessonKey))
          || (unitKey && adminDataStore.getTopicCheatsheet(unitKey))
          || (subjectKey && adminDataStore.getTopicCheatsheet(subjectKey));

        // 2. Resolve curated Cambridge study materials for this exact subject & topic
        const resolved = resolveCuratedStudyMaterial(targetSubjectName, topicTitle);

        setFlashcards(customCards && customCards.length > 0 ? customCards : resolved.flashcards);
        setCheatsheet(customSheet || resolved.cheatsheet);
        setCurrentCardIndex(0);
        setCardFlipped(false);
      } finally {
        setLoadingFlashcards(false);
      }
    };

    loadStudyMaterials();

    // Listen to real-time updates from Admin Dashboard
    const handleAdminMaterialUpdate = () => loadStudyMaterials();
    window.addEventListener('levelhub:study_materials_updated', handleAdminMaterialUpdate);
    return () => window.removeEventListener('levelhub:study_materials_updated', handleAdminMaterialUpdate);
  }, [resolvedSubjectId, selectedUnitId, currentLesson?.id, currentTopicTitle, displaySubjectName, unitDetails?.title]);

  // Assessment stats fetch
  useEffect(() => {
    if (!resolvedSubjectId) return;
    const fetchStats = async () => {
      const { data: qa } = await supabase.from('quiz_attempts').select('percentage').eq('subject_id', resolvedSubjectId).order('created_at', { ascending: false }).limit(20);
      const { data: ma } = await supabase.from('mock_exam_attempts').select('id').eq('subject_id', resolvedSubjectId);
      if (qa && qa.length > 0) {
        setQuizzesCount(qa.length);
        const avg = Math.round(qa.reduce((a, q) => a + (q.percentage || 0), 0) / qa.length);
        setAvgQuizScore(avg);
        setOverallAssessmentScore(Math.min(98, avg + 4));
      }
      setExamsCount(ma?.length || 0);
    };
    fetchStats();
  }, [resolvedSubjectId]);

  // Sidebar tab button
  const TabButton = ({ tab, icon: Icon, label, sub }: { tab: WorkspaceTab; icon: any; label: string; sub?: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
        activeTab === tab
          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/60'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      <Icon className="w-4 h-4 text-teal-600 shrink-0" />
      <div>
        <div className="font-bold">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 font-normal">{sub}</div>}
      </div>
    </button>
  );

  return (
    <div className="space-y-5 pb-20 max-w-7xl mx-auto">

      {/* Lesson Complete Popup */}
      <LessonCompletePopup
        open={completionPopup.open}
        onClose={() => setCompletionPopup(p => ({ ...p, open: false }))}
        lessonTitle={completionPopup.lessonTitle}
        xpEarned={completionPopup.xpEarned}
        nextLessonTitle={completionPopup.nextLessonTitle}
        onNextLesson={completionPopup.nextLessonId ? handleGoNextLesson : undefined}
        onBackToUnit={() => { setViewLevel('unit_lessons'); setSelectedLessonId(undefined); }}
        unitUnlocked={completionPopup.unitUnlocked}
        nextUnitTitle={completionPopup.nextUnitTitle}
      />

      {/* Pro Banner */}
      {(isPro || isSchool) && (
        <div className="flex items-center justify-between p-3.5 px-5 rounded-2xl bg-teal-500/10 border border-teal-500/25 text-xs font-bold">
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-white text-sm font-extrabold">Pro Subscription</span>
            <span className="text-teal-300/80 font-semibold hidden sm:inline">• All units, videos, and practice unlocked</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigate('/billing')} className="h-7 text-xs text-teal-200 hover:text-white hover:bg-white/10 rounded-lg">
            Manage
          </Button>
        </div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 overflow-x-auto scrollbar-none flex-wrap">
        <Link to="/dashboard" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>›</span>
        <span className="text-slate-600 dark:text-slate-300">{programmeLabel}</span>
        <span>›</span>
        <button onClick={() => { setViewLevel('units'); setSelectedUnitId(undefined); setSelectedLessonId(undefined); }} className="hover:text-teal-600 font-semibold">
          {displaySubjectName}
        </button>
        {viewLevel !== 'units' && unitDetails && (
          <>
            <span>›</span>
            <button onClick={() => { setViewLevel('unit_lessons'); setSelectedLessonId(undefined); }} className="hover:text-teal-600 font-semibold">
              Unit {unitDetails.unit_number}: {unitDetails.title}
            </button>
          </>
        )}
        {viewLevel === 'lesson_workspace' && currentLesson && (
          <>
            <span>›</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold truncate max-w-[200px]">{currentLesson.title}</span>
          </>
        )}
        {viewLevel === 'cheatsheet' && (
          <>
            <span>›</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Exam Cheat Sheet</span>
          </>
        )}
        {viewLevel === 'flashcards' && (
          <>
            <span>›</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">Topic Flashcards</span>
          </>
        )}
      </div>

      {/* ================================================================= */}
      {/* LEVEL 1: SUBJECT UNITS OVERVIEW                                   */}
      {/* ================================================================= */}
      {viewLevel === 'units' && (
        <div className="space-y-6">
          {/* Subject Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60">
                  {displaySyllabusCode}
                </Badge>
                <span className="text-xs text-slate-400 font-semibold">{programmeLabel}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{displaySubjectName}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {stats.totalLessons} lessons across {curriculumUnits.length} units · {stats.completedLessons} completed
              </p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" className="text-slate-200 dark:text-slate-700 stroke-current" strokeWidth="3.5" fill="none" />
                  <circle cx="20" cy="20" r="16" className="text-teal-500 stroke-current transition-all duration-500" strokeWidth="3.5" strokeDasharray={100} strokeDashoffset={100 - stats.overallProgress} strokeLinecap="round" fill="none" />
                </svg>
                <span className="absolute text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{stats.overallProgress}%</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{stats.overallProgress}% Complete</div>
                <div className="text-[11px] text-slate-400">{curriculumUnits.length} Units · {stats.totalLessons} Lessons</div>
              </div>
            </div>
          </div>

          {/* Quick Actions — Colour-coded */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: BookOpen, label: 'Start Learning', sub: 'Continue Unit 1', bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-600', border: 'hover:border-teal-400 dark:hover:border-teal-700', gradient: 'from-teal-500/5 to-teal-600/5', onClick: () => { if (curriculumUnits[0]) { setSelectedUnitId(curriculumUnits[0].id); setViewLevel('unit_lessons'); } } },
              { icon: CreditCard, label: 'Flashcards', sub: 'Topic cards', bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-600', border: 'hover:border-indigo-400 dark:hover:border-indigo-700', gradient: 'from-indigo-500/5 to-indigo-600/5', onClick: () => { if (curriculumUnits[0]) { setSelectedUnitId(curriculumUnits[0].id); setViewLevel('lesson_workspace'); setActiveTab('flashcards'); } } },
              { icon: Sparkles, label: 'Cheat Sheet', sub: 'Exam rules & formulas', bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600', border: 'hover:border-amber-400 dark:hover:border-amber-700', gradient: 'from-amber-500/5 to-amber-600/5', onClick: () => { if (curriculumUnits[0]) { setSelectedUnitId(curriculumUnits[0].id); setViewLevel('lesson_workspace'); setActiveTab('cheatsheet'); } } },
              { icon: Zap, label: 'Quick Quiz', sub: 'Test your knowledge', bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600', border: 'hover:border-emerald-400 dark:hover:border-emerald-700', gradient: 'from-emerald-500/5 to-emerald-600/5', onClick: () => { const p = new URLSearchParams(); if (resolvedSubjectId) p.set('subject_id', resolvedSubjectId); navigate(`/quiz?${p.toString()}`); } },
              { icon: Bot, label: 'AI Tutor', sub: 'Get instant help', bg: 'bg-cyan-50 dark:bg-cyan-950/50', text: 'text-cyan-600', border: 'hover:border-cyan-400 dark:hover:border-cyan-700', gradient: 'from-cyan-500/5 to-cyan-600/5', onClick: () => { if (curriculumUnits[0]) { setSelectedUnitId(curriculumUnits[0].id); setViewLevel('lesson_workspace'); setActiveTab('ai_tutor'); } } },
              { icon: FileText, label: 'Syllabus', sub: 'Full checklist', bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-600', border: 'hover:border-purple-400 dark:hover:border-purple-700', gradient: 'from-purple-500/5 to-purple-600/5', onClick: () => { if (curriculumUnits[0]) { setSelectedUnitId(curriculumUnits[0].id); setViewLevel('lesson_workspace'); setActiveTab('syllabus'); } } },
            ].map((item, i) => (
              <button key={i} onClick={item.onClick} className={`bg-gradient-to-br ${item.gradient} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg ${item.border} transition-all text-left group`}>
                <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{item.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.sub}</div>
              </button>
            ))}
          </div>

          {/* Pro upgrade notice */}
          {isLimitedAccess && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">Pro Subject</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">Free Plan: Math, Physics & ICT only. Upgrade for all subjects.</p>
                </div>
              </div>
              <Button onClick={() => navigate('/billing')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs h-9 px-4 shrink-0">
                <Crown className="w-3.5 h-3.5 mr-1.5" /> Upgrade to Pro
              </Button>
            </div>
          )}

          {/* Units Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-teal-600" />
              Syllabus Units ({curriculumUnits.length})
            </h2>
            {unitsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {curriculumUnits.map((unit, index) => {
                  // Unit 1 always unlocked; subsequent units only after previous unit's progress ≥ 80%
                  const isFirstUnit = index === 0;
                  const previousUnit = index > 0 ? curriculumUnits[index - 1] : null;
                  const prevProgress = previousUnit?.progress?.progress_percentage ?? 0;
                  const isUnitUnlocked = isFirstUnit || (previousUnit?.progress?.is_unlocked && prevProgress >= 80) || unit.progress?.is_unlocked;
                  const isUnitLocked = !isUnitUnlocked && !isPro && !isSchool;
                  // Pro users see all units
                  const isActuallyLocked = isUnitLocked && !isPro && !isSchool;

                  const progress = unit.progress?.progress_percentage ?? 0;
                  const lessonsCount = unit.lessons.length;

                  return (
                    <div
                      key={unit.id}
                      onClick={() => {
                        if (isActuallyLocked) { toast.error('Complete the previous unit first to unlock this one!'); return; }
                        if (isLimitedAccess && index >= 5) { navigate('/billing'); return; }
                        setSelectedUnitId(unit.id);
                        setViewLevel('unit_lessons');
                      }}
                      className={cn(
                        'bg-white dark:bg-slate-900 rounded-3xl p-6 transition-all duration-200 cursor-pointer group flex flex-col justify-between border relative overflow-hidden',
                        isActuallyLocked
                          ? 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-90'
                          : progress >= 100
                            ? 'border-teal-300 dark:border-teal-700/60'
                            : 'border-slate-200/80 dark:border-slate-800 hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-700'
                      )}
                    >
                      {/* Completion overlay badge */}
                      {progress >= 100 && (
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className={cn(
                            'font-extrabold text-xs px-2.5 py-1',
                            isActuallyLocked
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300'
                              : 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200'
                          )}>
                            Unit {unit.unit_number || index + 1}
                          </Badge>
                          <span className={cn('text-xs font-semibold flex items-center gap-1', isActuallyLocked ? 'text-slate-400' : 'text-slate-400')}>
                            {isActuallyLocked ? <><Lock className="w-3 h-3" /> Locked</> : <>{lessonsCount} Lessons</>}
                          </span>
                        </div>
                        <h3 className={cn(
                          'text-base font-extrabold transition-colors pr-8',
                          isActuallyLocked
                            ? 'text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400'
                        )}>
                          {unit.title}
                        </h3>
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Progress</span>
                            <span className={cn('font-bold', isActuallyLocked ? 'text-slate-400' : 'text-teal-600')}>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800" />
                        </div>
                      </div>

                      {isActuallyLocked ? (
                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Complete Unit {index} to unlock</span>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> ~{lessonsCount * 20}m total
                          </span>
                          <Button size="sm" className="bg-teal-600 group-hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-4">
                            {progress > 0 ? 'Continue' : 'Start'} <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* LEVEL 2: UNIT LESSONS LIST                                        */}
      {/* ================================================================= */}
      {viewLevel === 'unit_lessons' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setViewLevel('units')} className="h-10 w-10 rounded-2xl border-slate-200 dark:border-slate-800">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-0.5">
                  Unit {unitDetails?.unit_number} · {displaySubjectName}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  {unitLoading ? 'Loading...' : unitDetails?.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setViewLevel('lesson_workspace'); setActiveTab('flashcards'); }} 
                className="text-xs rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 font-bold"
              >
                <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                <span>Unit Flashcards</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setViewLevel('lesson_workspace'); setActiveTab('cheatsheet'); }} 
                className="text-xs rounded-xl border-slate-200 dark:border-slate-800 gap-1.5 font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Unit Cheat Sheet</span>
              </Button>
              {unitDetails && (
                <div className="text-right hidden md:block">
                  <div className="text-xs text-slate-400">{unitLessons.filter(l => l.progress?.lesson_completed).length}/{unitLessons.length} done</div>
                  <Progress value={unitDetails ? (unitLessons.filter(l => l.progress?.lesson_completed).length / Math.max(unitLessons.length, 1)) * 100 : 0} className="w-20 h-2 mt-1" />
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setViewLevel('units')} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
                All Units
              </Button>
            </div>
          </div>

          {/* Lessons list */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {unitLoading ? 'Loading lessons...' : `${unitLessons.length} Lessons`}
            </h2>

            {unitLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {unitLessons.map((lesson, idx) => {
                  const isCompleted = lesson.progress?.lesson_completed;
                  const isInProgress = !isCompleted && (lesson.progress?.video_completed || (lesson.progress?.quiz_attempts || 0) > 0);

                  // Unlock logic: first lesson always unlocked; subsequent lessons unlock only after previous is completed
                  const isFirst = idx === 0;
                  const prevLesson = idx > 0 ? unitLessons[idx - 1] : null;
                  const prevCompleted = prevLesson?.progress?.lesson_completed;
                  const isLessonUnlocked = isFirst || prevCompleted || isCompleted;
                  const isLessonLocked = !isLessonUnlocked;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isLessonLocked) {
                          toast.error('Complete the previous lesson first to unlock this one!');
                          return;
                        }
                        setSelectedLessonId(lesson.id);
                        const vidIdx = videoLessons.findIndex(v => v.id === lesson.id);
                        setActiveVideoIndex(vidIdx !== -1 ? vidIdx : 0);
                        setActiveTab('video');
                        setViewLevel('lesson_workspace');
                      }}
                      className={cn(
                        'bg-white dark:bg-slate-900 border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex items-center justify-between group',
                        isLessonLocked
                          ? 'border-slate-200/60 dark:border-slate-800/60 opacity-65 cursor-not-allowed'
                          : isCompleted
                            ? 'border-teal-200 dark:border-teal-700/60 hover:border-teal-400'
                            : 'border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-md'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Status icon */}
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform',
                          isLessonLocked
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : isCompleted
                              ? 'bg-teal-100 dark:bg-teal-950/60 text-teal-600'
                              : isInProgress
                                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-500'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'
                        )}>
                          {isLessonLocked ? <Lock className="w-4 h-4" /> :
                           isCompleted ? <CheckCircle className="w-5 h-5" /> :
                           <Play className="w-4 h-4 fill-current opacity-70" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-400">
                              {unitDetails?.unit_number}.{idx + 1}
                            </span>
                            {isLessonLocked ? (
                              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">🔒 Locked</Badge>
                            ) : isCompleted ? (
                              <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 text-[10px] font-semibold">✓ Completed</Badge>
                            ) : isInProgress ? (
                              <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 text-[10px] font-semibold">In Progress</Badge>
                            ) : idx === 0 ? (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-semibold">Start Here</Badge>
                            ) : null}
                          </div>
                          <h3 className={cn(
                            'text-sm sm:text-base font-bold transition-colors',
                            isLessonLocked
                              ? 'text-slate-400 dark:text-slate-600'
                              : isCompleted
                                ? 'text-teal-700 dark:text-teal-400'
                                : 'text-slate-900 dark:text-white group-hover:text-teal-600'
                          )}>
                            {lesson.title}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {lesson.duration_minutes || 20}m
                        </span>
                        {isLessonLocked ? (
                          <div className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <Button size="sm" className={cn(
                            'rounded-xl text-xs font-bold h-9 px-4',
                            isCompleted
                              ? 'bg-teal-100 text-teal-700 hover:bg-teal-200 border border-teal-200'
                              : 'bg-teal-600 group-hover:bg-teal-700 text-white'
                          )}>
                            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* LEVEL 3: LESSON WORKSPACE                                         */}
      {/* ================================================================= */}
      {viewLevel === 'lesson_workspace' && (
        <div className="space-y-6">
          {/* Lesson Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => selectedUnitId ? setViewLevel('unit_lessons') : setViewLevel('units')} className="h-10 w-10 rounded-2xl border-slate-200 dark:border-slate-800 shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    {displaySyllabusCode} · {unitDetails?.title || displaySubjectName}
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight line-clamp-2">
                    {currentTopicTitle}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Mark Complete button */}
                {currentLesson && (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isMarkingComplete || currentLesson.progress?.lesson_completed}
                    size="sm"
                    className={cn(
                      'rounded-xl font-bold text-xs h-9 px-4',
                      currentLesson.progress?.lesson_completed
                        ? 'bg-teal-100 text-teal-700 border border-teal-200 cursor-default'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                    )}
                  >
                    {currentLesson.progress?.lesson_completed ? (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Completed</>
                    ) : isMarkingComplete ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" /> Saving...</>
                    ) : (
                      <><CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Mark Complete</>
                    )}
                  </Button>
                )}

                {/* Prev/Next lesson navigation */}
                {unitLessons.length > 1 && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={() => {
                      const idx = unitLessons.findIndex(l => l.id === currentLesson?.id);
                      if (idx > 0) { setSelectedLessonId(unitLessons[idx - 1].id); setActiveVideoIndex(Math.max(0, activeVideoIndex - 1)); }
                    }} disabled={unitLessons.findIndex(l => l.id === currentLesson?.id) === 0} className="h-9 w-9 rounded-xl border-slate-200">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-slate-400 font-semibold px-1 hidden sm:block">
                      {unitLessons.findIndex(l => l.id === currentLesson?.id) + 1}/{unitLessons.length}
                    </span>
                    <Button variant="outline" size="icon" onClick={() => {
                      const idx = unitLessons.findIndex(l => l.id === currentLesson?.id);
                      const nextLesson = unitLessons[idx + 1];
                      // Only allow advancing if current lesson is completed
                      if (!currentLesson?.progress?.lesson_completed && idx < unitLessons.length - 1) {
                        toast.error('Complete this lesson first!');
                        return;
                      }
                      if (nextLesson) { setSelectedLessonId(nextLesson.id); setActiveVideoIndex(Math.min(videoLessons.length - 1, activeVideoIndex + 1)); }
                    }} disabled={unitLessons.findIndex(l => l.id === currentLesson?.id) === unitLessons.length - 1} className="h-9 w-9 rounded-xl border-slate-200">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* XP indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>+{(currentLesson as any)?.xp_reward || 50} XP on completion</span>
              {currentLesson?.progress?.lesson_completed && (
                <span className="text-teal-600 font-bold">· Already Earned ✓</span>
              )}
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Learn</div>
                <TabButton tab="video" icon={Video} label="Video Lesson" />
                <TabButton tab="notes" icon={BookOpen} label="Lesson Notes" />
                <TabButton tab="flashcards" icon={CreditCard} label="Flashcards" />
                <TabButton tab="cheatsheet" icon={FileText} label="Cheat Sheet" />
              </div>
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Practice</div>
                <TabButton tab="quiz" icon={Zap} label="Practice Quiz" sub="Opens Quiz Center" />
              </div>
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">AI Support</div>
                <TabButton tab="ai_tutor" icon={Bot} label="AI Tutor" />
              </div>
              <div className="space-y-1">
                <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Syllabus</div>
                <TabButton tab="syllabus" icon={GraduationCap} label="Syllabus Planner" />
                <TabButton tab="assessment" icon={BarChart3} label="Assessment" />
              </div>

              {/* Lesson list in sidebar */}
              {unitLessons.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Unit Lessons</div>
                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {unitLessons.map((l, idx) => {
                      const isCompleted = l.progress?.lesson_completed;
                      const isCurrent = l.id === currentLesson?.id;
                      // Same lock logic as level 2
                      const isFirst = idx === 0;
                      const prevLesson = idx > 0 ? unitLessons[idx - 1] : null;
                      const prevCompleted = prevLesson?.progress?.lesson_completed;
                      const isLocked = !isFirst && !prevCompleted && !isCompleted;

                      return (
                        <button
                          key={l.id}
                          onClick={() => {
                            if (isLocked) { toast.error('Complete the previous lesson first!'); return; }
                            setSelectedLessonId(l.id);
                            const vi = videoLessons.findIndex(v => v.id === l.id);
                            setActiveVideoIndex(vi !== -1 ? vi : 0);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all text-left',
                            isCurrent
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                              : isLocked
                                ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                          )}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center shrink-0',
                            isCompleted ? 'bg-teal-500 text-white' : isLocked ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-200 dark:bg-slate-700'
                          )}>
                            {isCompleted ? <CheckCircle className="w-2.5 h-2.5" /> : isLocked ? <Lock className="w-2.5 h-2.5 text-slate-400" /> : <span className="text-[8px] font-bold text-slate-500">{idx + 1}</span>}
                          </div>
                          <span className={cn('truncate', isCurrent && 'font-bold')}>{l.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT CONTENT */}
            <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">

              {/* VIDEO */}
              {activeTab === 'video' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Video Lesson</h2>
                    <p className="text-xs sm:text-sm text-slate-500">{currentTopicTitle}</p>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-black">
                    {currentVideo && <VideoPlayer videoUrl={currentVideo.video_url} lessonTitle={currentVideo.title} />}
                  </div>
                  {currentVideo && (
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Now Playing</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{currentVideo.title}</div>
                        {currentVideo.unit_title && <div className="text-xs text-slate-400">{currentVideo.unit_title}</div>}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-teal-600 text-white text-xs font-semibold px-2.5 py-1">{currentVideo.duration_minutes} mins</Badge>
                        {!currentLesson?.progress?.lesson_completed && (
                          <Button size="sm" onClick={handleMarkComplete} disabled={isMarkingComplete} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-8 px-3">
                            {isMarkingComplete ? 'Saving...' : '✓ Mark Done'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  {videoLessons.length > 1 && (
                    <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
                      <button onClick={() => setPlaylistOpen(!playlistOpen)} className="w-full flex items-center justify-between p-4 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-200">
                          <Layers className="w-4 h-4 text-teal-600" />
                          <span>Lesson Playlist ({videoLessons.length} Videos)</span>
                        </div>
                        {playlistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {playlistOpen && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900">
                          {videoLessons.map((vid, idx) => {
                            const unitLesson = unitLessons.find(l => l.id === vid.id);
                            const isDone = unitLesson?.progress?.lesson_completed;
                            const isActive = idx === activeVideoIndex;
                            return (
                              <div
                                key={vid.id}
                                onClick={() => { setActiveVideoIndex(idx); setSelectedLessonId(vid.id); }}
                                className={cn(
                                  'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                                  isActive ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-xs' : 'border-slate-200 dark:border-slate-800 hover:border-teal-300'
                                )}
                              >
                                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', isDone ? 'bg-teal-100 text-teal-600' : 'bg-teal-500/10 text-teal-600')}>
                                  {isDone ? <CheckCircle className="w-5 h-5" /> : <Play className="w-4 h-4 fill-teal-600/20" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{vid.title}</div>
                                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                                    <span>{vid.duration_minutes} mins</span>
                                    {isActive && <span className="text-teal-600 font-semibold">• Now Playing</span>}
                                    {isDone && !isActive && <span className="text-teal-600 font-semibold">• Done ✓</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Lesson Notes</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Study notes for {currentTopicTitle}.</p>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4 text-sm leading-relaxed">
                    <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800">
                      <h3 className="text-sm font-bold text-teal-800 dark:text-teal-300 mb-2">Key Syllabus Objectives</h3>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        <li>Understand and apply the core concepts of {currentTopicTitle}.</li>
                        <li>Demonstrate accurate methodology in Cambridge mark scheme style.</li>
                        <li>Identify common exam pitfalls and apply correct techniques.</li>
                      </ul>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Core Concepts</h4>
                    <p>This topic is an essential part of the Cambridge {displaySubjectName} syllabus. Mastery requires both conceptual understanding and procedural fluency — the ability to apply methods accurately under timed exam conditions.</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Cambridge Exam Technique</h4>
                    <p>Always show complete step-by-step working. Stating the final answer without the substitution step can cause loss of Method marks. Use correct significant figures and always double-check unit labels.</p>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                      <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">Mark Scheme Guide</div>
                      <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                        <li>• <strong>M marks</strong>: Method marks awarded for correct approach</li>
                        <li>• <strong>A marks</strong>: Accuracy marks for the correct final answer</li>
                        <li>• <strong>B marks</strong>: Independent marks not requiring method</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => setActiveTab('video')} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl">
                      Watch Video <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                    <Button onClick={goToQuiz} variant="outline" className="rounded-xl border-slate-200">Practice Quiz</Button>
                  </div>
                </div>
              )}

              {/* FLASHCARDS */}
              {activeTab === 'flashcards' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                          {displaySubjectName} · {currentTopicTitle}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {flashcards.length > 0 ? `Card ${currentCardIndex + 1} of ${flashcards.length}` : 'Revision Cards'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Topic Flashcards</h2>
                      <p className="text-xs text-slate-500">Test your recall of key terms, mechanisms, and rules for this specific topic.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5));
                          setCurrentCardIndex(0);
                          setCardFlipped(false);
                          toast.success('Cards shuffled!');
                        }}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-xs gap-1.5 h-8 font-semibold"
                      >
                        <Shuffle className="w-3.5 h-3.5 text-teal-600" />
                        <span>Shuffle</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentCardIndex(0);
                          setCardFlipped(false);
                        }}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-xs gap-1.5 h-8 font-semibold"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Restart</span>
                      </Button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {flashcards.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>Progress: Card {currentCardIndex + 1} of {flashcards.length}</span>
                        <span>{Object.values(masteredCards).filter(Boolean).length} Mastered</span>
                      </div>
                      <Progress value={((currentCardIndex + 1) / flashcards.length) * 100} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  )}

                  {loadingFlashcards ? (
                    <div className="min-h-[260px] rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 animate-pulse">Loading flashcards...</div>
                  ) : flashcards.length === 0 ? (
                    <div className="min-h-[220px] rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                      <CreditCard className="w-10 h-10 mb-2 text-slate-300" />
                      <p className="text-sm font-semibold">No flashcards found for this topic.</p>
                      <p className="text-xs text-slate-400 mt-1">Admin can add custom cards from the Admin Dashboard.</p>
                    </div>
                  ) : (
                    <>
                      {/* 3D-feel Flashcard */}
                      {(() => {
                        const curCard = flashcards[currentCardIndex];
                        const cardId = curCard?.id || `card_${currentCardIndex}`;
                        const isMastered = !!masteredCards[cardId];

                        return (
                          <div className="space-y-4">
                            <div
                              onClick={() => { setCardFlipped(!cardFlipped); setShowHint(false); }}
                              className={`min-h-[260px] rounded-3xl border-2 p-8 sm:p-10 flex flex-col items-center justify-between text-center cursor-pointer shadow-sm transition-all hover:shadow-md hover:scale-[1.008] select-none ${
                                cardFlipped
                                  ? 'border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-slate-800 dark:to-slate-900'
                                  : 'border-teal-300 dark:border-teal-700 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/30 dark:from-slate-800 dark:to-slate-900'
                              }`}
                            >
                              <div className="w-full flex items-center justify-between">
                                <span className={`text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  cardFlipped 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                                    : 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                                }`}>
                                  {cardFlipped ? '✓ Cambridge Answer & Explanation' : 'Question / Prompt'}
                                </span>
                                {isMastered && (
                                  <Badge className="bg-emerald-500 text-white text-[10px] font-bold gap-1">
                                    <Check className="w-3 h-3" /> Mastered
                                  </Badge>
                                )}
                              </div>

                              <div className="my-auto py-6">
                                <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white max-w-xl leading-relaxed whitespace-pre-line">
                                  {cardFlipped ? curCard?.a : curCard?.q}
                                </div>
                                {!cardFlipped && curCard?.hint && showHint && (
                                  <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs text-amber-800 dark:text-amber-300 max-w-md mx-auto">
                                    💡 <strong>Hint:</strong> {curCard.hint}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>(Click card to flip)</span>
                                {!cardFlipped && curCard?.hint && !showHint && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                                    className="text-amber-600 hover:text-amber-700 underline font-semibold flex items-center gap-1"
                                  >
                                    <HelpCircle className="w-3 h-3" /> Need a hint?
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Flashcard Bottom Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setMasteredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
                                    toast.success(isMastered ? 'Marked for review' : 'Marked as mastered! +5 XP');
                                  }}
                                  className={`rounded-xl text-xs font-bold gap-1.5 h-9 flex-1 sm:flex-initial ${
                                    isMastered ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40' : 'border-slate-200'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{isMastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                                </Button>
                              </div>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => { setCurrentCardIndex(p => Math.max(0, p - 1)); setCardFlipped(false); setShowHint(false); }}
                                  disabled={currentCardIndex === 0}
                                  className="rounded-xl border-slate-200 text-xs font-semibold h-9 px-4"
                                >
                                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                                </Button>
                                <Button
                                  onClick={() => { setCurrentCardIndex(p => Math.min(flashcards.length - 1, p + 1)); setCardFlipped(false); setShowHint(false); }}
                                  disabled={currentCardIndex === flashcards.length - 1}
                                  className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold h-9 px-5"
                                >
                                  <span>Next Card</span>
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* CHEAT SHEET */}
              {activeTab === 'cheatsheet' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                          {displaySubjectName} · Cambridge Syllabus
                        </Badge>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Exam Cheat Sheet</h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Essential formulae, Cambridge mark scheme rules, and examiner strategies for <strong>{displaySubjectName}</strong>{currentTopicTitle ? ` · ${currentTopicTitle}` : ''}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!cheatsheet) return;
                          let text = `# ${displaySubjectName}: ${currentTopicTitle} - Exam Cheat Sheet\n\n`;
                          text += `## Key Formulae & Definitions\n${cheatsheet.key_formulae.map(f => '- ' + f).join('\n')}\n\n`;
                          text += `## Cambridge Exam Rules\n${cheatsheet.exam_rules.map(r => '- ' + r).join('\n')}\n\n`;
                          text += `## Common Pitfalls to Avoid\n${cheatsheet.common_pitfalls.map(p => '- ' + p).join('\n')}\n\n`;
                          if (cheatsheet.examiner_tips?.length) {
                            text += `## Examiner Tips & Keywords\n${cheatsheet.examiner_tips.map(t => '- ' + t).join('\n')}\n`;
                          }
                          navigator.clipboard.writeText(text);
                          toast.success('Cheat sheet copied to clipboard!');
                        }}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-xs gap-1.5 h-8 font-semibold"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.print()}
                        className="rounded-xl border-slate-200 dark:border-slate-800 text-xs gap-1.5 h-8 font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-500" />
                        <span>Print</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Key Formulae */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Key Formulae & Definitions
                      </div>
                      <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300 font-mono">
                        {cheatsheet?.key_formulae && cheatsheet.key_formulae.length > 0 ? (
                          cheatsheet.key_formulae.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-teal-500 font-bold">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))
                        ) : (
                          <li>• Master core definitions and formulas for this topic.</li>
                        )}
                      </ul>
                    </div>

                    {/* Cambridge Exam Rules */}
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-xs">
                      <div className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" /> Cambridge Exam Rules
                      </div>
                      <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                        {cheatsheet?.exam_rules && cheatsheet.exam_rules.length > 0 ? (
                          cheatsheet.exam_rules.map((rule, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500 font-bold">•</span>
                              <span className="leading-relaxed">{rule}</span>
                            </li>
                          ))
                        ) : (
                          <li>• Show step-by-step working and state proper units.</li>
                        )}
                      </ul>
                    </div>

                    {/* Common Mistakes to Avoid */}
                    <div className="p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 sm:col-span-2 shadow-xs">
                      <div className="font-bold text-sm text-rose-800 dark:text-rose-300 mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" /> Common Pitfalls to Avoid
                      </div>
                      <ul className="text-xs space-y-2 text-rose-700 dark:text-rose-400">
                        {cheatsheet?.common_pitfalls && cheatsheet.common_pitfalls.length > 0 ? (
                          cheatsheet.common_pitfalls.map((pitfall, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-rose-500 font-bold">•</span>
                              <span className="leading-relaxed">{pitfall}</span>
                            </li>
                          ))
                        ) : (
                          <li>• Avoid premature rounding and always show formula substitutions.</li>
                        )}
                      </ul>
                    </div>

                    {/* Examiner Tips if present */}
                    {cheatsheet?.examiner_tips && cheatsheet.examiner_tips.length > 0 && (
                      <div className="p-5 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 sm:col-span-2 shadow-xs">
                        <div className="font-bold text-sm text-teal-800 dark:text-teal-300 mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-500" /> Examiner Tips & Keywords
                        </div>
                        <ul className="text-xs space-y-2 text-teal-700 dark:text-teal-400">
                          {cheatsheet.examiner_tips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-teal-500 font-bold">•</span>
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRACTICE QUIZ */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Practice Quiz</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Test your knowledge in the Quiz Center — {displaySubjectName}.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-cyan-500/10 border border-teal-500/30 text-center space-y-5">
                    <Zap className="w-12 h-12 text-amber-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ready to test your knowledge?</h3>
                      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                        Opens Quiz Center with <strong>{displaySubjectName}</strong>{unitDetails ? ` · ${unitDetails.title}` : ''} pre-selected.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={goToQuiz} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl px-8 shadow-sm">
                        <Zap className="w-4 h-4 mr-1.5" /> Start Quick Quiz
                      </Button>
                      <Button onClick={() => { const p = new URLSearchParams(); if (resolvedSubjectId) p.set('subject_id', resolvedSubjectId); navigate(`/quiz?type=timed&${p.toString()}`); }} variant="outline" className="rounded-xl border-slate-200 font-bold">
                        Timed Practice Test
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400">Earn up to +40 XP · Cambridge exam format</p>
                  </div>
                </div>
              )}

              {/* AI TUTOR */}
              {activeTab === 'ai_tutor' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Cambridge AI Tutor</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Ask questions about {displaySubjectName}: {currentTopicTitle}.</p>
                  </div>
                  <EmbeddedAIChatModel
                    subjectContext={`${displaySubjectName} (${displaySyllabusCode})`}
                    topicContext={currentTopicTitle}
                    programmeContext={programmeLabel}
                  />
                </div>
              )}

              {/* SYLLABUS */}
              {activeTab === 'syllabus' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Syllabus Planner</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Track your coverage of the full {displaySubjectName} Cambridge syllabus.</p>
                  </div>
                  {resolvedSubjectId ? (
                    <SyllabusPlanner subjectId={resolvedSubjectId} />
                  ) : (
                    <div className="p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">Loading syllabus data...</div>
                  )}
                </div>
              )}

              {/* ASSESSMENT */}
              {activeTab === 'assessment' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-1">Assessment & Mastery</h2>
                    <p className="text-xs sm:text-sm text-slate-500">Your real performance for {displaySubjectName}.</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-500/10 to-primary/10 border border-teal-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                        <Trophy className="w-5 h-5 text-teal-600" /> Overall Score
                      </div>
                      <Badge className="bg-teal-600 text-white font-bold text-xs px-3 py-1">Grade A* (Predicted)</Badge>
                    </div>
                    <Progress value={overallAssessmentScore} className="h-4 bg-slate-200 dark:bg-slate-700" />
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Current: {overallAssessmentScore}%</span>
                      <span>Target: 90% (Grade A*)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Quizzes Done', value: quizzesCount, max: 10, suffix: '' },
                      { label: 'Mock Exams', value: examsCount, max: 5, suffix: '' },
                      { label: 'Avg Accuracy', value: avgQuizScore, max: 100, suffix: '%' },
                    ].map((stat, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                        <div className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}{stat.suffix} {!stat.suffix && <span className="text-sm font-normal text-slate-400">/ {stat.max}</span>}</div>
                        <Progress value={(stat.value / stat.max) * 100} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
