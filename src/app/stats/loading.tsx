export default function StatsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
      <div className="h-12 w-full animate-pulse rounded-xl border" style={{ borderColor: "var(--color-border-subtle)" }} />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`stat-loading-${index}`}
            className="h-24 animate-pulse rounded-xl border"
            style={{ borderColor: "var(--color-border-subtle)" }}
          />
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`chart-loading-${index}`}
            className="h-72 animate-pulse rounded-xl border"
            style={{ borderColor: "var(--color-border-subtle)" }}
          />
        ))}
      </section>
    </main>
  );
}
