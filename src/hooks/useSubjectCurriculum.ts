import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { adminDataStore } from '@/lib/adminDataStore';
import type { Unit, Lesson, UnitProgress, LessonProgress, UnitWithProgress } from '@/types/curriculum';

export const useSubjectCurriculum = (subjectName: string, qualification?: string) => {
  const { user } = useAuth();
  const [units, setUnits] = useState<UnitWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [exactSubjectName, setExactSubjectName] = useState<string | null>(null);

  useEffect(() => {
    fetchCurriculum();
  }, [subjectName, user]);

  // Realtime: refresh when admin edits subjects, units or lessons
  useEffect(() => {
    const handleAdminUpdate = () => fetchCurriculum();
    window.addEventListener('levelhub:admin_data_updated', handleAdminUpdate);
    window.addEventListener('levelhub:lessons_updated', handleAdminUpdate);
    window.addEventListener('levelhub:units_updated', handleAdminUpdate);

    const ch = supabase
      .channel('curriculum-admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subjects' }, fetchCurriculum)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, fetchCurriculum)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, fetchCurriculum)
      .subscribe();

    return () => { 
      window.removeEventListener('levelhub:admin_data_updated', handleAdminUpdate);
      window.removeEventListener('levelhub:lessons_updated', handleAdminUpdate);
      window.removeEventListener('levelhub:units_updated', handleAdminUpdate);
      supabase.removeChannel(ch); 
    };
  }, []);

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check if subjectName is a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subjectName);
      let subject: any = null;

      if (isUuid) {
        const { data: byId } = await supabase
          .from('subjects')
          .select('id, name, subject_code, qualification')
          .eq('id', subjectName)
          .maybeSingle();
        if (byId) subject = byId;
      }

      // 1.5 Check if subjectName is a subject_code
      if (!subject) {
        let codeQuery = supabase
          .from('subjects')
          .select('id, name, subject_code, qualification')
          .eq('subject_code', subjectName);
        if (qualification) {
          codeQuery = codeQuery.eq('qualification', qualification);
        }
        const { data: byCode } = await codeQuery.limit(1).maybeSingle();
        if (byCode) subject = byCode;
      }

      // 2. Get subject by name
      if (!subject) {
        let query = supabase
          .from('subjects')
          .select('id, name, subject_code, qualification')
          .ilike('name', subjectName);
          
        if (qualification) {
          query = query.eq('qualification', qualification);
        } else {
          query = query.neq('qualification', 'a_level');
        }

        const { data: byName } = await query.limit(1).maybeSingle();
        if (byName) subject = byName;
      }

      // 3. Fallback with wildcard matching
      if (!subject) {
        const fallbackQuery = subjectName.replace(/-/g, ' ').replace(/ /g, '%');
        
        let fallbackDbQuery = supabase
          .from('subjects')
          .select('id, name, subject_code, qualification')
          .ilike('name', `%${fallbackQuery}%`);
          
        if (qualification) {
          fallbackDbQuery = fallbackDbQuery.eq('qualification', qualification);
        } else {
          fallbackDbQuery = fallbackDbQuery.neq('qualification', 'a_level');
        }

        const { data: fallbackSubject } = await fallbackDbQuery
          .limit(1)
          .maybeSingle();
          
        if (fallbackSubject) {
          subject = fallbackSubject;
        } else {
          // Last resort fallback: try any subject matching the first word within qualification
          const firstWord = subjectName.split(/[- ]/)[0];
          let lastQuery = supabase
            .from('subjects')
            .select('id, name, subject_code, qualification')
            .ilike('name', `%${firstWord}%`);
            
          if (qualification) {
            lastQuery = lastQuery.eq('qualification', qualification);
          } else {
            lastQuery = lastQuery.neq('qualification', 'a_level');
          }

          const { data: anySubject } = await lastQuery.limit(1).maybeSingle();

          if (anySubject) {
            subject = anySubject;
          } else {
            setError(`Subject not found (${subjectName})`);
            setLoading(false);
            return;
          }
        }
      }

      setSubjectId(subject.id);
      setExactSubjectName(subject.name);

      // Fetch units for this subject
      const { data: rawUnitsData, error: unitsError } = await supabase
        .from('units')
        .select('*')
        .eq('subject_id', subject.id)
        .order('unit_number');

      if (unitsError) {
        setError('Failed to fetch units');
        setLoading(false);
        return;
      }

      // Merge with admin overrides
      const unitsData = adminDataStore.applyUnitOverrides(rawUnitsData || [], subject.id);

      // Fetch all lessons for these units
      const unitIds = unitsData?.map(u => u.id) || [];
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .in('unit_id', unitIds)
        .order('lesson_number');

      // Fetch user progress if logged in
      let unitProgressData: UnitProgress[] = [];
      let lessonProgressData: LessonProgress[] = [];

      if (user) {
        const { data: unitProgress } = await supabase
          .from('unit_progress')
          .select('*')
          .eq('user_id', user.id)
          .in('unit_id', unitIds);

        unitProgressData = (unitProgress as UnitProgress[]) || [];

        const lessonIds = lessonsData?.map(l => l.id) || [];
        if (lessonIds.length > 0) {
          const { data: lessonProgress } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          lessonProgressData = (lessonProgress as LessonProgress[]) || [];
        }
      }

      // Combine data with progress
      const unitsWithProgress: UnitWithProgress[] = (unitsData as Unit[] || []).map((unit, index) => {
        let rawUnitLessons = (lessonsData as Lesson[] || []).filter(l => l.unit_id === unit.id);
        
        // Real database lessons only; do not fabricate fake lessons or placeholder videos
        const unitLessons = adminDataStore.applyLessonOverrides(rawUnitLessons, unit.id);

        const progress = unitProgressData.find(p => p.unit_id === unit.id);
        const lessonsProgress = lessonProgressData.filter(lp => 
          unitLessons.some(l => l.id === lp.lesson_id)
        );

        // Calculate if unit is unlocked (first unit always unlocked)
        const isFirstUnit = index === 0;
        const previousUnit = index > 0 ? unitsData[index - 1] : null;
        const previousUnitProgress = previousUnit 
          ? unitProgressData.find(p => p.unit_id === previousUnit.id)
          : null;
        
        const isUnlocked = isFirstUnit || 
          (previousUnitProgress?.progress_percentage ?? 0) >= 80 ||
          progress?.is_unlocked;

        return {
          ...unit,
          lessons: unitLessons,
          progress: progress || {
            id: '',
            user_id: user?.id || '',
            unit_id: unit.id,
            lessons_completed: 0,
            total_lessons: unitLessons.length,
            progress_percentage: 0,
            total_xp_earned: 0,
            average_quiz_score: null,
            is_unlocked: isUnlocked,
            unlocked_at: null,
            unit_quiz_available: false,
            unit_quiz_score: null,
            unit_quiz_completed_at: null,
            created_at: '',
            updated_at: ''
          },
          lessonsProgress
        };
      });

      setUnits(unitsWithProgress);
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalLessons = units.reduce((sum, u) => sum + u.lessons.length, 0);
    const completedLessons = units.reduce((sum, u) => sum + (u.progress?.lessons_completed || 0), 0);
    const totalXp = units.reduce((sum, u) => sum + u.total_xp, 0);
    const earnedXp = units.reduce((sum, u) => sum + (u.progress?.total_xp_earned || 0), 0);
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return { totalLessons, completedLessons, totalXp, earnedXp, overallProgress };
  };

  return { 
    units, 
    loading, 
    error, 
    subjectId,
    exactSubjectName,
    refetch: fetchCurriculum,
    getTotalStats 
  };
};
