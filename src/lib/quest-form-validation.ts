import { normalizeTags } from "@/lib/normalize-quest-tags";
import type { QuestCadence } from "@/types/dashboard";

export const MAX_NOTE_BODY_LEN = 4096;
const MAX_TAG_LEN = 32;
const MAX_TAGS = 8;

function hasHtml(value: string) {
  return /[<][^>]+[>]/.test(value);
}

export function validateCadence(cadence: QuestCadence): string | null {
  const kind = cadence.kind;
  if (kind === "weekdays" || kind === "weekly" || kind === "custom") {
    if (!cadence.daysOfWeek || cadence.daysOfWeek.length === 0) {
      return "Pick at least one day for this cadence.";
    }
  }
  if (kind === "custom" && (cadence.everyNDays == null || cadence.everyNDays < 1)) {
    return "Custom cadence needs an interval of at least 1 day.";
  }
  return null;
}

export function validateTags(tags: string[]): string | null {
  if (tags.length > MAX_TAGS) {
    return `You can add at most ${MAX_TAGS} tags.`;
  }
  for (const tag of tags) {
    if (tag.length > MAX_TAG_LEN) {
      return `Each tag must be at most ${MAX_TAG_LEN} characters.`;
    }
  }
  const normalized = normalizeTags(tags);
  if (normalized.length !== tags.length) {
    return "Remove empty or duplicate tags.";
  }
  return null;
}

/** Optional note: empty is valid. Non-empty must meet API rules. */
export function validateNoteBody(body: string, optional: boolean): string | null {
  const t = body.trim();
  if (!t) {
    return optional ? null : "Note cannot be empty.";
  }
  if (t.length > MAX_NOTE_BODY_LEN) {
    return `Notes can be at most ${MAX_NOTE_BODY_LEN} characters.`;
  }
  if (hasHtml(t)) {
    return "Notes cannot contain HTML tags.";
  }
  return null;
}

export function validateQuestTitleDescription(title: string, description: string): string | null {
  if (!title.trim()) {
    return "Title is required.";
  }
  if (title.trim().length > 120) {
    return "Title must be at most 120 characters.";
  }
  if (!description.trim()) {
    return "Description is required.";
  }
  if (description.trim().length > 500) {
    return "Description must be at most 500 characters.";
  }
  return null;
}
