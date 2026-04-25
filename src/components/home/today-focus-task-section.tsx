"use client";

import { memo, useMemo } from "react";
import { TodayFocusTaskRow } from "@/components/home/today-focus-task-row";
import type { TaskSectionData } from "@/components/home/today-focus-mock-data";

type TodayFocusTaskSectionProps = {
  section: TaskSectionData;
  onTaskClick?: (taskId: string) => void;
  emptyMessage?: string;
  showCompleteToggle?: boolean;
  completingTaskId?: string | null;
  optimisticDoneIds?: ReadonlySet<string>;
  onCompleteTask?: (taskId: string) => void;
};

function TodayFocusTaskSectionBase({
  section,
  onTaskClick,
  emptyMessage = "Nothing here yet.",
  showCompleteToggle,
  completingTaskId,
  optimisticDoneIds,
  onCompleteTask,
}: TodayFocusTaskSectionProps) {
  const renderedTasks = useMemo(
    () =>
      section.tasks.map((task) => ({
        ...task,
        done: task.done || optimisticDoneIds?.has(task.id),
      })),
    [optimisticDoneIds, section.tasks],
  );

  return (
    <section className="px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
          {section.label}
        </p>
        {section.rightLabel ? (
          <p className="text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>
            {section.rightLabel}
          </p>
        ) : null}
      </div>
      {section.tasks.length === 0 ? (
        <p className="rounded-lg border px-3 py-4 text-sm" style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-secondary)" }}>
          {emptyMessage}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {renderedTasks.map((task) => (
            <TodayFocusTaskRow
              key={task.id}
              task={task}
              onClick={onTaskClick}
              showCompleteToggle={showCompleteToggle}
              completeDisabled={completingTaskId === task.id}
              onComplete={onCompleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export const TodayFocusTaskSection = memo(TodayFocusTaskSectionBase);
