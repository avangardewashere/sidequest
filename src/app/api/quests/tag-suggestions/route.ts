import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { createRequestLogger, logRequestException } from "@/lib/server-logger";
import { userTagSuggestions } from "@/lib/quest-tags";

const querySchema = z.object({
  prefix: z.string().trim().max(32).default(""),
});

export async function GET(request: Request) {
  const logger = createRequestLogger(request);
  logger.info("api.request.start", { handler: "quests.tag-suggestions.GET" });
  try {
    const session = await getAuthSession();
    const userId = session?.user?.id;
    if (!userId) {
      logger.warn("api.auth.unauthorized", { handler: "quests.tag-suggestions.GET" });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsed = querySchema.safeParse({ prefix: url.searchParams.get("prefix") ?? "" });
    if (!parsed.success) {
      logger.warn("api.validation.invalid_query", { handler: "quests.tag-suggestions.GET" });
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    await connectToDatabase();
    const suggestions = await userTagSuggestions(userId, parsed.data.prefix);

    logger.info("api.quests.tag-suggestions.success", { count: suggestions.length });
    return NextResponse.json({ suggestions });
  } catch (error: unknown) {
    logRequestException(logger, "api.request.exception", error, {
      handler: "quests.tag-suggestions.GET",
    });
    return NextResponse.json({ error: "Failed to load tag suggestions" }, { status: 500 });
  }
}
