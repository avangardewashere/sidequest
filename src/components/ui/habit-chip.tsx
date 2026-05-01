import type { CSSProperties } from "react";
import type { QuestCadence } from "@/types/dashboard";
import { formatCadenceShort } from "@/lib/format-cadence-label";

export type HabitChipProps = {
  cadence: QuestCadence;
  streak: number;
  className?: string;
};

const chipStyle: CSSProperties = {
  background: "var(--color-primary-subtle)",
  color: "var(--color-primary-strong)",
};

export function HabitChip({ cadence, streak, className = "" }: HabitChipProps) {
  const cadenceLabel = formatCadenceShort(cadence);
  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={chipStyle}
    >
      <span className="min-w-0 truncate">{cadenceLabel}</span>
      <span aria-hidden>·</span>
      <span className="shrink-0 tabular-nums">{streak} streak</span>
    </span>
  );
}
