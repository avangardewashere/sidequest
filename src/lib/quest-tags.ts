import { Types } from "mongoose";
import { QuestModel } from "@/models/Quest";

const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 32;

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

export async function userTagSuggestions(userId: string, prefix: string): Promise<string[]> {
  const normalizedPrefix = prefix.trim().toLowerCase();
  if (!normalizedPrefix) {
    return [];
  }

  const createdBy = new Types.ObjectId(userId);
  const escaped = normalizedPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startsWith = new RegExp(`^${escaped}`);

  const rows = await QuestModel.aggregate<{ _id: string }>([
    { $match: { createdBy } },
    { $unwind: "$tags" },
    { $match: { tags: { $regex: startsWith } } },
    { $group: { _id: "$tags" } },
    { $sort: { _id: 1 } },
    { $limit: 10 },
  ]);

  return rows.map((row) => row._id);
}
