# Phase 6.6 - Ship And Monitor (Execution Plan)

Cycle 6 / Phase 6.6. Companion tracker: `phase-6-6-ship-and-monitor-tracker.md`.

## Goal

Close Cycle 6 by adding error telemetry, basic uptime monitoring, and the legal pages required for public launch — then declare the cycle done with a 48-hour post-launch monitoring window.

## Scope

### In scope

- Sentry (or chosen equivalent) integration for browser + server with PII scrubbing in `beforeSend`.
- Static `/privacy` and `/terms` pages with footer links.
- External uptime check hitting a new `/api/health` endpoint every 5 minutes.
- New `/api/health` endpoint returning DB-reachability + build SHA, rate-limited to 60 req/min/IP.
- Footer component (version + legal links) wired into the root layout.
- Post-launch monitoring runbook in `documentation/ops/`.

### Out of scope

- Custom status page UI (the external monitor's public page is sufficient).
- Distributed tracing / APM beyond Sentry's bundled offering.
- Marketing site or pricing page.
- Auto-paging / on-call rotation tooling.

## Architecture decisions

1. Sentry initialization is environment-gated; never sends events in dev/test (`NODE_ENV` and explicit `SENTRY_ENABLED=true`).
2. `beforeSend` scrubs `email`, `password`, `Authorization` headers, and any cookie before dispatch.
3. `/api/health` is unauthenticated but rate-limited (60 req/min/IP) to avoid being a free DB-status oracle.
4. Legal pages are static TSX in `src/app/(legal)/` with no client logic and no dynamic data fetches.
5. The monitoring runbook is a checklist; alert routing is whoever's on call (currently the solo author).

## API/data/component contracts

- `src/lib/sentry.ts` wires browser + server SDKs and exports a no-op shim in dev/test.
- `src/app/api/health/route.ts` returns `{ ok, dbOk, sha, ts }` with a simple in-memory rate limiter.
- `src/app/(legal)/privacy/page.tsx`, `src/app/(legal)/terms/page.tsx`.
- `src/components/system/footer.tsx` mounted in `src/app/layout.tsx`.

## Testing plan

- Unit/integration:
  - `src/tests/api-routes-health.test.ts` — DB-reachable + DB-unreachable cases, rate-limit window.
  - `src/tests/sentry-init.test.ts` — no events sent in test env, `beforeSend` scrubs the documented fields.
- E2E:
  - `e2e/legal-pages.spec.ts` — privacy + terms reachable from footer on every authenticated and public page sampled.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- A forced exception in production preview produces a Sentry event with PII scrubbed.
- `/api/health` returns 200 and `{ dbOk: true }` in production.
- External uptime monitor is configured and pinging successfully.
- Privacy + terms pages are reachable from a footer link on every page.
- The 48-hour post-launch monitoring runbook is checked off with no P0 incidents.
- Quality gates pass and closeout docs are updated.
