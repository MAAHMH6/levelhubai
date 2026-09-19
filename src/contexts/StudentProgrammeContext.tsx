import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { featureStorage } from '@/integrations/supabase/featureClient';
import { CANONICAL_A_LEVEL_SUBJECTS } from '@/lib/canonicalALevelSubjects';
import { CANONICAL_O_LEVEL_SUBJECTS } from '@/lib/canonicalOLevelSubjects';
import { CANONICAL_IGCSE_SUBJECTS } from '@/lib/canonicalIGCSESubjects';
import { adminDataStore } from '@/lib/adminDataStore';

export type ProgrammeType = 'o_level' | 'igcse' | 'a_level';

export interface SubjectItem {
  id: string;
  name: string;
  short_name?: string | null;
  slug?: string | null;
  subject_code: string;
  syllabusCode: string;
  qualification: string;
  qualification_variant?: string | null;
  exam_board?: string;
  icon: string;
  color: string;
  description?: string;
  subscription_tier?: string;
  is_premium?: boolean;
  enabled?: boolean;
  display_order?: number;
  progressPercent: number;
  totalTopics: number;
  completedTopics: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  studyTimeHours: number;
  streakDays: number;
  lastActivity?: string;
  isCore: boolean;
}

export interface StudentProfileData {
  id: string;
  displayName: string;
  avatarUrl?: string;
  programme: ProgrammeType;
  programmeLabel: string;
  school: string;
  city: string;
  country: string;
  examSession: string;
  examYear: string;
  currentGrade: string;
  targetGrade: string;
  streakDays: number;
  xpPoints: number;
  level: number;
  coins: number;
  selectedSubjectIds: string[];
}

export const PROGRAMME_LABELS: Record<ProgrammeType, string> = {
  o_level: 'Cambridge O Level',
  igcse: 'Cambridge IGCSE',
  a_level: 'Cambridge International A Level',
};

export const normalizeProgramme = (val: string | null | undefined): ProgrammeType => {
  if (!val) return 'igcse';
  const clean = val.toLowerCase().replace(/[-_\s]+/g, '');
  if (clean.includes('olevel')) return 'o_level';
  if (clean.includes('alevel') || clean.includes('aslevel')) return 'a_level';
  if (clean.includes('igcse')) return 'igcse';
  return 'igcse';
};

interface StudentProgrammeContextType {
  profile: StudentProfileData;
  programme: ProgrammeType;
  programmeLabel: string;
  subjects: SubjectItem[];
  coreSubjects: SubjectItem[];
  otherSubjects: SubjectItem[];
  freeSubjects: SubjectItem[];
  proSubjects: SubjectItem[];
  limitedSubjects: SubjectItem[];
  userSelectedSubjects: SubjectItem[];
  rawSubjects: any[];
  loading: boolean;
  setProgramme: (programme: ProgrammeType) => Promise<void>;
  updateProfile: (data: Partial<StudentProfileData>) => Promise<void>;
  toggleSubjectSelection: (subjectId: string) => void;
  getSubjectById: (subjectId: string) => SubjectItem | undefined;
  getSubjectBySlug: (slug: string) => SubjectItem | undefined;
  awardXp: (amount: number, options?: { streakIncrement?: boolean }) => Promise<void>;
}

const DEFAULT_PROFILE: StudentProfileData = {
  id: 'guest_student',
  displayName: 'Student',
  programme: 'igcse',
  programmeLabel: PROGRAMME_LABELS.igcse,
  school: 'Cambridge Academy',
  city: 'London',
  country: 'United Kingdom',
  examSession: 'May / June',
  examYear: '2027',
  currentGrade: 'B',
  targetGrade: 'A*',
  streakDays: 0,
  xpPoints: 0,
  level: 1,
  coins: 0,
  selectedSubjectIds: [],
};

