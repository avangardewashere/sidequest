import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestListViewClient from "@/app/quests/view/quest-list-view-client";
import type { Quest } from "@/types/dashboard";

const mockReplace = vi.fn();

const { fetchQuestsListMock } = vi.hoisted(() => ({
  fetchQuestsListMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "u1", email: "u@test.dev", name: "User" } },
    status: "authenticated" as const,
  }),
}));

vi.mock("@/lib/client-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/client-api")>();
  return {
    ...mod,
    fetchQuestsList: fetchQuestsListMock,
  };
});

vi.mock("@/hooks/useDashboardActions", () => ({
  useDashboardActions: () => ({ feedback: null, completeQuest: vi.fn() }),
}));

vi.mock("@/components/feedback/toast-provider", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

const habit: Quest = {
  _id: "h1",
  title: "Habit A",
  description: "d",
  difficulty: "easy",
  category: "health",
  xpReward: 5,
  status: "active",
  cadence: { kind: "daily" },
  parentQuestId: null,
  tags: ["alpha"],
};

const todo: Quest = {
  _id: "t1",
  title: "Todo B",
  description: "d",
  difficulty: "medium",
  category: "work",
  xpReward: 10,
  status: "active",
  cadence: { kind: "oneoff" },
  dueDate: "2026-06-01T00:00:00.000Z",
  parentQuestId: null,
  tags: ["beta"],
};

describe("QuestListViewClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchQuestsListMock.mockResolvedValue([habit, todo]);
  });

  it("loads quests and filters by Habits tab", async () => {
    render(<QuestListViewClient />);
    await waitFor(() => expect(fetchQuestsListMock).toHaveBeenCalled());
    expect(await screen.findByText("Habit A")).toBeInTheDocument();
    expect(screen.getByText("Todo B")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Habits" }));
    expect(screen.getByText("Habit A")).toBeInTheDocument();
    expect(screen.queryByText("Todo B")).not.toBeInTheDocument();
  });

  it("filters by Todos tab", async () => {
    render(<QuestListViewClient />);
    expect(await screen.findByText("Todo B")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Todos" }));
    expect(screen.getByText("Todo B")).toBeInTheDocument();
    expect(screen.queryByText("Habit A")).not.toBeInTheDocument();
  });
});
