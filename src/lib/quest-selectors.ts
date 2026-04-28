import type { Quest } from "@/types/dashboard";

export type QuestStatusFilter = "all" | "active" | "completed" | "daily";
export type QuestCategoryFilter = "all" | Quest["category"];
export type QuestSortOption = "newest" | "oldest" | "highest_xp" | "category";

export type QuestListQuery = {
  status: QuestStatusFilter;
  category: QuestCategoryFilter;
  sort: QuestSortOption;
  limit?: number;
};

type QuestQuery = QuestListQuery;
export type QuestWithChildren = Quest & { children: Quest[] };

function mergeQuestLists(
  dailies: Quest[],
  activeQuests: Quest[],
  completedQuests: Quest[],
): Quest[] {
  const byId = new Map<string, Quest>();
  for (const quest of [...dailies, ...activeQuests, ...completedQuests]) {
    byId.set(quest._id, quest);
  }
  return Array.from(byId.values());
}

export function selectQuests(
  dailies: Quest[],
  activeQuests: Quest[],
  completedQuests: Quest[],
  query: QuestQuery,
): Quest[] {
  const merged = mergeQuestLists(dailies, activeQuests, completedQuests);

  const filtered = merged.filter((quest) => {
    if (query.status === "daily" && !quest.isDaily) {
      return false;
    }
    if (query.status === "active" && quest.status !== "active") {
      return false;
    }
    if (query.status === "completed" && quest.status !== "completed") {
      return false;
    }
    if (query.category !== "all" && quest.category !== query.category) {
      return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (query.sort === "oldest") {
      return a._id.localeCompare(b._id);
    }
    if (query.sort === "highest_xp") {
      return b.xpReward - a.xpReward;
    }
    if (query.sort === "category") {
      const categoryCmp = a.category.localeCompare(b.category);
      if (categoryCmp !== 0) {
        return categoryCmp;
      }
      return b._id.localeCompare(a._id);
    }
    return b._id.localeCompare(a._id);
  });
}

export function withChildren(quests: Quest[], parentId: string): QuestWithChildren | null {
  const parent = quests.find((quest) => quest._id === parentId);
  if (!parent) {
    return null;
  }

  const children = quests.filter((quest) => quest.parentQuestId === parentId);
  return { ...parent, children };
}

export function siblingsOf(quests: Quest[], questId: string): Quest[] {
  const quest = quests.find((item) => item._id === questId);
  if (!quest) {
    return [];
  }

  const parentQuestId = quest.parentQuestId ?? null;
  return quests.filter((item) => item._id !== questId && (item.parentQuestId ?? null) === parentQuestId);
}
