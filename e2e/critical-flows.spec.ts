import { encode } from "next-auth/jwt";
import { expect, test, type Page } from "@playwright/test";

function randomUser() {
  const stamp = Date.now();
  return {
    email: `e2e-${stamp}@sidequest.test`,
    password: "password123",
    displayName: `E2E User ${stamp}`,
    questTitle: `E2E Quest ${stamp}`,
  };
}

async function registerAndLogin(page: Page, user: ReturnType<typeof randomUser>) {
  await page.goto("/");
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByPlaceholder("Display name").fill(user.displayName);
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder("Password").fill(user.password);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("heading", { name: "SideQuest Dashboard" })).toBeVisible();
}

function extractTotalXp(summaryText: string) {
  const match = summaryText.match(/\|\s*(\d+)\s*XP/);
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

function asJsonResponse(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

async function installAuthRoutes(page: Page) {
  let authenticated = false;
  const session = {
    user: { name: "E2E User", email: "e2e@sidequest.test", image: null },
    expires: "2099-01-01T00:00:00.000Z",
  };

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(asJsonResponse(authenticated ? session : {}));
  });
  await page.route("**/api/auth/register**", async (route) => {
    await route.fulfill(asJsonResponse({ ok: true }));
  });
  await page.route("**/api/auth/callback/credentials**", async (route) => {
    authenticated = true;
    await route.fulfill(
      asJsonResponse({
        ok: true,
        status: 200,
        error: null,
        url: "http://localhost:3000/",
      }),
    );
  });
  await page.route("**/api/quests", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill(asJsonResponse({ quests: [] }));
      return;
    }
    await route.fulfill(asJsonResponse({ quest: { _id: "q-auth-flow" } }, 201));
  });
  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailies: [] }));
  });
  await page.route("**/api/progression**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "e2e@sidequest.test",
          displayName: "E2E User",
          totalXp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          xpIntoLevel: 0,
          xpForNextLevel: 50,
        },
      }),
    );
  });
}

