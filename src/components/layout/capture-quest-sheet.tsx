"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Sheet } from "@/components/ui/sheet";
import { TagInput } from "@/components/ui/tag-input";
import { useToast } from "@/components/feedback/toast-provider";
import { actionResultToToast, createQuest, fetchTagSuggestions, updateQuestTags } from "@/lib/client-api";
import { dispatchCaptureCreated } from "@/lib/app-shell";

const INBOX_DESCRIPTION = "Inbox capture — triage from your quest list.";

type CaptureQuestSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CaptureQuestSheet({ open, onOpenChange }: CaptureQuestSheetProps) {
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!open) return;
    const q = tagQuery.trim();
    const t = window.setTimeout(() => {
      if (!q) {
        setTagSuggestions([]);
        return;
      }
      void (async () => {
        const res = await fetchTagSuggestions(q);
        if (res.ok && res.data?.suggestions) {
          setTagSuggestions(res.data.suggestions);
        } else {
          setTagSuggestions([]);
        }
      })();
    }, q ? 280 : 0);
    return () => window.clearTimeout(t);
  }, [open, tagQuery]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError("Title is required.");
      return;
    }
    if (trimmed.length > 120) {
      setFormError("Title must be at most 120 characters.");
      return;
    }

    setSaving(true);
    setFormError("");
    const created = await createQuest({
      title: trimmed,
      description: INBOX_DESCRIPTION,
      difficulty: "easy",
      category: "personal",
      cadence: { kind: "oneoff" },
      dueDate: null,
    });
    setSaving(false);

    if (!created.ok || !created.data) {
      setFormError(created.message ?? "Could not create quest.");
      pushToast(
        actionResultToToast(created, {
          fallbackErrorTitle: "Capture failed",
        }),
      );
      return;
    }

    const questId = created.data._id;
    if (tags.length > 0) {
      const tagRes = await updateQuestTags(questId, tags);
      if (!tagRes.ok) {
        setFormError(tagRes.message ?? "Quest created but tags were not saved.");
        pushToast(
          actionResultToToast(tagRes, {
            fallbackErrorTitle: "Tags not saved",
          }),
        );
        return;
      }
    }

    pushToast({
      tone: "success",
      title: "Captured",
      message: "Inbox quest added.",
    });
    dispatchCaptureCreated();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Quick capture" placement="bottom">
      <form onSubmit={(ev) => void handleSubmit(ev)} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          One-off inbox item. Add tags now or triage later.
        </p>
        <FormField id="capture-title" label="Title" required>
          <input
            id="capture-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            style={{
              borderColor: "var(--color-border-default)",
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
            }}
            placeholder="What do you need to do?"
            autoComplete="off"
          />
        </FormField>
        <TagInput
          id="capture-tags"
          label="Tags"
          value={tags}
          onChange={setTags}
          suggestions={tagSuggestions}
          onDraftChange={setTagQuery}
          helperText="Optional. Suggestions from your existing tags."
        />
        {formError ? (
          <p className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
            {formError}
          </p>
        ) : null}
        <div className="mt-auto flex justify-end gap-2 border-t pt-3" style={{ borderColor: "var(--color-border-subtle)" }}>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
