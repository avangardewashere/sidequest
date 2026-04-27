"use client";

import type { EventAnalytics } from "@/lib/client-api";

type EventAnalyticsCardProps = {
  analytics: EventAnalytics;
};

const EVENT_NAME_LABELS: Record<keyof EventAnalytics["byName"], string> = {
  weekly_review_viewed: "Weekly review views",
  historical_review_viewed: "Historical review views",
  suggestion_viewed: "Suggestion views",
  suggestion_clicked: "Suggestion clicks",
  quest_completed: "Quest completions",
};

const RANGE_LABELS: Record<EventAnalytics["range"], string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
};

function formatLatestEvent(value: string | null): string {
  if (!value) {
    return "No events recorded yet.";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "No events recorded yet.";
  }
  const year = parsed.getUTCFullYear();
  const month = `${parsed.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${parsed.getUTCDate()}`.padStart(2, "0");
  const hours = `${parsed.getUTCHours()}`.padStart(2, "0");
  const minutes = `${parsed.getUTCMinutes()}`.padStart(2, "0");
  return `Latest event ${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

export function EventAnalyticsCard({ analytics }: EventAnalyticsCardProps) {
  const orderedNames = Object.keys(EVENT_NAME_LABELS) as Array<keyof EventAnalytics["byName"]>;
  const latestEventLine = formatLatestEvent(analytics.latestEventAt);

  return (
    <section
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
      aria-label="Event analytics"
      data-testid="event-analytics-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Event Analytics
          </p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Behavior signal summary
          </h2>
        </div>
        <span
          className="rounded-full border px-2.5 py-1 text-xs font-semibold"
          style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}
          data-testid="event-analytics-range"
        >
          {RANGE_LABELS[analytics.range]}
        </span>
      </div>

      <p
        className="mt-2 text-sm"
        style={{ color: "var(--color-text-secondary)" }}
        data-testid="event-analytics-total"
      >
        {analytics.totalEvents} total events recorded.
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div
          className="rounded-md border p-2"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <dt className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Review views
          </dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
            data-testid="event-analytics-review-views"
          >
            {analytics.reviewViews}
          </dd>
        </div>
        <div
          className="rounded-md border p-2"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <dt className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Suggestion views
          </dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
            data-testid="event-analytics-suggestion-views"
          >
            {analytics.suggestionViews}
          </dd>
        </div>
        <div
          className="rounded-md border p-2"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <dt className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Suggestion CTR
          </dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
            data-testid="event-analytics-ctr"
          >
            {analytics.suggestionClickRatePct}%
          </dd>
        </div>
        <div
          className="rounded-md border p-2"
          style={{ borderColor: "var(--color-border-subtle)" }}
        >
          <dt className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Quests after view
          </dt>
          <dd
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
            data-testid="event-analytics-quests-after-view"
          >
            {analytics.questCompletionsAfterSuggestionView}
          </dd>
        </div>
      </dl>

      <ul className="mt-3 flex flex-col gap-2" data-testid="event-analytics-by-name">
        {orderedNames.map((eventName) => (
          <li
            key={eventName}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border-subtle)" }}
            data-testid={`event-analytics-row-${eventName}`}
          >
            <span style={{ color: "var(--color-text-secondary)" }}>{EVENT_NAME_LABELS[eventName]}</span>
            <span style={{ color: "var(--color-text-primary)" }}>
              <strong>{analytics.byName[eventName]}</strong>
            </span>
          </li>
        ))}
      </ul>

      <p
        className="mt-3 text-xs"
        style={{ color: "var(--color-text-secondary)" }}
        data-testid="event-analytics-latest"
      >
        {latestEventLine}
      </p>
    </section>
  );
}
