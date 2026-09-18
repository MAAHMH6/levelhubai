import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSubjectSlug(slug: string | undefined): string {
  if (!slug) return "";
  const slugOverrides: Record<string, string> = { "ict": "ICT" };
  if (slugOverrides[slug.toLowerCase()]) {
    return slugOverrides[slug.toLowerCase()];
  }
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
