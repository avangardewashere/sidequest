Full project tree
A production-grade Next.js 14+ app using the App Router
my-app/
├── app/ ← App Router root
│ ├── layout.tsx ← Root layout (html, body)
│ ├── page.tsx ← / route (Server Component)
│ ├── error.tsx ← Error boundary
│ ├── loading.tsx ← Suspense fallback
│ ├── not-found.tsx ← 404 page
│ ├── api/
│ │ └── auth/[...nextauth]/
│ │ └── route.ts ← API route handler
│ ├── (auth)/ ← Route group (no URL segment)
│ │ ├── login/page.tsx
│ │ └── register/page.tsx
│ ├── (dashboard)/ ← Route group with shared layout
│ │ ├── layout.tsx ← Dashboard shell layout
│ │ ├── dashboard/page.tsx
│ │ ├── settings/
│ │ │ ├── page.tsx
│ │ │ └── profile/page.tsx
│ │ └── tasks/
│ │ ├── page.tsx ← /tasks listing
│ │ ├── loading.tsx
│ │ └── [id]/
│ │ └── page.tsx ← /tasks/:id
│ └── @modal/ ← Parallel route (slot)
│ └── (.)tasks/[id]/
│ └── page.tsx ← Intercepted route (modal)
├── components/
│ ├── ui/ ← shadcn/ui or primitives
│ │ ├── button.tsx
│ │ ├── dialog.tsx
│ │ └── input.tsx
│ ├── features/ ← Feature-scoped components
│ │ ├── tasks/
│ │ │ ├── task-card.tsx ← "use client" component
│ │ │ ├── task-list.tsx
│ │ │ └── task-form.tsx
│ │ └── auth/
│ │ └── login-form.tsx
│ └── shared/ ← Truly global UI
│ ├── navbar.tsx
│ └── sidebar.tsx
├── lib/ ← Pure utilities
│ ├── db.ts ← Prisma / Drizzle client
│ ├── auth.ts ← Auth.js config
│ ├── validations.ts ← Zod schemas
│ └── utils.ts
├── actions/ ← Server Actions
│ ├── task.actions.ts
│ └── auth.actions.ts
├── hooks/ ← Custom React hooks (client)
│ ├── use-tasks.ts
│ └── use-optimistic.ts
├── store/ ← Zustand / Jotai stores
│ └── task-store.ts
├── types/ ← Shared TypeScript types
│ ├── index.ts
│ └── api.ts
├── middleware.ts ← Route protection, redirects
├── next.config.ts
└── tailwind.config.ts