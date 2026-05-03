import mongoose, { InferSchemaType, Model } from "mongoose";

const weeklyReflectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    /** UTC Monday of the week (YYYY-MM-DD). */
    weekStartUtc: { type: String, required: true, index: true },
    wentWell: { type: String, default: "", maxlength: 4000, trim: true },
    didntGoWell: { type: String, default: "", maxlength: 4000, trim: true },
    nextWeekFocus: { type: String, default: "", maxlength: 4000, trim: true },
  },
  { timestamps: true },
);

weeklyReflectionSchema.index({ userId: 1, weekStartUtc: 1 }, { unique: true });

export type WeeklyReflectionDocument = InferSchemaType<typeof weeklyReflectionSchema> & {
  _id: mongoose.Types.ObjectId;
  updatedAt: Date;
};

export const WeeklyReflectionModel: Model<WeeklyReflectionDocument> =
  (mongoose.models.WeeklyReflection as Model<WeeklyReflectionDocument>) ||
  mongoose.model<WeeklyReflectionDocument>("WeeklyReflection", weeklyReflectionSchema);
