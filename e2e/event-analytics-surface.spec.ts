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
      name: "Event Analytics E2E User",
      email: "event-analytics-e2e@sidequest.test",
      userId: "event-analytics-e2e-user-id",
      sub: "event-analytics-e2e-user-id",
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

test("stats page renders the event analytics card with derived metrics", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: {
          name: "Event Analytics E2E User",
          email: "event-analytics-e2e@sidequest.test",
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
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

  await page.route("**/api/quests**", async (route) => {
    await route.fulfill(asJsonResponse({ quests: [] }));
  });

  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailies: [], dailyKey: "2026-04-27" }));
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

  await page.route("**/api/events", async (route) => {
    await route.fulfill(
      asJsonResponse({
        event: {
          id: "evt-stub",
          name: "weekly_review_viewed",
          createdAt: "2026-04-27T00:00:00.000Z",
        },
      }),
    );
  });

  await page.route("**/api/events/analytics**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        analytics: {
          range: "7d",
          rangeDays: 7,
          totalEvents: 7,
          byName: {
            weekly_review_viewed: 1,
            historical_review_viewed: 1,
            suggestion_viewed: 2,
            suggestion_clicked: 1,
            quest_completed: 2,
          },
          reviewViews: 2,
          suggestionViews: 2,
          suggestionClicks: 1,
          suggestionClickRatePct: 50,
          questCompletionsAfterSuggestionView: 2,
          latestEventAt: "2026-04-22T08:30:00.000Z",
        },
      }),
    );
  });

  await page.goto("/stats");

  await expect(page.getByTestId("event-analytics-card")).toBeVisible();
  await expect(page.getByTestId("event-analytics-range")).toHaveText("Last 7 days");
  await expect(page.getByTestId("event-analytics-total")).toHaveText("7 total events recorded.");
  await expect(page.getByTestId("event-analytics-ctr")).toHaveText("50%");
  await expect(page.getByTestId("event-analytics-quests-after-view")).toHaveText("2");
  await expect(page.getByTestId("event-analytics-latest")).toHaveText(
    "Latest event 2026-04-22 08:30 UTC",
  );
});
