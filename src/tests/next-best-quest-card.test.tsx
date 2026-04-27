import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextBestQuestCard } from "@/components/home/next-best-quest-card";
import type { NextBestQuestSuggestion } from "@/lib/client-api";

function buildSuggestion(overrides: Partial<NextBestQuestSuggestion> = {}): NextBestQuestSuggestion {
  const base: NextBestQuestSuggestion = {
    questId: "q1",
    title: "Write architecture notes",
    category: "work",
    reason: "focus_area_match",
    encouragementStyle: "direct",
    summaryHeadline: "Focus-area match selected.",
    summaryMessage: "This active quest aligns with your onboarding focus area.",
  };
  return { ...base, ...overrides };
}

describe("NextBestQuestCard", () => {
  it("renders focus match reason with direct badge", () => {
    render(<NextBestQuestCard suggestion={buildSuggestion()} />);

    expect(screen.getByRole("heading", { name: "Focus-area match selected." })).toBeInTheDocument();
    expect(screen.getByText("Direct")).toBeInTheDocument();
    expect(screen.getByText("Write architecture notes")).toBeInTheDocument();
    expect(screen.getByTestId("next-best-reason-label")).toHaveTextContent("Focus match");
  });

  it("renders category rotation reason", () => {
    render(
      <NextBestQuestCard
        suggestion={buildSuggestion({
          reason: "category_rotation",
          encouragementStyle: "gentle",
          summaryHeadline: "A gentle rotation for balance.",
        })}
      />,
    );

    expect(screen.getByText("Gentle")).toBeInTheDocument();
    expect(screen.getByTestId("next-best-reason-label")).toHaveTextContent("Category rotation");
  });

  it("renders fallback priority reason", () => {
    render(
      <NextBestQuestCard
        suggestion={buildSuggestion({
          reason: "fallback_priority",
          encouragementStyle: "celebration",
          summaryHeadline: "Mainline quest ready!",
        })}
      />,
    );

    expect(screen.getByText("Celebration")).toBeInTheDocument();
    expect(screen.getByTestId("next-best-reason-label")).toHaveTextContent("Priority fallback");
  });
});
