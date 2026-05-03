import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockStartSession = vi.fn();
const mockQuestFindOne = vi.fn();
const mockUserFindById = vi.fn();
const mockCompletionFindOne = vi.fn();
const mockCompletionCreate = vi.fn();
const mockCompletionFind = vi.fn();
const mockStreakFreezeCreate = vi.fn();
const mockCountStreakFreezeBalance = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/lib/streak-freeze", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/streak-freeze")>();
  return {
    ...actual,
    countStreakFreezeBalance: mockCountStreakFreezeBalance,
  };
});

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: mockStartSession,
    },
    startSession: mockStartSession,
  };
});

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    findOne: mockQuestFindOne,
  },
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    findOne: mockCompletionFindOne,
    find: mockCompletionFind,
    create: mockCompletionCreate,
  },
}));

vi.mock("@/models/StreakFreezeLog", () => ({
  StreakFreezeLogModel: {
    create: mockStreakFreezeCreate,
  },
}));

const { POST } = await import("@/app/api/quests/[id]/streak/recover/route");

const USER_ID = "507f1f77bcf86cd799439099";
const QUEST_ID = "507f1f77bcf86cd799439011";

describe("POST /api/quests/[id]/streak/recover", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 1, 12, 0, 0)));
    let freezeBalanceCall = 0;
    mockCountStreakFreezeBalance.mockImplementation(() => {
      freezeBalanceCall += 1;
      return Promise.resolve(freezeBalanceCall === 1 ? 1 : 0);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setupSession() {
    const dbSession = {
      withTransaction: vi.fn(async (cb: () => Promise<void>) => {
        await cb();
      }),
      endSession: vi.fn(() => Promise.resolve()),
    };
    mockStartSession.mockResolvedValue(dbSession);
    return dbSession;
  }

  function chainSession<T>(result: Promise<T> | T) {
    return {
      session: vi.fn(() => Promise.resolve(result)),
    };
  }

  it("returns 401 when unauthenticated", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const req = new Request(`http://localhost/api/quests/${QUEST_ID}/streak/recover`, { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(401);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it("returns 404 when quest is missing", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    setupSession();
    mockQuestFindOne.mockReturnValue(chainSession(null));
    const req = new Request(`http://localhost/api/quests/${QUEST_ID}/streak/recover`, { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(404);
  });

  it("returns 409 when not eligible", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    setupSession();
    const questDoc = {
      _id: QUEST_ID,
      createdBy: USER_ID,
      difficulty: "easy",
      lastCompletedDate: "2026-05-28",
      save: vi.fn(),
    };
    mockQuestFindOne.mockReturnValue(
      chainSession({
        ...questDoc,
        cadence: { kind: "daily" },
      }),
    );
    mockUserFindById.mockReturnValue(
      chainSession({
        _id: USER_ID,
        currentStreak: 2,
        longestStreak: 5,
        lastCompletedAt: new Date(),
        save: vi.fn().mockResolvedValue(undefined),
      }),
    );

    const req = new Request(`http://localhost/api/quests/${QUEST_ID}/streak/recover`, { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string };
    expect(json.error?.startsWith("not_eligible:")).toBe(true);
  });

  it("creates zero-xp completion, spend log, and updates streak when eligible", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    setupSession();

    const questSave = vi.fn().mockResolvedValue(undefined);
    const questDoc = {
      _id: QUEST_ID,
      createdBy: USER_ID,
      difficulty: "easy" as const,
      lastCompletedDate: "2026-05-30",
      cadence: { kind: "daily" },
      save: questSave,
    };
    mockQuestFindOne.mockReturnValue(chainSession(questDoc));

    const userSave = vi.fn().mockResolvedValue(undefined);
    mockUserFindById.mockReturnValue(
      chainSession({
        _id: USER_ID,
        currentStreak: 1,
        longestStreak: 3,
        lastCompletedAt: new Date(Date.UTC(2026, 4, 30)),
        save: userSave,
      }),
    );

    mockCompletionFindOne.mockReturnValue({
      session: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });
    mockCompletionCreate.mockResolvedValue(undefined);
    mockStreakFreezeCreate.mockResolvedValue(undefined);
    mockCompletionFind.mockReturnValue({
      session: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([{ completedAt: new Date(Date.UTC(2026, 4, 30, 12, 0, 0)) }]),
          }),
        }),
      }),
    });

    const req = new Request(`http://localhost/api/quests/${QUEST_ID}/streak/recover`, { method: "POST" });
    const res = await POST(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      ok?: boolean;
      missedDateKey?: string;
      streakFreezeBalance?: number;
    };
    expect(json.ok).toBe(true);
    expect(json.missedDateKey).toBe("2026-05-31");
    expect(json.streakFreezeBalance).toBe(0);
    expect(mockCompletionCreate).toHaveBeenCalled();
    expect(mockStreakFreezeCreate).toHaveBeenCalled();
    expect(questSave).toHaveBeenCalled();
    expect(userSave).toHaveBeenCalled();
  });
});
