// Wireframe primitives — mid-fi monochrome, hand-drawn feel
// Design language: thin strokes, boxed placeholders, all grayscale, quest/RPG iconography as simple glyphs

const wfColors = {
  ink: '#111',
  text: '#2a2a2a',
  muted: '#6b6b6b',
  faint: '#9a9a9a',
  line: '#c9c9c9',
  hair: '#e4e4e4',
  paper: '#fafaf7',
  surface: '#ffffff',
  fill: '#efede6',
  accent: '#111', // monochrome wireframe — "accent" is still ink
};

const wfFont = {
  sans: '-apple-system, "SF Pro Text", system-ui, sans-serif',
  mono: '"SF Mono", "JetBrains Mono", ui-monospace, monospace',
  display: '"SF Pro Display", -apple-system, system-ui, sans-serif',
};

// ── Typography ───────────────────────────────────────────
function WFLabel({ children, size = 11, color = wfColors.muted, style = {} }) {
  return (
    <div style={{
      fontFamily: wfFont.mono, fontSize: size, letterSpacing: 1.2,
      textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

function WFHeading({ children, size = 22, weight = 600, style = {} }) {
  return (
    <div style={{
      fontFamily: wfFont.display, fontSize: size, fontWeight: weight,
      color: wfColors.ink, letterSpacing: -0.3, lineHeight: 1.15, ...style,
    }}>{children}</div>
  );
}

function WFText({ children, size = 14, color = wfColors.text, weight = 400, style = {} }) {
  return (
    <div style={{
      fontFamily: wfFont.sans, fontSize: size, fontWeight: weight,
      color, letterSpacing: -0.1, lineHeight: 1.35, ...style,
    }}>{children}</div>
  );
}

// Text underline used to represent "copy placeholder" — ala sketch wireframes
function WFLorem({ lines = 2, width = '100%' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 8, background: wfColors.hair, borderRadius: 2,
          width: i === lines - 1 ? '62%' : '100%',
        }} />
      ))}
    </div>
  );
}

// ── Box placeholders ─────────────────────────────────────
function WFBox({ w = '100%', h = 40, radius = 8, label, style = {}, dashed = false, cross = false }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      border: `1px ${dashed ? 'dashed' : 'solid'} ${wfColors.line}`,
      background: wfColors.surface,
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      {cross && (
        <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%" preserveAspectRatio="none">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke={wfColors.hair} strokeWidth="1" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke={wfColors.hair} strokeWidth="1" />
        </svg>
      )}
      {label && (
        <WFLabel size={9} color={wfColors.faint} style={{ position: 'relative', zIndex: 1 }}>{label}</WFLabel>
      )}
    </div>
  );
}

