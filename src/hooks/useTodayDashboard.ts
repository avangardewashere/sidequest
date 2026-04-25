"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTodayDashboard } from "@/lib/client-api";
import type { TodayDashboardSnapshot } from "@/types/today-dashboard";

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
      setData(next);
      setError(null);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const next = await fetchTodayDashboard();
      applySnapshot(next);
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
        setData(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [applySnapshot]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const next = await fetchTodayDashboard();
        if (!cancelled) {
          applySnapshot(next);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load dashboard");
          setData(null);
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
