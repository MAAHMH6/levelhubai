import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Lesson, LessonProgress } from '@/types/curriculum';

export function useLessonDetails(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const lessonQuery = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      if (!lessonId) return null;
      const { data, error } = await supabase
        .from('lessons')
        .select('*, units(title, subject_id, subjects(name))')
        .eq('id', lessonId)
        .single();
      
      if (error) throw error;
      return data as Lesson & { units: { title: string; subject_id: string; subjects: { name: string } } };
    },
    enabled: !!lessonId,
  });

  const progressQuery = useQuery({
    queryKey: ['lesson-progress', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as LessonProgress | null;
    },
    enabled: !!lessonId && !!user?.id,
  });

  const initializeProgress = useMutation({
    mutationFn: async () => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const { data: existing } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) return existing;

      const { data, error } = await supabase
        .from('lesson_progress')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
    },
  });

  const updateVideoProgress = useMutation({
    mutationFn: async ({ 
      position, 
      percentage, 
      completed 
    }: { 
      position: number; 
      percentage: number; 
      completed?: boolean;
    }) => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const updates: Record<string, unknown> = {
        video_last_position_seconds: position,
        video_watch_percentage: percentage,
        last_accessed_at: new Date().toISOString(),
      };

      if (completed) {
        updates.video_completed = true;
        updates.video_completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('lesson_progress')
        .update(updates)
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
    },
  });

  const markContentGenerated = useMutation({
    mutationFn: async (contentType: 'notes' | 'quiz' | 'practice') => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const field = `${contentType}_generated` as const;
      const { error } = await supabase
        .from('lesson_progress')
        .update({ [field]: true })
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
    },
  });

  const markLessonComplete = useMutation({
    mutationFn: async () => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');

      // Get lesson info for XP and unit_id
      const { data: lessonData, error: lessonErr } = await supabase
        .from('lessons')
        .select('xp_reward, unit_id')
        .eq('id', lessonId)
        .single();
      if (lessonErr || !lessonData) throw new Error('Could not fetch lesson');

      const xpToAward = lessonData.xp_reward || 50;

      // Mark lesson as completed
      const { error: progressErr } = await supabase
        .from('lesson_progress')
        .update({
          lesson_completed: true,
          lesson_completed_at: new Date().toISOString(),
          video_completed: true,
          video_completed_at: new Date().toISOString(),
          video_watch_percentage: 100,
        })
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id);
      if (progressErr) throw progressErr;

      // Award XP to profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp_points')
        .eq('id', user.id)
        .single();
      if (profile) {
        await supabase
          .from('profiles')
          .update({ xp_points: profile.xp_points + xpToAward })
          .eq('id', user.id);
      }

      // Update unit_progress
      const unitId = lessonData.unit_id;
      // Count total and completed lessons for this unit
      const { data: allLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('unit_id', unitId);

      const lessonIds = (allLessons || []).map(l => l.id);
      const { data: completedLessons } = await supabase
        .from('lesson_progress')
        .select('id')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds)
        .eq('lesson_completed', true);

      const totalLessons = lessonIds.length;
      const completedCount = completedLessons?.length || 0;
      const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      // Upsert unit_progress
      const { data: existingUP } = await supabase
        .from('unit_progress')
        .select('id')
        .eq('unit_id', unitId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingUP) {
        await supabase
          .from('unit_progress')
          .update({
            lessons_completed: completedCount,
            total_lessons: totalLessons,
            progress_percentage: progressPct,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUP.id);
      } else {
        await supabase
          .from('unit_progress')
          .insert({
            unit_id: unitId,
            user_id: user.id,
            lessons_completed: completedCount,
            total_lessons: totalLessons,
            progress_percentage: progressPct,
            is_unlocked: true,
          });
      }

      return { xpToAward };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['unit-progress'] });
      queryClient.invalidateQueries({ queryKey: ['lectures-watched'] });
      return result;
    },
  });

  return {
    lesson: lessonQuery.data,
    isLoadingLesson: lessonQuery.isLoading,
    progress: progressQuery.data,
    isLoadingProgress: progressQuery.isLoading,
    initializeProgress,
    updateVideoProgress,
    markContentGenerated,
    markLessonComplete,
  };
}
