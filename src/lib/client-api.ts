import { signIn } from "next-auth/react";
import {
  BEHAVIOR_EVENT_NAMES,
  isBehaviorEventName,
  sanitizeBehaviorEventProperties,
  type BehaviorEventName,
} from "@/lib/behavior-events";
import type { QuestListQuery } from "@/lib/quest-selectors";
import type {
  CompleteQuestResponse,
  CreateChildQuestPayload,
  CreateQuestPayload,
  Profile,
  QuestCadence,
  Quest,
  QuestLinkKind,
  QuestNote,
  RegisterPayload,
  UpdateQuestPayload,
} from "@/types/dashboard";
import {
  emptyTodayHabitSurface,
  type ProgressionProfile,
  type TodayDashboardSnapshot,
  type TodayHabitSurfacePayload,
} from "@/types/today-dashboard";
import type { MetricsRange, MetricsSummary } from "@/types/metrics-summary";

type DashboardData = {
  quests: Quest[];
  profile: Profile | null;
  dailies: Quest[];
};

export type YouProfile = {
  email: string;
  displayName: string;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  reminders: ReminderSettings;
};

export type ReminderSettings = {
  enabled: boolean;
  timeLocal: string | null;
  days: number[];
  lastFiredOn: string | null;
};

export type OnboardingState = {
  completed: boolean;
  completedAt: string | null;
  focusArea: "work" | "health" | "learning" | "life" | null;
  weeklyTarget: number | null;
  encouragementStyle: "gentle" | "direct" | "celebration" | null;
};

export type YouPreferencesPayload = {
  focusArea: "work" | "health" | "learning" | "life";
  weeklyTarget: number;
  encouragementStyle: "gentle" | "direct" | "celebration";
};

export type WeeklyReview = {
  rangeStart: string;
  rangeEnd: string;
  completionsLast7d: number;
  weeklyTarget: number;
  progressPct: number;
  encouragementStyle: "gentle" | "direct" | "celebration";
  summaryHeadline: string;
  summaryMessage: string;
};

export type HistoricalReviewWeek = {
  rangeStart: string;
  rangeEnd: string;
  completions: number;
  weeklyTarget: number;
  progressPct: number;
};

export type HistoricalReview = {
  weeks: HistoricalReviewWeek[];
  trend: "rising" | "steady" | "declining";
  encouragementStyle: "gentle" | "direct" | "celebration";
  summaryHeadline: string;
  summaryMessage: string;
};

export type NextBestQuestSuggestion = {
  questId: string;
  title: string;
  category: Quest["category"];
  reason: "focus_area_match" | "category_rotation" | "fallback_priority";
  encouragementStyle: "gentle" | "direct" | "celebration";
  summaryHeadline: string;
  summaryMessage: string;
};

export { BEHAVIOR_EVENT_NAMES };
export type { BehaviorEventName };

export type EventAnalyticsByName = Record<BehaviorEventName, number>;

export type EventAnalytics = {
  range: MetricsRange;
  rangeDays: number;
  totalEvents: number;
  byName: EventAnalyticsByName;
  reviewViews: number;
  suggestionViews: number;
  suggestionClicks: number;
  suggestionClickRatePct: number;
  questCompletionsAfterSuggestionView: number;
  latestEventAt: string | null;
};

export type ActiveFocusSession = {
  _id: string;
  startedAt: string;
  questId: string | null;
};

export type ClosedFocusSession = ActiveFocusSession & {
  endedAt: string;
  durationSec: number;
};

