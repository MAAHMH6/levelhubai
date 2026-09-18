---
last_mapped_commit: none
---
# Conventions

**Date:** 2026-07-30

## Coding Style
- **TypeScript**: Strict type-checking is enabled. Interfaces and Types are encouraged and placed inside `src/types/` for global use or alongside components.
- **Components**: Functional components utilizing React Hooks. 
- **Naming Conventions**: 
  - PascalCase for React component files (`App.tsx`, `Index.tsx`) and interfaces.
  - camelCase for utility functions, hooks, and variable names.
  - kebab-case for CSS classes (Tailwind).

## UI & Styling Patterns
- **Tailwind + Shadcn**: Components are styled using Tailwind CSS classes. Dynamic class string generation is done via `clsx` and `tailwind-merge` (`cn` utility pattern).
- **Forms**: React Hook Form is used with Zod schemas for strict validation and consistent error handling.

## Error Handling
- Handled at the query level with `@tanstack/react-query` for API/Supabase calls.
- UI feedback is provided via the `sonner` and `toaster` UI components (Toast notifications).
