import { describe, expect, it } from "vitest";
import {
  computeChildCounts,
  filterQuestsForListView,
  isHabitQuest,
} from "@/lib/quest-selectors";
import type { Quest } from "@/types/dashboard";

const base = (over: Partial<Quest>): Quest => ({
  _id: "1",
  title: "T",
  description: "D",
  difficulty: "easy",
  category: "personal",
  xpReward: 10,
  status: "active",
  ...over,
});

describe("isHabitQuest", () => {
  it("treats oneoff and missing cadence as todo", () => {
    expect(isHabitQuest(base({ cadence: { kind: "oneoff" } }))).toBe(false);
    expect(isHabitQuest(base({}))).toBe(false);
  });

  it("treats daily and weekdays as habits", () => {
    expect(isHabitQuest(base({ cadence: { kind: "daily" } }))).toBe(true);
    expect(isHabitQuest(base({ isDaily: true }))).toBe(true);
  });
});

describe("computeChildCounts", () => {
  it("counts children per parent", () => {
    const quests = [
      base({ _id: "p", parentQuestId: null }),
      base({ _id: "c1", parentQuestId: "p" }),
      base({ _id: "c2", parentQuestId: "p" }),
    ];
    const m = computeChildCounts(quests);
    expect(m.get("p")).toBe(2);
  });
});

describe("filterQuestsForListView", () => {
  const quests: Quest[] = [
    base({ _id: "a", parentQuestId: null, cadence: { kind: "daily" }, tags: ["x"] }),
    base({ _id: "b", parentQuestId: null, cadence: { kind: "oneoff" }, tags: ["y"] }),
    base({ _id: "c", parentQuestId: "a", cadence: { kind: "oneoff" } }),
  ];

  it("filters top-level only", () => {
    const r = filterQuestsForListView(quests, { tab: "all", topLevelOnly: true, tag: null });
    expect(r.map((q) => q._id).sort()).toEqual(["a", "b"]);
  });

  it("filters habits tab", () => {
    const r = filterQuestsForListView(quests, { tab: "habits", topLevelOnly: true, tag: null });
    expect(r.map((q) => q._id)).toEqual(["a"]);
  });

  it("filters todos tab", () => {
    const r = filterQuestsForListView(quests, { tab: "todos", topLevelOnly: true, tag: null });
    expect(r.map((q) => q._id)).toEqual(["b"]);
  });

  it("filters by tag case-insensitively", () => {
    const r = filterQuestsForListView(quests, { tab: "all", topLevelOnly: true, tag: "X" });
    expect(r.map((q) => q._id)).toEqual(["a"]);
  });
});
