import mongoose, { InferSchemaType, Model } from "mongoose";

const cadenceSchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: ["oneoff", "daily", "weekdays", "weekly", "custom"],
      required: true,
      default: "oneoff",
    },
    daysOfWeek: {
      type: [Number],
      default: undefined,
    },
    everyNDays: {
      type: Number,
      default: undefined,
    },
  },
  { _id: false },
);

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
    cadence: { type: cadenceSchema, default: () => ({ kind: "oneoff" }) },
    lastCompletedDate: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parentQuestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quest",
      default: null,
      index: true,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

questSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, category: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, isDaily: 1, dailyKey: 1 });
questSchema.index({ createdBy: 1, "cadence.kind": 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, parentQuestId: 1, status: 1 });
questSchema.index(
  { createdBy: 1, dailyKey: 1, title: 1 },
  { unique: true, partialFilterExpression: { isDaily: true } },
);

type QuestHierarchyValidationDoc = mongoose.Document & {
  parentQuestId?: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  cadence?: {
    kind: "oneoff" | "daily" | "weekdays" | "weekly" | "custom";
    daysOfWeek?: number[];
    everyNDays?: number;
  };
  invalidate(path: string, errorMsg: string): void;
};

questSchema.pre("validate", async function validateQuestHierarchy(this: QuestHierarchyValidationDoc) {
  if (!this.parentQuestId) {
    return;
  }

  const parent = await QuestModel.findById(this.parentQuestId).select("_id createdBy parentQuestId isDaily").lean();
  if (!parent) {
    this.invalidate("parentQuestId", "Parent quest not found");
    return;
  }

  if (String(parent.createdBy) !== String(this.createdBy)) {
    this.invalidate("parentQuestId", "Parent quest does not belong to the same user");
    return;
  }

  if (parent.parentQuestId) {
    this.invalidate("parentQuestId", "Nested children deeper than two levels are not allowed");
    return;
  }

  if (parent.isDaily) {
    this.invalidate("parentQuestId", "Daily quests cannot be parent quests");
  }
});

questSchema.pre("validate", function validateCadence(this: QuestHierarchyValidationDoc) {
  const cadence = this.cadence ?? { kind: "oneoff" as const };

  if (cadence.kind === "weekdays" || cadence.kind === "weekly" || cadence.kind === "custom") {
    if (!cadence.daysOfWeek || cadence.daysOfWeek.length === 0) {
      this.invalidate("cadence.daysOfWeek", "daysOfWeek is required for weekday/weekly/custom cadence");
    } else {
      const invalidDay = cadence.daysOfWeek.some(
        (day: number) => !Number.isInteger(day) || day < 0 || day > 6,
      );
      if (invalidDay) {
        this.invalidate("cadence.daysOfWeek", "daysOfWeek values must be integers between 0 and 6");
      }
    }
  }

  if (cadence.kind === "custom") {
    if (!cadence.everyNDays || cadence.everyNDays < 1 || !Number.isInteger(cadence.everyNDays)) {
      this.invalidate("cadence.everyNDays", "everyNDays is required for custom cadence and must be >= 1");
    }
  }
});

export type QuestDocument = InferSchemaType<typeof questSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuestModel: Model<QuestDocument> =
  (mongoose.models.Quest as Model<QuestDocument>) ||
  mongoose.model<QuestDocument>("Quest", questSchema);
