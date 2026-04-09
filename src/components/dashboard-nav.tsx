"use client";

import Link from "next/link";

type DashboardNavProps = {
  onLogout: () => void;
};

export function DashboardNav({ onLogout }: DashboardNavProps) {
  return (
    <nav className="rounded-xl border border-white/10 bg-zinc-950 p-3 text-zinc-100">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium hover:bg-zinc-700"
        >
          Home
        </Link>
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
