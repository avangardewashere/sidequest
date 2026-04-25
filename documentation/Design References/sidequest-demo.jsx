import React, { useState } from "react";
import {
  Search,
  Flame,
  Target,
  Clock,
  Swords,
  Play,
  ChevronRight,
  FileText,
  ListChecks,
  Calendar,
  Plus,
  Home,
  Trophy,
  BarChart3,
  User,
} from "lucide-react";

/* =============================================================
   SideQuest — Reusable Component System
   Palette: Indigo (#5B5BD6) + Ember (#E8804A) on Warm Paper (#FAFAF7)
   All tokens map 1:1 to /color_analysis_colorscheme.md
   ============================================================= */

/* ------------------------------------------------------------------
   TOKENS — single source of truth. Passed as inline styles or used
   via Tailwind's arbitrary-value syntax (bg-[#FAFAF7]).
-------------------------------------------------------------------*/
const T = {
  paper: "#FAFAF7",
  surface: "#FFFFFF",
  elevated: "#F5F4EF",
  borderSubtle: "#EDECE6",
  borderDefault: "#D8D6CE",
  textPrimary: "#1A1A17",
  textSecondary: "#5A5954",
  textTertiary: "#8E8C85",
  primary: "#5B5BD6",
  primaryHover: "#4B4BC2",
  primarySubtle: "#EEEEFB",
  secondary: "#E8804A",
  secondarySubtle: "#FBEAD9",
  secondaryStrong: "#B54708",
  success: "#15803D",
  warning: "#B45309",
  warningSubtle: "#FEF3C7",
  danger: "#B91C1C",
  dangerSubtle: "#FEE2E2",
};

/* ------------------------------------------------------------------
   PRIMITIVES (atoms)
-------------------------------------------------------------------*/

/** Small gem/diamond used inside XPChip. Custom SVG so it reads as "XP" not generic. */
const XPGem = ({ className = "", color = T.primary }) => (
  <svg viewBox="0 0 12 12" className={className} fill="none" aria-hidden>
    <path
      d="M6 1.2 L10.2 5 L6 10.8 L1.8 5 Z"
      stroke={color}
      strokeWidth="1.2"
      strokeLinejoin="round"
      fill={color}
      fillOpacity="0.18"
    />
    <path d="M1.8 5 H10.2" stroke={color} strokeWidth="1" />
  </svg>
);

