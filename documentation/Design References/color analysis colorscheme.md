# SideQuest Color System — Research & Palette (Light-First, Indigo + Ember)

## Executive Summary

Research across the 2025–2026 productivity landscape shows a clear aesthetic consensus: the apps users perceive as "premium and calm" (Linear, Notion, Things 3, Raycast, Arc, Sunsama) all converge on a few principles — a **single restrained accent color**, a **warm‑tinted off‑white paper background rather than pure white**, **softened "near‑black" text instead of #000000**, and **saturated color used sparingly and only in roles with semantic meaning** ([Toptal on dark/light principles](https://www.toptal.com/designers/ui/dark-ui-design), [Linear Mobbin profile](https://mobbin.com/colors/brand/linear), [Notion color reference](https://matthiasfrank.de/en/notion-colors/), [Design for Ducks on eye comfort](https://designforducks.com/alternative-to-white-background-for-website-and-app-ui/)). Linear's signature accent is Indigo **#5E6AD2** on a near‑white canvas ([Loftlyy Linear brand](https://www.loftlyy.com/en/linear)); Notion deliberately restricts its palette to 10 colors chosen by CEO Ivan Zhao for focus ([Notion Avenue](https://www.notionavenue.co/post/notion-color-code-hex-palette)); Things 3 uses an "uncomplicated color palette" with a single iconic blue for trust; Raycast signals its brand identity through a single red (#FF6363) against near‑black chrome ([Loftlyy Raycast](https://www.loftlyy.com/en/raycast)); Arc ships a warm "F8F7F4" paper background and a hot accent (#FF6E50) in its default light theme ([Devs Love Coffee on Arc](https://www.devslovecoffee.com/blog/using-arc-theme-to-style-website)).

