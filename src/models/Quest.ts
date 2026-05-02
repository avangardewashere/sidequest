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

const questNoteSchema = new mongoose.Schema(
  {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      default: () => new mongoose.Types.ObjectId(),
    },
    body: { type: String, required: true, trim: true, maxlength: 4096 },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const questLinkSchema = new mongoose.Schema(
  {
    questId: { type: mongoose.Schema.Types.ObjectId, ref: "Quest", required: true },
    kind: {
      type: String,
      enum: ["related", "blocks", "depends-on"],
      required: true,
    },
  },
  { _id: true },
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
    tags: { type: [String], default: [] },
    notes: { type: [questNoteSchema], default: [] },
    links: { type: [questLinkSchema], default: [] },
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
    /** Sibling order under the same parent (lower first). */
    order: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

questSchema.index({ createdBy: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, category: 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, isDaily: 1, dailyKey: 1 });
questSchema.index({ createdBy: 1, "cadence.kind": 1, status: 1, createdAt: -1 });
questSchema.index({ createdBy: 1, parentQuestId: 1, status: 1 });
questSchema.index({ createdBy: 1, parentQuestId: 1, order: 1 });
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

questSchema.pre("validate", function validateSecondBrainFields(this: mongoose.Document & {
  tags?: string[];
  notes?: Array<{ body?: string }>;
  links?: Array<{ questId?: mongoose.Types.ObjectId; kind?: string }>;
  invalidate(path: string, errorMsg: string): void;
}) {
  const tags = this.tags ?? [];
  if (tags.length > 8) {
    this.invalidate("tags", "A quest can have at most 8 tags");
  }
  for (const tag of tags) {
    const trimmed = (tag ?? "").trim();
    if (trimmed.length < 1 || trimmed.length > 32) {
      this.invalidate("tags", "Each tag must be between 1 and 32 characters");
      break;
    }
  }

  const notes = this.notes ?? [];
  if (notes.length > 50) {
    this.invalidate("notes", "A quest can have at most 50 notes");
  }
  for (const note of notes) {
    const body = (note.body ?? "").trim();
    if (body.length < 1 || body.length > 4096) {
      this.invalidate("notes", "Each note body must be between 1 and 4096 characters");
      break;
    }
    if (/[<][^>]+[>]/.test(body)) {
      this.invalidate("notes", "HTML tags are not allowed in note bodies");
      break;
    }
  }

  const links = this.links ?? [];
  if (links.length > 32) {
    this.invalidate("links", "A quest can have at most 32 links");
  }
});

export type QuestDocument = InferSchemaType<typeof questSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuestModel: Model<QuestDocument> =
  (mongoose.models.Quest as Model<QuestDocument>) ||
  mongoose.model<QuestDocument>("Quest", questSchema);
