---
last_mapped_commit: none
---
# Integrations

**Date:** 2026-07-30

## Backend & Database
- **Supabase** (`@supabase/supabase-js` v2.89.0): Serves as the primary backend for authentication, database, and potential edge functions. Configured through `src/integrations/`.

## Analytics & Tracking
- **PostHog** (`posthog-js` v1.393.5): Used for product analytics and tracking user behavior. Initialized in `src/main.tsx` via `src/lib/analytics`.

## External Services
- **Auth**: Handled by Supabase (context provided by `src/contexts/AuthContext.tsx`).
- **UI Services**: None explicit beyond local Shadcn UI.
