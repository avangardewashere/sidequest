import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import YouPage from "@/app/you/page";

const {
  pushToast,
  mockFetchYouProfile,
  mockUpdateYouProfile,
  mockChangeYouPassword,
  mockFetchYouPreferences,
  mockUpdateYouPreferences,
} = vi.hoisted(() => ({
  pushToast: vi.fn(),
  mockFetchYouProfile: vi.fn(),
  mockUpdateYouProfile: vi.fn(),
  mockChangeYouPassword: vi.fn(),
  mockFetchYouPreferences: vi.fn(),
  mockUpdateYouPreferences: vi.fn(),
}));

vi.mock("@/components/feedback/toast-provider", () => ({
  useToast: () => ({ pushToast }),
}));

vi.mock("@/components/layout/authenticated-app-shell", () => ({
  AuthenticatedAppShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/useLocalReminders", () => ({
  useLocalReminders: vi.fn(),
}));

vi.mock("@/lib/client-api", () => ({
  actionResultToToast: (result: { ok: boolean; message?: string }, copy?: { successTitle?: string; fallbackErrorTitle?: string }) =>
    result.ok
      ? { tone: "success", title: copy?.successTitle ?? "ok" }
      : { tone: "warning", title: copy?.fallbackErrorTitle ?? "error", message: result.message },
  fetchYouProfile: mockFetchYouProfile,
  updateYouProfile: mockUpdateYouProfile,
  changeYouPassword: mockChangeYouPassword,
  fetchYouPreferences: mockFetchYouPreferences,
  updateYouPreferences: mockUpdateYouPreferences,
}));

describe("You personalization preferences section", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchYouProfile.mockResolvedValue({
      ok: true,
      data: {
        profile: {
          email: "you@sidequest.test",
          displayName: "You",
          level: 2,
          totalXp: 200,
          currentStreak: 3,
          longestStreak: 7,
          streakFreezeBalance: 0,
          streakGraceEnabled: false,
          reminders: {
            enabled: false,
            timeLocal: null,
            days: [1, 2, 3, 4, 5],
            lastFiredOn: null,
          },
        },
      },
    });
    mockFetchYouPreferences.mockResolvedValue({
      ok: true,
      data: {
        onboarding: {
          completed: true,
          completedAt: "2026-04-27T00:00:00.000Z",
          focusArea: "work",
          weeklyTarget: 5,
          encouragementStyle: "gentle",
        },
      },
    });
    mockUpdateYouProfile.mockResolvedValue({ ok: true, data: null });
    mockChangeYouPassword.mockResolvedValue({ ok: true, data: null });
  });

  it("renders current values and keeps save disabled when unchanged", async () => {
    render(<YouPage />);

    await screen.findByRole("heading", { name: "Personalization preferences" });

    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gentle" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save preferences" })).toBeDisabled();
  });

  it("dispatches PATCH on save and updates values", async () => {
    mockUpdateYouPreferences.mockResolvedValue({
      ok: true,
      data: {
        onboarding: {
          completed: true,
          completedAt: "2026-04-27T00:00:00.000Z",
          focusArea: "learning",
          weeklyTarget: 8,
          encouragementStyle: "direct",
        },
      },
    });

    render(<YouPage />);
    await screen.findByRole("heading", { name: "Personalization preferences" });

    fireEvent.click(screen.getByRole("button", { name: "Learning" }));
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "8" } });
    fireEvent.click(screen.getByRole("button", { name: "Direct" }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    await waitFor(() => {
      expect(mockUpdateYouPreferences).toHaveBeenCalledWith({
        focusArea: "learning",
        weeklyTarget: 8,
        encouragementStyle: "direct",
      });
    });
    expect(pushToast).toHaveBeenCalled();
  });

  it("surfaces error toast when update fails", async () => {
    mockUpdateYouPreferences.mockResolvedValue({
      ok: false,
      data: null,
      message: "Invalid payload",
      errorCode: "validation",
    });

    render(<YouPage />);
    await screen.findByRole("heading", { name: "Personalization preferences" });

    fireEvent.click(screen.getByRole("button", { name: "Life" }));
    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));

    await waitFor(() => {
      expect(pushToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "warning",
          title: "Could not save preferences",
        }),
      );
    });
  });
});
