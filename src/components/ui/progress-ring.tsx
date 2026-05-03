import type { ReactNode } from "react";

export type ProgressRingProps = {
  /** 0–100 */
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: ReactNode;
  "aria-label"?: string;
  className?: string;
};

export function ProgressRing({
  percent,
  size = 56,
  strokeWidth = 5,
  label,
  "aria-label": ariaLabel,
  className = "",
}: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = (clamped / 100) * c;
  const defaultLabel = `${Math.round(clamped)}% complete`;

  return (
    <div
      className={["inline-flex flex-col items-center gap-1", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={ariaLabel ?? defaultLabel}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border-subtle)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      {label ? (
        <div className="text-center text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </div>
      ) : null}
    </div>
  );
}
