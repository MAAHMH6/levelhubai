import { createClient } from '@supabase/supabase-js';
import { supabase as mainSupabase } from './client';

// New Feature Database Credentials
const NEW_SUPABASE_URL = import.meta.env.VITE_NEW_SUPABASE_URL || 'https://jqscjbaondlknhrcbkuh.supabase.co';
const NEW_SUPABASE_KEY = import.meta.env.VITE_NEW_SUPABASE_PUBLISHABLE_KEY || '';

export const featureSupabase = createClient(NEW_SUPABASE_URL, NEW_SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// TYPES FOR NEW FEATURES
export interface StudyPlanItem {
  id: string;
  user_id: string;
  programme: string;
  subject_id: string;
  subject_name: string;
  topic_id?: string;
  topic_title?: string;
  scheduled_date: string;
  duration_minutes: number;
  activity_type: 'notes' | 'video' | 'quiz' | 'flashcards' | 'past_paper' | 'ai_tutor' | 'mock_exam';
  completed: boolean;
  notes?: string;
  created_at: string;
}

export interface StudentMistake {
  id: string;
  user_id: string;
  programme: string;
  subject_id: string;
  subject_name: string;
  unit_title?: string;
  topic_title?: string;
  question_text: string;
  student_answer: string;
  correct_answer: string;
  explanation?: string;
  marks_lost?: number;
  resolved: boolean;
  created_at: string;
}

export interface SubjectAIContext {
  id?: string;
  user_id: string;
  programme: string;
  subject_id: string;
  subject_name: string;
  weak_topics: string[];
  strong_topics: string[];
  recent_accuracy: number;
  study_notes_summary?: string;
  last_interaction?: string;
  updated_at: string;
}

export interface DailyUsageLimit {
  ai_tutor_used: number;
  ai_tutor_limit: number;
  quiz_gen_used: number;
  quiz_gen_limit: number;
  mock_exam_used: number;
  mock_exam_limit: number;
  challenge_used: number;
  challenge_limit: number;
  writing_used: number;
  writing_limit: number;
  date: string;
}

// STORAGE HELPERS WITH LOCAL FALLBACK
const LOCAL_STORAGE_KEYS = {
  PLANS: 'levelhub_feature_plans',
  MISTAKES: 'levelhub_feature_mistakes',
  AI_CONTEXTS: 'levelhub_feature_ai_contexts',
  USAGE_LIMITS: 'levelhub_feature_usage_limits',
  STUDENT_SETTINGS: 'levelhub_feature_student_settings'
};

export const featureStorage = {
  // Study Plans
  async getStudyPlans(userId: string, programme?: string): Promise<StudyPlanItem[]> {
    try {
      let { data, error } = await (mainSupabase as any)
        .from('study_plans')
        .select('*')
        .eq('user_id', userId);
      if (!error && data && data.length > 0) return data;

      const res = await featureSupabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId);
      if (!res.error && res.data && res.data.length > 0) return res.data;
    } catch {
      // Fall through to local fallback
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PLANS);
    if (!raw) return [];
    const all: StudyPlanItem[] = JSON.parse(raw);
    return all.filter(p => p.user_id === userId && (!programme || p.programme === programme));
  },

  async saveStudyPlan(item: Omit<StudyPlanItem, 'id' | 'created_at'>): Promise<StudyPlanItem> {
    const newItem: StudyPlanItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    try {
      await (mainSupabase as any).from('study_plans').insert(newItem);
    } catch {}
    try {
      await featureSupabase.from('study_plans').insert(newItem);
    } catch {}
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PLANS);
    const all: StudyPlanItem[] = raw ? JSON.parse(raw) : [];
    all.push(newItem);
    localStorage.setItem(LOCAL_STORAGE_KEYS.PLANS, JSON.stringify(all));
    return newItem;
  },

  async toggleStudyPlanComplete(id: string): Promise<void> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.PLANS);
    let isCompleted = true;
    if (raw) {
      const all: StudyPlanItem[] = JSON.parse(raw);
      const updated = all.map(p => {
        if (p.id === id) {
          isCompleted = !p.completed;
          return { ...p, completed: isCompleted };
        }
        return p;
      });
      localStorage.setItem(LOCAL_STORAGE_KEYS.PLANS, JSON.stringify(updated));
    }
    try {
      await (mainSupabase as any).from('study_plans').update({ completed: isCompleted }).eq('id', id);
    } catch {}
    try {
      await featureSupabase.from('study_plans').update({ completed: isCompleted }).eq('id', id);
    } catch {}
  },

  // Mistakes
  async getMistakes(userId: string, subjectId?: string): Promise<StudentMistake[]> {
    try {
      let query = (mainSupabase as any).from('student_mistakes').select('*').eq('user_id', userId);
      if (subjectId) query = query.eq('subject_id', subjectId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;

      let fQuery = featureSupabase.from('student_mistakes').select('*').eq('user_id', userId);
      if (subjectId) fQuery = fQuery.eq('subject_id', subjectId);
      const fRes = await fQuery;
      if (!fRes.error && fRes.data && fRes.data.length > 0) return fRes.data;
    } catch {
      // Fall through to local fallback
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.MISTAKES);
    if (!raw) return [];
    const all: StudentMistake[] = JSON.parse(raw);
    return all.filter(m => m.user_id === userId && (!subjectId || m.subject_id === subjectId));
  },

  async addMistake(item: Omit<StudentMistake, 'id' | 'created_at'>): Promise<StudentMistake> {
    const newMistake: StudentMistake = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    try {
      await (mainSupabase as any).from('student_mistakes').insert(newMistake);
    } catch {}
    try {
      await featureSupabase.from('student_mistakes').insert(newMistake);
    } catch {}
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.MISTAKES);
    const all: StudentMistake[] = raw ? JSON.parse(raw) : [];
    all.unshift(newMistake);
    localStorage.setItem(LOCAL_STORAGE_KEYS.MISTAKES, JSON.stringify(all));
    return newMistake;
  },

  async resolveMistake(id: string): Promise<void> {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.MISTAKES);
    if (raw) {
      const all: StudentMistake[] = JSON.parse(raw);
      const updated = all.map(m => m.id === id ? { ...m, resolved: true } : m);
      localStorage.setItem(LOCAL_STORAGE_KEYS.MISTAKES, JSON.stringify(updated));
    }
    try {
      await (mainSupabase as any).from('student_mistakes').update({ resolved: true }).eq('id', id);
    } catch {}
    try {
      await featureSupabase.from('student_mistakes').update({ resolved: true }).eq('id', id);
    } catch {}
  },

  // Subject AI Context
  async getSubjectAIContext(userId: string, subjectId: string): Promise<SubjectAIContext | null> {
    try {
      const { data, error } = await (mainSupabase as any)
        .from('subject_ai_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .maybeSingle();
      if (!error && data) return data;

      const fRes = await featureSupabase
        .from('subject_ai_contexts')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .maybeSingle();
      if (!fRes.error && fRes.data) return fRes.data;
    } catch {
      // Fallback
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.AI_CONTEXTS);
    if (!raw) return null;
    const all: Record<string, SubjectAIContext> = JSON.parse(raw);
    return all[`${userId}_${subjectId}`] || null;
  },

  async updateSubjectAIContext(context: SubjectAIContext): Promise<void> {
    try {
      await (mainSupabase as any).from('subject_ai_contexts').upsert(context, { onConflict: 'user_id,subject_id' });
    } catch {}
    try {
      await featureSupabase.from('subject_ai_contexts').upsert(context, { onConflict: 'user_id,subject_id' });
    } catch {}
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.AI_CONTEXTS);
    const all: Record<string, SubjectAIContext> = raw ? JSON.parse(raw) : {};
    all[`${context.user_id}_${context.subject_id}`] = context;
    localStorage.setItem(LOCAL_STORAGE_KEYS.AI_CONTEXTS, JSON.stringify(all));
  },

  // Daily Usage Limits
  getDailyUsage(): DailyUsageLimit {
    const today = new Date().toISOString().split('T')[0];
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USAGE_LIMITS);
    if (raw) {
      const parsed: DailyUsageLimit = JSON.parse(raw);
      if (parsed.date === today) {
        if (parsed.challenge_used === undefined) parsed.challenge_used = 0;
        if (parsed.challenge_limit === undefined) parsed.challenge_limit = 3;
        if (parsed.writing_used === undefined) parsed.writing_used = 0;
        if (parsed.writing_limit === undefined) parsed.writing_limit = 2;
        return parsed;
      }
    }
    const initial: DailyUsageLimit = {
      date: today,
      ai_tutor_used: 0,
      ai_tutor_limit: 10,
      quiz_gen_used: 0,
      quiz_gen_limit: 10,
      mock_exam_used: 0,
      mock_exam_limit: 1,
      challenge_used: 0,
      challenge_limit: 3,
      writing_used: 0,
      writing_limit: 2,
    };
    localStorage.setItem(LOCAL_STORAGE_KEYS.USAGE_LIMITS, JSON.stringify(initial));
    return initial;
  },

  incrementUsage(type: 'ai_tutor' | 'quiz_gen' | 'mock_exam' | 'challenge' | 'writing'): DailyUsageLimit {
    const current = this.getDailyUsage();
    if (type === 'ai_tutor') current.ai_tutor_used += 1;
    if (type === 'quiz_gen') current.quiz_gen_used += 1;
    if (type === 'mock_exam') current.mock_exam_used += 1;
    if (type === 'challenge') current.challenge_used += 1;
    if (type === 'writing') current.writing_used += 1;
    localStorage.setItem(LOCAL_STORAGE_KEYS.USAGE_LIMITS, JSON.stringify(current));
    return current;
  }
};
