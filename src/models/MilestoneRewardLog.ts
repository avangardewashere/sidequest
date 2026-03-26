import mongoose, { InferSchemaType, Model } from "mongoose";

const milestoneRewardLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    streakMilestone: { type: Number, required: true },
    bonusXp: { type: Number, required: true },
    awardedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

milestoneRewardLogSchema.index({ userId: 1, streakMilestone: 1 }, { unique: true });
milestoneRewardLogSchema.index({ userId: 1, awardedAt: -1 });

export type MilestoneRewardLogDocument = InferSchemaType<
  typeof milestoneRewardLogSchema
> & {
  _id: mongoose.Types.ObjectId;
};

export const MilestoneRewardLogModel: Model<MilestoneRewardLogDocument> =
  (mongoose.models.MilestoneRewardLog as Model<MilestoneRewardLogDocument>) ||
  mongoose.model<MilestoneRewardLogDocument>(
    "MilestoneRewardLog",
    milestoneRewardLogSchema,
  );
