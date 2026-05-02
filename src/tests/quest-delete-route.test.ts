import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetAuthSession,
  mockConnectToDatabase,
  mockStartSession,
  mockQuestFindOne,
  mockQuestCountDocuments,
  mockQuestUpdateMany,
  mockQuestFind,
  mockQuestDeleteOne,
  mockUserFindById,
  mockCompletionFind,
  mockCompletionDeleteMany,
} = vi.hoisted(() => ({
  mockGetAuthSession: vi.fn(),
  mockConnectToDatabase: vi.fn(),
  mockStartSession: vi.fn(),
  mockQuestFindOne: vi.fn(),
  mockQuestCountDocuments: vi.fn(),
  mockQuestUpdateMany: vi.fn(),
  mockQuestFind: vi.fn(),
  mockQuestDeleteOne: vi.fn(),
  mockUserFindById: vi.fn(),
  mockCompletionFind: vi.fn(),
  mockCompletionDeleteMany: vi.fn(),
}));

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
    countDocuments: mockQuestCountDocuments,
    updateMany: mockQuestUpdateMany,
    find: mockQuestFind,
    deleteOne: mockQuestDeleteOne,
  },
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/CompletionLog", () => ({
  CompletionLogModel: {
    find: mockCompletionFind,
    deleteMany: mockCompletionDeleteMany,
  },
}));

const { DELETE } = await import("@/app/api/quests/[id]/route");

/** Valid 24-hex ids — route builds `new Types.ObjectId(userId)`. */
const USER_ID = "507f1f77bcf86cd799439099";
const QUEST_ID = "507f1f77bcf86cd799439011";

describe("DELETE /api/quests/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupSession() {
    const dbSession = {
      withTransaction: vi.fn(async (cb: () => Promise<void>) => {
        await cb();
      }),
      endSession: vi.fn(() => Promise.resolve()),
    };
    mockStartSession.mockResolvedValue(dbSession);
    return dbSession;
  }

  function chainSession<T>(result: Promise<T> | T) {
    return {
      session: vi.fn(() => Promise.resolve(result)),
    };
  }

  it("returns 400 when quest has children but childDisposition is missing", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    mockQuestFindOne.mockResolvedValue({
      _id: QUEST_ID,
      title: "Alpha",
      createdBy: USER_ID,
    });
    mockQuestCountDocuments.mockResolvedValue(2);

    const req = new Request(`http://localhost/api/quests/${QUEST_ID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmTitle: "Alpha" }),
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(400);
    const json = (await res.json()) as { code?: string; childCount?: number };
    expect(json.code).toBe("SUBTASKS_REQUIRE_DISPOSITION");
    expect(json.childCount).toBe(2);
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it("reparents children then deletes parent when childDisposition is reparent-to-root", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: USER_ID } });
    setupSession();

    mockQuestFindOne.mockResolvedValue({
      _id: QUEST_ID,
      title: "Alpha",
      createdBy: USER_ID,
    });
    mockQuestCountDocuments.mockResolvedValue(1);

    mockQuestUpdateMany.mockReturnValue(chainSession({ modifiedCount: 1 }));

    const mockUser = {
      totalXp: 100,
      level: 2,
      save: vi.fn(() => Promise.resolve()),
    };
    mockUserFindById.mockReturnValue(chainSession(mockUser));

    mockCompletionFind.mockReturnValue(chainSession([]));
    mockCompletionDeleteMany.mockReturnValue(chainSession({ deletedCount: 0 }));
    mockQuestDeleteOne.mockReturnValue(chainSession({ deletedCount: 1 }));

    const req = new Request(`http://localhost/api/quests/${QUEST_ID}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confirmTitle: "Alpha",
        childDisposition: "reparent-to-root",
      }),
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: QUEST_ID }) });
    expect(res.status).toBe(200);
    expect(mockQuestUpdateMany).toHaveBeenCalled();
    expect(mockQuestDeleteOne).toHaveBeenCalled();
  });
});
