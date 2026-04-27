import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockMongooseStartSession = vi.fn();
const mockIsValidObjectId = vi.fn();
const mockFocusFindOne = vi.fn();
const mockFocusCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/FocusSession", () => ({
  FocusSessionModel: {
    findOne: mockFocusFindOne,
    create: mockFocusCreate,
  },
}));

vi.mock("mongoose", async (importOriginal) => {
  const actual = await importOriginal<typeof import("mongoose")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: mockMongooseStartSession,
      Types: {
        ...actual.default.Types,
        ObjectId: {
          ...actual.default.Types.ObjectId,
          isValid: mockIsValidObjectId,
        },
      },
    },
    startSession: mockMongooseStartSession,
  };
});

const focusStartRoute = await import("@/app/api/focus/start/route");
const focusStopRoute = await import("@/app/api/focus/stop/route");
const focusActiveRoute = await import("@/app/api/focus/active/route");

describe("focus pipeline routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsValidObjectId.mockReturnValue(true);
  });

  it("start closes prior open session and creates a new one", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const oldSave = vi.fn().mockResolvedValue(undefined);
    const oldSession = {
      startedAt: new Date("2026-04-26T00:00:00.000Z"),
      endedAt: null,
      durationSec: 0,
      save: oldSave,
    };
    mockFocusFindOne.mockReturnValue({
      session: vi.fn().mockResolvedValue(oldSession),
    });
    mockFocusCreate.mockResolvedValue([
      {
        _id: "new-focus-1",
        startedAt: new Date("2026-04-26T01:00:00.000Z"),
        questId: null,
      },
    ]);
    const mockDbSession = {
      withTransaction: vi.fn(async (cb: () => Promise<void>) => cb()),
      endSession: vi.fn(),
    };
    mockMongooseStartSession.mockResolvedValue(mockDbSession);

    const response = await focusStartRoute.POST(
      new Request("http://localhost/api/focus/start", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(oldSave).toHaveBeenCalledTimes(1);
    expect(mockFocusCreate).toHaveBeenCalledTimes(1);
    expect(json.session._id).toBe("new-focus-1");
    expect(mockDbSession.endSession).toHaveBeenCalledTimes(1);
  });

  it("stop computes duration from server timestamps", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const startedAt = new Date(Date.now() - 12_000);
    const save = vi.fn().mockResolvedValue(undefined);
    const active = {
      _id: "focus-1",
      startedAt,
      endedAt: null,
      durationSec: 0,
      questId: null,
      save,
    };
    mockFocusFindOne.mockResolvedValue(active);

    const response = await focusStopRoute.POST(
      new Request("http://localhost/api/focus/stop", { method: "POST" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.session.durationSec).toBeGreaterThanOrEqual(11);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("stop returns 409 when no active session exists", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockFocusFindOne.mockResolvedValue(null);

    const response = await focusStopRoute.POST(
      new Request("http://localhost/api/focus/stop", { method: "POST" }),
    );
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe("No active focus session");
  });

  it("active returns null when no active session exists", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockFocusFindOne.mockReturnValue({
      sort: vi.fn().mockResolvedValue(null),
    });

    const response = await focusActiveRoute.GET(
      new Request("http://localhost/api/focus/active", { method: "GET" }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.session).toBeNull();
  });
});
