# Chapter 3 - Stability Fixes And Frontend Refactor

This chapter documents the fixes and refactors completed after Chapter 2, focused on reliability, safer auth writes, and cleaner frontend architecture for reuse.

## 1) What was fixed

## MongoDB environment + database case mismatch

- Issue observed:
  - registration failed with Mongo error `code 13297`
  - message indicated DB already existed with different case (`sideQuest` vs `sidequest`)
- Resolution:
  - updated local `MONGODB_URI` database segment to match the existing Atlas DB name casing exactly (`sideQuest`)
- Why this matters:
  - database name casing mismatch can block writes and produce hard-to-debug runtime failures

## Duplicate-safe registration

- Existing behavior already checked for existing email before create.
- Added defensive duplicate-key handling in `POST /api/auth/register`:
  - catches Mongo duplicate-key (`code 11000`)
  - returns `409 Email already in use` instead of a generic `500`
- Why this matters:
  - pre-check alone is not enough under concurrent requests
  - DB-level uniqueness conflicts are now translated into a user-friendly response

## 2) Frontend architecture changes

## Navigation extraction

- Moved top navigation UI out of page component into:
  - `src/components/dashboard-nav.tsx`
- Nav now has:
  - Home route action
  - Logout action
- Why this matters:
  - cleaner page structure
  - reusable navigation component for future dashboard-related screens

## Action and data logic isolation

Refactor split `src/app/page.tsx` into composable layers:

- Types:
  - `src/types/dashboard.ts`
  - centralized `Quest`, `Profile`, and payload/response contracts
- Format helpers:
  - `src/lib/formatters.ts`
  - `getProgressPct(profile)`
  - `getCompletionFeedback(data)`
- Client API wrapper:
  - `src/lib/client-api.ts`
  - unified fetch/auth call surface for dashboard workflows
- Feature hook:
  - `src/hooks/useDashboardActions.ts`
  - owns dashboard interaction state and handlers (`loadData`, auth submit, create quest, complete quest)
- Page:
  - `src/app/page.tsx` now focuses primarily on rendering and binding handlers

## 3) Review findings after refactor

## High severity

- None found in current implementation.

## Medium severity

- Email uniqueness may still be case-sensitive depending on DB/index collation configuration.
  - Current check uses exact-value match.
  - Recommendation for future hardening:
    - normalize emails to lowercase at registration/login boundaries
    - enforce normalized storage or case-insensitive unique index strategy

## Low severity

- `fetchDashboardData()` currently falls back to empty arrays/null on non-OK responses.
  - This prevents crashes but can hide endpoint failures from users.
  - Recommendation:
    - add optional error-state return and show a non-blocking UI warning

## 4) Reusable pattern for future projects

Use this layering pattern for feature-heavy client pages:

1. Keep page components render-focused.
2. Move async workflows into a dedicated hook per feature.
3. Move all network calls into a client API module.
4. Keep pure derivation/formatting in helper modules.
5. Keep domain/request types centralized.

Suggested starter structure:

- `src/types/<feature>.ts`
- `src/lib/<feature>-api.ts`
- `src/lib/<feature>-formatters.ts`
- `src/hooks/use<Feature>Actions.ts`
- `src/components/<feature>/*.tsx`
- `src/app/<route>/page.tsx` (composition only)

## 5) Verification outcomes recorded

- Registration flow:
  - first registration request succeeds (`200`)
  - duplicate registration returns conflict (`409`)
- Dashboard:
  - nav is separated from page and placed in `src/components`
  - page continues to render profile, quest creation, and quest lists using extracted logic

---

This chapter is the baseline reference for stability and maintainability improvements. Next chapters can document advanced UI component decomposition and API error-state UX patterns.
