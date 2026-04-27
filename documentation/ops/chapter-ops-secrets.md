# Ops Chapter - Environment And Secret Rotation

This chapter documents secure setup and credential rotation for local and production-like environments.

## Local environment checklist

1. Create `.env.local` in project root.
2. Set `MONGODB_URI` with Atlas URI + database name.
3. Set `AUTH_SECRET` with a random value (32+ bytes recommended).
4. Ensure `.env.local` is never committed (`.env*` is ignored in `.gitignore`).

## Required variables

- `MONGODB_URI`
  - Example format:
  - `mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority`
- `AUTH_SECRET`
  - Used to sign/verify auth tokens and sessions.
  - Must not match DB password.

## Credential safety rules

- Never paste credentials in source files, docs, or commits.
- Never reuse the DB password as app auth secret.
- Rotate immediately if a credential is exposed in chat, screenshots, logs, or terminal history.

## Rotation procedure

## MongoDB password rotation

1. Open MongoDB Atlas and edit DB user credentials.
2. Set a new strong password.
3. Update `MONGODB_URI` in `.env.local`.
4. Restart app and test:
   - register/login
   - create/complete quest
   - progression endpoints

## Auth secret rotation

1. Generate a new secret:
   - `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Replace `AUTH_SECRET` in `.env.local`.
3. Restart app.
4. Existing sessions may be invalidated; re-login users.

## Atlas baseline requirements

- Network:
  - local development IP allowlisted or temporary open access for dev only
- User permissions:
  - app user must have read/write to the target DB
- Database naming:
  - use stable DB name with exact casing (`sideQuest`) across the app URI and expected collections

## Verification script expectations

After credential changes, verify:
- `POST /api/auth/register`
- credentials sign-in flow via NextAuth callback
- `POST /api/quests`
- `PATCH /api/quests/:id/complete`
- `GET /api/progression`
- `GET /api/dailies`
- `GET /api/metrics/summary`

If auth fails with `bad auth : authentication failed`, treat it as a credential mismatch and rotate/reset DB user password again.
