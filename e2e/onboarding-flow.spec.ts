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
      name: "Onboarding E2E User",
      email: "onboarding-e2e@sidequest.test",
      userId: "onboarding-e2e-user-id",
      sub: "onboarding-e2e-user-id",
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

test("onboarding first-run flow completes and returns to home", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  let onboardingCompleted = false;

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Onboarding E2E User", email: "onboarding-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/onboarding", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(
        asJsonResponse({
          onboarding: onboardingCompleted
            ? {
                completed: true,
                completedAt: new Date().toISOString(),
                focusArea: "work",
                weeklyTarget: 5,
                encouragementStyle: "gentle",
              }
            : {
                completed: false,
                completedAt: null,
                focusArea: null,
                weeklyTarget: null,
                encouragementStyle: null,
              },
        }),
      );
      return;
    }
    onboardingCompleted = true;
    await route.fulfill(
      asJsonResponse({
        onboarding: {
          completed: true,
          completedAt: new Date().toISOString(),
          focusArea: "work",
          weeklyTarget: 5,
          encouragementStyle: "gentle",
        },
      }),
    );
  });

  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "onboarding-e2e@sidequest.test",
          displayName: "Onboarding E2E User",
          totalXp: 10,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          xpIntoLevel: 10,
          xpForNextLevel: 90,
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
        kpis: {
          totalCompletions: 0,
          totalXp: 0,
          avgXpPerCompletion: 0,
          avgCompletionsPerDay: 0,
          focusMinutesLast7d: 0,
        },
      }),
    );
  });
  await page.route("**/api/focus/active", async (route) => {
    await route.fulfill(asJsonResponse({ session: null }));
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("button", { name: "Complete onboarding" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText("No active quest yet")).toBeVisible();
});
