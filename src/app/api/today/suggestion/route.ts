import { NextResponse } from "next/server";
import mongoose from "mongoose";
import type { PipelineStage } from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { CompletionLogModel } from "@/models/CompletionLog";
import { QuestModel } from "@/models/Quest";
import { UserModel } from "@/models/User";

type EncouragementStyle = "gentle" | "direct" | "celebration";
type SuggestionReason = "focus_area_match" | "category_rotation" | "fallback_priority";
type QuestCategory = "work" | "study" | "health" | "personal" | "other";
type FocusArea = "work" | "health" | "learning" | "life" | null;

type CandidateQuest = {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: QuestCategory;
};

const FOCUS_TO_CATEGORY: Record<Exclude<FocusArea, null>, QuestCategory> = {
  work: "work",
  health: "health",
  learning: "study",
  life: "personal",
};

const COPY_TABLE: Record<EncouragementStyle, Record<SuggestionReason, { summaryHeadline: string; summaryMessage: string }>> = {
  gentle: {
    focus_area_match: {
      summaryHeadline: "A kind next step aligned with your focus.",
      summaryMessage: "This quest matches your chosen focus area and keeps your momentum steady.",
    },
    category_rotation: {
      summaryHeadline: "A gentle rotation for balance.",
      summaryMessage: "This suggestion nudges variety against your recent pattern to keep growth rounded.",
    },
    fallback_priority: {
      summaryHeadline: "A dependable next move.",
      summaryMessage: "This is the top available active quest in your current priority queue.",
    },
  },
  direct: {
    focus_area_match: {
      summaryHeadline: "Focus-area match selected.",
      summaryMessage: "This active quest aligns with your onboarding focus area.",
    },
    category_rotation: {
      summaryHeadline: "Rotation pick selected.",
      summaryMessage: "This category was underrepresented in your last 7 days of completions.",
    },
    fallback_priority: {
      summaryHeadline: "Priority fallback selected.",
      summaryMessage: "No stronger personalization signal was available; using top priority ordering.",
    },
  },
  celebration: {
    focus_area_match: {
      summaryHeadline: "Focus sync unlocked!",
      summaryMessage: "This quest is right in your zone - perfect for a high-impact win.",
    },
    category_rotation: {
      summaryHeadline: "Fresh quest energy!",
      summaryMessage: "New category momentum can keep the streak fun and resilient.",
    },
    fallback_priority: {
      summaryHeadline: "Mainline quest ready!",
      summaryMessage: "Top priority quest is queued up - time to collect XP.",
    },
  },
};

function normalizeStyle(value: unknown): EncouragementStyle {
  if (value === "direct" || value === "celebration") {
    return value;
  }
  return "gentle";
}

function normalizeFocusArea(value: unknown): FocusArea {
  if (value === "work" || value === "health" || value === "learning" || value === "life") {
    return value;
  }
  return null;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function fetchPriorityActiveQuests(userId: string): Promise<CandidateQuest[]> {
  const pipeline: PipelineStage[] = [
    { $match: { createdBy: new mongoose.Types.ObjectId(userId), status: "active" } },
    {
      $addFields: {
        difficultyRank: {
          $switch: {
            branches: [
              { case: { $eq: ["$difficulty", "hard"] }, then: 0 },
              { case: { $eq: ["$difficulty", "medium"] }, then: 1 },
            ],
            default: 2,
          },
        },
        dueDateSort: {
          $ifNull: ["$dueDate", new Date("9999-12-31T00:00:00.000Z")],
        },
      },
    },
    { $sort: { difficultyRank: 1, dueDateSort: 1, xpReward: -1, createdAt: -1 } },
    {
      $project: {
        _id: 1,
        title: 1,
        category: 1,
      },
    },
  ];

  return QuestModel.aggregate<CandidateQuest>(pipeline);
}

async function recentlyCompletedCategories(userId: string, now: Date): Promise<Set<QuestCategory>> {
  const since = startOfUtcDay(now);
  since.setUTCDate(since.getUTCDate() - 6);

  const docs = await CompletionLogModel.aggregate<{ category: QuestCategory }>([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        completedAt: { $gte: since },
      },
    },
    {
      $lookup: {
        from: "quests",
        localField: "questId",
        foreignField: "_id",
        as: "quest",
      },
    },
    { $unwind: "$quest" },
    {
      $group: {
        _id: "$quest.category",
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
      },
    },
  ]);

  return new Set(docs.map((item) => item.category));
}

function pickSuggestion(
  quests: CandidateQuest[],
  focusArea: FocusArea,
  completedCategoriesLast7d: Set<QuestCategory>,
): { quest: CandidateQuest; reason: SuggestionReason } | null {
  if (quests.length === 0) {
    return null;
  }

  const mappedFocusCategory = focusArea ? FOCUS_TO_CATEGORY[focusArea] : null;
  if (mappedFocusCategory) {
    const focusMatch = quests.find((quest) => quest.category === mappedFocusCategory);
    if (focusMatch) {
      return { quest: focusMatch, reason: "focus_area_match" };
    }
  }

  const rotationPick = quests.find((quest) => !completedCategoriesLast7d.has(quest.category));
  if (rotationPick) {
    return { quest: rotationPick, reason: "category_rotation" };
  }

  return { quest: quests[0], reason: "fallback_priority" };
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "today.suggestion.GET" });

  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "today.suggestion.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(userId);
    if (!user) {
      logger.warn("api.today.suggestion.user_not_found", { userId });
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [activeQuests, completedCategories] = await Promise.all([
      fetchPriorityActiveQuests(userId),
      recentlyCompletedCategories(userId, new Date()),
    ]);

    const focusArea = normalizeFocusArea(user.onboardingFocusArea);
    const encouragementStyle = normalizeStyle(user.onboardingEncouragementStyle);
    const selected = pickSuggestion(activeQuests, focusArea, completedCategories);

    if (!selected) {
      logger.info("api.today.suggestion.empty", { userId });
      return NextResponse.json({ suggestion: null });
    }

    const copy = COPY_TABLE[encouragementStyle][selected.reason];

    logger.info("api.today.suggestion.success", { userId, reason: selected.reason });
    return NextResponse.json({
      suggestion: {
        questId: String(selected.quest._id),
        title: selected.quest.title,
        category: selected.quest.category,
        reason: selected.reason,
        encouragementStyle,
        summaryHeadline: copy.summaryHeadline,
        summaryMessage: copy.summaryMessage,
      },
    });
  } catch (error) {
    logRequestException(logger, "api.request.exception", error, { handler: "today.suggestion.GET" });
    return NextResponse.json({ error: "Failed to load next-best quest suggestion" }, { status: 500 });
  }
}
