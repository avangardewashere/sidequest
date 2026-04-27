export type AppTabId = "today" | "quests" | "stats" | "you";

export const TAB_ROUTE_MAP: Record<AppTabId, string> = {
  today: "/",
  quests: "/quests/view",
  stats: "/stats",
  you: "/you",
};

export function activeTabFromPathname(pathname: string): AppTabId {
  if (pathname.startsWith("/quests")) {
    return "quests";
  }
  if (pathname.startsWith("/stats")) {
    return "stats";
  }
  if (pathname.startsWith("/you")) {
    return "you";
  }
  return "today";
}
