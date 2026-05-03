import mongoose, { InferSchemaType, Model } from "mongoose";

const streakFreezeLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    kind: {
      type: String,
      enum: ["grant", "spend"],
      required: true,
      index: true,
    },
    /** Set for spend (recover); null for milestone grant. */
    questId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      default: null,
      index: true,
    },
    /** Global streak value when milestone bonus (and token grant) fired. */
    streakMilestone: { type: Number, default: null },
    /** For `spend` from streak recover: UTC date key that was filled (undo removes this row). */
    recoveryForDateKey: { type: String, default: null },
  },
  { timestamps: true },
);

streakFreezeLogSchema.index({ userId: 1, createdAt: -1 });

export type StreakFreezeLogDocument = InferSchemaType<typeof streakFreezeLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StreakFreezeLogModel: Model<StreakFreezeLogDocument> =
  (mongoose.models.StreakFreezeLog as Model<StreakFreezeLogDocument>) ||
  mongoose.model<StreakFreezeLogDocument>("StreakFreezeLog", streakFreezeLogSchema);
