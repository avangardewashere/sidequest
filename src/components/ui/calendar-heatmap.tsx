"use client";

import { Fragment, useMemo } from "react";
import { toUtcDateKey } from "@/lib/cadence";

export type HeatmapCell = { date: string; intensity: number };

const DAY_MS = 86400000;

function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

function startOfUtcSundayWeek(d: Date): Date {
  const m = utcMidnight(d);
  const dow = m.getUTCDay();
  return addUtcDays(m, -dow);
}

function intensityStyles(intensity: number): { background: string; border: string } {
  const levels = [
    { background: "var(--color-bg-elevated)", border: "var(--color-border-subtle)" },
    { background: "var(--color-primary-subtle)", border: "var(--color-border-default)" },
    { background: "rgba(91, 91, 214, 0.35)", border: "var(--color-primary)" },
    { background: "rgba(91, 91, 214, 0.55)", border: "var(--color-primary-hover)" },
    { background: "var(--color-primary)", border: "var(--color-primary-strong)" },
  ];
  const i = Math.min(4, Math.max(0, Math.round(intensity)));
  return levels[i] ?? levels[0];
}

export type CalendarHeatmapProps = {
  cells: HeatmapCell[];
  numWeeks?: number;
  endDate?: Date;
  onCellClick?: (date: string) => void;
  className?: string;
};

export function CalendarHeatmap({
  cells,
  numWeeks = 12,
  endDate = new Date(),
  onCellClick,
  className = "",
}: CalendarHeatmapProps) {
  const intensityByDate = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cells) {
      m.set(c.date, Math.min(4, Math.max(0, c.intensity)));
    }
    return m;
  }, [cells]);

  const { columns, rangeLabel } = useMemo(() => {
    const lastDay = utcMidnight(endDate);
    const firstDay = addUtcDays(lastDay, -(numWeeks * 7 - 1));
    const anchorSunday = startOfUtcSundayWeek(firstDay);
    const cols: { key: string; cells: { dateKey: string; inRange: boolean }[] }[] = [];

    for (let col = 0; col < numWeeks; col += 1) {
      const weekCells: { dateKey: string; inRange: boolean }[] = [];
      for (let row = 0; row < 7; row += 1) {
        const d = addUtcDays(anchorSunday, col * 7 + row);
        const dateKey = toUtcDateKey(d);
        const inRange = d.getTime() >= firstDay.getTime() && d.getTime() <= lastDay.getTime();
        weekCells.push({ dateKey, inRange });
      }
      cols.push({ key: `w-${col}`, cells: weekCells });
    }

    return {
      columns: cols,
      rangeLabel: `From ${toUtcDateKey(firstDay)} to ${toUtcDateKey(lastDay)} UTC`,
    };
  }, [endDate, numWeeks]);

  const rowLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const gridTemplate = `auto repeat(${numWeeks}, minmax(0, 1fr))`;

  return (
    <div className={["overflow-x-auto", className].filter(Boolean).join(" ")}>
      <div
        role="grid"
        aria-label={`Completion calendar. ${rangeLabel}`}
        className="inline-grid gap-0.5"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div />
        {columns.map((_, colIndex) => (
          <div
            key={`h-${colIndex}`}
            className="text-center text-[10px] font-medium uppercase"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            W{colIndex + 1}
          </div>
        ))}
        {rowLabels.map((rl, rowIndex) => (
          <Fragment key={`row-${rowIndex}`}>
            <div
              className="pr-1 text-end text-[10px] font-medium"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {rl}
            </div>
            {columns.map((col) => {
              const cell = col.cells[rowIndex];
              if (!cell.inRange) {
                return (
                  <div
                    key={`${col.key}-r${rowIndex}`}
                    className="aspect-square min-h-[10px] rounded-sm"
                    aria-hidden
                  />
                );
              }
              const intensity = intensityByDate.get(cell.dateKey) ?? 0;
              const styles = intensityStyles(intensity);
              const clickable = Boolean(onCellClick);
              return (
                <button
                  key={`${col.key}-r${rowIndex}`}
                  type="button"
                  role="gridcell"
                  disabled={!clickable}
                  className="aspect-square min-h-[10px] max-h-8 rounded-sm border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-default"
                  style={{
                    background: styles.background,
                    borderColor: styles.border,
                  }}
                  aria-label={`${cell.dateKey}, intensity ${intensity}`}
                  onClick={() => onCellClick?.(cell.dateKey)}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
