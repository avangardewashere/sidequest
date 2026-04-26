"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type PomodoroPhase = "idle" | "focus" | "break";

type PomodoroState = {
  phase: PomodoroPhase;
  isRunning: boolean;
  focusMinutes: number;
  breakMinutes: number;
  remainingSec: number;
};

type UsePomodoroCycleArgs = {
  onFocusStart: () => Promise<void>;
  onFocusStop: () => Promise<void>;
  onFocusComplete?: () => void;
  onBreakComplete?: () => void;
};

const DEFAULT_FOCUS_MINUTES = 25;
const DEFAULT_BREAK_MINUTES = 5;

function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) {
    return 1;
  }
  return Math.min(90, Math.max(1, Math.floor(minutes)));
}

export function usePomodoroCycle({
  onFocusStart,
  onFocusStop,
  onFocusComplete,
  onBreakComplete,
}: UsePomodoroCycleArgs) {
  const [state, setState] = useState<PomodoroState>({
    phase: "idle",
    isRunning: false,
    focusMinutes: DEFAULT_FOCUS_MINUTES,
    breakMinutes: DEFAULT_BREAK_MINUTES,
    remainingSec: 0,
  });
  const transitioningRef = useRef(false);

  const setFocusMinutes = useCallback((minutes: number) => {
    const next = clampMinutes(minutes);
    setState((prev) => ({
      ...prev,
      focusMinutes: next,
      remainingSec: prev.phase === "idle" ? 0 : prev.remainingSec,
    }));
  }, []);

  const setBreakMinutes = useCallback((minutes: number) => {
    const next = clampMinutes(minutes);
    setState((prev) => ({
      ...prev,
      breakMinutes: next,
      remainingSec: prev.phase === "idle" ? 0 : prev.remainingSec,
    }));
  }, []);

  const start = useCallback(async () => {
    await onFocusStart();
    setState((prev) => ({
      ...prev,
      phase: "focus",
      isRunning: true,
      remainingSec: prev.focusMinutes * 60,
    }));
  }, [onFocusStart]);

  const stop = useCallback(async () => {
    setState((prev) => ({ ...prev, isRunning: false }));
    if (state.phase === "focus") {
      await onFocusStop();
    }
    setState((prev) => ({
      ...prev,
      phase: "idle",
      isRunning: false,
      remainingSec: 0,
    }));
  }, [onFocusStop, state.phase]);

  useEffect(() => {
    if (!state.isRunning || state.phase === "idle") {
      return;
    }
    const timer = window.setInterval(() => {
      setState((prev) => {
        if (!prev.isRunning || prev.phase === "idle") {
          return prev;
        }
        return {
          ...prev,
          remainingSec: Math.max(0, prev.remainingSec - 1),
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.isRunning, state.phase]);

  useEffect(() => {
    if (!state.isRunning || state.remainingSec > 0 || transitioningRef.current) {
      return;
    }
    transitioningRef.current = true;
    void (async () => {
      if (state.phase === "focus") {
        await onFocusStop();
        onFocusComplete?.();
        setState((prev) => ({
          ...prev,
          phase: "break",
          isRunning: true,
          remainingSec: prev.breakMinutes * 60,
        }));
      } else if (state.phase === "break") {
        onBreakComplete?.();
        setState((prev) => ({
          ...prev,
          phase: "idle",
          isRunning: false,
          remainingSec: 0,
        }));
      }
      transitioningRef.current = false;
    })();
  }, [
    onBreakComplete,
    onFocusComplete,
    onFocusStop,
    state.isRunning,
    state.phase,
    state.remainingSec,
  ]);

  const phaseLabel = useMemo(() => {
    if (state.phase === "focus") {
      return "Focus";
    }
    if (state.phase === "break") {
      return "Break";
    }
    return "Idle";
  }, [state.phase]);

  return {
    state,
    phaseLabel,
    setFocusMinutes,
    setBreakMinutes,
    start,
    stop,
  };
}
