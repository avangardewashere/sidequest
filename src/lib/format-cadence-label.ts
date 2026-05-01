import type { QuestCadence } from "@/types/dashboard";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDays(days?: number[]): string {
  if (!days?.length) return "";
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => DAY_LABELS[d] ?? String(d)).join(", ");
}

/** Short label for list rows and chips. */
export function formatCadenceShort(cadence: QuestCadence): string {
  switch (cadence.kind) {
    case "oneoff":
      return "One-off";
    case "daily":
      return "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekly": {
      const days = formatDays(cadence.daysOfWeek);
      return days ? `Weekly (${days})` : "Weekly";
    }
    case "custom": {
      const n = cadence.everyNDays ?? "?";
      const days = formatDays(cadence.daysOfWeek);
      return days ? `Every ${n}d (${days})` : `Custom · every ${n}d`;
    }
    default:
      return "Habit";
  }
}
