import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeeklyReviewCard } from "@/components/review/weekly-review-card";

describe("WeeklyReviewCard", () => {
  it("renders direct tone badge and metrics", () => {
    render(
      <WeeklyReviewCard
        review={{
          rangeStart: "2026-04-20",
          rangeEnd: "2026-04-26",
          completionsLast7d: 4,
          weeklyTarget: 7,
          progressPct: 57,
          encouragementStyle: "direct",
          summaryHeadline: "3 to goal.",
          summaryMessage: "You have 3 completions left to hit your weekly target.",
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "3 to goal." })).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("57% of weekly target")).toBeInTheDocument();
  });

  it("renders celebration tone", () => {
    render(
      <WeeklyReviewCard
        review={{
          rangeStart: "2026-04-20",
          rangeEnd: "2026-04-26",
          completionsLast7d: 7,
          weeklyTarget: 7,
          progressPct: 100,
          encouragementStyle: "celebration",
          summaryHeadline: "Quest legend energy unlocked!",
          summaryMessage: "You crushed your weekly target - keep that momentum blazing.",
        }}
      />,
    );

    expect(screen.getByText("Celebration")).toBeInTheDocument();
    expect(screen.getByText("Quest legend energy unlocked!")).toBeInTheDocument();
  });
});
