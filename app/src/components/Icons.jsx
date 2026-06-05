// Unified SVG icon set — all viewBox="0 0 24 24", stroke-based
// Usage: <Icon name="globe" size={20} color="#888" strokeWidth={1.8} />

const ICON_DEFS = {
  // ── THEME CHIPS ──────────────────────────────────────────────────────────
  globe: (<>
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </>),

  chip: (<>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M15 9V4M9 9V4M9 15v5M15 15v5M4 9h5M4 15h5M15 9h5M15 15h5"/>
  </>),

  flag: (<>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </>),

  robot: (<>
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M12 2a3 3 0 0 1 3 3v6H9V5a3 3 0 0 1 3-3z"/>
    <line x1="8" y1="22" x2="8" y2="21"/>
    <line x1="16" y1="22" x2="16" y2="21"/>
  </>),

  building: (<>
    <rect x="4" y="2" width="16" height="20" rx="1"/>
    <path d="M9 22V12h6v10"/>
    <rect x="9" y="6" width="2" height="2"/>
    <rect x="13" y="6" width="2" height="2"/>
    <rect x="9" y="10" width="2" height="2"/>
    <rect x="13" y="10" width="2" height="2"/>
  </>),

  briefcase: (<>
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </>),

  leaf: (<>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6"/>
  </>),

  lightning: (
    <path d="M13 2L4.09 12.37A1 1 0 0 0 5 14h6l-1 8 8.91-10.37A1 1 0 0 0 19 10h-6l1-8z"/>
  ),

  // ── PROS / CONS CARD ICONS ───────────────────────────────────────────────
  'chart-up': (<>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
    <polyline points="15 7 18 4 21 7"/>
  </>),

  lightbulb: (<>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6M10 22h4"/>
  </>),

  currency: (<>
    <path d="M12 1v22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </>),

  warning: (<>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </>),

  'money-loss': (<>
    <path d="M12 1v22"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    <polyline points="19 17 22 19 19 21"/>
    <line x1="17" y1="19" x2="22" y2="19"/>
  </>),

  target: (<>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </>),

  refresh: (<>
    <path d="M23 4v6h-6"/>
    <path d="M1 20v-6h6"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </>),

  'bar-chart': (<>
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </>),

  'chart-down': (<>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="16"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
    <polyline points="15 17 18 20 21 17"/>
  </>),

  money: (<>
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M1 9h3M1 15h3M20 9h3M20 15h3"/>
  </>),

  // ── PAGE03c TABS / CHECK ─────────────────────────────────────────────────
  'thumbs-up': (<>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </>),

  user: (<>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </>),

  'check-circle': (<>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="9 12 11 14 15 10"/>
  </>),

  'x-circle': (<>
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </>),

  chat: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"/>
  ),

  // ── VOICE GUIDE ──────────────────────────────────────────────────────────
  mic: (<>
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </>),

  stop: (<>
    <circle cx="12" cy="12" r="10"/>
    <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none"/>
  </>),

  record: (<>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
  </>),

  volume: (<>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
  </>),

  replay: (<>
    <polyline points="1 4 1 10 7 10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.87"/>
  </>),
};

export function Icon({ name, size = 20, color = '#888', strokeWidth = 1.8, style = {}, className = '' }) {
  const content = ICON_DEFS[name];
  if (!content) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color, flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
      className={className}
    >
      {content}
    </svg>
  );
}
