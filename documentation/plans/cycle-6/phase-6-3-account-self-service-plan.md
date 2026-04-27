# Phase 6.3 - Account Self-Service (Execution Plan)

Cycle 6 / Phase 6.3. Companion tracker: `phase-6-3-account-self-service-tracker.md`.

## Goal

Let users recover access (password reset via email) and remove their account (with re-auth + soft-delete grace) without contacting support, using a minimal email-provider integration and the existing `/you` profile surface.

## Scope

### In scope

- `PasswordResetToken` model with single-use token, 30-minute TTL, user-id reference.
- `POST /api/auth/forgot` — accepts email, issues hashed token, sends reset link.
- `POST /api/auth/reset` — verifies token, sets new bcrypt password hash, invalidates token, bumps `tokenVersion`.
- `/forgot` and `/reset` pages.
- `DELETE /api/you/account` — requires current-password re-auth, soft-deletes the user (sets `deletedAt`), bumps `tokenVersion` to invalidate active JWTs, records a 30-day purge marker.
- `/you` adds a "Delete account" surface with the re-auth confirmation dialog.
- Tests + E2E for the full reset flow and the deletion confirmation.

### Out of scope

- Sessions list and remote revoke.
- 2FA / TOTP.
- Hard-delete background job (the marker is recorded; the executor is its own future phase).
- Rich email templates beyond plain text + reset link.
- Password complexity rules beyond the existing `min(6)` from registration.

## Architecture decisions

1. The mailer is wrapped in `src/lib/mailer.ts` exposing a single `sendEmail({ to, subject, text, html? })`. In dev/test, the implementation logs to console and returns a deterministic message id. Production uses Resend (or any provider with a free tier) wired via env.
2. Reset tokens are random 32-byte URL-safe strings. The DB stores only the sha-256 hash; the raw token is only ever in the email link.
3. `/forgot` always returns 200 in the same response time regardless of whether the email exists (anti-enumeration).
4. Soft-delete sets `User.deletedAt` and bumps `User.tokenVersion`. NextAuth's `jwt`/`session` callbacks read `tokenVersion` and reject mismatched JWTs.
5. The 30-day purge marker is recorded on the user record (`purgeAfter: Date`); the executor (cron/worker) is explicitly out of scope.

## API/data/component contracts

- New model: `src/models/PasswordResetToken.ts` — `{ userId, tokenHash, expiresAt }`. Indexes: unique on `tokenHash`, TTL on `expiresAt`.
- `User` extension: `deletedAt: Date | null`, `tokenVersion: number` (default 0), `purgeAfter: Date | null`.
- `src/lib/auth.ts` — `jwt` callback bakes `tokenVersion` into the JWT; `session` callback rejects when DB `tokenVersion` differs.
- New routes: `POST /api/auth/forgot`, `POST /api/auth/reset`, `DELETE /api/you/account`.
- New pages: `src/app/forgot/page.tsx`, `src/app/reset/page.tsx`.
- `/you` page: adds a Delete-account section with confirm-via-password modal.

## Testing plan

- Unit/integration:
  - `src/tests/auth-forgot.test.ts` — token issuance, mail dispatch, anti-enumeration response shape and timing.
  - `src/tests/auth-reset.test.ts` — valid token, expired, replayed, mismatched user, password-too-short.
  - `src/tests/account-delete.test.ts` — re-auth required, soft-delete fields set, JWT invalidated by `tokenVersion`.
- E2E:
  - `e2e/password-reset.spec.ts` — forgot → email link captured (mailer dev mode) → reset → login.
  - `e2e/account-delete.spec.ts` — happy path with re-auth + post-delete login attempt fails.

## Quality gates

- `npm run test:ci`
- `npm run typecheck`
- scoped lint (`src` + `e2e`)
- `npm run build`

## Acceptance criteria

- Reset flow works end to end with the dev mailer; production env wires Resend (or chosen provider) cleanly via env.
- Anti-enumeration: response timing and body identical for known/unknown emails.
- Account delete soft-deletes, invalidates the active JWT, and prevents future logins.
- 30-day purge marker is recorded; actual purge is documented as deferred.
- Quality gates pass and closeout docs are updated.
