# SideQuest — Architecture Mind Map

> Render with any Mermaid-compatible viewer (GitHub, Obsidian, VS Code + Mermaid plugin).

---

## 1. Project Overview

```mermaid
mindmap
  root((SideQuest))
    Frontend
      Pages
        / Dashboard
        /quests/create
        /quests/view
        /quests/id/edit
        /stats
        /stats placeholder
      Components
        dashboard-nav.tsx
        session-provider.tsx
      Hooks
        useDashboardActions.ts
      Client Libs
        client-api.ts
        formatters.ts
        quest-selectors.ts
    Backend
      API Routes
        /api/auth/register
        /api/auth/nextauth
        /api/quests
        /api/quests/id
        /api/quests/id/complete
        /api/dailies
        /api/progression
        /api/metrics/summary
      Lib Utilities
        xp.ts
        progression.ts
        dailies.ts
        auth.ts
        db.ts
        server-logger.ts
      Middleware
        middleware.ts
    Database
      MongoDB
        User
        Quest
        CompletionLog
        MilestoneRewardLog
    Auth
      NextAuth v4
        JWT Strategy
        Credentials Provider
        bcryptjs
```

---

## 2. Data Model Relationships

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string passwordHash
        string displayName
        number totalXp
        number level
        number currentStreak
        number longestStreak
        Date lastCompletedAt
        Date createdAt
        Date updatedAt
    }

    QUEST {
        ObjectId _id PK
        string title
        string description
        string difficulty
        string category
        number xpReward
        string status
        Date dueDate
        boolean isDaily
        string dailyKey
        ObjectId createdBy FK
        Date completedAt
        Date createdAt
        Date updatedAt
    }

    COMPLETION_LOG {
        ObjectId _id PK
        ObjectId questId FK
        ObjectId userId FK
        number xpEarned
        string difficulty
        Date completedAt
        Date createdAt
        Date updatedAt
    }

    MILESTONE_REWARD_LOG {
        ObjectId _id PK
        ObjectId userId FK
        number streakMilestone
        number bonusXp
        Date awardedAt
        Date createdAt
        Date updatedAt
    }

    USER ||--o{ QUEST : "creates"
    USER ||--o{ COMPLETION_LOG : "earns"
    USER ||--o{ MILESTONE_REWARD_LOG : "unlocks"
    QUEST ||--o| COMPLETION_LOG : "logged in"
```

---

## 3. Quest Completion Flow (Core Transaction)

```mermaid
flowchart TD
    A([Client: PATCH /api/quests/id/complete]) --> B{Auth check\ngetAuthSession}
    B -->|No session| C[401 Unauthorized]
    B -->|Valid session| D[connectToDatabase]
    D --> E[mongoose.startSession]
    E --> F[withTransaction]

    F --> G{findOne Quest\ncreatedBy = userId}
    G -->|Not found| H[throw ApiNotFoundError → 404]
    G -->|Found| I{quest.status\n=== completed?}
    I -->|Yes| J[throw ApiConflictError → 409]
    I -->|No| K[findById User]

    K --> L[quest.status = completed\nquest.completedAt = now]
    L --> M[applyQuestCompletion\ntotalXp + xpReward\nnextStreak calc\nlevel recalc]

    M --> N{getMilestoneBonus\nnewStreak = 3 / 7 / 14?}
    N -->|No bonus| O[skip milestone]
    N -->|Bonus exists| P{MilestoneRewardLog\nalready exists?}
    P -->|Yes| O
    P -->|No| Q[user.totalXp += bonusXp\ncreate MilestoneRewardLog]

    O --> R[user.save]
    Q --> R
    R --> S[create CompletionLog\nquestId, userId, xpEarned, difficulty]
    S --> T[commit transaction]
    T --> U[200 OK\nquest + progression + xpGained + milestoneReward]

    style C fill:#f66,color:#fff
    style H fill:#f66,color:#fff
    style J fill:#f66,color:#fff
    style U fill:#6a6,color:#fff
```

---

## 4. XP & Level Progression System

```mermaid
flowchart LR
    A[Quest Completed] --> B[getXpReward difficulty]
    B --> C{Difficulty}
    C -->|easy| D[+10 XP]
    C -->|medium| E[+20 XP]
    C -->|hard| F[+35 XP]

    D & E & F --> G[totalXp += reward]
    G --> H[levelFromTotalXp totalXp]
    H --> I["Level formula:\n50 × (level-1)²"]

    I --> J[Level 1 = 0 XP\nLevel 2 = 50 XP\nLevel 3 = 200 XP\nLevel 4 = 450 XP\nLevel 5 = 800 XP]

    G --> K[currentLevelProgress]
    K --> L[xpIntoLevel\nxpForNextLevel\nprogressPct for UI bar]
```

---

## 5. Streak & Milestone System

```mermaid
flowchart TD
    A[Quest Completed] --> B[getNextStreak\ncurrentStreak, lastCompletedAt]

    B --> C{lastCompletedAt\nnull?}
    C -->|Yes first ever| D[streak = 1]
    C -->|No| E{diffDays from\nlast completion}

    E -->|diffDays = 0\nsame day| F[streak unchanged]
    E -->|diffDays = 1\nnext day| G[streak + 1]
    E -->|diffDays > 1\ngap| H[streak reset to 1]

    D & F & G & H --> I[longestStreak =\nmax prev, new]
    I --> J{new streak =\n3, 7, or 14?}

    J -->|No| K[done]
    J -->|Yes| L{MilestoneRewardLog\nexists for user + streak?}
    L -->|Yes already claimed| K
    L -->|No| M[Award bonus XP\n3→+15  7→+40  14→+100]
    M --> N[Create MilestoneRewardLog\nidempotency record]
    N --> K
```

---

## 6. Daily Quest Generation

```mermaid
flowchart TD
    A([GET /api/dailies]) --> B[getAuthSession]
    B --> C[getUtcDailyKey today]
    C --> D{Quest.find\ncreatedBy + isDaily + dailyKey}

    D -->|3 already exist| E[Return existing dailies]
    D -->|Missing| F[buildDailyQuestSet\nuserId + dailyKey]

    F --> G[hashSeed userId:dailyKey\nFNV-1a variant]
    G --> H[pickUniqueTemplates seed 3\nfrom 6 hardcoded templates]
    H --> I[3 deterministic quests\nsame user+date = same quests]
    I --> J[bulkWrite upsert\n3 quests into DB]
    J --> E
```

---

## 7. Authentication Flow

```mermaid
flowchart TD
    A([User submits login form]) --> B[POST /api/auth/nextauth\nNextAuth Credentials]
    B --> C[Zod validate\nemail + password]
    C -->|Invalid| D[400 Validation Error]
    C -->|Valid| E[UserModel.findOne email]
    E -->|Not found| F[null → NextAuth 401]
    E -->|Found| G[bcrypt.compare\npassword vs hash]
    G -->|Mismatch| F
    G -->|Match| H[Return user object\nid + email + displayName]
    H --> I[JWT callback\ntoken.userId = user.id]
    I --> J[session callback\nsession.user.id = token.userId]
    J --> K[Signed JWT cookie set]

    L([User registers]) --> M[POST /api/auth/register]
    M --> N[Zod validate\nemail + displayName + password]
    N -->|Invalid| D
    N -->|Valid| O{UserModel.findOne\nemail exists?}
    O -->|Yes| P[409 Conflict]
    O -->|No| Q[bcrypt.hash cost 10]
    Q --> R[UserModel.create]
    R -->|Mongo 11000| P
    R -->|Success| S[201 Created]
```

---

## 8. Middleware Route Protection

```mermaid
flowchart LR
    A([Incoming Request]) --> B{Path matches\n/quests/* or\n/stats?}
    B -->|No| C[Pass through]
    B -->|Yes| D{getToken\nJWT valid?}
    D -->|Valid| E[Continue to page]
    D -->|No token| F[Redirect to /\n?callbackUrl=original]
```

---

## 9. API Route Map

```mermaid
flowchart TD
    subgraph AUTH
        A1[POST /api/auth/register]
        A2[GET/POST /api/auth/nextauth]
    end

    subgraph QUESTS
        Q1[GET /api/quests\nlist with filters]
        Q2[POST /api/quests\ncreate quest]
        Q3[GET /api/quests/id\nget single]
        Q4[PATCH /api/quests/id\nupdate fields]
        Q5[DELETE /api/quests/id\nrequires confirmTitle]
        Q6[PATCH /api/quests/id/complete\ntransactional XP award]
    end

    subgraph SYSTEM
        S1[GET /api/dailies\nauto-generate daily quests]
        S2[GET /api/progression\nXP + level + streak]
        S3[GET /api/metrics/summary\n7-day analytics aggregation]
    end

    Client --> AUTH
    Client --> QUESTS
    Client --> SYSTEM
```

---

## 10. Frontend Data Flow

```mermaid
flowchart TD
    A([page.tsx mounts]) --> B[useDashboardActions hook]
    B --> C[fetchDashboardData]
    C --> D[GET /api/progression]
    C --> E[GET /api/dailies]
    C --> F[GET /api/quests?status=active]

    D --> G[profile state\nlevel xp streak progress]
    E --> H[dailies state\n3 daily quests]
    F --> I[quests state\nactive quest list]

    G & H & I --> J[Dashboard renders\nStats + Dailies + Quest cards]

    J --> K{User action}
    K -->|Complete quest| L[PATCH /api/quests/id/complete]
    L --> M[Show feedback toast\nXP gained + milestone?]
    M --> C

    K -->|View quests| N[/quests/view\nGET /api/quests?filters]
    K -->|Create quest| O[/quests/create\nPOST /api/quests]
    K -->|Stats| P[/stats\ncoming soon]
```

---

## 11. Directory Structure

```
src/
├── app/
│   ├── page.tsx                        ← Main dashboard
│   ├── layout.tsx                      ← Root layout + SessionProvider
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts       ← User registration
│   │   │   └── [...nextauth]/route.ts  ← NextAuth handler
│   │   ├── quests/
│   │   │   ├── route.ts                ← GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts            ← GET, PATCH, DELETE
│   │   │       └── complete/route.ts   ← PATCH complete (transactional)
│   │   ├── dailies/route.ts            ← GET + auto-generate
│   │   ├── progression/route.ts        ← GET user stats
│   │   └── metrics/summary/route.ts    ← GET 7-day analytics
│   ├── quests/
│   │   ├── create/page.tsx
│   │   ├── view/page.tsx
│   │   └── [id]/edit/page.tsx
│   └── stats/page.tsx                  ← Placeholder
├── components/
│   ├── dashboard-nav.tsx
│   └── session-provider.tsx
├── hooks/
│   └── useDashboardActions.ts
├── lib/
│   ├── xp.ts                           ← XP reward + level formula
│   ├── progression.ts                  ← Streak + milestone logic
│   ├── dailies.ts                      ← Deterministic daily generation
│   ├── auth.ts                         ← NextAuth config
│   ├── db.ts                           ← MongoDB connection cache
│   ├── server-logger.ts                ← Query-gated structured logging
│   ├── client-api.ts                   ← Typed fetch wrapper
│   ├── formatters.ts                   ← UI helpers
│   └── quest-selectors.ts              ← Client-side filters (unused)
├── middleware.ts                        ← JWT route protection
├── models/
│   ├── User.ts
│   ├── Quest.ts
│   ├── CompletionLog.ts
│   └── MilestoneRewardLog.ts
└── types/
    └── next-auth.d.ts                  ← Session type extension
```