/** Purpose: reusable reward chip. Appears on hero card AND every quest row. */
export const XPChip = ({ amount, size = "sm" }) => {
  const padding = size === "lg" ? "px-2.5 py-1" : "px-2 py-0.5";
  const text = size === "lg" ? "text-[13px]" : "text-[12px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-semibold ${padding} ${text}`}
      style={{
        backgroundColor: T.primarySubtle,
        color: T.primary,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <XPGem className="w-3 h-3" />
      <span>+{amount}</span>
    </span>
  );
};

/** P1 / P2 pill. Uses danger/warning tokens — never ember (ember is reserved for heat/streak). */
export const PriorityPill = ({ level }) => {
  const styles =
    level === 1
      ? { bg: T.dangerSubtle, fg: T.danger }
      : { bg: T.warningSubtle, fg: T.warning };
  return (
    <span
      className="inline-flex items-center justify-center rounded-[5px] font-bold text-[10px] tracking-wide leading-none"
      style={{
        backgroundColor: styles.bg,
        color: styles.fg,
        padding: "3px 5px",
      }}
    >
      P{level}
    </span>
  );
};

/** Meta chip — time, notes, subtask count. Neutral, sits on elevated fill. */
export const MetaChip = ({ icon: Icon, children }) => (
  <span
    className="inline-flex items-center gap-1 text-[12px]"
    style={{ color: T.textSecondary, fontVariantNumeric: "tabular-nums" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />}
    {children}
  </span>
);

/** Custom checkbox — picks up success color on check. */
export const Checkbox = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    aria-pressed={checked}
    aria-label={checked ? "Mark incomplete" : "Mark complete"}
    className="shrink-0 w-[18px] h-[18px] rounded-[5px] flex items-center justify-center transition-colors"
    style={{
      backgroundColor: checked ? T.success : "transparent",
      border: `1.5px solid ${checked ? T.success : T.borderDefault}`,
    }}
  >
    {checked && (
      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none">
        <path
          d="M2.5 6.2 L5 8.5 L9.5 3.5"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

/** Eyebrow label — "MAIN QUEST", "TODAY QUESTS", "TOMORROW". */
export const Eyebrow = ({ children, tone = "muted", className = "" }) => (
  <span
    className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${className}`}
    style={{ color: tone === "ember" ? T.secondaryStrong : T.textTertiary }}
  >
    {children}
  </span>
);

/* ------------------------------------------------------------------
   COMPOUND COMPONENTS (molecules)
-------------------------------------------------------------------*/

/** Top app bar — date, title, search. Transparent over paper. */
export const AppBar = ({ title = "Today", date = "Mon, Apr 24" }) => (
  <div className="flex items-end justify-between px-5 pt-5 pb-3">
    <div>
      <div
        className="text-[12px] font-medium"
        style={{ color: T.textTertiary, letterSpacing: "0.02em" }}
      >
        {date}
      </div>
      <h1
        className="text-[26px] font-semibold leading-tight mt-0.5"
        style={{ color: T.textPrimary, letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
    </div>
    <button
      type="button"
      className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      style={{ color: T.textSecondary }}
      aria-label="Search"
    >
      <Search className="w-[18px] h-[18px]" strokeWidth={1.75} />
    </button>
  </div>
);

/** Adventurer level + XP bar — the top hero of the Today screen. */
export const AdventurerBar = ({ level = 12, xp = 740, xpMax = 1000 }) => {
  const pct = Math.min(100, Math.max(0, (xp / xpMax) * 100));
  return (
    <div
      className="mx-5 px-4 py-3.5 rounded-[14px]"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.borderSubtle}`,
        boxShadow: "0 1px 2px rgba(26,26,23,0.03)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: T.textTertiary }}
          >
            Adventurer&nbsp;Lv.
          </span>
          <span
            className="inline-flex items-center justify-center px-1.5 h-[22px] min-w-[26px] rounded-[6px] font-bold text-[12px] leading-none"
            style={{
              backgroundColor: T.textPrimary,
              color: "#fff",
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {level}
          </span>
        </div>
        <span
          className="text-[12px] font-medium"
          style={{
            color: T.textSecondary,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {xp}/{xpMax} XP
        </span>
      </div>
      <div
        className="h-[6px] rounded-full overflow-hidden"
        style={{ backgroundColor: T.primarySubtle }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${T.primary} 0%, #6E6EE0 100%)`,
          }}
        />
      </div>
    </div>
  );
};

/** Single stat card — icon + big number + label. */
export const StatCard = ({ icon: Icon, iconColor, value, label, valueColor }) => (
  <div
    className="flex-1 px-3.5 py-3 rounded-[12px]"
    style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.borderSubtle}`,
    }}
  >
    <div className="flex items-center gap-1.5 mb-1">
      <Icon
        className="w-[14px] h-[14px]"
        style={{ color: iconColor || T.textSecondary }}
        strokeWidth={2}
      />
      <span
        className="text-[10.5px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: T.textTertiary }}
      >
        {label}
      </span>
    </div>
    <div
      className="text-[20px] font-semibold leading-none"
      style={{
        color: valueColor || T.textPrimary,
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
        letterSpacing: "-0.01em",
      }}
    >
      {value}
    </div>
  </div>
);

/** Stats strip — composes 3 StatCards. Override via `items` prop for different screens. */
export const StatsStrip = ({
  streak = 23,
  dailyGoal = "4/7",
  focused = "2h 40m",
}) => (
  <div className="flex gap-2 px-5 mt-2.5">
    <StatCard
      icon={Flame}
      iconColor={T.secondary}
      label="Streak"
      value={streak}
      valueColor={T.textPrimary}
    />
    <StatCard
      icon={Target}
      iconColor={T.primary}
      label="Daily Goal"
      value={dailyGoal}
    />
    <StatCard icon={Clock} label="Focused" value={focused} />
  </div>
);

/** Section header — "TODAY QUESTS · 5     +180 XP" */
export const SectionHeader = ({ label, count, totalXP, dueLabel }) => (
  <div className="flex items-center justify-between px-5 mt-5 mb-2">
    <div className="flex items-center gap-1.5">
      <Eyebrow>{label}</Eyebrow>
      {count != null && (
        <>
          <span
            className="text-[11px]"
            style={{ color: T.textTertiary }}
          >
            ·
          </span>
          <span
            className="text-[11px] font-semibold"
            style={{
              color: T.textTertiary,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            }}
          >
            {count}
          </span>
        </>
      )}
    </div>
    {dueLabel && <Eyebrow>{dueLabel}</Eyebrow>}
    {totalXP != null && (
      <span
        className="text-[11px] font-semibold"
        style={{
          color: T.textTertiary,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}
      >
        +{totalXP} XP
      </span>
    )}
  </div>
);

/** Main Quest hero card — ember left-accent is the app's signature moment. */
export const MainQuestCard = ({
  title = "Ship Q2 planning doc",
  subtasksDone = 3,
  subtasksTotal = 5,
  notes = 4,
  timeEstimate = "2h 15m",
  xp = 120,
  progress = 0.42,
  focusMinutes = 25,
  onStart,
}) => (
  <div className="px-5">
    <div
      className="relative rounded-[14px] overflow-hidden"
      style={{
        backgroundColor: T.surface,
        border: `1px solid ${T.borderDefault}`,
        boxShadow:
          "0 1px 3px rgba(26,26,23,0.05), 0 2px 8px rgba(26,26,23,0.04)",
      }}
    >
      {/* Ember left accent bar — the single most-branded element */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: T.secondary }}
        aria-hidden
      />
      <div className="px-4 pt-3.5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3
              className="text-[16px] font-semibold leading-snug"
              style={{
                color: T.textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-3.5 mt-2">
              <MetaChip icon={ListChecks}>
                {subtasksDone}/{subtasksTotal}
              </MetaChip>
              <MetaChip icon={FileText}>{notes} notes</MetaChip>
              <MetaChip icon={Clock}>{timeEstimate}</MetaChip>
            </div>
          </div>
          <XPChip amount={xp} size="lg" />
        </div>

        {/* Progress bar */}
        <div
          className="mt-3.5 h-[5px] rounded-full overflow-hidden"
          style={{ backgroundColor: T.elevated }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: T.textPrimary,
            }}
          />
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-2 mt-3.5">
          <button
            type="button"
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-full font-semibold text-[14px] transition-colors"
            style={{
              backgroundColor: T.textPrimary,
              color: "#fff",
            }}
          >
            <Play className="w-3.5 h-3.5" fill="#fff" strokeWidth={0} />
            <span>Start focus · {focusMinutes}m</span>
          </button>
          <button
            type="button"
            aria-label="Quest options"
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center transition-colors"
            style={{
              border: `1px solid ${T.borderDefault}`,
              color: T.textSecondary,
              backgroundColor: T.surface,
            }}
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

/** Single quest row (party quest) — checkbox + priority + title + meta + XP. */
export const QuestRow = ({
  id,
  priority,
  title,
  metas = [],
  xp,
  completed = false,
  dimmed = false,
  completedAt,
  onToggle,
}) => {
  const textColor = completed || dimmed ? T.textTertiary : T.textPrimary;
  const decoration = completed ? "line-through" : "none";

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--sq-hover)]"
      style={{ "--sq-hover": T.elevated }}
    >
      <Checkbox checked={completed} onChange={() => onToggle?.(id)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          {priority && <PriorityPill level={priority} />}
          <span
            className="text-[14.5px] font-medium truncate"
            style={{
              color: textColor,
              textDecoration: decoration,
              textDecorationColor: T.textTertiary,
            }}
          >
            {title}
          </span>
        </div>
        {(metas.length > 0 || completedAt) && (
          <div className="flex items-center gap-3 mt-1">
            {completedAt ? (
              <span
                className="text-[11.5px]"
                style={{ color: T.textTertiary }}
              >
                Completed {completedAt}
              </span>
            ) : (
              metas.map((m, i) => (
                <MetaChip key={i} icon={m.icon}>
                  {m.label}
                </MetaChip>
              ))
            )}
          </div>
        )}
      </div>
      {xp != null && !completed && <XPChip amount={xp} />}
    </div>
  );
};

/** Floating action button — primary indigo. Appears bottom-right. */
export const FAB = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="New quest"
    className="absolute right-4 bottom-4 w-[52px] h-[52px] rounded-full flex items-center justify-center transition-transform active:scale-95"
    style={{
      backgroundColor: T.textPrimary,
      color: "#fff",
      boxShadow:
        "0 8px 24px rgba(26,26,23,0.28), 0 2px 6px rgba(26,26,23,0.12)",
    }}
  >
    <Plus className="w-6 h-6" strokeWidth={2.25} />
  </button>
);

/** Bottom tab bar — Home, Quests, Stats, Profile. */
export const TabBar = ({ active = "home" }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Today" },
    { id: "quests", icon: Trophy, label: "Quests" },
    { id: "stats", icon: BarChart3, label: "Stats" },
    { id: "profile", icon: User, label: "Profile" },
  ];
  return (
    <div
      className="flex items-center justify-around h-[58px]"
      style={{
        backgroundColor: T.surface,
        borderTop: `1px solid ${T.borderSubtle}`,
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            className="flex flex-col items-center gap-0.5 px-3 py-1"
            style={{ color: isActive ? T.primary : T.textTertiary }}
          >
            <t.icon
              className="w-[20px] h-[20px]"
              strokeWidth={isActive ? 2.25 : 1.75}
            />
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------
   SCREENS (organisms)
-------------------------------------------------------------------*/

export const TodayScreen = () => {
  const [completed, setCompleted] = useState({ p3: true });
  const toggle = (id) =>
    setCompleted((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: T.paper }}
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <AppBar title="Today" date="Mon, Apr 24" />
        <AdventurerBar level={12} xp={740} xpMax={1000} />
        <StatsStrip streak={23} dailyGoal="4/7" focused="2h 40m" />

        <SectionHeader label="Main Quest" dueLabel="Due 5:00 PM" />
        <MainQuestCard
          title="Ship Q2 planning doc"
          subtasksDone={3}
          subtasksTotal={5}
          notes={4}
          timeEstimate="2h 15m"
          xp={120}
          progress={0.42}
          focusMinutes={25}
        />

        <SectionHeader label="Today Quests" count={5} totalXP={180} />
        <div>
          <QuestRow
            id="p1"
            priority={1}
            title="Review API spec doc"
            metas={[
              { icon: Clock, label: "30m" },
              { icon: FileText, label: "2" },
            ]}
            xp={40}
            completed={!!completed.p1}
            onToggle={toggle}
          />
          <div
            className="mx-5"
            style={{ borderTop: `1px solid ${T.borderSubtle}` }}
          />
          <QuestRow
            id="p2"
            priority={2}
            title="Sync with design lead"
            metas={[{ icon: Calendar, label: "3:00 PM" }]}
            xp={20}
            completed={!!completed.p2}
            onToggle={toggle}
          />
          <div
            className="mx-5"
            style={{ borderTop: `1px solid ${T.borderSubtle}` }}
          />
          <QuestRow
            id="p3"
            title="Read 10 pages — Staff Eng"
            completedAt="8:12 AM"
            completed={!!completed.p3}
            onToggle={toggle}
          />
        </div>
      </div>

      <FAB />
      <TabBar active="home" />
    </div>
  );
};

export const TomorrowScreen = () => {
  const [completed, setCompleted] = useState({});
  const toggle = (id) =>
    setCompleted((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: T.paper }}
    >
      <div className="flex-1 overflow-y-auto pb-20">
        <SectionHeader label="Tomorrow" />
        <QuestRow
          id="t1"
          title="Interview prep notes"
          metas={[{ icon: Calendar, label: "Sat" }]}
          xp={30}
          dimmed
          completed={!!completed.t1}
          onToggle={toggle}
        />
        <div
          className="mx-5"
          style={{ borderTop: `1px solid ${T.borderSubtle}` }}
        />
        <QuestRow
          id="t2"
          title="Plan next sprint"
          metas={[{ icon: Calendar, label: "Mon" }]}
          xp={50}
          dimmed
          completed={!!completed.t2}
          onToggle={toggle}
        />
      </div>
      <FAB />
    </div>
  );
};

/* ------------------------------------------------------------------
   DEMO SHELL — phone frames + components gallery
-------------------------------------------------------------------*/

const PhoneFrame = ({ children, label }) => (
  <div className="flex flex-col items-center gap-3">
    <div
      className="relative overflow-hidden"
      style={{
        width: 340,
        height: 680,
        borderRadius: 36,
        backgroundColor: T.paper,
        border: `1px solid ${T.borderDefault}`,
        boxShadow:
          "0 40px 80px -20px rgba(26,26,23,0.18), 0 12px 24px -12px rgba(26,26,23,0.08)",
      }}
    >
      {children}
    </div>
    <span
      className="text-[11px] font-semibold uppercase tracking-[0.12em]"
      style={{ color: T.textTertiary }}
    >
      {label}
    </span>
  </div>
);

const GalleryItem = ({ name, children, wide = false }) => (
  <div
    className={`flex flex-col gap-2.5 p-4 rounded-[14px] ${wide ? "col-span-2" : ""}`}
    style={{
      backgroundColor: T.surface,
      border: `1px solid ${T.borderSubtle}`,
    }}
  >
    <div className="flex items-center justify-between">
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.1em]"
        style={{ color: T.textTertiary }}
      >
        {name}
      </span>
      <span
        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
        style={{ backgroundColor: T.primarySubtle, color: T.primary }}
      >
        reusable
      </span>
    </div>
    <div className="flex items-center justify-center py-2 min-h-[44px]">
      {children}
    </div>
  </div>
);

export default function SideQuestDemo() {
  const [completed, setCompleted] = useState({});
  const toggle = (id) =>
    setCompleted((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div
      className="min-h-screen w-full"
      style={{
        backgroundColor: T.elevated,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
        fontFeatureSettings: "'ss01', 'cv11'",
        color: T.textPrimary,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
        button { font-family: inherit; }
        *:focus-visible {
          outline: none;
          box-shadow: 0 0 0 3px rgba(91,91,214,0.35);
          border-radius: 8px;
        }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.14em] mb-2"
            style={{ color: T.secondaryStrong }}
          >
            SideQuest · Component Demo
          </div>
          <h1
            className="text-[32px] font-semibold"
            style={{ color: T.textPrimary, letterSpacing: "-0.02em" }}
          >
            Today & Tomorrow screens
          </h1>
          <p
            className="mt-1.5 text-[14px] max-w-[620px] leading-relaxed"
            style={{ color: T.textSecondary }}
          >
            Each visible block is its own exported component. Indigo{" "}
            <code style={codeStyle()}>#5B5BD6</code> drives progression
            (XP, level, CTA); Ember{" "}
            <code style={codeStyle()}>#E8804A</code> drives heat (streak
            flame, main-quest hero accent). Remove the two and the
            layout degrades gracefully into a Linear-grade neutral todo.
          </p>
        </div>

        {/* Phone frames */}
        <div className="flex flex-wrap items-start justify-center gap-10 mb-14">
          <PhoneFrame label="Today · <TodayScreen />">
            <TodayScreen />
          </PhoneFrame>
          <PhoneFrame label="Tomorrow · <TomorrowScreen />">
            <TomorrowScreen />
          </PhoneFrame>
        </div>

        {/* Component Gallery */}
        <div className="mb-5">
          <h2
            className="text-[18px] font-semibold"
            style={{ color: T.textPrimary, letterSpacing: "-0.01em" }}
          >
            Components gallery
          </h2>
          <p
            className="text-[13px] mt-1"
            style={{ color: T.textSecondary }}
          >
            Every atom &amp; molecule used above, in isolation.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <GalleryItem name="<XPChip />">
            <div className="flex gap-2">
              <XPChip amount={40} />
              <XPChip amount={120} size="lg" />
            </div>
          </GalleryItem>

          <GalleryItem name="<PriorityPill />">
            <div className="flex gap-2">
              <PriorityPill level={1} />
              <PriorityPill level={2} />
            </div>
          </GalleryItem>

          <GalleryItem name="<Checkbox />">
            <div className="flex gap-3 items-center">
              <Checkbox checked={false} onChange={() => {}} />
              <Checkbox checked={true} onChange={() => {}} />
            </div>
          </GalleryItem>

          <GalleryItem name="<MetaChip />">
            <div className="flex gap-3">
              <MetaChip icon={ListChecks}>3/5</MetaChip>
              <MetaChip icon={Clock}>30m</MetaChip>
              <MetaChip icon={FileText}>2</MetaChip>
            </div>
          </GalleryItem>

          <GalleryItem name="<Eyebrow />">
            <div className="flex gap-4">
              <Eyebrow>Today Quests</Eyebrow>
              <Eyebrow tone="ember">Main Quest</Eyebrow>
            </div>
          </GalleryItem>

          <GalleryItem name="<FAB />">
            <div className="relative w-[60px] h-[60px]">
              <div className="absolute right-0 bottom-0">
                <button
                  type="button"
                  aria-label="New quest"
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: T.textPrimary,
                    color: "#fff",
                    boxShadow:
                      "0 8px 24px rgba(26,26,23,0.28), 0 2px 6px rgba(26,26,23,0.12)",
                  }}
                >
                  <Plus className="w-6 h-6" strokeWidth={2.25} />
                </button>
              </div>
            </div>
          </GalleryItem>

          <GalleryItem name="<StatCard />" wide>
            <div className="flex gap-2 w-full">
              <StatCard
                icon={Flame}
                iconColor={T.secondary}
                label="Streak"
                value={23}
              />
              <StatCard
                icon={Target}
                iconColor={T.primary}
                label="Daily Goal"
                value="4/7"
              />
              <StatCard icon={Clock} label="Focused" value="2h 40m" />
            </div>
          </GalleryItem>

          <GalleryItem name="<AdventurerBar />" wide>
            <div className="w-full -mx-5">
              <AdventurerBar level={12} xp={740} xpMax={1000} />
            </div>
          </GalleryItem>

          <GalleryItem name="<QuestRow />" wide>
            <div
              className="w-full rounded-lg overflow-hidden"
              style={{
                backgroundColor: T.paper,
                border: `1px solid ${T.borderSubtle}`,
              }}
            >
              <QuestRow
                id="g1"
                priority={1}
                title="Review API spec doc"
                metas={[
                  { icon: Clock, label: "30m" },
                  { icon: FileText, label: "2" },
                ]}
                xp={40}
                completed={!!completed.g1}
                onToggle={toggle}
              />
              <div
                className="mx-5"
                style={{ borderTop: `1px solid ${T.borderSubtle}` }}
              />
              <QuestRow
                id="g2"
                title="Read 10 pages — Staff Eng"
                completedAt="8:12 AM"
                completed
                onToggle={toggle}
              />
            </div>
          </GalleryItem>

          <GalleryItem name="<MainQuestCard />" wide>
            <div className="w-full -mx-5">
              <MainQuestCard
                title="Ship Q2 planning doc"
                subtasksDone={3}
                subtasksTotal={5}
                notes={4}
                timeEstimate="2h 15m"
                xp={120}
                progress={0.42}
                focusMinutes={25}
              />
            </div>
          </GalleryItem>

          <GalleryItem name="<TabBar />" wide>
            <div
              className="w-full rounded-lg overflow-hidden"
              style={{ border: `1px solid ${T.borderSubtle}` }}
            >
              <TabBar active="home" />
            </div>
          </GalleryItem>
        </div>

        {/* Token legend */}
        <div className="mt-10">
          <h2
            className="text-[18px] font-semibold mb-3"
            style={{ color: T.textPrimary, letterSpacing: "-0.01em" }}
          >
            Color tokens in play
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              ["paper", T.paper, "bg"],
              ["surface", T.surface, "bg"],
              ["primary", T.primary, "fg"],
              ["secondary", T.secondary, "fg"],
              ["textPrimary", T.textPrimary, "fg"],
              ["textSecondary", T.textSecondary, "fg"],
              ["danger", T.danger, "fg"],
              ["warning", T.warning, "fg"],
            ].map(([name, hex]) => (
              <div
                key={name}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
                style={{
                  backgroundColor: T.surface,
                  border: `1px solid ${T.borderSubtle}`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-md shrink-0"
                  style={{
                    backgroundColor: hex,
                    border: `1px solid ${T.borderSubtle}`,
                  }}
                />
                <div className="min-w-0">
                  <div
                    className="text-[12px] font-semibold truncate"
                    style={{ color: T.textPrimary }}
                  >
                    {name}
                  </div>
                  <div
                    className="text-[11px]"
                    style={{
                      color: T.textTertiary,
                      fontFamily:
                        "'JetBrains Mono', ui-monospace, monospace",
                    }}
                  >
                    {hex}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function codeStyle() {
  return {
    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
    fontSize: "0.85em",
    padding: "1px 5px",
    borderRadius: 4,
    backgroundColor: T.elevated,
    color: T.textPrimary,
  };
}
