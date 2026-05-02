# Phase 9.1 — Cascade & XP integrity (Tracker)

Companion plan: `phase-9-1-cascade-xp-plan.md`.

## Inventory (Slice A)

**Complete / undo**

- API: `PATCH` / `DELETE` on [`src/app/api/quests/[id]/complete/route.ts`](../../src/app/api/quests/[id]/complete/route.ts).
- Client: `completeQuestById`, undo helpers in [`src/lib/client-api.ts`](../../src/lib/client-api.ts); [`useDashboardActions`](../../src/hooks/useDashboardActions.ts); [`quest-detail-client.tsx`](../../src/app/quests/[id]/quest-detail-client.tsx); [`quest-list-view-client.tsx`](../../src/app/quests/view/quest-list-view-client.tsx). Today home completion stays single-quest (no cascade prompt in v1).

**Delete**

- API: `DELETE` [`src/app/api/quests/[id]/route.ts`](../../src/app/api/quests/[id]/route.ts) with JSON `{ confirmTitle, childDisposition?: "reparent-to-root" | "cascade-delete" }`; `400` + `SUBTASKS_REQUIRE_DISPOSITION` when subtasks exist and disposition omitted.
- Client: [`quest-form.tsx`](../../src/components/quests/quest-form.tsx) + [`edit/page.tsx`](../../src/app/quests/[id]/edit/page.tsx) via `deleteQuestById`.

**JSON contracts (locked)**

- Complete: optional `{ cascadeCompleteChildren?: boolean }` (default false).
- Delete: required `confirmTitle`; when `childCount > 0`, required `childDisposition`.

## Checklist

- [x] Inventory: complete/delete flows, XP award paths, quest parent-child schema usage
- [x] Parent complete: optional cascade complete children (default no); tests
- [x] Parent delete: re-parent vs cascade-delete UX + API behavior; tests
- [x] XP rollup: parents with children roll up from leaves; activate on first child; preserve parents-without-children XP
- [x] Habit XP: per-completion awards; streak bonuses via `MilestoneRewardLog` only; tests where feasible
- [x] Docs: cycles plan §9.1 status; progress-summary entry when closing
- [x] Gates: `npm run test:ci`, `typecheck`, `lint`, `build`

## Status

**Closed.** Implementation: `xpEarnedForQuestCompletion` in [`src/lib/quest-xp-rollup.ts`](../../src/lib/quest-xp-rollup.ts); route tests in [`src/tests/quest-delete-route.test.ts`](../../src/tests/quest-delete-route.test.ts), [`src/tests/quest-xp-rollup.test.ts`](../../src/tests/quest-xp-rollup.test.ts).
