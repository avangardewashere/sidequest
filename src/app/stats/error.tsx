"use client";

import Link from "next/link";

export default function StatsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-3 p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Stats are unavailable
      </h1>
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        We could not load analytics right now. Retry or return to Home.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={reset}
          className="rounded-md border px-3 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-md border px-3 py-2 text-sm font-medium"
          style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
        >
          Go to Home
        </Link>
      </div>
    </main>
  );
}
