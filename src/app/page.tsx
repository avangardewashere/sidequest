"use client";

import Link from "next/link";
import localFont from "next/font/local";
import { signOut, useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useDashboardActions } from "@/hooks/useDashboardActions";

const clashDisplay = localFont({
  src: [
    { path: "../assets/clashDisplay/ClashDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Semibold.otf", weight: "600", style: "normal" },
    { path: "../assets/clashDisplay/ClashDisplay-Bold.otf", weight: "700", style: "normal" },
  ],
  display: "swap",
});

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
          className={`${clashDisplay.className} w-full max-w-md rounded-xl border p-6 shadow-[0_12px_28px_rgba(0,0,0,0.18)]`}
          style={{
            borderColor: "var(--sq-border)",
            color: "var(--sq-text)",
            background:
              "linear-gradient(to bottom, var(--sq-base-light) 0%, var(--sq-surface-alt) 55%, #c5d5eb 100%)",
          }}
        >
          <h1 className="text-2xl font-semibold">SideQuest</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--sq-text-muted)" }}>
            Turn tasks into XP and levels.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                mode === "login" ? "" : "opacity-85 hover:opacity-100"
              }`}
              style={{
                background: mode === "login" ? "var(--sq-accent)" : "var(--sq-button-bg)",
                color: mode === "login" ? "var(--sq-base-black)" : "var(--sq-button-text)",
                borderColor: mode === "login" ? "#e2932a" : "var(--sq-border-strong)",
              }}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                mode === "register" ? "" : "opacity-85 hover:opacity-100"
              }`}
              style={{
                background: mode === "register" ? "var(--sq-accent)" : "var(--sq-button-bg)",
                color: mode === "register" ? "var(--sq-base-black)" : "var(--sq-button-text)",
                borderColor: mode === "register" ? "#e2932a" : "var(--sq-border-strong)",
              }}
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
                className="w-full rounded-md border px-3 py-2"
                style={{
                  color: "var(--sq-text)",
                  borderColor: "var(--sq-border)",
                  background: "linear-gradient(to bottom, #ffffff 0%, var(--sq-surface) 100%)",
                }}
                required
              />
            ) : null}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-md border px-3 py-2"
              style={{
                color: "var(--sq-text)",
                borderColor: "var(--sq-border)",
                background: "linear-gradient(to bottom, #ffffff 0%, var(--sq-surface) 100%)",
              }}
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-md border px-3 py-2"
              style={{
                color: "var(--sq-text)",
                borderColor: "var(--sq-border)",
                background: "linear-gradient(to bottom, #ffffff 0%, var(--sq-surface) 100%)",
              }}
              required
            />
            <button
              type="submit"
              className="h-[48px] w-full rounded-md border font-medium transition hover:brightness-95"
              style={{
                background: "var(--sq-accent)",
                color: "var(--sq-base-black)",
                borderColor: "#e2932a",
              }}
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

      <header
        className="rounded-xl border p-4"
        style={{
          borderColor: "var(--sq-border)",
          background: "linear-gradient(to bottom, var(--sq-surface) 0%, var(--sq-surface-alt) 100%)",
          color: "var(--sq-text)",
        }}
      >
        <div>
          <h1 className="text-2xl font-semibold">SideQuest Dashboard</h1>
          <p className="text-sm" style={{ color: "var(--sq-text-muted)" }}>
            {profile?.displayName ?? session.user.name} | Level {profile?.level ?? 1} |{" "}
            {profile?.totalXp ?? 0} XP
          </p>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs" style={{ color: "var(--sq-text-muted)" }}>
            <span>XP to next level</span>
            <span>
              {profile?.xpIntoLevel ?? 0}/{profile?.xpForNextLevel ?? 1}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--sq-base-mid)" }}>
            <div
              className="h-full transition-all"
              style={{ background: "var(--sq-accent)", width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs" style={{ color: "var(--sq-text-muted)" }}>
            Current streak: {profile?.currentStreak ?? 0} days | Best streak:{" "}
            {profile?.longestStreak ?? 0} days
          </p>
        </div>
      </header>

      <section
        className="rounded-xl border p-4"
        style={{
          borderColor: "var(--sq-border)",
          background: "linear-gradient(to bottom, var(--sq-surface) 0%, var(--sq-surface-alt) 100%)",
          color: "var(--sq-text)",
        }}
      >
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Link
            href="/quests/view"
            className="rounded-lg border p-3 transition hover:brightness-95"
            style={{
              borderColor: "var(--sq-border)",
              background: "#ffffffb5",
            }}
          >
            <p className="font-medium">View Quests</p>
            <p className="text-sm" style={{ color: "var(--sq-text-muted)" }}>
              Filter, sort, and complete your quest list.
            </p>
          </Link>
          <Link
            href="/quests/create"
            className="rounded-lg border p-3 transition hover:brightness-95"
            style={{
              borderColor: "var(--sq-border)",
              background: "#ffffffb5",
            }}
          >
            <p className="font-medium">Create Quest</p>
            <p className="text-sm" style={{ color: "var(--sq-text-muted)" }}>
              Add a new quest with category and description.
            </p>
          </Link>
          <Link
            href="/guild-stats"
            className="rounded-lg border p-3 transition hover:brightness-95"
            style={{
              borderColor: "var(--sq-border)",
              background: "#ffffffb5",
            }}
          >
            <p className="font-medium">Guild Stats</p>
            <p className="text-sm" style={{ color: "var(--sq-text-muted)" }}>
              Review progress trends and performance insights.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
