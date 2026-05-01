import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { QuestModel } from "@/models/Quest";

const querySchema = z.object({
  q: z.string().trim().min(1).max(80),
  kind: z.enum(["all", "tag", "title", "note"]).default("all"),
  limit: z.coerce.number().int().min(1).max(40).default(20),
  cursor: z.string().optional(),
});

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSearchOrConditions(q: string, kind: z.infer<typeof querySchema>["kind"]): Record<string, unknown>[] {
  const trimmed = q.trim();
  const escaped = escapeRegex(trimmed);
  switch (kind) {
    case "title":
      return [{ title: { $regex: escaped, $options: "i" } }];
    case "tag":
      return [{ tags: { $regex: escaped, $options: "i" } }];
    case "note":
      return [{ "notes.body": { $regex: escaped, $options: "i" } }];
    default:
      return [
        { title: { $regex: escaped, $options: "i" } },
        { tags: { $regex: escaped, $options: "i" } },
        { "notes.body": { $regex: escaped, $options: "i" } },
      ];
  }
}

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.search.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.search.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      kind: url.searchParams.get("kind") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor") ?? undefined,
    });
    if (!parsed.success) {
      logger.warn("api.validation.invalid_query", { handler: "quests.search.GET" });
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    if (parsed.data.cursor && !mongoose.Types.ObjectId.isValid(parsed.data.cursor)) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const orConditions = buildSearchOrConditions(parsed.data.q, parsed.data.kind);
    const andClause: Record<string, unknown>[] = [{ createdBy: userId }, { $or: orConditions }];

    if (parsed.data.cursor) {
      andClause.push({ _id: { $lt: new mongoose.Types.ObjectId(parsed.data.cursor) } });
    }

    await connectToDatabase();
    const take = parsed.data.limit + 1;
    const rows = await QuestModel.find({ $and: andClause })
      .sort({ _id: -1 })
      .limit(take)
      .select("_id title description tags")
      .lean();

    const hasMore = rows.length > parsed.data.limit;
    const slice = hasMore ? rows.slice(0, parsed.data.limit) : rows;
    const nextCursor =
      hasMore && slice.length > 0 ? String(slice[slice.length - 1]!._id) : null;

    const quests = slice.map((r) => ({
      _id: String(r._id),
      title: r.title,
      description: typeof r.description === "string" ? r.description : "",
      tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    }));

    logger.info("api.quests.search.success", { count: quests.length, kind: parsed.data.kind });
    return NextResponse.json({ quests, nextCursor });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, { handler: "quests.search.GET" });
    return NextResponse.json({ error: "Failed to search quests" }, { status: 500 });
  }
}
