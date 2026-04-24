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

## Implemented v1 APIs

- `POST /api/auth/register`
- `POST /api/auth/callback/credentials` (NextAuth credentials sign in)
- `GET /api/quests`
- `POST /api/quests`
- `PATCH /api/quests/:id/complete`
- `GET /api/progression`
- `GET /api/metrics/summary`
