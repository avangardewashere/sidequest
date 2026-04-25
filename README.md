## SideQuest

Gamified todo app where tasks are quests, and completing them earns XP, levels, and streak progress.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` from `.env.example` and set:

```bash
MONGODB_URI=...
AUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Quality Checks

- Run lint: `npm run lint`
- Run types: `npm run typecheck`
- Run tests: `npm run test`
- Run E2E tests: `npm run test:e2e`
- Run E2E tests (headed): `npm run test:e2e:headed`

## Deployment (Vercel)

1. Configure project environment variables in Vercel:
   - `MONGODB_URI`
   - `AUTH_SECRET`
   - `NEXTAUTH_URL` (your deployed URL)
2. Deploy with the Vercel CLI:
   - `npx vercel` (preview)
   - `npx vercel --prod` (production promote)
3. Run production smoke checks on:
   - `/`
   - `/quests/view`
   - `/stats`

## Observability

- This app uses `@vercel/analytics` in the root layout for minimal product analytics.
- After deploy, verify analytics events appear in the Vercel dashboard.

## Implemented v1 APIs

- `POST /api/auth/register`
- `POST /api/auth/callback/credentials` (NextAuth credentials sign in)
- `GET /api/quests`
- `POST /api/quests`
- `PATCH /api/quests/:id/complete`
- `GET /api/progression`
- `GET /api/metrics/summary`
