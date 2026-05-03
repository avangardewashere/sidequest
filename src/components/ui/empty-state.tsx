import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, children, className = "" }: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-3 rounded-xl border px-6 py-10 text-center motion-safe:transition-opacity motion-safe:duration-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderColor: "var(--color-border-subtle)",
        background: "var(--color-bg-surface)",
      }}
    >
      {icon ? <div className="text-3xl" aria-hidden>{icon}</div> : null}
      <p className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </p>
      {description ? (
        <p className="max-w-sm text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      ) : null}
      {children ? <div className="mt-1 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
