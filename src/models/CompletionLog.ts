import mongoose, { InferSchemaType, Model } from "mongoose";

function formatUtcDateKey(timestamp: Date): string {
  const year = timestamp.getUTCFullYear();
  const month = String(timestamp.getUTCMonth() + 1).padStart(2, "0");
  const day = String(timestamp.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const completionLogSchema = new mongoose.Schema(
  {
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    xpEarned: { type: Number, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    completedAt: { type: Date, required: true, default: Date.now },
    completionDate: {
      type: String,
      required: true,
      default: function deriveCompletionDate(this: { completedAt: Date }) {
        return formatUtcDateKey(this.completedAt ?? new Date());
      },
    },
  },
  { timestamps: true },
);

completionLogSchema.index({ userId: 1, completedAt: -1 });
completionLogSchema.index({ questId: 1, userId: 1, completionDate: 1 }, { unique: true });

export type CompletionLogDocument = InferSchemaType<typeof completionLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CompletionLogModel: Model<CompletionLogDocument> =
  (mongoose.models.CompletionLog as Model<CompletionLogDocument>) ||
  mongoose.model<CompletionLogDocument>("CompletionLog", completionLogSchema);
