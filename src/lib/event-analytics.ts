import { BEHAVIOR_EVENT_NAMES, type BehaviorEventName } from "@/lib/behavior-events";

export type EventAnalyticsByName = Record<BehaviorEventName, number>;

export type EventAnalyticsCore = {
  totalEvents: number;
  byName: EventAnalyticsByName;
  reviewViews: number;
  suggestionViews: number;
  suggestionClicks: number;
  suggestionClickRatePct: number;
  questCompletionsAfterSuggestionView: number;
  latestEventAt: string | null;
};

export type SummarizableBehaviorEvent = {
  name: string;
  createdAt: Date | string;
};

function emptyByName(): EventAnalyticsByName {
  const acc = {} as EventAnalyticsByName;
  for (const name of BEHAVIOR_EVENT_NAMES) {
    acc[name] = 0;
  }
  return acc;
}

function toDate(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input);
}

function isAllowlistedName(name: string): name is BehaviorEventName {
  return (BEHAVIOR_EVENT_NAMES as readonly string[]).includes(name);
}

export function summarizeEvents(events: SummarizableBehaviorEvent[]): EventAnalyticsCore {
  const byName = emptyByName();
  let totalEvents = 0;
  let earliestSuggestionViewMs: number | null = null;
  let latestEventMs: number | null = null;

  for (const event of events) {
    if (!isAllowlistedName(event.name)) {
      continue;
    }
    const createdAtMs = toDate(event.createdAt).getTime();
    if (!Number.isFinite(createdAtMs)) {
      continue;
    }
    byName[event.name] += 1;
    totalEvents += 1;
    if (latestEventMs === null || createdAtMs > latestEventMs) {
      latestEventMs = createdAtMs;
    }
    if (
      event.name === "suggestion_viewed" &&
      (earliestSuggestionViewMs === null || createdAtMs < earliestSuggestionViewMs)
    ) {
      earliestSuggestionViewMs = createdAtMs;
    }
  }

  let questCompletionsAfterSuggestionView = 0;
  if (earliestSuggestionViewMs !== null) {
    for (const event of events) {
      if (event.name !== "quest_completed") {
        continue;
      }
      const createdAtMs = toDate(event.createdAt).getTime();
      if (!Number.isFinite(createdAtMs)) {
        continue;
      }
      if (createdAtMs > earliestSuggestionViewMs) {
        questCompletionsAfterSuggestionView += 1;
      }
    }
  }

  const reviewViews = byName.weekly_review_viewed + byName.historical_review_viewed;
  const suggestionViews = byName.suggestion_viewed;
  const suggestionClicks = byName.suggestion_clicked;
  const suggestionClickRatePct =
    suggestionViews === 0 ? 0 : Math.round((suggestionClicks / suggestionViews) * 100);

  return {
    totalEvents,
    byName,
    reviewViews,
    suggestionViews,
    suggestionClicks,
    suggestionClickRatePct,
    questCompletionsAfterSuggestionView,
    latestEventAt: latestEventMs === null ? null : new Date(latestEventMs).toISOString(),
  };
}
