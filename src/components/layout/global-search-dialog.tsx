"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { searchQuests } from "@/lib/client-api";
import type { QuestSearchHit } from "@/types/quest-search";

export type GlobalSearchDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function isTypingInFormField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
    return true;
  }
  return target.isContentEditable;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<QuestSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const t = window.setTimeout(() => {
      setQuery("");
      setHits([]);
      setError(null);
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const q = query.trim();
    if (!q) {
      const clearT = window.setTimeout(() => {
        setHits([]);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(clearT);
    }
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      void (async () => {
        const res = await searchQuests({ q, limit: 20 });
        if (!res.ok) {
          setError(res.message ?? "Search failed.");
          setHits([]);
          setLoading(false);
          return;
        }
        setHits(res.data?.quests ?? []);
        setLoading(false);
      })();
    }, 220);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  const goToQuest = useCallback(
    (id: string) => {
      onOpenChange(false);
      router.push(`/quests/${id}`);
    },
    [onOpenChange, router],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Search quests" placement="bottom">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <label htmlFor={inputId} className="sr-only">
          Search query
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, tag, or note text…"
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          style={{
            borderColor: "var(--color-border-default)",
            background: "var(--color-bg-surface)",
            color: "var(--color-text-primary)",
          }}
          autoComplete="off"
        />
        {error ? (
          <p className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
            {error}
          </p>
        ) : null}
        <div className="min-h-32 overflow-y-auto">
          {loading ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Searching…
            </p>
          ) : !query.trim() ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Type to search your quests.
            </p>
          ) : hits.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              No matches.
            </p>
          ) : (
            <ul className="space-y-1">
              {hits.map((h) => (
                <li key={h._id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:opacity-95"
                    style={{
                      borderColor: "var(--color-border-subtle)",
                      background: "var(--color-bg-elevated)",
                      color: "var(--color-text-primary)",
                    }}
                    onClick={() => goToQuest(h._id)}
                  >
                    <span className="font-semibold">{h.title}</span>
                    {(h.tags?.length ?? 0) > 0 ? (
                      <span className="mt-1 block text-xs" style={{ color: "var(--color-text-secondary)" }}>
                        {(h.tags ?? []).slice(0, 4).join(" · ")}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Sheet>
  );
}
