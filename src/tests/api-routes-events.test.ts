import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockBehaviorEventCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/BehaviorEvent", () => ({
  BehaviorEventModel: {
    create: mockBehaviorEventCreate,
  },
}));

const eventsRoute = await import("@/app/api/events/route");

const validUserId = "507f191e810c19729de860ea";

function buildRequest(body: unknown) {
  return new Request("http://localhost/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("events route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    eventsRoute.__resetEventRateLimitForTests();
  });

  it("POST /api/events requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const response = await eventsRoute.POST(buildRequest({ name: "weekly_review_viewed" }));

    expect(response.status).toBe(401);
    expect(mockBehaviorEventCreate).not.toHaveBeenCalled();
  });

  it("POST /api/events returns 400 on invalid name", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });

    const response = await eventsRoute.POST(buildRequest({ name: "unknown_event_name" }));

    expect(response.status).toBe(400);
    expect(mockBehaviorEventCreate).not.toHaveBeenCalled();
  });

  it("POST /api/events returns 400 on oversized properties payload", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });

    const response = await eventsRoute.POST(
      buildRequest({
        name: "suggestion_viewed",
        properties: {
          text: "x".repeat(5000),
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(mockBehaviorEventCreate).not.toHaveBeenCalled();
  });

  it("POST /api/events persists allowlisted event and returns response shape", async () => {
    const now = new Date("2026-04-27T00:00:00.000Z");
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockBehaviorEventCreate.mockResolvedValue({
      _id: "evt-1",
      name: "weekly_review_viewed",
      createdAt: now,
    });

    const response = await eventsRoute.POST(
      buildRequest({
        name: "weekly_review_viewed",
        properties: {
          rangeStart: "2026-04-20",
          rangeEnd: "2026-04-26",
        },
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
    expect(mockBehaviorEventCreate).toHaveBeenCalledTimes(1);
    expect(json.event).toEqual({
      id: "evt-1",
      name: "weekly_review_viewed",
      createdAt: now.toISOString(),
    });
  });

  it("POST /api/events returns 429 after per-user rate limit is exceeded", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockBehaviorEventCreate.mockResolvedValue({
      _id: "evt-1",
      name: "quest_completed",
      createdAt: new Date("2026-04-27T00:00:00.000Z"),
    });

    for (let i = 0; i < 20; i += 1) {
      const response = await eventsRoute.POST(buildRequest({ name: "quest_completed" }));
      expect(response.status).toBe(200);
    }

    const blocked = await eventsRoute.POST(buildRequest({ name: "quest_completed" }));
    expect(blocked.status).toBe(429);
  });
});
