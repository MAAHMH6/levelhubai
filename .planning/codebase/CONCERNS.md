---
last_mapped_commit: none
---
# Technical Concerns & Debt

**Date:** 2026-07-30

## 1. Testing Coverage
**Concern**: There is absolutely no testing framework installed or configured in the project.
**Impact**: High risk of regressions during refactoring or new feature additions. UI changes might break existing workflows.

## 2. Environment Variables & Secrets
**Concern**: The project uses an `.env` file, presumably for Supabase (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) and other API keys. 
**Impact**: Need to ensure strict validation of these environment variables at runtime, and verify that no sensitive secrets (like service role keys) are exposed to the client.

## 3. Large Asset Sizes & Locking
**Concern**: `bun.lock` and `package-lock.json` are both present. 
**Impact**: Using two package managers simultaneously can cause dependency mismatches or CI/CD discrepancies. It's recommended to standardize on one package manager (either npm or bun).