// Standard Cambridge Syllabus Codes map (used as fallback when subject_code is not in database)
const SYLLABUS_CODES: Record<string, string> = {
  // O Level Canonical Codes
  'english language': '1123',
  'english': '1123',
  'english olevel': '1123',
  'mathematics': '4024',
  'urdu – first language': '3247',
  'urdu - first language': '3247',
  'urdu first lang olevel': '3247',
  'urdu – second language': '3248',
  'urdu - second language': '3248',
  'urdu second lang olevel': '3248',
  'urdu': '3248',
  'islamiyat': '2058',
  'islamiyat olevel': '2058',
  'pakistan studies': '2059',
  'pakistan studies olevel': '2059',
  'chemistry': '5070',
  'chemistry olevel': '5070',
  'physics': '5054',
  'biology': '5090',
  'biology olevel': '5090',
  'additional mathematics': '4037',
  'economics': '2281',
  'business studies': '7115',
  'literature in english': '2010',
  'sociology': '2251',
  'information and communication technology': '0417',
  'ict': '0417',
  'computer science': '2210',
  'accounting': '7707',
  'accounting olevel': '7707',

  // IGCSE Variants
  'mathematics igcse': '0580',
  'physics igcse': '0625',
  'chemistry igcse': '0620',
  'biology igcse': '0610',
  'english igcse first lang': '0500',
  'english igcse second lang': '0510',
  'english igcse literature': '0475',
  'ict igcse': '0417',
  'computer science igcse': '0478',
  'accounting igcse': '0452',
  'urdu second lang igcse': '0539',

  // A Level Canonical Codes (18 Subjects)
  'english language': '9093',
  'english language a-level': '9093',
  'mathematics a-level': '9709',
  'urdu a-level': '9686',
  'urdu': '9686',
  'chemistry a-level': '9701',
  'physics a-level': '9702',
  'biology a-level': '9700',
  'further mathematics': '9231',
  'further mathematics a-level': '9231',
  'economics a-level': '9708',
  'business a-level': '9609',
  'business': '9609',
  'literature in english a-level': '9695',
  'sociology a-level': '9699',
  'information technology a-level': '9626',
  'computer science a-level': '9618',
  'accounting a-level': '9706',
  'psychology a-level': '9990',
  'psychology': '9990',
  'geography a-level': '9696',
  'geography': '9696',
  'history a-level': '9489',
  'history': '9489',
  'global perspectives & research': '9239',
  'global perspectives & research a-level': '9239',
};

export const CAMBRIDGE_SUBJECT_COLORS: Record<string, string> = {
  // A Level Canonical Hex Colors
  'english language a-level': '#2563EB',
  'mathematics a-level': '#7C3AED',
  'urdu a-level': '#EA580C',
  'chemistry a-level': '#DB2777',
  'physics a-level': '#0891B2',
  'biology a-level': '#16A34A',
  'further mathematics': '#9333EA',
  'further mathematics a-level': '#9333EA',
  'economics a-level': '#92400E',
  'business a-level': '#4F46E5',
  'literature in english a-level': '#E11D48',
  'sociology a-level': '#475569',
  'information technology a-level': '#0F766E',
  'computer science a-level': '#334155',
  'accounting a-level': '#65A30D',
  'psychology a-level': '#C026D3',
  'geography a-level': '#CA8A04',
  'history a-level': '#64748B',
  'global perspectives & research': '#0D9488',
  'global perspectives & research a-level': '#0D9488',

  'mathematics': '#0D9488', // Teal
  'mathematics igcse': '#0F766E', // Deep Teal
  'physics': '#8B5CF6', // Purple
  'physics igcse': '#7C3AED', // Deep Violet
  'ict': '#0284C7', // Sky
  'ict igcse': '#0369A1', // Deep Sky
  'chemistry': '#06B6D4', // Cyan
  'chemistry igcse': '#0891B2', // Deep Cyan
  'chemistry olevel': '#0EA5E9', // Sky Cyan
  'biology': '#10B981', // Emerald
  'biology igcse': '#059669', // Deep Emerald
  'biology olevel': '#15803D', // Forest Green
  'computer science': '#6366F1', // Indigo
  'economics': '#F97316', // Orange
  'business': '#F59E0B', // Amber
  'accounting': '#F43F5E', // Rose
  'accounting igcse': '#E11D48', // Deep Rose
  'accounting olevel': '#BE123C', // Ruby
  'english language': '#3B82F6', // Blue
  'english olevel': '#2563EB', // Royal Blue
  'english igcse first lang': '#1D4ED8', // Navy Blue
  'english igcse second lang': '#60A5FA', // Light Blue
  'english igcse literature': '#9333EA', // Purple Violet
  'psychology': '#EC4899', // Pink
  'islamiyat olevel': '#059669', // Islamic Green
  'pakistan studies olevel': '#047857', // Crescent Green
  'urdu first lang olevel': '#D97706', // Amber Bronze
  'urdu second lang olevel': '#B45309', // Warm Bronze
  'urdu second lang igcse': '#C2410C', // Rust
};

