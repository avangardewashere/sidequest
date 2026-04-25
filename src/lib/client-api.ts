import { signIn } from "next-auth/react";
import type { QuestListQuery } from "@/lib/quest-selectors";
import type {
  CompleteQuestResponse,
  CreateQuestPayload,
  Profile,
  Quest,
  RegisterPayload,
  UpdateQuestPayload,
} from "@/types/dashboard";
import type { ProgressionProfile, TodayDashboardSnapshot } from "@/types/today-dashboard";
import type { MetricsRange, MetricsSummary } from "@/types/metrics-summary";

type DashboardData = {
  quests: Quest[];
  profile: Profile | null;
  dailies: Quest[];
};

export type ActionResult<T = null> = {
  ok: boolean;
  data: T | null;
  message?: string;
  errorCode?: "unauthorized" | "validation" | "network" | "server" | "unknown";
};

export type ActionToast = {
  tone: "success" | "warning" | "danger";
  title: string;
  message?: string;
};

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function mapHttpError(status: number, apiMessage?: string) {
  if (status === 401) {
    return {
      errorCode: "unauthorized" as const,
      message: "Session expired. Please sign in again.",
    };
  }
  if (status === 400 || status === 409 || status === 422) {
    return {
      errorCode: "validation" as const,
      message: apiMessage ?? "Please check your input and try again.",
    };
  }
  if (status >= 500) {
    return {
      errorCode: "server" as const,
      message: "Something went wrong on our side. Try again.",
    };
  }
  return {
    errorCode: "unknown" as const,
    message: apiMessage ?? "Something went wrong. Please try again.",
  };
}

async function runAction<T>(
  request: () => Promise<Response>,
  successMapper: (json: unknown) => T | null = () => null,
): Promise<ActionResult<T>> {
  try {
    const response = await request();
    const json = await parseJsonSafe(response);
    const apiMessage =
      json && typeof json === "object" && "error" in json && typeof json.error === "string"
        ? json.error
        : undefined;

    if (!response.ok) {
      const mapped = mapHttpError(response.status, apiMessage);
      return {
        ok: false,
        data: null,
        message: mapped.message,
        errorCode: mapped.errorCode,
      };
    }

    return {
      ok: true,
      data: successMapper(json),
    };
  } catch {
    return {
      ok: false,
      data: null,
      errorCode: "network",
      message: "Network issue. Check your connection and retry.",
    };
  }
}

export function actionResultToToast<T>(
  result: ActionResult<T>,
  copy?: {
    successTitle?: string;
    successMessage?: string;
    fallbackErrorTitle?: string;
  },
): ActionToast {
  if (result.ok) {
    return {
      tone: "success",
      title: copy?.successTitle ?? "Action completed",
      message: copy?.successMessage,
    };
  }

  if (result.errorCode === "validation") {
    return {
      tone: "warning",
      title: copy?.fallbackErrorTitle ?? "Action needs attention",
      message: result.message ?? "Please review your input and retry.",
    };
  }

  return {
    tone: "danger",
    title: copy?.fallbackErrorTitle ?? "Action failed",
    message: result.message ?? "Please try again.",
  };
}

export async function fetchQuestsList(query: QuestListQuery): Promise<Quest[]> {
  await fetch("/api/dailies");
  const params = new URLSearchParams({
    status: query.status,
    category: query.category,
    sort: query.sort,
  });
  if (query.limit != null) {
    params.set("limit", String(query.limit));
  }
  const response = await fetch(`/api/quests?${params.toString()}`);
  if (!response.ok) {
    return [];
  }
  const data = (await parseJsonSafe(response)) as { quests?: Quest[] } | null;
  return data?.quests ?? [];
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [questRes, progressionRes, dailiesRes] = await Promise.all([
    fetch("/api/quests"),
    fetch("/api/progression"),
    fetch("/api/dailies"),
  ]);

  const [questData, progressionData, dailiesData] = await Promise.all([
    questRes.ok ? parseJsonSafe(questRes) : null,
    progressionRes.ok ? parseJsonSafe(progressionRes) : null,
    dailiesRes.ok ? parseJsonSafe(dailiesRes) : null,
  ]);

  return {
    quests: (questData?.quests as Quest[] | undefined) ?? [],
    profile: (progressionData?.profile as Profile | undefined) ?? null,
    dailies: (dailiesData?.dailies as Quest[] | undefined) ?? [],
  };
}

