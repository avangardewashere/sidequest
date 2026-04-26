"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { todayFocusMockData } from "@/components/home/today-focus-mock-data";
import {
  actionResultToToast,
  changeYouPassword,
  fetchYouProfile,
  updateYouProfile,
  type YouProfile,
} from "@/lib/client-api";

export default function YouPage() {
  const { pushToast } = useToast();
  const [profile, setProfile] = useState<YouProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const canSubmitPassword = useMemo(() => {
    return (
      currentPassword.trim().length >= 6 &&
      newPassword.trim().length >= 8 &&
      confirmPassword.trim().length >= 8
    );
  }, [confirmPassword, currentPassword, newPassword]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(async () => {
      const result = await fetchYouProfile();
      if (cancelled) {
        return;
      }
      setIsLoading(false);
      if (!result.ok || !result.data) {
        pushToast(
          actionResultToToast(result, {
            fallbackErrorTitle: "Profile unavailable",
          }),
        );
        return;
      }
      setProfile(result.data.profile);
      setDisplayName(result.data.profile.displayName);
    });

    return () => {
      cancelled = true;
    };
  }, [pushToast]);

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = displayName.trim();
    if (nextName.length < 2) {
      pushToast({
        tone: "warning",
        title: "Display name too short",
        message: "Use at least 2 characters.",
      });
      return;
    }
    const result = await updateYouProfile(nextName);
    pushToast(
      actionResultToToast(result, {
        successTitle: "Profile updated",
        fallbackErrorTitle: "Update failed",
      }),
    );
    if (result.ok && result.data) {
      setProfile(result.data.profile);
      setDisplayName(result.data.profile.displayName);
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      pushToast({
        tone: "warning",
        title: "Passwords must match",
        message: "Confirm your new password exactly.",
      });
      return;
    }
    const result = await changeYouPassword({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    pushToast(
      actionResultToToast(result, {
        successTitle: "Password updated",
        fallbackErrorTitle: "Password update failed",
      }),
    );
    if (result.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="relative min-h-screen">
      <main className="mx-auto w-full max-w-md px-4 py-6 pb-28">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
          You
        </h1>

        <section className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--color-border-subtle)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Profile summary
          </h2>
          {isLoading || !profile ? (
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Loading profile...
            </p>
          ) : (
            <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--color-text-primary)" }}>
              <p>{profile.displayName}</p>
              <p style={{ color: "var(--color-text-secondary)" }}>{profile.email}</p>
              <p>Level {profile.level} · {profile.totalXp} XP</p>
              <p>Streak {profile.currentStreak}d · Best {profile.longestStreak}d</p>
            </div>
          )}
        </section>

        <section className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--color-border-subtle)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Profile basics
          </h2>
          <form className="mt-3 space-y-3" onSubmit={handleProfileSave}>
            <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Display name
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={60}
              />
            </label>
            <button className="rounded-lg px-3 py-2 text-sm font-medium" style={{ background: "var(--color-accent)", color: "white" }} type="submit">
              Save profile
            </button>
          </form>
        </section>

        <section className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--color-border-subtle)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Password
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Baseline secure flow scaffold. Session-device management and advanced security controls ship later.
          </p>
          <form className="mt-3 space-y-3" onSubmit={handlePasswordChange}>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
              placeholder="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
              placeholder="New password (min 8 chars)"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
              placeholder="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              className="rounded-lg px-3 py-2 text-sm font-medium disabled:opacity-60"
              style={{ background: "var(--color-surface-strong)", color: "var(--color-text-primary)" }}
              disabled={!canSubmitPassword}
              type="submit"
            >
              Change password
            </button>
          </form>
        </section>
      </main>
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} />
    </div>
  );
}
