import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Sheet } from "@/components/ui/sheet";
import { TaskRow } from "@/components/ui/task-row";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    prefetch,
    ...rest
  }: {
    children: ReactNode;
    href: string;
    prefetch?: boolean;
  }) => {
    void prefetch;
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

const mockPathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("Button", () => {
  it("renders primary label", () => {
    render(<Button type="button">Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("is disabled when disabled", () => {
    render(
      <Button type="button" disabled>
        Nope
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Nope" })).toBeDisabled();
  });
});

describe("Badge", () => {
  it("renders variant text", () => {
    render(<Badge variant="difficulty">Epic</Badge>);
    expect(screen.getByText("Epic")).toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("shows helper text when there is no error", () => {
    render(
      <FormField id="f1" label="Title" helperText="Keep it short.">
        <input id="f1" />
      </FormField>,
    );
    expect(screen.getByText("Keep it short.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows error and wires aria-invalid on the control", () => {
    render(
      <FormField id="f2" label="Code" errorText="Invalid code.">
        <input id="f2" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid code.");
    expect(screen.getByLabelText("Code")).toHaveAttribute("aria-invalid", "true");
  });
});

describe("TaskRow", () => {
  it("toggles controlled checkbox", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <TaskRow title="Water plants" checked={false} onChange={onChange} />,
    );
    const box = screen.getByRole("checkbox", { name: /water plants/i });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalled();
    rerender(<TaskRow title="Water plants" checked onChange={onChange} />);
    expect(box).toBeChecked();
    expect(screen.getByText("Water plants")).toHaveClass("line-through");
  });
});

describe("ProgressRing", () => {
  it("exposes percent in the accessible name", () => {
    render(<ProgressRing percent={42} />);
    expect(screen.getByRole("img", { name: /42% complete/i })).toBeInTheDocument();
  });
});

describe("Sheet", () => {
  it("renders dialog when open", () => {
    render(
      <Sheet open title="Panel" onOpenChange={() => {}} placement="bottom">
        <p>Inside</p>
      </Sheet>,
    );
    const dialog = screen.getByRole("dialog", { name: "Panel" });
    expect(within(dialog).getByText("Inside")).toBeInTheDocument();
  });

  it("closes when backdrop is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open title="T" onOpenChange={onOpenChange} placement="bottom">
        body
      </Sheet>,
    );
    fireEvent.click(screen.getByRole("button", { name: /close panel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("BottomNav", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/stats");
  });

  it("marks the active tab from pathname", () => {
    render(<BottomNav />);
    expect(screen.getByRole("link", { name: "Stats" })).toHaveAttribute("aria-current", "page");
  });
});
