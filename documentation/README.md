# SideQuest Documentation Index

Use this table of contents to quickly jump to implementation chapters and operational notes.

## Table of Contents

1. [Chapter 1 - Foundation Implemented](./chapter-1.md)
   - baseline architecture, schemas, core gameplay loop, API surface
2. [Chapter 2 - Retention Sprint (Daily Quests + Milestones)](./chapter-2.md)
   - daily quest generation, milestone reward system, retention metrics
3. [Chapter 3 - Stability Fixes And Frontend Refactor](./chapter-3.md)
   - MongoDB case mismatch fix, duplicate-safe registration, frontend layering refactor
4. [Chapter 4 - Todo Core Hardening And API Observability](./chapter-4.md)
   - middleware protection, server-side quest queries, delete safety, error UX, showlogger-gated API logging
5. [Ops Chapter - Environment And Secret Rotation](./chapter-ops-secrets.md)
   - env setup, credential rotation, deployment-safe secret practices
6. [Dev Notes - One-Liners](./dev-notes-one-liners.md)
   - phase-based one-line changelog across Chapters 1-4 and Ops

## Suggested Reading Order

- New project onboarding: Chapter 1 -> Chapter 2 -> Chapter 3 -> Chapter 4
- Production and security checklist: Ops Chapter
- Refactor reference for future projects: Chapter 3 and Chapter 4
