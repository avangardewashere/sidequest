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
      name: "You E2E User",
      email: "you-e2e@sidequest.test",
      userId: "you-e2e-user-id",
      sub: "you-e2e-user-id",
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

test("you page supports baseline profile save flow", async ({ page }) => {
  await addAuthenticatedSessionCookie(page);

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "You E2E User", email: "you-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/you/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(
        asJsonResponse({
          profile: {
            email: "you-e2e@sidequest.test",
            displayName: "You E2E User",
            level: 4,
            totalXp: 320,
            currentStreak: 3,
            longestStreak: 9,
          },
        }),
      );
      return;
    }

    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "you-e2e@sidequest.test",
          displayName: "Renamed User",
          level: 4,
          totalXp: 320,
          currentStreak: 3,
          longestStreak: 9,
        },
      }),
    );
  });

  await page.goto("/you");
  await expect(page.getByRole("heading", { name: "You" })).toBeVisible();
  await expect(page.getByText("You E2E User")).toBeVisible();

  await page.getByLabel("Display name").fill("Renamed User");
  await page.getByRole("button", { name: "Save profile" }).click();

  await expect(page.getByText("Renamed User")).toBeVisible();
});
