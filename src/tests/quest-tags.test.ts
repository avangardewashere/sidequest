import { describe, expect, it, vi } from "vitest";

const mockAggregate = vi.fn();

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    aggregate: mockAggregate,
  },
}));

const { normalizeTags, userTagSuggestions } = await import("@/lib/quest-tags");

describe("quest-tags helpers", () => {
  it("normalizes, dedupes, and caps tags", () => {
    const tags = normalizeTags([
      "  Work ",
      "work",
      "HEALTH",
      "",
      "   ",
      "a".repeat(33),
      "study",
      "personal",
      "other",
      "one",
      "two",
      "three",
      "four",
    ]);

    expect(tags).toEqual(["work", "health", "study", "personal", "other", "one", "two", "three"]);
  });

  it("returns suggestions for matching prefix", async () => {
    mockAggregate.mockResolvedValue([{ _id: "health" }, { _id: "home" }]);

    const suggestions = await userTagSuggestions("507f1f77bcf86cd799439011", "h");

    expect(suggestions).toEqual(["health", "home"]);
    expect(mockAggregate).toHaveBeenCalledTimes(1);
  });
});
