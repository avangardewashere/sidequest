import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockFindOneAndUpdate = vi.fn();
const mockFindOne = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    findOneAndUpdate: mockFindOneAndUpdate,
    findOne: mockFindOne,
  },
}));

const tagsRoute = await import("@/app/api/quests/[id]/tags/route");
const notesRoute = await import("@/app/api/quests/[id]/notes/route");
const noteByIdRoute = await import("@/app/api/quests/[id]/notes/[noteId]/route");
const linksRoute = await import("@/app/api/quests/[id]/links/route");
const linkByIdRoute = await import("@/app/api/quests/[id]/links/[linkId]/route");

describe("quest second-brain routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires auth for tags route", async () => {
    mockGetAuthSession.mockResolvedValue(null);

    const response = await tagsRoute.PATCH(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/tags", {
        method: "PATCH",
        body: JSON.stringify({ tags: ["work"] }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );

    expect(response.status).toBe(401);
  });

  it("updates tags with normalized values", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockFindOneAndUpdate.mockResolvedValue({ tags: ["work", "health"] });

    const response = await tagsRoute.PATCH(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/tags", {
        method: "PATCH",
        body: JSON.stringify({ tags: [" Work ", "HEALTH", "work"] }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.tags).toEqual(["work", "health"]);
  });

  it("creates note and rejects html body", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const save = vi.fn().mockResolvedValue(undefined);
    mockFindOne.mockResolvedValue({ notes: [], save });

    const createResponse = await notesRoute.POST(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/notes", {
        method: "POST",
        body: JSON.stringify({ body: "Daily reflection" }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );
    expect(createResponse.status).toBe(201);

    const invalidResponse = await notesRoute.POST(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/notes", {
        method: "POST",
        body: JSON.stringify({ body: "<script>alert(1)</script>" }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );
    expect(invalidResponse.status).toBe(400);
  });

  it("updates and deletes notes by noteId", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const save = vi.fn().mockResolvedValue(undefined);
    const noteId = "507f1f77bcf86cd799439012";
    const quest = { notes: [{ id: noteId, body: "old note", createdAt: new Date() }], save };
    mockFindOne.mockResolvedValue(quest);

    const patchResponse = await noteByIdRoute.PATCH(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/notes/507f1f77bcf86cd799439012", {
        method: "PATCH",
        body: JSON.stringify({ body: "updated note" }),
      }),
      {
        params: Promise.resolve({
          id: "507f1f77bcf86cd799439011",
          noteId,
        }),
      },
    );
    expect(patchResponse.status).toBe(200);

    const deleteResponse = await noteByIdRoute.DELETE(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/notes/507f1f77bcf86cd799439012", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          id: "507f1f77bcf86cd799439011",
          noteId,
        }),
      },
    );
    expect(deleteResponse.status).toBe(200);
    expect(save).toHaveBeenCalled();
  });

  it("rejects self-link and creates valid link", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });

    const selfResponse = await linksRoute.POST(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/links", {
        method: "POST",
        body: JSON.stringify({
          questId: "507f1f77bcf86cd799439011",
          kind: "related",
        }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );
    expect(selfResponse.status).toBe(400);

    const save = vi.fn().mockResolvedValue(undefined);
    const quest = {
      links: [],
      save,
    };
    mockFindOne.mockImplementation((query: { _id: string }) => {
      if (query._id === "507f1f77bcf86cd799439011") return Promise.resolve(quest);
      return {
        select: vi.fn().mockResolvedValue({ _id: "507f1f77bcf86cd799439013" }),
      };
    });

    const createResponse = await linksRoute.POST(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/links", {
        method: "POST",
        body: JSON.stringify({
          questId: "507f1f77bcf86cd799439013",
          kind: "related",
        }),
      }),
      { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
    );
    expect(createResponse.status).toBe(201);
  });

  it("deletes link by linkId", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    const save = vi.fn().mockResolvedValue(undefined);
    const quest = {
      links: [
        {
          _id: "507f1f77bcf86cd799439014",
          questId: "507f1f77bcf86cd799439013",
          kind: "related",
        },
      ],
      save,
    };
    mockFindOne.mockResolvedValue(quest);

    const response = await linkByIdRoute.DELETE(
      new Request("http://localhost/api/quests/507f1f77bcf86cd799439011/links/507f1f77bcf86cd799439014", {
        method: "DELETE",
      }),
      {
        params: Promise.resolve({
          id: "507f1f77bcf86cd799439011",
          linkId: "507f1f77bcf86cd799439014",
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
