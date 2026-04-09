"use client";

import Link from "next/link";

type DashboardNavProps = {
  onLogout: () => void;
};

export function DashboardNav({ onLogout }: DashboardNavProps) {
  return (
    <nav className="rounded-xl border border-white/10 bg-zinc-950 p-3 text-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium hover:bg-zinc-700"
          >
            Home
          </Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium hover:bg-zinc-700">
              Quest
            </summary>
            <div className="absolute left-0 top-11 z-10 w-40 rounded-md border border-zinc-700 bg-zinc-900 p-1 shadow-lg">
              <Link
                href="/quests/view"
                className="block rounded px-2 py-2 text-sm hover:bg-zinc-800"
              >
                View Quests
              </Link>
              <Link
                href="/quests/create"
                className="block rounded px-2 py-2 text-sm hover:bg-zinc-800"
              >
                Create Quest
              </Link>
            </div>
          </details>
          <Link
            href="/guild-stats"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium hover:bg-zinc-700"
          >
            Guild Stats
          </Link>
        </div>
        <button
          onClick={onLogout}
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
