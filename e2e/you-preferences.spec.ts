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
      name: "You Preferences E2E User",
      email: "you-preferences-e2e@sidequest.test",
      userId: "you-preferences-e2e-user-id",
      sub: "you-preferences-e2e-user-id",
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

test("you page loads and saves personalization preferences", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "You Preferences E2E User", email: "you-preferences-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/you/profile", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "you-preferences-e2e@sidequest.test",
          displayName: "You Preferences E2E User",
          level: 4,
          totalXp: 320,
          currentStreak: 3,
          longestStreak: 9,
          reminders: {
            enabled: false,
            timeLocal: null,
            days: [1, 2, 3, 4, 5],
            lastFiredOn: null,
          },
        },
      }),
    );
  });

  let onboardingPayload = {
    completed: true,
    completedAt: "2026-04-20T00:00:00.000Z",
    focusArea: "work",
    weeklyTarget: 5,
    encouragementStyle: "gentle",
  };

  await page.route("**/api/onboarding", async (route) => {
    await route.fulfill(asJsonResponse({ onboarding: onboardingPayload }));
  });

  await page.route("**/api/you/preferences", async (route) => {
    const payload = route.request().postDataJSON() as {
      focusArea: "work" | "health" | "learning" | "life";
      weeklyTarget: number;
      encouragementStyle: "gentle" | "direct" | "celebration";
    };
    onboardingPayload = {
      ...onboardingPayload,
      focusArea: payload.focusArea,
      weeklyTarget: payload.weeklyTarget,
      encouragementStyle: payload.encouragementStyle,
    };
    await route.fulfill(asJsonResponse({ onboarding: onboardingPayload }));
  });

  await page.goto("/you");
  await expect(page.getByRole("heading", { name: "Personalization preferences" })).toBeVisible();
  await expect(page.getByLabel("Weekly target")).toHaveValue("5");

  await page.getByRole("button", { name: "Learning" }).click();
  await page.getByLabel("Weekly target").fill("8");
  await page.getByRole("button", { name: "Direct" }).click();
  await page.getByRole("button", { name: "Save preferences" }).click();

  await expect(page.getByText("Preferences updated")).toBeVisible();
  await expect(page.getByLabel("Weekly target")).toHaveValue("8");

  await page.reload();
  await expect(page.getByLabel("Weekly target")).toHaveValue("8");
});
