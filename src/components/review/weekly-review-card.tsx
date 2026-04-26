"use client";

import type { WeeklyReview } from "@/lib/client-api";
import { useBehaviorEvent } from "@/hooks/useBehaviorEvent";

type WeeklyReviewCardProps = {
  review: WeeklyReview;
};

const STYLE_BADGES: Record<WeeklyReview["encouragementStyle"], string> = {
  gentle: "Gentle",
  direct: "Direct",
  celebration: "Celebration",
};

export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
  useBehaviorEvent("weekly_review_viewed", {
    rangeStart: review.rangeStart,
    rangeEnd: review.rangeEnd,
    completionsLast7d: review.completionsLast7d,
    weeklyTarget: review.weeklyTarget,
    progressPct: review.progressPct,
  });

  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      aria-label="Weekly review"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Weekly Review
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

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span style={{ color: "var(--color-text-primary)" }}>
          <strong>{review.completionsLast7d}</strong> / {review.weeklyTarget} completions
        </span>
        <span style={{ color: "var(--color-text-secondary)" }}>{review.progressPct}% of weekly target</span>
      </div>
    </section>
  );
}
