"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { TodayFocusTabBar } from "@/components/home/today-focus-tab-bar";
import { todayFocusMockData } from "@/components/home/today-focus-mock-data";
import { useLocalReminders } from "@/hooks/useLocalReminders";
import {
  actionResultToToast,
  changeYouPassword,
  fetchYouProfile,
  updateYouProfile,
  type YouProfile,
} from "@/lib/client-api";

const WEEKDAY_OPTIONS: Array<{ key: number; label: string }> = [
  { key: 1, label: "Mon" },
  { key: 2, label: "Tue" },
  { key: 3, label: "Wed" },
  { key: 4, label: "Thu" },
  { key: 5, label: "Fri" },
  { key: 6, label: "Sat" },
  { key: 0, label: "Sun" },
];

export default function YouPage() {
  const { pushToast } = useToast();
  const [profile, setProfile] = useState<YouProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTimeLocal, setReminderTimeLocal] = useState("19:00");
  const [reminderDays, setReminderDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [reminderLastFiredOn, setReminderLastFiredOn] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
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
    if (typeof Notification === "undefined") {
      return;
    }
    const handle = window.setTimeout(() => {
      setNotificationPermission(Notification.permission);
    }, 0);
    return () => {
      window.clearTimeout(handle);
    };
  }, []);

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
      const reminders = result.data.profile.reminders;
      setRemindersEnabled(reminders.enabled);
      setReminderTimeLocal(reminders.timeLocal ?? "19:00");
      setReminderDays(reminders.days.length > 0 ? reminders.days : [1, 2, 3, 4, 5]);
      setReminderLastFiredOn(reminders.lastFiredOn);
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
    const result = await updateYouProfile({ displayName: nextName });
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

  const handleReminderTrigger = useCallback(
    async (firedAt: Date) => {
      const todayKey = firedAt.toISOString().slice(0, 10);
      const title = "Reminder: check your SideQuest list";
      const message = "Take one small action to keep your streak moving.";
      if (notificationPermission === "granted" && typeof Notification !== "undefined") {
        new Notification(title, { body: message });
      } else {
        pushToast({
          tone: "info",
          title,
          message,
        });
      }
      setReminderLastFiredOn(todayKey);
      const saveResult = await updateYouProfile({ reminderLastFiredOn: todayKey });
      if (!saveResult.ok || !saveResult.data) {
        return;
      }
      setProfile(saveResult.data.profile);
      setReminderLastFiredOn(saveResult.data.profile.reminders.lastFiredOn);
    },
    [notificationPermission, pushToast],
  );

  useLocalReminders(
    {
      enabled: remindersEnabled,
      timeLocal: reminderTimeLocal || null,
      days: reminderDays,
      lastFiredOn: reminderLastFiredOn,
    },
    handleReminderTrigger,
  );

  async function requestNotificationPermission() {
    if (typeof Notification === "undefined") {
      setNotificationPermission("unsupported");
      return;
    }
    const next = await Notification.requestPermission();
    setNotificationPermission(next);
  }

  async function handleReminderSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (remindersEnabled && reminderDays.length === 0) {
      pushToast({
        tone: "warning",
        title: "Pick at least one reminder day",
      });
      return;
    }
    const result = await updateYouProfile({
      remindersEnabled,
      reminderTimeLocal: remindersEnabled ? reminderTimeLocal : null,
      reminderDays: remindersEnabled ? reminderDays : [1, 2, 3, 4, 5],
    });
    pushToast(
      actionResultToToast(result, {
        successTitle: "Reminders saved",
        fallbackErrorTitle: "Could not save reminders",
      }),
    );
    if (result.ok && result.data) {
      setProfile(result.data.profile);
      setRemindersEnabled(result.data.profile.reminders.enabled);
      setReminderTimeLocal(result.data.profile.reminders.timeLocal ?? "19:00");
      setReminderDays(result.data.profile.reminders.days);
      setReminderLastFiredOn(result.data.profile.reminders.lastFiredOn);
    }
  }

  function toggleReminderDay(day: number) {
    setReminderDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((value) => value !== day);
      }
      return [...prev, day].sort((a, b) => a - b);
    });
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

        <section className="mt-4 rounded-2xl border p-4" style={{ borderColor: "var(--color-border-subtle)" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
            Reminders
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Local browser reminders while SideQuest is open. No server-side scheduling in this phase.
          </p>
          <form className="mt-3 space-y-3" onSubmit={handleReminderSave}>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-primary)" }}>
              <input
                type="checkbox"
                checked={remindersEnabled}
                onChange={(event) => setRemindersEnabled(event.target.checked)}
              />
              Enable reminders
            </label>
            <label className="block text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Reminder time
              <input
                type="time"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                value={reminderTimeLocal}
                onChange={(event) => setReminderTimeLocal(event.target.value)}
                disabled={!remindersEnabled}
              />
            </label>
            <div>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Reminder days
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className="rounded-md border px-2.5 py-1 text-xs font-medium"
                    style={{
                      borderColor: "var(--color-border-subtle)",
                      color: reminderDays.includes(option.key)
                        ? "var(--color-primary-on-accent)"
                        : "var(--color-text-primary)",
                      background: reminderDays.includes(option.key)
                        ? "var(--color-primary)"
                        : "var(--color-bg-surface)",
                    }}
                    onClick={() => toggleReminderDay(option.key)}
                    disabled={!remindersEnabled}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            {notificationPermission === "default" ? (
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm font-medium"
                style={{ borderColor: "var(--color-border-subtle)", color: "var(--color-text-primary)" }}
                onClick={() => void requestNotificationPermission()}
              >
                Enable browser notifications
              </button>
            ) : (
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Notification permission: {notificationPermission}
              </p>
            )}
            <button
              className="rounded-lg px-3 py-2 text-sm font-medium"
              style={{ background: "var(--color-accent)", color: "white" }}
              type="submit"
            >
              Save reminders
            </button>
          </form>
        </section>
      </main>
      <TodayFocusTabBar tabs={todayFocusMockData.tabs} />
    </div>
  );
}
