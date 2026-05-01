const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 32;

/** Pure tag list normalization (matches PATCH `/api/quests/[id]/tags`). Safe for client bundles. */
export function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const deduped = new Set<string>();
  for (const value of input) {
    if (typeof value !== "string") {
      continue;
    }
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized.length > MAX_TAG_LENGTH) {
      continue;
    }
    deduped.add(normalized);
    if (deduped.size >= MAX_TAGS) {
      break;
    }
  }

  return Array.from(deduped);
}
