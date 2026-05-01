import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuestForm } from "@/components/quests/quest-form";

const { fetchTagSuggestionsMock } = vi.hoisted(() => ({
  fetchTagSuggestionsMock: vi.fn(() =>
    Promise.resolve({ ok: true as const, data: { suggestions: [] as string[] } }),
  ),
}));

vi.mock("@/lib/client-api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/client-api")>("@/lib/client-api");
  return {
    ...actual,
    fetchTagSuggestions: fetchTagSuggestionsMock,
  };
});

vi.mock("@/components/feedback/toast-provider", () => ({
  useToast: () => ({ pushToast: vi.fn() }),
}));

describe("QuestForm", () => {
  it("disables submit until required fields and cadence are valid", async () => {
    const onSubmit = vi.fn();
    render(<QuestForm mode="create" submitLabel="Create quest" onSubmit={onSubmit} />);

    const submit = screen.getByRole("button", { name: "Create quest" });
    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: "My quest" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Do the thing" } });

    await waitFor(() => expect(submit).not.toBeDisabled());
    fireEvent.click(submit);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit.mock.calls[0][0].title).toBe("My quest");
  });
});
