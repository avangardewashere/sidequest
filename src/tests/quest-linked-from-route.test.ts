import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/quests/[id]/linked-from/route";

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
  QuestModel: { find: findMock },
}));

describe("GET /api/quests/[id]/linked-from", () => {
  it("returns 401 when unauthenticated", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue(null);

    const res = await GET(new Request("http://localhost/api/quests/x/linked-from"), {
      params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns linked-from quests for the current user", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: "u1" } } as never);

    const id = "507f1f77bcf86cd799439011";
    const chain = {
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([
        { _id: { toString: () => "a1" }, title: "Linker A" },
        { _id: { toString: () => "a2" }, title: "Linker B" },
      ]),
    };
    findMock.mockReturnValue(chain);

    const res = await GET(new Request(`http://localhost/api/quests/${id}/linked-from`), {
      params: Promise.resolve({ id }),
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { quests: { _id: string; title: string }[] };
    expect(json.quests).toEqual([
      { _id: "a1", title: "Linker A" },
      { _id: "a2", title: "Linker B" },
    ]);
    expect(findMock).toHaveBeenCalled();
  });
});
