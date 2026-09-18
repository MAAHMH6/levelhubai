---
last_mapped_commit: none
---
# Architecture

**Date:** 2026-07-30

## System Design
- **Single Page Application (SPA)**: The application is built as a React SPA using Vite.
- **Client-Side Rendering (CSR)**: All routing and rendering happen on the client. Entry point is `src/main.tsx` injecting into `index.html`.

## Layers & Data Flow
1. **Providers**: The root `src/App.tsx` wraps the application in several context providers: `QueryClientProvider`, `ThemeProvider`, `AuthProvider`, `LanguageProvider`, and `TooltipProvider`.
2. **Routing**: `BrowserRouter` and `Routes` from React Router define page-level components (e.g. `Index`, `Auth`, `Dashboard`, `Learn`).
3. **Data Fetching**: Queries and mutations are managed by React Query (`@tanstack/react-query`). 
4. **State Management**: Global state is handled via React Contexts (`AuthContext`, `LanguageContext`), while server state is handled via React Query.
5. **UI Layer**: Shadcn UI components and custom components populate the pages.

## Key Abstractions
- **Contexts**: Encapsulate domain-specific logic (e.g., Auth, Language).
- **Hooks**: Custom hooks in `src/hooks/` encapsulate reusable logic.
- **Services/Integrations**: Logic for interacting with Supabase and PostHog is abstracted into `src/services/` and `src/integrations/`.
