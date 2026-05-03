import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import {
  isDueToday,
  normalizeQuestCadence,
  streakFromLogs,
  toUtcDateKey,
  type CompletionHistoryPoint,
} from "@/lib/cadence";
import { isHabitQuest } from "@/lib/quest-selectors";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import {
  currentWeekMondayUtcKey,
  isUtcMonday,
  previousWeekMondayUtcKey,
  reflectionPreview,
} from "@/lib/reflection-week";
import { CompletionLogModel } from "@/models/CompletionLog";
import { QuestModel } from "@/models/Quest";
import { WeeklyReflectionModel } from "@/models/WeeklyReflection";
import type { Quest } from "@/types/dashboard";
import type { TodayHabitSurfacePayload, TodayHabitSurfaceRow } from "@/types/today-dashboard";

type LeanQuest = Record<string, unknown> & { _id: mongoose.Types.ObjectId | string };

function questFromLean(doc: LeanQuest): Quest {
  const due = doc.dueDate;
  const completedAt = doc.completedAt;
  const createdAt = doc.createdAt;
  return {
    _id: String(doc._id),
    title: String(doc.title ?? ""),
    description: String(doc.description ?? ""),
    difficulty: doc.difficulty as Quest["difficulty"],
    category: doc.category as Quest["category"],
    xpReward: typeof doc.xpReward === "number" ? doc.xpReward : 0,
    status: doc.status === "completed" ? "completed" : "active",
    dueDate:
      due instanceof Date
        ? due.toISOString()
        : due
          ? String(due)
          : null,
    isDaily:
      normalizeQuestCadence({
        cadence: doc.cadence as Quest["cadence"],
        isDaily: Boolean(doc.isDaily),
      }).kind === "daily",
    dailyKey: doc.dailyKey != null ? String(doc.dailyKey) : null,
    parentQuestId: doc.parentQuestId ? String(doc.parentQuestId) : null,
    cadence: doc.cadence as Quest["cadence"] | undefined,
    lastCompletedDate: doc.lastCompletedDate != null ? String(doc.lastCompletedDate) : null,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]).map(String) : undefined,
    completedAt:
      completedAt instanceof Date
        ? completedAt.toISOString()
        : completedAt
          ? String(completedAt)
          : undefined,
    createdAt:
      createdAt instanceof Date
        ? createdAt.toISOString()
        : createdAt
          ? String(createdAt)
          : undefined,
  };
}

export async function GET(req: Request) {
  const logger = createRequestLogger(req);
  logger.info("api.request.start", { handler: "today.habitSurface.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "today.habitSurface.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const todayKey = toUtcDateKey(now);

    const weekAgo = new Date(now);
    weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

    const activeLean = await QuestModel.find({ createdBy: userId, status: "active" })
      .select(
        "_id title description difficulty category xpReward status dueDate isDaily dailyKey parentQuestId cadence lastCompletedDate tags completedAt createdAt",
      )
      .lean();

    const activeQuests = activeLean.map((d) => questFromLean(d as LeanQuest));

    const captured = activeQuests
      .filter((q) => normalizeQuestCadence(q).kind === "oneoff")
      .filter((q) => !(q.tags && q.tags.length > 0))
      .filter((q) => {
        if (!q.createdAt) return false;
        const t = Date.parse(q.createdAt);
        return !Number.isNaN(t) && t >= weekAgo.getTime();
      })
      .sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!))
      .slice(0, 10);

    const habitDocs = activeLean.filter((d) => isHabitQuest(questFromLean(d as LeanQuest)));
    const habitIds = habitDocs.map((d) => d._id as mongoose.Types.ObjectId);

    const logsByQuest = new Map<string, CompletionHistoryPoint[]>();
    if (habitIds.length > 0) {
      const logs = await CompletionLogModel.find({
        userId: userObjectId,
        questId: { $in: habitIds },
      })
        .select("questId completionDate xpEarned")
        .sort({ completionDate: -1 })
        .limit(8000)
        .lean();

      for (const row of logs) {
        const qid = String(row.questId);
        const pt: CompletionHistoryPoint = {
          completionDate: String(row.completionDate),
          xpEarned: typeof row.xpEarned === "number" ? row.xpEarned : 0,
        };
        const arr = logsByQuest.get(qid) ?? [];
        arr.push(pt);
        logsByQuest.set(qid, arr);
      }
    }

    const habitsDue: TodayHabitSurfaceRow[] = [];
    for (const doc of habitDocs) {
      const quest = questFromLean(doc as LeanQuest);
      const cadence = normalizeQuestCadence(quest);
      const points = logsByQuest.get(quest._id) ?? [];
      const streak = streakFromLogs(points, cadence);
      const completedTodayUtc = points.some((p) => p.completionDate === todayKey);
      const due = isDueToday(quest, now) && !completedTodayUtc;
      if (due) {
        habitsDue.push({ quest, streak, completedTodayUtc });
      }
    }

    const atRisk: TodayHabitSurfaceRow[] = habitsDue.filter((r) => r.streak >= 3);

    let mondayReflectionCallout: TodayHabitSurfacePayload["mondayReflectionCallout"] = null;
    if (isUtcMonday(now)) {
      const thisMonday = currentWeekMondayUtcKey(now);
      const priorMonday = previousWeekMondayUtcKey(thisMonday);
      const priorReflection = await WeeklyReflectionModel.findOne({
        userId: userObjectId,
        weekStartUtc: priorMonday,
      })
        .select("wentWell didntGoWell nextWeekFocus")
        .lean();
      if (priorReflection) {
        const pieces = [priorReflection.wentWell, priorReflection.didntGoWell, priorReflection.nextWeekFocus]
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean);
        const preview =
          reflectionPreview(pieces[0] ?? "") ||
          reflectionPreview(pieces[1] ?? "") ||
          reflectionPreview(pieces[2] ?? "");
        if (preview) {
          mondayReflectionCallout = { weekStartUtc: priorMonday, preview };
        }
      }
    }

    const payload: TodayHabitSurfacePayload = {
      habitsDue,
      atRisk,
      captured,
      mondayReflectionCallout,
    };

    logger.info("api.today.habitSurface.success", {
      habitsDue: habitsDue.length,
      atRisk: atRisk.length,
      captured: captured.length,
    });
    return NextResponse.json(payload);
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "today.habitSurface.GET" });
    return NextResponse.json({ error: "Failed to load habit surface" }, { status: 500 });
  }
}
