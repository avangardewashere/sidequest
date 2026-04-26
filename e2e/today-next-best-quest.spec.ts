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
      name: "Today Suggestion E2E User",
      email: "today-suggestion-e2e@sidequest.test",
      userId: "today-suggestion-e2e-user-id",
      sub: "today-suggestion-e2e-user-id",
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

test("today page shows next-best quest card", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: {
          name: "Today Suggestion E2E User",
          email: "today-suggestion-e2e@sidequest.test",
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

  await page.route("**/api/quests?status=active&sort=priority_due**", async (route) => {
    await route.fulfill(asJsonResponse({ quests: [] }));
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
    await route.fulfill(asJsonResponse({ dailies: [], dailyKey: "2026-04-26" }));
  });

  await page.route("**/api/metrics/summary?range=7d**", async (route) => {
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
          questId: "q1",
          title: "Write architecture notes",
          category: "work",
          reason: "focus_area_match",
          encouragementStyle: "direct",
          summaryHeadline: "Focus-area match selected.",
          summaryMessage: "This active quest aligns with your onboarding focus area.",
        },
      }),
    );
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Focus-area match selected." })).toBeVisible();
  await expect(page.getByText("Write architecture notes")).toBeVisible();
  await expect(page.getByTestId("next-best-reason-label")).toHaveText("Focus match");
});
