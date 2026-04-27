"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getActiveFocusSession,
  startFocusSession,
  stopFocusSession,
  type ActiveFocusSession,
} from "@/lib/client-api";

type FocusTimerStatus = "idle" | "running" | "stopping";

type FocusTimerState = {
  status: FocusTimerStatus;
  startedAt: Date | null;
  elapsedSec: number;
  questId: string | null;
  sessionId: string | null;
};

function elapsedFrom(startedAt: Date | null): number {
  if (!startedAt) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
}

function toStateFromSession(session: ActiveFocusSession): FocusTimerState {
  const startedAt = new Date(session.startedAt);
  return {
    status: "running",
    startedAt,
    elapsedSec: elapsedFrom(startedAt),
    questId: session.questId,
    sessionId: session._id,
  };
}

const IDLE_STATE: FocusTimerState = {
  status: "idle",
  startedAt: null,
  elapsedSec: 0,
  questId: null,
  sessionId: null,
};

export function useFocusTimer() {
  const [state, setState] = useState<FocusTimerState>(IDLE_STATE);
  const [hydratedWithActive, setHydratedWithActive] = useState(false);

  const hydrate = useCallback(async () => {
    const result = await getActiveFocusSession();
    if (!result.ok || !result.data?.session) {
      setHydratedWithActive(false);
      setState(IDLE_STATE);
      return;
    }
    setHydratedWithActive(true);
    setState(toStateFromSession(result.data.session));
  }, []);

  const start = useCallback(async (questId?: string) => {
    const result = await startFocusSession(questId);
    if (!result.ok || !result.data?.session) {
      throw new Error(result.message ?? "Could not start focus session");
    }
    setState(toStateFromSession(result.data.session));
    setHydratedWithActive(false);
  }, []);

  const stop = useCallback(async () => {
    setState((prev) => ({ ...prev, status: "stopping" }));
    const result = await stopFocusSession();
    if (!result.ok) {
      setState((prev) => ({
        ...prev,
        status: prev.startedAt ? "running" : "idle",
      }));
      throw new Error(result.message ?? "Could not stop focus session");
    }
    setState(IDLE_STATE);
    setHydratedWithActive(false);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void hydrate();
    }, 0);
    return () => {
      window.clearTimeout(handle);
    };
  }, [hydrate]);

  useEffect(() => {
    if (state.status !== "running" || !state.startedAt) {
      return;
    }
    const timer = window.setInterval(() => {
      setState((prev) => {
        if (prev.status !== "running") {
          return prev;
        }
        return {
          ...prev,
          elapsedSec: elapsedFrom(prev.startedAt),
        };
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [state.status, state.startedAt]);

  const hasActiveSession = useMemo(() => state.status === "running" && Boolean(state.startedAt), [state]);

  return {
    state,
    hydrate,
    start,
    stop,
    hasActiveSession,
    hydratedWithActive,
  };
}