async function addAuthenticatedSessionCookie(page: Page) {
  const token = await encode({
    token: {
      name: "E2E User",
      email: "e2e@sidequest.test",
      userId: "e2e-user-id",
      sub: "e2e-user-id",
    },
    secret: process.env.AUTH_SECRET ?? "test-auth-secret",
  });
  await page.context().addCookies([
    {
      name: "next-auth.session-token",
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

test("protected quest route redirects unauthenticated users to login", async ({ page }) => {
  await installAuthRoutes(page);
  await page.goto("/quests/view");
  await expect(page).toHaveURL(/\/\?callbackUrl=%2Fquests%2Fview/);
  await expect(page.getByRole("heading", { name: "SideQuest" })).toBeVisible();
});

test.describe.serial("critical authenticated flows", () => {
  test("register -> login -> dashboard redirect", async ({ page }) => {
    await installAuthRoutes(page);
    const user = randomUser();
    await registerAndLogin(page, user);
  });

  test("quest creation -> quest appears in list", async ({ page }) => {
    await addAuthenticatedSessionCookie(page);

    const questTitle = `Created Quest ${Date.now()}`;
    const quests = [
      {
        _id: "q-created",
        title: questTitle,
        description: "Created from e2e test",
        difficulty: "easy",
        category: "work",
        xpReward: 10,
        status: "active",
      },
    ];
    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill(
        asJsonResponse({
          user: { name: "E2E User", email: "e2e@sidequest.test", image: null },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      );
    });
    await page.route("**/api/progression**", async (route) => {
      await route.fulfill(
        asJsonResponse({
          profile: {
            email: "e2e@sidequest.test",
            displayName: "E2E User",
            totalXp: 0,
            level: 1,
            currentStreak: 0,
            longestStreak: 0,
            xpIntoLevel: 0,
            xpForNextLevel: 50,
          },
        }),
      );
    });
    await page.route("**/api/dailies**", async (route) => {
      await route.fulfill(asJsonResponse({ dailies: [] }));
    });
    await page.route("**/api/quests**", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill(asJsonResponse({ quest: quests[0] }, 201));
        return;
      }
      await route.fulfill(asJsonResponse({ quests }));
    });

    await page.goto("/quests/create");
    await expect(page).toHaveURL(/\/quests\/create/);

    await page.getByLabel("Quest Title").fill(questTitle);
    await page.getByLabel("Quest Description").fill("Created from Playwright critical flow");
    await page.getByRole("button", { name: "Add Quest" }).click();

    await expect(page.getByText("Quest created successfully.")).toBeVisible();
    await page.getByRole("link", { name: "View Quests" }).first().click();
    await expect(page).toHaveURL(/\/quests\/view/);
    await expect(page.getByText(questTitle)).toBeVisible();
  });

  test("quest completion updates XP progression", async ({ page }) => {
    await addAuthenticatedSessionCookie(page);

    let totalXp = 0;
    const quest = {
      _id: "q-complete",
      title: `Complete Quest ${Date.now()}`,
      description: "Quest to validate completion XP",
      difficulty: "hard",
      category: "work",
      xpReward: 35,
      status: "active",
    };

    await page.route("**/api/auth/session**", async (route) => {
      await route.fulfill(
        asJsonResponse({
          user: { name: "E2E User", email: "e2e@sidequest.test", image: null },
          expires: "2099-01-01T00:00:00.000Z",
        }),
      );
    });
    await page.route("**/api/dailies**", async (route) => {
      await route.fulfill(asJsonResponse({ dailies: [] }));
    });
    await page.route("**/api/progression**", async (route) => {
      await route.fulfill(
        asJsonResponse({
          profile: {
            email: "e2e@sidequest.test",
            displayName: "E2E User",
            totalXp,
            level: totalXp >= 50 ? 2 : 1,
            currentStreak: 1,
            longestStreak: 1,
            xpIntoLevel: totalXp >= 50 ? totalXp - 50 : totalXp,
            xpForNextLevel: totalXp >= 50 ? 150 : 50,
          },
        }),
      );
    });
    await page.route("**/api/quests**", async (route) => {
      const url = route.request().url();
      if (url.includes("/complete")) {
        totalXp += quest.xpReward;
        quest.status = "completed";
        await route.fulfill(
          asJsonResponse({
            quest,
            progression: {
              totalXp,
              level: totalXp >= 50 ? 2 : 1,
              currentStreak: 1,
              longestStreak: 1,
            },
            xpGained: quest.xpReward,
            milestoneReward: null,
          }),
        );
        return;
      }
      if (route.request().method() === "POST") {
        await route.fulfill(asJsonResponse({ quest }, 201));
        return;
      }
      await route.fulfill(asJsonResponse({ quests: [quest] }));
    });

    await page.goto("/");
    const profileSummary = page.locator("header p").first();
    const beforeText = await profileSummary.textContent();
    const beforeXp = beforeText ? extractTotalXp(beforeText) : null;

    await page.goto("/quests/create");
    await page.getByLabel("Quest Title").fill(quest.title);
    await page.getByLabel("Quest Description").fill(quest.description);
    await page.locator("select").first().selectOption(quest.difficulty);
    await page.getByRole("button", { name: "Add Quest" }).click();
    await expect(page.getByText("Quest created successfully.")).toBeVisible();

    await page.goto("/quests/view");
    const questCard = page.locator("article", { hasText: quest.title }).first();
    await questCard.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Quest complete! \+\d+ XP/)).toBeVisible();

    await page.goto("/");
    expect(beforeXp).not.toBeNull();
    await expect
      .poll(async () => {
        const afterText = await profileSummary.textContent();
        return afterText ? extractTotalXp(afterText) : null;
      })
      .toBeGreaterThan(beforeXp as number);
  });
});