// Circle placeholder (avatar, icon frame)
function WFCircle({ size = 40, label, style = {} }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1px solid ${wfColors.line}`,
      background: wfColors.surface,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, ...style,
    }}>
      {label && <WFLabel size={8} color={wfColors.faint}>{label}</WFLabel>}
    </div>
  );
}

// ── Glyphs — low-fi quest/RPG icons drawn as thin-stroke SVGs ──
function WFGlyph({ kind, size = 16, color = wfColors.ink }) {
  const s = size;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const map = {
    quest: <svg {...props}><path d="M12 2l2.5 6.5L21 9l-5 4.5 1.5 7L12 17l-5.5 3.5L8 13.5 3 9l6.5-.5z"/></svg>,
    check: <svg {...props}><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M7 12l3.5 3.5L17 9"/></svg>,
    circle: <svg {...props}><circle cx="12" cy="12" r="9"/></svg>,
    flame: <svg {...props}><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z"/></svg>,
    target: <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>,
    calendar: <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>,
    plus: <svg {...props}><path d="M12 5v14M5 12h14"/></svg>,
    back: <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>,
    more: <svg {...props}><circle cx="5" cy="12" r="1" fill={color} stroke="none"/><circle cx="12" cy="12" r="1" fill={color} stroke="none"/><circle cx="19" cy="12" r="1" fill={color} stroke="none"/></svg>,
    menu: <svg {...props}><path d="M4 7h16M4 12h16M4 17h10"/></svg>,
    search: <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>,
    play: <svg {...props}><path d="M7 5l12 7-12 7V5z" fill={color}/></svg>,
    pause: <svg {...props}><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>,
    attach: <svg {...props}><path d="M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7"/></svg>,
    note: <svg {...props}><path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5M9 13h7M9 17h5"/></svg>,
    subtask: <svg {...props}><path d="M4 6h14M8 12h12M12 18h10"/></svg>,
    chevron: <svg {...props}><path d="M9 6l6 6-6 6"/></svg>,
    xp: <svg {...props}><path d="M4 20L10 4l2 8 2-5 2 5 4-4"/></svg>,
    shield: <svg {...props}><path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/></svg>,
    coin: <svg {...props}><circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9h5a2 2 0 0 1 0 4H9m0 0h6"/></svg>,
    sword: <svg {...props}><path d="M14 4h6v6L8 22l-4-4z"/><path d="M5 19l3 3M14 4L4 14"/></svg>,
    scroll: <svg {...props}><path d="M5 4h11v14a3 3 0 0 0 3 3H8a3 3 0 0 1-3-3V4z"/><path d="M8 9h5M8 13h5"/></svg>,
    crown: <svg {...props}><path d="M3 18h18l-1.5-9-4.5 4-3-6-3 6-4.5-4z"/></svg>,
    bolt: <svg {...props}><path d="M13 3L4 14h6l-1 7 9-11h-6z"/></svg>,
    heart: <svg {...props}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>,
    map: <svg {...props}><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/></svg>,
    inbox: <svg {...props}><path d="M3 12l3-7h12l3 7v7H3z"/><path d="M3 12h5l1 3h6l1-3h5"/></svg>,
    settings: <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.4-.9a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4.9 2-3.4-2-1.5a7 7 0 0 0 .1-1.2z"/></svg>,
    timer: <svg {...props}><circle cx="12" cy="14" r="7"/><path d="M12 14V10M9 3h6M12 7V5"/></svg>,
    mic: <svg {...props}><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>,
    close: <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>,
    trophy: <svg {...props}><path d="M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 20h6M12 15v5"/></svg>,
  };
  return map[kind] || null;
}

// ── Section divider with label (wireframe convention) ───
function WFSection({ label, children, right, style = {} }) {
  return (
    <div style={{ padding: '0 20px 16px', ...style }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <WFLabel>{label}</WFLabel>
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Quest/task row — core repeating element ─────────────
function WFTaskRow({
  title, meta, xp, done = false, compact = false, hasSub = false,
  priority, progress, onClick, style = {},
}) {
  const pad = compact ? '10px 12px' : '14px 14px';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: pad, borderRadius: 10,
      border: `1px solid ${wfColors.line}`,
      background: wfColors.surface,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {/* checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: `1.5px solid ${done ? wfColors.ink : wfColors.line}`,
        background: done ? wfColors.ink : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        {done && <WFGlyph kind="check" size={14} color="#fff" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {priority && (
            <div style={{
              fontFamily: wfFont.mono, fontSize: 9, padding: '2px 5px',
              border: `1px solid ${wfColors.line}`, borderRadius: 3,
              color: wfColors.muted, letterSpacing: 0.5,
            }}>{priority}</div>
          )}
          <WFText size={compact ? 13 : 14} weight={500} style={{
            textDecoration: done ? 'line-through' : 'none',
            color: done ? wfColors.faint : wfColors.ink,
          }}>{title}</WFText>
        </div>
        {meta && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
            {meta.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {m.icon && <WFGlyph kind={m.icon} size={11} color={wfColors.muted} />}
                <WFText size={11} color={wfColors.muted}>{m.text}</WFText>
              </div>
            ))}
          </div>
        )}
        {progress !== undefined && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              flex: 1, height: 4, borderRadius: 2,
              background: wfColors.hair, overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: wfColors.ink,
              }} />
            </div>
            <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>
              {progress}%
            </WFText>
          </div>
        )}
      </div>

      {xp !== undefined && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0,
          padding: '3px 7px', border: `1px solid ${wfColors.line}`, borderRadius: 10,
        }}>
          <WFGlyph kind="bolt" size={10} color={wfColors.ink} />
          <WFText size={11} weight={600} style={{ fontFamily: wfFont.mono }}>+{xp}</WFText>
        </div>
      )}
    </div>
  );
}

// ── XP / level bar ──────────────────────────────────────
function WFXPBar({ level, current, max, title = 'ADVENTURER LV.', compact = false }) {
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div style={{
      padding: compact ? '10px 12px' : '14px 16px',
      border: `1px solid ${wfColors.line}`, borderRadius: 12,
      background: wfColors.surface,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <WFLabel size={9}>{title}</WFLabel>
          <div style={{
            padding: '1px 6px', background: wfColors.ink, color: '#fff',
            borderRadius: 3, fontFamily: wfFont.mono, fontSize: 11, fontWeight: 600,
          }}>{level}</div>
        </div>
        <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>
          {current}/{max} XP
        </WFText>
      </div>
      <div style={{ position: 'relative', height: 6, background: wfColors.hair, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: wfColors.ink }} />
        {/* segment ticks for RPG feel */}
        {[25, 50, 75].map(x => (
          <div key={x} style={{
            position: 'absolute', left: `${x}%`, top: 0, bottom: 0, width: 1,
            background: wfColors.surface, opacity: 0.8,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Tab bar at bottom ───────────────────────────────────
function WFTabBar({ active, onNav }) {
  const tabs = [
    { id: 'today', label: 'Today', icon: 'flame' },
    { id: 'quests', label: 'Quests', icon: 'quest' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'codex', label: 'Codex', icon: 'scroll' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '10px 12px 28px', paddingBottom: 34,
      background: wfColors.surface,
      borderTop: `1px solid ${wfColors.hair}`,
      display: 'flex', justifyContent: 'space-around',
      zIndex: 50,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <div key={t.id} onClick={() => onNav && onNav(t.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 14px', borderRadius: 8,
            cursor: 'pointer',
            background: isActive ? wfColors.fill : 'transparent',
          }}>
            <WFGlyph kind={t.icon} size={20} color={isActive ? wfColors.ink : wfColors.muted} />
            <WFText size={10} weight={isActive ? 600 : 400} color={isActive ? wfColors.ink : wfColors.muted}
              style={{ fontFamily: wfFont.mono, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              {t.label}
            </WFText>
          </div>
        );
      })}
    </div>
  );
}

// ── Screen-top app bar (wireframe style, not iOS chrome) ─
function WFAppBar({ title, leading, trailing, subtitle }) {
  return (
    <div style={{
      padding: '8px 16px 12px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {leading}
      <div style={{ flex: 1 }}>
        {subtitle && <WFLabel size={9}>{subtitle}</WFLabel>}
        <WFHeading size={20}>{title}</WFHeading>
      </div>
      {trailing}
    </div>
  );
}

// ── Icon button (tap target) ────────────────────────────
function WFIconBtn({ icon, onClick, size = 36, style = {} }) {
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2,
      border: `1px solid ${wfColors.line}`,
      background: wfColors.surface,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, cursor: 'pointer', ...style,
    }}>
      <WFGlyph kind={icon} size={16} />
    </div>
  );
}

// ── Annotation callout dot — numbered bubble ────────────
function WFCallout({ n, style = {}, dark = false }) {
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%',
      background: dark ? wfColors.ink : '#ff5a3c',
      color: '#fff',
      fontFamily: wfFont.mono, fontSize: 11, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
      border: '2px solid #fff',
      position: 'absolute', zIndex: 100,
      ...style,
    }}>{n}</div>
  );
}

// ── Button (wireframe style) ────────────────────────────
function WFBtn({ children, primary = false, full = false, style = {}, onClick, icon, size = 'md' }) {
  const heights = { sm: 32, md: 44, lg: 52 };
  const h = heights[size];
  return (
    <div onClick={onClick} style={{
      height: h, padding: '0 18px', borderRadius: h / 2,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      background: primary ? wfColors.ink : 'transparent',
      border: `1px solid ${wfColors.ink}`,
      color: primary ? '#fff' : wfColors.ink,
      fontFamily: wfFont.sans, fontSize: 14, fontWeight: 600,
      width: full ? '100%' : 'auto', cursor: 'pointer',
      ...style,
    }}>
      {icon && <WFGlyph kind={icon} size={14} color={primary ? '#fff' : wfColors.ink} />}
      {children}
    </div>
  );
}

Object.assign(window, {
  wfColors, wfFont,
  WFLabel, WFHeading, WFText, WFLorem,
  WFBox, WFCircle, WFGlyph,
  WFSection, WFTaskRow, WFXPBar, WFTabBar, WFAppBar, WFIconBtn, WFCallout, WFBtn,
});
