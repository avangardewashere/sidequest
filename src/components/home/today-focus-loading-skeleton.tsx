"use client";

export function TodayFocusHeaderXpSkeleton() {
  const pulse = "animate-pulse rounded-md";
  return (
    <>
      <header className="flex items-end justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className={`h-9 w-9 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
          <div>
            <div className={`mb-2 h-3 w-40 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
            <div className={`h-8 w-28 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
          </div>
        </div>
        <div className={`h-9 w-9 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
      </header>
      <section className="px-4">
        <div
          className="rounded-xl border p-3"
          style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
        >
          <div className="mb-2 flex justify-between">
            <div className={`h-3 w-32 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
            <div className={`h-3 w-20 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--color-primary-subtle)" }}>
            <div className={`h-full w-1/2 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
            >
              <div className={`mb-2 h-2 w-16 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
              <div className={`h-6 w-10 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function TodayFocusTaskRowsSkeleton() {
  const pulse = "animate-pulse rounded-md";
  return (
    <section className="px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <div className={`h-3 w-24 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
        <div className={`h-3 w-16 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
      </div>
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg border px-3 py-3"
            style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
          >
            <div className={`h-3 w-40 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
            <div className={`mt-2 h-2 w-28 ${pulse}`} style={{ background: "var(--color-border-subtle)" }} />
          </div>
        ))}
      </div>
    </section>
  );
}
