"use client";

import { useEffect, useState } from "react";
import localFont from "next/font/local";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TodayFocusShell } from "@/components/home/today-focus-shell";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { fetchOnboardingState } from "@/lib/client-api";

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
  const router = useRouter();
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
    feedback,
    handleAuthSubmit,
  } = useDashboardActions({
    isAuthenticated: Boolean(session?.user),
    prefetchDashboard: !session?.user,
  });

  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      return;
    }
    let cancelled = false;
    const handle = window.setTimeout(async () => {
      setCheckingOnboarding(true);
      const result = await fetchOnboardingState();
      if (cancelled) {
        return;
      }
      setCheckingOnboarding(false);
      if (result.ok && result.data && !result.data.onboarding.completed) {
        router.replace("/onboarding");
      }
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [router, session?.user]);

  if (status === "loading" || checkingOnboarding) {
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
            borderColor: "var(--color-border-default)",
            color: "var(--color-text-primary)",
            background:
              "linear-gradient(to bottom, var(--color-bg-surface) 0%, var(--color-bg-elevated) 100%)",
          }}
        >
          <h1 className="text-2xl font-semibold">SideQuest</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Turn tasks into XP and levels.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                mode === "login" ? "" : "opacity-85 hover:opacity-100"
              }`}
              style={{
                background: mode === "login" ? "var(--color-primary)" : "var(--color-bg-elevated)",
                color: mode === "login" ? "var(--color-primary-on-accent)" : "var(--color-text-primary)",
                borderColor: mode === "login" ? "var(--color-primary-hover)" : "var(--color-border-default)",
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
                background: mode === "register" ? "var(--color-primary)" : "var(--color-bg-elevated)",
                color: mode === "register" ? "var(--color-primary-on-accent)" : "var(--color-text-primary)",
                borderColor: mode === "register" ? "var(--color-primary-hover)" : "var(--color-border-default)",
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
                  color: "var(--color-text-primary)",
                  borderColor: "var(--color-border-default)",
                  background: "var(--color-bg-surface)",
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
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border-default)",
                background: "var(--color-bg-surface)",
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
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border-default)",
                background: "var(--color-bg-surface)",
              }}
              required
            />
            <button
              type="submit"
              className="h-[48px] w-full rounded-md border font-medium transition hover:brightness-95"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-on-accent)",
                borderColor: "var(--color-primary-hover)",
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

  return <TodayFocusShell />;
}
