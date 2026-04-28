import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockQuestFindOne = vi.fn();
const mockQuestFind = vi.fn();
const mockQuestCreate = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    findOne: mockQuestFindOne,
    find: mockQuestFind,
    create: mockQuestCreate,
  },
}));

const childrenRoute = await import("@/app/api/quests/[id]/children/route");

const validUserId = "507f191e810c19729de860ea";
const validParentId = "507f191e810c19729de860eb";

describe("quest children route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth for GET and POST", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const getResponse = await childrenRoute.GET(new Request("http://localhost/api/quests/x/children"), {
      params: Promise.resolve({ id: validParentId }),
    });
    const postResponse = await childrenRoute.POST(
      new Request("http://localhost/api/quests/x/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Child quest",
          description: "Desc",
          difficulty: "easy",
          category: "work",
        }),
      }),
      {
        params: Promise.resolve({ id: validParentId }),
      },
    );

    expect(getResponse.status).toBe(401);
    expect(postResponse.status).toBe(401);
  });

  it("returns 404 when parent quest is not found", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockQuestFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });

    const response = await childrenRoute.GET(new Request("http://localhost/api/quests/x/children"), {
      params: Promise.resolve({ id: validParentId }),
    });

    expect(response.status).toBe(404);
  });

  it("returns children list for GET", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockQuestFindOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: validParentId }),
    });
    const children = [
      { _id: "c1", title: "Child 1", parentQuestId: validParentId },
      { _id: "c2", title: "Child 2", parentQuestId: validParentId },
    ];
    mockQuestFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(children),
      }),
    });

    const response = await childrenRoute.GET(new Request("http://localhost/api/quests/x/children"), {
      params: Promise.resolve({ id: validParentId }),
    });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
    expect(json.children).toEqual(children);
  });

  it("returns 400 when parent is already a child", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockQuestFindOne.mockResolvedValue({ _id: validParentId, parentQuestId: "507f191e810c19729de860ff" });

    const response = await childrenRoute.POST(
      new Request("http://localhost/api/quests/x/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nested child",
          description: "Desc",
          difficulty: "medium",
          category: "study",
        }),
      }),
      {
        params: Promise.resolve({ id: validParentId }),
      },
    );

    expect(response.status).toBe(400);
    expect(mockQuestCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when parent is daily", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockQuestFindOne.mockResolvedValue({ _id: validParentId, parentQuestId: null, isDaily: true });

    const response = await childrenRoute.POST(
      new Request("http://localhost/api/quests/x/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Daily child",
          description: "Desc",
          difficulty: "medium",
          category: "study",
        }),
      }),
      {
        params: Promise.resolve({ id: validParentId }),
      },
    );

    expect(response.status).toBe(400);
    expect(mockQuestCreate).not.toHaveBeenCalled();
  });

  it("creates child quest on valid POST", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: validUserId } });
    mockQuestFindOne.mockResolvedValue({ _id: validParentId, parentQuestId: null, isDaily: false });
    mockQuestCreate.mockResolvedValue({
      _id: "child-id-1",
      title: "Child quest",
      parentQuestId: validParentId,
    });

    const response = await childrenRoute.POST(
      new Request("http://localhost/api/quests/x/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Child quest",
          description: "Desc",
          difficulty: "hard",
          category: "work",
        }),
      }),
      {
        params: Promise.resolve({ id: validParentId }),
      },
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(mockQuestCreate).toHaveBeenCalledTimes(1);
    expect(json.quest._id).toBe("child-id-1");
  });
});
