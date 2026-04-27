import mongoose, { InferSchemaType, Model } from "mongoose";

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      default: null,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    durationSec: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

focusSessionSchema.index({ userId: 1, startedAt: -1 });
focusSessionSchema.index(
  { userId: 1, endedAt: 1 },
  { partialFilterExpression: { endedAt: null }, unique: true },
);

export type FocusSessionDocument = InferSchemaType<typeof focusSessionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const FocusSessionModel: Model<FocusSessionDocument> =
  (mongoose.models.FocusSession as Model<FocusSessionDocument>) ||
  mongoose.model<FocusSessionDocument>("FocusSession", focusSessionSchema);
