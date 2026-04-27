"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/feedback/toast-provider";
import { actionResultToToast, completeOnboarding, fetchOnboardingState } from "@/lib/client-api";

type FocusArea = "work" | "health" | "learning" | "life";
type EncouragementStyle = "gentle" | "direct" | "celebration";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { pushToast } = useToast();
  const [focusArea, setFocusArea] = useState<FocusArea>("work");
  const [weeklyTarget, setWeeklyTarget] = useState(5);
  const [encouragementStyle, setEncouragementStyle] = useState<EncouragementStyle>("gentle");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (!session?.user) {
      router.replace("/");
      return;
    }
    let cancelled = false;
    queueMicrotask(async () => {
      const result = await fetchOnboardingState();
      if (cancelled) {
        return;
      }
      setIsLoading(false);
      if (!result.ok || !result.data) {
        pushToast(
          actionResultToToast(result, {
            fallbackErrorTitle: "Could not load onboarding",
          }),
        );
        return;
      }
      if (result.data.onboarding.completed) {
        router.replace("/");
        return;
      }
      if (result.data.onboarding.focusArea) {
        setFocusArea(result.data.onboarding.focusArea);
      }
      if (result.data.onboarding.weeklyTarget) {
        setWeeklyTarget(result.data.onboarding.weeklyTarget);
      }
      if (result.data.onboarding.encouragementStyle) {
        setEncouragementStyle(result.data.onboarding.encouragementStyle);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pushToast, router, session?.user, status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clampedTarget = Math.max(1, Math.min(21, Number(weeklyTarget) || 1));
    setIsSaving(true);
    const result = await completeOnboarding({
      focusArea,
      weeklyTarget: clampedTarget,
      encouragementStyle,
    });
    setIsSaving(false);
    pushToast(
      actionResultToToast(result, {
        successTitle: "Onboarding complete",
        successMessage: "Your SideQuest baseline is ready.",
        fallbackErrorTitle: "Could not complete onboarding",
      }),
    );
    if (result.ok) {
      router.replace("/");
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center p-6">
        <p>Preparing onboarding...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--color-border-default)" }}>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Welcome to SideQuest
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Configure your solo baseline so your first week feels intentional.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Focus area
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value as FocusArea)}
            >
              <option value="work">Work</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="life">Life admin</option>
            </select>
          </label>

          <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Weekly target (quests)
            <input
              type="number"
              min={1}
              max={21}
              className="mt-1 w-full rounded-md border px-3 py-2"
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
              value={weeklyTarget}
              onChange={(event) => setWeeklyTarget(Number(event.target.value))}
            />
          </label>

          <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Encouragement style
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-primary)" }}
              value={encouragementStyle}
              onChange={(event) => setEncouragementStyle(event.target.value as EncouragementStyle)}
            >
              <option value="gentle">Gentle</option>
              <option value="direct">Direct</option>
              <option value="celebration">Celebration-heavy</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-on-accent)" }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Complete onboarding"}
          </button>
        </form>
      </div>
    </main>
  );
}
