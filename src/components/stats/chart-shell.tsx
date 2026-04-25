import type { ReactNode } from "react";

type TooltipPayloadItem = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

type ChartShellProps = {
  title: string;
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
  footer?: ReactNode;
  children?: ReactNode;
};

export function ChartShell({ title, loading, emptyMessage, isEmpty, footer, children }: ChartShellProps) {
  return (
    <section className="rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}>
      <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      <div className="mt-3">
        {loading ? (
          <div
            className="h-52 animate-pulse rounded-lg border"
            style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
          />
        ) : isEmpty ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {emptyMessage ?? "No data yet for this range."}
          </p>
        ) : (
          children
        )}
      </div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </section>
  );
}

export function ThemedChartTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: unknown[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const rows = payload as unknown as TooltipPayloadItem[];
  const meta = rows[0]?.payload ?? {};
  const levelUpTo =
    typeof meta.levelUpTo === "number" ? `Level up -> Lv. ${meta.levelUpTo}` : null;

  return (
    <div
      className="rounded-lg border px-3 py-2 shadow-md"
      style={{
        background: "var(--color-bg-surface)",
        borderColor: "var(--color-secondary)",
        color: "var(--color-text-primary)",
      }}
    >
      <p
        className="text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-secondary-strong)" }}
      >
        {String(label)}
      </p>
      <div className="mt-1 space-y-1">
        {rows.map((entry, index) => (
          <p
            key={`${entry.name ?? "series"}-${index}`}
            className="text-xs"
            style={{ color: "var(--color-text-primary)" }}
          >
            <span style={{ color: entry.color ?? "var(--color-text-secondary)" }}>
              {entry.name ?? "Value"}:
            </span>{" "}
            <span style={{ fontFamily: "var(--font-mono)" }}>{String(entry.value ?? 0)}</span>
          </p>
        ))}
        {levelUpTo ? (
          <p className="text-[11px]" style={{ color: "var(--color-secondary-strong)" }}>
            {levelUpTo}
          </p>
        ) : null}
      </div>
    </div>
  );
}
