import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CalendarHeatmap } from "@/components/ui/calendar-heatmap";
import { CadencePicker } from "@/components/ui/cadence-picker";
import { LinkPicker } from "@/components/ui/link-picker";
import { NoteCard } from "@/components/ui/note-card";
import { TagInput } from "@/components/ui/tag-input";
import { formatCadenceShort } from "@/lib/format-cadence-label";

describe("formatCadenceShort", () => {
  it("labels oneoff and daily", () => {
    expect(formatCadenceShort({ kind: "oneoff" })).toBe("One-off");
    expect(formatCadenceShort({ kind: "daily" })).toBe("Daily");
  });
});

describe("TagInput", () => {
  it("adds a tag on Enter", () => {
    const onChange = vi.fn();
    render(
      <TagInput id="t1" label="Tags" value={["a"]} onChange={onChange} suggestions={[]} maxTags={8} />,
    );
    const input = screen.getByRole("combobox", { name: /tags/i });
    fireEvent.change(input, { target: { value: "beta" } });
    fireEvent.keyDown(input, { key: "Enter", preventDefault: vi.fn() });
    expect(onChange).toHaveBeenCalledWith(["a", "beta"]);
  });

  it("does not add beyond maxTags", () => {
    const onChange = vi.fn();
    render(
      <TagInput
        id="t2"
        label="Tags"
        value={["1", "2", "3", "4", "5", "6", "7", "8"]}
        onChange={onChange}
        maxTags={8}
      />,
    );
    const input = screen.getByRole("combobox", { name: /tags/i });
    expect(input).toBeDisabled();
  });

  it("removes a tag when dismiss is clicked", () => {
    const onChange = vi.fn();
    render(<TagInput id="t3" label="Tags" value={["x", "y"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /remove x/i }));
    expect(onChange).toHaveBeenCalledWith(["y"]);
  });
});

describe("CadencePicker", () => {
  it("changes kind via radio", () => {
    const onChange = vi.fn();
    render(<CadencePicker id="c1" value={{ kind: "oneoff" }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: /daily/i }));
    expect(onChange).toHaveBeenCalledWith({ kind: "daily" });
  });

  it("shows custom controls for custom kind", () => {
    const onChange = vi.fn();
    render(
      <CadencePicker id="c2" value={{ kind: "custom", daysOfWeek: [1], everyNDays: 3 }} onChange={onChange} />,
    );
    expect(screen.getByRole("spinbutton")).toHaveValue(3);
    fireEvent.click(screen.getByRole("button", { name: "Tue" }));
    expect(onChange).toHaveBeenCalled();
  });
});

describe("CalendarHeatmap", () => {
  it("calls onCellClick with YYYY-MM-DD", () => {
    const onCellClick = vi.fn();
    const end = new Date(Date.UTC(2026, 4, 7));
    render(
      <CalendarHeatmap
        cells={[{ date: "2026-05-07", intensity: 2 }]}
        numWeeks={2}
        endDate={end}
        onCellClick={onCellClick}
      />,
    );
    const cells = screen.getAllByRole("gridcell");
    expect(cells.length).toBeGreaterThan(0);
    fireEvent.click(cells[0]);
    expect(onCellClick).toHaveBeenCalled();
    expect(onCellClick.mock.calls[0][0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("NoteCard", () => {
  it("renders body and invokes onDelete", () => {
    const onDelete = vi.fn();
    render(<NoteCard createdAtLabel="Now" body="Hello world" onDelete={onDelete} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDelete).toHaveBeenCalled();
  });
});

describe("LinkPicker", () => {
  it("filters options by query and selects", () => {
    const onQuery = vi.fn();
    const onSelect = vi.fn();
    const { rerender } = render(
      <LinkPicker
        id="l1"
        label="Link"
        query=""
        onQueryChange={onQuery}
        options={[
          { id: "a", title: "Alpha quest" },
          { id: "b", title: "Beta task" },
        ]}
        selectedId={null}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole("combobox", { name: /link/i });
    fireEvent.change(input, { target: { value: "alp" } });
    expect(onQuery).toHaveBeenCalledWith("alp");
    rerender(
      <LinkPicker
        id="l1"
        label="Link"
        query="alp"
        onQueryChange={onQuery}
        options={[{ id: "a", title: "Alpha quest" }]}
        selectedId={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole("option", { name: /alpha quest/i }));
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});
