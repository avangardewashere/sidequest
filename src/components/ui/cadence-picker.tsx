"use client";

import type { QuestCadence, QuestCadenceKind } from "@/types/dashboard";

const KINDS: QuestCadenceKind[] = ["oneoff", "daily", "weekdays", "weekly", "custom"];

const KIND_LABELS: Record<QuestCadenceKind, string> = {
  oneoff: "One-off",
  daily: "Daily",
  weekdays: "Weekdays",
  weekly: "Weekly",
  custom: "Custom",
};

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

function stripCadence(c: QuestCadence): QuestCadence {
  if (c.kind === "oneoff" || c.kind === "daily" || c.kind === "weekdays") {
    return { kind: c.kind };
  }
  if (c.kind === "weekly") {
    return { kind: "weekly", daysOfWeek: c.daysOfWeek?.length ? [...c.daysOfWeek] : undefined };
  }
  return {
    kind: "custom",
    daysOfWeek: c.daysOfWeek?.length ? [...c.daysOfWeek] : undefined,
    everyNDays: c.everyNDays && c.everyNDays >= 1 ? c.everyNDays : 2,
  };
}

export type CadencePickerProps = {
  id: string;
  label?: string;
  value: QuestCadence;
  onChange: (next: QuestCadence) => void;
  helperText?: string;
  errorText?: string;
  className?: string;
};

export function CadencePicker({
  id,
  label = "Cadence",
  value,
  onChange,
  helperText,
  errorText,
  className = "",
}: CadencePickerProps) {
  const v = stripCadence(value);
  const labelId = `${id}-label`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;
  const groupName = `${id}-cadence-kind`;

  const setKind = (kind: QuestCadenceKind) => {
    if (kind === "oneoff") onChange({ kind: "oneoff" });
    else if (kind === "daily") onChange({ kind: "daily" });
    else if (kind === "weekdays") onChange({ kind: "weekdays" });
    else if (kind === "weekly") onChange({ kind: "weekly", daysOfWeek: v.daysOfWeek });
    else onChange({ kind: "custom", daysOfWeek: v.daysOfWeek, everyNDays: v.everyNDays ?? 2 });
  };

  const toggleDay = (d: number) => {
    if (v.kind !== "weekly" && v.kind !== "custom") return;
    const current = new Set(v.daysOfWeek ?? []);
    if (current.has(d)) current.delete(d);
    else current.add(d);
    const daysOfWeek = [...current].sort((a, b) => a - b);
    if (v.kind === "weekly") onChange({ kind: "weekly", daysOfWeek });
    else onChange({ kind: "custom", daysOfWeek, everyNDays: v.everyNDays ?? 2 });
  };

  const setEveryN = (n: number) => {
    if (v.kind !== "custom") return;
    const clamped = Math.min(30, Math.max(1, n));
    onChange({ kind: "custom", daysOfWeek: v.daysOfWeek, everyNDays: clamped });
  };

  return (
    <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
      <div id={labelId} className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {label}
      </div>
      <fieldset
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        aria-invalid={errorText ? true : undefined}
        className="space-y-3 border-0 p-0"
      >
        <legend className="sr-only">{label}</legend>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((kind) => (
            <label
              key={kind}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1.5 text-sm"
              style={{
                borderColor: v.kind === kind ? "var(--color-primary)" : "var(--color-border-default)",
                background: v.kind === kind ? "var(--color-primary-subtle)" : "transparent",
              }}
            >
              <input
                type="radio"
                name={groupName}
                checked={v.kind === kind}
                onChange={() => setKind(kind)}
                className="accent-[var(--color-primary)]"
              />
              {KIND_LABELS[kind]}
            </label>
          ))}
        </div>

        {(v.kind === "weekly" || v.kind === "custom") && (
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
              Days (UTC)
            </span>
            <div className="flex flex-wrap gap-1">
              {WEEKDAY_ORDER.map((d) => {
                const active = v.daysOfWeek?.includes(d) ?? false;
                const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                return (
                  <button
                    key={d}
                    type="button"
                    className="rounded-md border px-2 py-1 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                    style={{
                      borderColor: active ? "var(--color-primary)" : "var(--color-border-default)",
                      background: active ? "var(--color-primary-subtle)" : "var(--color-bg-surface)",
                      color: "var(--color-text-primary)",
                    }}
                    aria-pressed={active}
                    onClick={() => toggleDay(d)}
                  >
                    {labels[d]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {v.kind === "custom" && (
          <label className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "var(--color-text-primary)" }}>
            Every
            <input
              type="number"
              min={1}
              max={30}
              value={v.everyNDays ?? 2}
              onChange={(e) => setEveryN(Number(e.target.value))}
              className="w-16 rounded border px-2 py-1"
              style={{ borderColor: "var(--color-border-default)" }}
            />
            days (since last completion)
          </label>
        )}
      </fieldset>
      {helperText && !errorText ? (
        <p id={helperId} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
