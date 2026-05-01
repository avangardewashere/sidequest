import { normalizeQuestCadence, type CadenceQuestLike } from "@/lib/cadence";
import type { Quest } from "@/types/dashboard";

/** API list status filter (legacy `daily` removed from client sends; API may still accept it). */
export type QuestStatusFilter = "all" | "active" | "completed";
export type QuestCategoryFilter = "all" | Quest["category"];
export type QuestSortOption = "newest" | "oldest" | "highest_xp" | "category";

export type QuestListQuery = {
  status: QuestStatusFilter;
  category: QuestCategoryFilter;
  sort: QuestSortOption;
  limit?: number;
};

export type QuestListTab = "habits" | "todos" | "all";

export type QuestListViewFilters = {
  tab: QuestListTab;
  /** When true, only quests with no parent (`parentQuestId` null/undefined). */
  topLevelOnly: boolean;
  /** Normalized lowercase tag, or null for no tag filter. */
  tag: string | null;
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

/** True when the quest is a habit (any cadence other than oneoff). */
export function isHabitQuest(quest: CadenceQuestLike): boolean {
  return normalizeQuestCadence(quest).kind !== "oneoff";
}

/** Count direct children per parent id from a flat quest list. */
export function computeChildCounts(quests: Quest[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const q of quests) {
    const pid = q.parentQuestId;
    if (pid) {
      counts.set(pid, (counts.get(pid) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Client-side filters for the quest list page (tabs, top-level, tag).
 * Assumes `quests` is already narrowed by API status/category/sort.
 */
export function filterQuestsForListView(quests: Quest[], filters: QuestListViewFilters): Quest[] {
  let out = quests;
  if (filters.topLevelOnly) {
    out = out.filter((q) => !q.parentQuestId);
  }
  if (filters.tab === "habits") {
    out = out.filter((q) => isHabitQuest(q));
  } else if (filters.tab === "todos") {
    out = out.filter((q) => !isHabitQuest(q));
  }
  if (filters.tag) {
    const needle = filters.tag.toLowerCase();
    out = out.filter((q) => (q.tags ?? []).some((t) => t.toLowerCase() === needle));
  }
  return out;
}

export function selectQuests(
  dailies: Quest[],
  activeQuests: Quest[],
  completedQuests: Quest[],
  query: QuestQuery,
): Quest[] {
  const merged = mergeQuestLists(dailies, activeQuests, completedQuests);

  const filtered = merged.filter((quest) => {
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
