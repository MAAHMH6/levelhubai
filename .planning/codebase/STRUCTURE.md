---
last_mapped_commit: none
---
# Directory Structure

**Date:** 2026-07-30

## Root Directory
- `src/` — Application source code.
- `public/` — Static assets and configurations (e.g., `_redirects`).
- `supabase/` — Supabase configurations and edge functions (if applicable).
- `eslint.config.js`, `vite.config.ts`, `tailwind.config.ts` — Build and tooling configurations.

## Source Directory (`src/`)
- `components/` — Reusable UI components (includes Shadcn UI).
- `contexts/` — React Context providers (`AuthContext`, `LanguageContext`).
- `data/` — Static data or mock data files.
- `hooks/` — Custom React hooks.
- `integrations/` — Third-party integration configurations (e.g., Supabase clients).
- `lib/` — Utility functions and helpers (e.g., `analytics`).
- `pages/` — Page-level components mapped directly to routes in `App.tsx`.
- `services/` — Service layer functions for API/database interactions.
- `types/` — TypeScript interfaces and type definitions.

## Key Files
- `src/main.tsx` — Application entry point.
- `src/App.tsx` — Root component containing provider wrapping and route definitions.
- `src/index.css` — Global CSS and Tailwind directives.
