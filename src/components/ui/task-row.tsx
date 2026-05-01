"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type TaskRowProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  title: string;
  meta?: ReactNode;
  /**
   * Shorthand for `defaultChecked` when the row is uncontrolled.
   * When `checked` is set, that prop drives both the input and styling.
   */
  completed?: boolean;
  /** Class names for the outer row container (`className` is forwarded to the checkbox input). */
  rowClassName?: string;
};

export function TaskRow({
  title,
  meta,
  completed = false,
  disabled,
  id: idProp,
  rowClassName = "",
  checked,
  defaultChecked,
  ...checkboxRest
}: TaskRowProps) {
  const { className: inputClassName, ...inputRest } = checkboxRest;
  const uid = useId();
  const checkboxId = idProp ?? `task-row-${uid}`;
  const isControlled = checked !== undefined;
  const mergedVisual = isControlled ? checked : (defaultChecked ?? completed);

  return (
    <div
      className={["flex items-start gap-3 rounded-lg border p-3", rowClassName].filter(Boolean).join(" ")}
      style={{
        borderColor: "var(--color-border-subtle)",
        background: mergedVisual ? "var(--color-bg-elevated)" : "var(--color-bg-surface)",
      }}
    >
      <input
        {...inputRest}
        id={checkboxId}
        type="checkbox"
        disabled={disabled}
        {...(isControlled
          ? { checked }
          : { defaultChecked: defaultChecked ?? completed })}
        className={[
          "mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed",
          inputClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          accentColor: "var(--color-primary)",
          borderColor: "var(--color-border-default)",
          ...inputRest.style,
        }}
        aria-label={`Complete: ${title}`}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <label
          htmlFor={checkboxId}
          className={[
            "block cursor-pointer text-sm font-medium",
            mergedVisual ? "text-[var(--color-text-tertiary)] line-through" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={!mergedVisual ? { color: "var(--color-text-primary)" } : undefined}
        >
          {title}
        </label>
        {meta ? (
          <div className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
}
