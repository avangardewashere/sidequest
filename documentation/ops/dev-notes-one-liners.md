# SideQuest Dev Notes (Phase-Based One-Liners)

Format: `- [Type] [Area] Change summary | Impact: ... | Ref: ...`

## Phase: Foundation (Chapter 1)

- [Feature] [Core] Established baseline stack with Next.js App Router, NextAuth credentials, and MongoDB models | Impact: enabled end-to-end quest gameplay foundation | Ref: `chapter-1.md`, `src/app/api/**`
- [Feature] [Quests] Implemented create/list/complete quest APIs with ownership and auth guards | Impact: core todo loop became functional and secure by default | Ref: `chapter-1.md`, `src/app/api/quests/route.ts`, `src/app/api/quests/[id]/complete/route.ts`
- [Feature] [Progression] Added XP, level, and streak calculations in shared domain libs | Impact: completions now drive gamified progression consistently | Ref: `chapter-1.md`, `src/lib/xp.ts`, `src/lib/progression.ts`
- [Feature] [Analytics] Added completion logs and summary metrics endpoint | Impact: provided data trail for balancing and retention tuning | Ref: `chapter-1.md`, `src/models/CompletionLog.ts`, `src/app/api/metrics/summary/route.ts`

## Phase: Retention Sprint (Chapter 2)

- [Feature] [Dailies] Added deterministic daily quest generation keyed by UTC date | Impact: improved repeat engagement with predictable daily content | Ref: `chapter-2.md`, `src/lib/dailies.ts`, `src/app/api/dailies/route.ts`
- [Feature] [Progression] Added streak milestone reward system with one-time reward logging | Impact: rewarded consistency while preventing duplicate payout bugs | Ref: `chapter-2.md`, `src/models/MilestoneRewardLog.ts`, `src/lib/progression.ts`
- [Feature] [Metrics] Expanded summary endpoint with daily and milestone counters | Impact: enabled retention-focused KPI visibility | Ref: `chapter-2.md`, `src/app/api/metrics/summary/route.ts`

## Phase: Stability And Refactor (Chapter 3)

- [Fix] [Database] Corrected MongoDB URI/database casing mismatch (`sideQuest`) | Impact: removed registration-breaking runtime DB error | Ref: `chapter-3.md`, `.env.local`, `src/lib/db.ts`
- [Fix] [Auth] Added duplicate-key fallback handling in registration (`11000` -> `409`) | Impact: eliminated race-condition registration failures with clearer responses | Ref: `chapter-3.md`, `src/app/api/auth/register/route.ts`
- [Refactor] [UI] Extracted dashboard nav and split dashboard logic into types/lib/hook layers | Impact: reduced page complexity and improved reuse/testability | Ref: `chapter-3.md`, `src/components/dashboard-nav.tsx`, `src/hooks/useDashboardActions.ts`

## Phase: Todo Core Hardening (Chapter 4)

- [Security] [Routing] Added centralized middleware protection for quest-focused routes | Impact: enforced auth boundary consistently across protected pages | Ref: `chapter-4.md`, `src/middleware.ts`
- [Feature] [Quests] Moved quest list filtering/sorting to server query params (`status`, `category`, `sort`, `limit`) | Impact: improved list scalability and API consistency | Ref: `chapter-4.md`, `src/app/api/quests/route.ts`
- [Fix] [Quests] Added typed delete confirmation (`confirmTitle`) in API and edit UI | Impact: reduced accidental destructive deletions | Ref: `chapter-4.md`, `src/app/api/quests/[id]/route.ts`, `src/app/quests/[id]/edit/page.tsx`
- [Feature] [UX] Introduced action-specific client error mapping (`ActionResult<T>`) for create/edit/complete/delete | Impact: improved recovery guidance for auth, validation, network, and server failures | Ref: `chapter-4.md`, `src/lib/client-api.ts`, `src/hooks/useDashboardActions.ts`
- [Observability] [API] Added query-gated global request logger (`showlogger=true`) with structured JSON events | Impact: enabled safe, opt-in server diagnostics without noisy default logs | Ref: `chapter-4.md`, `src/lib/server-logger.ts`, `src/app/api/**`

## Phase: Ops And Security (Ops Chapter)

- [Ops] [Secrets] Standardized local env setup for `MONGODB_URI` and `AUTH_SECRET` | Impact: reduced misconfiguration risk and setup ambiguity | Ref: `chapter-ops-secrets.md`
- [Security] [Rotation] Documented repeatable credential rotation steps for DB password and auth secret | Impact: improved incident readiness and secret hygiene | Ref: `chapter-ops-secrets.md`
- [Ops] [Verification] Defined post-rotation endpoint verification checklist | Impact: faster validation after secret changes and fewer silent regressions | Ref: `chapter-ops-secrets.md`
