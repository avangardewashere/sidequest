import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockBehaviorEventFind = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/BehaviorEvent", () => ({
  BehaviorEventModel: {
    find: mockBehaviorEventFind,
  },
}));

const eventsAnalyticsRoute = await import("@/app/api/events/analytics/route");

const validUserId = "507f191e810c19729de860ea";

function buildRequest(range?: string | null) {
  if (range === undefined) {
    return new Request("http://localhost/api/events/analytics");
  }
  if (range === null) {
    return new Request("http://localhost/api/events/analytics?range=");
  }
  return new Request(`http://localhost/api/events/analytics?range=${encodeURIComponent(range)}`);
}

function mockFindResolves(events: Array<{ name: string; createdAt: Date }>) {
  mockBehaviorEventFind.mockReturnValue({
    sort: () => ({
      lean: () => Promise.resolve(events),
    }),
  });
}

describe("events analytics route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/events/analytics requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const response = await eventsAnalyticsRoute.GET(buildRequest("7d"));

    expect(response.status).toBe(401);
    expect(mockBehaviorEventFind).not.toHaveBeenCalled();
  });

  it("GET /api/events/analytics rejects missing range", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });

    const response = await eventsAnalyticsRoute.GET(buildRequest(undefined));

    expect(response.status).toBe(400);
    expect(mockBehaviorEventFind).not.toHaveBeenCalled();
  });

  it("GET /api/events/analytics rejects invalid range", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });

    const response = await eventsAnalyticsRoute.GET(buildRequest("365d"));

    expect(response.status).toBe(400);
    expect(mockBehaviorEventFind).not.toHaveBeenCalled();
  });

  it("GET /api/events/analytics returns zeroed analytics for an empty window", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockFindResolves([]);

    const response = await eventsAnalyticsRoute.GET(buildRequest("7d"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
    expect(json.analytics).toMatchObject({
      range: "7d",
      rangeDays: 7,
      totalEvents: 0,
      reviewViews: 0,
      suggestionViews: 0,
      suggestionClicks: 0,
      suggestionClickRatePct: 0,
      questCompletionsAfterSuggestionView: 0,
      latestEventAt: null,
    });
    expect(json.analytics.byName).toEqual({
      weekly_review_viewed: 0,
      historical_review_viewed: 0,
      suggestion_viewed: 0,
      suggestion_clicked: 0,
      quest_completed: 0,
    });
  });

  it("GET /api/events/analytics aggregates a populated window with derived metrics", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockFindResolves([
      { name: "weekly_review_viewed", createdAt: new Date("2026-04-20T10:00:00.000Z") },
      { name: "historical_review_viewed", createdAt: new Date("2026-04-20T11:00:00.000Z") },
      { name: "suggestion_viewed", createdAt: new Date("2026-04-21T09:00:00.000Z") },
      { name: "suggestion_viewed", createdAt: new Date("2026-04-21T09:01:00.000Z") },
      { name: "suggestion_clicked", createdAt: new Date("2026-04-21T09:05:00.000Z") },
      { name: "quest_completed", createdAt: new Date("2026-04-21T09:30:00.000Z") },
      { name: "quest_completed", createdAt: new Date("2026-04-22T08:00:00.000Z") },
    ]);

    const response = await eventsAnalyticsRoute.GET(buildRequest("30d"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.analytics.range).toBe("30d");
    expect(json.analytics.rangeDays).toBe(30);
    expect(json.analytics.totalEvents).toBe(7);
    expect(json.analytics.reviewViews).toBe(2);
    expect(json.analytics.suggestionViews).toBe(2);
    expect(json.analytics.suggestionClicks).toBe(1);
    expect(json.analytics.suggestionClickRatePct).toBe(50);
    expect(json.analytics.questCompletionsAfterSuggestionView).toBe(2);
    expect(json.analytics.latestEventAt).toBe("2026-04-22T08:00:00.000Z");
  });

  it("GET /api/events/analytics formats latestEventAt as an ISO string", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    const lastTimestamp = new Date("2026-04-22T08:00:00.000Z");
    mockFindResolves([
      { name: "weekly_review_viewed", createdAt: lastTimestamp },
    ]);

    const response = await eventsAnalyticsRoute.GET(buildRequest("90d"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.analytics.latestEventAt).toBe(lastTimestamp.toISOString());
  });
});
