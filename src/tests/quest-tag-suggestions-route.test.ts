import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/quests/tag-suggestions/route";

vi.mock("@/lib/auth", () => ({
  getAuthSession: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: vi.fn(() => Promise.resolve()),
}));

const { userTagSuggestionsMock } = vi.hoisted(() => ({
  userTagSuggestionsMock: vi.fn(() => Promise.resolve(["alpha", "alphabet"])),
}));

vi.mock("@/lib/quest-tags", () => ({
  userTagSuggestions: userTagSuggestionsMock,
}));

describe("GET /api/quests/tag-suggestions", () => {
  it("returns suggestions for an authenticated user", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue({ user: { id: "u1" } } as never);

    const req = new Request("http://localhost/api/quests/tag-suggestions?prefix=al");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { suggestions: string[] };
    expect(json.suggestions).toEqual(["alpha", "alphabet"]);
    expect(userTagSuggestionsMock).toHaveBeenCalledWith("u1", "al");
  });

  it("returns 401 when unauthenticated", async () => {
    const { getAuthSession } = await import("@/lib/auth");
    vi.mocked(getAuthSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/quests/tag-suggestions?prefix=x");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