/** Per-request defaults when a leg fails (non-OK or malformed): empty slice / null for that leg only. */
export async function fetchTodayDashboard(): Promise<TodayDashboardSnapshot> {
  const [questRes, progressionRes, dailiesRes] = await Promise.all([
    fetch("/api/quests?status=active&sort=priority_due"),
    fetch("/api/progression"),
    fetch("/api/dailies"),
  ]);

  const [questData, progressionData, dailiesData] = await Promise.all([
    questRes.ok ? parseJsonSafe(questRes) : null,
    progressionRes.ok ? parseJsonSafe(progressionRes) : null,
    dailiesRes.ok ? parseJsonSafe(dailiesRes) : null,
  ]);

  const profile =
    progressionData &&
    typeof progressionData === "object" &&
    "profile" in progressionData &&
    progressionData.profile &&
    typeof progressionData.profile === "object"
      ? (progressionData.profile as ProgressionProfile)
      : null;

  const activeQuests =
    questData && typeof questData === "object" && "quests" in questData && Array.isArray(questData.quests)
      ? (questData.quests as Quest[])
      : [];

  const dailies =
    dailiesData && typeof dailiesData === "object" && "dailies" in dailiesData && Array.isArray(dailiesData.dailies)
      ? (dailiesData.dailies as Quest[])
      : [];

  const dailyKey =
    dailiesData &&
    typeof dailiesData === "object" &&
    "dailyKey" in dailiesData &&
    typeof dailiesData.dailyKey === "string"
      ? dailiesData.dailyKey
      : null;

  return {
    profile,
    activeQuests,
    dailies,
    dailyKey,
  };
}

export async function registerUser(payload: RegisterPayload): Promise<boolean> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export async function loginWithCredentials(payload: {
  email: string;
  password: string;
}): Promise<boolean> {
  const loginResult = await signIn("credentials", {
    email: payload.email,
    password: payload.password,
    redirect: false,
  });

  return Boolean(loginResult?.ok);
}

export async function createQuest(payload: CreateQuestPayload): Promise<ActionResult<Quest>> {
  return runAction<Quest>(
    () =>
      fetch("/api/quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => (json as { quest?: Quest } | null)?.quest ?? null,
  );
}

export async function getQuestById(questId: string): Promise<Quest | null> {
  const response = await fetch(`/api/quests/${questId}`);
  if (!response.ok) {
    return null;
  }
  const data = (await parseJsonSafe(response)) as { quest?: Quest } | null;
  return data?.quest ?? null;
}

export async function updateQuestById(
  questId: string,
  payload: UpdateQuestPayload,
): Promise<ActionResult<Quest>> {
  return runAction<Quest>(
    () =>
      fetch(`/api/quests/${questId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => (json as { quest?: Quest } | null)?.quest ?? null,
  );
}

export async function deleteQuestById(
  questId: string,
  confirmTitle: string,
): Promise<ActionResult> {
  return runAction(
    () =>
      fetch(`/api/quests/${questId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmTitle }),
      }),
    () => null,
  );
}

export async function completeQuestById(questId: string): Promise<ActionResult<CompleteQuestResponse>> {
  return runAction<CompleteQuestResponse>(
    () =>
      fetch(`/api/quests/${questId}/complete`, {
        method: "PATCH",
      }),
    (json) => (json as CompleteQuestResponse | null) ?? {},
  );
}

export async function fetchMetricsSummary(range: MetricsRange): Promise<ActionResult<MetricsSummary>> {
  return runAction<MetricsSummary>(
    () => fetch(`/api/metrics/summary?range=${encodeURIComponent(range)}`),
    (json) => (json as MetricsSummary | null) ?? null,
  );
}
