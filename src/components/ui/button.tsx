import { forwardRef, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: ReactNode;
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-primary-on-accent)",
    borderColor: "var(--color-primary-hover)",
  },
  secondary: {
    background: "var(--color-bg-elevated)",
    color: "var(--color-text-primary)",
    borderColor: "var(--color-border-default)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    borderColor: "transparent",
  },
  destructive: {
    background: "var(--color-danger)",
    color: "var(--color-primary-on-accent)",
    borderColor: "var(--color-danger)",
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1.5 text-sm font-medium min-h-8",
  md: "px-4 py-2 text-sm font-semibold min-h-10",
  lg: "px-6 py-3 text-base font-semibold min-h-12",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", style, disabled, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={[
        "inline-flex cursor-pointer items-center justify-center rounded-lg border transition-opacity",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    />
  );
});
