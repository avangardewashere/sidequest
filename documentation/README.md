# SideQuest Documentation Index

Use this table of contents to quickly jump to implementation chapters and operational notes.

## Table of Contents

1. [Chapter 1 - Foundation Implemented](./chapters/chapter-1.md)
   - baseline architecture, schemas, core gameplay loop, API surface
2. [Chapter 2 - Retention Sprint (Daily Quests + Milestones)](./chapters/chapter-2.md)
   - daily quest generation, milestone reward system, retention metrics
3. [Chapter 3 - Stability Fixes And Frontend Refactor](./chapters/chapter-3.md)
   - MongoDB case mismatch fix, duplicate-safe registration, frontend layering refactor
4. [Chapter 4 - Todo Core Hardening And API Observability](./chapters/chapter-4.md)
   - middleware protection, server-side quest queries, delete safety, error UX, showlogger-gated API logging
5. [Chapter 5 - Cycle 2 Completion (Stats Analytics)](./chapters/chapter-5-cycle-2-completion.md)
   - cycle 2 delivered scope, stats analytics architecture, validation evidence, and sign-off
6. [Chapter 6 - Cycle 3 Summary (Hardening And Ship Readiness)](./chapters/chapter-6-cycle-3-summary.md)
   - cycle 3 outcomes across phases 3.1-3.5, validation ledger, deploy blocker, and closeout criteria
7. [Progress Summary - Home Data Wiring And Current Status](./status/progress-summary.md)
   - latest implementation summary, validation results, known gaps, and next steps
8. [Ops Chapter - Environment And Secret Rotation](./ops/chapter-ops-secrets.md)
   - env setup, credential rotation, deployment-safe secret practices
9. [Dev Notes - One-Liners](./ops/dev-notes-one-liners.md)
   - phase-based one-line changelog across Chapters 1-4 and Ops

## Current Roadmap

- [Cycles 4-6 Roadmap](./plans/cycles/cycles-4-5-6-roadmap.md)
- [Cycle 4 Phase 4.1 Plan](./plans/cycle-4/phase-4-1-focus-pipeline-plan.md)
- [Cycle 4 Phase 4.1 Tracker](./plans/cycle-4/phase-4-1-focus-pipeline-tracker.md)

## Folder Guide

- [chapters](./chapters/README.md): long-form implementation history and closeout chapters
- [cycles](./cycles/README.md): cycle-specific plans, notes, and release artifacts
- [status](./status/README.md): living status snapshots and progress rollups
- [plans](./plans/README.md): product/UI planning docs and checklists
- [ops](./ops/README.md): deployment, secrets, setup, and operational runbooks
- [reference](./reference/README.md): architecture and design references

## Suggested Reading Order

- New project onboarding: Chapter 1 -> Chapter 2 -> Chapter 3 -> Chapter 4 -> Chapter 5 -> Chapter 6 -> Progress Summary
- Production and security checklist: Ops Chapter
- Refactor reference for future projects: Chapter 3 and Chapter 4