export const ALL_FALLBACK_SUBJECTS = [
  // Canonical O Level Subjects (17)
  ...CANONICAL_O_LEVEL_SUBJECTS.map(s => ({
    id: s.id,
    name: s.name,
    subject_code: s.code,
    qualification: "o_level",
    subscription_tier: (s.code === "4024" || s.code === "5054" || s.code === "0417") ? "free" : "pro",
    is_premium: !(s.code === "4024" || s.code === "5054" || s.code === "0417"),
    color: s.hex,
    icon: s.icon,
    display_order: s.order,
  })),

  // Canonical IGCSE Subjects (19)
  ...CANONICAL_IGCSE_SUBJECTS.map(s => ({
    id: s.id,
    name: s.name,
    subject_code: s.code,
    qualification: "igcse",
    subscription_tier: (s.code === "0580" || s.code === "0625" || s.code === "0417") ? "free" : "pro",
    is_premium: !(s.code === "0580" || s.code === "0625" || s.code === "0417"),
    color: s.hex,
    icon: s.icon,
    display_order: s.order,
  })),

  // Canonical A Level Subjects (18)
  ...CANONICAL_A_LEVEL_SUBJECTS.map(s => ({
    id: s.id,
    name: s.name,
    subject_code: s.code,
    qualification: "a_level",
    subscription_tier: s.code === "9709" ? "free" : "pro",
    is_premium: s.code !== "9709",
    color: s.hex,
    icon: s.icon,
    display_order: s.order,
  })),
];

export const getSubjectBrandColor = (name: string, fallbackColor?: string): string => {
  const clean = (name || '').trim().toLowerCase();
  for (const [key, color] of Object.entries(CAMBRIDGE_SUBJECT_COLORS)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      return color;
    }
  }
  return fallbackColor || '#00B4B6';
};

export const isFreeCambridgeSubject = (name: string, programme?: ProgrammeType): boolean => {
  const lower = (name || '').toLowerCase().trim();
  // EXCLUDE Additional Mathematics and Further Mathematics from free core!
  if (lower.includes('additional') || lower.includes('further')) return false;

  // Exact core free matches across Cambridge programmes
  if (
    lower === 'mathematics' || 
    lower === 'mathematics igcse' || 
    lower === 'mathematics olevel' || 
    lower === 'mathematics a-level'
  ) return true;

  if (
    lower === 'physics' || 
    lower === 'physics igcse' || 
    lower === 'physics olevel' || 
    lower === 'physics a-level'
  ) return true;

  if (
    lower === 'information and communication technology' || 
    lower === 'ict' || 
    lower === 'ict igcse' || 
    lower === 'ict olevel'
  ) return true;

  return false;
};

const StudentProgrammeContext = createContext<StudentProgrammeContextType | undefined>(undefined);

