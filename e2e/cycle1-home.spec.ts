import { encode } from "next-auth/jwt";
import { expect, test, type Page } from "@playwright/test";

type QuestFixture = {
  _id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: "work" | "study" | "health" | "personal" | "other";
  xpReward: number;
  status: "active" | "completed";
  dueDate?: string | null;
  isDaily?: boolean;
  dailyKey?: string | null;
};

function asJsonResponse(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  };
}

async function addAuthenticatedSessionCookie(page: Page) {
  const token = await encode({
    token: {
      name: "Cycle1 E2E",
      email: "cycle1-e2e@sidequest.test",
      userId: "cycle1-e2e-user-id",
      sub: "cycle1-e2e-user-id",
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

type HomeMockOptions = {
  activeQuests?: QuestFixture[];
  dailies?: QuestFixture[];
  delayedQuestsMs?: number;
  failProgressionNetwork?: boolean;
  progressionLevel?: number;
};

async function installHomeMocks(page: Page, options: HomeMockOptions = {}) {
  const activeQuests = options.activeQuests ?? [];
  const dailies = options.dailies ?? [];
  let level = options.progressionLevel ?? 5;
  let currentXp = 20;

  await page.route("**/api/auth/session**", async (route) => {
    await route.fulfill(
      asJsonResponse({
        user: { name: "Cycle1 E2E", email: "cycle1-e2e@sidequest.test", image: null },
        expires: "2099-01-01T00:00:00.000Z",
      }),
    );
  });

  await page.route("**/api/progression**", async (route) => {
    if (options.failProgressionNetwork) {
      await route.abort("failed");
      return;
    }
    await route.fulfill(
      asJsonResponse({
        profile: {
          email: "cycle1-e2e@sidequest.test",
          displayName: "Cycle1 E2E",
          totalXp: level * 100,
          level,
          currentStreak: 3,
          longestStreak: 7,
          xpIntoLevel: currentXp,
          xpForNextLevel: 100,
        },
      }),
    );
  });

  await page.route("**/api/dailies**", async (route) => {
    await route.fulfill(asJsonResponse({ dailyKey: "2026-04-25", dailies }));
  });

  await page.route("**/api/quests?status=active&sort=priority_due", async (route) => {
    if (options.delayedQuestsMs && options.delayedQuestsMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayedQuestsMs));
    }
    await route.fulfill(asJsonResponse({ quests: activeQuests }));
  });

  await page.route("**/api/quests/*/complete", async (route) => {
    const url = route.request().url();
    const id = url.split("/").slice(-2, -1)[0] ?? "unknown";
    const match = activeQuests.find((q) => q._id === id);
    if (!match) {
      await route.fulfill(asJsonResponse({ error: "Quest not found" }, 404));
      return;
    }
    match.status = "completed";
    currentXp += match.xpReward;
    if (currentXp >= 100) {
      level += 1;
      currentXp = currentXp - 100;
    }
    await route.fulfill(asJsonResponse({ xpGained: match.xpReward }, 200));
  });

  await page.route("**/api/quests", async (route) => {
    if (route.request().method() === "POST") {
      const payload = (await route.request().postDataJSON()) as { title?: string; difficulty?: QuestFixture["difficulty"] };
      const created: QuestFixture = {
        _id: `created-${Date.now()}`,
        title: payload.title ?? "Created from E2E",
        description: "Created from quick-add E2E test",
        difficulty: payload.difficulty ?? "medium",
        category: "personal",
        xpReward: payload.difficulty === "hard" ? 35 : payload.difficulty === "easy" ? 10 : 20,
        status: "active",
      };
      activeQuests.push(created);
      await route.fulfill(asJsonResponse({ quest: created }, 201));
      return;
    }
    await route.fulfill(asJsonResponse({ quests: activeQuests }));
  });

  await page.route("**/api/quests/*", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    const id = route.request().url().split("/").at(-1) ?? "";
    const found = activeQuests.find((q) => q._id === id) ?? {
      _id: id,
      title: "Quest Detail",
      description: "Loaded in mocked edit page",
      difficulty: "medium" as const,
      category: "work" as const,
      xpReward: 20,
      status: "active" as const,
    };
    await route.fulfill(asJsonResponse({ quest: found }));
  });
}

test.describe.serial("cycle 1 home flows (mocked)", () => {
  test.beforeEach(async ({ page }) => {
    await addAuthenticatedSessionCookie(page);
  });

  test("renders home from mocked snapshot and applies sorted list order", async ({ page }) => {
    await installHomeMocks(page, {
      activeQuests: [
        {
          _id: "medium-late",
          title: "Medium Late",
          description: "d",
          difficulty: "medium",
          category: "work",
          xpReward: 20,
          status: "active",
          dueDate: "2030-02-01T00:00:00.000Z",
        },
        {
          _id: "hard-soon",
          title: "Hard Soon",
          description: "d",
          difficulty: "hard",
          category: "work",
          xpReward: 25,
          status: "active",
          dueDate: "2030-01-01T00:00:00.000Z",
        },
      ],
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
    await expect(page.getByText("TODAY QUEUE")).toBeVisible();

    const inProgressSection = page.locator("section", { hasText: "IN PROGRESS" }).first();
    const rowTitles = await inProgressSection.locator("button.min-w-0.flex-1.text-left p.truncate").allTextContents();
    expect(rowTitles[0]).toContain("Hard Soon");
    expect(rowTitles[1]).toContain("Medium Late");
  });

  test("shows 3-row list skeleton on delayed cold load", async ({ page }) => {
    await installHomeMocks(page, {
      delayedQuestsMs: 900,
      activeQuests: [
        {
          _id: "q1",
          title: "Q1",
          description: "d",
          difficulty: "easy",
          category: "work",
          xpReward: 10,
          status: "active",
        },
      ],
    });

    await page.goto("/");
    await expect(page.locator("div.rounded-lg.border.px-3.py-3")).toHaveCount(3);
    await expect(page.getByText("IN PROGRESS")).toBeVisible();
  });

  test("task row click targets quest edit route (direct or auth-redirect callback)", async ({ page }) => {
    await installHomeMocks(page, {
      activeQuests: [
        {
          _id: "q-nav",
          title: "Navigate Me",
          description: "d",
          difficulty: "medium",
          category: "work",
          xpReward: 20,
          status: "active",
        },
      ],
    });

    await page.goto("/");
    await page.getByRole("button", { name: /Navigate Me/i }).click();
    await expect(page).toHaveURL(/(\/quests\/q-nav\/edit$|callbackUrl=%2Fquests%2Fq-nav%2Fedit)/);
  });

  test("completion optimistic flow and quick-add form work from home", async ({ page }) => {
    await installHomeMocks(page, {
      activeQuests: [
        {
          _id: "q-complete",
          title: "Complete Me",
          description: "d",
          difficulty: "hard",
          category: "work",
          xpReward: 35,
          status: "active",
        },
      ],
    });

    await page.goto("/");
    await page.getByLabel("Complete Complete Me").click();
    await expect(page.getByRole("button", { name: /Complete Me/i })).toBeVisible();

    await page.getByLabel("Quick add quest").click();
    const quickAddSheet = page.locator("div").filter({ has: page.getByRole("heading", { name: "Quick add quest" }) }).first();
    await expect(page.getByRole("heading", { name: "Quick add quest" })).toBeVisible();
    await page.getByLabel("Title").fill("From Home Quick Add");
    await quickAddSheet.getByRole("button", { name: "hard", exact: true }).click();
    await page.getByRole("button", { name: "Create quest" }).click();

    await expect(page.getByRole("heading", { name: "Quick add quest" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /From Home Quick Add/i })).toBeVisible();
  });

  test("uses last-known local cache snapshot when network fails", async ({ page }) => {
    await page.addInitScript(() => {
      const fallback = {
        profile: {
          email: "cache@sidequest.test",
          displayName: "Cache User",
          totalXp: 900,
          level: 9,
          currentStreak: 4,
          longestStreak: 8,
          xpIntoLevel: 44,
          xpForNextLevel: 100,
        },
        activeQuests: [
          {
            _id: "cache-quest",
            title: "Cached Quest",
            description: "d",
            difficulty: "medium",
            category: "work",
            xpReward: 20,
            status: "active",
          },
        ],
        dailies: [],
        dailyKey: "cache-key",
      };
      window.localStorage.setItem("today-dashboard:last-known", JSON.stringify(fallback));
    });

    await installHomeMocks(page, {
      failProgressionNetwork: true,
      activeQuests: [],
      dailies: [],
    });

    await page.goto("/");
    await expect(page.getByText("Showing last known snapshot while network refresh is unavailable.")).toBeVisible();
    await expect(page.getByText("CACHE USER LV. 9")).toBeVisible();
    await expect(page.getByRole("button", { name: /Cached Quest/i })).toBeVisible();
  });
});
