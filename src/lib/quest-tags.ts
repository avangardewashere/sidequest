import { Types } from "mongoose";
import { QuestModel } from "@/models/Quest";

export { normalizeTags } from "@/lib/normalize-quest-tags";

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
