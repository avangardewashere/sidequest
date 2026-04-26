import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockUserFindById = vi.fn();
const mockQuestAggregate = vi.fn();
const mockCompletionAggregate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    aggregate: mockQuestAggregate,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    aggregate: mockCompletionAggregate,
  },
}));

const suggestionRoute = await import("@/app/api/today/suggestion/route");

const validUserId = "507f191e810c19729de860ea";

function makeQuest(id: string, title: string, category: "work" | "study" | "health" | "personal" | "other") {
  return {
    _id: id,
    title,
    category,
  };
}

describe("today suggestion route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/today/suggestion requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));

    expect(response.status).toBe(401);
  });

  it("GET /api/today/suggestion returns null when no active quests", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingFocusArea: "work",
      onboardingEncouragementStyle: "gentle",
    });
    mockQuestAggregate.mockResolvedValue([]);
    mockCompletionAggregate.mockResolvedValue([]);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.suggestion).toBeNull();
  });

  it("GET /api/today/suggestion prefers focus-area match", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingFocusArea: "learning",
      onboardingEncouragementStyle: "direct",
    });
    mockQuestAggregate.mockResolvedValue([
      makeQuest("q1", "Ship report", "work"),
      makeQuest("q2", "Study pattern", "study"),
      makeQuest("q3", "Stretch", "health"),
    ]);
    mockCompletionAggregate.mockResolvedValue([{ category: "study" }]);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.suggestion.questId).toBe("q2");
    expect(json.suggestion.reason).toBe("focus_area_match");
    expect(json.suggestion.encouragementStyle).toBe("direct");
    expect(json.suggestion.summaryHeadline).toContain("match");
  });

  it("GET /api/today/suggestion uses category rotation when no focus match", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingFocusArea: "work",
      onboardingEncouragementStyle: "gentle",
    });
    mockQuestAggregate.mockResolvedValue([
      makeQuest("q1", "Work task", "work"),
      makeQuest("q2", "Gym", "health"),
      makeQuest("q3", "Read", "study"),
    ]);
    mockCompletionAggregate.mockResolvedValue([{ category: "work" }, { category: "health" }]);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.suggestion.questId).toBe("q1");
    expect(json.suggestion.reason).toBe("focus_area_match");

    mockUserFindById.mockResolvedValueOnce({
      onboardingFocusArea: "life",
      onboardingEncouragementStyle: "gentle",
    });

    const response2 = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json2 = await response2.json();
    expect(json2.suggestion.reason).toBe("category_rotation");
    expect(json2.suggestion.questId).toBe("q3");
  });

  it("GET /api/today/suggestion falls back to priority when all categories recently completed", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingFocusArea: "life",
      onboardingEncouragementStyle: "celebration",
    });
    mockQuestAggregate.mockResolvedValue([
      makeQuest("q1", "Top priority", "work"),
      makeQuest("q2", "Secondary", "health"),
    ]);
    mockCompletionAggregate.mockResolvedValue([{ category: "work" }, { category: "health" }]);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.suggestion.reason).toBe("fallback_priority");
    expect(json.suggestion.questId).toBe("q1");
    expect(json.suggestion.encouragementStyle).toBe("celebration");
  });

  it("GET /api/today/suggestion normalizes unknown encouragement style to gentle", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockUserFindById.mockResolvedValue({
      onboardingFocusArea: "work",
      onboardingEncouragementStyle: "unexpected",
    });
    mockQuestAggregate.mockResolvedValue([makeQuest("q1", "Work quest", "work")]);
    mockCompletionAggregate.mockResolvedValue([]);

    const response = await suggestionRoute.GET(new Request("http://localhost/api/today/suggestion"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.suggestion.encouragementStyle).toBe("gentle");
  });
});
