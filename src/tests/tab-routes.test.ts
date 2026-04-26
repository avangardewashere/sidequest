import { describe, expect, it } from "vitest";
import { activeTabFromPathname, TAB_ROUTE_MAP } from "@/lib/tab-routes";

describe("tab routes", () => {
  it("has canonical route map", () => {
    expect(TAB_ROUTE_MAP).toEqual({
      today: "/",
      quests: "/quests/view",
      stats: "/stats",
      you: "/you",
    });
  });

  it("derives active tab from pathname", () => {
    expect(activeTabFromPathname("/")).toBe("today");
    expect(activeTabFromPathname("/quests/view")).toBe("quests");
    expect(activeTabFromPathname("/quests/create")).toBe("quests");
    expect(activeTabFromPathname("/stats")).toBe("stats");
    expect(activeTabFromPathname("/you")).toBe("you");
    expect(activeTabFromPathname("/something-else")).toBe("today");
  });
});
