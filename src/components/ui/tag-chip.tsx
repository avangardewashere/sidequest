import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type TagChipTone = 0 | 1 | 2 | 3;

export type TagChipProps = HTMLAttributes<HTMLSpanElement> & {
  label: string;
  /** When set, renders a dismiss control and calls this handler (stopPropagation on the button). */
  onDismiss?: () => void;
  /** Deterministic tone from label hash when `tone` is omitted. */
  tone?: TagChipTone;
  children?: ReactNode;
};

const TONE_STYLES: Record<TagChipTone, CSSProperties> = {
  0: { background: "var(--color-primary-subtle)", color: "var(--color-primary-strong)" },
  1: { background: "var(--color-success-subtle)", color: "var(--color-success)" },
  2: { background: "var(--color-secondary-subtle)", color: "var(--color-secondary-strong)" },
  3: { background: "var(--color-warning-subtle)", color: "var(--color-warning)" },
};

function toneFromLabel(label: string): TagChipTone {
  let h = 0;
  for (let i = 0; i < label.length; i += 1) {
    h = (h * 31 + label.charCodeAt(i)) >>> 0;
  }
  return (h % 4) as TagChipTone;
}

export function TagChip({
  label,
  onDismiss,
  tone: toneProp,
  className = "",
  style,
  children,
  ...rest
}: TagChipProps) {
  const tone = toneProp ?? toneFromLabel(label);
  const styles = TONE_STYLES[tone];

  return (
    <span
      className={[
        "inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...styles, ...style }}
      {...rest}
    >
      <span className="min-w-0 truncate">{children ?? label}</span>
      {onDismiss ? (
        <button
          type="button"
          className="-me-0.5 shrink-0 rounded px-0.5 text-sm leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-primary)]"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
