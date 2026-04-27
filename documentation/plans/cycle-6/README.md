# Cycle 6 - Platform And Distribution (Execution Guide)

This README is the entry point for Cycle 6. Read it once at cycle kickoff, then drop into per-phase plan + tracker pairs as you execute each phase.

## Purpose

Cycles 4 and 5 hardened the loop and added personalization. Cycle 6 takes SideQuest from "shipped" to "publicly distributable, observable, and resilient":

- installable as a PWA (6.1)
- usable offline for the two key mutations (6.2)
- self-serviceable for password reset and account deletion (6.3)
- portable: users can export their own data (6.4)
- celebratory: yearly recap with a shareable card (6.5)
- monitored and legally launch-ready (6.6)

## How to use this guide

1. Read this README in full at the start of the cycle.
2. Before opening any code for a phase, read its `phase-6-<m>-<slug>-plan.md` end-to-end.
3. Open the matching tracker and work it top to bottom (sections A → E).
4. Close each phase with quality gates + a closeout note in `documentation/status/progress-summary.md`.
5. Move to the next phase only after the prior tracker is fully `[x]` and the roadmap is updated.

## Phase order and dependency map

Per `documentation/plans/cycles/cycles-4-5-6-roadmap.md`:

```
6.1 PWA installability ─▶ 6.2 Offline mode
                       │
                       └▶ 6.3 Account self-service ─▶ 6.4 Data portability
                                                  │
                                                  └▶ 6.5 Year-in-review ─▶ 6.6 Ship & monitor
```

Hard dependencies:

- 6.2 depends on 6.1 (offline queue assumes the SW + manifest baseline).
- 6.6 depends on 6.5 being merged so the recap is part of the launch surface.

Plannable in parallel, implement sequentially:

- 6.3 and 6.4 can be designed in parallel; ship 6.3 first because it touches auth core.

## Phase one-liners

| Phase | Title | Branch | Estimated effort |
|---|---|---|---|
| 6.1 | PWA installability | `cycle-6/phase-1-pwa` | 1.5 days |
| 6.2 | Real offline mode | `cycle-6/phase-2-offline` | 2 days |
| 6.3 | Account self-service | `cycle-6/phase-3-account` | 2 days |
| 6.4 | Data portability | `cycle-6/phase-4-portability` | 1 day |
| 6.5 | Year-in-review recap | `cycle-6/phase-5-recap` | 1.5 days |
| 6.6 | Ship and monitor | `cycle-6/phase-6-monitor` | 1 day |

Total: ~9 working days end to end. Pad ~30% for review/polish; budget two calendar weeks.

## Standard execution loop (apply to every phase)

1. **Branch** from `main` using the suggested branch name above.
2. **Read** the plan + tracker pair top-to-bottom before touching code.
3. **Confirm guardrails** by ticking tracker section A. This is the most-skipped step and the most-valuable: it's what keeps scope tight.
4. **Implement backend** (tracker section B) → run targeted tests after each route or model change.
5. **Implement UI/hooks** (tracker section C) → eyeball on `localhost:3000` after each surface.
6. **Tests + quality gates** (tracker section D). All four gates must pass before the PR opens:
   - `npm run test:ci`
   - `npm run typecheck`
   - `npm run lint` (or scoped: `npx eslint src e2e --ext .ts,.tsx`)
   - `npm run build`
7. **Docs + closeout** (tracker section E):
   - append a closeout block to `documentation/status/progress-summary.md`
   - flip the phase status in `documentation/plans/cycles/cycles-4-5-6-roadmap.md`
   - fill in the tracker's Evidence summary
8. **PR** with title `Cycle 6 / Phase 6.X: <title>`, body links the plan + tracker, lists the acceptance criteria.

## Daily checklist (copy to your daily note)

```
- [ ] Pull main, branch.
- [ ] Re-read today's phase plan section by section.
- [ ] Open the tracker, mark current section [~].
- [ ] Implement, test, eyeball.
- [ ] Mark each tracker bullet [x] only when its acceptance is real.
- [ ] At EOD: commit WIP, push, append a one-line "stopped at X" note at the bottom of the tracker.
```

## Cycle 6 exit criteria (roll-up)

- All six phase trackers closed (`[x]`) with full Evidence summary.
- Lighthouse PWA category score >= 90 in production (Phase 6.1).
- Mutation queue drains cleanly under simulated offline → online (Phase 6.2).
- Password reset and account deletion are end-to-end functional with the dev mailer (Phase 6.3).
- Authenticated user can download a complete NDJSON export (Phase 6.4).
- `/recap` is reachable and renders for a populated account (Phase 6.5).
- Production has Sentry telemetry, an `/api/health` endpoint, an external uptime monitor, and footer-linked privacy + terms (Phase 6.6).
- A `Cycle 6 Summary Status` block is appended to `documentation/status/current-status-architecture.md`.

## Cross-cycle risk register

| Risk | First-touched phase | Mitigation |
|---|---|---|
| Service worker caches stale auth-protected responses | 6.1 | SW caching restricted to a static asset allowlist; never cache `/api/*`. |
| IndexedDB schema drift between releases | 6.2 | Version the IDB store, on mismatch nuke and refetch. |
| Email deliverability for password reset | 6.3 | Wrap a `sendEmail` interface; in dev, log to console with a usable reset link. |
| Account-delete leaves orphaned related records | 6.3 | Soft-delete only in 6.3; document the hard-delete purge job as deferred. |
| Export size unbounded | 6.4 | Stream NDJSON; return 413 if any single collection exceeds 50 MB. |
| Recap shareable image leaks PII | 6.5 | Card uses display name only; no email, no auth token. |
| Telemetry SDK PII leakage | 6.6 | `beforeSend` scrubs email, password, JWT, and any `Authorization` header. |

## Where to log progress

- Per-phase closeout: a new `## N) Phase 6.X closeout` section in `documentation/status/progress-summary.md`.
- Roadmap status flip: `documentation/plans/cycles/cycles-4-5-6-roadmap.md`.
- Cycle 6 closeout: a `Cycle 6 Summary Status` block appended to `documentation/status/current-status-architecture.md`, mirroring the existing Cycle 1/2/3 closeout sections.

## Common pitfalls (read once before starting)

- **Don't cache anything under `/api/*` in the service worker.** It looks fine in dev and is a security incident in production.
- **Don't add an import endpoint in 6.4 just because export feels lonely.** Import is a bigger phase on its own.
- **Don't ship 6.6 without verifying Sentry's `beforeSend` scrubs PII** in a real production preview deploy. Test with a forced exception that contains a fake email.
- **Don't tackle 2FA or sessions list inside 6.3.** They are explicitly deferred. Adding them blows the phase budget and delays 6.4-6.6.
- **Don't skip the closeout note** even on small phases. The progress-summary is your future onboarding doc.
