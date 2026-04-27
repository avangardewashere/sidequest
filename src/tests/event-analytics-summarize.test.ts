import { describe, expect, it } from "vitest";
import { summarizeEvents, type SummarizableBehaviorEvent } from "@/lib/event-analytics";

function event(name: string, isoTimestamp: string): SummarizableBehaviorEvent {
  return { name, createdAt: new Date(isoTimestamp) };
}

describe("summarizeEvents", () => {
  it("returns zeroed structure for an empty event list", () => {
    const result = summarizeEvents([]);

    expect(result.totalEvents).toBe(0);
    expect(result.reviewViews).toBe(0);
    expect(result.suggestionViews).toBe(0);
    expect(result.suggestionClicks).toBe(0);
    expect(result.suggestionClickRatePct).toBe(0);
    expect(result.questCompletionsAfterSuggestionView).toBe(0);
    expect(result.latestEventAt).toBeNull();
    expect(result.byName).toEqual({
      weekly_review_viewed: 0,
      historical_review_viewed: 0,
      suggestion_viewed: 0,
      suggestion_clicked: 0,
      quest_completed: 0,
    });
  });

  it("aggregates allowlisted events and ignores unknown names", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("weekly_review_viewed", "2026-04-20T10:00:00.000Z"),
      event("historical_review_viewed", "2026-04-20T11:00:00.000Z"),
      event("suggestion_viewed", "2026-04-21T09:00:00.000Z"),
      event("suggestion_clicked", "2026-04-21T09:05:00.000Z"),
      event("quest_completed", "2026-04-21T09:30:00.000Z"),
      event("not_an_event_name", "2026-04-22T00:00:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.totalEvents).toBe(5);
    expect(result.byName.weekly_review_viewed).toBe(1);
    expect(result.byName.historical_review_viewed).toBe(1);
    expect(result.byName.suggestion_viewed).toBe(1);
    expect(result.byName.suggestion_clicked).toBe(1);
    expect(result.byName.quest_completed).toBe(1);
    expect(result.reviewViews).toBe(2);
    expect(result.suggestionViews).toBe(1);
    expect(result.suggestionClicks).toBe(1);
    expect(result.suggestionClickRatePct).toBe(100);
    expect(result.latestEventAt).toBe("2026-04-21T09:30:00.000Z");
  });

  it("returns suggestionClickRatePct of 0 when there are zero suggestion views", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("suggestion_clicked", "2026-04-21T09:05:00.000Z"),
      event("quest_completed", "2026-04-21T09:30:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.suggestionViews).toBe(0);
    expect(result.suggestionClicks).toBe(1);
    expect(result.suggestionClickRatePct).toBe(0);
  });

  it("rounds suggestionClickRatePct to the nearest integer", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("suggestion_viewed", "2026-04-21T09:00:00.000Z"),
      event("suggestion_viewed", "2026-04-21T09:01:00.000Z"),
      event("suggestion_viewed", "2026-04-21T09:02:00.000Z"),
      event("suggestion_clicked", "2026-04-21T09:03:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.suggestionViews).toBe(3);
    expect(result.suggestionClicks).toBe(1);
    expect(result.suggestionClickRatePct).toBe(33);
  });

  it("counts quest completions strictly after the earliest suggestion_viewed", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("quest_completed", "2026-04-21T08:00:00.000Z"),
      event("suggestion_viewed", "2026-04-21T09:00:00.000Z"),
      event("quest_completed", "2026-04-21T09:00:00.000Z"),
      event("quest_completed", "2026-04-21T09:30:00.000Z"),
      event("quest_completed", "2026-04-22T08:00:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.byName.quest_completed).toBe(4);
    expect(result.questCompletionsAfterSuggestionView).toBe(2);
  });

  it("returns zero quest completions after view when no suggestion was viewed", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("quest_completed", "2026-04-21T08:00:00.000Z"),
      event("quest_completed", "2026-04-21T09:00:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.questCompletionsAfterSuggestionView).toBe(0);
  });

  it("uses the maximum createdAt for latestEventAt regardless of input ordering", () => {
    const events: SummarizableBehaviorEvent[] = [
      event("weekly_review_viewed", "2026-04-22T00:00:00.000Z"),
      event("quest_completed", "2026-04-25T12:00:00.000Z"),
      event("suggestion_viewed", "2026-04-23T00:00:00.000Z"),
    ];

    const result = summarizeEvents(events);

    expect(result.latestEventAt).toBe("2026-04-25T12:00:00.000Z");
  });

  it("accepts createdAt as ISO string input", () => {
    const events: SummarizableBehaviorEvent[] = [
      { name: "weekly_review_viewed", createdAt: "2026-04-22T00:00:00.000Z" },
      { name: "quest_completed", createdAt: "2026-04-22T01:00:00.000Z" },
    ];

    const result = summarizeEvents(events);

    expect(result.totalEvents).toBe(2);
    expect(result.latestEventAt).toBe("2026-04-22T01:00:00.000Z");
  });
});
