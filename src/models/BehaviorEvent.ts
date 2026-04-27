import mongoose, { InferSchemaType, Model } from "mongoose";
import { BEHAVIOR_EVENT_NAMES } from "@/lib/behavior-events";

const behaviorEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      enum: [...BEHAVIOR_EVENT_NAMES],
      required: true,
    },
    properties: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: false },
);

behaviorEventSchema.index({ userId: 1, createdAt: -1 });

export type BehaviorEventDocument = InferSchemaType<typeof behaviorEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const BehaviorEventModel: Model<BehaviorEventDocument> =
  (mongoose.models.BehaviorEvent as Model<BehaviorEventDocument>) ||
  mongoose.model<BehaviorEventDocument>("BehaviorEvent", behaviorEventSchema);
