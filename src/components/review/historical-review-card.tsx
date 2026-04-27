"use client";

import type { HistoricalReview } from "@/lib/client-api";
import { useBehaviorEvent } from "@/hooks/useBehaviorEvent";

type HistoricalReviewCardProps = {
  review: HistoricalReview;
};

const STYLE_BADGES: Record<HistoricalReview["encouragementStyle"], string> = {
  gentle: "Gentle",
  direct: "Direct",
  celebration: "Celebration",
};

const TREND_LABELS: Record<HistoricalReview["trend"], string> = {
  rising: "Trending up",
  steady: "Steady",
  declining: "Trending down",
};

function formatRange(rangeStart: string, rangeEnd: string): string {
  return `${rangeStart} \u2192 ${rangeEnd}`;
}

export function HistoricalReviewCard({ review }: HistoricalReviewCardProps) {
  const lastIndex = review.weeks.length - 1;
  useBehaviorEvent("historical_review_viewed", {
    trend: review.trend,
    weeks: review.weeks.length,
    latestCompletions: review.weeks[lastIndex]?.completions ?? 0,
  });

  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      aria-label="Historical review"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Historical Review
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {review.summaryHeadline}
          </h2>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}
        >
          {STYLE_BADGES[review.encouragementStyle]}
        </span>
      </div>

      <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {review.summaryMessage}
      </p>

      <p
        className="mt-2 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-text-secondary)" }}
        data-testid="historical-trend-label"
      >
        {TREND_LABELS[review.trend]}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {review.weeks.map((week, index) => {
          const isThisWeek = index === lastIndex;
          return (
            <li
              key={`${week.rangeStart}-${week.rangeEnd}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: isThisWeek ? "var(--color-border-default)" : "var(--color-border-subtle)",
                background: isThisWeek ? "var(--color-bg-elevated)" : "transparent",
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>
                {formatRange(week.rangeStart, week.rangeEnd)}
                {isThisWeek ? (
                  <span
                    className="ml-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                    style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}
                  >
                    this week
                  </span>
                ) : null}
              </span>
              <span style={{ color: "var(--color-text-primary)" }}>
                <strong>{week.completions}</strong> / {week.weeklyTarget} completions
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>{week.progressPct}% of target</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
