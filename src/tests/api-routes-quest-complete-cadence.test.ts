import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockStartSession = vi.fn();
const mockQuestFindOne = vi.fn();
const mockUserFindById = vi.fn();
const mockMilestoneFindOne = vi.fn();
const mockMilestoneCreate = vi.fn();
const mockCompletionCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

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

vi.mock("@/models/MilestoneRewardLog", () => ({
  MilestoneRewardLogModel: {
    findOne: mockMilestoneFindOne,
    create: mockMilestoneCreate,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    create: mockCompletionCreate,
  },
}));

const completeRoute = await import("@/app/api/quests/[id]/complete/route");

describe("quest complete route cadence behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupSession() {
    const dbSession = {
      withTransaction: vi.fn(async (cb: () => Promise<void>) => cb()),
      endSession: vi.fn(),
    };
    mockStartSession.mockResolvedValue(dbSession);
    return dbSession;
  }

  it("keeps one-off conflict behavior for completed quests", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    setupSession();
    mockQuestFindOne.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        status: "completed",
        cadence: { kind: "oneoff" },
      }),
    });

    const response = await completeRoute.PATCH(
      new Request("http://localhost/api/quests/q1/complete", { method: "PATCH" }),
      { params: Promise.resolve({ id: "q1" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe("Quest already completed");
  });

  it("allows repeat completion flow for habit cadence", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    setupSession();
    const saveQuest = vi.fn().mockResolvedValue(undefined);
    const habitQuest = {
      _id: "q-habit",
      status: "active",
      cadence: { kind: "daily" },
      isDaily: false,
      xpReward: 20,
      difficulty: "easy",
      save: saveQuest,
    };
    mockQuestFindOne.mockReturnValue({
      session: vi.fn().mockResolvedValue(habitQuest),
    });
    mockUserFindById.mockReturnValue({
      session: vi.fn().mockResolvedValue({
        _id: "u1",
        totalXp: 100,
        level: 2,
        currentStreak: 1,
        longestStreak: 2,
        lastCompletedAt: null,
        save: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mockMilestoneFindOne.mockReturnValue({
      session: vi.fn().mockResolvedValue(null),
    });
    mockCompletionCreate.mockResolvedValue(undefined);

    const response = await completeRoute.PATCH(
      new Request("http://localhost/api/quests/q-habit/complete", { method: "PATCH" }),
      { params: Promise.resolve({ id: "q-habit" }) },
    );

    expect(response.status).toBe(200);
    expect(saveQuest).toHaveBeenCalledTimes(1);
    expect(mockCompletionCreate).toHaveBeenCalledTimes(1);
  });
});
