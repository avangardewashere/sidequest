// App shell — manages screens, wraps each in an iOS frame,
// provides annotation legend + tweaks panel.

const { useState, useEffect } = React;

const SCREENS = [
  { id: 'onboarding', title: 'Onboarding', component: 'ScreenOnboarding',
    annots: [
      'Progress dots — 4-step onboarding so expectations are bounded.',
      'Class picker metaphors the quest system upfront (Grinder/Sprinter/Steward).',
      'Rewards explicitly opt-in — for users who want plain productivity.',
    ]},
  { id: 'today', title: 'Today / Focus', component: 'ScreenToday',
    annots: [
      'XP bar at top anchors identity. Segmented for RPG feel.',
      'Stats strip shows outcomes users actually track — streak, daily goal, focused time.',
      'Main Quest card is the one priority thing — replaces "Important" section.',
      'Every task shows XP + priority + meta. Tap → Detail.',
    ]},
  { id: 'list', title: 'Quest Log', component: 'ScreenList',
    annots: [
      'Chapter = project. Progress bar shows pool completion, not dates.',
      'Filter chips include counts so users know what is hiding.',
      'In-progress quests show inline progress bars (subtasks + XP pool).',
    ]},
  { id: 'calendar', title: 'Campaign (Calendar)', component: 'ScreenCalendar',
    annots: [
      'XP bars under each weekday = progress tracker, not streak.',
      'Timeline mixes meetings + timeboxed quests. "Now" line w/ timestamp.',
      'Unscheduled tray — drag to time-block (a la Sunsama).',
    ]},
  { id: 'detail', title: 'Quest Detail', component: 'ScreenDetail',
    annots: [
      'Header shows priority / project / quest tier. Progress segmented like XP.',
      'Pomodoro ring is primary — this is where focus happens.',
      'Subtasks have their own XP; active step highlighted.',
    ]},
  { id: 'sidebar', title: 'Codex (Sidebar)', component: 'ScreenSidebar',
    annots: [
      'Profile card = player identity. Class + streak.',
      'Chapters (projects) with inline progress; + new at bottom.',
      'Bestiary = achievements. Hidden in a drawer so it never dominates.',
    ]},
  { id: 'quickadd', title: 'Quick-add', component: 'ScreenQuickAdd',
    annots: [
      'Natural-language input — title only, everything else is parsed.',
      'Parse chips show what the app understood; tap to correct.',
      'Mic / attach / note affordances in one row; keeps sheet short.',
    ]},
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfy",
  "gamification": "heavy",
  "annotations": true
}/*EDITMODE-END*/;

function AnnotPanel({ screen }) {
  return (
    <div style={{
      width: 280, padding: '20px 20px',
      background: '#1a1a1a', color: '#fff',
      borderRadius: 14,
      fontFamily: '-apple-system, system-ui, sans-serif',
    }}>
      <div style={{ fontFamily: 'SF Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: '#9a9a9a', marginBottom: 6 }}>
        SCREEN {String(SCREENS.findIndex(s => s.id === screen.id) + 1).padStart(2, '0')} · ANNOTATIONS
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>{screen.title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {screen.annots.map((a, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: '#ff5a3c', color: '#fff',
              fontSize: 11, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{ fontSize: 13, lineHeight: 1.45, color: '#e4e4e4' }}>{a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenTabs({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: 4, flexWrap: 'wrap',
      padding: '8px 10px', borderRadius: 12,
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid #d9d5c8',
      backdropFilter: 'blur(8px)',
    }}>
      {SCREENS.map((s, i) => (
        <div key={s.id} onClick={() => onChange(s.id)} style={{
          padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
          background: active === s.id ? '#111' : 'transparent',
          color: active === s.id ? '#fff' : '#333',
          fontSize: 12, fontWeight: active === s.id ? 600 : 500,
          fontFamily: '-apple-system, system-ui, sans-serif',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'SF Mono, monospace', fontSize: 10, opacity: 0.7 }}>
            {String(i + 1).padStart(2, '0')}
          </span>
          {s.title}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState('onboarding');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const current = SCREENS.find(s => s.id === screen);
  const Component = window[current.component];

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 24px 80px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
      background: '#efece4',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 960, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
        <div>
          <div style={{ fontFamily: 'SF Mono, monospace', fontSize: 11, letterSpacing: 1.5, color: '#6b6b6b' }}>
            WIREFRAME · MID-FI · MOBILE · v1
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.4, marginTop: 4 }}>
            Quest — a gamified todo app
          </div>
          <div style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4, maxWidth: 560 }}>
            Knowledge-worker focus tool with a quest-system layer. 7 key screens. Tap the bubbles to read rationale.
          </div>
        </div>
      </div>

      {/* Nav tabs */}
      <div style={{ width: '100%', maxWidth: 960 }}>
        <ScreenTabs active={screen} onChange={setScreen} />
      </div>

      {/* Stage: frame + annotations */}
      <div style={{ display: 'flex', gap: 30, alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ position: 'relative' }}>
          <IOSDevice width={390} height={800}>
            <Component
              onNav={setScreen}
              density={tweaks.density}
              gamification={tweaks.gamification}
              rewards={tweaks.gamification !== 'off'}
              showAnnot={tweaks.annotations}
            />
          </IOSDevice>
        </div>
        {tweaks.annotations && <AnnotPanel screen={current} />}
      </div>

      {/* Footer legend */}
      <div style={{ width: '100%', maxWidth: 960, padding: '16px 20px', border: '1px solid #d9d5c8', borderRadius: 12, background: 'rgba(255,255,255,0.5)' }}>
        <div style={{ fontFamily: 'SF Mono, monospace', fontSize: 10, letterSpacing: 1.4, color: '#6b6b6b', marginBottom: 8 }}>
          LEGEND
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 12, color: '#2a2a2a' }}>
          <span><b style={{ fontFamily: 'SF Mono, monospace' }}>Solid border</b> = committed/primary element</span>
          <span><b style={{ fontFamily: 'SF Mono, monospace' }}>Dashed border</b> = optional/drag-target</span>
          <span><b style={{ fontFamily: 'SF Mono, monospace' }}>Filled bar</b> = progress (not gradient/glow)</span>
          <span><b style={{ fontFamily: 'SF Mono, monospace' }}>XP chip</b> = reward; can be toggled off</span>
        </div>
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={tweaks.density}
          options={['compact', 'comfy']}
          onChange={v => setTweak('density', v)} />
        <TweakSection label="Gamification" />
        <TweakRadio label="Intensity" value={tweaks.gamification}
          options={['heavy', 'light', 'off']}
          onChange={v => setTweak('gamification', v)} />
        <TweakSection label="Review" />
        <TweakToggle label="Show annotations" value={tweaks.annotations}
          onChange={v => setTweak('annotations', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
