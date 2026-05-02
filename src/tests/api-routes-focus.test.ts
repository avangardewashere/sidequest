import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockCompletionAggregate = vi.fn();
const mockQuestAggregate = vi.fn();
const mockQuestCountDocuments = vi.fn();
const mockMilestoneCountDocuments = vi.fn();
const mockUserFindById = vi.fn();
const mockFocusAggregate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    aggregate: mockCompletionAggregate,
  },
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    aggregate: mockQuestAggregate,
    countDocuments: mockQuestCountDocuments,
  },
}));

vi.mock("@/models/MilestoneRewardLog", () => ({
  MilestoneRewardLogModel: {
    countDocuments: mockMilestoneCountDocuments,
  },
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/FocusSession", () => ({
  FocusSessionModel: {
    aggregate: mockFocusAggregate,
  },
}));

const metricsSummaryRoute = await import("@/app/api/metrics/summary/route");

describe("focus metrics summary integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes focusMinutesLast7d in kpis", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } });
    mockUserFindById.mockResolvedValue({ currentStreak: 2, longestStreak: 7 });
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
    mockFocusAggregate.mockResolvedValueOnce([{ _id: null, durationSecTotal: 3600 }]);

    const response = await metricsSummaryRoute.GET(
      new Request("http://localhost/api/metrics/summary?range=7d", { method: "GET" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.kpis.focusMinutesLast7d).toBe(60);
  });
});