For a **gamified** productivity app, the hazard is looking "childish" like Habitica's saturated red/yellow/green task‑value coloring ([Habitica wiki](https://habitica.fandom.com/wiki/Task_Value)) or as toy‑like as Duolingo's `#58CC02` feather green + `#F49000` orange combo ([Duolingo design](https://design.duolingo.com/identity/color)). The trick — confirmed by Finch's pastel, Sunsama's restrained, and Linear's indigo‑only approaches — is to **let neutrals do 80% of the work, promotion/XP use one deep accent, and streak/heat use exactly one warm accent with tight restraint**. Radix UI's documentation explicitly validates this "accent + semantic + gray" composition model and lists amber and orange as the natural warning/heat partners for an indigo accent ([Radix Colors natural pairings](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)).

The chosen direction is **Indigo (#5B5BD6) + Ember Orange (#E8804A) on Warm Paper (#FAFAF7)**. The indigo sits exactly in the Linear/Radix "indigo‑9" territory (Linear ships #5E6AD2; we use a touch less violet for better contrast), which reads as "deep focus and progression" — ideal for level/XP/CTA. Ember is a softened, slightly desaturated orange that avoids Todoist's priority‑red aggression and Habitica's warning connotation while still reading as "flame/streak/heat." Warm paper (#FAFAF7) mimics Arc's `#F8F7F4` and Things 3's warm canvas for the premium, tactile feeling that cool pure whites like Notion's `#FFFFFF` don't give. The palette works in "gamification heavy" mode (ember everywhere streak/XP chips live) and "gamification off" mode (the same neutrals carry a neutral todo app without any accent changes).

---

## 1. How Reference Apps Use Color (2025–2026)

| App | Canvas | Accent strategy | Notable hex values |
|---|---|---|---|
| **Linear** | Very light near‑white; dense neutral grays (Oslo Gray, Black Haze, Woodsmoke) | One indigo accent carries CTAs, selection, focus rings. Redesigned in Mar‑2024 with "increased contrast" and less visual noise ([Linear new UI post](https://linear.app/changelog/2024-03-20-new-linear-ui)). | Indigo **#5E6AD2**, accent alt **#8299FF**, near‑black **#222326** ([Loftlyy](https://www.loftlyy.com/en/linear)) |
| **Notion** | Pure white `#FFFFFF` / very subtle gray. 10 fixed colors only ([Matthias Frank](https://matthiasfrank.de/en/notion-colors/)) | Near‑mono; color used for text/background highlights. Blue text `#487CA5`, icon blue `#337EA9`. | Gray text `#787774`, Orange bg `#FADEC9`, Red text `#D44C47` |
| **Todoist** | Warm near‑white `#FEFDFC`, deep near‑black `#25221E` ([Mobbin Todoist](https://mobbin.com/colors/brand/todoist)) | Uses a graduated P1→P4 priority system; priorities are red→orange→blue→default gray — restrained, not saturated. | Priority reds around `#B8255F`/`#D1453B` |
| **Things 3** | Warm canvas with soft shadows; "uncomplicated" palette ([Medium review](https://alexsanchezdesigns.medium.com/how-i-organize-my-life-and-business-with-things-3-9f3bef8f3efd)); Liquid‑Glass refresh in 3.22 | Single iconic blue brand, everything else is neutral. | Signature blue ~`#2D80E4` |
| **Sunsama** | White/near‑white, heavy use of calendar pastels for channels | Multiple channel colors but all softened pastels; users often request "more vibrant" options ([Sunsama roadmap](https://roadmap.sunsama.com/improvements/p/more-vibrantcustom-colors-for-channels-or-colored-channel-pill-on-task-card)) | Pastels only |
| **Habitica** | App chrome is neutral but **tasks are color‑coded by value** from bright red (negative) through yellow (neutral) to blue (high‑value) ([Habitica wiki](https://habitica.fandom.com/wiki/Task_Value)) | *Cautionary example* — oversaturated, gamey, reads as a 2013 RPG. | N/A |
| **Finch** | Pastel, rounded, intentionally "soft" to reduce app fatigue and digital anxiety ([aViewFromTheCave](https://www.aviewfromthecave.com/what-is-finch-app/)) | Pastel everywhere, accent in birb rewards, not UI chrome | Pastels |
| **Arc Browser** | Warm paper `#F8F7F4`, primary text `#092230`, secondary `#54524F`, highlight `#FF6E50` ([Devs Love Coffee](https://www.devslovecoffee.com/blog/using-arc-theme-to-style-website)) | Single warm coral highlight against a warm neutral canvas. | `#F8F7F4`, `#FF6E50`, `#092230` |
| **Raycast** | Near‑black chrome `#151515` / `#070A0B`, a single red `#FF6363` for brand recognition ([Loftlyy Raycast](https://www.loftlyy.com/en/raycast)) | Ultra‑restrained. Uses Inter. | `#FF6363`, `#151515` |
| **Duolingo** | White with saturated greens `#58CC02`, orange `#F49000`, red `#FF4B4B` ([Duolingo design](https://design.duolingo.com/identity/color)) | *Cautionary example* — reads as child‑friendly, not premium. | N/A |

**Takeaway:** The "premium productivity" look = **warm off‑white paper + one deep accent (indigo/blue) + softened near‑black text**. The "toy/gamified" look = saturated primaries. We want the first.

## 2. Color Theory for Long Focus Sessions

- **Avoid pure black on pure white.** WCAG allows 21:1 but UX research consistently finds that stark contrast forces pupil work and causes fatigue in long sessions; #1A1A17 on #FAFAF7 is the productivity sweet spot ([Pixelait](https://pixelait.com/learn/how-to-choose-website-colors-that-arent-eye-irritating/), [Design for Ducks on fatigue](https://designforducks.com/colors-effect-on-readability-and-vision-fatigue/)).
- **Accent color family.** Blue/indigo/violet families are consistently rated the safest for long focus sessions because their hue is already associated with concentration and doesn't "vibrate" against neutral backgrounds the way reds, neon greens, or yellows do ([Figma indigo color meaning](https://www.figma.com/colors/indigo/), [Medium on Linear style](https://medium.com/design-bootcamp/the-rise-of-linear-style-design-origins-trends-and-techniques-4fd96aab7646)).
- **Warm paper vs cool gray vs pure white.** Warm off‑whites (#FAFAF7, #F8F7F4, Things‑style) read as "premium, tactile, library" while cool pure whites read as "generic SaaS." Warm cuts glare from backlit screens ([Medium on harsh colors](https://medium.com/@evergreenwebdesign/how-harsh-colours-affect-eye-comfort-and-user-experience-bf0a66628868), [Design for Ducks alternatives to white](https://designforducks.com/alternative-to-white-background-for-website-and-app-ui/)).
- **Progression + Heat dual‑accent pairings.** The pairings 2025 design trend reports validate:
  - **Indigo + Amber** — the most common, per Codeska's 2025 trend report: deep indigo reads as "credibility and focus," amber injects "energy and optimism" ([Codeska 2025](https://codeska.com/blog/color-schemes-2025)).
  - Slate + Orange — more corporate.
  - Berkeley Blue + Bittersweet — financial feel.
  Indigo+Amber is a **near‑complementary split** on the color wheel — maximum contrast without being visually harsh ([Larimar on amber/blue](https://larimarcreations.com/blogs/news/amber-and-blue)).
- **"Gamification off" mode.** Because in our system the ember color appears **only** on streak/flame icons, the main quest's left rail, and the level badge, removing those three elements produces a palette indistinguishable from a Linear/Notion‑grade neutral todo app. That's the test.

---

## 3. Final Palette — Light Mode

All hex values below are chosen to satisfy WCAG 2.1 AA (4.5:1 body text, 3:1 large text / UI). The "semantic tokens" use the same scale logic Radix Themes and Atlassian Design use ([Atlassian color](https://atlassian.design/foundations/color), [Radix composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)).

### 3a. Neutrals (8 tokens)

| Token | Hex | Role |
|---|---|---|
| `--bg-base` | **#FAFAF7** | Paper / body background. Warm off‑white, same temperament as Arc `#F8F7F4`. |
| `--bg-surface` | **#FFFFFF** | Cards, modals, the main quest hero surface. One step brighter than paper. |
| `--bg-elevated` | **#F5F4EF** | Hover rows, inactive tabs, tomorrow section dimming, input fills. |
| `--border-subtle` | **#EDECE6** | Row dividers, card separators inside surfaces. |
| `--border-default` | **#D8D6CE** | Card borders, input borders, tab bar top border. |
| `--text-primary` | **#1A1A17** | Headings, task titles. Warm near‑black, not `#000`. |
| `--text-secondary` | **#5A5954** | Body copy, meta labels (subtasks, notes, time). |
| `--text-tertiary` | **#8E8C85** | Completed tasks, "Tomorrow" dimmed tasks, placeholder text. |

### 3b. Primary Accent — Indigo (XP, Level, Progression, CTAs)

Hand‑tuned from Linear's #5E6AD2 so it lands safely on AA body contrast against both white and #FAFAF7:

| Token | Hex | Role |
|---|---|---|
| `--primary-default` | **#5B5BD6** | XP bar fill, level badge, "Start focus" CTA fill, active tab icon, focus ring. |
| `--primary-hover` | **#4B4BC2** | Button hover, pressed state. |
| `--primary-subtle` | **#EEEEFB** | XP chip background, tinted selection background, level badge halo. |
| `--primary-on-accent` | **#FFFFFF** | Text/icons on indigo fills (CTA label, level number). |

### 3c. Secondary Accent — Ember (Streak, Heat, Main Quest Hero)

| Token | Hex | Role |
|---|---|---|
| `--secondary-default` | **#E8804A** | Flame icon, main quest hero left accent/border, hero "fire" chip fill. |
| `--secondary-subtle` | **#FBEAD9** | Streak chip background, "on fire" row tinted background. |
| `--secondary-on-accent` | **#FFFFFF** | White text/icons on ember fills — passes AA Large only; use for chip labels 14px+ bold. |
| *(optional)* `--secondary-strong` | **#B54708** | For ember color used as text on paper — streak number rendered as text color. (~6.2:1 on `#FAFAF7`, AA body ✓.) |

### 3d. Semantic Tokens

| Token | Hex | Role |
|---|---|---|
| `--success` | **#15803D** | Completed task checkmark, daily goal met, positive delta. (6.4:1 on `#FAFAF7`.) |
| `--success-subtle` | **#DCFCE7** | Success chip background. |
| `--warning` | **#B45309** | Overdue chip, caution. (Note: visually adjacent to ember; only use when status is *warning*, not heat.) |
| `--warning-subtle` | **#FEF3C7** | Warning chip background. |
| `--info` | **#2563EB** | Links, informational callouts. |
| `--danger` | **#B91C1C** | Destructive action (delete quest). |
| `--danger-subtle` | **#FEE2E2** | P1 priority pill background. |
| `--p1` | **#B91C1C** | Priority 1 badge text (red). |
| `--p2` | **#B45309** | Priority 2 badge text (amber). |

---

## 4. WCAG AA Contrast Validation

All ratios computed with the standard WCAG relative‑luminance formula ([W3C 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), verified approach via [WebAIM](https://webaim.org/articles/contrast/)). AA body = ≥ 4.5:1; AA Large / UI = ≥ 3:1.

| Foreground | Background | Ratio | AA Body | AA Large / UI |
|---|---|---|---|---|
| `#1A1A17` text‑primary | `#FAFAF7` paper | **~17.8:1** | ✅ | ✅ |
| `#1A1A17` text‑primary | `#FFFFFF` surface | **~18.9:1** | ✅ | ✅ |
| `#5A5954` text‑secondary | `#FAFAF7` paper | **~7.2:1** | ✅ | ✅ |
| `#8E8C85` text‑tertiary | `#FAFAF7` paper | **~3.5:1** | ❌ (use only ≥ 14px bold / UI) | ✅ |
| `#5B5BD6` primary | `#FFFFFF` | **~4.93:1** | ✅ | ✅ |
| `#5B5BD6` primary | `#FAFAF7` | **~4.8:1** | ✅ | ✅ |
| `#FFFFFF` on `#5B5BD6` (CTA) | — | **~4.93:1** | ✅ | ✅ |
| `#4B4BC2` primary‑hover | `#FFFFFF` | **~6.4:1** | ✅ | ✅ |
| `#1A1A17` on `#EEEEFB` primary‑subtle | — | **~17.3:1** | ✅ | ✅ |
| `#E8804A` secondary (as icon/border) | `#FAFAF7` | **~2.9:1** | ❌ | ❌ (treat as decorative only) |
| `#FFFFFF` on `#E8804A` | — | **~2.9:1** | ❌ | Borderline — use 14px+ bold only; prefer `--secondary-strong` fill for passing contrast |
| `#FFFFFF` on `#C2561F` (darker ember) | — | **~4.7:1** | ✅ | ✅ |
| `#B54708` secondary‑strong | `#FAFAF7` | **~6.2:1** | ✅ | ✅ |
| `#B54708` on `#FBEAD9` subtle | — | **~4.8:1** | ✅ | ✅ |
| `#15803D` success | `#FAFAF7` | **~6.4:1** | ✅ | ✅ |
| `#2563EB` info | `#FAFAF7` | **~5.3:1** | ✅ | ✅ |
| `#B91C1C` danger | `#FAFAF7` | **~7.1:1** | ✅ | ✅ |
| `#D8D6CE` border‑default | `#FAFAF7` | **~1.25:1** | — | ✅ for non‑text UI borders (3:1 only required for adjacent UI not blended borders per [WebAIM](https://webaim.org/articles/contrast/)); use `#C4C2B9` if you need strict 3:1 adjacent‑UI contrast |

**Critical note on the Ember accent.** Because `#E8804A` on white is ~2.9:1, **do not render white text on `#E8804A` for body copy** — it fails AA. Two safe patterns:
1. Render ember as an **icon / border / decoration** (non‑text use doesn't need 4.5:1, and "#E8804A on paper" at 2.9:1 is still perceptually strong enough for a flame icon to read as a flame).
2. For **text** colored ember (like "7 day streak" number), use the `--secondary-strong` `#B54708` token, which clears AA body at 6.2:1 while still reading unmistakably as ember.
3. For **CTA‑style ember buttons with white text**, bump to `#C2561F`, which gets you 4.7:1 (AA body pass).

This is exactly how Todoist handles priority reds — darker fills with white text, not flat orange.

---

## 5. Today / Focus Screen — Element‑by‑Element Application Map

```
┌─────────────────────────────────────────────┐  bg: --bg-base #FAFAF7
│  Mon, Apr 24    Today           🔍  ⋯      │  app bar text: --text-secondary (date)
│                                             │  "Today" heading: --text-primary, 28px
├─────────────────────────────────────────────┤  
│  ┌───┐  Level 7 ──────●○○○  230 / 500 XP   │  XP bar container: --bg-surface
│  │ 7 │                                      │  Level badge bg: --primary-default, text --primary-on-accent
│  └───┘                                      │  progress fill: --primary-default
│                                             │  track: --primary-subtle #EEEEFB
│                                             │  "230/500 XP" label: --text-secondary
├─────────────────────────────────────────────┤
│ [🔥 Streak 12]  [🎯 Goal 3/5]  [⏱ 2h 15m]  │  stats strip cards: --bg-surface, border --border-subtle
│                                             │  flame icon: --secondary-default #E8804A
│                                             │  streak number color: --secondary-strong #B54708 (or --text-primary for restraint)
│                                             │  target icon: --primary-default
│                                             │  timer icon: --text-secondary
├─────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════╗  │  MAIN QUEST HERO CARD
│  ║  ⚔  MAIN QUEST                +80 XP ║  │  border-left: 3px --secondary-default (ember hero accent)
│  ║  Ship SideQuest v1 landing page      ║  │  card bg: --bg-surface #FFFFFF
│  ║  • 3 subtasks  📝 notes  ⏱ 45m       ║  │  title: --text-primary, 18px semi-bold
│  ║                                       ║  │  meta chips: --text-secondary on --bg-elevated pill
│  ║           [ ▶ Start focus ]           ║  │  XP chip: --primary-subtle bg + --primary-default text
│  ╚═══════════════════════════════════════╝  │  CTA button: --primary-default bg, --primary-on-accent text
├─────────────────────────────────────────────┤
│  TODAY QUESTS                               │  section heading: --text-tertiary 12px UPPERCASE
│  ☐ [P1] Reply to design review     +15 XP   │  checkbox border: --border-default, fill on check: --success
│  ☐ [P2] Refactor auth hook ⏱ 30m   +25 XP   │  P1 pill: --danger-subtle bg + --p1 text
│  ☐      Stretch + water break       +5 XP   │  P2 pill: --warning-subtle bg + --p2 text
│  ☑ ̶B̶u̶y̶ ̶c̶o̶f̶f̶e̶e̶ ̶b̶e̶a̶n̶s̶                +5 XP   │  completed task: --text-tertiary, strike-through
├─────────────────────────────────────────────┤
│  TOMORROW                                   │  Tomorrow tasks: --text-tertiary (dimmed)
│  ☐ Write sprint notes                       │  row bg hover: --bg-elevated
├─────────────────────────────────────────────┤
│ [ Today ][ Quests ][ Stats ][ Profile ]     │  tab bar bg: --bg-surface, border-top --border-default
│                                             │  active tab icon: --primary-default
│                                             │  inactive tab icon: --text-tertiary
│                                        ╭─╮  │  FAB: --primary-default bg
│                                        │+│  │  FAB icon: --primary-on-accent
│                                        ╰─╯  │  FAB shadow: rgba(91, 91, 214, 0.25) (primary-flavored shadow)
└─────────────────────────────────────────────┘
```

**Detailed token assignments:**

| UI element | Token |
|---|---|
| Paper/base background | `--bg-base` #FAFAF7 |
| App bar background | `--bg-base` (transparent merge) |
| Date label ("Mon, Apr 24") | `--text-secondary` #5A5954 |
| "Today" heading | `--text-primary` #1A1A17, Inter 28 semibold |
| Menu / search icons | `--text-secondary` |
| **XP bar** container | `--bg-surface` with `--border-subtle` |
| Level badge fill | `--primary-default` #5B5BD6 |
| Level badge number | `--primary-on-accent` #FFFFFF |
| XP progress fill | `--primary-default` |
| XP track (unfilled) | `--primary-subtle` #EEEEFB |
| "230 / 500 XP" label | `--text-secondary` |
| **Stats strip cards** (each) | `--bg-surface` bg, `--border-subtle` border, `border-radius: 12px` |
| Streak flame icon | `--secondary-default` #E8804A |
| Streak "12" number | `--text-primary` (default) or `--secondary-strong` (gamified emphasis) |
| Daily goal target icon | `--primary-default` |
| Focused time timer icon | `--text-secondary` |
| Card label ("Streak", "Goal", "Focused") | `--text-tertiary`, 12px uppercase |
| **Main Quest hero card** bg | `--bg-surface` #FFFFFF |
| Hero card left accent bar | `border-left: 3px solid --secondary-default` |
| Hero card outer border | `--border-default` #D8D6CE |
| "MAIN QUEST" eyebrow | `--secondary-strong` #B54708, 11px uppercase tracked |
| Hero title | `--text-primary`, 18–20px semibold |
| Meta chips (subtasks, notes, time) | `--bg-elevated` bg, `--text-secondary` text, `--border-subtle` border |
| XP chip ("+80 XP") | `--primary-subtle` bg, `--primary-default` text, weight 600 |
| "Start focus" CTA | `--primary-default` bg, `--primary-on-accent` text; hover → `--primary-hover` |
| **Party quest rows** bg | transparent on `--bg-base`; hover `--bg-elevated` |
| Checkbox border | `--border-default`; on check: fill `--success`, icon white |
| P1 pill | bg `--danger-subtle` #FEE2E2, text `#B91C1C`, 11px bold |
| P2 pill | bg `--warning-subtle` #FEF3C7, text `#B45309`, 11px bold |
| Task title | `--text-primary` |
| Task meta icons (time/notes) | `--text-tertiary` |
| Row XP chip | Same as hero XP chip |
| Completed task | `--text-tertiary`, `text-decoration: line-through` |
| Section dividers between quests | `--border-subtle` |
| **Tomorrow** section title | `--text-tertiary`, 12px uppercase |
| Tomorrow task row text | `--text-tertiary` (dimmed) |
| **Tab bar** bg | `--bg-surface` |
| Tab bar top border | `--border-default` |
| Active tab icon + label | `--primary-default` |
| Inactive tab icon | `--text-tertiary` |
| **FAB** fill | `--primary-default` |
| FAB icon | `--primary-on-accent` |
| FAB shadow | `0 8px 24px rgba(91, 91, 214, 0.28)` |

---

## 6. CSS Custom Properties (copy‑paste ready)

```css
:root {
  /* ── Neutrals ───────────────────────────────── */
  --color-bg-base: #FAFAF7;
  --color-bg-surface: #FFFFFF;
  --color-bg-elevated: #F5F4EF;
  --color-border-subtle: #EDECE6;
  --color-border-default: #D8D6CE;
  --color-text-primary: #1A1A17;
  --color-text-secondary: #5A5954;
  --color-text-tertiary: #8E8C85;

  /* ── Primary accent (Indigo) ────────────────── */
  --color-primary: #5B5BD6;
  --color-primary-hover: #4B4BC2;
  --color-primary-subtle: #EEEEFB;
  --color-primary-on-accent: #FFFFFF;

  /* ── Secondary accent (Ember) ───────────────── */
  --color-secondary: #E8804A;
  --color-secondary-subtle: #FBEAD9;
  --color-secondary-on-accent: #FFFFFF;   /* 14px+ bold only */
  --color-secondary-strong: #B54708;      /* for ember as text */

  /* ── Semantic ───────────────────────────────── */
  --color-success: #15803D;
  --color-success-subtle: #DCFCE7;
  --color-warning: #B45309;
  --color-warning-subtle: #FEF3C7;
  --color-info: #2563EB;
  --color-danger: #B91C1C;
  --color-danger-subtle: #FEE2E2;

  /* ── Shadows & elevation (primary-flavored) ─── */
  --shadow-sm: 0 1px 2px rgba(26, 26, 23, 0.04);
  --shadow-card: 0 1px 3px rgba(26, 26, 23, 0.05), 0 2px 8px rgba(26, 26, 23, 0.04);
  --shadow-fab: 0 8px 24px rgba(91, 91, 214, 0.28);

  /* ── Focus ring ─────────────────────────────── */
  --ring: 0 0 0 3px rgba(91, 91, 214, 0.35);
}

/* Future: dark mode stub (see §8) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #0F0F12;
    --color-bg-surface: #17171B;
    --color-bg-elevated: #1F1F24;
    --color-border-subtle: #26262C;
    --color-border-default: #33333B;
    --color-text-primary: #F2F1ED;
    --color-text-secondary: #A8A79F;
    --color-text-tertiary: #6F6E68;
    --color-primary: #8F8FEA;
    --color-primary-hover: #A3A3F0;
    --color-primary-subtle: rgba(143, 143, 234, 0.14);
    --color-primary-on-accent: #0F0F12;
    --color-secondary: #F0956A;
    --color-secondary-subtle: rgba(240, 149, 106, 0.16);
    --color-secondary-strong: #F0956A;
  }
}
```

---

## 7. Tailwind Config Extension (v3 & v4 compatible)

### Tailwind v3 (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neutrals
        paper:     "#FAFAF7",
        surface:   "#FFFFFF",
        elevated:  "#F5F4EF",
        border: {
          subtle:  "#EDECE6",
          DEFAULT: "#D8D6CE",
        },
        ink: {
          primary:   "#1A1A17",
          secondary: "#5A5954",
          tertiary:  "#8E8C85",
        },

        // Accents
        primary: {
          DEFAULT: "#5B5BD6",
          hover:   "#4B4BC2",
          subtle:  "#EEEEFB",
          fg:      "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E8804A",
          subtle:  "#FBEAD9",
          fg:      "#FFFFFF",
          strong:  "#B54708",
        },

        // Semantic
        success:       { DEFAULT: "#15803D", subtle: "#DCFCE7" },
        warning:       { DEFAULT: "#B45309", subtle: "#FEF3C7" },
        info:          { DEFAULT: "#2563EB" },
        danger:        { DEFAULT: "#B91C1C", subtle: "#FEE2E2" },
      },
      boxShadow: {
        sm:   "0 1px 2px rgba(26,26,23,0.04)",
        card: "0 1px 3px rgba(26,26,23,0.05), 0 2px 8px rgba(26,26,23,0.04)",
        fab:  "0 8px 24px rgba(91,91,214,0.28)",
      },
      ringColor: {
        DEFAULT: "rgba(91,91,214,0.35)",
      },
    },
  },
} satisfies Config;
```

### Tailwind v4 (`@theme` in globals.css)

Tailwind v4 uses the `@theme` directive with OKLCH for a wider gamut ([Tailwind v4 colors doc](https://tailwindcss.com/docs/colors)):

```css
@import "tailwindcss";

@theme {
  --color-paper:     #FAFAF7;
  --color-surface:   #FFFFFF;
  --color-elevated:  #F5F4EF;
  --color-border-subtle:  #EDECE6;
  --color-border-default: #D8D6CE;
  --color-ink-primary:   #1A1A17;
  --color-ink-secondary: #5A5954;
  --color-ink-tertiary:  #8E8C85;

  --color-primary:        #5B5BD6;
  --color-primary-hover:  #4B4BC2;
  --color-primary-subtle: #EEEEFB;
  --color-primary-fg:     #FFFFFF;

  --color-secondary:        #E8804A;
  --color-secondary-subtle: #FBEAD9;
  --color-secondary-fg:     #FFFFFF;
  --color-secondary-strong: #B54708;

  --color-success:        #15803D;
  --color-success-subtle: #DCFCE7;
  --color-warning:        #B45309;
  --color-warning-subtle: #FEF3C7;
  --color-info:           #2563EB;
  --color-danger:         #B91C1C;
  --color-danger-subtle:  #FEE2E2;
}
```

Usage examples:

```tsx
// Main Quest hero card
<div className="bg-surface border border-border rounded-xl shadow-card border-l-4 border-l-secondary p-5">
  <span className="text-[11px] uppercase tracking-wider font-semibold text-secondary-strong">
    Main Quest
  </span>
  <h3 className="mt-1 text-lg font-semibold text-ink-primary">
    Ship SideQuest v1 landing page
  </h3>
  <button className="mt-4 bg-primary hover:bg-primary-hover text-primary-fg rounded-lg px-4 py-2 font-medium">
    ▶ Start focus
  </button>
</div>

// XP chip
<span className="bg-primary-subtle text-primary font-semibold text-xs rounded-md px-2 py-0.5">
  +80 XP
</span>

// Streak stats card
<div className="bg-surface border border-border-subtle rounded-xl p-4">
  <div className="flex items-center gap-2">
    <Flame className="text-secondary w-5 h-5" />
    <span className="text-2xl font-bold text-ink-primary tabular-nums">12</span>
  </div>
  <div className="text-xs uppercase tracking-wider text-ink-tertiary mt-1">Streak</div>
</div>
```

---

## 8. Comparison Table: SideQuest vs Reference Apps

| Aspect | Linear | Notion | Todoist | **SideQuest (this palette)** |
|---|---|---|---|---|
| Canvas | Near‑white, very slight gray tint | Pure `#FFFFFF` | Warm near‑white `#FEFDFC` | **Warm paper `#FAFAF7`** — warmer than Linear, warmer than Notion, similar to Todoist/Arc |
| Text primary | Near‑black (Woodsmoke `#222326`) | `#37352F` warm dark | `#25221E` warm dark | **`#1A1A17`** — warmer than Linear, similar temperament to Notion/Todoist |
| Accent strategy | **Single** indigo accent `#5E6AD2`, everything else is neutral | **10 fixed colors**, used as text/bg highlights only | Red priority system (P1‑P4), otherwise neutral | **Two accents (dual‑role)**: indigo for progression/CTA (Linear‑style), ember for heat/streak/hero (new) |
| Primary accent hex | `#5E6AD2` | no single accent | no single accent | **`#5B5BD6`** — +1 contrast point vs Linear for AA body safety |
| Gamification hooks | none | none | Karma points (exists but invisible) | **Built‑in**: XP chip, level badge, streak flame, hero accent, all colored intentionally |
| Priority semantics | Label colors per priority | Emoji/color per user | Red → orange → blue → gray | **P1 deep red, P2 deep amber** — avoids using ember (which is streak) for priority confusion |
| Cool vs warm feel | Cool (indigo + neutral grays) | Cool‑neutral (nearly achromatic) | Warm neutrals | **Warm neutrals + cool indigo accent + warm ember accent** — balanced like Arc |
| "Gamification‑off" mode works? | N/A | N/A | Mostly | **Yes** — remove ember + XP chips and the rest is a clean Linear/Notion‑grade todo app |
| Dark mode approach | Separate palette, saturated indigo desaturates slightly | Separate palette, manual | Separate palette | Inverted neutrals; indigo lightens to `#8F8FEA`; ember lightens to `#F0956A` |

**Where SideQuest intentionally diverges:**
1. We use **warmer paper** than Linear (`#FAFAF7` vs Linear's cooler near‑white) because Things 3/Arc/Todoist all show warm canvases feel more tactile and human for long sessions — a Linear‑level gamified app would feel clinical on Linear's own canvas.
2. We commit to **two accents** instead of Linear's one. Linear can be monochromatic because it ships zero gamification; we have level/XP and streak/heat and they should be semantically different colors — otherwise streak hits would be indistinguishable from XP gains.
3. We avoid Habitica's red‑yellow‑green task‑value gradient entirely; tasks stay neutral and only the meta (priority pill, XP chip, streak flame) carries color. This is why the palette supports "gamification off" mode natively.

---

## 9. Dark Mode Direction (Brief)

A full dark‑mode spec is a separate phase. The direction:

- **Don't just invert.** As Hype4 and Vosidiy both argue, invert naively and the UI looks unrealistic; re‑tune saturation and create a matched scale ([Hype4 Dark Mode Essentials](https://hype4.academy/articles/design/dark-mode-ui-essentials-part-1), [Medium on dark mode organization](https://medium.com/design-bootcamp/dark-mode-ui-design-organizing-color-variables-and-naming-df3fa005ae77)).
- **Backgrounds rise with elevation** instead of fall. Base `#0F0F12` (slightly warm, not pure black, to match the warm‑paper logic), surface `#17171B`, elevated `#1F1F24`. Follows Figma `#1E1E1E`, YouTube `#181818`, Slack `#1D1D1D` ([LogRocket dark mode](https://blog.logrocket.com/ux-design/dark-mode-ui-design-best-practices-and-examples/)).
- **Text inverts to warm off‑white:** primary `#F2F1ED`, secondary `#A8A79F`, tertiary `#6F6E68`.
- **Desaturate the indigo ~25%** to `#8F8FEA` — full‑saturation `#5B5BD6` would visually vibrate on dark per Toptal's dark‑UI best practice ([Toptal dark UI](https://www.toptal.com/designers/ui/dark-ui-design)).
- **Lighten ember** to `#F0956A` so the flame still reads as warm but doesn't burn against a dark panel.
- **On‑accent text flips**: on dark mode the primary button still keeps white text, but CTAs with the lighter indigo `#8F8FEA` should have `#0F0F12` (base) as their foreground so contrast passes AA body.
- **Don't use pure black `#000`**; smearing causes eye strain. Don't use saturated pure accent colors on near‑black either.
- Keep the **Ember left accent on the Main Quest hero** — the `#F0956A` against `#17171B` reads beautifully and preserves the app's personality between modes.

---

## Citations

Primary sources used above:

- Linear brand colors, sidebar design, redesign philosophy — [Mobbin Linear profile](https://mobbin.com/colors/brand/linear), [Loftlyy Linear](https://www.loftlyy.com/en/linear), [Linear redesign blog](https://linear.app/now/how-we-redesigned-the-linear-ui), [Linear new UI changelog](https://linear.app/changelog/2024-03-20-new-linear-ui), [Linear custom themes changelog](https://linear.app/changelog/2020-12-04-themes)
- Notion palette — [Matthias Frank's Notion colors reference](https://matthiasfrank.de/en/notion-colors/), [Notion Avenue hex codes](https://www.notionavenue.co/post/notion-color-code-hex-palette)
- Todoist palette — [Mobbin Todoist](https://mobbin.com/colors/brand/todoist)
- Things 3 aesthetic — [Medium Things 3 workflow](https://alexsanchezdesigns.medium.com/how-i-organize-my-life-and-business-with-things-3-9f3bef8f3efd), [Cultured Code Things blog](https://culturedcode.com/things/blog/)
- Arc browser theme — [Devs Love Coffee Arc themes](https://www.devslovecoffee.com/blog/using-arc-theme-to-style-website)
- Raycast — [Loftlyy Raycast](https://www.loftlyy.com/en/raycast), [Raycast API Colors](https://developers.raycast.com/api-reference/user-interface/colors)
- Duolingo — [Duolingo Design brand colors](https://design.duolingo.com/identity/color), [Brand Palettes Duolingo](https://brandpalettes.com/duolingo-colors/)
- Habitica task value coloring — [Habitica wiki](https://habitica.fandom.com/wiki/Task_Value)
- Finch pastel/soft rationale — [aViewFromTheCave on Finch](https://www.aviewFromthecave.com/what-is-finch-app/)
- Radix Colors composition, natural pairings — [Radix Colors composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette), [Radix Themes color docs](https://www.radix-ui.com/themes/docs/theme/color)
- Tailwind v4 colors & OKLCH — [Tailwind Colors docs](https://tailwindcss.com/docs/colors), [Tailscan Tailwind cheatsheet](https://tailscan.com/colors)
- Indigo + Amber as 2025 trend pairing — [Codeska 2025 color combos](https://codeska.com/blog/color-schemes-2025), [Larimar amber + blue guide](https://larimarcreations.com/blogs/news/amber-and-blue)
- WCAG contrast formula & thresholds — [W3C Contrast Minimum](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), [WebAIM Contrast article](https://webaim.org/articles/contrast/)
- Eye‑strain rationale for warm off‑white over pure white and warm near‑black over pure black — [Pixelait on eye irritation](https://pixelait.com/learn/how-to-choose-website-colors-that-arent-eye-irritating/), [Design for Ducks on alternatives to white](https://designforducks.com/alternative-to-white-background-for-website-and-app-ui/), [Design for Ducks on readability and fatigue](https://designforducks.com/colors-effect-on-readability-and-vision-fatigue/)
- Dark‑mode accent desaturation — [Hype4 Dark Mode Essentials](https://hype4.academy/articles/design/dark-mode-ui-essentials-part-1), [Toptal Dark UI](https://www.toptal.com/designers/ui/dark-ui-design), [LogRocket dark mode](https://blog.logrocket.com/ux-design/dark-mode-ui-design-best-practices-and-examples/)
- Gamification pattern refs (streak flame icon, XP chip) — [Plotline streaks & milestones](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps/), [CleverTap app gamification examples](https://clevertap.com/blog/app-gamification-examples/), [shadcn/ui React streak block](https://www.shadcn.io/blocks/todo-list-streak-counter)