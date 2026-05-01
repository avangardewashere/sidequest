"use client";

import { useState } from "react";
import {
  Badge,
  BottomNav,
  Button,
  Card,
  FormField,
  ProgressRing,
  Sheet,
  TaskRow,
} from "@/components/ui";
import type { BadgeVariant, ButtonSize, ButtonVariant, CardVariant, SheetPlacement } from "@/components/ui";

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

  return (
    <div
      className="min-h-screen space-y-10 px-4 py-8 pb-32"
      style={{ background: "var(--color-bg-base)", color: "var(--color-text-primary)" }}
    >
      <header className="mx-auto max-w-2xl space-y-2">
        <h1 className="text-2xl font-semibold">UI primitives (Phase 7.5)</h1>
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
    </div>
  );
}
