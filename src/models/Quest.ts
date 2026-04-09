import mongoose, { InferSchemaType, Model } from "mongoose";

const questSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true, default: "" },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      default: "easy",
    },
    category: {
      type: String,
      enum: ["work", "study", "health", "personal", "other"],
      required: true,
      default: "personal",
    },
    xpReward: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    dueDate: { type: Date, default: null },
    isDaily: { type: Boolean, default: false },
    dailyKey: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

questSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, category: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, isDaily: 1, dailyKey: 1 });
questSchema.index(
  { createdBy: 1, dailyKey: 1, title: 1 },
  { unique: true, partialFilterExpression: { isDaily: true } },
);

export type QuestDocument = InferSchemaType<typeof questSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuestModel: Model<QuestDocument> =
  (mongoose.models.Quest as Model<QuestDocument>) ||
  mongoose.model<QuestDocument>("Quest", questSchema);
