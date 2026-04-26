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
      name: "Tabs E2E User",
      email: "tabs-e2e@sidequest.test",
      userId: "tabs-e2e-user-id",
      sub: "tabs-e2e-user-id",
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

test("bottom tabs navigate across app routes", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Tabs E2E User", email: "tabs-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });
  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "tabs-e2e@sidequest.test",
          displayName: "Tabs E2E User",
          totalXp: 90,
          level: 2,
          currentStreak: 1,
          longestStreak: 2,
          xpIntoLevel: 40,
          xpForNextLevel: 80,
        },
      }),
    );
  });
  await page.route("**/api/quests?status=active&sort=priority_due**", async (route) => {
    await route.fulfill(asJsonResponse({ quests: [] }));
  });
  await page.route("**/api/quests**", async (route) => {
    await route.fulfill(asJsonResponse({ quests: [] }));
  });
  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailyKey: "2026-04-26", dailies: [] }));
  });
  await page.route("**/api/metrics/summary**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        range: "7d",
        rangeDays: 7,
        completionsByDay: [],
        xpByDay: [],
        byCategory: [],
        streakHistory: { current: 1, longest: 2, last7d: [] },
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
        last7Days: {
          questsCreated: 0,
          questsCompleted: 0,
          completionRate: 0,
          dailyQuestsCreated: 0,
          dailyQuestsCompleted: 0,
          dailyCompletionRate: 0,
          milestoneRewardsTriggered: 0,
          avgXpPerCompletion: 0,
          totalXpFromCompletions: 0,
          completionEvents: 0,
        },
      }),
    );
  });
  await page.route("**/api/focus/active", async (route) => {
    await route.fulfill(asJsonResponse({ session: null }));
  });
  await page.route("**/api/focus/start", async (route) => {
    await route.fulfill(
      asJsonResponse({ session: { _id: "focus-1", startedAt: new Date().toISOString(), questId: null } }, 201),
    );
  });
  await page.route("**/api/focus/stop", async (route) => {
    await route.fulfill(
      asJsonResponse({
        session: {
          _id: "focus-1",
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString(),
          durationSec: 0,
          questId: null,
        },
      }),
    );
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Stats" }).click();
  await expect(page).toHaveURL(/\/stats/);

  await page.getByRole("link", { name: "You" }).click();
  await expect(page).toHaveURL(/\/you/);
  await expect(page.getByRole("heading", { name: "You" })).toBeVisible();

  await page.getByRole("link", { name: "Quests" }).click();
  await expect(page).toHaveURL(/\/quests\/view/);

  await page.getByRole("link", { name: "Today" }).click();
  await expect(page).toHaveURL(/\/$/);
});
