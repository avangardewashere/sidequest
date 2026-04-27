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
      name: "Weekly Review E2E User",
      email: "weekly-review-e2e@sidequest.test",
      userId: "weekly-review-e2e-user-id",
      sub: "weekly-review-e2e-user-id",
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

test("stats page shows weekly review card", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Weekly Review E2E User", email: "weekly-review-e2e@sidequest.test", image: null },
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
          encouragementStyle: "gentle",
          summaryHeadline: "You're building momentum.",
          summaryMessage: "2 more completions to reach your weekly target this week.",
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

  await expect(page.getByRole("heading", { name: "You're building momentum." })).toBeVisible();
  await expect(page.getByText("71% of weekly target")).toBeVisible();
});
