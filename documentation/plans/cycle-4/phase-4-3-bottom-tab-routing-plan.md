# Phase 4.3 - Bottom Tab Routing (Execution Plan)

Cycle 4 / Phase 4.3. Companion tracker: `phase-4-3-bottom-tab-routing-tracker.md`.

## Goal

Replace presentational bottom tabs with real route navigation for authenticated app surfaces: `/`, `/quests/view`, `/stats`, `/you`.

## Scope

### In scope

- Route-driven tab active state.
- Real tab navigation using `next/link`.
- Canonical tab-route map in one shared module.
- Minimal `/you` route shell to make navigation complete.
- Routing tests + one focused e2e happy path.

### Out of scope

- Profile/settings implementation details (Phase 4.4).
- Onboarding logic (Phase 4.5).
- Reminder scheduling or service-worker routing behavior.

## Architecture decisions

1. Active tab state is derived from pathname, not local React state.
2. Tab click navigation uses links and router-managed transitions.
3. Canonical route mapping is centralized to avoid duplicated route literals.
4. `/you` ships as minimal shell for navigation integrity only.

## Contracts and affected areas

### Routing contract

- `today -> /`
- `quests -> /quests/view`
- `stats -> /stats`
- `you -> /you`

### UI contract

- Bottom tab visuals remain stable from current design.
- Active state reflects current route.
- Keyboard and screen-reader navigation remain valid.

## Testing plan

- Unit:
  - tab-route mapping helper behavior
  - active-tab resolution from pathname
- E2E:
  - authenticated route switching across tabs

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Bottom tabs navigate to real routes and highlight correctly.
- `/you` route is reachable and stable.
- Existing auth protection/redirect behavior remains intact.
- Route-switching tests and focused e2e pass.
- Closeout note added to `documentation/status/progress-summary.md`.
