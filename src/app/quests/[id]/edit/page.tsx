"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import { QuestForm, type QuestFormSnapshot } from "@/components/quests/quest-form";
import { useToast } from "@/components/feedback/toast-provider";
import {
  actionResultToToast,
  createQuestNote,
  deleteQuestById,
  getQuestById,
  updateQuestById,
  updateQuestTags,
} from "@/lib/client-api";
import type { Quest } from "@/types/dashboard";

export default function EditQuestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const questId = params.id;
  const { pushToast } = useToast();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedTitle, setSavedTitle] = useState("");
  const [formError, setFormError] = useState("");

  const reloadQuest = useCallback(async () => {
    const q = await getQuestById(questId);
    setQuest(q);
    if (q) {
      setSavedTitle(q.title.trim());
    }
    return q;
  }, [questId]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setFormError("");
      const q = await getQuestById(questId);
      if (!q) {
        setFeedback("Quest not found.");
        pushToast({
          tone: "warning",
          title: "Quest not found",
          message: "The requested quest could not be loaded.",
        });
        setQuest(null);
        setLoading(false);
        return;
      }
      setQuest(q);
      setSavedTitle(q.title.trim());
      setFeedback("");
      setLoading(false);
    };
    void run();
  }, [pushToast, questId]);

  async function handleSubmit(values: QuestFormSnapshot) {
    setFormError("");
    setFeedback("");

    const dueDate = values.cadence.kind === "oneoff" ? values.dueDateIso : null;
    const updated = await updateQuestById(questId, {
      title: values.title,
      description: values.description,
      difficulty: values.difficulty,
      category: values.category,
      cadence: values.cadence,
      dueDate,
    });

    if (!updated.ok) {
      const msg = updated.message ?? "Could not update quest.";
      setFormError(msg);
      pushToast(
        actionResultToToast(updated, {
          fallbackErrorTitle: "Update quest failed",
        }),
      );
      return;
    }

    const tagRes = await updateQuestTags(questId, values.tags);
    if (!tagRes.ok) {
      setFormError(tagRes.message ?? "Quest was updated but tags could not be saved.");
      pushToast(
        actionResultToToast(tagRes, {
          fallbackErrorTitle: "Tags not saved",
        }),
      );
      return;
    }

    if (values.newNoteBody.trim()) {
      const noteRes = await createQuestNote(questId, values.newNoteBody.trim());
      if (!noteRes.ok) {
        setFormError(noteRes.message ?? "Quest was updated but the new note could not be saved.");
        pushToast(
          actionResultToToast(noteRes, {
            fallbackErrorTitle: "Note not saved",
          }),
        );
        return;
      }
    }

    await reloadQuest();
    setFeedback("Quest updated successfully.");
    pushToast({
      tone: "success",
      title: "Quest updated",
      message: "Changes saved successfully.",
    });
  }

  async function handleDeleteQuest(confirmTitle: string) {
    const confirmed = window.confirm("Delete this quest? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    if (confirmTitle.trim() !== savedTitle.trim()) {
      setFeedback("Type the saved quest title exactly in the danger zone to confirm deletion.");
      pushToast({
        tone: "warning",
        title: "Delete confirmation mismatch",
        message: "Type the exact saved title before deleting.",
      });
      return;
    }

    const deleted = await deleteQuestById(questId, confirmTitle.trim());
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
    <AuthenticatedAppShell>
      <div className="relative min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pb-6">
          <div>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Cadence, due date for one-offs, tags, and notes use the same rules as the rest of the app.
            </p>
          </div>

        {!loading && !quest ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {feedback || "This quest is not available."}
          </p>
        ) : (
          <QuestForm
            mode="edit"
            initialQuest={quest}
            committedTitle={savedTitle}
            loading={loading}
            submitLabel="Update quest"
            errorMessage={formError}
            onSubmit={handleSubmit}
            onDeleteQuest={handleDeleteQuest}
          />
        )}

        {feedback && quest ? (
          <p
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-border-subtle)",
              background: "var(--color-bg-elevated)",
              color: "var(--color-text-primary)",
            }}
          >
            {feedback}
          </p>
        ) : null}

        <Link
          href="/quests/view"
          className="inline-flex w-fit min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{
            background: "var(--color-bg-elevated)",
            color: "var(--color-text-primary)",
            borderColor: "var(--color-border-default)",
          }}
        >
          Back to view quests
        </Link>
        </main>
      </div>
    </AuthenticatedAppShell>
  );
}
