"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";
import { QuestForm, type QuestFormSnapshot } from "@/components/quests/quest-form";
import { useToast } from "@/components/feedback/toast-provider";
import { dispatchCaptureCreated } from "@/lib/app-shell";
import { actionResultToToast, createQuest, createQuestNote, updateQuestTags } from "@/lib/client-api";

export default function CreateQuestPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [feedback, setFeedback] = useState("");
  const [redirectAfterCreate, setRedirectAfterCreate] = useState(false);
  const [createdQuest, setCreatedQuest] = useState(false);
  const [formError, setFormError] = useState("");
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(values: QuestFormSnapshot) {
    setFormError("");
    setFeedback("");
    setCreatedQuest(false);

    const dueDate = values.cadence.kind === "oneoff" ? values.dueDateIso : null;
    const created = await createQuest({
      title: values.title,
      description: values.description,
      difficulty: values.difficulty,
      category: values.category,
      cadence: values.cadence,
      dueDate,
    });

    if (!created.ok || !created.data) {
      const msg = created.message ?? "Could not create quest.";
      setFormError(msg);
      pushToast(
        actionResultToToast(created, {
          fallbackErrorTitle: "Create quest failed",
        }),
      );
      return;
    }

    const questId = created.data._id;

    if (values.tags.length > 0) {
      const tagRes = await updateQuestTags(questId, values.tags);
      if (!tagRes.ok) {
        setFormError(tagRes.message ?? "Quest was created but tags could not be saved.");
        pushToast(
          actionResultToToast(tagRes, {
            fallbackErrorTitle: "Tags not saved",
          }),
        );
        return;
      }
    }

    if (values.firstNoteBody.trim()) {
      const noteRes = await createQuestNote(questId, values.firstNoteBody.trim());
      if (!noteRes.ok) {
        setFormError(noteRes.message ?? "Quest was created but the first note could not be saved.");
        pushToast(
          actionResultToToast(noteRes, {
            fallbackErrorTitle: "Note not saved",
          }),
        );
        return;
      }
    }

    setCreatedQuest(true);
    setFeedback("Quest created successfully.");
    dispatchCaptureCreated();
    pushToast({
      tone: "success",
      title: "Quest created",
      message: "Your new quest is ready.",
    });
    if (redirectAfterCreate) {
      router.push("/quests/view");
    }
  }

  return (
    <AuthenticatedAppShell>
      <div className="relative min-h-screen" style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6 pb-6">
          <div>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Add a quest or habit with cadence, optional due date, tags, and a first note.
            </p>
          </div>

        <QuestForm
          key={formKey}
          mode="create"
          submitLabel="Create quest"
          errorMessage={formError}
          onSubmit={handleSubmit}
          footer={
            <label
              className="inline-flex cursor-pointer items-center gap-2 text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <input
                type="checkbox"
                checked={redirectAfterCreate}
                onChange={(e) => setRedirectAfterCreate(e.target.checked)}
                className="accent-[var(--color-primary)]"
              />
              Go to view quests after create
            </label>
          }
        />

        {feedback ? (
          <p
            className="rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: "var(--color-border-subtle)",
              background: "var(--color-primary-subtle)",
              color: "var(--color-text-primary)",
            }}
          >
            {feedback}
          </p>
        ) : null}

        {createdQuest && !redirectAfterCreate ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/quests/view"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                borderColor: "var(--color-border-default)",
              }}
            >
              View quests
            </Link>
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-transparent px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ color: "var(--color-text-primary)" }}
              onClick={() => {
                setFeedback("");
                setCreatedQuest(false);
                setFormError("");
                setFormKey((k) => k + 1);
              }}
            >
              Create another
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-bg-elevated)",
              color: "var(--color-text-primary)",
              borderColor: "var(--color-border-default)",
            }}
          >
            Back to dashboard
          </Link>
          <Link
            href="/quests/view"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-on-accent)",
              borderColor: "var(--color-primary-hover)",
            }}
          >
            View quests
          </Link>
        </div>
        </main>
      </div>
    </AuthenticatedAppShell>
  );
}
