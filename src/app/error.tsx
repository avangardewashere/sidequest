"use client";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Something went wrong
      </h1>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        We hit an unexpected issue while loading this page. Try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="w-fit rounded-md border px-3 py-2 text-sm font-medium"
        style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
      >
        Retry
      </button>
      {process.env.NODE_ENV === "development" ? (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {error.message}
        </p>
      ) : null}
    </main>
  );
}
