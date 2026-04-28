import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockQuestFindOne = vi.fn();
const mockCompletionFind = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    findOne: mockQuestFindOne,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    find: mockCompletionFind,
  },
}));

const historyRoute = await import("@/app/api/quests/[id]/history/route");

describe("quest history route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const response = await historyRoute.GET(new Request("http://localhost/api/quests/q1/history"), {
      params: Promise.resolve({ id: "q1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 404 when quest is missing", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockQuestFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await historyRoute.GET(new Request("http://localhost/api/quests/q1/history"), {
      params: Promise.resolve({ id: "q1" }),
    });

    expect(response.status).toBe(404);
  });

  it("returns completion history payload", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockQuestFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: "q1" }),
    });
    mockCompletionFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            {
              completionDate: "2026-04-29",
              xpEarned: 20,
              completedAt: new Date("2026-04-29T10:00:00.000Z"),
            },
          ]),
        }),
      }),
    });

    const response = await historyRoute.GET(
      new Request("http://localhost/api/quests/q1/history?days=30"),
      {
        params: Promise.resolve({ id: "q1" }),
      },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(json.completions)).toBe(true);
    expect(json.completions[0]).toMatchObject({
      date: "2026-04-29",
      xp: 20,
    });
  });
});
