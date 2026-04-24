"use client";

import type { TaskMetaItem, TaskRowData } from "@/components/home/today-focus-mock-data";

type TodayFocusTaskRowProps = {
  task: TaskRowData;
  onClick?: (taskId: string) => void;
};

const iconTextByMeta: Record<TaskMetaItem["icon"], string> = {
  calendar: "Cal",
  subtask: "Sub",
  timer: "Time",
  flame: "Hot",
  note: "Note",
};

export function TodayFocusTaskRow({ task, onClick }: TodayFocusTaskRowProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(task.id)}
      className="w-full rounded-lg border px-3 py-2 text-left"
      style={{
        borderColor: task.done ? "var(--sq-border)" : "var(--sq-border-strong)",
        background: "var(--sq-surface)",
        opacity: task.done ? 0.75 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {task.priority ? (
              <span
                className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ borderColor: "var(--sq-border)", color: "var(--sq-text-muted)" }}
              >
                {task.priority}
              </span>
            ) : null}
            <p
              className="truncate text-sm font-medium"
              style={{
                color: "var(--sq-text)",
                textDecoration: task.done ? "line-through" : "none",
              }}
            >
              {task.title}
            </p>
          </div>
          {task.meta?.length ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {task.meta.map((item) => (
                <span key={`${task.id}-${item.icon}-${item.text}`} className="text-[11px]" style={{ color: "var(--sq-text-muted)" }}>
                  {iconTextByMeta[item.icon]} · {item.text}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        {typeof task.xp === "number" ? (
          <span
            className="rounded-full border px-2 py-1 text-[11px] font-semibold"
            style={{ borderColor: "var(--sq-border)", color: "var(--sq-text-muted)" }}
          >
            +{task.xp} XP
          </span>
        ) : null}
      </div>
    </button>
  );
}
