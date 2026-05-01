"use client";

import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export type SheetPlacement = "drawer" | "bottom" | "end";

export type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  /** `drawer`: bottom sheet on narrow viewports, end drawer on `md+`. */
  placement?: SheetPlacement;
};

function panelClasses(placement: SheetPlacement): string {
  const base =
    "fixed z-[100] flex max-h-[90dvh] flex-col border shadow-lg outline-none transition-transform";
  const shell =
    "bg-[var(--color-bg-surface)] border-[var(--color-border-default)] text-[var(--color-text-primary)]";

  if (placement === "bottom") {
    return [
      base,
      shell,
      "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl px-4 pb-6 pt-3",
    ].join(" ");
  }
  if (placement === "end") {
    return [
      base,
      shell,
      "inset-y-0 right-0 top-0 h-full w-full max-w-md rounded-none border-l px-4 py-4",
    ].join(" ");
  }
  // drawer: responsive
  return [
    base,
    shell,
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl px-4 pb-6 pt-3 md:inset-y-0 md:bottom-auto md:left-auto md:right-0 md:top-0 md:max-h-none md:h-full md:w-full md:max-w-md md:rounded-none md:rounded-tl-2xl md:border-l md:border-t-0 md:px-4 md:py-4",
  ].join(" ");
}

export function Sheet({ open, onOpenChange, title, children, placement = "drawer" }: SheetProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  const requestClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    lastFocusRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      lastFocusRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  const onKeyDownPanel = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const focusables = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const list = [...focusables].filter((el) => !el.hasAttribute("disabled"));
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!open || typeof document === "undefined") {
    return null;
  }

  const content = (
    <div className="fixed inset-0 z-[99]">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/40"
        onClick={requestClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={panelClasses(placement)}
        onKeyDown={onKeyDownPanel}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          {title ? (
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="rounded-md border px-2 py-1 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            style={{
              borderColor: "var(--color-border-default)",
              color: "var(--color-text-secondary)",
              background: "var(--color-bg-elevated)",
            }}
            onClick={requestClose}
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
