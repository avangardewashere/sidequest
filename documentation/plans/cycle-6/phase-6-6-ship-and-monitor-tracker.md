# Phase 6.6 - Ship And Monitor (Tracker)

Pair with `phase-6-6-ship-and-monitor-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm Sentry is environment-gated and `beforeSend` scrubs PII.
- [ ] Confirm `/api/health` is unauthenticated but rate-limited.
- [ ] Confirm legal pages are static (no client logic).
- [ ] Confirm out-of-scope items (custom status page, APM beyond Sentry, marketing site).

## B. Backend/API and ops

- [ ] Add `src/lib/sentry.ts` with prod + dev/test shim.
- [ ] Wire Sentry init in `src/app/layout.tsx` (browser) and a server boot path.
- [ ] Add `src/app/api/health/route.ts` with `{ ok, dbOk, sha, ts }` and rate limit.
- [ ] Configure external uptime monitor against `/api/health` (5-minute cadence).

## C. UI and pages

- [ ] Add `src/app/(legal)/privacy/page.tsx`.
- [ ] Add `src/app/(legal)/terms/page.tsx`.
- [ ] Add `src/components/system/footer.tsx` and mount in `src/app/layout.tsx`.

## D. Validation and tests

- [ ] Add `src/tests/api-routes-health.test.ts`.
- [ ] Add `src/tests/sentry-init.test.ts`.
- [ ] Add `e2e/legal-pages.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 6.6 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.6 status.
- [ ] Add `documentation/ops/post-launch-monitoring-runbook.md` (48-hour checklist).
- [ ] Append `Cycle 6 Summary Status` block to `documentation/status/current-status-architecture.md`.
- [ ] Record evidence summary below.

## Blockers

- None yet. Likely candidates: Sentry account/keys, uptime-monitor account.

## Decision log

- YYYY-MM-DD: Choose error-telemetry vendor (Sentry vs alternative).
- YYYY-MM-DD: Choose uptime monitor (UptimeRobot vs alternative).

## Out-of-scope confirmations

- [ ] No custom status-page UI.
- [ ] No APM beyond Sentry-bundled features.
- [ ] No marketing site / pricing page.

## Exit criteria

- [ ] Production preview emits a scrubbed Sentry event from a forced exception.
- [ ] Uptime monitor is green for 48 hours post-launch.
- [ ] Footer links work from every page sampled.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated and Cycle 6 summary block appended.

## Evidence summary

- (Filled in at closeout.)
