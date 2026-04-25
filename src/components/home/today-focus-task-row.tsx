"use client";

import type { TaskMetaItem, TaskRowData } from "@/components/home/today-focus-mock-data";

type TodayFocusTaskRowProps = {
  task: TaskRowData;
  onClick?: (taskId: string) => void;
  showCompleteToggle?: boolean;
  completeDisabled?: boolean;
  onComplete?: (taskId: string) => void;
};

const iconTextByMeta: Record<TaskMetaItem["icon"], string> = {
  calendar: "Cal",
  subtask: "Sub",
  timer: "Time",
  flame: "Hot",
  note: "Note",
};

const priorityColorByLevel: Record<NonNullable<TaskRowData["priority"]>, { bg: string; text: string; border: string }> = {
  P1: {
    bg: "var(--color-danger-subtle)",
    text: "var(--color-danger)",
    border: "var(--color-danger-subtle)",
  },
  P2: {
    bg: "var(--color-warning-subtle)",
    text: "var(--color-warning)",
    border: "var(--color-warning-subtle)",
  },
  P3: {
    bg: "var(--color-bg-elevated)",
    text: "var(--color-text-secondary)",
    border: "var(--color-border-subtle)",
  },
};

export function TodayFocusTaskRow({
  task,
  onClick,
  showCompleteToggle,
  completeDisabled,
  onComplete,
}: TodayFocusTaskRowProps) {
  const canComplete = Boolean(showCompleteToggle && onComplete && !task.done);

  return (
    <div
      className="flex w-full items-start gap-2 rounded-lg border px-3 py-2"
      style={{
        borderColor: task.done ? "var(--color-border-subtle)" : "var(--color-border-default)",
        background: "var(--color-bg-surface)",
        opacity: task.done ? 0.75 : 1,
      }}
    >
      {canComplete ? (
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--color-primary)]"
          disabled={completeDisabled}
          aria-label={`Complete ${task.title}`}
          onChange={() => onComplete?.(task.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ) : null}
      <button
        type="button"
        onClick={() => onClick?.(task.id)}
        className="min-w-0 flex-1 text-left"
      >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {task.priority ? (
              <span
                className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                style={{
                  borderColor: priorityColorByLevel[task.priority].border,
                  color: priorityColorByLevel[task.priority].text,
                  background: priorityColorByLevel[task.priority].bg,
                }}
              >
                {task.priority}
              </span>
            ) : null}
            <p
              className="truncate text-sm font-medium"
              style={{
                color: "var(--color-text-primary)",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.title}
            </p>
          </div>
          {task.meta?.length ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {task.meta.map((item) => (
                <span
                  key={`${task.id}-${item.icon}-${item.text}`}
                  className="text-[11px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {iconTextByMeta[item.icon]} · {item.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {typeof task.xp === "number" ? (
          <span
            className="rounded-full border px-2 py-1 text-[11px] font-semibold"
            style={{
              borderColor: "var(--color-primary-subtle)",
              background: "var(--color-primary-subtle)",
              color: "var(--color-primary)",
            }}
          >
            +{task.xp} XP
          </span>
        ) : null}
      </div>
      </button>
    </div>
  );
}
