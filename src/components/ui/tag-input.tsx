"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { TagChip } from "@/components/ui/tag-chip";

export type TagInputProps = {
  id: string;
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  /** Fires on each keystroke in the draft input (e.g. debounced server suggestions). */
  onDraftChange?: (draft: string) => void;
  maxTags?: number;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
  className?: string;
};

function normalizeTag(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  return t.length > 0 ? t : null;
}

export function TagInput({
  id,
  label,
  value,
  onChange,
  onDraftChange,
  suggestions = [],
  maxTags = 8,
  placeholder = "Add tag…",
  helperText,
  errorText,
  required,
  className = "",
}: TagInputProps) {
  const listId = useId();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId, listId].filter(Boolean).join(" ") || undefined;
  const hasError = Boolean(errorText);

  const filteredSuggestions = useMemo(() => {
    const q = draft.trim().toLowerCase();
    const set = new Set(value);
    return suggestions
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && !set.has(s) && (!q || s.includes(q)))
      .slice(0, 8);
  }, [draft, suggestions, value]);

  const addTag = useCallback(
    (raw: string) => {
      const next = normalizeTag(raw);
      if (!next || value.includes(next) || value.length >= maxTags) return;
      onChange([...value, next]);
      setDraft("");
      onDraftChange?.("");
    },
    [maxTags, onChange, onDraftChange, value],
  );

  const removeAt = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [onChange, value],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(draft);
      return;
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      removeAt(value.length - 1);
    }
  };

  return (
    <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {label}
        {required ? (
          <span className="ms-0.5" style={{ color: "var(--color-danger)" }} aria-hidden>
            *
          </span>
        ) : null}
      </label>
      <div
        className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <TagChip key={`${tag}-${index}`} label={tag} onDismiss={() => removeAt(index)} />
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={draft}
          onChange={(e) => {
            const next = e.target.value;
            setDraft(next);
            onDraftChange?.(next);
          }}
          onKeyDown={onKeyDown}
          placeholder={value.length >= maxTags ? "" : placeholder}
          disabled={value.length >= maxTags}
          className="min-w-[8rem] flex-1 border-0 bg-transparent py-0.5 text-sm outline-none focus:ring-0"
          style={{ color: "var(--color-text-primary)" }}
          aria-autocomplete="list"
          aria-controls={filteredSuggestions.length > 0 ? listId : undefined}
          aria-expanded={filteredSuggestions.length > 0}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          role="combobox"
        />
      </div>
      {filteredSuggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="max-h-40 overflow-auto rounded-md border text-sm"
          style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
        >
          {filteredSuggestions.map((s) => (
            <li key={s} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="w-full px-3 py-1.5 text-left hover:opacity-90"
                style={{ color: "var(--color-text-primary)" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {helperText && !hasError ? (
        <p id={helperId} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {helperText}
        </p>
      ) : null}
      {hasError ? (
        <p id={errorId} className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
