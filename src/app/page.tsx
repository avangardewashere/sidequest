"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type Quest = {
  _id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  status: "active" | "completed";
  isDaily?: boolean;
  dailyKey?: string | null;
};

type Profile = {
  displayName: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("easy");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dailies, setDailies] = useState<Quest[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const activeQuests = useMemo(
    () => quests.filter((quest) => quest.status === "active"),
    [quests],
  );
  const completedQuests = useMemo(
    () => quests.filter((quest) => quest.status === "completed"),
    [quests],
  );

  const loadData = useCallback(async () => {
    if (!session?.user) {
      return;
    }

    const [questRes, progressionRes, dailiesRes] = await Promise.all([
      fetch("/api/quests"),
      fetch("/api/progression"),
      fetch("/api/dailies"),
    ]);

    if (questRes.ok) {
      const questData = await questRes.json();
      setQuests(questData.quests ?? []);
    }

    if (progressionRes.ok) {
      const progressionData = await progressionRes.json();
      setProfile(progressionData.profile ?? null);
    }

    if (dailiesRes.ok) {
      const dailiesData = await dailiesRes.json();
      setDailies(dailiesData.dailies ?? []);
    }
  }, [session?.user]);

  useEffect(() => {
    const run = async () => {
      await loadData();
    };
    void run();
  }, [loadData]);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (mode === "register") {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayName, password }),
      });

      if (!registerRes.ok) {
        setFeedback("Registration failed. Try a different email.");
        return;
      }
    }

    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResult?.ok) {
      setFeedback(mode === "register" ? "Account created. Welcome!" : "Welcome back!");
      setPassword("");
      return;
    }

    setFeedback("Login failed. Check your credentials.");
  }

  async function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const res = await fetch("/api/quests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, difficulty }),
    });
    if (!res.ok) {
      setFeedback("Could not create quest.");
      return;
    }

    setTitle("");
    setFeedback("New quest added.");
    await loadData();
  }

  async function completeQuest(questId: string) {
    setFeedback("");
    const res = await fetch(`/api/quests/${questId}/complete`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (!res.ok) {
      setFeedback(data.error ?? "Could not complete quest.");
      return;
    }

    if (data.milestoneReward) {
      setFeedback(
        `Quest complete! +${data.xpGained} XP | Streak ${data.milestoneReward.streakMilestone} reward: +${data.milestoneReward.bonusXp} bonus XP`,
      );
    } else {
      setFeedback(`Quest complete! +${data.xpGained} XP`);
    }
    await loadData();
  }

  if (status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <p>Loading SideQuest...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-950 p-6 text-zinc-100">
          <h1 className="text-2xl font-semibold">SideQuest</h1>
          <p className="mt-1 text-sm text-zinc-400">Turn tasks into XP and levels.</p>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-1 text-sm ${mode === "login" ? "bg-indigo-500 text-white" : "bg-zinc-800"}`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-md px-3 py-1 text-sm ${mode === "register" ? "bg-indigo-500 text-white" : "bg-zinc-800"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="mt-4 space-y-3">
            {mode === "register" ? (
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
                required
              />
            ) : null}
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              required
            />
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-500 px-3 py-2 font-medium hover:bg-indigo-400"
            >
              {mode === "register" ? "Create account" : "Login"}
            </button>
          </form>
          {feedback ? <p className="mt-3 text-sm text-emerald-400">{feedback}</p> : null}
        </div>
      </main>
    );
  }

  const progressPct = profile
    ? Math.round((profile.xpIntoLevel / Math.max(profile.xpForNextLevel, 1)) * 100)
    : 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6">
      <header className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">SideQuest Dashboard</h1>
            <p className="text-sm text-zinc-400">
              {profile?.displayName ?? session.user.name} | Level {profile?.level ?? 1} |{" "}
              {profile?.totalXp ?? 0} XP
            </p>
          </div>
          <button
            onClick={() => void signOut({ redirect: false })}
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-zinc-400">
            <span>XP to next level</span>
            <span>
              {profile?.xpIntoLevel ?? 0}/{profile?.xpForNextLevel ?? 1}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Current streak: {profile?.currentStreak ?? 0} days | Best streak:{" "}
            {profile?.longestStreak ?? 0} days
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
        <h2 className="text-lg font-semibold">Create Quest</h2>
        <form onSubmit={handleCreateQuest} className="mt-3 flex flex-wrap gap-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Defeat bug dragon"
            className="min-w-64 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
            required
          />
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Quest["difficulty"])}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            <option value="easy">Easy (+10 XP)</option>
            <option value="medium">Medium (+20 XP)</option>
            <option value="hard">Hard (+35 XP)</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-400"
          >
            Add Quest
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
          <h3 className="text-lg font-semibold">Daily Quests ({dailies.length})</h3>
          <ul className="mt-3 space-y-2">
            {dailies.length ? (
              dailies.map((quest) => (
                <li
                  key={quest._id}
                  className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div>
                    <p className="font-medium">{quest.title}</p>
                    <p className="text-xs text-zinc-400">
                      {quest.difficulty} | +{quest.xpReward} XP |{" "}
                      {quest.status === "completed" ? "Completed" : "Daily"}
                    </p>
                  </div>
                  {quest.status === "active" ? (
                    <button
                      onClick={() => void completeQuest(quest._id)}
                      className="rounded-md bg-indigo-500 px-3 py-2 text-sm hover:bg-indigo-400"
                    >
                      Complete
                    </button>
                  ) : (
                    <span className="rounded-md bg-zinc-800 px-3 py-2 text-xs">Done</span>
                  )}
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-400">Daily quests will appear here.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
          <h3 className="text-lg font-semibold">Active Quests ({activeQuests.length})</h3>
          <ul className="mt-3 space-y-2">
            {activeQuests.length ? (
              activeQuests.map((quest) => (
                <li
                  key={quest._id}
                  className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div>
                    <p className="font-medium">{quest.title}</p>
                    <p className="text-xs text-zinc-400">
                      {quest.difficulty} | +{quest.xpReward} XP
                    </p>
                  </div>
                  <button
                    onClick={() => void completeQuest(quest._id)}
                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm hover:bg-indigo-400"
                  >
                    Complete
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-400">No active quests yet.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
          <h3 className="text-lg font-semibold">Completed Quests ({completedQuests.length})</h3>
          <ul className="mt-3 space-y-2">
            {completedQuests.length ? (
              completedQuests.map((quest) => (
                <li
                  key={quest._id}
                  className="rounded-md border border-zinc-800 bg-zinc-900 p-3"
                >
                  <p className="font-medium line-through opacity-80">{quest.title}</p>
                  <p className="text-xs text-zinc-400">
                    {quest.difficulty} | +{quest.xpReward} XP
                  </p>
                </li>
              ))
            ) : (
              <li className="text-sm text-zinc-400">Complete your first quest to gain XP.</li>
            )}
          </ul>
        </div>
      </section>

      {feedback ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
          {feedback}
        </div>
      ) : null}
    </main>
  );
}
