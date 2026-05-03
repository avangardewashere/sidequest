import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockQuestFind = vi.fn();
const mockCompletionFind = vi.fn();
const mockWeeklyReflectionFindOne = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    find: mockQuestFind,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    find: mockCompletionFind,
  },
}));

const route = await import("@/app/api/today/habit-surface/route");

describe("GET /api/today/habit-surface", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWeeklyReflectionFindOne.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(null),
      }),
    });
    mockGetAuthSession.mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } });
    mockConnectToDatabase.mockResolvedValue(undefined);
    mockQuestFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([]),
      }),
    });
    mockCompletionFind.mockReturnValue({
      select: vi.fn().mockReturnValue({
        sort: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            lean: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetAuthSession.mockResolvedValueOnce(null);
    const res = await route.GET(new Request("http://localhost/api/today/habit-surface"));
    expect(res.status).toBe(401);
  });

  it("returns empty buckets when no active quests", async () => {
    const res = await route.GET(new Request("http://localhost/api/today/habit-surface"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.habitsDue).toEqual([]);
    expect(json.atRisk).toEqual([]);
    expect(json.captured).toEqual([]);
    expect(json.mondayReflectionCallout).toBeNull();
  });
});
