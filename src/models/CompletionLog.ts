import mongoose, { InferSchemaType, Model } from "mongoose";

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
  },
  { timestamps: true },
);

completionLogSchema.index({ userId: 1, completedAt: -1 });
completionLogSchema.index({ questId: 1, userId: 1 }, { unique: true });

export type CompletionLogDocument = InferSchemaType<typeof completionLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CompletionLogModel: Model<CompletionLogDocument> =
  (mongoose.models.CompletionLog as Model<CompletionLogDocument>) ||
  mongoose.model<CompletionLogDocument>("CompletionLog", completionLogSchema);
