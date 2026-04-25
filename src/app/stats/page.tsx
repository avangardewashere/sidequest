import Link from "next/link";

export default function StatsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Progress Stats</h1>
      <p className="text-sm text-zinc-400">
        Personal analytics route for charts, trends, streaks, and quest performance.
      </p>
      <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300">
        Coming soon: XP trend chart, completion heatmap, and streak insights.
      </div>
      <Link href="/" className="w-fit rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
        Back to Dashboard
      </Link>
    </main>
  );
}
