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

  await expect(
    page.getByRole("heading", { name: /SideQuest Dashboard|Today/i }),
  ).toBeVisible();
}

function extractLevel(levelText: string) {
  const match = levelText.match(/LV\.\s*(\d+)/i);
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

test("protected quest route redirects unauthenticated users to login", async ({ page }) => {
  await installAuthRoutes(page);
  await page.goto("/quests/view");
  await expect(page).toHaveURL(/\/\?callbackUrl=%2Fquests%2Fview/);
  await expect(page.getByRole("heading", { name: "SideQuest" })).toBeVisible();
});

test("protected stats route redirects unauthenticated users to login", async ({ page }) => {
  await installAuthRoutes(page);
  await page.goto("/stats");
  await expect(page).toHaveURL(/\/\?callbackUrl=%2Fstats/);
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
      xpReward: 60,
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
    const levelLabel = page.getByText(/LV\.\s*\d+/).first();
    const beforeText = await levelLabel.textContent();
    const beforeLevel = beforeText ? extractLevel(beforeText) : null;

    await page.goto("/quests/create");
    await page.getByLabel("Quest Title").fill(quest.title);
    await page.getByLabel("Quest Description").fill(quest.description);
    await page.locator("select").first().selectOption(quest.difficulty);
    await page.getByRole("button", { name: "Add Quest" }).click();
    await expect(page.getByText("Quest created successfully.")).toBeVisible();

    await page.goto("/quests/view");
    await expect(page.getByRole("heading", { name: "View Quests" })).toBeVisible();
    const questCard = page.locator("article", { hasText: quest.title }).first();
    await expect(questCard).toBeVisible();
    await questCard.getByRole("button", { name: "Complete" }).click();
    await expect(page.getByText(/Quest complete! \+\d+ XP/)).toBeVisible();

    await page.goto("/");
    expect(beforeLevel).not.toBeNull();
    await expect
      .poll(async () => {
        const afterText = await levelLabel.textContent();
        return afterText ? extractLevel(afterText) : null;
      })
      .toBeGreaterThan(beforeLevel as number);
  });

  test("quest completion is reflected on stats page", async ({ page }) => {
    await addAuthenticatedSessionCookie(page);

    let totalXp = 0;
    let totalCompletions = 0;
    let questStatus: "active" | "completed" = "active";
    const quest = {
      _id: "q-stats",
      title: `Stats Quest ${Date.now()}`,
      description: "Quest to validate stats reflection",
      difficulty: "hard",
      category: "work",
      xpReward: 60,
      status: "active",
    };

    const buildMetricsSummary = () => {
      const today = new Date().toISOString().slice(0, 10);
      const completionsValue = questStatus === "completed" ? 1 : 0;
      return {
        range: "7d",
        rangeDays: 7,
        completionsByDay: Array.from({ length: 7 }, (_, idx) => ({
          date: idx === 6 ? today : `2026-04-${String(20 + idx).padStart(2, "0")}`,
          value: idx === 6 ? completionsValue : 0,
        })),
        xpByDay: Array.from({ length: 7 }, (_, idx) => ({
          date: idx === 6 ? today : `2026-04-${String(20 + idx).padStart(2, "0")}`,
          value: idx === 6 ? totalXp : 0,
        })),
        byCategory: totalCompletions
          ? [{ category: "work", count: totalCompletions, xpTotal: totalXp }]
          : [],
        streakHistory: {
          current: totalCompletions ? 1 : 0,
          longest: totalCompletions ? 1 : 0,
          last7d: Array.from({ length: 7 }, (_, idx) => ({
            date: idx === 6 ? today : `2026-04-${String(20 + idx).padStart(2, "0")}`,
            value: idx === 6 ? 1 : 0,
          })),
        },
        kpis: {
          totalCompletions,
          totalXp,
          avgXpPerCompletion: totalCompletions ? totalXp / totalCompletions : 0,
          avgCompletionsPerDay: Number((totalCompletions / 7).toFixed(1)),
        },
        previousPeriod: {
          totalCompletions: 0,
          totalXp: 0,
          avgXpPerCompletion: 0,
          avgCompletionsPerDay: 0,
        },
        last7Days: {
          questsCreated: 1,
          questsCompleted: totalCompletions,
          xpGained: totalXp,
          dailiesGenerated: 0,
          dailiesClaimed: 0,
          milestoneBonusesGranted: 0,
        },
      };
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
            currentStreak: totalCompletions ? 1 : 0,
            longestStreak: totalCompletions ? 1 : 0,
            xpIntoLevel: totalXp >= 50 ? totalXp - 50 : totalXp,
            xpForNextLevel: totalXp >= 50 ? 150 : 50,
          },
        }),
      );
    });
    await page.route("**/api/metrics/summary**", async (route) => {
      await route.fulfill(asJsonResponse(buildMetricsSummary()));
    });
    await page.route("**/api/quests**", async (route) => {
      const url = route.request().url();
      if (url.includes("/complete")) {
        totalXp += quest.xpReward;
        totalCompletions += 1;
        questStatus = "completed";
        await route.fulfill(
          asJsonResponse({
            quest: {
              ...quest,
              status: "completed",
            },
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
      await route.fulfill(
        asJsonResponse({
          quests: [
            {
              ...quest,
              status: questStatus,
            },
          ],
        }),
      );
    });

    await page.goto("/");
    await page.getByRole("checkbox", { name: `Complete ${quest.title}` }).click();
    await expect(page.getByText("Quest completed")).toBeVisible();

    await page.goto("/stats");
    await expect(page.getByRole("heading", { name: "Progress Stats" })).toBeVisible();

    const completionsCard = page.locator("div").filter({ hasText: "Total completions" }).first();
    const xpCard = page.locator("div").filter({ hasText: "Total XP" }).first();
    await expect(completionsCard).toContainText("1");
    await expect(xpCard).toContainText("60");
  });
});
