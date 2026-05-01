export type QuestSearchKind = "all" | "tag" | "title" | "note";

export type QuestSearchHit = {
  _id: string;
  title: string;
  description: string;
  tags: string[];
};

export type QuestSearchResult = {
  quests: QuestSearchHit[];
  nextCursor: string | null;
};

export type QuestLinkedFromHit = {
  _id: string;
  title: string;
};
