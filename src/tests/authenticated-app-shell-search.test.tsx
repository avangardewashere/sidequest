import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthenticatedAppShell } from "@/components/layout/authenticated-app-shell";

vi.mock("@/components/layout/capture-quest-sheet", () => ({
  CaptureQuestSheet: () => null,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/quests/view",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => ({
    data: { user: { id: "u1", email: "u@test.dev", name: "User" } },
    status: "authenticated" as const,
  }),
}));

describe("AuthenticatedAppShell search", () => {
  it("opens global search from the header Search button", async () => {
    render(
      <AuthenticatedAppShell>
        <p>Child</p>
      </AuthenticatedAppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("dialog", { name: "Search quests" })).toBeInTheDocument();
  });

  it("opens global search on Ctrl+K when focus is not in a form field", async () => {
    render(
      <AuthenticatedAppShell>
        <p>Child</p>
      </AuthenticatedAppShell>,
    );

    fireEvent.keyDown(screen.getByText("Child"), { key: "k", ctrlKey: true, bubbles: true });
    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Search quests" })).toBeInTheDocument();
    });
  });

  it("does not open search on Ctrl+K while typing in an input", async () => {
    render(
      <AuthenticatedAppShell>
        <input aria-label="Test field" defaultValue="" />
      </AuthenticatedAppShell>,
    );

    const input = screen.getByLabelText("Test field");
    input.focus();
    fireEvent.keyDown(input, { key: "k", ctrlKey: true, bubbles: true });

    await new Promise((r) => setTimeout(r, 80));
    expect(screen.queryByRole("dialog", { name: "Search quests" })).not.toBeInTheDocument();
  });
});
