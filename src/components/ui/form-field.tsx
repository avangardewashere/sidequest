import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

export type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  className?: string;
};

function mergeControlProps(
  child: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>,
  describedBy: string | undefined,
  hasError: boolean,
  controlId: string,
): ReactElement {
  return cloneElement(child, {
    id: child.props.id ?? controlId,
    "aria-invalid": hasError ? true : child.props["aria-invalid"],
    "aria-describedby": [describedBy, child.props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
  });
}

export function FormField({
  id,
  label,
  children,
  helperText,
  errorText,
  required,
  className = "",
}: FormFieldProps) {
  const hasError = Boolean(errorText);
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const control =
    isValidElement(children) && typeof children.type === "string"
      ? mergeControlProps(children as ReactElement<{ id?: string }>, describedBy, hasError, id)
      : children;

  return (
    <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
      <label
        htmlFor={id}
        className="block text-sm font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}
        {required ? (
          <span className="ms-0.5" style={{ color: "var(--color-danger)" }} aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <div>{control}</div>
      {helperText && !hasError ? (
        <p id={helperId} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {helperText}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
