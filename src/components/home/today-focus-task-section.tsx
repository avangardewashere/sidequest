"use client";

import { TodayFocusTaskRow } from "@/components/home/today-focus-task-row";
import type { TaskSectionData } from "@/components/home/today-focus-mock-data";

type TodayFocusTaskSectionProps = {
  section: TaskSectionData;
  onTaskClick?: (taskId: string) => void;
};

export function TodayFocusTaskSection({ section, onTaskClick }: TodayFocusTaskSectionProps) {
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
      <div className="flex flex-col gap-2">
        {section.tasks.map((task) => (
          <TodayFocusTaskRow key={task.id} task={task} onClick={onTaskClick} />
        ))}
      </div>
    </section>
  );
}
