import type { PlanTier } from "@/hooks/useSubscription";

export const DEFAULT_FREE_SUBJECTS = ["mathematics", "physics", "ict"];
export const DEFAULT_FREE_QUIZ_LIMIT = 20;

export function canAccessSubject(
  plan: PlanTier,
  subjectSlug: string | undefined | null,
  freeSubjects: string[] = DEFAULT_FREE_SUBJECTS,
): boolean {
  if (plan === "pro" || plan === "school") return true;
  if (!subjectSlug) return false;
  return freeSubjects.includes(subjectSlug.toLowerCase());
}

export function canUseAITutor(plan: PlanTier): boolean {
  return plan === "pro" || plan === "school";
}

export function canUsePastPapers(plan: PlanTier): boolean {
  return plan === "pro" || plan === "school";
}

export function canStartQuiz(
  plan: PlanTier,
  todayCount: number,
  limit: number = DEFAULT_FREE_QUIZ_LIMIT,
): boolean {
  if (plan === "pro" || plan === "school") return true;
  return todayCount < limit;
}