export const StudentProgrammeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfileData>(DEFAULT_PROFILE);
  const [rawSubjects, setRawSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load student profile & settings
  useEffect(() => {
    const loadProfile = async () => {
      let current = { ...DEFAULTProfileFromStorage() };

      if (user) {
        try {
          // Read from original DB safely (Read-Only)
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (data) {
            // Determine programme from DB grade_level, or fallback to current cached programme
            const prog: ProgrammeType = data.grade_level 
              ? normalizeProgramme(data.grade_level) 
              : (current.programme || 'igcse');

            current = {
              ...current,
              id: data.id,
              displayName: data.display_name || user.email?.split('@')[0] || 'Student',
              avatarUrl: data.avatar_url,
              programme: prog,
              programmeLabel: PROGRAMME_LABELS[prog],
              school: data.school || current.school,
              streakDays: data.streak_days ?? current.streakDays ?? 0,
              xpPoints: data.xp_points ?? current.xpPoints ?? 0,
              level: data.level ?? current.level ?? 1,
              coins: data.coins ?? current.coins ?? 0,
              selectedSubjectIds: data.subjects ?? current.selectedSubjectIds ?? [],
            };
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }

      setProfile(current);
      saveProfileToStorage(current);
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  // Fetch subjects from authoritative database with instant admin override sync
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name, subject_code, qualification, icon, color, description, subscription_tier, is_premium, enabled, display_order')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });

        const base = (!error && data && data.length > 0) ? data : [];
        setRawSubjects(adminDataStore.applySubjectOverrides(base));
      } catch (err) {
        console.error('Error reading subjects from database:', err);
        setRawSubjects(adminDataStore.applySubjectOverrides([]));
      }
    };
    fetchSubjects();

    const unsub = adminDataStore.subscribe((type) => {
      if (!type || type === 'subjects') {
        fetchSubjects();
      }
    });
    return () => unsub();
  }, []);

  // Fetch real student lesson progress & quiz stats per subject from Supabase
  const [userSubjectStats, setUserSubjectStats] = useState<Record<string, {
    completedLessons: number;
    totalLessons: number;
    quizAccuracy: number;
    studyTimeHours: number;
  }>>({});

  useEffect(() => {
    if (!user?.id) {
      setUserSubjectStats({});
      return;
    }

    const loadUserProgress = async () => {
      try {
        // 1. Fetch real completed lessons for this student
        const { data: lpData } = await supabase
          .from('lesson_progress')
          .select('lesson_id, video_completed, total_time_spent_seconds, lessons(id, unit_id, units(id, subject_id))')
          .eq('user_id', user.id);

        // 2. Fetch real quiz attempts for this student
        const { data: qaData } = await supabase
          .from('quiz_attempts')
          .select('subject_id, percentage, is_correct')
          .eq('user_id', user.id);

        // 3. Fetch total lessons per subject for progress percentage
        const { data: unitsData } = await supabase
          .from('units')
          .select('id, subject_id, lessons(id)');

        const totalLessonsMap: Record<string, number> = {};
        (unitsData || []).forEach((u: any) => {
          if (u.subject_id) {
            const count = Array.isArray(u.lessons) ? u.lessons.length : 0;
            totalLessonsMap[u.subject_id] = (totalLessonsMap[u.subject_id] || 0) + count;
          }
        });

        const stats: Record<string, {
          completedLessons: number;
          totalLessons: number;
          quizAccuracy: number;
          studyTimeHours: number;
        }> = {};

        (lpData || []).forEach((lp: any) => {
          const subjId = lp.lessons?.units?.subject_id;
          if (subjId) {
            if (!stats[subjId]) {
              stats[subjId] = {
                completedLessons: 0,
                totalLessons: totalLessonsMap[subjId] || 0,
                quizAccuracy: 0,
                studyTimeHours: 0,
              };
            }
            if (lp.video_completed) {
              stats[subjId].completedLessons += 1;
            }
            if (lp.total_time_spent_seconds) {
              stats[subjId].studyTimeHours += Math.round(lp.total_time_spent_seconds / 3600);
            }
          }
        });

        // Tally quiz attempts accuracy per subject
        const quizBySubj: Record<string, { total: number; correct: number }> = {};
        (qaData || []).forEach((qa: any) => {
          if (qa.subject_id) {
            if (!quizBySubj[qa.subject_id]) quizBySubj[qa.subject_id] = { total: 0, correct: 0 };
            quizBySubj[qa.subject_id].total += 1;
            if (qa.is_correct || (qa.percentage && qa.percentage >= 60)) {
              quizBySubj[qa.subject_id].correct += 1;
            }
          }
        });

        Object.entries(quizBySubj).forEach(([sId, data]) => {
          if (!stats[sId]) {
            stats[sId] = {
              completedLessons: 0,
              totalLessons: totalLessonsMap[sId] || 0,
              quizAccuracy: 0,
              studyTimeHours: 0,
            };
          }
          stats[sId].quizAccuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        });

        setUserSubjectStats(stats);
      } catch (err) {
        console.error('Error calculating real subject progress:', err);
      }
    };

    loadUserProgress();
  }, [user?.id]);

  // Filter subjects strictly according to student's selected programme with strict admin Pro/Free and visibility controls
  const programmeSubjects: SubjectItem[] = useMemo(() => {
    const prog = profile.programme;

    // Determine canonical list for active programme
    const canonicalList =
      prog === 'o_level' ? CANONICAL_O_LEVEL_SUBJECTS :
      prog === 'igcse' ? CANONICAL_IGCSE_SUBJECTS :
      CANONICAL_A_LEVEL_SUBJECTS;

    const matchedDbIds = new Set<string>();

    const canonicalMapped: (SubjectItem | null)[] = canonicalList.map((spec) => {
      // Find matching subject from rawSubjects (with admin overrides already applied)
      const dbMatch = rawSubjects.find(
        (s) =>
          s.id === spec.id ||
          (s.subject_code && s.subject_code.trim() === spec.code && (s.qualification === prog || s.qualification === 'both')) ||
          (s.name && s.name.toLowerCase() === spec.name.toLowerCase() && (s.qualification === prog || s.qualification === 'both'))
      );

      if (dbMatch) {
        matchedDbIds.add(dbMatch.id);
      }

      // Check admin visibility: if explicitly disabled by admin, hide it
      const isEnabled = dbMatch?.enabled !== undefined ? dbMatch.enabled !== false : true;
      if (!isEnabled) {
        return null;
      }

      // Pro / Non-pro priority:
      // 1. Admin explicit override / database setting takes absolute precedence
      let isFree: boolean;
      if (dbMatch?.subscription_tier !== undefined && dbMatch.subscription_tier !== null) {
        isFree = dbMatch.subscription_tier === 'free';
      } else if (dbMatch?.is_premium !== undefined && dbMatch.is_premium !== null) {
        isFree = !dbMatch.is_premium;
      } else {
        // 2. Canonical default tier (Mathematics, Physics, ICT are free core; Additional Mathematics is NEVER free core)
        isFree = isFreeCambridgeSubject(spec.name, prog);
      }

      const activeId = dbMatch?.id || spec.id;
      const brandColor = (dbMatch?.color && dbMatch.color.startsWith('#')) ? dbMatch.color : spec.hex;
      const icon = (dbMatch?.icon && dbMatch.icon.length > 2) ? dbMatch.icon : spec.icon;
      const displayOrder = dbMatch?.display_order ?? spec.order;
      const description = dbMatch?.description || spec.description;

      const userStat = userSubjectStats[activeId];
      const completedTopics = userStat?.completedLessons || 0;
      const totalTopics = userStat?.totalLessons || 0;
      const progressPercent = totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;
      const accuracy = userStat?.quizAccuracy || 0;
      const studyTimeHours = userStat?.studyTimeHours || 0;

      return {
        id: activeId,
        name: spec.name,
        short_name: spec.name,
        slug: spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        syllabusCode: spec.code,
        subject_code: spec.code,
        qualification: prog,
        qualification_variant: null,
        exam_board: 'cambridge',
        icon,
        color: brandColor,
        description,
        subscription_tier: isFree ? 'free' : 'pro',
        is_premium: !isFree,
        enabled: true,
        display_order: displayOrder,
        progressPercent,
        totalTopics,
        completedTopics,
        accuracy,
        weakTopics: [],
        strongTopics: [],
        studyTimeHours,
        streakDays: profile.streakDays,
        isCore: isFree,
      };
    });

    // Also include any custom subjects created by admin in this qualification that are not part of canonical list
    const customSubjects: SubjectItem[] = rawSubjects
      .filter((s) => {
        if (matchedDbIds.has(s.id)) return false;
        if (s.enabled === false) return false;
        const q = (s.qualification || '').toLowerCase();
        return q === prog || q === 'both';
      })
      .map((s) => {
        const isFree = s.subscription_tier !== undefined ? s.subscription_tier === 'free' : (s.is_premium === false);
        const userStat = userSubjectStats[s.id];
        const completedTopics = userStat?.completedLessons || 0;
        const totalTopics = userStat?.totalLessons || 0;
        const progressPercent = totalTopics > 0 ? Math.min(100, Math.round((completedTopics / totalTopics) * 100)) : 0;

        return {
          id: s.id,
          name: s.name,
          short_name: s.name,
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          syllabusCode: s.subject_code || '',
          subject_code: s.subject_code || '',
          qualification: s.qualification || prog,
          qualification_variant: null,
          exam_board: 'cambridge',
          icon: s.icon || 'BookOpen',
          color: s.color || '#00B4B6',
          description: s.description || '',
          subscription_tier: isFree ? 'free' : 'pro',
          is_premium: !isFree,
          enabled: true,
          display_order: s.display_order ?? 999,
          progressPercent,
          totalTopics,
          completedTopics,
          accuracy: userStat?.quizAccuracy || 0,
          weakTopics: [],
          strongTopics: [],
          studyTimeHours: userStat?.studyTimeHours || 0,
          streakDays: profile.streakDays,
          isCore: isFree,
        };
      });

    const combined = canonicalMapped.filter((s): s is SubjectItem => s !== null).concat(customSubjects);
    combined.sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
    return combined;
  }, [rawSubjects, profile.programme, profile.streakDays, userSubjectStats]);

  const coreSubjects = useMemo(() => {
    return programmeSubjects.filter(s => s.isCore);
  }, [programmeSubjects]);

  const otherSubjects = useMemo(() => {
    return programmeSubjects.filter(s => !s.isCore);
  }, [programmeSubjects]);

  const freeSubjects = useMemo(() => {
    return programmeSubjects.filter(s => s.subscription_tier === 'free');
  }, [programmeSubjects]);

  const proSubjects = useMemo(() => {
    return programmeSubjects.filter(s => s.subscription_tier === 'pro');
  }, [programmeSubjects]);

  const limitedSubjects = useMemo(() => {
    return programmeSubjects.filter(s => s.subscription_tier !== 'free');
  }, [programmeSubjects]);

  const userSelectedSubjects = useMemo(() => {
    if (!profile.selectedSubjectIds || profile.selectedSubjectIds.length === 0) {
      return programmeSubjects;
    }
    const idSet = new Set(profile.selectedSubjectIds);
    return programmeSubjects.filter(s => idSet.has(s.id));
  }, [programmeSubjects, profile.selectedSubjectIds]);

  const updateProfile = async (partial: Partial<StudentProfileData>) => {
    setProfile(prev => {
      const next = { ...prev, ...partial };
      if (partial.programme) {
        next.programme = partial.programme;
        next.programmeLabel = PROGRAMME_LABELS[partial.programme] || prev.programmeLabel;
      }
      saveProfileToStorage(next);
      return next;
    });

    // Notify all app components immediately if programme changed
    if (partial.programme) {
      window.dispatchEvent(new CustomEvent('levelhub:programme_changed', {
        detail: { programme: partial.programme, programmeLabel: PROGRAMME_LABELS[partial.programme] }
      }));
    }

    if (user?.id) {
      try {
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
          last_active_at: new Date().toISOString(),
        };
        if (partial.displayName !== undefined) payload.display_name = partial.displayName;
        if (partial.school !== undefined) payload.school = partial.school;
        if (partial.xpPoints !== undefined) payload.xp_points = partial.xpPoints;
        if (partial.level !== undefined) payload.level = partial.level;
        if (partial.streakDays !== undefined) payload.streak_days = partial.streakDays;
        if (partial.coins !== undefined) payload.coins = partial.coins;
        if (partial.selectedSubjectIds !== undefined) payload.subjects = partial.selectedSubjectIds;
        // Persist programme selection so it survives page refresh / re-login
        // NOTE: profiles table column is 'grade_level'. Do NOT include 'programme' column!
        if (partial.programme) {
          payload.grade_level = partial.programme;
        }

        const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
        if (error) {
          console.error('Error syncing profile to Supabase:', error);
        }
      } catch (err) {
        console.error('Error syncing profile to Supabase:', err);
      }
    }
  };

  const setProgramme = async (prog: ProgrammeType) => {
    await updateProfile({ programme: prog });
  };

  const toggleSubjectSelection = (subjectId: string) => {
    const current = new Set(profile.selectedSubjectIds || []);
    if (current.has(subjectId)) {
      current.delete(subjectId);
    } else {
      current.add(subjectId);
    }
    updateProfile({ selectedSubjectIds: Array.from(current) });
  };

  const getSubjectById = (id: string) => {
    const found = programmeSubjects.find(s => s.id === id);
    if (found) return found;

    const raw = rawSubjects.find(s => s.id === id);
    if (raw) {
      const cleanName = (raw.name || '').trim().toLowerCase();
      const code = (raw.subject_code ? raw.subject_code.trim() : null) || SYLLABUS_CODES[cleanName] || (raw.qualification === 'a_level' ? '9709' : '4024');
      const isFree = raw.is_premium === false || raw.subscription_tier === 'free' || isFreeCambridgeSubject(raw.name);
      return {
        id: raw.id,
        name: raw.name,
        short_name: raw.short_name || raw.name,
        slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        syllabusCode: code,
        subject_code: code,
        qualification: raw.qualification || 'o_level',
        qualification_variant: raw.qualification_variant || null,
        exam_board: raw.exam_board || 'cambridge',
        icon: raw.icon || 'BookOpen',
        color: getSubjectBrandColor(raw.name, raw.color),
        description: raw.description || '',
        subscription_tier: isFree ? 'free' : (raw.subscription_tier || 'pro'),
        is_premium: !isFree,
        enabled: raw.enabled !== false,
        display_order: raw.display_order ?? 999,
        progressPercent: 0,
        totalTopics: 0,
        completedTopics: 0,
        accuracy: 0,
        weakTopics: [],
        strongTopics: [],
        studyTimeHours: 0,
        streakDays: 0,
        isCore: isFree
      };
    }

    const fallback = ALL_FALLBACK_SUBJECTS.find(s => s.id === id);
    if (fallback) {
      const cleanName = (fallback.name || '').trim().toLowerCase();
      const code = (fallback.subject_code ? fallback.subject_code.trim() : null) || SYLLABUS_CODES[cleanName] || (fallback.qualification === 'a_level' ? '9709' : '4024');
      const isFree = fallback.subscription_tier === 'free' || isFreeCambridgeSubject(fallback.name);
      return {
        id: fallback.id,
        name: fallback.name,
        short_name: fallback.name,
        slug: fallback.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        syllabusCode: code,
        subject_code: code,
        qualification: fallback.qualification,
        qualification_variant: null,
        exam_board: 'cambridge',
        icon: (fallback as any).icon || 'BookOpen',
        color: (fallback as any).color || getSubjectBrandColor(fallback.name),
        description: '',
        subscription_tier: isFree ? 'free' : (fallback.subscription_tier || 'pro'),
        is_premium: !isFree,
        enabled: true,
        display_order: (fallback as any).display_order ?? 999,
        progressPercent: 0,
        totalTopics: 0,
        completedTopics: 0,
        accuracy: 0,
        weakTopics: [],
        strongTopics: [],
        studyTimeHours: 0,
        streakDays: 0,
        isCore: isFree
      };
    }
    return undefined;
  };

  const getSubjectBySlug = (slug: string) => {
    if (!slug || !slug.trim()) return undefined;
    const rawQuery = slug.trim().toLowerCase();
    const normalized = rawQuery.replace(/[-_]/g, ' ').trim();
    if (!normalized) return undefined;

    const matchSubject = (s: { id: string; name: string; slug?: string; subject_code?: string }) => {
      if (s.id === slug) return true;
      if (s.slug && s.slug.toLowerCase() === rawQuery) return true;
      if (s.subject_code && s.subject_code.toLowerCase() === rawQuery) return true;
      const sName = (s.name || '').toLowerCase().trim();
      if (sName === normalized) return true;
      const sSlug = sName.replace(/[-_]/g, ' ');
      if (sSlug === normalized) return true;
      // Exact word boundary match or startsWith for longer queries
      if (normalized.length >= 3 && (sName.startsWith(normalized + ' ') || sName.endsWith(' ' + normalized))) return true;
      return false;
    };

    const found = programmeSubjects.find(matchSubject);
    if (found) return found;

    const raw = rawSubjects.find(matchSubject);
    if (raw) {
      const cleanName = (raw.name || '').trim().toLowerCase();
      const code = (raw.subject_code ? raw.subject_code.trim() : null) || SYLLABUS_CODES[cleanName] || (raw.qualification === 'a_level' ? '9709' : '4024');
      const isFree = raw.is_premium === false || raw.subscription_tier === 'free' || isFreeCambridgeSubject(raw.name);
      return {
        id: raw.id,
        name: raw.name,
        short_name: raw.short_name || raw.name,
        slug: raw.slug || raw.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        syllabusCode: code,
        subject_code: code,
        qualification: raw.qualification || 'o_level',
        qualification_variant: raw.qualification_variant || null,
        exam_board: raw.exam_board || 'cambridge',
        icon: raw.icon || 'BookOpen',
        color: getSubjectBrandColor(raw.name, raw.color),
        description: raw.description || '',
        subscription_tier: isFree ? 'free' : (raw.subscription_tier || 'pro'),
        is_premium: !isFree,
        enabled: raw.enabled !== false,
        display_order: raw.display_order ?? 999,
        progressPercent: 0,
        totalTopics: 0,
        completedTopics: 0,
        accuracy: 0,
        weakTopics: [],
        strongTopics: [],
        studyTimeHours: 0,
        streakDays: 0,
        isCore: isFree
      };
    }

    const fallback = ALL_FALLBACK_SUBJECTS.find(matchSubject);
    if (fallback) {
      const cleanName = (fallback.name || '').trim().toLowerCase();
      const code = (fallback.subject_code ? fallback.subject_code.trim() : null) || SYLLABUS_CODES[cleanName] || (fallback.qualification === 'a_level' ? '9709' : '4024');
      const isFree = fallback.subscription_tier === 'free' || isFreeCambridgeSubject(fallback.name);
      return {
        id: fallback.id,
        name: fallback.name,
        short_name: fallback.name,
        slug: fallback.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        syllabusCode: code,
        subject_code: code,
        qualification: fallback.qualification,
        qualification_variant: null,
        exam_board: 'cambridge',
        icon: (fallback as any).icon || 'BookOpen',
        color: (fallback as any).color || getSubjectBrandColor(fallback.name),
        description: '',
        subscription_tier: isFree ? 'free' : (fallback.subscription_tier || 'pro'),
        is_premium: !isFree,
        enabled: true,
        display_order: (fallback as any).display_order ?? 999,
        progressPercent: 0,
        totalTopics: 0,
        completedTopics: 0,
        accuracy: 0,
        weakTopics: [],
        strongTopics: [],
        studyTimeHours: 0,
        streakDays: 0,
        isCore: isFreeCambridgeSubject(fallback.name)
      };
    }
    return undefined;
  };

  const awardXp = async (amount: number, options?: { streakIncrement?: boolean }) => {
    if (amount <= 0) return;
    const newXp = (profile.xpPoints || 0) + amount;
    const newLevel = Math.max(1, Math.floor(newXp / 1000) + 1);
    const newStreak = options?.streakIncrement ? (profile.streakDays || 0) + 1 : profile.streakDays;

    const updated = {
      ...profile,
      xpPoints: newXp,
      level: newLevel,
      streakDays: newStreak,
    };
    setProfile(updated);
    saveProfileToStorage(updated);

    if (user?.id) {
      try {
        await supabase.from('profiles').update({
          xp_points: newXp,
          level: newLevel,
          streak_days: newStreak,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (e) {
        console.warn('Error saving XP to profiles:', e);
      }
    }

    window.dispatchEvent(new CustomEvent('levelhub:xp_updated', {
      detail: { xpEarned: amount, newXp, newLevel, newStreak }
    }));
  };

  // Live listener for levelhub:xp_updated across browser tabs and components
  useEffect(() => {
    const handleXpEvent = (e: any) => {
      const detail = e.detail;
      if (detail) {
        setProfile(prev => {
          const updatedXp = detail.newXp !== undefined ? detail.newXp : prev.xpPoints + (detail.xpEarned || 0);
          const updatedLevel = detail.newLevel ?? Math.max(1, Math.floor(updatedXp / 1000) + 1);
          const updatedStreak = detail.newStreak ?? prev.streakDays;
          return {
            ...prev,
            xpPoints: updatedXp,
            level: updatedLevel,
            streakDays: updatedStreak
          };
        });
      }
    };
    window.addEventListener('levelhub:xp_updated', handleXpEvent);
    return () => window.removeEventListener('levelhub:xp_updated', handleXpEvent);
  }, []);

  // Live listener for levelhub:programme_changed across browser components
  useEffect(() => {
    const handleProgEvent = (e: any) => {
      const detail = e.detail;
      if (detail?.programme) {
        const prog = detail.programme as ProgrammeType;
        setProfile(prev => {
          if (prev.programme === prog) return prev;
          const next = {
            ...prev,
            programme: prog,
            programmeLabel: PROGRAMME_LABELS[prog] || prev.programmeLabel,
          };
          saveProfileToStorage(next);
          return next;
        });
      }
    };
    window.addEventListener('levelhub:programme_changed', handleProgEvent);
    return () => window.removeEventListener('levelhub:programme_changed', handleProgEvent);
  }, []);

  return (
    <StudentProgrammeContext.Provider
      value={{
        profile,
        programme: profile.programme,
        programmeLabel: profile.programmeLabel,
        subjects: programmeSubjects,
        coreSubjects,
        otherSubjects,
        freeSubjects,
        proSubjects,
        limitedSubjects,
        userSelectedSubjects,
        rawSubjects,
        loading,
        setProgramme,
        updateProfile,
        toggleSubjectSelection,
        getSubjectById,
        getSubjectBySlug,
        awardXp,
      }}
    >
      {children}
    </StudentProgrammeContext.Provider>
  );
};

export const useStudentProgramme = () => {
  const context = useContext(StudentProgrammeContext);
  if (!context) {
    throw new Error('useStudentProgramme must be used within a StudentProgrammeProvider');
  }
  return context;
};

// Storage Helpers
function DEFAULTProfileFromStorage(): StudentProfileData {
  try {
    const raw = localStorage.getItem('levelhub_student_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset any legacy hardcoded mock stats from previous versions
      if (parsed.xpPoints === 4250 || parsed.streakDays === 5 || parsed.coins === 120) {
        parsed.xpPoints = 0;
        parsed.streakDays = 0;
        parsed.level = 1;
        parsed.coins = 0;
      }
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch (e) {
    // Fallback
  }
  return DEFAULT_PROFILE;
}

function saveProfileToStorage(p: StudentProfileData) {
  try {
    localStorage.setItem('levelhub_student_profile', JSON.stringify(p));
  } catch (e) {
    // Fallback
  }
}
