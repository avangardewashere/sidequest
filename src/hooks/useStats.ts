"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMetricsSummary } from "@/lib/client-api";
import type { MetricsRange, MetricsSummary } from "@/types/metrics-summary";

type UseStatsResult = {
  data: MetricsSummary | null;
  isLoading: boolean;
  error: string | null;
  range: MetricsRange;
  setRange: (range: MetricsRange) => void;
  refresh: () => Promise<void>;
};

export function useStats(defaultRange: MetricsRange = "7d"): UseStatsResult {
  const [range, setRange] = useState<MetricsRange>(defaultRange);
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let active = true;

    void Promise.resolve()
      .then(async () => {
        if (!active) {
          return;
        }
        setIsLoading(true);
        setError(null);
        const result = await fetchMetricsSummary(range);
        if (!active) {
          return;
        }
        if (!result.ok || !result.data) {
          setError(result.message ?? "Failed to load stats summary.");
          setIsLoading(false);
          return;
        }
        setData(result.data);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [range, refreshKey]);

  return {
    data,
    isLoading,
    error,
    range,
    setRange,
    refresh,
  };
}
