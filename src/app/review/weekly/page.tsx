"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import { useToast } from "@/components/feedback/toast-provider";
import { actionResultToToast, fetchWeeklyReview, saveWeeklyReflection, type WeeklyReview } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WeeklyReviewPage() {
  const { status } = useSession();
  const { pushToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<WeeklyReview | null>(null);
  const [wentWell, setWentWell] = useState("");
  const [didntGoWell, setDidntGoWell] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [weekLabel, setWeekLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWeeklyReview();
      if (!res.ok || !res.data) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Could not load review" }));
        return;
      }
      setStats(res.data.weeklyReview);
      setWeekLabel(res.data.reflectionWeekStartUtc);
      const cur = res.data.currentWeekReflection;
      if (cur) {
        setWentWell(cur.wentWell);
        setDidntGoWell(cur.didntGoWell);
        setNextWeekFocus(cur.nextWeekFocus);
      } else {
        setWentWell("");
        setDidntGoWell("");
        setNextWeekFocus("");
      }
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (status === "authenticated") {
      void load();
    }
  }, [status, load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await saveWeeklyReflection({
        wentWell,
        didntGoWell,
        nextWeekFocus,
      });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Save failed" }));
        return;
      }
      pushToast({ tone: "success", title: "Reflection saved", message: "" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") {
    return (
      <AuthenticatedAppShell>
        <main className="mx-auto w-full max-w-md px-4 py-6">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Loading…
          </p>
        </main>
      </AuthenticatedAppShell>
    );
  }

  if (status === "unauthenticated") {
    return (
      <AuthenticatedAppShell>
        <main className="mx-auto w-full max-w-md px-4 py-6">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Sign in to use weekly review.
          </p>
          <Link href="/" className="mt-2 text-sm underline">
            Home
          </Link>
        </main>
      </AuthenticatedAppShell>
    );
  }

  return (
    <AuthenticatedAppShell>
      <div className="relative min-h-screen">
        <main className="mx-auto w-full max-w-md px-4 py-6 pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <Link href="/" className="font-medium underline" style={{ color: "var(--color-text-secondary)" }}>
              Home
            </Link>
            <span style={{ color: "var(--color-text-tertiary)" }}>/</span>
            <span style={{ color: "var(--color-text-secondary)" }}>Weekly review</span>
          </div>

          {loading || !stats ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Loading your week…
            </p>
          ) : (
            <Card variant="surface" className="mb-6 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
                Last 7 days (UTC)
              </p>
              <h1 className="mt-1 text-lg font-semibold">{stats.summaryHeadline}</h1>
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {stats.summaryMessage}
              </p>
              <p className="mt-3 text-sm">
                <strong>{stats.completionsLast7d}</strong> / {stats.weeklyTarget} completions · {stats.progressPct}%
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Range {stats.rangeStart} → {stats.rangeEnd}
              </p>
            </Card>
          )}

          <section className="rounded-2xl border p-4" style={{ borderColor: "var(--color-border-subtle)" }}>
            <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
              Reflection (UTC week starting {weekLabel || "—"})
            </h2>
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Saved per ISO week (Monday UTC). You can edit anytime this week.
            </p>
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
                What went well?
                <textarea
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                  maxLength={4000}
                />
              </label>
              <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
                What didn’t go well?
                <textarea
                  value={didntGoWell}
                  onChange={(e) => setDidntGoWell(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                  maxLength={4000}
                />
              </label>
              <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Focus for next week
                <textarea
                  value={nextWeekFocus}
                  onChange={(e) => setNextWeekFocus(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                  maxLength={4000}
                />
              </label>
              <Button type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? "Saving…" : "Save reflection"}
              </Button>
            </form>
          </section>

          <p className="mt-6 text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            <Link href="/stats" className="underline">
              Stats
            </Link>
          </p>
        </main>
      </div>
    </AuthenticatedAppShell>
  );
}
