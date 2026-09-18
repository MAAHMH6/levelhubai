import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';


interface AIQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic?: string;
}

interface AINote {
  id: string;
  user_id: string;
  lesson_id: string;
  ai_generated_content: string | null;
  user_personal_notes: string | null;
  generated_at: string | null;
}

interface AIQuiz {
  id: string;
  user_id: string;
  lesson_id: string;
  questions: AIQuestion[];
  is_ready: boolean;
  generated_at: string | null;
}

interface AIPractice {
  id: string;
  user_id: string;
  lesson_id: string;
  questions: AIQuestion[];
  is_ready: boolean;
  weak_topics: string[] | null;
  generated_at: string | null;
}

export function useAINotes(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ['ai-notes', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;
      const { data, error } = await supabase
        .from('ai_notes')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as AINote | null;
    },
    enabled: !!lessonId && !!user?.id,
  });

  const generateNotes = useMutation({
    mutationFn: async (lessonTitle: string) => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ lessonId, lessonTitle, userId: user.id }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate notes');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-notes', lessonId] });
      toast.success('Notes generated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate notes');
    },
  });

  const updatePersonalNotes = useMutation({
    mutationFn: async (notes: string) => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const { error } = await supabase
        .from('ai_notes')
        .update({ 
          user_personal_notes: notes,
          last_edited_at: new Date().toISOString(),
        })
        .eq('lesson_id', lessonId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-notes', lessonId] });
    },
  });

  return {
    notes: notesQuery.data,
    isLoading: notesQuery.isLoading,
    generateNotes,
    updatePersonalNotes,
  };
}

export function useAIQuiz(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const quizQuery = useQuery({
    queryKey: ['ai-quiz', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_rejected', false)
        .limit(15);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const questions = data.map(q => ({
        id: q.id,
        question: q.question_text,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correct_answer) >= 0 ? q.options.indexOf(q.correct_answer) : 0,
        explanation: q.explanation,
        topic: q.topic_id
      }));

      return {
        id: `quiz-${lessonId}`,
        user_id: user.id,
        lesson_id: lessonId,
        questions: questions,
        is_ready: true,
        generated_at: new Date().toISOString()
      } as AIQuiz;
    },
    enabled: !!lessonId && !!user?.id,
  });

  const generateQuiz = useMutation({
    mutationFn: async (lessonTitle: string) => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const { data: subjectData } = await supabase
        .from('lessons')
        .select('units(subject_id)')
        .eq('id', lessonId)
        .single();
        
      const subjectId = subjectData?.units?.subject_id;
      if (!subjectId) throw new Error("Could not find subject for lesson");
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ 
            scope: 'lesson',
            subject_id: subjectId,
            lesson_id: lessonId,
            question_count: 15,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate quiz');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-quiz', lessonId] });
      toast.success('Quiz generated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate quiz');
    },
  });

  return {
    quiz: quizQuery.data,
    isLoading: quizQuery.isLoading,
    generateQuiz,
  };
}

export function useAIPractice(lessonId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const practiceQuery = useQuery({
    queryKey: ['ai-practice', lessonId, user?.id],
    queryFn: async () => {
      if (!lessonId || !user?.id) return null;
      
      // For practice, we fetch up to 25 questions
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('is_rejected', false)
        .limit(25);
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      const questions = data.map(q => ({
        id: q.id,
        question: q.question_text,
        options: q.options,
        correctAnswer: q.options.indexOf(q.correct_answer) >= 0 ? q.options.indexOf(q.correct_answer) : 0,
        explanation: q.explanation,
        topic: q.topic_id
      }));

      return {
        id: `practice-${lessonId}`,
        user_id: user.id,
        lesson_id: lessonId,
        questions: questions,
        is_ready: true,
        weak_topics: null,
        generated_at: new Date().toISOString()
      } as AIPractice;
    },
    enabled: !!lessonId && !!user?.id,
  });

  const generatePractice = useMutation({
    mutationFn: async ({ lessonTitle, weakTopics }: { lessonTitle: string; weakTopics?: string[] }) => {
      if (!lessonId || !user?.id) throw new Error('Missing lesson or user');
      
      const { data: subjectData } = await supabase
        .from('lessons')
        .select('units(subject_id)')
        .eq('id', lessonId)
        .single();
        
      const subjectId = subjectData?.units?.subject_id;
      if (!subjectId) throw new Error("Could not find subject for lesson");
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rag-quiz`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ 
            scope: 'lesson',
            subject_id: subjectId,
            lesson_id: lessonId,
            question_count: 25,
            weak_topics: weakTopics,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate practice');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-practice', lessonId] });
      toast.success('Practice questions generated successfully!');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to generate practice');
    },
  });

  return {
    practice: practiceQuery.data,
    isLoading: practiceQuery.isLoading,
    generatePractice,
  };
}
