import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Unit, Lesson, UnitProgress, LessonProgress } from '@/types/curriculum';

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
  isUnlocked: boolean;
}

export interface UnitDetailsData {
  unit: Unit | null;
  lessons: LessonWithProgress[];
  unitProgress: UnitProgress | null;
  nextUnit: Unit | null;
  previousUnit: Unit | null;
}

export const useUnitDetails = (unitId: string | undefined) => {
  const { user } = useAuth();
  const [data, setData] = useState<UnitDetailsData>({
    unit: null,
    lessons: [],
    unitProgress: null,
    nextUnit: null,
    previousUnit: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unitId) {
      fetchUnitDetails();
    }
  }, [unitId, user]);

  // Realtime: refresh when admin edits units or lessons
  useEffect(() => {
    if (!unitId) return;
    const ch = supabase
      .channel(`unit-admin-changes-${unitId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units', filter: `id=eq.${unitId}` }, fetchUnitDetails)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons', filter: `unit_id=eq.${unitId}` }, fetchUnitDetails)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [unitId]);

  const fetchUnitDetails = async () => {
    if (!unitId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch unit
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('*')
        .eq('id', unitId)
        .single();

      if (unitError || !unit) {
        setError('Unit not found');
        setLoading(false);
        return;
      }

      // Fetch lessons for this unit
      let { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('unit_id', unitId)
        .order('lesson_number');

      if (!lessons) {
        lessons = [];
      }

      // Fetch adjacent units
      const { data: allUnits } = await supabase
        .from('units')
        .select('*')
        .eq('subject_id', unit.subject_id)
        .order('unit_number');

      const currentIndex = allUnits?.findIndex(u => u.id === unitId) ?? -1;
      const previousUnit = currentIndex > 0 ? (allUnits?.[currentIndex - 1] as Unit) : null;
      const nextUnit = currentIndex < (allUnits?.length ?? 0) - 1 ? (allUnits?.[currentIndex + 1] as Unit) : null;

      // Fetch user progress if logged in
      let unitProgress: UnitProgress | null = null;
      let lessonProgressData: LessonProgress[] = [];

      if (user) {
        const { data: unitProgressResult } = await supabase
          .from('unit_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('unit_id', unitId)
          .maybeSingle();

        unitProgress = unitProgressResult as UnitProgress | null;

        const lessonIds = lessons?.map(l => l.id) || [];
        if (lessonIds.length > 0) {
          const { data: lessonProgress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          lessonProgressData = (lessonProgress as LessonProgress[]) || [];
        }
      }

      // Combine lessons with progress and unlock status
      const lessonsWithProgress: LessonWithProgress[] = (lessons as Lesson[] || []).map((lesson, index) => {
        const progress = lessonProgressData.find(lp => lp.lesson_id === lesson.id);
        
        // First lesson always unlocked, others require previous lesson completed
        const isFirstLesson = index === 0;
        const previousLesson = index > 0 ? lessons[index - 1] : null;
        const previousLessonProgress = previousLesson 
          ? lessonProgressData.find(lp => lp.lesson_id === previousLesson.id)
          : null;
        
        const isUnlocked = isFirstLesson || (previousLessonProgress?.lesson_completed ?? false);

        return {
          ...lesson,
          progress,
          isUnlocked
        };
      });

      setData({
        unit: unit as Unit,
        lessons: lessonsWithProgress,
        unitProgress,
        nextUnit,
        previousUnit
      });
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUnitStats = () => {
    const totalLessons = data.lessons.length;
    const completedLessons = data.lessons.filter(l => l.progress?.lesson_completed).length;
    const totalXp = data.lessons.reduce((sum, l) => sum + l.xp_reward, 0);
    const earnedXp = data.lessons.reduce((sum, l) => sum + (l.progress?.quiz_xp_earned || 0) + (l.progress?.practice_xp_earned || 0), 0);
    const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, totalXp, earnedXp, progress };
  };

  return {
    ...data,
    loading,
    error,
    refetch: fetchUnitDetails,
    getUnitStats
  };
};
