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
      name: "Pomodoro E2E User",
      email: "pomodoro-e2e@sidequest.test",
      userId: "pomodoro-e2e-user-id",
      sub: "pomodoro-e2e-user-id",
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

test("pomodoro panel starts and stops without regressions", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  const quest = {
    _id: "pomodoro-quest-1",
    title: "Pomodoro task",
    description: "Do focused work",
    difficulty: "hard",
    category: "work",
    xpReward: 40,
    status: "active",
  };

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Pomodoro E2E User", email: "pomodoro-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });
  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "pomodoro-e2e@sidequest.test",
          displayName: "Pomodoro E2E User",
          totalXp: 120,
          level: 3,
          currentStreak: 2,
          longestStreak: 6,
          xpIntoLevel: 20,
          xpForNextLevel: 80,
        },
      }),
    );
  });
  await page.route("**/api/quests?status=active&sort=priority_due**", async (route) => {
    await route.fulfill(asJsonResponse({ quests: [quest] }));
  });
  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailyKey: "2026-04-26", dailies: [] }));
  });
  await page.route("**/api/metrics/summary?range=7d**", async (route) => {
    await route.fulfill(asJsonResponse({ kpis: { focusMinutesLast7d: 0 } }));
  });
  await page.route("**/api/focus/active", async (route) => {
    await route.fulfill(asJsonResponse({ session: null }));
  });
  await page.route("**/api/focus/start", async (route) => {
    await route.fulfill(
      asJsonResponse(
        {
          session: { _id: "focus-pomodoro-1", startedAt: new Date().toISOString(), questId: quest._id },
        },
        201,
      ),
    );
  });
  await page.route("**/api/focus/stop", async (route) => {
    await route.fulfill(
      asJsonResponse({
        session: {
          _id: "focus-pomodoro-1",
          startedAt: new Date(Date.now() - 10_000).toISOString(),
          endedAt: new Date().toISOString(),
          durationSec: 10,
          questId: quest._id,
        },
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start cycle" })).toBeVisible();
  await page.getByRole("button", { name: "Start cycle" }).click();
  await expect(page.getByText("Focus in progress")).toBeVisible();
  await page.getByRole("button", { name: "Stop cycle" }).click();
  await expect(page.getByText("Idle", { exact: true })).toBeVisible();
});
