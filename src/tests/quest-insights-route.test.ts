import { describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockQuestFindOne = vi.fn();
const mockCompletionFind = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: vi.fn(() => Promise.resolve()),
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

const { GET } = await import("@/app/api/quests/[id]/insights/route");

const USER_ID = "507f1f77bcf86cd799439099";
const QUEST_ID = "507f1f77bcf86cd799439011";

describe("GET /api/quests/[id]/insights", () => {
  it("returns habit false for one-off quests", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    mockQuestFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: QUEST_ID,
        createdBy: USER_ID,
        cadence: { kind: "oneoff" },
        isDaily: false,
      }),
    });

    const res = await GET(new Request(`http://localhost/api/quests/${QUEST_ID}/insights`), {
      params: Promise.resolve({ id: QUEST_ID }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { habit: boolean; message?: string };
    expect(json.habit).toBe(false);
    expect(json.message).toBeDefined();
    expect(mockCompletionFind).not.toHaveBeenCalled();
  });

  it("returns habit insights for daily quest", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    mockQuestFindOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: QUEST_ID,
        createdBy: USER_ID,
        cadence: { kind: "daily" },
        isDaily: false,
      }),
    });
    mockCompletionFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockResolvedValue([
            { completionDate: "2026-05-01", xpEarned: 10 },
            { completionDate: "2026-05-02", xpEarned: 10 },
          ]),
        }),
      }),
    });

    const res = await GET(new Request(`http://localhost/api/quests/${QUEST_ID}/insights?weeks=4`), {
      params: Promise.resolve({ id: QUEST_ID }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { habit: boolean; weeks?: unknown[]; currentStreak?: number };
    expect(json.habit).toBe(true);
    expect(Array.isArray(json.weeks)).toBe(true);
    expect((json.weeks as unknown[]).length).toBe(4);
    expect(typeof json.currentStreak).toBe("number");
  });
});
