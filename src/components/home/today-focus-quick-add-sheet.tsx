"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/feedback/toast-provider";
import { actionResultToToast, createQuest } from "@/lib/client-api";
import type { Quest } from "@/types/dashboard";

const DEFAULT_DESCRIPTION = "Forged from Today home.";

type TodayFocusQuickAddSheetProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

const difficulties: Quest["difficulty"][] = ["easy", "medium", "hard"];

export function TodayFocusQuickAddSheet({ open, onClose, onCreated }: TodayFocusQuickAddSheetProps) {
  const { pushToast } = useToast();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("medium");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    queueMicrotask(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setFormError("Title is required.");
      return;
    }
    if (trimmed.length > 120) {
      setFormError("Title must be 120 characters or fewer.");
      return;
    }

    setSaving(true);
    setFormError("");
    const result = await createQuest({
      title: trimmed,
      description: DEFAULT_DESCRIPTION,
      difficulty,
      category: "personal",
    });
    setSaving(false);

    if (!result.ok) {
      setFormError(result.message ?? "Could not create quest.");
      pushToast(
        actionResultToToast(result, {
          fallbackErrorTitle: "Quick add failed",
        }),
      );
      return;
    }

    pushToast({
      tone: "success",
      title: "Quest created",
      message: "New quest added to your list.",
    });
    onCreated();
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close quick add"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-t-2xl border px-4 pb-8 pt-4 shadow-[0_-8px_32px_rgba(0,0,0,0.2)]"
        style={{
          borderColor: "var(--color-border-default)",
          background: "var(--color-bg-elevated)",
          color: "var(--color-text-primary)",
        }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Quick add quest</h2>
          <button
            type="button"
            className="rounded-full border px-2 py-1 text-xs"
            style={{ borderColor: "var(--color-border-default)" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="quick-add-title" className="mb-1 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
              Title
            </label>
            <input
              ref={inputRef}
              id="quick-add-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "var(--color-border-default)",
                background: "var(--color-bg-surface)",
                color: "var(--color-text-primary)",
              }}
              placeholder="What are you forging?"
              required
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>
              Difficulty
            </p>
            <div className="flex gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className="flex-1 rounded-full border px-2 py-2 text-xs font-semibold capitalize"
                  style={{
                    borderColor: difficulty === d ? "var(--color-primary)" : "var(--color-border-default)",
                    background: difficulty === d ? "var(--color-primary-subtle)" : "var(--color-bg-surface)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          {formError ? (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-full text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-on-accent)" }}
          >
            {saving ? "Saving…" : "Create quest"}
          </button>
        </form>
      </div>
    </div>
  );
}
