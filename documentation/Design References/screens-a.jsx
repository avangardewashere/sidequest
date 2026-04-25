// Screens A: Onboarding, Today, Main list, Calendar

// ═══════════════════════════════════════════════════════════
// ONBOARDING — intro to the quest system
// ═══════════════════════════════════════════════════════════
function ScreenOnboarding({ density, showAnnotations, gamification, nav }) {
  const comfy = density === 'comfy';
  return (
    <div data-screen-label="Onboarding" style={{ height: '100%', background: wfColors.paper, position: 'relative', overflow: 'hidden' }}>
      <div style={{ paddingTop: 70, padding: '70px 20px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 32 }} data-annot="1">
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfColors.ink }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfColors.ink }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfColors.hair }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: wfColors.hair }} />
        </div>

        <WFLabel>Step 02 / 04</WFLabel>
        <WFHeading size={30} style={{ marginTop: 8, marginBottom: 14 }}>
          Choose your path
        </WFHeading>
        <WFText size={14} color={wfColors.muted} style={{ marginBottom: 28, lineHeight: 1.5 }}>
          Your quest style shapes XP rewards, streak mechanics, and how completion feels. Change it anytime in Codex → Settings.
        </WFText>

        {/* Path selection cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} data-annot="2">
          {[
            { k: 'The Strategist', d: 'Deep-focus sessions. Fewer, larger quests.', icon: 'target', sel: false },
            { k: 'The Adventurer', d: 'Balanced. Daily quests, streaks, steady XP.', icon: 'sword', sel: true },
            { k: 'The Minimalist', d: 'Gamification off. Clean list, progress only.', icon: 'circle', sel: false },
          ].map(o => (
            <div key={o.k} style={{
              padding: '14px 16px', borderRadius: 12,
              border: `${o.sel ? 2 : 1}px solid ${o.sel ? wfColors.ink : wfColors.line}`,
              background: o.sel ? wfColors.fill : wfColors.surface,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                border: `1px solid ${wfColors.line}`, background: wfColors.surface,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <WFGlyph kind={o.icon} size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <WFText size={15} weight={600}>{o.k}</WFText>
                <WFText size={12} color={wfColors.muted} style={{ marginTop: 2 }}>{o.d}</WFText>
              </div>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                border: `1.5px solid ${o.sel ? wfColors.ink : wfColors.line}`,
                background: o.sel ? wfColors.ink : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {o.sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', gap: 10 }} data-annot="3">
          <WFBtn onClick={() => nav('today')} style={{ flex: 0 }}>Skip</WFBtn>
          <WFBtn primary full onClick={() => nav('today')} icon="chevron">Continue</WFBtn>
        </div>
      </div>

      {/* Annotations */}
      {showAnnotations && (
        <>
          <WFCallout n="1" style={{ top: 80, right: 28 }} />
          <WFCallout n="2" style={{ top: 240, right: 28 }} />
          <WFCallout n="3" style={{ bottom: 90, right: 28 }} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TODAY — focus view, hero screen
// ═══════════════════════════════════════════════════════════
function ScreenToday({ density, showAnnotations, gamification, nav }) {
  const showXP = gamification !== 'off';
  const showStreaks = gamification === 'heavy';
  const compact = density === 'compact';

  return (
    <div data-screen-label="Today" style={{ height: '100%', background: wfColors.paper, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100, paddingTop: 60 }}>

        {/* App bar */}
        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <WFIconBtn icon="menu" onClick={() => nav('sidebar')} />
          <div style={{ flex: 1 }}>
            <WFLabel size={9}>FRIDAY · APR 24</WFLabel>
            <WFHeading size={26} style={{ marginTop: 2 }}>Today's Quests</WFHeading>
          </div>
          <WFIconBtn icon="search" />
        </div>

        {/* XP / Streak hero */}
        {showXP && (
          <div style={{ padding: '14px 20px 0' }} data-annot="1">
            <WFXPBar level={14} current={2340} max={3000} title="ADVENTURER" />
          </div>
        )}

        {/* Quick stats row */}
        {showXP && (
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8 }} data-annot="2">
            {[
              { label: 'DONE', value: '3/8', icon: 'check' },
              ...(showStreaks ? [{ label: 'STREAK', value: '12d', icon: 'flame' }] : []),
              { label: 'FOCUS', value: '1h 24m', icon: 'timer' },
            ].map(s => (
              <div key={s.label} style={{
                flex: 1, padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${wfColors.line}`, background: wfColors.surface,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <WFGlyph kind={s.icon} size={11} color={wfColors.muted} />
                  <WFLabel size={8}>{s.label}</WFLabel>
                </div>
                <WFText size={16} weight={600} style={{ marginTop: 4, fontFamily: wfFont.mono }}>{s.value}</WFText>
              </div>
            ))}
          </div>
        )}

        {/* Daily Quest callout */}
        {showStreaks && (
          <div style={{ padding: '16px 20px 0' }} data-annot="3">
            <div style={{
              padding: '12px 14px', borderRadius: 10,
              border: `1.5px dashed ${wfColors.ink}`,
              background: wfColors.surface,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                border: `1px solid ${wfColors.ink}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <WFGlyph kind="crown" size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WFLabel size={9} color={wfColors.ink}>DAILY COMMISSION</WFLabel>
                  <div style={{ padding: '1px 5px', background: wfColors.ink, color: '#fff', borderRadius: 3, fontFamily: wfFont.mono, fontSize: 9 }}>2/4</div>
                </div>
                <WFText size={13} weight={500} style={{ marginTop: 2 }}>Complete 4 quests · +150 XP bonus</WFText>
              </div>
              <WFGlyph kind="chevron" size={14} color={wfColors.muted} />
            </div>
          </div>
        )}

        {/* Active Quest — in-progress with timer */}
        <div style={{ padding: '18px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>IN PROGRESS</WFLabel>
          <WFText size={11} color={wfColors.muted}>1 active</WFText>
        </div>
        <div style={{ padding: '0 20px' }} data-annot="4">
          <div style={{
            padding: '14px 14px', borderRadius: 12,
            border: `1.5px solid ${wfColors.ink}`,
            background: wfColors.surface,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: wfColors.ink,
                boxShadow: `0 0 0 3px ${wfColors.fill}`,
              }} />
              <WFLabel size={9} color={wfColors.ink}>ACTIVE · FOCUS MODE</WFLabel>
              <div style={{ flex: 1 }} />
              <WFText size={13} weight={600} style={{ fontFamily: wfFont.mono }}>17:42</WFText>
            </div>
            <WFText size={15} weight={600}>Draft Q2 product strategy memo</WFText>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              <WFGlyph kind="subtask" size={11} color={wfColors.muted} />
              <WFText size={11} color={wfColors.muted}>3 of 5 subtasks</WFText>
              <WFGlyph kind="bolt" size={11} color={wfColors.muted} />
              <WFText size={11} color={wfColors.muted}>+80 XP on complete</WFText>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <WFBtn size="sm" style={{ flex: 1 }} icon="pause">Pause</WFBtn>
              <WFBtn size="sm" primary style={{ flex: 1 }} onClick={() => nav('detail')} icon="chevron">Open</WFBtn>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div style={{ padding: '18px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>QUEUED · 4</WFLabel>
          <WFText size={11} color={wfColors.muted}>Sort by priority</WFText>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }} data-annot="5">
          <WFTaskRow title="Review design system PR #2847" priority="P1"
            meta={[{ icon: 'calendar', text: '10:30 AM' }, { icon: 'subtask', text: '2 subs' }]}
            xp={showXP ? 40 : undefined} compact={compact} onClick={() => nav('detail')} />
          <WFTaskRow title="Sync with design lead re: onboarding" priority="P2"
            meta={[{ icon: 'calendar', text: '2:00 PM' }]}
            xp={showXP ? 30 : undefined} compact={compact} onClick={() => nav('detail')} />
          <WFTaskRow title="Finalize week's timesheet" priority="P3"
            meta={[{ icon: 'timer', text: '15 min' }]}
            xp={showXP ? 20 : undefined} compact={compact} onClick={() => nav('detail')} />
          <WFTaskRow title="Respond to 3 blocked threads in #design"
            meta={[{ icon: 'flame', text: 'Quick win' }]}
            xp={showXP ? 15 : undefined} compact={compact} onClick={() => nav('detail')} />
        </div>

        {/* Completed (collapsed) */}
        <div style={{ padding: '20px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>CLAIMED · 3</WFLabel>
          <WFText size={11} color={wfColors.muted} style={{ textDecoration: 'underline' }}>Show</WFText>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <WFTaskRow title="Morning standup notes" done compact xp={showXP ? 15 : undefined} />
          <WFTaskRow title="Reply to onboarding feedback thread" done compact xp={showXP ? 25 : undefined} />
        </div>
      </div>

      {/* FAB */}
      <div onClick={() => nav('quickadd')} style={{
        position: 'absolute', right: 20, bottom: 104,
        width: 56, height: 56, borderRadius: 28,
        background: wfColors.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
        zIndex: 60, cursor: 'pointer',
      }} data-annot="6">
        <WFGlyph kind="plus" size={22} color="#fff" />
      </div>

      <WFTabBar active="today" onNav={(t) => {
        if (t === 'quests') nav('list');
        if (t === 'calendar') nav('calendar');
        if (t === 'codex') nav('sidebar');
      }} />

      {/* Annotations */}
      {showAnnotations && (
        <>
          {showXP && <WFCallout n="1" style={{ top: 138, right: 8 }} />}
          {showXP && <WFCallout n="2" style={{ top: 226, right: 8 }} />}
          {showStreaks && <WFCallout n="3" style={{ top: 310, right: 8 }} />}
          <WFCallout n="4" style={{ top: showStreaks ? 430 : 310, right: 8 }} />
          <WFCallout n="5" style={{ top: showStreaks ? 620 : 500, right: 8 }} />
          <WFCallout n="6" style={{ bottom: 108, right: 52 }} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN LIST — quests (projects view)
// ═══════════════════════════════════════════════════════════
function ScreenList({ density, showAnnotations, gamification, nav }) {
  const showXP = gamification !== 'off';
  const compact = density === 'compact';

  return (
    <div data-screen-label="Quest List" style={{ height: '100%', background: wfColors.paper, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100, paddingTop: 60 }}>

        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <WFIconBtn icon="menu" onClick={() => nav('sidebar')} />
          <div style={{ flex: 1 }}>
            <WFLabel size={9}>PROJECT</WFLabel>
            <WFHeading size={24} style={{ marginTop: 2 }}>Q2 Redesign</WFHeading>
          </div>
          <WFIconBtn icon="more" />
        </div>

        {/* Project progress ring + stats */}
        <div style={{ padding: '14px 20px 0' }} data-annot="1">
          <div style={{
            padding: '14px 16px', borderRadius: 12,
            border: `1px solid ${wfColors.line}`, background: wfColors.surface,
            display: 'flex', gap: 16, alignItems: 'center',
          }}>
            {/* progress ring */}
            <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke={wfColors.hair} strokeWidth="5" />
                <circle cx="32" cy="32" r="26" fill="none" stroke={wfColors.ink} strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 26 * 0.58} ${2 * Math.PI * 26}`}
                  strokeDashoffset={0} strokeLinecap="round"
                  transform="rotate(-90 32 32)" />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <WFText size={16} weight={700} style={{ fontFamily: wfFont.mono }}>58%</WFText>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div>
                  <WFLabel size={8}>QUESTS</WFLabel>
                  <WFText size={14} weight={600} style={{ marginTop: 2, fontFamily: wfFont.mono }}>14/24</WFText>
                </div>
                <div>
                  <WFLabel size={8}>DUE</WFLabel>
                  <WFText size={14} weight={600} style={{ marginTop: 2, fontFamily: wfFont.mono }}>May 18</WFText>
                </div>
                {showXP && (
                  <div>
                    <WFLabel size={8}>XP POOL</WFLabel>
                    <WFText size={14} weight={600} style={{ marginTop: 2, fontFamily: wfFont.mono }}>840</WFText>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 8, height: 4, background: wfColors.hair, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: '58%', height: '100%', background: wfColors.ink }} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{
          padding: '14px 20px 0', display: 'flex', gap: 6, overflowX: 'auto',
        }} data-annot="2">
          {[
            { l: 'All', active: true, c: 24 },
            { l: 'Active', c: 8 },
            { l: 'Blocked', c: 2 },
            { l: 'Done', c: 14 },
            { l: 'Mine', c: 11 },
          ].map(c => (
            <div key={c.l} style={{
              padding: '6px 12px', borderRadius: 14, flexShrink: 0,
              border: `1px solid ${c.active ? wfColors.ink : wfColors.line}`,
              background: c.active ? wfColors.ink : 'transparent',
              color: c.active ? '#fff' : wfColors.text,
              fontFamily: wfFont.sans, fontSize: 12, fontWeight: 500,
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              {c.l}
              <span style={{ opacity: 0.6, fontFamily: wfFont.mono, fontSize: 10 }}>{c.c}</span>
            </div>
          ))}
        </div>

        {/* Grouped by stage */}
        <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>ACT I · DISCOVERY</WFLabel>
          <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>6/6</WFText>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <WFTaskRow title="User research synthesis" done compact xp={showXP ? 60 : undefined} />
          <WFTaskRow title="Competitive audit" done compact xp={showXP ? 40 : undefined} />
        </div>

        <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>ACT II · DESIGN</WFLabel>
          <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>5/10</WFText>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }} data-annot="3">
          <WFTaskRow title="Information architecture v2" priority="P1"
            meta={[{ icon: 'calendar', text: 'Apr 28' }, { icon: 'subtask', text: '4 subs' }]}
            progress={75} xp={showXP ? 80 : undefined} onClick={() => nav('detail')} compact={compact} />
          <WFTaskRow title="Component library updates" priority="P1"
            meta={[{ icon: 'calendar', text: 'May 02' }, { icon: 'subtask', text: '8 subs' }]}
            progress={30} xp={showXP ? 120 : undefined} compact={compact} />
          <WFTaskRow title="Onboarding flow prototype" priority="P2"
            meta={[{ icon: 'calendar', text: 'May 05' }]}
            progress={10} xp={showXP ? 100 : undefined} compact={compact} />
          <WFTaskRow title="Pricing page hi-fi" priority="P2"
            meta={[{ icon: 'calendar', text: 'May 10' }]}
            xp={showXP ? 60 : undefined} compact={compact} />
        </div>

        <div style={{ padding: '20px 20px 8px' }}>
          <WFLabel>ACT III · HANDOFF</WFLabel>
        </div>
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.55 }}>
          <WFTaskRow title="Engineering spec review" compact xp={showXP ? 40 : undefined} />
          <WFTaskRow title="QA test plan walkthrough" compact xp={showXP ? 30 : undefined} />
        </div>
      </div>

      <div onClick={() => nav('quickadd')} style={{
        position: 'absolute', right: 20, bottom: 104,
        width: 56, height: 56, borderRadius: 28, background: wfColors.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(0,0,0,0.25)', zIndex: 60, cursor: 'pointer',
      }}>
        <WFGlyph kind="plus" size={22} color="#fff" />
      </div>

      <WFTabBar active="quests" onNav={(t) => {
        if (t === 'today') nav('today');
        if (t === 'calendar') nav('calendar');
        if (t === 'codex') nav('sidebar');
      }} />

      {showAnnotations && (
        <>
          <WFCallout n="1" style={{ top: 140, right: 8 }} />
          <WFCallout n="2" style={{ top: 254, right: 8 }} />
          <WFCallout n="3" style={{ top: 440, right: 8 }} />
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CALENDAR — schedule view
// ═══════════════════════════════════════════════════════════
function ScreenCalendar({ density, showAnnotations, gamification, nav }) {
  const showXP = gamification !== 'off';
  const days = ['M','T','W','T','F','S','S'];
  const weekXP = [60, 80, 40, 90, 20, 0, 0];
  const maxXP = Math.max(...weekXP);

  return (
    <div data-screen-label="Calendar" style={{ height: '100%', background: wfColors.paper, position: 'relative', overflow: 'hidden' }}>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 100, paddingTop: 60 }}>

        <div style={{ padding: '8px 20px 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <WFIconBtn icon="menu" onClick={() => nav('sidebar')} />
          <div style={{ flex: 1 }}>
            <WFLabel size={9}>WEEK 17</WFLabel>
            <WFHeading size={24} style={{ marginTop: 2 }}>April 2026</WFHeading>
          </div>
          <WFIconBtn icon="plus" />
        </div>

        {/* Week strip w/ XP bars */}
        <div style={{ padding: '14px 20px 0' }} data-annot="1">
          <div style={{
            padding: '14px 12px', borderRadius: 12,
            border: `1px solid ${wfColors.line}`, background: wfColors.surface,
            display: 'flex', justifyContent: 'space-between', gap: 4,
          }}>
            {days.map((d, i) => {
              const active = i === 4; // Friday
              const xp = weekXP[i];
              const h = maxXP > 0 ? (xp / maxXP) * 36 : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <WFLabel size={9} color={active ? wfColors.ink : wfColors.faint}>{d}</WFLabel>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? wfColors.ink : 'transparent',
                    border: active ? 'none' : `1px solid ${wfColors.hair}`,
                  }}>
                    <WFText size={13} weight={active ? 700 : 500}
                      color={active ? '#fff' : wfColors.text}
                      style={{ fontFamily: wfFont.mono }}>{20 + i}</WFText>
                  </div>
                  {showXP && (
                    <div style={{ width: 4, height: 36, background: wfColors.hair, borderRadius: 2, position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, width: '100%', height: h, background: wfColors.ink, borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Day schedule */}
        <div style={{ padding: '20px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <WFLabel>FRIDAY · APR 24</WFLabel>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ padding: '3px 8px', border: `1px solid ${wfColors.ink}`, borderRadius: 10, fontFamily: wfFont.mono, fontSize: 10 }}>Day</div>
            <div style={{ padding: '3px 8px', borderRadius: 10, fontFamily: wfFont.mono, fontSize: 10, color: wfColors.muted }}>Week</div>
          </div>
        </div>

        {/* Time blocks */}
        <div style={{ padding: '0 20px' }} data-annot="2">
          <div style={{ position: 'relative' }}>
            {['9', '10', '11', '12', '1', '2', '3'].map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, minHeight: 56, borderTop: `1px solid ${wfColors.hair}`, paddingTop: 4 }}>
                <WFText size={10} color={wfColors.faint} style={{ fontFamily: wfFont.mono, width: 22 }}>{h}:00</WFText>
                <div style={{ flex: 1 }} />
              </div>
            ))}

            {/* Events overlay */}
            <div style={{
              position: 'absolute', left: 34, right: 4,
              top: 10, height: 86,
              background: wfColors.surface,
              border: `1.5px solid ${wfColors.ink}`,
              borderRadius: 8, padding: '8px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <WFLabel size={8} color={wfColors.ink}>9:00 – 10:30 · FOCUS</WFLabel>
                {showXP && <div style={{ padding: '1px 5px', background: wfColors.ink, color: '#fff', borderRadius: 3, fontFamily: wfFont.mono, fontSize: 9 }}>+80</div>}
              </div>
              <WFText size={13} weight={600} style={{ marginTop: 4 }}>Draft Q2 strategy memo</WFText>
              <div style={{ marginTop: 8, height: 3, background: wfColors.hair, borderRadius: 2 }}>
                <div style={{ width: '60%', height: '100%', background: wfColors.ink, borderRadius: 2 }} />
              </div>
            </div>

            <div style={{
              position: 'absolute', left: 34, right: 4,
              top: 180, height: 50,
              background: wfColors.fill,
              border: `1px solid ${wfColors.line}`,
              borderRadius: 8, padding: '8px 10px',
            }}>
              <WFLabel size={8}>11:30 · MEETING</WFLabel>
              <WFText size={13} weight={500} style={{ marginTop: 2 }}>Design crit · 4 people</WFText>
            </div>

            <div style={{
              position: 'absolute', left: 34, right: 4,
              top: 292, height: 70,
              background: wfColors.surface,
              border: `1.5px dashed ${wfColors.line}`,
              borderRadius: 8, padding: '8px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <WFLabel size={8}>2:00 · QUEST</WFLabel>
                {showXP && <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>+30 XP</WFText>}
              </div>
              <WFText size={13} weight={500} style={{ marginTop: 2 }}>Sync with design lead</WFText>
              <WFText size={11} color={wfColors.muted} style={{ marginTop: 2 }}>Unscheduled · drag to timebox</WFText>
            </div>
          </div>
        </div>

        {/* Unscheduled quests drawer */}
        <div style={{ padding: '20px 20px 0' }} data-annot="3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <WFLabel>BACKLOG · DRAG TO SCHEDULE</WFLabel>
            <WFText size={10} color={wfColors.muted}>4</WFText>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <WFTaskRow title="Finalize week's timesheet" meta={[{ icon: 'timer', text: '15 min' }]} compact xp={showXP ? 20 : undefined} />
            <WFTaskRow title="Review PR #2847" meta={[{ icon: 'timer', text: '30 min' }]} compact xp={showXP ? 40 : undefined} />
          </div>
        </div>
      </div>

      <WFTabBar active="calendar" onNav={(t) => {
        if (t === 'today') nav('today');
        if (t === 'quests') nav('list');
        if (t === 'codex') nav('sidebar');
      }} />

      {showAnnotations && (
        <>
          <WFCallout n="1" style={{ top: 140, right: 8 }} />
          <WFCallout n="2" style={{ top: 320, right: 8 }} />
          <WFCallout n="3" style={{ top: 720, right: 8 }} />
        </>
      )}
    </div>
  );
}

Object.assign(window, { ScreenOnboarding, ScreenToday, ScreenList, ScreenCalendar });
