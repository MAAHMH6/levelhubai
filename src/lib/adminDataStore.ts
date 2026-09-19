/**
 * Admin Data Store
 * Provides seamless local persistence, real-time cross-tab synchronization,
 * and graceful fallback for Supabase RLS restrictions on admin actions.
 */

import { CANONICAL_A_LEVEL_SUBJECTS } from "./canonicalALevelSubjects";
import { CANONICAL_O_LEVEL_SUBJECTS } from "./canonicalOLevelSubjects";
import { CANONICAL_IGCSE_SUBJECTS } from "./canonicalIGCSESubjects";

export interface StoredLesson {
  id: string;
  title: string;
  description: string | null;
  lesson_number: number;
  unit_id: string;
  video_url: string | null;
  topic_name: string | null;
  xp_reward: number;
  quiz_question_count: number;
  practice_question_count: number;
  video_duration_display?: string | null;
  video_duration_seconds?: number | null;
}

export interface StoredUnit {
  id: string;
  title: string;
  description: string | null;
  unit_number: number;
  subject_id: string;
  icon_emoji: string;
  duration_weeks: string | null;
  total_xp: number;
}

export interface StoredSubject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  subject_code: string | null;
  subscription_tier?: string;
  is_premium?: boolean | null;
  qualification?: string | null;
  enabled?: boolean | null;
  display_order?: number | null;
}

export interface StoredTopic {
  id: string;
  name: string;
  order_index: number;
  subject_id: string;
}

export interface StoredSubscription {
  user_id: string;
  plan: 'free' | 'pro' | 'school';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  updated_at: string;
}

export interface StoredProfileFields {
  phone_number?: string | null;
  school?: string | null;
  country?: string | null;
  city?: string | null;
  target_grade?: string | null;
  profile_complete?: boolean;
  display_name?: string | null;
  subscription_plan?: string | null;
}

interface AdminDataState {
  lessons: Record<string, Partial<StoredLesson>>;
  createdLessons: StoredLesson[];
  deletedLessonIds: string[];

  units: Record<string, Partial<StoredUnit>>;
  createdUnits: StoredUnit[];
  deletedUnitIds: string[];

  subjects: Record<string, Partial<StoredSubject>>;
  createdSubjects: StoredSubject[];
  deletedSubjectIds: string[];

  topics: Record<string, Partial<StoredTopic>>;
  createdTopics: StoredTopic[];
  deletedTopicIds: string[];

  subscriptions: Record<string, StoredSubscription>;
  profiles: Record<string, StoredProfileFields>;
  flashcards: Record<string, any[]>;
  cheatsheets: Record<string, any>;
}

const STORAGE_KEY = "levelhub_admin_overrides_v2";

class AdminDataStore {
  private state: AdminDataState = {
    lessons: {},
    createdLessons: [],
    deletedLessonIds: [],
    units: {},
    createdUnits: [],
    deletedUnitIds: [],
    subjects: {},
    createdSubjects: [],
    deletedSubjectIds: [],
    topics: {},
    createdTopics: [],
    deletedTopicIds: [],
    subscriptions: {},
    profiles: {},
    flashcards: {},
    cheatsheets: {},
  };

