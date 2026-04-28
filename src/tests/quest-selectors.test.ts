import { describe, expect, it } from "vitest";
import { siblingsOf, withChildren } from "@/lib/quest-selectors";
import type { Quest } from "@/types/dashboard";

function makeQuest(overrides: Partial<Quest> & Pick<Quest, "_id" | "title">): Quest {
  return {
    _id: overrides._id,
    title: overrides.title,
    description: overrides.description ?? "desc",
    difficulty: overrides.difficulty ?? "easy",
    category: overrides.category ?? "personal",
    xpReward: overrides.xpReward ?? 10,
    status: overrides.status ?? "active",
    parentQuestId: overrides.parentQuestId ?? null,
  };
}

describe("quest-selectors hierarchy helpers", () => {
  it("withChildren returns parent and child list", () => {
    const quests: Quest[] = [
      makeQuest({ _id: "p1", title: "Parent" }),
      makeQuest({ _id: "c1", title: "Child 1", parentQuestId: "p1" }),
      makeQuest({ _id: "c2", title: "Child 2", parentQuestId: "p1" }),
      makeQuest({ _id: "x1", title: "Other parent" }),
    ];

    const result = withChildren(quests, "p1");
    expect(result?._id).toBe("p1");
    expect(result?.children.map((child) => child._id)).toEqual(["c1", "c2"]);
  });

  it("siblingsOf returns quests with same parent excluding self", () => {
    const quests: Quest[] = [
      makeQuest({ _id: "p1", title: "Parent" }),
      makeQuest({ _id: "c1", title: "Child 1", parentQuestId: "p1" }),
      makeQuest({ _id: "c2", title: "Child 2", parentQuestId: "p1" }),
      makeQuest({ _id: "c3", title: "Child 3", parentQuestId: "p2" }),
    ];

    const siblings = siblingsOf(quests, "c1");
    expect(siblings.map((quest) => quest._id)).toEqual(["c2"]);
  });
});
