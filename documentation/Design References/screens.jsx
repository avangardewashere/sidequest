// ═══════════════════════════════════════════════════════════
// All 7 screens for the Quest Todo wireframe
// Mid-fi monochrome · mobile · quest/RPG vocabulary
// ═══════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────
// 1. ONBOARDING — choose an adventuring path
// ───────────────────────────────────────────────────────────
function ScreenOnboarding({ onNav, rewards, showAnnot }) {
  return (
    <div data-screen-label="Onboarding" style={{ padding: '54px 20px 24px', display: 'flex', flexDirection: 'column', height: '100%', background: wfColors.paper, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <WFLabel>STEP 02 / 04</WFLabel>
        <WFText size={12} color={wfColors.muted}>Skip</WFText>
      </div>
      {/* step dots */}
      <div style={{ display: 'flex', gap: 5, marginBottom: 28 }}>
        <div style={{ height: 3, flex: 1, background: wfColors.ink, borderRadius: 2 }} />
        <div style={{ height: 3, flex: 1, background: wfColors.ink, borderRadius: 2 }} />
        <div style={{ height: 3, flex: 1, background: wfColors.hair, borderRadius: 2 }} />
        <div style={{ height: 3, flex: 1, background: wfColors.hair, borderRadius: 2 }} />
      </div>

      <div style={{ position: 'relative', marginBottom: 4 }}>
        <WFHeading size={30} style={{ marginBottom: 10 }}>Choose your<br/>adventuring path.</WFHeading>
        {showAnnot && <WFCallout n={1} style={{ top: 4, right: -8 }} />}
      </div>
      <WFText size={14} color={wfColors.muted} style={{ marginBottom: 22 }}>
        Shapes your daily quest load, XP curve, and rest cadence. Change anytime.
      </WFText>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16, position: 'relative' }}>
        {[
          { glyph: 'sword',  t: 'The Grinder',  d: 'Long, consistent sessions. Big streak bonuses.', sel: true },
          { glyph: 'bolt',   t: 'The Sprinter', d: 'Many short pomodoros. High XP per hour.', sel: false },
          { glyph: 'shield', t: 'The Steward',  d: 'Balanced load. Built-in rest days.', sel: false },
        ].map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px',
            border: `${c.sel ? 2 : 1}px solid ${c.sel ? wfColors.ink : wfColors.line}`,
            borderRadius: 12, background: wfColors.surface,
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, border: `1px solid ${wfColors.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <WFGlyph kind={c.glyph} size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <WFText size={14} weight={600}>{c.t}</WFText>
              <WFText size={11} color={wfColors.muted} style={{ marginTop: 2 }}>{c.d}</WFText>
            </div>
            <div style={{
              width: 18, height: 18, borderRadius: '50%',
              border: `1.5px solid ${c.sel ? wfColors.ink : wfColors.line}`,
              background: c.sel ? wfColors.ink : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {c.sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </div>
          </div>
        ))}
        {showAnnot && <WFCallout n={2} style={{ top: 18, right: -8 }} />}
      </div>

      <div style={{
        padding: 12, border: `1px dashed ${wfColors.line}`, borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative',
      }}>
        <WFGlyph kind="coin" size={18} color={wfColors.muted} />
        <div style={{ flex: 1 }}>
          <WFText size={12} weight={600}>Rewards &amp; loot</WFText>
          <WFText size={10} color={wfColors.muted}>Chests, cosmetics, shop. Optional.</WFText>
        </div>
        <div style={{
          width: 34, height: 20, borderRadius: 10, padding: 2,
          background: rewards ? wfColors.ink : wfColors.hair,
          display: 'flex', justifyContent: rewards ? 'flex-end' : 'flex-start',
        }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff' }} />
        </div>
        {showAnnot && <WFCallout n={3} style={{ top: -8, right: -8 }} />}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <WFBtn primary full size="lg" onClick={() => onNav('today')}>Forge the pact →</WFBtn>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 2. TODAY / FOCUS VIEW — hub screen
// ───────────────────────────────────────────────────────────
function ScreenToday({ onNav, density, showAnnot, gamification }) {
  const compact = density === 'compact';
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Today" style={{ paddingBottom: 100, background: wfColors.paper, minHeight: '100%', position: 'relative' }}>
      {/* App bar */}
      <div style={{ padding: '54px 16px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <WFIconBtn icon="menu" onClick={() => onNav('sidebar')} />
        <div style={{ flex: 1 }}>
          <WFLabel size={9}>FRI · APR 24 · DAY 47</WFLabel>
          <WFHeading size={22}>Today</WFHeading>
        </div>
        <WFIconBtn icon="search" />
      </div>

      {/* XP */}
      {heavy && (
        <div style={{ padding: '0 16px 12px', position: 'relative' }}>
          <WFXPBar level={12} current={740} max={1000} />
          {showAnnot && <WFCallout n={1} style={{ top: -8, right: 8 }} />}
        </div>
      )}

      {/* Stats strip */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, position: 'relative' }}>
        {[
          ...(heavy ? [{ icon: 'flame', n: '23', l: 'STREAK' }] : []),
          { icon: 'target', n: '4/7', l: 'DAILY GOAL' },
          { icon: 'timer', n: '2h 40m', l: 'FOCUSED' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: '10px', border: `1px solid ${wfColors.line}`,
            borderRadius: 10, background: wfColors.surface,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <WFGlyph kind={s.icon} size={12} color={wfColors.muted} />
              <WFLabel size={8}>{s.l}</WFLabel>
            </div>
            <WFText size={15} weight={700} style={{ fontFamily: wfFont.mono }}>{s.n}</WFText>
          </div>
        ))}
        {showAnnot && <WFCallout n={2} style={{ top: -8, right: 8 }} />}
      </div>

      {/* Main quest hero */}
      <WFSection label="★ MAIN QUEST" right={<WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>DUE 5:00 PM</WFText>}>
        <div style={{ position: 'relative' }}>
          <div style={{
            padding: 14, border: `1.5px solid ${wfColors.ink}`,
            borderRadius: 12, background: wfColors.surface,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <WFText size={15} weight={600}>Ship Q2 planning doc</WFText>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <WFGlyph kind="subtask" size={11} color={wfColors.muted} /><WFText size={11} color={wfColors.muted}>3/5</WFText>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <WFGlyph kind="note" size={11} color={wfColors.muted} /><WFText size={11} color={wfColors.muted}>4 notes</WFText>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <WFGlyph kind="timer" size={11} color={wfColors.muted} /><WFText size={11} color={wfColors.muted}>2h 15m</WFText>
                  </div>
                </div>
              </div>
              {heavy && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', border: `1px solid ${wfColors.ink}`, borderRadius: 10 }}>
                  <WFGlyph kind="bolt" size={10} /><WFText size={11} weight={700} style={{ fontFamily: wfFont.mono }}>+120</WFText>
                </div>
              )}
            </div>
            {/* progress */}
            <div style={{ position: 'relative', height: 6, background: wfColors.hair, borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: '60%', height: '100%', background: wfColors.ink }} />
              {[20,40,60,80].map(x => <div key={x} style={{ position: 'absolute', left: `${x}%`, top: 0, bottom: 0, width: 1, background: wfColors.surface }} />)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <WFBtn primary icon="play" style={{ flex: 1 }} onClick={() => onNav('detail')}>Start focus · 25m</WFBtn>
              <WFIconBtn icon="chevron" size={44} onClick={() => onNav('detail')} />
            </div>
          </div>
          {showAnnot && <WFCallout n={3} style={{ top: -8, right: 8 }} />}
        </div>
      </WFSection>

      {/* Party quests list */}
      <WFSection label="PARTY QUESTS · 5" right={heavy && <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>+180 XP</WFText>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
          <WFTaskRow title="Review API spec doc" priority="P1"
            meta={[{ icon: 'timer', text: '30m' }, { icon: 'note', text: '2' }]}
            xp={heavy ? 40 : undefined} compact={compact} onClick={() => onNav('detail')} />
          <WFTaskRow title="Sync with design lead" priority="P2"
            meta={[{ icon: 'calendar', text: '3:00 PM' }]}
            xp={heavy ? 20 : undefined} compact={compact} />
          <WFTaskRow title="Read 10 pages — Staff Eng" done
            meta={[{ text: 'Completed 8:12 AM' }]} compact={compact} />
          <WFTaskRow title="Stretch + 2k steps" done compact={compact} />
          {showAnnot && <WFCallout n={4} style={{ top: 20, right: -8 }} />}
        </div>
      </WFSection>

      <WFSection label="TOMORROW">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <WFTaskRow title="Interview prep notes" meta={[{ icon: 'calendar', text: 'Sat' }]} xp={heavy ? 30 : undefined} compact={compact} />
          <WFTaskRow title="Plan next sprint" meta={[{ icon: 'calendar', text: 'Mon' }]} xp={heavy ? 50 : undefined} compact={compact} />
        </div>
      </WFSection>

      {/* FAB */}
      <div onClick={() => onNav('quickadd')} style={{
        position: 'absolute', bottom: 84, right: 20, width: 56, height: 56, borderRadius: 28,
        background: wfColors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,0.2)', cursor: 'pointer', zIndex: 40,
      }}>
        <WFGlyph kind="plus" size={22} color="#fff" />
      </div>

      <WFTabBar active="today" onNav={(tab) => {
        if (tab === 'quests') onNav('list');
        else if (tab === 'calendar') onNav('calendar');
        else if (tab === 'codex') onNav('sidebar');
      }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 3. MAIN LIST — all quests
// ───────────────────────────────────────────────────────────
function ScreenList({ onNav, density, showAnnot, gamification }) {
  const compact = density === 'compact';
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Quest Log" style={{ paddingBottom: 100, background: wfColors.paper, minHeight: '100%', position: 'relative' }}>
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <WFIconBtn icon="menu" onClick={() => onNav('sidebar')} />
        <div style={{ flex: 1 }}>
          <WFLabel size={9}>ACTIVE CHAPTER · Q2 PLANNING</WFLabel>
          <WFHeading size={22}>Quest Log</WFHeading>
        </div>
        <WFIconBtn icon="more" />
      </div>

      {/* Chapter progress */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        <div style={{ padding: '12px 14px', border: `1px solid ${wfColors.line}`, borderRadius: 12, background: wfColors.surface }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <WFText size={13} weight={600}>Chapter II — Discovery</WFText>
            <WFText size={11} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>7 / 14</WFText>
          </div>
          <div style={{ height: 4, background: wfColors.hair, borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: '50%', height: '100%', background: wfColors.ink }} />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <WFText size={10} color={wfColors.muted}>Due May 2</WFText>
            <WFText size={10} color={wfColors.muted}>5 days left</WFText>
            {heavy && <WFText size={10} color={wfColors.muted}>+520 XP pool</WFText>}
          </div>
        </div>
        {showAnnot && <WFCallout n={1} style={{ top: -8, right: 8 }} />}
      </div>

      {/* Filter chips */}
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 6, overflowX: 'auto', position: 'relative' }}>
        {['All · 14', 'Mine · 8', 'P1 · 3', 'Blocked · 1', 'Done · 7'].map((c, i) => (
          <div key={c} style={{
            padding: '5px 10px', borderRadius: 14, flexShrink: 0,
            border: `1px solid ${i === 0 ? wfColors.ink : wfColors.line}`,
            background: i === 0 ? wfColors.ink : 'transparent',
            color: i === 0 ? '#fff' : wfColors.text,
            fontFamily: wfFont.sans, fontSize: 12, fontWeight: 500,
          }}>{c}</div>
        ))}
        {showAnnot && <WFCallout n={2} style={{ top: -10, right: 0 }} />}
      </div>

      <WFSection label="IN PROGRESS · 3">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
          <WFTaskRow title="Ship Q2 planning doc" priority="P1"
            meta={[{ icon: 'subtask', text: '3/5' }, { icon: 'timer', text: '2h 15m' }]}
            progress={60} xp={heavy ? 120 : undefined} onClick={() => onNav('detail')} compact={compact} />
          <WFTaskRow title="User interviews — round 2" priority="P1"
            meta={[{ icon: 'subtask', text: '4/8' }, { icon: 'calendar', text: 'Apr 28' }]}
            progress={50} xp={heavy ? 160 : undefined} compact={compact} />
          <WFTaskRow title="Competitive teardown" priority="P2"
            meta={[{ icon: 'subtask', text: '2/6' }]}
            progress={33} xp={heavy ? 80 : undefined} compact={compact} />
          {showAnnot && <WFCallout n={3} style={{ top: 26, right: -8 }} />}
        </div>
      </WFSection>

      <WFSection label="UNCLAIMED · 4">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <WFTaskRow title="Draft OKR proposal" meta={[{ icon: 'calendar', text: 'May 1' }]} xp={heavy ? 60 : undefined} compact={compact} />
          <WFTaskRow title="Prototype onboarding v2" meta={[{ icon: 'calendar', text: 'May 3' }]} xp={heavy ? 100 : undefined} compact={compact} />
          <WFTaskRow title="Review eng architecture doc" priority="P3" xp={heavy ? 40 : undefined} compact={compact} />
          <WFTaskRow title="Write launch comms draft" xp={heavy ? 50 : undefined} compact={compact} />
        </div>
      </WFSection>

      <WFSection label="SEALED · 7" right={<WFText size={11} color={wfColors.muted}>Show</WFText>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <WFTaskRow title="User interviews — round 1" done compact />
          <WFTaskRow title="Kickoff doc" done compact />
        </div>
      </WFSection>

      <WFTabBar active="quests" onNav={(tab) => {
        if (tab === 'today') onNav('today');
        else if (tab === 'calendar') onNav('calendar');
        else if (tab === 'codex') onNav('sidebar');
      }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 4. CALENDAR — schedule view w/ focus time
// ───────────────────────────────────────────────────────────
function ScreenCalendar({ onNav, density, showAnnot, gamification }) {
  const compact = density === 'compact';
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Calendar" style={{ paddingBottom: 100, background: wfColors.paper, minHeight: '100%', position: 'relative' }}>
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <WFIconBtn icon="back" onClick={() => onNav('today')} />
        <div style={{ flex: 1 }}>
          <WFLabel size={9}>APRIL 2026 · WEEK 17</WFLabel>
          <WFHeading size={22}>Campaign</WFHeading>
        </div>
        <WFIconBtn icon="more" />
      </div>

      {/* View toggle */}
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 6 }}>
        {['Day', 'Week', 'Month'].map((v, i) => (
          <div key={v} style={{
            flex: 1, padding: '6px 10px', borderRadius: 10, textAlign: 'center',
            border: `1px solid ${i === 1 ? wfColors.ink : wfColors.line}`,
            background: i === 1 ? wfColors.ink : 'transparent',
            color: i === 1 ? '#fff' : wfColors.text,
            fontSize: 12, fontWeight: 500,
          }}>{v}</div>
        ))}
      </div>

      {/* Week strip w/ XP bars beneath each day */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => {
            const dates = [20,21,22,23,24,25,26];
            const bars = [60,80,45,90,50,0,0]; // %
            const active = i === 4;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <WFLabel size={8} color={active ? wfColors.ink : wfColors.muted}>{d}</WFLabel>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `1px solid ${active ? wfColors.ink : wfColors.line}`,
                  background: active ? wfColors.ink : wfColors.surface,
                  color: active ? '#fff' : wfColors.ink,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: wfFont.mono, fontSize: 12, fontWeight: 600,
                }}>{dates[i]}</div>
                {heavy && (
                  <div style={{ width: 4, height: 32, background: wfColors.hair, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${bars[i]}%`, background: wfColors.ink }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {heavy && showAnnot && <WFCallout n={1} style={{ top: 30, right: -8 }} />}
      </div>

      {/* Timeline for today */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        <WFLabel style={{ marginBottom: 10 }}>FRIDAY · APR 24</WFLabel>
        <div style={{ position: 'relative', paddingLeft: 44 }}>
          {/* hour marks */}
          {['09','10','11','12','13','14','15','16','17'].map((h, i) => (
            <div key={h} style={{ position: 'absolute', left: 0, top: i * 50, width: 40, display: 'flex', alignItems: 'center' }}>
              <WFText size={10} color={wfColors.faint} style={{ fontFamily: wfFont.mono }}>{h}:00</WFText>
              <div style={{ flex: 1, height: 1, background: wfColors.hair, marginLeft: 4 }} />
            </div>
          ))}

          <div style={{ height: 9 * 50, position: 'relative' }}>
            {/* event blocks */}
            <div style={{
              position: 'absolute', top: 10, left: 6, right: 0, height: 70,
              border: `1.5px solid ${wfColors.ink}`, borderRadius: 8,
              background: wfColors.fill, padding: '6px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <WFLabel size={8}>FOCUS · MAIN QUEST</WFLabel>
                {heavy && <WFText size={9} style={{ fontFamily: wfFont.mono }}>+80 XP</WFText>}
              </div>
              <WFText size={13} weight={600} style={{ marginTop: 2 }}>Ship Q2 planning doc</WFText>
              <WFText size={10} color={wfColors.muted}>9:15 – 10:30</WFText>
            </div>
            <div style={{
              position: 'absolute', top: 130, left: 6, right: 0, height: 40,
              border: `1px solid ${wfColors.line}`, borderRadius: 8,
              background: wfColors.surface, padding: '6px 10px',
            }}>
              <WFText size={12} weight={600}>Design crit</WFText>
              <WFText size={10} color={wfColors.muted}>11:00 – 11:45</WFText>
            </div>
            <div style={{
              position: 'absolute', top: 210, left: 6, right: 0, height: 50,
              border: `1px dashed ${wfColors.ink}`, borderRadius: 8,
              background: wfColors.surface, padding: '6px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <WFLabel size={8}>QUEST BLOCK</WFLabel>
                {heavy && <WFText size={9} style={{ fontFamily: wfFont.mono }}>+40 XP</WFText>}
              </div>
              <WFText size={12} weight={600}>Review API spec doc</WFText>
              <WFText size={10} color={wfColors.muted}>1:00 – 1:30</WFText>
            </div>
            <div style={{
              position: 'absolute', top: 295, left: 6, right: 0, height: 60,
              border: `1.5px solid ${wfColors.ink}`, borderRadius: 8,
              background: wfColors.fill, padding: '6px 10px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <WFLabel size={8}>FOCUS · DEEP WORK</WFLabel>
                {heavy && <WFText size={9} style={{ fontFamily: wfFont.mono }}>+60 XP</WFText>}
              </div>
              <WFText size={13} weight={600}>Sync w/ design lead</WFText>
              <WFText size={10} color={wfColors.muted}>2:30 – 3:30</WFText>
            </div>
            {/* now line */}
            <div style={{ position: 'absolute', top: 110, left: -44, right: 0, height: 2, background: wfColors.ink }}>
              <div style={{ position: 'absolute', left: -5, top: -4, width: 10, height: 10, borderRadius: '50%', background: wfColors.ink }} />
              <div style={{ position: 'absolute', right: 0, top: -16, padding: '1px 5px', background: wfColors.ink, color: '#fff', fontFamily: wfFont.mono, fontSize: 9, borderRadius: 3 }}>NOW · 10:42</div>
            </div>
          </div>
        </div>
        {showAnnot && <WFCallout n={2} style={{ top: 90, right: -8 }} />}
      </div>

      {/* Unscheduled drawer */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <WFLabel>UNSCHEDULED · DRAG TO TIMEBLOCK</WFLabel>
          <WFText size={11} color={wfColors.muted}>3</WFText>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <WFTaskRow title="Interview prep" meta={[{ icon: 'timer', text: '45m' }]} compact xp={heavy ? 30 : undefined} />
          <WFTaskRow title="Write launch comms" meta={[{ icon: 'timer', text: '60m' }]} compact xp={heavy ? 50 : undefined} />
        </div>
        {showAnnot && <WFCallout n={3} style={{ top: -8, right: 0 }} />}
      </div>

      <WFTabBar active="calendar" onNav={(tab) => {
        if (tab === 'today') onNav('today');
        else if (tab === 'quests') onNav('list');
        else if (tab === 'codex') onNav('sidebar');
      }} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 5. QUEST DETAIL — subtasks, pomodoro, notes
// ───────────────────────────────────────────────────────────
function ScreenDetail({ onNav, density, showAnnot, gamification }) {
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Quest Detail" style={{ paddingBottom: 90, background: wfColors.paper, minHeight: '100%', position: 'relative' }}>
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <WFIconBtn icon="back" onClick={() => onNav('today')} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <WFLabel size={9}>QUEST</WFLabel>
        </div>
        <WFIconBtn icon="more" />
      </div>

      {/* Hero */}
      <div style={{ padding: '0 20px 18px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <div style={{ padding: '2px 6px', border: `1px solid ${wfColors.ink}`, borderRadius: 3, fontFamily: wfFont.mono, fontSize: 10, fontWeight: 600 }}>P1</div>
          <div style={{ padding: '2px 6px', border: `1px solid ${wfColors.line}`, borderRadius: 3, fontFamily: wfFont.mono, fontSize: 10, color: wfColors.muted }}>Q2 PLANNING</div>
          <div style={{ padding: '2px 6px', border: `1px solid ${wfColors.line}`, borderRadius: 3, fontFamily: wfFont.mono, fontSize: 10, color: wfColors.muted }}>MAIN</div>
        </div>
        <WFHeading size={22} style={{ marginBottom: 8 }}>Ship Q2 planning doc</WFHeading>
        <WFText size={13} color={wfColors.muted} style={{ marginBottom: 12 }}>
          Draft, review, align, publish. Needs sign-off from design + eng before Friday 5pm.
        </WFText>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          {[
            { icon: 'calendar', label: 'Due Apr 24 · 5pm' },
            { icon: 'target', label: 'Main quest' },
            { icon: 'subtask', label: '3 of 5 done' },
            ...(heavy ? [{ icon: 'bolt', label: '+120 XP' }] : []),
          ].map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px', border: `1px solid ${wfColors.line}`,
              borderRadius: 12, background: wfColors.surface,
            }}>
              <WFGlyph kind={t.icon} size={11} color={wfColors.muted} />
              <WFText size={11} color={wfColors.text}>{t.label}</WFText>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <WFLabel size={9}>PROGRESS</WFLabel>
            <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>60%</WFText>
          </div>
          <div style={{ position: 'relative', height: 6, background: wfColors.hair, borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: '60%', height: '100%', background: wfColors.ink }} />
            {[20,40,60,80].map(x => <div key={x} style={{ position: 'absolute', left: `${x}%`, top: 0, bottom: 0, width: 1, background: wfColors.surface }} />)}
          </div>
        </div>
        {showAnnot && <WFCallout n={1} style={{ top: 6, right: 8 }} />}
      </div>

      {/* Pomodoro */}
      <div style={{ padding: '0 20px 18px', position: 'relative' }}>
        <div style={{
          padding: '16px', border: `1.5px solid ${wfColors.ink}`, borderRadius: 14,
          background: wfColors.surface, display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* ring */}
          <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle cx="38" cy="38" r="32" fill="none" stroke={wfColors.hair} strokeWidth="5" />
              <circle cx="38" cy="38" r="32" fill="none" stroke={wfColors.ink} strokeWidth="5"
                strokeDasharray={`${2*Math.PI*32*0.45} ${2*Math.PI*32}`} strokeLinecap="round"
                transform="rotate(-90 38 38)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <WFText size={15} weight={700} style={{ fontFamily: wfFont.mono }}>13:42</WFText>
              <WFLabel size={8}>FOCUS</WFLabel>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <WFLabel size={9}>SESSION 2 OF 4</WFLabel>
            <WFText size={13} weight={600} style={{ marginTop: 2 }}>Deep focus · 25m</WFText>
            {heavy && <WFText size={11} color={wfColors.muted} style={{ marginTop: 4 }}>+40 XP · no breaks</WFText>}
            {/* session dots */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[1,1,0,0].map((done, i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: `1.5px solid ${wfColors.ink}`,
                  background: done ? wfColors.ink : 'transparent',
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <WFIconBtn icon="pause" />
          </div>
        </div>
        {showAnnot && <WFCallout n={2} style={{ top: -8, right: 8 }} />}
      </div>

      {/* Subtasks */}
      <WFSection label="STEPS · 3/5" right={<WFText size={11} color={wfColors.muted}>+ Add step</WFText>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
          {[
            { t: 'Gather Q1 retro inputs', done: true, xp: 20 },
            { t: 'Draft problem framing section', done: true, xp: 30 },
            { t: 'Outline Q2 bets (3 options)', done: true, xp: 30 },
            { t: 'Review with design + eng', done: false, xp: 20, active: true },
            { t: 'Publish to wiki, send FYI', done: false, xp: 20 },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              border: `1px solid ${s.active ? wfColors.ink : wfColors.line}`,
              borderRadius: 8, background: s.active ? wfColors.fill : wfColors.surface,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                border: `1.5px solid ${s.done ? wfColors.ink : wfColors.line}`,
                background: s.done ? wfColors.ink : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {s.done && <WFGlyph kind="check" size={12} color="#fff" />}
              </div>
              <WFText size={13} style={{
                flex: 1,
                textDecoration: s.done ? 'line-through' : 'none',
                color: s.done ? wfColors.faint : wfColors.ink,
              }}>{s.t}</WFText>
              {heavy && <WFText size={10} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>+{s.xp}</WFText>}
            </div>
          ))}
          {showAnnot && <WFCallout n={3} style={{ top: 100, right: -8 }} />}
        </div>
      </WFSection>

      {/* Notes / attachments */}
      <WFSection label="PARCHMENT · NOTES & LORE" right={<WFText size={11} color={wfColors.muted}>2</WFText>}>
        <div style={{
          padding: '12px 14px', border: `1px solid ${wfColors.line}`,
          borderRadius: 10, background: wfColors.surface,
        }}>
          <WFText size={12} weight={600} style={{ marginBottom: 8 }}>Opening framing</WFText>
          <WFLorem lines={3} />
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {['q1-retro.pdf', 'okr-draft.md', 'design-brief.fig'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 7px', border: `1px solid ${wfColors.line}`, borderRadius: 4 }}>
                <WFGlyph kind="attach" size={10} color={wfColors.muted} />
                <WFText size={10} color={wfColors.muted}>{f}</WFText>
              </div>
            ))}
          </div>
        </div>
      </WFSection>

      {/* Rewards / on-complete */}
      {heavy && (
        <WFSection label="REWARD ON COMPLETE">
          <div style={{
            padding: '12px 14px', border: `1px dashed ${wfColors.line}`, borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <WFGlyph kind="coin" size={22} />
            <div style={{ flex: 1 }}>
              <WFText size={13} weight={600}>+120 XP · +1 Seal</WFText>
              <WFText size={11} color={wfColors.muted}>Unlocks next chapter. Streak +1.</WFText>
            </div>
          </div>
        </WFSection>
      )}

      {/* Bottom action bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px',
        background: wfColors.surface, borderTop: `1px solid ${wfColors.hair}`,
        display: 'flex', gap: 8, zIndex: 30,
      }}>
        <WFBtn icon="note" style={{ flex: 1 }}>Note</WFBtn>
        <WFBtn primary icon="check" style={{ flex: 2 }} onClick={() => onNav('today')}>Complete quest</WFBtn>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 6. SIDEBAR — player profile, lists, settings
// ───────────────────────────────────────────────────────────
function ScreenSidebar({ onNav, density, showAnnot, gamification }) {
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Codex" style={{ paddingBottom: 30, background: wfColors.paper, minHeight: '100%', position: 'relative' }}>
      <div style={{ padding: '54px 16px 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <WFIconBtn icon="close" onClick={() => onNav('today')} />
        <div style={{ flex: 1 }}>
          <WFLabel size={9}>CODEX</WFLabel>
        </div>
        <WFIconBtn icon="settings" />
      </div>

      {/* Profile card */}
      <div style={{ padding: '0 16px 16px', position: 'relative' }}>
        <div style={{ padding: 16, border: `1px solid ${wfColors.line}`, borderRadius: 14, background: wfColors.surface }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
            <WFCircle size={52} label="AVATAR" />
            <div style={{ flex: 1 }}>
              <WFText size={15} weight={600}>Alex Rivera</WFText>
              <WFText size={11} color={wfColors.muted}>The Grinder · Lv. 12</WFText>
            </div>
            {heavy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', border: `1px solid ${wfColors.ink}`, borderRadius: 12 }}>
                <WFGlyph kind="flame" size={12} />
                <WFText size={11} weight={700} style={{ fontFamily: wfFont.mono }}>23</WFText>
              </div>
            )}
          </div>
          {heavy && <WFXPBar level={12} current={740} max={1000} compact />}
        </div>
        {showAnnot && <WFCallout n={1} style={{ top: -8, right: 8 }} />}
      </div>

      {/* Lists / chapters */}
      <WFSection label="CHAPTERS · PROJECTS">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative' }}>
          {[
            { t: 'Q2 Planning', c: 14, d: 7, main: true },
            { t: 'Personal', c: 23, d: 12 },
            { t: 'Side project — app', c: 9, d: 2 },
            { t: 'Reading list', c: 11, d: 6 },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
              border: `1px solid ${wfColors.line}`, borderRadius: 10, background: wfColors.surface,
            }}>
              <WFGlyph kind={p.main ? 'crown' : 'scroll'} size={16} color={wfColors.muted} />
              <div style={{ flex: 1 }}>
                <WFText size={13} weight={600}>{p.t}</WFText>
                <WFText size={10} color={wfColors.muted}>{p.d}/{p.c} quests</WFText>
              </div>
              <div style={{ width: 60, height: 3, background: wfColors.hair, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(p.d/p.c)*100}%`, height: '100%', background: wfColors.ink }} />
              </div>
            </div>
          ))}
          <div style={{
            padding: '11px 14px', borderRadius: 10, border: `1px dashed ${wfColors.line}`,
            display: 'flex', alignItems: 'center', gap: 10, color: wfColors.muted,
          }}>
            <WFGlyph kind="plus" size={14} color={wfColors.muted} />
            <WFText size={12} color={wfColors.muted}>New chapter</WFText>
          </div>
          {showAnnot && <WFCallout n={2} style={{ top: 10, right: -8 }} />}
        </div>
      </WFSection>

      {/* Bestiary / achievements */}
      {heavy && (
        <WFSection label="BESTIARY · 12/40 UNLOCKED" right={<WFText size={11} color={wfColors.muted}>See all</WFText>}>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            {[
              { icon: 'flame', unlocked: true, label: '10 day' },
              { icon: 'crown', unlocked: true, label: 'First chapter' },
              { icon: 'trophy', unlocked: true, label: '500 XP' },
              { icon: 'heart', unlocked: false, label: 'No skip' },
            ].map((b, i) => (
              <div key={i} style={{
                flex: 1, padding: '12px 6px',
                border: `1px solid ${b.unlocked ? wfColors.line : wfColors.hair}`,
                borderRadius: 10,
                background: b.unlocked ? wfColors.surface : 'transparent',
                opacity: b.unlocked ? 1 : 0.4,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <WFGlyph kind={b.icon} size={22} color={b.unlocked ? wfColors.ink : wfColors.muted} />
                <WFText size={9} color={wfColors.muted} style={{ textAlign: 'center' }}>{b.label}</WFText>
              </div>
            ))}
            {showAnnot && <WFCallout n={3} style={{ top: -8, right: -8 }} />}
          </div>
        </WFSection>
      )}

      {/* Links */}
      <WFSection label="MORE">
        <div style={{ display: 'flex', flexDirection: 'column', border: `1px solid ${wfColors.line}`, borderRadius: 10, background: wfColors.surface, overflow: 'hidden' }}>
          {[
            { icon: 'inbox', t: 'Inbox · unsorted', c: '4' },
            { icon: 'map', t: 'Stats & trends' },
            { icon: 'settings', t: 'Settings' },
            { icon: 'heart', t: 'Appearance · gamification' },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              borderBottom: i < a.length - 1 ? `1px solid ${wfColors.hair}` : 'none',
            }}>
              <WFGlyph kind={r.icon} size={16} color={wfColors.muted} />
              <WFText size={13} style={{ flex: 1 }}>{r.t}</WFText>
              {r.c && <WFText size={11} color={wfColors.muted} style={{ fontFamily: wfFont.mono }}>{r.c}</WFText>}
              <WFGlyph kind="chevron" size={12} color={wfColors.faint} />
            </div>
          ))}
        </div>
      </WFSection>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// 7. QUICK-ADD — bottom sheet capture
// ───────────────────────────────────────────────────────────
function ScreenQuickAdd({ onNav, density, showAnnot, gamification }) {
  const heavy = gamification === 'heavy';
  return (
    <div data-screen-label="Quick Add" style={{
      height: '100%', position: 'relative',
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* dimmed background preview */}
      <div onClick={() => onNav('today')} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />

      {/* sheet */}
      <div style={{
        position: 'relative', background: wfColors.paper,
        borderTopLeftRadius: 22, borderTopRightRadius: 22,
        paddingBottom: 30, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
      }}>
        {/* grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 8px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: wfColors.line }} />
        </div>

        <div style={{ padding: '0 16px 16px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <WFHeading size={18}>New quest</WFHeading>
            <WFText size={11} color={wfColors.muted}>Esc to cancel</WFText>
          </div>

          {/* title input */}
          <div style={{
            padding: '12px 14px', border: `1.5px solid ${wfColors.ink}`,
            borderRadius: 10, background: wfColors.surface, marginBottom: 10,
            position: 'relative',
          }}>
            <WFText size={15} weight={500}>Review design system updates|</WFText>
            {showAnnot && <WFCallout n={1} style={{ top: -8, right: 8 }} />}
          </div>

          {/* Parse chips — natural language hints */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, position: 'relative' }}>
            {[
              { icon: 'calendar', t: 'Tomorrow 3pm', active: true },
              { icon: 'target', t: 'P1', active: true },
              { icon: 'scroll', t: 'Q2 Planning', active: true },
              { icon: 'timer', t: '30 min', active: false },
              { icon: 'subtask', t: '+ subtasks', active: false },
            ].map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 12,
                border: `1px solid ${c.active ? wfColors.ink : wfColors.line}`,
                background: c.active ? wfColors.fill : 'transparent',
              }}>
                <WFGlyph kind={c.icon} size={11} color={c.active ? wfColors.ink : wfColors.muted} />
                <WFText size={11} weight={c.active ? 600 : 400} color={c.active ? wfColors.ink : wfColors.muted}>{c.t}</WFText>
              </div>
            ))}
            {showAnnot && <WFCallout n={2} style={{ top: -8, right: 8 }} />}
          </div>

          {/* XP preview */}
          {heavy && (
            <div style={{
              padding: '10px 12px', border: `1px dashed ${wfColors.line}`, borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            }}>
              <WFGlyph kind="bolt" size={14} color={wfColors.muted} />
              <WFText size={11} color={wfColors.muted} style={{ flex: 1 }}>Estimated reward</WFText>
              <WFText size={13} weight={700} style={{ fontFamily: wfFont.mono }}>+40 XP</WFText>
            </div>
          )}

          {/* Secondary actions */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, position: 'relative' }}>
            <WFIconBtn icon="mic" />
            <WFIconBtn icon="attach" />
            <WFIconBtn icon="note" />
            <div style={{ flex: 1 }} />
            <WFBtn size="sm" style={{ flex: 0 }}>More</WFBtn>
            {showAnnot && <WFCallout n={3} style={{ top: -10, left: -8 }} />}
          </div>

          {/* Submit bar */}
          <div style={{ display: 'flex', gap: 8 }}>
            <WFBtn style={{ flex: 1 }} onClick={() => onNav('today')}>Save to Inbox</WFBtn>
            <WFBtn primary style={{ flex: 2 }} icon="plus" onClick={() => onNav('today')}>Add to Today</WFBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenOnboarding, ScreenToday, ScreenList, ScreenCalendar,
  ScreenDetail, ScreenSidebar, ScreenQuickAdd,
});
