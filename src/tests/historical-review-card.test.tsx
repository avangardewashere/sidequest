import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { HistoricalReviewCard } from "@/components/review/historical-review-card";
import type { HistoricalReview } from "@/lib/client-api";

function buildReview(overrides: Partial<HistoricalReview> = {}): HistoricalReview {
  const base: HistoricalReview = {
    weeks: [
      { rangeStart: "2026-03-30", rangeEnd: "2026-04-05", completions: 1, weeklyTarget: 5, progressPct: 20 },
      { rangeStart: "2026-04-06", rangeEnd: "2026-04-12", completions: 2, weeklyTarget: 5, progressPct: 40 },
      { rangeStart: "2026-04-13", rangeEnd: "2026-04-19", completions: 3, weeklyTarget: 5, progressPct: 60 },
      { rangeStart: "2026-04-20", rangeEnd: "2026-04-26", completions: 5, weeklyTarget: 5, progressPct: 100 },
    ],
    trend: "rising",
    encouragementStyle: "direct",
    summaryHeadline: "Trending up.",
    summaryMessage: "This week beat your prior 3-week average. Keep the cadence.",
  };
  return { ...base, ...overrides };
}

describe("HistoricalReviewCard", () => {
  it("renders 4 weekly bucket rows with completions, target, and progress", () => {
    render(<HistoricalReviewCard review={buildReview()} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);

    expect(screen.getByText("2026-03-30 \u2192 2026-04-05")).toBeInTheDocument();
    expect(screen.getByText("2026-04-20 \u2192 2026-04-26")).toBeInTheDocument();

    expect(screen.getByText("20% of target")).toBeInTheDocument();
    expect(screen.getByText("100% of target")).toBeInTheDocument();

    expect(screen.getByText("this week")).toBeInTheDocument();
  });

  it("renders rising trend label and direct tone badge", () => {
    render(<HistoricalReviewCard review={buildReview()} />);

    expect(screen.getByTestId("historical-trend-label")).toHaveTextContent("Trending up");
    expect(screen.getByText("Direct")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Trending up." })).toBeInTheDocument();
  });

  it("renders declining trend label and gentle tone badge", () => {
    render(
      <HistoricalReviewCard
        review={buildReview({
          trend: "declining",
          encouragementStyle: "gentle",
          summaryHeadline: "A softer week, that's okay.",
          summaryMessage: "This week dipped below your recent pace.",
        })}
      />,
    );

    expect(screen.getByTestId("historical-trend-label")).toHaveTextContent("Trending down");
    expect(screen.getByText("Gentle")).toBeInTheDocument();
  });

  it("renders steady trend label and celebration tone badge", () => {
    render(
      <HistoricalReviewCard
        review={buildReview({
          trend: "steady",
          encouragementStyle: "celebration",
          summaryHeadline: "Reliable hero energy!",
          summaryMessage: "Four weeks of steady completions.",
        })}
      />,
    );

    expect(screen.getByTestId("historical-trend-label")).toHaveTextContent("Steady");
    expect(screen.getByText("Celebration")).toBeInTheDocument();
  });
});
