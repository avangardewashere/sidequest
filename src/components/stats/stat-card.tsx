import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
  loading?: boolean;
  delta?: number;
  sparkline?: number[];
};

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function StatCard({ label, value, subtitle, loading, delta, sparkline }: StatCardProps) {
  if (loading) {
    return (
      <div
        className="h-24 animate-pulse rounded-xl border"
        style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
      />
    );
  }

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
          {label}
        </p>
        {typeof delta === "number" ? (
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={{
              borderColor: delta >= 0 ? "var(--color-primary-subtle)" : "var(--color-warning-subtle)",
              background: delta >= 0 ? "var(--color-primary-subtle)" : "var(--color-warning-subtle)",
              color: delta >= 0 ? "var(--color-primary)" : "var(--color-warning)",
            }}
          >
            {formatDelta(delta)}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {value}
      </p>
      {subtitle ? (
        <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {subtitle}
        </p>
      ) : null}
      {sparkline && sparkline.length > 1 ? (
        <div className="mt-2 h-[44px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((point, index) => ({ index, value: point }))}>
              <Tooltip />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}
