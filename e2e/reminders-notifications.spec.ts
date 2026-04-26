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
      name: "Reminder E2E User",
      email: "reminder-e2e@sidequest.test",
      userId: "reminder-e2e-user-id",
      sub: "reminder-e2e-user-id",
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

test("you page saves local reminder settings", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Reminder E2E User", email: "reminder-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/you/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(
        asJsonResponse({
          profile: {
            email: "reminder-e2e@sidequest.test",
            displayName: "Reminder E2E User",
            level: 5,
            totalXp: 640,
            currentStreak: 6,
            longestStreak: 11,
            reminders: {
              enabled: false,
              timeLocal: null,
              days: [1, 2, 3, 4, 5],
              lastFiredOn: null,
            },
          },
        }),
      );
      return;
    }

    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "reminder-e2e@sidequest.test",
          displayName: "Reminder E2E User",
          level: 5,
          totalXp: 640,
          currentStreak: 6,
          longestStreak: 11,
          reminders: {
            enabled: true,
            timeLocal: "19:30",
            days: [1, 3, 5],
            lastFiredOn: null,
          },
        },
      }),
    );
  });

  await page.goto("/you");
  await expect(page.getByRole("heading", { name: "You" })).toBeVisible();

  await page.getByLabel("Enable reminders").check();
  await page.getByLabel("Reminder time").fill("19:30");
  await page.getByRole("button", { name: "Mon" }).click();
  await page.getByRole("button", { name: "Wed" }).click();
  await page.getByRole("button", { name: "Fri" }).click();
  await page.getByRole("button", { name: "Save reminders" }).click();

  await expect(page.getByText("Reminders saved")).toBeVisible();
});
