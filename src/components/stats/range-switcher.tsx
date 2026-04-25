"use client";

import type { MetricsRange } from "@/types/metrics-summary";

type RangeSwitcherProps = {
  value: MetricsRange;
  onChange: (range: MetricsRange) => void;
  disabled?: boolean;
};

const ranges: MetricsRange[] = ["7d", "30d", "90d"];

export function RangeSwitcher({ value, onChange, disabled }: RangeSwitcherProps) {
  return (
    <div className="inline-flex rounded-full border p-1" style={{ borderColor: "var(--color-border-default)" }}>
      {ranges.map((range) => {
        const active = range === value;
        return (
          <button
            key={range}
            type="button"
            disabled={disabled}
            onClick={() => onChange(range)}
            className="rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-60"
            style={{
              background: active ? "var(--color-primary-subtle)" : "transparent",
              color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
            }}
          >
            {range.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
