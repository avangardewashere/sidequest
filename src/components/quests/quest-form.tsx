"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CadencePicker } from "@/components/ui/cadence-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { LinkPicker } from "@/components/ui/link-picker";
import { NoteCard } from "@/components/ui/note-card";
import { TagInput } from "@/components/ui/tag-input";
import { useToast } from "@/components/feedback/toast-provider";
import {
  actionResultToToast,
  createQuestLink,
  deleteQuestLink,
  fetchTagSuggestions,
  getQuestById,
  normalizeQuestCadenceForClient,
  searchQuests,
} from "@/lib/client-api";
import {
  validateCadence,
  validateNoteBody,
  validateQuestTitleDescription,
  validateTags,
} from "@/lib/quest-form-validation";
import type { Quest, QuestCadence, QuestLink, QuestLinkKind } from "@/types/dashboard";

const inputClass =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]";

const inputStyle = {
  borderColor: "var(--color-border-default)",
  background: "var(--color-bg-surface)",
  color: "var(--color-text-primary)",
} as const;

export type QuestFormSnapshot = {
  title: string;
  description: string;
  difficulty: Quest["difficulty"];
  category: Quest["category"];
  cadence: QuestCadence;
  dueDateIso: string | null;
  tags: string[];
  firstNoteBody: string;
  newNoteBody: string;
};

export type QuestFormProps = {
  mode: "create" | "edit";
  initialQuest?: Quest | null;
  /** Title last saved on the server — used only for delete confirmation in edit mode. */
  committedTitle?: string;
  loading?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  submitLabel: string;
  footer?: ReactNode;
  onSubmit: (values: QuestFormSnapshot) => Promise<void>;
  onDeleteQuest?: (confirmTitle: string) => Promise<void>;
  /** Called after a link is created or removed so the parent can refresh `initialQuest`. */
  onLinksMutated?: () => void | Promise<void>;
};

function isoToDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function datetimeLocalToIso(local: string): string | null {
  const t = local.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatNoteTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function QuestForm({
  mode,
  initialQuest,
  committedTitle = "",
  loading = false,
  disabled = false,
  errorMessage,
  submitLabel,
  footer,
  onSubmit,
  onDeleteQuest,
  onLinksMutated,
}: QuestFormProps) {
  const { pushToast } = useToast();
  const linkPickerId = useId();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Quest["difficulty"]>("easy");
  const [category, setCategory] = useState<Quest["category"]>("personal");
  const [cadence, setCadence] = useState<QuestCadence>({ kind: "oneoff" });
  const [dueLocal, setDueLocal] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [firstNoteBody, setFirstNoteBody] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const tagDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editLinks, setEditLinks] = useState<QuestLink[]>([]);
  const [linkTitles, setLinkTitles] = useState<Record<string, string>>({});
  const [linkSearchQuery, setLinkSearchQuery] = useState("");
  const [linkSearchOptions, setLinkSearchOptions] = useState<{ id: string; title: string }[]>([]);
  const [newLinkKind, setNewLinkKind] = useState<QuestLinkKind>("related");
  const [linkBusy, setLinkBusy] = useState(false);
  const linkSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mode !== "create") return;
    setTitle("");
    setDescription("");
    setDifficulty("easy");
    setCategory("personal");
    setCadence({ kind: "oneoff" });
    setDueLocal("");
    setTags([]);
    setFirstNoteBody("");
    setNewNoteBody("");
    setDeleteConfirmTitle("");
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit" || !initialQuest) return;
    const links = (initialQuest.links ?? []).map((l) => ({
      id: typeof l.id === "string" ? l.id : String(l.id),
      questId: typeof l.questId === "string" ? l.questId : String(l.questId),
      kind: l.kind,
    }));
    setEditLinks(links);
    setLinkSearchQuery("");
    setLinkSearchOptions([]);
    setTitle(initialQuest.title);
    setDescription(initialQuest.description);
    setDifficulty(initialQuest.difficulty);
    setCategory(initialQuest.category);
    setCadence(normalizeQuestCadenceForClient(initialQuest));
    setDueLocal(isoToDatetimeLocalValue(initialQuest.dueDate ?? undefined));
    setTags(Array.isArray(initialQuest.tags) ? [...initialQuest.tags] : []);
    setFirstNoteBody("");
    setNewNoteBody("");
    setDeleteConfirmTitle("");
  }, [mode, initialQuest]);

  useEffect(() => {
    if (tagDebounceRef.current) {
      clearTimeout(tagDebounceRef.current);
    }
    const q = tagQuery.trim();
    if (!q) {
      setTagSuggestions([]);
      return;
    }
    tagDebounceRef.current = setTimeout(() => {
      void (async () => {
        const res = await fetchTagSuggestions(q);
        if (res.ok && res.data?.suggestions) {
          setTagSuggestions(res.data.suggestions);
        } else {
          setTagSuggestions([]);
        }
      })();
    }, 280);
    return () => {
      if (tagDebounceRef.current) {
        clearTimeout(tagDebounceRef.current);
      }
    };
  }, [tagQuery]);

  useEffect(() => {
    if (mode !== "edit") {
      return;
    }
    const ids = [...new Set(editLinks.map((l) => l.questId))];
    if (ids.length === 0) {
      setLinkTitles({});
      return;
    }
    let cancelled = false;
    void Promise.all(
      ids.map(async (id) => {
        const tq = await getQuestById(id);
        return [id, tq?.title ?? `Quest ${id.slice(-6)}`] as const;
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setLinkTitles(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [mode, editLinks]);

  useEffect(() => {
    if (mode !== "edit" || !initialQuest) {
      return;
    }
    if (linkSearchDebounceRef.current) {
      clearTimeout(linkSearchDebounceRef.current);
    }
    const q = linkSearchQuery.trim();
    if (!q) {
      setLinkSearchOptions([]);
      return;
    }
    linkSearchDebounceRef.current = setTimeout(() => {
      void (async () => {
        const res = await searchQuests({ q, limit: 24 });
        if (!res.ok || !res.data) {
          setLinkSearchOptions([]);
          return;
        }
        const blocked = new Set(editLinks.map((l) => l.questId));
        blocked.add(initialQuest._id);
        const opts = res.data.quests
          .filter((h) => !blocked.has(h._id))
          .map((h) => ({ id: h._id, title: h.title }));
        setLinkSearchOptions(opts);
      })();
    }, 220);
    return () => {
      if (linkSearchDebounceRef.current) {
        clearTimeout(linkSearchDebounceRef.current);
      }
    };
  }, [linkSearchQuery, mode, initialQuest, editLinks]);

  const dueDateIso = cadence.kind === "oneoff" ? datetimeLocalToIso(dueLocal) : null;

  const validationError = useMemo(() => {
    const t = validateQuestTitleDescription(title, description);
    if (t) return t;
    const c = validateCadence(cadence);
    if (c) return c;
    const tg = validateTags(tags);
    if (tg) return tg;
    if (mode === "create") {
      const n = validateNoteBody(firstNoteBody, true);
      if (n) return n;
    } else {
      const n = validateNoteBody(newNoteBody, true);
      if (n) return n;
    }
    return null;
  }, [title, description, cadence, tags, mode, firstNoteBody, newNoteBody]);

  const canSubmit = !validationError && !disabled && !submitting && !loading;

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!canSubmit) return;
      setSubmitting(true);
      try {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          difficulty,
          category,
          cadence,
          dueDateIso,
          tags,
          firstNoteBody: firstNoteBody.trim(),
          newNoteBody: newNoteBody.trim(),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      canSubmit,
      onSubmit,
      title,
      description,
      difficulty,
      category,
      cadence,
      dueDateIso,
      tags,
      firstNoteBody,
      newNoteBody,
    ],
  );

  const showDue = cadence.kind === "oneoff";
  const deleteTitle = committedTitle.trim();
  const canDelete = Boolean(onDeleteQuest && deleteTitle && deleteConfirmTitle.trim() === deleteTitle);

  async function handleDelete() {
    if (!onDeleteQuest || !canDelete) return;
    setSubmitting(true);
    try {
      await onDeleteQuest(deleteConfirmTitle.trim());
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFormLinkPick(id: string | null) {
    if (!id || !initialQuest?._id) {
      return;
    }
    setLinkBusy(true);
    try {
      const res = await createQuestLink(initialQuest._id, { questId: id, kind: newLinkKind });
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Link failed" }));
        return;
      }
      setLinkSearchQuery("");
      await onLinksMutated?.();
    } finally {
      setLinkBusy(false);
    }
  }

  async function handleFormDeleteLink(linkId: string) {
    if (!initialQuest?._id) return;
    setLinkBusy(true);
    try {
      const res = await deleteQuestLink(initialQuest._id, linkId);
      if (!res.ok) {
        pushToast(actionResultToToast(res, { fallbackErrorTitle: "Remove link failed" }));
        return;
      }
      await onLinksMutated?.();
    } finally {
      setLinkBusy(false);
    }
  }

  const sortedNotes = useMemo(() => {
    if (!initialQuest?.notes?.length) return [];
    return [...initialQuest.notes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [initialQuest?.notes]);

  if (loading) {
    return (
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Loading quest…
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
      <Card variant="surface" className="space-y-5 p-5">
        <FormField id="quest-title" label="Title" required errorText={undefined}>
          <input
            id="quest-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            style={inputStyle}
            placeholder="Name this quest or habit"
            required
            autoComplete="off"
          />
        </FormField>

        <FormField
          id="quest-description"
          label="Description"
          required
          helperText="A single line is enough for a quick habit."
        >
          <textarea
            id="quest-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={[inputClass, "min-h-28 resize-y"].join(" ")}
            style={inputStyle}
            placeholder="What does done look like?"
            required
          />
        </FormField>

        <CadencePicker id="quest-cadence" value={cadence} onChange={setCadence} />

        {showDue ? (
          <FormField
            id="quest-due"
            label="Due (optional)"
            helperText="Only applies to one-off quests."
          >
            <input
              id="quest-due"
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
              className={inputClass}
              style={inputStyle}
            />
          </FormField>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="quest-difficulty" label="Difficulty">
            <select
              id="quest-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Quest["difficulty"])}
              className={inputClass}
              style={inputStyle}
            >
              <option value="easy">Easy (+10 XP)</option>
              <option value="medium">Medium (+20 XP)</option>
              <option value="hard">Hard (+35 XP)</option>
            </select>
          </FormField>
          <FormField id="quest-category" label="Category">
            <select
              id="quest-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Quest["category"])}
              className={inputClass}
              style={inputStyle}
            >
              <option value="work">Work</option>
              <option value="study">Study</option>
              <option value="health">Health</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>

        <TagInput
          id="quest-tags"
          label="Tags"
          value={tags}
          onChange={setTags}
          suggestions={tagSuggestions}
          onDraftChange={setTagQuery}
          helperText="Lowercase, up to 8 tags. Suggestions appear as you type."
        />

        {mode === "create" ? (
          <FormField id="quest-first-note" label="First note (optional)">
            <textarea
              id="quest-first-note"
              value={firstNoteBody}
              onChange={(e) => setFirstNoteBody(e.target.value)}
              className={[inputClass, "min-h-20 resize-y"].join(" ")}
              style={inputStyle}
              placeholder="Optional context saved after the quest is created."
            />
          </FormField>
        ) : (
          <div className="space-y-3">
            <span className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Notes
            </span>
            {sortedNotes.length ? (
              <ul className="space-y-2">
                {sortedNotes.map((note) => (
                  <li key={note.id}>
                    <NoteCard createdAtLabel={formatNoteTime(note.createdAt)} body={note.body} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                No notes yet.
              </p>
            )}
            <FormField id="quest-new-note" label="Add note">
              <textarea
                id="quest-new-note"
                value={newNoteBody}
                onChange={(e) => setNewNoteBody(e.target.value)}
                className={[inputClass, "min-h-20 resize-y"].join(" ")}
                style={inputStyle}
                placeholder="Saved when you update the quest."
              />
            </FormField>
          </div>
        )}

        {validationError || errorMessage ? (
          <p className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
            {validationError ?? errorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
          {footer}
        </div>
      </Card>

      {mode === "edit" && initialQuest?._id ? (
        <Card variant="surface" className="space-y-4 p-5">
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Linked quests
          </h2>
          {editLinks.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No links yet. Search below to link another quest.
            </p>
          ) : (
            <ul className="space-y-2">
              {editLinks.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                  style={{ borderColor: "var(--color-border-subtle)" }}
                >
                  <div className="min-w-0">
                    <span className="font-medium">{linkTitles[l.questId] ?? l.questId}</span>
                    <span className="ms-2 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      {l.kind}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={linkBusy}
                    onClick={() => void handleFormDeleteLink(l.id)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <label className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Link kind
            <select
              value={newLinkKind}
              onChange={(e) => setNewLinkKind(e.target.value as QuestLinkKind)}
              className="mt-1 w-full max-w-xs rounded-md border px-3 py-2 text-sm"
              style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
            >
              <option value="related">related</option>
              <option value="blocks">blocks</option>
              <option value="depends-on">depends-on</option>
            </select>
          </label>
          <LinkPicker
            id={linkPickerId}
            label="Add link"
            query={linkSearchQuery}
            onQueryChange={setLinkSearchQuery}
            options={linkSearchOptions}
            selectedId={null}
            onSelect={(id) => void handleFormLinkPick(id)}
            placeholder="Search by title, tag, or note…"
            emptyLabel="No quests match that search."
            helperText="Pick a quest to create the link."
          />
          {linkBusy ? (
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Updating links…
            </p>
          ) : null}
        </Card>
      ) : null}

      {mode === "edit" && onDeleteQuest ? (
        <Card variant="surface" className="space-y-3 p-5">
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            Danger zone
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Type the saved quest title exactly to enable delete.
          </p>
          <FormField id="delete-confirm-title" label="Confirm title">
            <input
              id="delete-confirm-title"
              value={deleteConfirmTitle}
              onChange={(e) => setDeleteConfirmTitle(e.target.value)}
              placeholder={deleteTitle || "Quest title"}
              className={inputClass}
              style={inputStyle}
              autoComplete="off"
            />
          </FormField>
          <Button
            type="button"
            variant="destructive"
            disabled={!canDelete || submitting || disabled}
            onClick={() => void handleDelete()}
          >
            Delete quest
          </Button>
        </Card>
      ) : null}
    </form>
  );
}
