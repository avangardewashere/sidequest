import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventAnalyticsCard } from "@/components/stats/event-analytics-card";
import type { EventAnalytics } from "@/lib/client-api";

function buildAnalytics(overrides: Partial<EventAnalytics> = {}): EventAnalytics {
  const base: EventAnalytics = {
    range: "7d",
    rangeDays: 7,
    totalEvents: 7,
    byName: {
      weekly_review_viewed: 1,
      historical_review_viewed: 1,
      suggestion_viewed: 2,
      suggestion_clicked: 1,
      quest_completed: 2,
    },
    reviewViews: 2,
    suggestionViews: 2,
    suggestionClicks: 1,
    suggestionClickRatePct: 50,
    questCompletionsAfterSuggestionView: 2,
    latestEventAt: "2026-04-22T08:30:00.000Z",
  };
  return { ...base, ...overrides };
}

describe("EventAnalyticsCard", () => {
  it("renders populated analytics with derived metrics and latest event line", () => {
    render(<EventAnalyticsCard analytics={buildAnalytics()} />);

    expect(screen.getByTestId("event-analytics-card")).toBeInTheDocument();
    expect(screen.getByTestId("event-analytics-range")).toHaveTextContent("Last 7 days");
    expect(screen.getByTestId("event-analytics-total")).toHaveTextContent("7 total events recorded.");
    expect(screen.getByTestId("event-analytics-review-views")).toHaveTextContent("2");
    expect(screen.getByTestId("event-analytics-suggestion-views")).toHaveTextContent("2");
    expect(screen.getByTestId("event-analytics-ctr")).toHaveTextContent("50%");
    expect(screen.getByTestId("event-analytics-quests-after-view")).toHaveTextContent("2");
    expect(screen.getByTestId("event-analytics-row-suggestion_viewed")).toHaveTextContent("Suggestion views");
    expect(screen.getByTestId("event-analytics-row-quest_completed")).toHaveTextContent("Quest completions");
    expect(screen.getByTestId("event-analytics-latest")).toHaveTextContent(
      "Latest event 2026-04-22 08:30 UTC",
    );
  });

  it("renders empty analytics with zero counts and no-events footer", () => {
    render(
      <EventAnalyticsCard
        analytics={buildAnalytics({
          range: "30d",
          rangeDays: 30,
          totalEvents: 0,
          byName: {
            weekly_review_viewed: 0,
            historical_review_viewed: 0,
            suggestion_viewed: 0,
            suggestion_clicked: 0,
            quest_completed: 0,
          },
          reviewViews: 0,
          suggestionViews: 0,
          suggestionClicks: 0,
          suggestionClickRatePct: 0,
          questCompletionsAfterSuggestionView: 0,
          latestEventAt: null,
        })}
      />,
    );

    expect(screen.getByTestId("event-analytics-range")).toHaveTextContent("Last 30 days");
    expect(screen.getByTestId("event-analytics-total")).toHaveTextContent("0 total events recorded.");
    expect(screen.getByTestId("event-analytics-ctr")).toHaveTextContent("0%");
    expect(screen.getByTestId("event-analytics-latest")).toHaveTextContent("No events recorded yet.");
  });
});
