"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createQuest } from "@/lib/client-api";
import type { Quest } from "@/types/dashboard";

export default function CreateQuestPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("easy");
  const [category, setCategory] = useState<Quest["category"]>("personal");
  const [feedback, setFeedback] = useState("");
  const [redirectAfterCreate, setRedirectAfterCreate] = useState(false);
  const [createdQuest, setCreatedQuest] = useState(false);

  async function handleCreateQuest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setCreatedQuest(false);

    const created = await createQuest({ title, description, difficulty, category });
    if (!created) {
      setFeedback("Could not create quest.");
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("personal");
    setDifficulty("easy");
    setCreatedQuest(true);
    setFeedback("Quest created successfully.");
    if (redirectAfterCreate) {
      router.push("/quests/view");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold">Create Quest</h1>
      <p className="text-sm text-zinc-400">Create a new quest and assign a category.</p>
      <form
        onSubmit={handleCreateQuest}
        className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-3">
            <label htmlFor="quest-title" className="mb-1 block text-sm text-zinc-300">
              Quest Title
            </label>
            <input
              id="quest-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Defeat bug dragon"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-3">
            <label htmlFor="quest-description" className="mb-1 block text-sm text-zinc-300">
              Quest Description
            </label>
            <textarea
              id="quest-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe what needs to be done to complete this quest."
              className="min-h-28 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
              required
            />
          </div>
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Quest["difficulty"])}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            <option value="easy">Easy (+10 XP)</option>
            <option value="medium">Medium (+20 XP)</option>
            <option value="hard">Hard (+35 XP)</option>
          </select>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value as Quest["category"])}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            <option value="work">Work</option>
            <option value="study">Study</option>
            <option value="health">Health</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-400"
          >
            Add Quest
          </button>
          <label className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={redirectAfterCreate}
              onChange={(event) => setRedirectAfterCreate(event.target.checked)}
            />
            Go to View Quests after create
          </label>
        </div>
      </form>
      {feedback ? (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      ) : null}
      {createdQuest && !redirectAfterCreate ? (
        <div className="flex gap-2">
          <Link
            href="/quests/view"
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm hover:bg-indigo-400"
          >
            View Quests
          </Link>
          <button
            onClick={() => {
              setFeedback("");
              setCreatedQuest(false);
            }}
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
          >
            Create Another
          </button>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Link href="/" className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">
          Back to Dashboard
        </Link>
        <Link
          href="/quests/view"
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm hover:bg-indigo-400"
        >
          Go to View Quests
        </Link>
      </div>
    </main>
  );
}
