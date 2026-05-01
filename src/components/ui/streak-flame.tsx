import type { HTMLAttributes } from "react";

const MILESTONES = new Set([7, 14, 30, 100]);

export type StreakFlameProps = HTMLAttributes<HTMLDivElement> & {
  streak: number;
};

export function StreakFlame({ streak, className = "", style, ...rest }: StreakFlameProps) {
  const milestone = MILESTONES.has(streak);

  return (
    <div
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-semibold tabular-nums",
        milestone ? "motion-safe:animate-pulse" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: "var(--color-secondary-strong)",
        background: "var(--color-secondary-subtle)",
        color: "var(--color-secondary-strong)",
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden>🔥</span>
      <span>{streak}</span>
      <span className="sr-only">day streak</span>
    </div>
  );
}
