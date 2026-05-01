"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTodayDashboard } from "@/lib/client-api";
import { emptyTodayHabitSurface, type TodayDashboardSnapshot } from "@/types/today-dashboard";

const TODAY_CACHE_PREFIX = "today-dashboard:v2:";
const LAST_KNOWN_CACHE_KEY = "today-dashboard:v2:last-known";

function isSnapshotShape(value: unknown): value is TodayDashboardSnapshot {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<TodayDashboardSnapshot>;
  return (
    "profile" in candidate &&
    "activeQuests" in candidate &&
    "dailies" in candidate &&
    "dailyKey" in candidate &&
    "focusMinutesLast7d" in candidate &&
    Array.isArray(candidate.activeQuests) &&
    Array.isArray(candidate.dailies) &&
    typeof candidate.focusMinutesLast7d === "number"
  );
}

/** Ensure `habitSurface` exists (older cached snapshots omit it). */
function normalizeSnapshot(raw: TodayDashboardSnapshot): TodayDashboardSnapshot {
  const hs = raw.habitSurface;
  if (
    hs &&
    typeof hs === "object" &&
    Array.isArray(hs.habitsDue) &&
    Array.isArray(hs.atRisk) &&
    Array.isArray(hs.captured)
  ) {
    return raw;
  }
  return { ...raw, habitSurface: emptyTodayHabitSurface };
}

function cacheKeyByDate(date: Date = new Date()): string {
  return `${TODAY_CACHE_PREFIX}${date.toISOString().slice(0, 10)}`;
}

function readJsonFromStorage(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readSessionSnapshot(date: Date = new Date()): TodayDashboardSnapshot | null {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }
  const parsed = readJsonFromStorage(window.sessionStorage, cacheKeyByDate(date));
  return isSnapshotShape(parsed) ? normalizeSnapshot(parsed) : null;
}

function writeSessionSnapshot(snapshot: TodayDashboardSnapshot, date: Date = new Date()) {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  try {
    window.sessionStorage.setItem(cacheKeyByDate(date), JSON.stringify(snapshot));
  } catch {
    // Best-effort cache only.
  }
}

function readLastKnownSnapshot(): TodayDashboardSnapshot | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  const parsed = readJsonFromStorage(window.localStorage, LAST_KNOWN_CACHE_KEY);
  return isSnapshotShape(parsed) ? normalizeSnapshot(parsed) : null;
}

function writeLastKnownSnapshot(snapshot: TodayDashboardSnapshot) {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(LAST_KNOWN_CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Best-effort cache only.
  }
}

export function useTodayDashboard() {
  const [data, setData] = useState<TodayDashboardSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applySnapshot = useCallback((next: TodayDashboardSnapshot) => {
    if (mountedRef.current) {
      setData(normalizeSnapshot(next));
      setError(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchTodayDashboard();
      applySnapshot(next);
      writeSessionSnapshot(next);
      writeLastKnownSnapshot(next);
    } catch (e) {
      if (mountedRef.current) {
        const fallback = readLastKnownSnapshot();
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
        setData(fallback);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [applySnapshot]);

  useEffect(() => {
    let cancelled = false;
    const cached = readSessionSnapshot();
    if (cached && !cancelled && mountedRef.current) {
      setData(cached);
      setError(null);
    }
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const next = await fetchTodayDashboard();
        if (!cancelled) {
          applySnapshot(next);
          writeSessionSnapshot(next);
          writeLastKnownSnapshot(next);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
          if (!cached) {
            setData(readLastKnownSnapshot());
          }
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySnapshot]);

  return { data, isLoading, error, refresh };
}
