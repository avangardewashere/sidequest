# Chapter 4 - Todo Core Hardening And API Observability

This chapter documents the latest implementation wave focused on making the quest/todo workflow safer, clearer, and easier to debug in production-like environments.

## 1) What changed in this phase

- Added route-level auth protection for quest-focused pages.
- Moved quest list filtering/sorting into the backend API.
- Added typed confirmation for destructive delete operations.
- Improved user-facing error messages for quest actions.
- Added opt-in global API logging gated by URL query param.

These changes prioritize the main todo loop first; analytics UI work remains deferred.

## 2) Core todo functionality improvements

## Route protection for quest surfaces

- Added `src/middleware.ts` to protect:
  - `/quests/:path*`
  - `/stats`
- If user is not authenticated, requests are redirected to `/` with `callbackUrl`.
- Why this matters:
  - central auth gate for protected routes
  - avoids relying only on per-page checks

## Server-side quest list query handling

- Updated `GET /api/quests` in `src/app/api/quests/route.ts`:
  - supports `status`, `category`, `sort`, optional `limit`
  - validates query params with Zod
  - returns `400` for invalid query input
- Added list query type in `src/lib/quest-selectors.ts`:
  - `QuestListQuery`
- Updated `src/lib/client-api.ts` and `src/app/quests/view/page.tsx`:
  - list requests now call API with query params
  - view page reloads based on active filters
- Why this matters:
  - list behavior scales better with larger datasets
  - filtering/sorting rules become API-consistent

## Safer delete operation

- Updated `DELETE /api/quests/:id` in `src/app/api/quests/[id]/route.ts`:
  - requires `confirmTitle` in request body
  - compares against stored quest title (trimmed)
  - returns `400` on mismatch
- Updated `src/app/quests/[id]/edit/page.tsx`:
  - requires user to type quest title before enabling delete
  - sends `confirmTitle` through `deleteQuestById(...)`
- Why this matters:
  - reduces accidental destructive deletes
  - provides explicit user intent for irreversible action

## 3) Error UX enhancement for quest actions

Improved feedback quality for create/edit/complete/delete flows.

## Shared client-side error mapping

- Added action wrapper and error mapping in `src/lib/client-api.ts`:
  - `ActionResult<T>` with `ok`, `message`, `errorCode`, `data`
  - maps common statuses:
    - `401` -> session expired message
    - `400/409/422` -> validation/conflict guidance
    - `5xx` -> server fallback message
    - network failure -> connection guidance

## Hook/page integration

- Updated:
  - `src/hooks/useDashboardActions.ts`
  - `src/app/quests/create/page.tsx`
  - `src/app/quests/[id]/edit/page.tsx`
- Failure states now surface contextual messages instead of generic fallback text.
- Success flows, redirects, and reload behavior were preserved.

## 4) Global API logger (`showlogger=true` gated)

## Logger utility

- Added `src/lib/server-logger.ts` with:
  - `isRequestLoggingEnabled(request)`
  - `createRequestLogger(request, meta?)`
  - `logRequestException(...)`
- Logging output is structured JSON and emits only when:
  - request URL includes `showlogger=true`

## API route integration

Logger wired into key server routes:

- `src/app/api/auth/register/route.ts`
- `src/app/api/quests/route.ts`
- `src/app/api/quests/[id]/route.ts`
- `src/app/api/quests/[id]/complete/route.ts`
- `src/app/api/dailies/route.ts`
- `src/app/api/progression/route.ts`
- `src/app/api/metrics/summary/route.ts`

Logged event categories include:

- request start
- unauthorized/validation early exits
- success events for major operations
- exception events with safe error summaries

Privacy guardrails:

- no password or secret logging
- event payloads limited to IDs/status/counts/safe messages

## 5) Validation outcomes

- Lint and type/build checks passed after each implementation slice.
- Manual checks confirmed:
  - no logger output by default
  - structured JSON logs emitted when `showlogger=true` is present
  - unauthorized and validation paths produce `warn`/`error` events

## 6) Notes for next chapter

Potential next improvements:

- migrate deprecated `middleware` convention to Next.js `proxy` convention
- add focused API tests for quest critical paths
- enrich error code taxonomy for UI-specific message tuning
- add request correlation across API + service layers if needed

---

This chapter is the reference point for SideQuest's current "todo-core hardening" stage: safer quest operations, better failure feedback, and controlled server observability.
