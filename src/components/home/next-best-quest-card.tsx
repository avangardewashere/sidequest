"use client";

import type { NextBestQuestSuggestion } from "@/lib/client-api";
import { useBehaviorEvent } from "@/hooks/useBehaviorEvent";

type NextBestQuestCardProps = {
  suggestion: NextBestQuestSuggestion;
};

const STYLE_BADGES: Record<NextBestQuestSuggestion["encouragementStyle"], string> = {
  gentle: "Gentle",
  direct: "Direct",
  celebration: "Celebration",
};

const REASON_LABELS: Record<NextBestQuestSuggestion["reason"], string> = {
  focus_area_match: "Focus match",
  category_rotation: "Category rotation",
  fallback_priority: "Priority fallback",
};

export function NextBestQuestCard({ suggestion }: NextBestQuestCardProps) {
  useBehaviorEvent("suggestion_viewed", {
    questId: suggestion.questId,
    category: suggestion.category,
    reason: suggestion.reason,
  });

  return (
    <section className="px-4 pt-3" aria-label="Next best quest">
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
              Next Best Quest
            </p>
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {suggestion.summaryHeadline}
            </h2>
          </div>
          <span
            className="rounded-full border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}
          >
            {STYLE_BADGES[suggestion.encouragementStyle]}
          </span>
        </div>

        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {suggestion.summaryMessage}
        </p>

        <div className="mt-3 rounded-lg border px-3 py-2" style={{ borderColor: "var(--color-border-subtle)" }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Suggested quest
          </p>
          <p className="mt-1 text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {suggestion.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <span className="capitalize">{suggestion.category}</span>
            <span aria-hidden="true">-</span>
            <span data-testid="next-best-reason-label">{REASON_LABELS[suggestion.reason]}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
