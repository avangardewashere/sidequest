export const BEHAVIOR_EVENT_NAMES = [
  "weekly_review_viewed",
  "historical_review_viewed",
  "suggestion_viewed",
  "suggestion_clicked",
  "quest_completed",
] as const;

export type BehaviorEventName = (typeof BEHAVIOR_EVENT_NAMES)[number];

const BEHAVIOR_EVENT_NAME_SET = new Set<string>(BEHAVIOR_EVENT_NAMES);
export const MAX_BEHAVIOR_EVENT_PROPERTIES_BYTES = 4096;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasNestedArraysBeyondDepthOne(value: unknown, arrayDepth = 0): boolean {
  if (Array.isArray(value)) {
    const nextDepth = arrayDepth + 1;
    if (nextDepth > 1) {
      return true;
    }
    return value.some((item) => hasNestedArraysBeyondDepthOne(item, nextDepth));
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.values(value).some((item) => hasNestedArraysBeyondDepthOne(item, arrayDepth));
}

function estimatePayloadBytes(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function isBehaviorEventName(name: unknown): name is BehaviorEventName {
  return typeof name === "string" && BEHAVIOR_EVENT_NAME_SET.has(name);
}

export function sanitizeBehaviorEventProperties(
  properties: unknown,
  maxBytes = MAX_BEHAVIOR_EVENT_PROPERTIES_BYTES,
): Record<string, unknown> | undefined {
  if (properties == null) {
    return undefined;
  }
  if (!isPlainObject(properties)) {
    return undefined;
  }
  if (hasNestedArraysBeyondDepthOne(properties)) {
    return undefined;
  }
  if (estimatePayloadBytes(properties) > maxBytes) {
    return undefined;
  }
  return properties;
}