export type QuestCompletionHistoryPoint = {
  date: string;
  xp: number;
  completedAt: string;
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
  const [questRes, progressionRes, dailiesRes, metricsRes, habitSurfaceRes] = await Promise.all([
    fetch("/api/quests?status=active&sort=priority_due"),
    fetch("/api/progression"),
    fetch("/api/dailies"),
    fetch("/api/metrics/summary?range=7d"),
    fetch("/api/today/habit-surface"),
  ]);

  const [questData, progressionData, dailiesData, metricsData, habitSurfaceData] = await Promise.all([
    questRes.ok ? parseJsonSafe(questRes) : null,
    progressionRes.ok ? parseJsonSafe(progressionRes) : null,
    dailiesRes.ok ? parseJsonSafe(dailiesRes) : null,
    metricsRes.ok ? parseJsonSafe(metricsRes) : null,
    habitSurfaceRes.ok ? parseJsonSafe(habitSurfaceRes) : null,
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

  const focusMinutesLast7d =
    metricsData &&
    typeof metricsData === "object" &&
    "kpis" in metricsData &&
    metricsData.kpis &&
    typeof metricsData.kpis === "object" &&
    "focusMinutesLast7d" in metricsData.kpis &&
    typeof metricsData.kpis.focusMinutesLast7d === "number"
      ? metricsData.kpis.focusMinutesLast7d
      : 0;

  let habitSurface: TodayHabitSurfacePayload = emptyTodayHabitSurface;
  if (
    habitSurfaceData &&
    typeof habitSurfaceData === "object" &&
    "habitsDue" in habitSurfaceData &&
    "atRisk" in habitSurfaceData &&
    "captured" in habitSurfaceData &&
    Array.isArray((habitSurfaceData as { habitsDue: unknown }).habitsDue) &&
    Array.isArray((habitSurfaceData as { atRisk: unknown }).atRisk) &&
    Array.isArray((habitSurfaceData as { captured: unknown }).captured)
  ) {
    habitSurface = habitSurfaceData as TodayHabitSurfacePayload;
  }

  return {
    profile,
    activeQuests,
    dailies,
    dailyKey,
    focusMinutesLast7d,
    habitSurface,
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

export async function fetchQuestChildren(
  questId: string,
): Promise<ActionResult<{ children: Quest[] }>> {
  return runAction<{ children: Quest[] }>(
    () => fetch(`/api/quests/${questId}/children`),
    (json) => {
      const children = (json as { children?: Quest[] } | null)?.children;
      if (!Array.isArray(children)) {
        return null;
      }
      return { children };
    },
  );
}

export async function createChildQuest(
  questId: string,
  payload: CreateChildQuestPayload,
): Promise<ActionResult<Quest>> {
  return runAction<Quest>(
    () =>
      fetch(`/api/quests/${questId}/children`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => (json as { quest?: Quest } | null)?.quest ?? null,
  );
}

export async function fetchQuestHistory(
  questId: string,
  days: number = 90,
): Promise<ActionResult<{ completions: QuestCompletionHistoryPoint[] }>> {
  return runAction<{ completions: QuestCompletionHistoryPoint[] }>(
    () => fetch(`/api/quests/${questId}/history?days=${encodeURIComponent(String(days))}`),
    (json) => {
      const completions = (json as { completions?: QuestCompletionHistoryPoint[] } | null)?.completions;
      if (!Array.isArray(completions)) {
        return null;
      }
      return { completions };
    },
  );
}

export function normalizeQuestCadenceForClient(
  quest: Pick<Quest, "cadence" | "isDaily">,
): QuestCadence {
  if (quest.cadence?.kind) {
    return quest.cadence;
  }
  if (quest.isDaily) {
    return { kind: "daily" };
  }
  return { kind: "oneoff" };
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

export type UndoQuestCompletionResult = {
  quest: Quest;
  progression: {
    totalXp: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
  };
  xpRemoved: number;
};

/** One-off: omit `date`. Habit: pass UTC `completionDate` as `YYYY-MM-DD`. */
export async function undoQuestCompletion(
  questId: string,
  options?: { date?: string },
): Promise<ActionResult<UndoQuestCompletionResult>> {
  const qs = options?.date ? `?date=${encodeURIComponent(options.date)}` : "";
  return runAction<UndoQuestCompletionResult>(
    () =>
      fetch(`/api/quests/${questId}/complete${qs}`, {
        method: "DELETE",
      }),
    (json) => {
      const body = json as UndoQuestCompletionResult | null;
      if (!body || typeof body !== "object" || !("quest" in body)) {
        return null;
      }
      return body;
    },
  );
}

export async function fetchTagSuggestions(prefix: string): Promise<ActionResult<{ suggestions: string[] }>> {
  const qs = new URLSearchParams();
  if (prefix.trim()) {
    qs.set("prefix", prefix.trim());
  }
  return runAction<{ suggestions: string[] }>(
    () => fetch(`/api/quests/tag-suggestions?${qs.toString()}`),
    (json) => {
      const suggestions = (json as { suggestions?: string[] } | null)?.suggestions;
      if (!Array.isArray(suggestions)) {
        return null;
      }
      return { suggestions };
    },
  );
}

export async function updateQuestTags(questId: string, tags: string[]): Promise<ActionResult<{ tags: string[] }>> {
  return runAction<{ tags: string[] }>(
    () =>
      fetch(`/api/quests/${questId}/tags`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags }),
      }),
    (json) => {
      const tagsOut = (json as { tags?: string[] } | null)?.tags;
      if (!Array.isArray(tagsOut)) {
        return null;
      }
      return { tags: tagsOut };
    },
  );
}

export async function createQuestNote(
  questId: string,
  body: string,
): Promise<ActionResult<{ note: QuestNote }>> {
  return runAction<{ note: QuestNote }>(
    () =>
      fetch(`/api/quests/${questId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }),
    (json) => {
      const raw = (json as { note?: { id?: unknown; body?: string; createdAt?: unknown } } | null)?.note;
      if (!raw?.body) {
        return null;
      }
      const createdAt =
        typeof raw.createdAt === "string"
          ? raw.createdAt
          : raw.createdAt
            ? new Date(raw.createdAt as Date).toISOString()
            : new Date().toISOString();
      const note: QuestNote = {
        id: typeof raw.id === "string" ? raw.id : String(raw.id),
        body: raw.body,
        createdAt,
      };
      return { note };
    },
  );
}

export async function deleteQuestNote(questId: string, noteId: string): Promise<ActionResult> {
  return runAction(
    () =>
      fetch(`/api/quests/${questId}/notes/${encodeURIComponent(noteId)}`, {
        method: "DELETE",
      }),
    () => null,
  );
}

export async function createQuestLink(
  questId: string,
  payload: { questId: string; kind: QuestLinkKind },
): Promise<ActionResult<{ link: { id: string; questId: string; kind: QuestLinkKind } }>> {
  return runAction(
    () =>
      fetch(`/api/quests/${questId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => {
      const link = (json as { link?: { id: string; questId: string; kind: QuestLinkKind } } | null)?.link;
      if (!link) {
        return null;
      }
      return { link };
    },
  );
}

export async function deleteQuestLink(questId: string, linkId: string): Promise<ActionResult> {
  return runAction(
    () =>
      fetch(`/api/quests/${questId}/links/${encodeURIComponent(linkId)}`, {
        method: "DELETE",
      }),
    () => null,
  );
}

export async function fetchMetricsSummary(range: MetricsRange): Promise<ActionResult<MetricsSummary>> {
  return runAction<MetricsSummary>(
    () => fetch(`/api/metrics/summary?range=${encodeURIComponent(range)}`),
    (json) => (json as MetricsSummary | null) ?? null,
  );
}

export async function fetchWeeklyReview(): Promise<ActionResult<{ weeklyReview: WeeklyReview }>> {
  return runAction<{ weeklyReview: WeeklyReview }>(
    () => fetch("/api/review/weekly"),
    (json) => {
      const weeklyReview = (json as { weeklyReview?: WeeklyReview } | null)?.weeklyReview;
      if (!weeklyReview) {
        return null;
      }
      return { weeklyReview };
    },
  );
}

export async function fetchHistoricalReview(
  weeks: number = 4,
): Promise<ActionResult<{ historicalReview: HistoricalReview }>> {
  return runAction<{ historicalReview: HistoricalReview }>(
    () => fetch(`/api/review/historical?weeks=${encodeURIComponent(String(weeks))}`),
    (json) => {
      const historicalReview = (json as { historicalReview?: HistoricalReview } | null)?.historicalReview;
      if (!historicalReview) {
        return null;
      }
      return { historicalReview };
    },
  );
}

export async function fetchTodaySuggestion(): Promise<ActionResult<{ suggestion: NextBestQuestSuggestion | null }>> {
  return runAction<{ suggestion: NextBestQuestSuggestion | null }>(
    () => fetch("/api/today/suggestion"),
    (json) => {
      const payload = json as { suggestion?: NextBestQuestSuggestion | null } | null;
      if (!payload || !("suggestion" in payload)) {
        return null;
      }
      return { suggestion: payload.suggestion ?? null };
    },
  );
}

export async function fetchEventAnalytics(
  range: MetricsRange = "7d",
): Promise<ActionResult<{ analytics: EventAnalytics }>> {
  return runAction<{ analytics: EventAnalytics }>(
    () => fetch(`/api/events/analytics?range=${encodeURIComponent(range)}`),
    (json) => {
      const analytics = (json as { analytics?: EventAnalytics } | null)?.analytics;
      if (!analytics) {
        return null;
      }
      return { analytics };
    },
  );
}

export async function recordBehaviorEvent(
  name: BehaviorEventName | string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (!isBehaviorEventName(name)) {
    return;
  }

  const sanitizedProperties = sanitizeBehaviorEventProperties(properties);
  const payload = sanitizedProperties ? { name, properties: sanitizedProperties } : { name };

  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Best-effort telemetry: never interrupt user flows.
  }
}

export async function fetchYouProfile(): Promise<ActionResult<{ profile: YouProfile }>> {
  return runAction<{ profile: YouProfile }>(
    () => fetch("/api/you/profile"),
    (json) => {
      const profile = (json as { profile?: YouProfile } | null)?.profile;
      if (!profile) {
        return null;
      }
      return { profile };
    },
  );
}

export async function updateYouProfile(payload: {
  displayName?: string;
  remindersEnabled?: boolean;
  reminderTimeLocal?: string | null;
  reminderDays?: number[];
  reminderLastFiredOn?: string | null;
}): Promise<ActionResult<{ profile: YouProfile }>> {
  return runAction<{ profile: YouProfile }>(
    () =>
      fetch("/api/you/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => {
      const profile = (json as { profile?: YouProfile } | null)?.profile;
      if (!profile) {
        return null;
      }
      return { profile };
    },
  );
}

export async function changeYouPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  return runAction(
    () =>
      fetch("/api/you/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    () => null,
  );
}

export async function fetchOnboardingState(): Promise<ActionResult<{ onboarding: OnboardingState }>> {
  return runAction<{ onboarding: OnboardingState }>(
    () => fetch("/api/onboarding"),
    (json) => {
      const onboarding = (json as { onboarding?: OnboardingState } | null)?.onboarding;
      if (!onboarding) {
        return null;
      }
      return { onboarding };
    },
  );
}

export const fetchYouPreferences = fetchOnboardingState;

export async function updateYouPreferences(
  payload: YouPreferencesPayload,
): Promise<ActionResult<{ onboarding: OnboardingState }>> {
  return runAction<{ onboarding: OnboardingState }>(
    () =>
      fetch("/api/you/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    (json) => {
      const onboarding = (json as { onboarding?: OnboardingState } | null)?.onboarding;
      if (!onboarding) {
        return null;
      }
      return { onboarding };
    },
  );
}

export async function completeOnboarding(payload: {
  focusArea: "work" | "health" | "learning" | "life";
  weeklyTarget: number;
  encouragementStyle: "gentle" | "direct" | "celebration";
}): Promise<ActionResult<{ onboarding: OnboardingState }>> {
  return runAction<{ onboarding: OnboardingState }>(
    () =>
      fetch("/api/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          complete: true,
        }),
      }),
    (json) => {
      const onboarding = (json as { onboarding?: OnboardingState } | null)?.onboarding;
      if (!onboarding) {
        return null;
      }
      return { onboarding };
    },
  );
}

export async function startFocusSession(
  questId?: string,
): Promise<ActionResult<{ session: ActiveFocusSession }>> {
  return runAction<{ session: ActiveFocusSession }>(
    () =>
      fetch("/api/focus/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questId ? { questId } : {}),
      }),
    (json) => (json as { session?: ActiveFocusSession } | null)?.session ? (json as { session: ActiveFocusSession }) : null,
  );
}

export async function stopFocusSession(): Promise<ActionResult<{ session: ClosedFocusSession }>> {
  return runAction<{ session: ClosedFocusSession }>(
    () =>
      fetch("/api/focus/stop", {
        method: "POST",
      }),
    (json) => (json as { session?: ClosedFocusSession } | null)?.session ? (json as { session: ClosedFocusSession }) : null,
  );
}

export async function getActiveFocusSession(): Promise<ActionResult<{ session: ActiveFocusSession | null }>> {
  return runAction<{ session: ActiveFocusSession | null }>(
    () => fetch("/api/focus/active"),
    (json) => {
      const payload = json as { session?: ActiveFocusSession | null } | null;
      if (!payload || !("session" in payload)) {
        return null;
      }
      return { session: payload.session ?? null };
    },
  );
}
