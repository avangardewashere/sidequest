import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type NoteCardProps = {
  createdAtLabel: string;
  body: string;
  /** Optional rich body; default is plain text with preserved line breaks. */
  renderBody?: (body: string) => ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function NoteCard({
  createdAtLabel,
  body,
  renderBody,
  onEdit,
  onDelete,
  className = "",
}: NoteCardProps) {
  const content = renderBody ? renderBody(body) : body;

  return (
    <Card variant="surface" className={["space-y-2", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <time className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
          {createdAtLabel}
        </time>
        <div className="flex shrink-0 gap-1">
          {onEdit ? (
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          {onDelete ? (
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>
      {renderBody ? (
        <div className="text-sm" style={{ color: "var(--color-text-primary)" }}>
          {content}
        </div>
      ) : (
        <div className="text-sm whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>
          {content}
        </div>
      )}
    </Card>
  );
}
