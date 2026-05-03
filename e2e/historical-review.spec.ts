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
      name: "Historical Review E2E User",
      email: "historical-review-e2e@sidequest.test",
      userId: "historical-review-e2e-user-id",
      sub: "historical-review-e2e-user-id",
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

test("stats page shows historical review card under weekly review", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: {
          name: "Historical Review E2E User",
          email: "historical-review-e2e@sidequest.test",
          image: null,
        },
        expires: "2099-01-01T00:00:00.000Z",
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
            {
              rangeStart: "2026-03-30",
              rangeEnd: "2026-04-05",
              completions: 1,
              weeklyTarget: 5,
              progressPct: 20,
            },
            {
              rangeStart: "2026-04-06",
              rangeEnd: "2026-04-12",
              completions: 2,
              weeklyTarget: 5,
              progressPct: 40,
            },
            {
              rangeStart: "2026-04-13",
              rangeEnd: "2026-04-19",
              completions: 3,
              weeklyTarget: 5,
              progressPct: 60,
            },
            {
              rangeStart: "2026-04-20",
              rangeEnd: "2026-04-26",
              completions: 5,
              weeklyTarget: 5,
              progressPct: 100,
            },
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

  await page.goto("/stats");

  await expect(page.getByRole("heading", { name: "Trending up." })).toBeVisible();
  await expect(page.getByTestId("historical-trend-label")).toHaveText("Trending up");
  await expect(page.getByText("100% of target")).toBeVisible();
  await expect(page.getByText("this week")).toBeVisible();
});
