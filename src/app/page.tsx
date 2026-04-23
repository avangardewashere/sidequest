"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { signOut, useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import buttonFrame from "@/assets/images/buttonImage.png";

const clashDisplay = localFont({
  src: [
    { path: "../assets/clashDisplay/ClashDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Semibold.otf", weight: "600", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Bold.otf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

const framedButtonStyle = {
  backgroundImage: `url(${buttonFrame.src})`,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

export default function Home() {
  const { data: session, status } = useSession();
  const {
    email,
    setEmail,
    displayName,
    setDisplayName,
    password,
    setPassword,
    mode,
    setMode,
    profile,
    feedback,
    progressPct,
    handleAuthSubmit,
  } = useDashboardActions({ isAuthenticated: Boolean(session?.user) });

  if (status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <p>Loading SideQuest...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <div
          className={`${clashDisplay.className} w-full max-w-md rounded-xl border border-[#D8C6A5] p-6 text-[#6B4A1E] shadow-[0_12px_28px_rgba(0,0,0,0.18)]`}
          style={{
            background: "linear-gradient(to bottom, #F3EADB 0%, #E4D4BE 50%, #D6C2A5 100%)",
          }}
        >
          <h1 className="text-2xl font-semibold">SideQuest</h1>
          <p className="mt-1 text-sm text-zinc-400">Turn tasks into XP and levels.</p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md px-4 py-2 text-sm text-[#6B4A1E] transition ${mode === "login" ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              style={framedButtonStyle}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-md px-4 py-2 text-sm text-[#6B4A1E] transition ${mode === "register" ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              style={framedButtonStyle}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
            {mode === "register" ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                className="w-full rounded-md border border-[#AEB6C2] px-3 py-2 text-[#1f2937]"
                style={{
                  background:
                    "linear-gradient(to bottom, #FFFFFF 0%, #E6EBF2 50%, #AEB6C2 100%)",
                }}
                required
              />
            ) : null}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-md border border-[#AEB6C2] px-3 py-2 text-[#1f2937]"
              style={{
                background:
                  "linear-gradient(to bottom, #FFFFFF 0%, #E6EBF2 50%, #AEB6C2 100%)",
              }}
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-md border border-[#AEB6C2] px-3 py-2 text-[#1f2937]"
              style={{
                background:
                  "linear-gradient(to bottom, #FFFFFF 0%, #E6EBF2 50%, #AEB6C2 100%)",
              }}
              required
            />
            <button
              type="submit"
              className="w-full rounded-md h-[48] font-medium text-[#6B4A1E] transition hover:opacity-95"
              style={framedButtonStyle}
            >
              {mode === "register" ? "Create account" : "Login"}
            </button>
          </form>
          {feedback ? <p className="mt-3 text-sm text-emerald-400">{feedback}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6">
      <DashboardNav onLogout={() => void signOut({ redirect: false })} />

      <header className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
        <div>
          <h1 className="text-2xl font-semibold">SideQuest Dashboard</h1>
          <p className="text-sm text-zinc-400">
            {profile?.displayName ?? session.user.name} | Level {profile?.level ?? 1} |{" "}
            {profile?.totalXp ?? 0} XP
          </p>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-zinc-400">
            <span>XP to next level</span>
            <span>
              {profile?.xpIntoLevel ?? 0}/{profile?.xpForNextLevel ?? 1}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Current streak: {profile?.currentStreak ?? 0} days | Best streak:{" "}
            {profile?.longestStreak ?? 0} days
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Link
            href="/quests/view"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700"
          >
            <p className="font-medium">View Quests</p>
            <p className="text-sm text-zinc-400">Filter, sort, and complete your quest list.</p>
          </Link>
          <Link
            href="/quests/create"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700"
          >
            <p className="font-medium">Create Quest</p>
            <p className="text-sm text-zinc-400">Add a new quest with category and description.</p>
          </Link>
          <Link
            href="/guild-stats"
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 hover:border-zinc-700"
          >
            <p className="font-medium">Guild Stats</p>
            <p className="text-sm text-zinc-400">Review progress trends and performance insights.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
