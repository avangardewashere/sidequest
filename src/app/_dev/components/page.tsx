"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  BottomNav,
  Button,
  CalendarHeatmap,
  CadencePicker,
  Card,
  FormField,
  HabitChip,
  LinkPicker,
  NoteCard,
  ProgressRing,
  Sheet,
  StreakFlame,
  TagChip,
  TagInput,
  TaskRow,
} from "@/components/ui";
import type { BadgeVariant, ButtonSize, ButtonVariant, CardVariant, SheetPlacement } from "@/components/ui";
import type { QuestCadence } from "@/types/dashboard";
import { toUtcDateKey } from "@/lib/cadence";

const badgeVariants: BadgeVariant[] = ["difficulty", "status", "cadence", "tier"];
const buttonVariants: ButtonVariant[] = ["primary", "secondary", "ghost", "destructive"];
const buttonSizes: ButtonSize[] = ["sm", "md", "lg"];
const cardVariants: CardVariant[] = ["surface", "elevated"];
const sheetPlacements: SheetPlacement[] = ["drawer", "bottom", "end"];

export default function DevComponentsPage() {
  const [buttonVariant, setButtonVariant] = useState<ButtonVariant>("primary");
  const [buttonSize, setButtonSize] = useState<ButtonSize>("md");
  const [badgeVariant, setBadgeVariant] = useState<BadgeVariant>("status");
  const [cardVariant, setCardVariant] = useState<CardVariant>("surface");
  const [cardAccent, setCardAccent] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetPlacement, setSheetPlacement] = useState<SheetPlacement>("drawer");
  const [taskChecked, setTaskChecked] = useState(false);
  const [ringPct, setRingPct] = useState(62);

  const [tags, setTags] = useState<string[]>(["focus", "health"]);
  const [cadence, setCadence] = useState<QuestCadence>({ kind: "daily" });
  const [heatmapClick, setHeatmapClick] = useState<string | null>(null);
  const [streakDemo, setStreakDemo] = useState(7);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkSelected, setLinkSelected] = useState<string | null>(null);

  const linkPool = useMemo(
    () => [
      { id: "1", title: "Morning run" },
      { id: "2", title: "Read 20 pages" },
      { id: "3", title: "Weekly review" },
    ],
    [],
  );
  const linkOptions = useMemo(() => {
    const q = linkQuery.trim().toLowerCase();
    if (!q) return linkPool;
    return linkPool.filter((o) => o.title.toLowerCase().includes(q));
  }, [linkPool, linkQuery]);

  const heatmapCells = useMemo(() => {
    const end = new Date();
    const out: { date: string; intensity: number }[] = [];
    for (let i = 0; i < 24; i += 3) {
      const d = new Date(end.getTime() - i * 86400000);
      out.push({ date: toUtcDateKey(d), intensity: (i % 4) + 1 });
    }
    return out;
  }, []);

  return (
    <div
      className="min-h-screen space-y-10 px-4 py-8 pb-32"
      style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}
    >
      <header className="mx-auto max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold">UI primitives (Phases 7.5 &amp; 7.6)</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Development-only harness. Not shipped in production builds of this route.
        </p>
      </header>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">Button</h2>
        <div className="flex flex-wrap gap-2">
          {buttonVariants.map((v) => (
            <button
              key={v}
              type="button"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--color-border-default)",
                background: buttonVariant === v ? "var(--color-primary-subtle)" : "transparent",
              }}
              onClick={() => setButtonVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {buttonSizes.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--color-border-default)",
                background: buttonSize === s ? "var(--color-primary-subtle)" : "transparent",
              }}
              onClick={() => setButtonSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <Button variant={buttonVariant} size={buttonSize}>
          Sample action
        </Button>
        <Button variant={buttonVariant} size={buttonSize} disabled>
          Disabled
        </Button>
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">Badge</h2>
        <div className="flex flex-wrap gap-2">
          {badgeVariants.map((v) => (
            <button
              key={v}
              type="button"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--color-border-default)",
                background: badgeVariant === v ? "var(--color-primary-subtle)" : "transparent",
              }}
              onClick={() => setBadgeVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <Badge variant={badgeVariant}>Sample label</Badge>
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">Card</h2>
        <div className="flex flex-wrap gap-2">
          {cardVariants.map((v) => (
            <button
              key={v}
              type="button"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--color-border-default)",
                background: cardVariant === v ? "var(--color-primary-subtle)" : "transparent",
              }}
              onClick={() => setCardVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={cardAccent} onChange={(e) => setCardAccent(e.target.checked)} />
          Accent border
        </label>
        <Card variant={cardVariant} accent={cardAccent}>
          <p className="font-medium">Card content</p>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Variant {cardVariant}, accent {String(cardAccent)}
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-2xl space-y-4 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">FormField</h2>
        <FormField id="demo-email" label="Email" helperText="We never share your address.">
          <input
            id="demo-email"
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-border-default)" }}
            placeholder="you@example.com"
          />
        </FormField>
        <FormField id="demo-code" label="Invite code" errorText="That code is invalid or expired." required>
          <input
            id="demo-code"
            className="w-full rounded-md border px-3 py-2 text-sm"
            style={{ borderColor: "var(--color-danger)" }}
            defaultValue="wrong"
          />
        </FormField>
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">TaskRow</h2>
        <TaskRow
          title="Draft weekly review"
          meta={<span>Due today · +25 XP</span>}
          checked={taskChecked}
          onChange={(e) => setTaskChecked(e.target.checked)}
        />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">ProgressRing</h2>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          Percent
          <input
            type="range"
            min={0}
            max={100}
            value={ringPct}
            onChange={(e) => setRingPct(Number(e.target.value))}
          />
        </label>
        <ProgressRing percent={ringPct} label={<span>{ringPct}%</span>} />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">Sheet</h2>
        <div className="flex flex-wrap gap-2">
          {sheetPlacements.map((p) => (
            <button
              key={p}
              type="button"
              className="rounded border px-2 py-1 text-xs"
              style={{
                borderColor: "var(--color-border-default)",
                background: sheetPlacement === p ? "var(--color-primary-subtle)" : "transparent",
              }}
              onClick={() => setSheetPlacement(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <Button type="button" variant="secondary" onClick={() => setSheetOpen(true)}>
          Open sheet ({sheetPlacement})
        </Button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen} title="Sample sheet" placement={sheetPlacement}>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Minimal shell for capture (8.5) and inline composer (8.2). Resize the viewport to see drawer
            placement on wide screens.
          </p>
        </Sheet>
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">BottomNav</h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Preview only (not fixed). Active tab follows the current pathname.
        </p>
        <BottomNav className="rounded-lg border" />
      </section>

      <hr className="mx-auto max-w-2xl border-t" style={{ borderColor: "var(--color-border-default)" }} />

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">Phase 7.6 — TagChip</h2>
        <div className="flex flex-wrap gap-2">
          <TagChip label="alpha" />
          <TagChip label="beta-long-name" />
        </div>
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">TagInput</h2>
        <TagInput
          id="dev-tags"
          label="Tags"
          value={tags}
          onChange={setTags}
          suggestions={["focus", "health", "deep-work", "inbox", "side-quest"]}
          helperText="Enter to add; max 8 tags."
        />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">CadencePicker + HabitChip</h2>
        <CadencePicker id="dev-cadence" value={cadence} onChange={setCadence} helperText="UTC weekday toggles for weekly/custom." />
        <HabitChip cadence={cadence} streak={14} />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">NoteCard</h2>
        <NoteCard
          createdAtLabel="May 1, 2026 · 14:02 UTC"
          body={"Line one\nLine two with **markdown** shown as text until Cycle 8."}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">CalendarHeatmap</h2>
        <CalendarHeatmap cells={heatmapCells} numWeeks={10} onCellClick={(d) => setHeatmapClick(d)} />
        {heatmapClick ? (
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            Last cell: {heatmapClick}
          </p>
        ) : null}
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">StreakFlame</h2>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          Streak value
          <input
            type="number"
            min={0}
            max={200}
            value={streakDemo}
            onChange={(e) => setStreakDemo(Number(e.target.value))}
          />
        </label>
        <StreakFlame streak={streakDemo} />
      </section>

      <section className="mx-auto max-w-2xl space-y-3 rounded-xl border p-4" style={{ borderColor: "var(--color-border-default)" }}>
        <h2 className="text-lg font-semibold">LinkPicker (props-only options)</h2>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          Query filters static options; Cycle 8.6 will wire search API.
        </p>
        <LinkPicker
          id="dev-link"
          label="Link to quest"
          query={linkQuery}
          onQueryChange={setLinkQuery}
          options={linkOptions}
          selectedId={linkSelected}
          onSelect={setLinkSelected}
          helperText="Type to filter mock titles."
        />
      </section>
    </div>
  );
}
