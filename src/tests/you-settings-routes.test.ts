import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetAuthSession = vi.fn();
const mockConnectToDatabase = vi.fn();
const mockUserFindById = vi.fn();
const mockCompare = vi.fn();
const mockHash = vi.fn();

vi.mock("@/lib/auth", () => ({
  getAuthSession: mockGetAuthSession,
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mockConnectToDatabase,
}));

vi.mock("@/models/User", () => ({
  UserModel: {
    findById: mockUserFindById,
  },
}));

vi.mock("bcryptjs", () => ({
  default: { compare: mockCompare, hash: mockHash },
  compare: mockCompare,
  hash: mockHash,
}));

const profileRoute = await import("@/app/api/you/profile/route");
const passwordRoute = await import("@/app/api/you/password/route");

describe("you settings API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/you/profile requires auth", async () => {
    mockGetAuthSession.mockResolvedValue(null);
    const response = await profileRoute.GET(new Request("http://localhost/api/you/profile"));
    expect(response.status).toBe(401);
  });

  it("PATCH /api/you/profile updates display name", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue({
      email: "u1@sidequest.test",
      displayName: "Old",
      level: 2,
      totalXp: 200,
      currentStreak: 3,
      longestStreak: 7,
      save,
    });

    const response = await profileRoute.PATCH(
      new Request("http://localhost/api/you/profile", {
        method: "PATCH",
        body: JSON.stringify({ displayName: "New Name" }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(save).toHaveBeenCalledTimes(1);
    expect(json.profile.displayName).toBe("New Name");
  });

  it("PATCH /api/you/password rejects wrong current password", async () => {
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue({ passwordHash: "old-hash" });
    mockCompare.mockResolvedValue(false);

    const response = await passwordRoute.PATCH(
      new Request("http://localhost/api/you/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "wrongpass",
          newPassword: "newpassword123",
          confirmPassword: "newpassword123",
        }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("PATCH /api/you/password updates hash for valid payload", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    mockGetAuthSession.mockResolvedValue({ user: { id: "u1" } });
    mockUserFindById.mockResolvedValue({ passwordHash: "old-hash", save });
    mockCompare.mockResolvedValue(true);
    mockHash.mockResolvedValue("new-hash");

    const response = await passwordRoute.PATCH(
      new Request("http://localhost/api/you/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: "oldpassword123",
          newPassword: "newpassword123",
          confirmPassword: "newpassword123",
        }),
      }),
    );
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mockHash).toHaveBeenCalledWith("newpassword123", 10);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
