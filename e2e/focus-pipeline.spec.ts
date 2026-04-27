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
      name: "Focus E2E User",
      email: "focus-e2e@sidequest.test",
      userId: "focus-e2e-user-id",
      sub: "focus-e2e-user-id",
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

test("focus start/stop updates stats strip focus minutes", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  let hasActiveSession = false;
  let focusMinutes = 0;
  const quest = {
    _id: "focus-quest-1",
    title: "Deep focus task",
    description: "Work on a single important task",
    difficulty: "hard",
    category: "work",
    xpReward: 50,
    status: "active",
  };

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Focus E2E User", email: "focus-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });
  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "focus-e2e@sidequest.test",
          displayName: "Focus E2E User",
          totalXp: 100,
          level: 2,
          currentStreak: 2,
          longestStreak: 4,
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
    await route.fulfill(
      asJsonResponse({
        kpis: { focusMinutesLast7d: focusMinutes },
      }),
    );
  });
  await page.route("**/api/focus/active", async (route) => {
    await route.fulfill(
      asJsonResponse({
        session: hasActiveSession
          ? { _id: "focus-session-1", startedAt: new Date().toISOString(), questId: quest._id }
          : null,
      }),
    );
  });
  await page.route("**/api/focus/start", async (route) => {
    hasActiveSession = true;
    await route.fulfill(
      asJsonResponse(
        {
          session: { _id: "focus-session-1", startedAt: new Date().toISOString(), questId: quest._id },
        },
        201,
      ),
    );
  });
  await page.route("**/api/focus/stop", async (route) => {
    hasActiveSession = false;
    focusMinutes = 1;
    await route.fulfill(
      asJsonResponse({
        session: {
          _id: "focus-session-1",
          startedAt: new Date(Date.now() - 60_000).toISOString(),
          endedAt: new Date().toISOString(),
          durationSec: 60,
          questId: quest._id,
        },
      }),
    );
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Start focus" })).toBeVisible();
  await page.getByRole("button", { name: "Start focus" }).click();
  await expect(page.getByText("Focus in progress")).toBeVisible();
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByText("Focus in progress")).not.toBeVisible();
  await expect(page.getByText("1m")).toBeVisible();
});
