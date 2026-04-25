export default function ViewQuestsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 p-6">
      <div className="h-10 w-full animate-pulse rounded-xl border" style={{ borderColor: "var(--color-border-subtle)" }} />
      <div className="h-24 animate-pulse rounded-xl border" style={{ borderColor: "var(--color-border-subtle)" }} />
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`quest-loading-${index}`}
            className="h-28 animate-pulse rounded-xl border"
            style={{ borderColor: "var(--color-border-subtle)" }}
          />
        ))}
      </div>
    </main>
  );
}
