"use client";

import { useId, useRef, type KeyboardEvent } from "react";

export type LinkPickerOption = { id: string; title: string };

export type LinkPickerProps = {
  id: string;
  label: string;
  query: string;
  onQueryChange: (query: string) => void;
  options: LinkPickerOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder?: string;
  emptyLabel?: string;
  helperText?: string;
  errorText?: string;
  className?: string;
};

export function LinkPicker({
  id,
  label,
  query,
  onQueryChange,
  options,
  selectedId,
  onSelect,
  placeholder = "Search quests…",
  emptyLabel = "No results",
  helperText,
  errorText,
  className = "",
}: LinkPickerProps) {
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedTitle = options.find((o) => o.id === selectedId)?.title;

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onSelect(null);
      onQueryChange("");
      return;
    }
    if (e.key === "ArrowDown" && options.length > 0) {
      e.preventDefault();
      const el = document.getElementById(`${listId}-0`);
      el?.focus();
    }
  };

  const labelId = `${id}-label`;
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = errorText ? `${id}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={["space-y-1.5", className].filter(Boolean).join(" ")}>
      <label id={labelId} htmlFor={id} className="block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full rounded-md border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
        style={{ borderColor: "var(--color-border-default)", background: "var(--color-bg-surface)" }}
        aria-autocomplete="list"
        aria-controls={options.length > 0 ? listId : undefined}
        aria-expanded={options.length > 0}
        aria-describedby={describedBy}
        aria-invalid={errorText ? true : undefined}
        role="combobox"
      />
      {selectedId ? (
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Selected: <span className="font-medium">{selectedTitle ?? selectedId}</span>{" "}
          <button
            type="button"
            className="ms-1 underline"
            onClick={() => {
              onSelect(null);
              onQueryChange("");
              inputRef.current?.focus();
            }}
          >
            Clear
          </button>
        </p>
      ) : null}
      {options.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="max-h-48 overflow-auto rounded-md border text-sm"
          style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-bg-elevated)" }}
        >
          {options.map((opt, index) => (
            <li key={opt.id} role="presentation">
              <button
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={selectedId === opt.id ? true : false}
                className="w-full px-3 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                style={{
                  color: "var(--color-text-primary)",
                  background: selectedId === opt.id ? "var(--color-primary-subtle)" : "transparent",
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(opt.id);
                  onQueryChange(opt.title);
                }}
              >
                {opt.title}
              </button>
            </li>
          ))}
        </ul>
      ) : query.trim().length > 0 ? (
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          {emptyLabel}
        </p>
      ) : null}
      {helperText && !errorText ? (
        <p id={helperId} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {helperText}
        </p>
      ) : null}
      {errorText ? (
        <p id={errorId} className="text-sm font-medium" role="alert" style={{ color: "var(--color-danger)" }}>
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
