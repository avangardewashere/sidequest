import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type CardVariant = "surface" | "elevated";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  /** When true, draws a left accent using the primary token. */
  accent?: boolean;
  children?: ReactNode;
};

const variantStyles: Record<CardVariant, CSSProperties> = {
  surface: {
    background: "var(--color-bg-surface)",
    borderColor: "var(--color-border-default)",
  },
  elevated: {
    background: "var(--color-bg-elevated)",
    borderColor: "var(--color-border-subtle)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
};

export function Card({
  variant = "surface",
  accent = false,
  className = "",
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        accent ? "border-l-4 border-l-[var(--color-primary)] pl-3" : "",
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
    </div>
  );
}
