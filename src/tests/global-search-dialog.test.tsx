import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlobalSearchDialog } from "@/components/layout/global-search-dialog";

const mockPush = vi.fn();

const { searchQuestsMock } = vi.hoisted(() => ({
  searchQuestsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/lib/client-api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/client-api")>();
  return {
    ...mod,
    searchQuests: searchQuestsMock,
  };
});

describe("GlobalSearchDialog", () => {
  it("opens from controlled state, searches debounced, and navigates on result click", async () => {
    searchQuestsMock.mockResolvedValue({
      ok: true as const,
      data: {
        quests: [{ _id: "abc123", title: "Alpha quest", description: "", tags: ["t1"] }],
        nextCursor: null,
      },
    });

    const onOpenChange = vi.fn();
    render(<GlobalSearchDialog open onOpenChange={onOpenChange} />);

    expect(await screen.findByRole("dialog", { name: "Search quests" })).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Title, tag, or note/i);
    fireEvent.change(input, { target: { value: "alp" } });

    await waitFor(() => expect(searchQuestsMock).toHaveBeenCalled());
    expect(await screen.findByText("Alpha quest")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Alpha quest/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith("/quests/abc123");
  });
});
