import { beforeEach, describe, expect, it, vi } from "vitest";

const mockConnectToDatabase = vi.fn();
const mockGetAuthSession = vi.fn();
const mockHash = vi.fn();
const mockUserFindOne = vi.fn();
const mockUserCreate = vi.fn();
const mockUserFindById = vi.fn();
const mockQuestCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("bcryptjs", () => ({
  default: { hash: mockHash },
  hash: mockHash,
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
  },
}));

vi.mock("@/models/Quest", () => ({
  QuestModel: {
    create: mockQuestCreate,
  },
}));

const registerRoute = await import("@/app/api/auth/register/route");
const questsRoute = await import("@/app/api/quests/route");
const progressionRoute = await import("@/app/api/progression/route");
const completeQuestRoute = await import("@/app/api/quests/[id]/complete/route");

describe("API route baseline tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("creates a new user for valid payload", async () => {
      mockUserFindOne.mockResolvedValue(null);
      mockHash.mockResolvedValue("hashed-pass");
      mockUserCreate.mockResolvedValue({ _id: "user-1" });

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@sidequest.app",
          displayName: "New User",
          password: "password123",
        }),
      });

      const response = await registerRoute.POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({ ok: true });
      expect(mockConnectToDatabase).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(1);
    });

    it("rejects duplicate email", async () => {
      mockUserFindOne.mockResolvedValue({ _id: "existing" });
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "existing@sidequest.app",
          displayName: "Existing User",
          password: "password123",
        }),
      });

      const response = await registerRoute.POST(request);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json.error).toBe("Email already in use");
    });
  });

  describe("POST /api/quests", () => {
    it("requires auth", async () => {
      mockGetAuthSession.mockResolvedValue(null);
      const request = new Request("http://localhost/api/quests", {
        method: "POST",
        body: JSON.stringify({
          title: "Quest",
          description: "Do thing",
          difficulty: "easy",
          category: "work",
        }),
      });

      const response = await questsRoute.POST(request);
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("creates quest for authenticated user", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      mockQuestCreate.mockResolvedValue({ _id: "q1", title: "Quest" });
      const request = new Request("http://localhost/api/quests", {
        method: "POST",
        body: JSON.stringify({
          title: "Quest",
          description: "Do thing",
          difficulty: "easy",
          category: "work",
        }),
      });

      const response = await questsRoute.POST(request);
      expect(response.status).toBe(201);
      expect(mockQuestCreate).toHaveBeenCalledTimes(1);
    });
  });

  describe("PATCH /api/quests/:id/complete", () => {
    it("requires auth", async () => {
      mockGetAuthSession.mockResolvedValue(null);
      const request = new Request("http://localhost/api/quests/quest-1/complete", {
        method: "PATCH",
      });
      const response = await completeQuestRoute.PATCH(request, {
        params: Promise.resolve({ id: "quest-1" }),
      });
      const json = await response.json();
      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });
  });

  describe("GET /api/progression", () => {
    it("returns profile for authenticated user", async () => {
      mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
      mockUserFindById.mockResolvedValue({
        email: "user@sidequest.app",
        displayName: "User",
        totalXp: 75,
        level: 2,
        currentStreak: 2,
        longestStreak: 5,
      });
      const request = new Request("http://localhost/api/progression", { method: "GET" });

      const response = await progressionRoute.GET(request);
      const json = await response.json();
      expect(response.status).toBe(200);
      expect(json.profile.email).toBe("user@sidequest.app");
      expect(json.profile.level).toBe(2);
    });
  });
});
