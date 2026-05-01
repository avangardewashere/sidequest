import { describe, expect, it, vi } from "vitest";
import { GET, escapeRegex } from "@/app/api/quests/search/route";

vi.mock("@/lib/auth", () => ({
  getAuthSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: vi.fn(() => Promise.resolve()),
}));

const { findMock } = vi.hoisted(() => ({
  findMock: vi.fn(),
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    find: findMock,
  },
}));

describe("escapeRegex", () => {
  it("escapes regex metacharacters", () => {
    expect(escapeRegex("a+b")).toBe("a\\+b");
    expect(escapeRegex("x.*y")).toBe("x\\.\\*y");
  });
});

describe("GET /api/quests/search", () => {
  it("returns 401 when unauthenticated", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/quests/search?q=test");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for empty query", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } } as never);

    const req = new Request("http://localhost/api/quests/search?q=%20%20%20");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns quests and nextCursor from find chain", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: "507f1f77bcf86cd799439011" } } as never);

    const lean = vi.fn().mockResolvedValue([
      { _id: "507f1f77bcf86cd799439012", title: "A", description: "d", tags: ["t"] },
      { _id: "507f1f77bcf86cd799439013", title: "B", description: "e", tags: [] },
    ]);
    const select = vi.fn(() => ({ lean }));
    const limit = vi.fn(() => ({ select }));
    const sort = vi.fn(() => ({ limit }));
    findMock.mockReturnValue({ sort });

    const req = new Request("http://localhost/api/quests/search?q=foo&limit=1");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { quests: { _id: string; title: string }[]; nextCursor: string | null };
    expect(json.quests).toHaveLength(1);
    expect(json.quests[0].title).toBe("A");
    expect(json.nextCursor).toBe("507f1f77bcf86cd799439012");
    expect(limit).toHaveBeenCalledWith(2);
  });
});
