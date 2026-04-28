import mongoose from "mongoose";
import { CompletionLogModel } from "@/models/CompletionLog";

export const LEGACY_COMPLETION_LOG_UNIQUE_INDEX = "questId_1_userId_1";
export const CADENCE_COMPLETION_LOG_UNIQUE_INDEX = "questId_1_userId_1_completionDate_1";

export function toUtcDateKey(timestamp: Date): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, "0");
  const day = String(timestamp.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function backfillCompletionDates(batchSize: number = 500): Promise<number> {
  let updated = 0;
  while (true) {
    const docs = await CompletionLogModel.find({
      $or: [{ completionDate: { $exists: false } }, { completionDate: null }, { completionDate: "" }],
    })
      .sort({ _id: 1 })
      .limit(batchSize)
      .lean();

    if (docs.length === 0) {
      break;
    }

    const operations = docs.map((doc: { _id: mongoose.Types.ObjectId; completedAt: Date | string }) => ({
      updateOne: {
        filter: { _id: doc._id },
        update: { $set: { completionDate: toUtcDateKey(new Date(doc.completedAt)) } },
      },
    }));

    if (operations.length > 0) {
      const result = await CompletionLogModel.bulkWrite(operations, { ordered: false });
      updated += result.modifiedCount;
    }
  }

  return updated;
}

export async function countCompletionDateGaps(): Promise<number> {
  return CompletionLogModel.countDocuments({
    $or: [{ completionDate: { $exists: false } }, { completionDate: null }, { completionDate: "" }],
  });
}

export async function swapCompletionLogUniqueIndexes(): Promise<void> {
  const indexes = (await CompletionLogModel.collection.indexes()) as Array<{ name: string }>;
  const hasLegacyIndex = indexes.some((index) => index.name === LEGACY_COMPLETION_LOG_UNIQUE_INDEX);
  const hasNewIndex = indexes.some((index) => index.name === CADENCE_COMPLETION_LOG_UNIQUE_INDEX);

  if (hasLegacyIndex) {
    await CompletionLogModel.collection.dropIndex(LEGACY_COMPLETION_LOG_UNIQUE_INDEX);
  }

  if (!hasNewIndex) {
    await CompletionLogModel.collection.createIndex(
      { questId: 1, userId: 1, completionDate: 1 },
      { unique: true, name: CADENCE_COMPLETION_LOG_UNIQUE_INDEX },
    );
  }
}
