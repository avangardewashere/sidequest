# Phase 6.3 - Account Self-Service (Tracker)

Pair with `phase-6-3-account-self-service-plan.md`.

Status legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

Phase status: `[ ]` pending

## A. Contract and scope guardrails

- [ ] Confirm scope is password reset + account deletion only (no sessions list, no 2FA).
- [ ] Confirm anti-enumeration: identical response shape and timing for `/forgot`.
- [ ] Confirm `tokenVersion` bump invalidates JWTs across server checks.
- [ ] Confirm 30-day purge executor is explicitly deferred.

## B. Backend/API

- [ ] Add `src/models/PasswordResetToken.ts` (unique tokenHash, TTL on expiresAt).
- [ ] Extend `User` model with `deletedAt`, `tokenVersion`, `purgeAfter`.
- [ ] Update `src/lib/auth.ts` `jwt`/`session` callbacks to enforce `tokenVersion`.
- [ ] Add `src/lib/mailer.ts` with prod + dev-console implementations.
- [ ] Add `POST /api/auth/forgot` route.
- [ ] Add `POST /api/auth/reset` route.
- [ ] Add `DELETE /api/you/account` route (re-auth required).

## C. UI and pages

- [ ] Add `src/app/forgot/page.tsx` with the request-reset form.
- [ ] Add `src/app/reset/page.tsx` with the token consumption form.
- [ ] Extend `/you` with a Delete-account section + password re-auth modal.
- [ ] Add a "Forgot password?" link on the login form.

## D. Validation and tests

- [ ] Add `src/tests/auth-forgot.test.ts`.
- [ ] Add `src/tests/auth-reset.test.ts`.
- [ ] Add `src/tests/account-delete.test.ts`.
- [ ] Add `e2e/password-reset.spec.ts`.
- [ ] Add `e2e/account-delete.spec.ts`.
- [ ] `npm run test:ci`
- [ ] `npm run typecheck`
- [ ] scoped lint (`src` + `e2e`)
- [ ] `npm run build`

## E. Docs and closeout

- [ ] Add Phase 6.3 closeout note to `documentation/status/progress-summary.md`.
- [ ] Update `documentation/plans/cycles/cycles-4-5-6-roadmap.md` Phase 6.3 status.
- [ ] Add a brief env doc entry for the email provider in `documentation/ops/`.
- [ ] Record evidence summary below.

## Blockers

- None yet. Likely candidate: production email provider account/keys (Resend or chosen alternative).

## Decision log

- YYYY-MM-DD: Choose email provider (Resend vs alternative).
- YYYY-MM-DD: Confirm anti-enumeration timing strategy (constant 200 + minimum delay).

## Out-of-scope confirmations

- [ ] No sessions list or remote revoke.
- [ ] No 2FA / TOTP.
- [ ] No hard-delete executor.
- [ ] No rich email template system.

## Exit criteria

- [ ] Reset flow works in dev with the console mailer.
- [ ] Account delete soft-deletes and invalidates active sessions.
- [ ] Tests and quality gates pass.
- [ ] Closeout docs updated.

## Evidence summary

- (Filled in at closeout.)
