"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { DashboardNav } from "@/components/dashboard-nav";
import { useToast } from "@/components/feedback/toast-provider";
import { actionResultToToast, deleteQuestById, getQuestById, updateQuestById } from "@/lib/client-api";
import type { Quest } from "@/types/dashboard";

export default function EditQuestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params.id;
  const { pushToast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("easy");
  const [category, setCategory] = useState<Quest["category"]>("personal");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedTitle, setSavedTitle] = useState("");
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");

  useEffect(() => {
    const run = async () => {
      const quest = await getQuestById(questId);
      if (!quest) {
        setFeedback("Quest not found.");
        pushToast({
          tone: "warning",
          title: "Quest not found",
          message: "The requested quest could not be loaded.",
        });
        setLoading(false);
        return;
      }
      setTitle(quest.title);
      setSavedTitle(quest.title);
      setDescription(quest.description);
      setDifficulty(quest.difficulty);
      setCategory(quest.category);
      setLoading(false);
    };
    void run();
  }, [pushToast, questId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    const updated = await updateQuestById(questId, {
      title,
      description,
      difficulty,
      category,
    });
    if (!updated.ok) {
      setFeedback(updated.message ?? "Could not update quest.");
      pushToast(
        actionResultToToast(updated, {
          fallbackErrorTitle: "Update quest failed",
        }),
      );
      return;
    }
    setSavedTitle(title.trim());
    setDeleteConfirmTitle("");
    setFeedback("Quest updated successfully.");
    pushToast({
      tone: "success",
      title: "Quest updated",
      message: "Changes saved successfully.",
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this quest? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    if (deleteConfirmTitle.trim() !== savedTitle.trim()) {
      setFeedback("Type the saved quest title exactly in the box below to confirm deletion.");
      pushToast({
        tone: "warning",
        title: "Delete confirmation mismatch",
        message: "Type the exact saved title before deleting.",
      });
      return;
    }

    const deleted = await deleteQuestById(questId, deleteConfirmTitle.trim());
    if (!deleted.ok) {
      setFeedback(deleted.message ?? "Could not delete quest. Check the title matches exactly.");
      pushToast(
        actionResultToToast(deleted, {
          fallbackErrorTitle: "Delete quest failed",
        }),
      );
      return;
    }
    pushToast({
      tone: "success",
      title: "Quest deleted",
      message: "The quest has been removed.",
    });
    router.push("/quests/view");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-6 text-zinc-100">
      <DashboardNav onLogout={() => void signOut({ redirect: false })} />
      <h1 className="text-2xl font-semibold">Edit Quest</h1>

      {loading ? (
        <p className="text-sm text-zinc-400">Loading quest...</p>
      ) : (
        <form
          onSubmit={handleUpdate}
          className="rounded-xl border border-white/10 bg-zinc-950 p-4 text-zinc-100"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-3">
              <label htmlFor="edit-quest-title" className="mb-1 block text-sm text-zinc-300">
                Quest Title
              </label>
              <input
                id="edit-quest-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2"
                required
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="edit-quest-description" className="mb-1 block text-sm text-zinc-300">
                Quest Description
              </label>
              <textarea
                id="edit-quest-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
              className="rounded-md bg-indigo-500 px-4 py-2 font-medium hover:bg-indigo-400"
            >
              Update Quest
            </button>
          </div>
        </form>
      )}

      {feedback ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          {feedback}
        </div>
      ) : null}

      <div className="space-y-3">
        <div>
          <label htmlFor="delete-confirm-title" className="mb-1 block text-sm text-zinc-300">
            Type quest title to enable delete
          </label>
          <input
            id="delete-confirm-title"
            value={deleteConfirmTitle}
            onChange={(event) => setDeleteConfirmTitle(event.target.value)}
            placeholder={savedTitle || "Quest title"}
            className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            autoComplete="off"
          />
        </div>
        <div className="flex gap-2">
          <Link
            href="/quests/view"
            className="rounded-md bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
          >
            Back to View Quests
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={!savedTitle || deleteConfirmTitle.trim() !== savedTitle.trim()}
            className="rounded-md bg-red-600 px-3 py-2 text-sm hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete Quest
          </button>
        </div>
      </div>
    </main>
  );
}
