import { encode } from "next-auth/jwt";
import { expect, test } from "@playwright/test";

function asJsonResponse(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

async function addAuthenticatedSessionCookie(page: import("@playwright/test").Page) {
  const token = await encode({
    token: {
      name: "Behavior Event E2E User",
      email: "behavior-events-e2e@sidequest.test",
      userId: "behavior-events-e2e-user-id",
      sub: "behavior-events-e2e-user-id",
    },
    secret: process.env.AUTH_SECRET ?? "test-auth-secret",
  });
  const cookieNames = ["next-auth.session-token", "authjs.session-token"];
  await page.context().addCookies(
    cookieNames.map((name) => ({
      name,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax" as const,
    })),
  );
}

test("stats and today emit behavior events", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  const seenEventNames: string[] = [];

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: {
          name: "Behavior Event E2E User",
          email: "behavior-events-e2e@sidequest.test",
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/events", async (route) => {
    const body = route.request().postDataJSON() as { name?: string };
    if (body?.name) {
      seenEventNames.push(body.name);
    }
    await route.fulfill(
      asJsonResponse({
        event: {
          id: `evt-${seenEventNames.length}`,
          name: body?.name ?? "unknown",
          createdAt: "2026-04-27T00:00:00.000Z",
        },
      }),
    );
  });

  await page.route("**/api/review/weekly", async (route) => {
    await route.fulfill(
      asJsonResponse({
        weeklyReview: {
          rangeStart: "2026-04-20",
          rangeEnd: "2026-04-26",
          completionsLast7d: 5,
          weeklyTarget: 7,
          progressPct: 71,
          encouragementStyle: "direct",
          summaryHeadline: "2 to goal.",
          summaryMessage: "You have 2 completions left to hit your weekly target.",
        },
        reflectionWeekStartUtc: "2026-04-20",
        currentWeekReflection: null,
        priorWeekReflection: null,
      }),
    );
  });

  await page.route("**/api/review/historical**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        historicalReview: {
          weeks: [
            { rangeStart: "2026-03-30", rangeEnd: "2026-04-05", completions: 1, weeklyTarget: 5, progressPct: 20 },
            { rangeStart: "2026-04-06", rangeEnd: "2026-04-12", completions: 2, weeklyTarget: 5, progressPct: 40 },
            { rangeStart: "2026-04-13", rangeEnd: "2026-04-19", completions: 3, weeklyTarget: 5, progressPct: 60 },
            { rangeStart: "2026-04-20", rangeEnd: "2026-04-26", completions: 5, weeklyTarget: 5, progressPct: 100 },
          ],
          trend: "rising",
          encouragementStyle: "direct",
          summaryHeadline: "Trending up.",
          summaryMessage: "This week beat your prior 3-week average. Keep the cadence.",
        },
      }),
    );
  });

  await page.route("**/api/onboarding", async (route) => {
    await route.fulfill(
      asJsonResponse({
        onboarding: {
          completed: true,
          completedAt: "2026-04-20T00:00:00.000Z",
          focusArea: "work",
          weeklyTarget: 5,
          encouragementStyle: "direct",
        },
      }),
    );
  });

  await page.route("**/api/quests?status=active&sort=priority_due**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        quests: [
          {
            _id: "quest-1",
            title: "Prepare sprint recap",
            description: "",
            difficulty: "medium",
            category: "work",
            xpReward: 30,
            status: "active",
            dueDate: null,
            isDaily: false,
            dailyKey: null,
          },
        ],
      }),
    );
  });

  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          displayName: "Tester",
          totalXp: 100,
          level: 2,
          currentStreak: 1,
          longestStreak: 2,
          xpIntoLevel: 10,
          xpForNextLevel: 50,
        },
      }),
    );
  });

  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailies: [], dailyKey: "2026-04-27" }));
  });

  await page.route("**/api/metrics/summary**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        range: "7d",
        rangeDays: 7,
        completionsByDay: [],
        xpByDay: [],
        byCategory: [],
        streakHistory: { current: 0, longest: 0, last7d: [] },
        kpis: {
          totalCompletions: 0,
          totalXp: 0,
          avgXpPerCompletion: 0,
          avgCompletionsPerDay: 0,
          focusMinutesLast7d: 0,
        },
        previousPeriod: {
          totalCompletions: 0,
          totalXp: 0,
          avgXpPerCompletion: 0,
          avgCompletionsPerDay: 0,
        },
      }),
    );
  });

  await page.route("**/api/today/suggestion**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        suggestion: {
          questId: "quest-1",
          title: "Prepare sprint recap",
          category: "work",
          reason: "focus_area_match",
          encouragementStyle: "direct",
          summaryHeadline: "Focus-area match selected.",
          summaryMessage: "This active quest aligns with your onboarding focus area.",
        },
      }),
    );
  });

  await page.route("**/api/quests/quest-1/complete**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        xpGained: 30,
      }),
    );
  });

  await page.goto("/stats");
  await expect(page.getByRole("heading", { name: "Trending up." })).toBeVisible();

  await expect.poll(() => seenEventNames.filter((name) => name === "weekly_review_viewed").length).toBeGreaterThan(0);
  await expect
    .poll(() => seenEventNames.filter((name) => name === "historical_review_viewed").length)
    .toBeGreaterThan(0);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Focus-area match selected." })).toBeVisible();

  await expect.poll(() => seenEventNames.filter((name) => name === "suggestion_viewed").length).toBeGreaterThan(0);

  await page.getByLabel("Complete Prepare sprint recap").check();
  await expect.poll(() => seenEventNames.filter((name) => name === "quest_completed").length).toBeGreaterThan(0);
});
