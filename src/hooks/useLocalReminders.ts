"use client";

import { useEffect, useMemo, useState } from "react";

type LocalReminderSettings = {
  enabled: boolean;
  timeLocal: string | null;
  days: number[];
  lastFiredOn: string | null;
};

function parseTimeLocal(value: string | null): { hour: number; minute: number } | null {
  if (!value) {
    return null;
  }
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return null;
  }
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

function toIsoDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextReminderAt(now: Date, settings: LocalReminderSettings): Date | null {
  const parsedTime = parseTimeLocal(settings.timeLocal);
  if (!parsedTime || settings.days.length === 0) {
    return null;
  }
  const allowedDays = new Set(settings.days);
  for (let dayOffset = 0; dayOffset <= 8; dayOffset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + dayOffset);
    candidate.setHours(parsedTime.hour, parsedTime.minute, 0, 0);
    if (!allowedDays.has(candidate.getDay())) {
      continue;
    }
    if (candidate.getTime() <= now.getTime()) {
      continue;
    }
    return candidate;
  }
  return null;
}

export function useLocalReminders(
  settings: LocalReminderSettings,
  onReminder: (firedAt: Date) => Promise<void> | void,
) {
  const [refreshSeed, setRefreshSeed] = useState(0);
  const normalizedDays = useMemo(
    () => [...new Set(settings.days)].sort((a, b) => a - b),
    [settings.days],
  );

  useEffect(() => {
    if (!settings.enabled) {
      return;
    }
    const now = new Date();
    const scheduleTarget = nextReminderAt(now, {
      enabled: settings.enabled,
      timeLocal: settings.timeLocal,
      days: normalizedDays,
      lastFiredOn: settings.lastFiredOn,
    });
    if (!scheduleTarget) {
      return;
    }
    const delayMs = Math.max(0, scheduleTarget.getTime() - now.getTime());
    const handle = window.setTimeout(async () => {
      const firedAt = new Date();
      const firedKey = toIsoDateKey(firedAt);
      if (settings.lastFiredOn !== firedKey) {
        await onReminder(firedAt);
      }
      setRefreshSeed((prev) => prev + 1);
    }, delayMs);
    return () => {
      window.clearTimeout(handle);
    };
  }, [
    normalizedDays,
    onReminder,
    refreshSeed,
    settings.enabled,
    settings.lastFiredOn,
    settings.timeLocal,
  ]);
}
