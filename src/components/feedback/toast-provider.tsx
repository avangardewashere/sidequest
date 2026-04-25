"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastTone = "success" | "warning" | "danger" | "info";

type ToastInput = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ToastRecord = ToastInput & {
  id: string;
};

type ToastContextValue = {
  pushToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toneStyles(tone: ToastTone) {
  if (tone === "success") {
    return {
      borderColor: "var(--color-success)",
      background: "var(--color-success-subtle)",
      color: "var(--color-success)",
    };
  }
  if (tone === "warning") {
    return {
      borderColor: "var(--color-warning)",
      background: "var(--color-warning-subtle)",
      color: "var(--color-warning)",
    };
  }
  if (tone === "danger") {
    return {
      borderColor: "var(--color-danger)",
      background: "var(--color-danger-subtle)",
      color: "var(--color-danger)",
    };
  }
  return {
    borderColor: "var(--color-primary)",
    background: "var(--color-primary-subtle)",
    color: "var(--color-primary)",
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((input: ToastInput) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tone = input.tone ?? "info";
    setToasts((prev) => [...prev, { ...input, tone, id }]);
    window.setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-[70] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto rounded-lg border px-3 py-2 shadow-lg"
            style={toneStyles(toast.tone ?? "info")}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.message ? <p className="mt-0.5 text-xs">{toast.message}</p> : null}
              </div>
              <button
                type="button"
                className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                onClick={() => dismiss(toast.id)}
                style={{ borderColor: "currentColor", color: "inherit" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