  constructor() {
    this.loadState();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) {
          this.loadState();
          this.dispatchEvents();
        }
      });
    }
  }

  private loadState() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = {
          lessons: parsed.lessons || {},
          createdLessons: parsed.createdLessons || [],
          deletedLessonIds: parsed.deletedLessonIds || [],
          units: parsed.units || {},
          createdUnits: parsed.createdUnits || [],
          deletedUnitIds: parsed.deletedUnitIds || [],
          subjects: parsed.subjects || {},
          createdSubjects: parsed.createdSubjects || [],
          deletedSubjectIds: parsed.deletedSubjectIds || [],
          topics: parsed.topics || {},
          createdTopics: parsed.createdTopics || [],
          deletedTopicIds: parsed.deletedTopicIds || [],
          subscriptions: parsed.subscriptions || {},
          profiles: parsed.profiles || {},
        };
      }
    } catch (e) {
      console.warn("Failed to load admin overrides from localStorage", e);
    }
  }

  private saveState() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Failed to save admin overrides to localStorage", e);
    }
  }

  private dispatchEvents(type?: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("levelhub:admin_data_updated", { detail: { type } }));
    if (type) {
      window.dispatchEvent(new CustomEvent(`levelhub:${type}_updated`));
    }
  }

  // --- LESSONS ---
  public saveLesson(id: string, changes: Partial<StoredLesson>) {
    this.state.lessons[id] = {
      ...(this.state.lessons[id] || {}),
      ...changes,
    };
    // Also update in createdLessons if present
    const idx = this.state.createdLessons.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.state.createdLessons[idx] = { ...this.state.createdLessons[idx], ...changes };
    }
    this.saveState();
    this.dispatchEvents("lessons");
  }

  public addLesson(lesson: StoredLesson) {
    this.state.createdLessons.push(lesson);
    this.saveState();
    this.dispatchEvents("lessons");
  }

  public deleteLesson(id: string) {
    if (!this.state.deletedLessonIds.includes(id)) {
      this.state.deletedLessonIds.push(id);
    }
    delete this.state.lessons[id];
    this.state.createdLessons = this.state.createdLessons.filter((l) => l.id !== id);
    this.saveState();
    this.dispatchEvents("lessons");
  }

  public applyLessonOverrides<T extends { id: string; unit_id?: string; lesson_number?: number }>(
    lessons: T[],
    unitId?: string
  ): T[] {
    const deletedSet = new Set(this.state.deletedLessonIds);
    let result = lessons
      .filter((l) => !deletedSet.has(l.id))
      .map((l) => {
        const override = this.state.lessons[l.id];
        return override ? ({ ...l, ...override } as T) : l;
      });

    // Add newly created lessons if matching unit
    if (unitId) {
      const createdForUnit = this.state.createdLessons
        .filter((l) => l.unit_id === unitId && !deletedSet.has(l.id))
        .map((l) => {
          const override = this.state.lessons[l.id];
          return (override ? { ...l, ...override } : l) as unknown as T;
        });
      result = [...result, ...createdForUnit];
    }

    // Sort by lesson_number if available
    result.sort((a, b) => ((a.lesson_number ?? 0) - (b.lesson_number ?? 0)));
    return result;
  }

  // --- UNITS ---
  public saveUnit(id: string, changes: Partial<StoredUnit>) {
    this.state.units[id] = {
      ...(this.state.units[id] || {}),
      ...changes,
    };
    const idx = this.state.createdUnits.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.state.createdUnits[idx] = { ...this.state.createdUnits[idx], ...changes };
    }
    this.saveState();
    this.dispatchEvents("units");
  }

  public addUnit(unit: StoredUnit) {
    this.state.createdUnits.push(unit);
    this.saveState();
    this.dispatchEvents("units");
  }

  public deleteUnit(id: string) {
    if (!this.state.deletedUnitIds.includes(id)) {
      this.state.deletedUnitIds.push(id);
    }
    delete this.state.units[id];
    this.state.createdUnits = this.state.createdUnits.filter((u) => u.id !== id);
    this.saveState();
    this.dispatchEvents("units");
  }

  public applyUnitOverrides<T extends { id: string; subject_id?: string; unit_number?: number }>(
    units: T[],
    subjectId?: string
  ): T[] {
    const deletedSet = new Set(this.state.deletedUnitIds);
    let result = units
      .filter((u) => !deletedSet.has(u.id))
      .map((u) => {
        const override = this.state.units[u.id];
        return override ? ({ ...u, ...override } as T) : u;
      });

    if (subjectId) {
      const createdForSubject = this.state.createdUnits
        .filter((u) => u.subject_id === subjectId && !deletedSet.has(u.id))
        .map((u) => {
          const override = this.state.units[u.id];
          return (override ? { ...u, ...override } : u) as unknown as T;
        });
      result = [...result, ...createdForSubject];
    }

    result.sort((a, b) => ((a.unit_number ?? 0) - (b.unit_number ?? 0)));
    return result;
  }

  // --- SUBJECTS ---
  public saveSubject(id: string, changes: Partial<StoredSubject>) {
    this.state.subjects[id] = {
      ...(this.state.subjects[id] || {}),
      ...changes,
    };
    const idx = this.state.createdSubjects.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.state.createdSubjects[idx] = { ...this.state.createdSubjects[idx], ...changes };
    }
    this.saveState();
    this.dispatchEvents("subjects");
  }

  public addSubject(subject: StoredSubject) {
    this.state.createdSubjects.push(subject);
    this.saveState();
    this.dispatchEvents("subjects");
  }

  public deleteSubject(id: string) {
    if (!this.state.deletedSubjectIds.includes(id)) {
      this.state.deletedSubjectIds.push(id);
    }
    delete this.state.subjects[id];
    this.state.createdSubjects = this.state.createdSubjects.filter((s) => s.id !== id);
    this.saveState();
    this.dispatchEvents("subjects");
  }

  public applySubjectOverrides<T extends { id: string; name?: string; subject_code?: string | null; qualification?: string | null; color?: string | null; icon?: string | null; display_order?: number | null }>(subjects: T[]): T[] {
    const deletedSet = new Set(this.state.deletedSubjectIds);
    let result = subjects
      .filter((s) => !deletedSet.has(s.id))
      .map((s) => {
        const override = this.state.subjects[s.id];
        let base = { ...s };
        // Check canonical A Level alignment
        const canon = CANONICAL_A_LEVEL_SUBJECTS.find(
          c => c.id === s.id || (s.subject_code && s.subject_code.trim() === c.code && (s.qualification === 'a_level' || !s.qualification))
        );
        if (canon) {
          base = {
            ...base,
            name: canon.name,
            subject_code: canon.code,
            qualification: 'a_level',
            color: canon.hex,
            icon: canon.icon,
            display_order: canon.order,
          };
        }
        return override ? ({ ...base, ...override } as T) : (base as T);
      });

    const created = this.state.createdSubjects
      .filter((s) => !deletedSet.has(s.id))
      .map((s) => {
        const override = this.state.subjects[s.id];
        return (override ? { ...s, ...override } : s) as unknown as T;
      });

    result = [...result, ...created];

    // Ensure all 18 canonical A-Level subjects exist for admin management
    CANONICAL_A_LEVEL_SUBJECTS.forEach((spec) => {
      const exists = result.some(
        (s) => s.id === spec.id || (s.subject_code && s.subject_code.trim() === spec.code && s.qualification === 'a_level')
      );
      if (!exists && !deletedSet.has(spec.id)) {
        const fallbackObj: any = {
          id: spec.id,
          name: spec.name,
          subject_code: spec.code,
          qualification: 'a_level',
          color: spec.hex,
          icon: spec.icon,
          display_order: spec.order,
          enabled: true,
          subscription_tier: spec.code === '9709' ? 'free' : 'pro',
          is_premium: spec.code !== '9709',
          description: `Cambridge International AS and A Level ${spec.name} (${spec.code})`,
        };
        const override = this.state.subjects[spec.id];
        result.push(override ? { ...fallbackObj, ...override } : fallbackObj);
      }
    });

    // Ensure all 17 canonical O-Level subjects exist for admin management
    CANONICAL_O_LEVEL_SUBJECTS.forEach((spec) => {
      const exists = result.some(
        (s) => s.id === spec.id || (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === 'o_level' || s.qualification === 'both'))
      );
      if (!exists && !deletedSet.has(spec.id)) {
        const fallbackObj: any = {
          id: spec.id,
          name: spec.name,
          subject_code: spec.code,
          qualification: 'o_level',
          color: spec.hex,
          icon: spec.icon,
          display_order: spec.order,
          enabled: true,
          subscription_tier: (spec.code === '4024' || spec.code === '5054' || spec.code === '0417') ? 'free' : 'pro',
          is_premium: !(spec.code === '4024' || spec.code === '5054' || spec.code === '0417'),
          description: spec.description,
        };
        const override = this.state.subjects[spec.id];
        result.push(override ? { ...fallbackObj, ...override } : fallbackObj);
      }
    });

    // Ensure all 19 canonical IGCSE subjects exist for admin management
    CANONICAL_IGCSE_SUBJECTS.forEach((spec) => {
      const exists = result.some(
        (s) => s.id === spec.id || (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === 'igcse' || s.qualification === 'both'))
      );
      if (!exists && !deletedSet.has(spec.id)) {
        const fallbackObj: any = {
          id: spec.id,
          name: spec.name,
          subject_code: spec.code,
          qualification: 'igcse',
          color: spec.hex,
          icon: spec.icon,
          display_order: spec.order,
          enabled: true,
          subscription_tier: (spec.code === '0580' || spec.code === '0625' || spec.code === '0417') ? 'free' : 'pro',
          is_premium: !(spec.code === '0580' || spec.code === '0625' || spec.code === '0417'),
          description: spec.description,
        };
        const override = this.state.subjects[spec.id];
        result.push(override ? { ...fallbackObj, ...override } : fallbackObj);
      }
    });

    return result;
  }

  // --- TOPICS ---
  public saveTopic(id: string, changes: Partial<StoredTopic>) {
    this.state.topics[id] = {
      ...(this.state.topics[id] || {}),
      ...changes,
    };
    const idx = this.state.createdTopics.findIndex((t) => t.id === id);
    if (idx !== -1) {
      this.state.createdTopics[idx] = { ...this.state.createdTopics[idx], ...changes };
    }
    this.saveState();
    this.dispatchEvents("topics");
  }

  public addTopic(topic: StoredTopic) {
    this.state.createdTopics.push(topic);
    this.saveState();
    this.dispatchEvents("topics");
  }

  public deleteTopic(id: string) {
    if (!this.state.deletedTopicIds.includes(id)) {
      this.state.deletedTopicIds.push(id);
    }
    delete this.state.topics[id];
    this.state.createdTopics = this.state.createdTopics.filter((t) => t.id !== id);
    this.saveState();
    this.dispatchEvents("topics");
  }

  public applyTopicOverrides<T extends { id: string; subject_id?: string; order_index?: number }>(
    topics: T[],
    subjectId?: string
  ): T[] {
    const deletedSet = new Set(this.state.deletedTopicIds);
    let result = topics
      .filter((t) => !deletedSet.has(t.id))
      .map((t) => {
        const override = this.state.topics[t.id];
        return override ? ({ ...t, ...override } as T) : t;
      });

    if (subjectId) {
      const createdForSub = this.state.createdTopics
        .filter((t) => t.subject_id === subjectId && !deletedSet.has(t.id))
        .map((t) => {
          const override = this.state.topics[t.id];
          return (override ? { ...t, ...override } : t) as unknown as T;
        });
      result = [...result, ...createdForSub];
    }

    result.sort((a, b) => ((a.order_index ?? 0) - (b.order_index ?? 0)));
    return result;
  }

  // --- SUBSCRIPTIONS ---
  public saveSubscription(userId: string, plan: 'free' | 'pro' | 'school', status: any = 'active') {
    const sub: StoredSubscription = {
      user_id: userId,
      plan,
      status: plan === 'free' ? 'cancelled' : status,
      updated_at: new Date().toISOString(),
    };
    this.state.subscriptions[userId] = sub;
    this.saveState();

    if (typeof window !== "undefined") {
      localStorage.setItem(`levelhub_sub_${userId}`, plan);
      // If updating current user's plan
      const currentPlan = localStorage.getItem('levelhub_user_plan');
      if (currentPlan) {
        localStorage.setItem('levelhub_user_plan', plan);
        localStorage.setItem('pro_override', plan === 'pro' || plan === 'school' ? 'true' : 'false');
      }
    }

    this.dispatchEvents("subscription");
  }

  public getSubscription(userId: string): StoredSubscription | null {
    return this.state.subscriptions[userId] || null;
  }

  public applyProfileOverrides<T extends { id: string; subscription_plan?: string | null }>(
    profiles: T[]
  ): T[] {
    return profiles.map((p) => {
      const sub = this.state.subscriptions[p.id];
      const localDirect = typeof window !== 'undefined' ? localStorage.getItem(`levelhub_sub_${p.id}`) : null;
      const effectivePlan = sub?.plan || localDirect;
      const profileOverride = this.state.profiles[p.id];
      return {
        ...p,
        ...(profileOverride || {}),
        ...(effectivePlan ? { subscription_plan: effectivePlan } : {}),
      };
    });
  }

  // --- PROFILE FIELDS (for profile completion) ---
  public saveProfileOverride(userId: string, fields: StoredProfileFields) {
    this.state.profiles[userId] = {
      ...(this.state.profiles[userId] || {}),
      ...fields,
    };
    this.saveState();
    this.dispatchEvents("profile");
  }

  public getProfileOverride(userId: string): StoredProfileFields | null {
    return this.state.profiles[userId] || null;
  }

  // --- STUDY MATERIALS (Flashcards & Cheatsheets) ---
  public saveTopicFlashcards(key: string, cards: any[]) {
    if (!this.state.flashcards) this.state.flashcards = {};
    this.state.flashcards[key] = cards;
    this.saveState();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('levelhub:study_materials_updated', { detail: { key, type: 'flashcards' } }));
    }
  }

  public getTopicFlashcards(key: string): any[] | null {
    if (!this.state.flashcards) return null;
    return this.state.flashcards[key] || null;
  }

  public saveTopicCheatsheet(key: string, cheatsheet: any) {
    if (!this.state.cheatsheets) this.state.cheatsheets = {};
    this.state.cheatsheets[key] = cheatsheet;
    this.saveState();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('levelhub:study_materials_updated', { detail: { key, type: 'cheatsheet' } }));
    }
  }

  public getTopicCheatsheet(key: string): any | null {
    if (!this.state.cheatsheets) return null;
    return this.state.cheatsheets[key] || null;
  }

  public getAllCustomFlashcards(): Record<string, any[]> {
    return this.state.flashcards || {};
  }

  public getAllCustomCheatsheets(): Record<string, any> {
    return this.state.cheatsheets || {};
  }
}

export const adminDataStore = new AdminDataStore();
