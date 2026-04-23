"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { fetchQuestsList } from "@/lib/client-api";
import type {
  QuestCategoryFilter,
  QuestSortOption,
  QuestStatusFilter,
} from "@/lib/quest-selectors";
import type { Quest } from "@/types/dashboard";

export default function ViewQuestsPage() {
  const { data: session, status } = useSession();
  const [statusFilter, setStatusFilter] = useState<QuestStatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<QuestCategoryFilter>("all");
  const [sortOption, setSortOption] = useState<QuestSortOption>("newest");
  const [quests, setQuests] = useState<Quest[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const reloadQuestList = useCallback(async () => {
    if (!session?.user) {
      return;
    }
    setListLoading(true);
    try {
      const list = await fetchQuestsList({
        status: statusFilter,
        category: categoryFilter,
        sort: sortOption,
      });
      setQuests(list);
    } finally {
      setListLoading(false);
    }
  }, [session?.user, statusFilter, categoryFilter, sortOption]);

  const { feedback, completeQuest } = useDashboardActions({
    isAuthenticated: Boolean(session?.user),
    onAfterQuestMutation: reloadQuestList,
  });

  useEffect(() => {
    void reloadQuestList();
  }, [reloadQuestList]);

  if (status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center p-6">
        <p>Loading quests...</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-6 text-zinc-100">
        <h1 className="text-2xl font-semibold">View Quests</h1>
        <p className="text-sm text-zinc-400">Please sign in from the dashboard to view your quests.</p>
        <Link href="/" className="w-fit rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-6 text-zinc-100">
      <DashboardNav onLogout={() => void signOut({ redirect: false })} />

      <h1 className="text-2xl font-semibold">View Quests</h1>
      <section className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as QuestStatusFilter)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="daily">Daily</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as QuestCategoryFilter)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="all">All categories</option>
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="health">Health</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value as QuestSortOption)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="highest_xp">Sort: Highest XP</option>
            <option value="category">Sort: Category</option>
          </select>
        </div>
      </section>

      <section className="grid gap-3">
        {listLoading ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            Loading quests...
          </div>
        ) : quests.length ? (
          quests.map((quest) => (
            <article
              key={quest._id}
              className="rounded-xl border border-white/30 bg-white/10 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md"
            >
              <div
                className="flex items-start justify-between gap-3 rounded-lg p-3"
                style={{
                  background: "linear-gradient(to bottom, #F3EADB 0%, #E4D4BE 50%, #D6C2A5 100%)",
                  boxShadow:
                    "inset 0 0 0 2px #D8C6A5, inset 0 2px 0 #EAD9B8, inset 0 -2px 0 #B7A17E",
                }}
              >
                <div
                  className="space-y-2"
                  style={{ color: "#6B4A1E", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
                >
                  <h3
                    className={`text-base font-semibold ${quest.status === "completed" ? "line-through opacity-80" : ""}`}
                  >
                    {quest.title}
                  </h3>
                  <p className="text-sm">{quest.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-zinc-800 px-2 py-1 text-white">{quest.category}</span>
                    <span className="rounded-md bg-zinc-800 px-2 py-1 text-white">{quest.difficulty}</span>
                    <span className="rounded-md bg-indigo-500/20 px-2 py-1 text-white">
                      +{quest.xpReward} XP
                    </span>
                    {quest.isDaily ? (
                      <span className="rounded-md bg-amber-500/20 px-2 py-1 text-white">
                        Daily
                      </span>
                    ) : null}
                    {quest.status === "completed" ? (
                      <span className="rounded-md bg-emerald-500/20 px-2 py-1 text-white">
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-md bg-blue-500/20 px-2 py-1 text-white">
                        Active
                      </span>
                    )}
                  </div>
                </div>
                {quest.status === "active" ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/quests/${quest._id}/edit`}
                      className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => void completeQuest(quest._id)}
                      className="rounded-md bg-indigo-500 px-3 py-2 text-sm hover:bg-indigo-400"
                    >
                      Complete
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/quests/${quest._id}/edit`}
                      className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
                    >
                      Edit
                    </Link>
                    <span className="rounded-md bg-zinc-800 px-3 py-2 text-xs">Done</span>
                  </div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
            No quests match your current filters.
          </div>
        )}
      </section>

      {feedback ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300">
          {feedback}
        </div>
      ) : null}
    </main>
  );
}
