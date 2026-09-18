// Types for the Mathematics Learning System

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  icon_emoji: string;
  description: string | null;
  duration_weeks: string | null;
  total_xp: number;
  prerequisite_unit_id: string | null;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  lesson_number: number;
  title: string;
  video_url: string | null;
  video_duration_seconds: number | null;
  video_duration_display: string | null;
  xp_reward: number;
  quiz_question_count: number;
  practice_question_count: number;
  topic_name: string | null;
  description: string | null;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  video_watch_percentage: number;
  video_last_position_seconds: number;
  video_completed: boolean;
  video_completed_at: string | null;
  video_xp_awarded: boolean;
  quiz_status: 'not_started' | 'in_progress' | 'passed' | 'failed';
  quiz_score: number | null;
  quiz_attempts: number;
  quiz_best_score: number | null;
  quiz_completed_at: string | null;
  quiz_xp_earned: number;
  practice_status: 'locked' | 'available' | 'in_progress' | 'completed';
  practice_questions_attempted: number;
  practice_questions_correct: number;
  practice_xp_earned: number;
  notes_generated: boolean;
  quiz_generated: boolean;
  practice_generated: boolean;
  lesson_completed: boolean;
  lesson_completed_at: string | null;
  total_time_spent_seconds: number;
  first_accessed_at: string;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface UnitProgress {
  id: string;
  user_id: string;
  unit_id: string;
  lessons_completed: number;
  total_lessons: number;
  progress_percentage: number;
  total_xp_earned: number;
  average_quiz_score: number | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
  unit_quiz_available: boolean;
  unit_quiz_score: number | null;
  unit_quiz_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitWithProgress extends Unit {
  lessons: Lesson[];
  progress?: UnitProgress;
  lessonsProgress?: LessonProgress[];
}
