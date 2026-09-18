import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  if (initialized) return;
  const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  const host = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || "https://us.i.posthog.com";
  if (!key) {
    console.warn("[analytics] VITE_POSTHOG_KEY missing — PostHog disabled");
    return;
  }
  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    autocapture: true,
    session_recording: { maskAllInputs: true },
    disable_session_recording: false,
    persistence: "localStorage+cookie",
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug(false);
    },
  });
  initialized = true;
}

export function identifyUser(userId: string, email?: string | null, traits?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, { email: email ?? undefined, ...traits });
}

export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}

export type AnalyticsEvent =
  | "user_signed_up"
  | "user_logged_in"
  | "quiz_started"
  | "quiz_completed"
  | "lesson_completed"
  | "xp_earned"
  | "streak_updated"
  | "ai_tutor_used"
  | "subscription_purchased";

export function track(event: AnalyticsEvent | string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export { posthog };
