---
last_mapped_commit: none
---
# Testing Practices

**Date:** 2026-07-30

## Overview
Currently, there are no testing frameworks configured in the codebase. 

## Missing Infrastructure
- **Unit Testing**: No framework (like Vitest or Jest) is installed in `package.json`.
- **Component Testing**: No tools like React Testing Library are present.
- **E2E Testing**: Cypress or Playwright are not configured.

## Recommendations
- Given the Vite ecosystem, adding **Vitest** + **React Testing Library** would be the idiomatic choice for component and unit testing.
- Test files should eventually live alongside components as `*.test.tsx` or `*.spec.tsx`.
