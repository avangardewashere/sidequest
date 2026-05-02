import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConnectToDatabase = vi.fn();
const mockGetAuthSession = vi.fn();
const mockStartSession = vi.fn();
const mockHash = vi.fn();
const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindById = vi.fn();
const mockQuestCreate = vi.fn();
const mockQuestFindOne = vi.fn();
const mockQuestFind = vi.fn();
const mockQuestAggregate = vi.fn();
const mockQuestCountDocuments = vi.fn();
const mockCompletionAggregate = vi.fn();
const mockMilestoneCountDocuments = vi.fn();
const mockFocusAggregate = vi.fn();

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("bcryptjs", () => ({
  default: { hash: mockHash },
  hash: mockHash,
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

vi.mock("@/models/User", () => ({
  UserModel: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    create: mockQuestCreate,
    findOne: mockQuestFindOne,
    find: mockQuestFind,
    aggregate: mockQuestAggregate,
    countDocuments: mockQuestCountDocuments,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    aggregate: mockCompletionAggregate,
  },
}));

vi.mock("@/models/MilestoneRewardLog", () => ({
  MilestoneRewardLogModel: {
    countDocuments: mockMilestoneCountDocuments,
  },
}));

vi.mock("@/models/FocusSession", () => ({
  FocusSessionModel: {
    aggregate: mockFocusAggregate,
  },
}));

const registerRoute = await import("@/app/api/auth/register/route");
const questsRoute = await import("@/app/api/quests/route");
const progressionRoute = await import("@/app/api/progression/route");
const completeQuestRoute = await import("@/app/api/quests/[id]/complete/route");
const metricsSummaryRoute = await import("@/app/api/metrics/summary/route");

describe("API route baseline tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("creates a new user for valid payload", async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-pass");
      mockUserCreate.mockResolvedValue({ _id: "user-1" });

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@sidequest.app",
          displayName: "New User",
          password: "password123",
        }),
      });

      const response = await registerRoute.POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ ok: true });
      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(1);
    });

    it("rejects duplicate email", async () => {
      mockUserFindOne.mockResolvedValue({ _id: "existing" });
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "existing@sidequest.app",
          displayName: "Existing User",
          password: "password123",
        }),
      });

      const response = await registerRoute.POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe("Email already in use");
    });

    it("rejects invalid payload", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "bad-email",
          displayName: "A",
          password: "123",
        }),
      });

      const response = await registerRoute.POST(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Invalid payload");
      expect(mockUserCreate).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/quests", () => {
    it("requires auth", async () => {
      mockGetAuthSession.mockResolvedValue(null);
      const request = new Request("http://localhost/api/quests", {
        method: "POST",
        body: JSON.stringify({
          title: "Quest",
          description: "Do thing",
          difficulty: "easy",
          category: "work",
        }),
      });

      const response = await questsRoute.POST(request);
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("creates quest for authenticated user", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      mockQuestCreate.mockResolvedValue({ _id: "q1", title: "Quest" });
      const request = new Request("http://localhost/api/quests", {
        method: "POST",
        body: JSON.stringify({
          title: "Quest",
          description: "Do thing",
          difficulty: "easy",
          category: "work",
        }),
      });

      const response = await questsRoute.POST(request);
      expect(response.status).toBe(201);
      expect(mockQuestCreate).toHaveBeenCalledTimes(1);
    });

    it("rejects invalid payload for authenticated user", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      const request = new Request("http://localhost/api/quests", {
        method: "POST",
        body: JSON.stringify({
          title: "",
          description: "Do thing",
          difficulty: "invalid",
          category: "work",
        }),
      });

      const response = await questsRoute.POST(request);
      const json = await response.json();
      expect(response.status).toBe(400);
      expect(json.error).toBe("Invalid payload");
      expect(mockQuestCreate).not.toHaveBeenCalled();
    });
  });

  describe("GET /api/quests", () => {
    it("accepts priority_due sort and uses aggregation path", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      mockQuestAggregate.mockResolvedValue([]);

      const request = new Request("http://localhost/api/quests?status=active&sort=priority_due", {
        method: "GET",
      });

      const response = await questsRoute.GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.quests)).toBe(true);
      expect(mockQuestAggregate).toHaveBeenCalledTimes(1);
      expect(mockQuestFind).not.toHaveBeenCalled();
    });

    it("uses find path for standard sort options", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      const exec = vi.fn().mockResolvedValue([]);
      const limit = vi.fn().mockReturnValue({ exec });
      const sort = vi.fn().mockReturnValue({ limit, exec });
      mockQuestFind.mockReturnValue({ sort });

      const request = new Request("http://localhost/api/quests?status=active&sort=newest&limit=5", {
        method: "GET",
      });

      const response = await questsRoute.GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(json.quests)).toBe(true);
      expect(mockQuestFind).toHaveBeenCalledTimes(1);
      expect(mockQuestAggregate).not.toHaveBeenCalled();
    });
  });

  describe("PATCH /api/quests/:id/complete", () => {
    it("requires auth", async () => {
      mockGetAuthSession.mockResolvedValue(null);
      const request = new Request("http://localhost/api/quests/quest-1/complete", {
        method: "PATCH",
      });
      const response = await completeQuestRoute.PATCH(request, {
        params: Promise.resolve({ id: "quest-1" }),
      });
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 404 when quest is not found", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      const mockDbSession = {
        withTransaction: vi.fn(async (cb: () => Promise<void>) => cb()),
        endSession: vi.fn(),
      };
      mockStartSession.mockResolvedValue(mockDbSession);
      mockQuestFindOne.mockReturnValue({
        session: vi.fn().mockResolvedValue(null),
      });

      const request = new Request("http://localhost/api/quests/missing/complete", {
        method: "PATCH",
      });
      const response = await completeQuestRoute.PATCH(request, {
        params: Promise.resolve({ id: "missing" }),
      });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe("Quest not found");
      expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("returns 409 when quest is already completed", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      const mockDbSession = {
        withTransaction: vi.fn(async (cb: () => Promise<void>) => cb()),
        endSession: vi.fn(),
      };
      mockStartSession.mockResolvedValue(mockDbSession);
      mockQuestFindOne.mockReturnValue({
        session: vi.fn().mockResolvedValue({ status: "completed" }),
      });

      const request = new Request("http://localhost/api/quests/done/complete", {
        method: "PATCH",
      });
      const response = await completeQuestRoute.PATCH(request, {
        params: Promise.resolve({ id: "done" }),
      });
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe("Quest already completed");
      expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
    });

    it("returns 409 when duplicate completion event is detected", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      const mockDbSession = {
        withTransaction: vi.fn(async () => {
          throw { code: 11000 };
        }),
        endSession: vi.fn(),
      };
      mockStartSession.mockResolvedValue(mockDbSession);

      const request = new Request("http://localhost/api/quests/q-dup/complete", {
        method: "PATCH",
      });
      const response = await completeQuestRoute.PATCH(request, {
        params: Promise.resolve({ id: "q-dup" }),
      });
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe("Duplicate completion event ignored");
      expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
    });
  });

  describe("GET /api/progression", () => {
    it("returns profile for authenticated user", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      mockUserFindById.mockResolvedValue({
        email: "user@sidequest.app",
        displayName: "User",
        totalXp: 75,
        level: 2,
        currentStreak: 2,
        longestStreak: 5,
      });
      const request = new Request("http://localhost/api/progression", { method: "GET" });

      const response = await progressionRoute.GET(request);
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.profile.email).toBe("user@sidequest.app");
      expect(json.profile.level).toBe(2);
      expect(json.profile.xpIntoLevel).toBeTypeOf("number");
      expect(json.profile.xpForNextLevel).toBeTypeOf("number");
    });

    it("returns 404 when user profile is missing", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "missing" } });
      mockUserFindById.mockResolvedValue(null);
      const request = new Request("http://localhost/api/progression", { method: "GET" });

      const response = await progressionRoute.GET(request);
      const json = await response.json();
      expect(response.status).toBe(404);
      expect(json.error).toBe("User not found");
    });
  });

  describe("GET /api/metrics/summary", () => {
    it("returns 401 for unauthenticated requests", async () => {
      mockGetAuthSession.mockResolvedValue(null);
      const request = new Request("http://localhost/api/metrics/summary", { method: "GET" });

      const response = await metricsSummaryRoute.GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("returns default 7d chart arrays and summary blocks", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } });
      mockUserFindById.mockResolvedValue({ currentStreak: 3, longestStreak: 8 });
      mockQuestCountDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2);
      mockMilestoneCountDocuments.mockResolvedValueOnce(1);
      mockCompletionAggregate
        .mockResolvedValueOnce([{ _id: null, avgXpPerCompletion: 20, totalXpFromCompletions: 100, completionEvents: 5 }])
        .mockResolvedValueOnce([{ _id: "2026-04-20", value: 2 }])
        .mockResolvedValueOnce([{ _id: "2026-04-20", value: 40 }])
        .mockResolvedValueOnce([{ _id: null, avgXpPerCompletion: 15, totalXpFromCompletions: 75, completionEvents: 3 }])
        .mockResolvedValueOnce([{ _id: null, avgXpPerCompletion: 25, totalXpFromCompletions: 75, completionEvents: 3 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockQuestAggregate.mockResolvedValueOnce([{ category: "work", count: 3, xpTotal: 60 }]);
      mockFocusAggregate.mockResolvedValueOnce([{ _id: null, durationSecTotal: 1800 }]);

      const response = await metricsSummaryRoute.GET(
        new Request("http://localhost/api/metrics/summary", { method: "GET" }),
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.range).toBe("7d");
      expect(json.rangeDays).toBe(7);
      expect(json.completionsByDay).toHaveLength(7);
      expect(json.xpByDay).toHaveLength(7);
      expect(json.byCategory).toEqual([{ category: "work", count: 3, xpTotal: 60 }]);
      expect(json.streakHistory.current).toBe(3);
      expect(json.streakHistory.longest).toBe(8);
      expect(json.streakHistory.last7d).toHaveLength(7);
      expect(json.kpis.totalCompletions).toBe(5);
      expect(json.kpis.totalXp).toBe(100);
      expect(json.kpis.focusMinutesLast7d).toBe(30);
      expect(json.previousPeriod.totalCompletions).toBe(3);
      expect(json.last7Days.questsCreated).toBe(10);
      expect(json.habitCompletionsByDay).toHaveLength(7);
      expect(json.habitsTopByStreak).toEqual([]);
      expect(Array.isArray(json.weeklyXpByWeek)).toBe(true);
    });

    it("supports range=30d with zero-filled arrays", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } });
      mockUserFindById.mockResolvedValue({ currentStreak: 0, longestStreak: 1 });
      mockQuestCountDocuments.mockResolvedValue(0);
      mockMilestoneCountDocuments.mockResolvedValue(0);
      mockCompletionAggregate
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      mockQuestAggregate.mockResolvedValueOnce([]);
      mockFocusAggregate.mockResolvedValueOnce([]);

      const response = await metricsSummaryRoute.GET(
        new Request("http://localhost/api/metrics/summary?range=30d", { method: "GET" }),
      );
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.range).toBe("30d");
      expect(json.rangeDays).toBe(30);
      expect(json.completionsByDay).toHaveLength(30);
      expect(json.xpByDay).toHaveLength(30);
      expect(json.completionsByDay.every((point: { value: number }) => point.value === 0)).toBe(true);
      expect(json.xpByDay.every((point: { value: number }) => point.value === 0)).toBe(true);
      expect(json.kpis.focusMinutesLast7d).toBe(0);
    });
  });
});
