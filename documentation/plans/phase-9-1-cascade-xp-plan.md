# Phase 9.1 — Cascade & XP integrity (Plan)

Cycle 9 / Phase 9.1. Companion tracker: `phase-9-1-cascade-xp-tracker.md`.

## Anchor (from [cycles-7-8-9-plan.md](cycles-7-8-9-plan.md) §9.1)

- Completing a **parent** prompts "complete N children?" (**default no**).
- Deleting a **parent** prompts **re-parent** vs **cascade-delete**.
- **XP:** parents **with** children no longer carry their own XP; XP **rolls up from leaves**. Rule **activates on first child** added; **existing XP preserved** on parents that never gain a child.
- **Habits:** each `CompletionLog` awards XP at the cadence rate; no per-streak-day double-counting; streak bonuses stay in `MilestoneRewardLog`.

## Suggested approach

1. Map current code paths: `POST` complete, quest delete, XP/progression updates, and any `parentQuestId` / children reads.
2. Add server-side decision points + idempotent tests before UI polish.
3. Wire UI prompts on detail and/or list where completion/delete already run.

## Out of scope (defer to 9.2+)

Full habit insights, PWA, dark theme (see cycles plan for later phases).
