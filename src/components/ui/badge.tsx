import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "difficulty" | "status" | "cadence" | "tier";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  children?: ReactNode;
};

const variantStyles: Record<BadgeVariant, CSSProperties> = {
  difficulty: {
    background: "var(--color-secondary-subtle)",
    color: "var(--color-secondary-strong)",
  },
  status: {
    background: "var(--color-success-subtle)",
    color: "var(--color-success)",
  },
  cadence: {
    background: "var(--color-primary-subtle)",
    color: "var(--color-primary-strong)",
  },
  tier: {
    background: "var(--color-warning-subtle)",
    color: "var(--color-warning)",
  },
};

export function Badge({ variant = "status", className = "", style, children, ...rest }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex max-w-full items-center rounded-md px-2 py-0.5 font-bold uppercase tracking-wide",
        "text-[length:var(--text-badge-label)] leading-[var(--text-badge-label--line-height)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
