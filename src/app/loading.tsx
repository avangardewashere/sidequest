export default function AppLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
      <div
        className="w-full max-w-md animate-pulse rounded-xl border p-6"
        style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-surface)" }}
      >
        <div className="h-6 w-32 rounded" style={{ background: "var(--color-bg-elevated)" }} />
        <div className="mt-3 h-4 w-56 rounded" style={{ background: "var(--color-bg-elevated)" }} />
        <div className="mt-6 space-y-2">
          <div className="h-10 rounded" style={{ background: "var(--color-bg-elevated)" }} />
          <div className="h-10 rounded" style={{ background: "var(--color-bg-elevated)" }} />
          <div className="h-10 rounded" style={{ background: "var(--color-bg-elevated)" }} />
        </div>
      </div>
    </main>
  );
}
