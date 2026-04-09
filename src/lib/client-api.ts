import { signIn } from "next-auth/react";
import type {
  CompleteQuestResponse,
  CreateQuestPayload,
  Profile,
  Quest,
  RegisterPayload,
  UpdateQuestPayload,
} from "@/types/dashboard";

type DashboardData = {
  quests: Quest[];
  profile: Profile | null;
  dailies: Quest[];
};

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
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

export async function createQuest(payload: CreateQuestPayload): Promise<boolean> {
  const response = await fetch("/api/quests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
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
): Promise<boolean> {
  const response = await fetch(`/api/quests/${questId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export async function deleteQuestById(questId: string): Promise<boolean> {
  const response = await fetch(`/api/quests/${questId}`, {
    method: "DELETE",
  });
  return response.ok;
}

export async function completeQuestById(questId: string): Promise<{
  ok: boolean;
  data: CompleteQuestResponse;
}> {
  const response = await fetch(`/api/quests/${questId}/complete`, {
    method: "PATCH",
  });
  const data = (await parseJsonSafe(response)) as CompleteQuestResponse | null;
  return {
    ok: response.ok,
    data: data ?? {},
  };
}
