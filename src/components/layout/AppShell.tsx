import {
  BookOpen, Check, ChevronRight, Code2, Dumbbell, Flame, GraduationCap, Heart, Home, LayoutGrid, NotebookPen, Swords, Target, TrendingUp, X, Zap,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { levelProgress } from '../../engine/levels';
import { today, useAppState } from '../../engine/store';
import { t } from '../../i18n';
import { Bar, Ring } from '../ui/primitives';

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--primary)" />
      <path d="M9 23.5c0-4.2 2.6-5.5 7-5.5s7-1.3 7-5.5V9" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="9" cy="23.5" r="2.8" fill="#ffc53d" />
      <circle cx="23" cy="8.5" r="2.8" fill="#fff" />
    </svg>
  );
}

const NAV = [
  { to: '/', key: 'nav.home', icon: Home, hue: 'green', end: true },
  { to: '/learn', key: 'nav.learn', icon: BookOpen, hue: 'blue' },
  { to: '/practice', key: 'nav.practice', icon: Dumbbell, hue: 'orange' },
  { to: '/lab', key: 'nav.lab', icon: Code2, hue: 'violet' },
  { to: '/challenges', key: 'nav.challenges', icon: Swords, hue: 'red' },
  { to: '/revision', key: 'nav.revision', icon: NotebookPen, hue: 'teal' },
  { to: '/exam', key: 'nav.exam', icon: GraduationCap, hue: 'amber' },
  { to: '/progress', key: 'nav.progress', icon: TrendingUp, hue: 'pink' },
] as const;

const navHue = (hue: string) => ({ ['--nav' as string]: `var(--hue-${hue})` }) as React.CSSProperties;

const MOBILE_MAIN = ['/', '/learn', '/practice', '/lab'];

export function StatPills({ compact }: { compact?: boolean }) {
  const s = useAppState();
  const xpToday = s.dailyXp[today()] ?? 0;
  const goal = s.profile.dailyGoal;
  const activeToday = s.streak.lastDay === today();
  return (
    <div className="stat-pills">
      <NavLink to="/progress" className={'stat-pill stat-streak' + (activeToday ? ' is-lit' : '')} title={t('stats.streak', { n: s.streak.current })}>
        <Flame size={16} strokeWidth={2.4} className="stat-icon" aria-hidden="true" />
        <b>{s.streak.current}</b>
        <span className="sr-only">day streak</span>
      </NavLink>
      <NavLink to="/progress" className="stat-pill stat-xp" title={`${s.xp} XP total`}>
        <Zap size={16} strokeWidth={2.4} className="stat-icon" aria-hidden="true" />
        <b>{s.xp.toLocaleString()}</b>
        {!compact && <span className="stat-pill-unit">XP</span>}
      </NavLink>
      <NavLink to="/progress" className="stat-goal" title={t('stats.xpToday', { n: xpToday, goal })}>
        <Ring value={xpToday / goal} size={34} stroke={4} color={xpToday >= goal ? 'var(--success)' : 'var(--xp)'} label={t('stats.xpToday', { n: xpToday, goal })}>
          <span className="stat-goal-icon">{xpToday >= goal ? <Check size={15} strokeWidth={3} /> : <Target size={15} />}</span>
        </Ring>
      </NavLink>
    </div>
  );
}

function SidebarLevel() {
  const s = useAppState();
  const lp = levelProgress(s.xp);
  return (
    <NavLink to="/progress" className="side-level">
      <div className="side-level-badge">{lp.level}</div>
      <div className="side-level-text">
        <div className="side-level-title">{lp.title}</div>
        <Bar value={lp.pct} size="sm" color="var(--xp)" label="Level progress" />
        <div className="side-level-sub">
          {lp.into} / {lp.needed} XP
        </div>
      </div>
    </NavLink>
  );
}

export function AppShell() {
  const [moreOpen, setMoreOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setMoreOpen(false), [loc.pathname]);
  const moreActive = !MOBILE_MAIN.some((p) => (p === '/' ? loc.pathname === '/' : loc.pathname.startsWith(p)));

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <aside className="sidebar" aria-label="Main">
        <NavLink to="/" className="brand">
          <Logo />
          <span className="brand-name">{t('app.name')}</span>
        </NavLink>
        <nav className="side-nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={'end' in n ? n.end : false} className="side-link" style={navHue(n.hue)}>
              <n.icon size={20} aria-hidden="true" />
              <span>{t(n.key)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="spacer" />
        <SidebarLevel />
      </aside>

      <header className="topbar">
        <NavLink to="/" className="brand brand-mobile">
          <Logo size={28} />
          <span className="brand-name">{t('app.name')}</span>
        </NavLink>
        <div className="spacer" />
        <StatPills />
      </header>

      <main id="main" className="main" tabIndex={-1}>
        <Outlet />
        <Credit />
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {NAV.filter((n) => MOBILE_MAIN.includes(n.to)).map((n) => (
          <NavLink key={n.to} to={n.to} end={'end' in n ? n.end : false} className="bottom-link" style={navHue(n.hue)}>
            <n.icon size={22} aria-hidden="true" />
            <span>{t(n.key)}</span>
          </NavLink>
        ))}
        <button type="button" className={'bottom-link' + (moreActive ? ' active' : '')} onClick={() => setMoreOpen(true)} aria-haspopup="dialog">
          <LayoutGrid size={22} aria-hidden="true" />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      {moreOpen && (
        <Sheet onClose={() => setMoreOpen(false)}>
          <div className="sheet-head">
            <h3>{t('nav.more')}</h3>
            <button type="button" className="icon-btn" onClick={() => setMoreOpen(false)} aria-label={t('common.close')}>
              <X size={20} />
            </button>
          </div>
          <div className="sheet-links">
            {NAV.filter((n) => !MOBILE_MAIN.includes(n.to)).map((n) => (
              <NavLink key={n.to} to={n.to} className="sheet-link" style={navHue(n.hue)}>
                <n.icon size={22} aria-hidden="true" />
                <span>{t(n.key)}</span>
                <ChevronRight size={18} className="sheet-chev" aria-hidden="true" />
              </NavLink>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

const SOCIALS = [
  {
    label: 'GitHub',
    handle: 'Sahan-Madusanka-Perera',
    href: 'https://github.com/Sahan-Madusanka-Perera',
    icon: (
      <>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </>
    ),
  },
  {
    label: 'Instagram',
    handle: '@sahan._perera',
    href: 'https://www.instagram.com/sahan._perera/',
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
];

function Credit() {
  return (
    <footer className="credit">
      <p className="credit-line">
        {t('credit.made')} <Heart size={16} className="credit-heart" fill="currentColor" aria-hidden="true" />
        <span className="sr-only">{t('credit.love')}</span> {t('credit.by')}
      </p>
      <div className="credit-links">
        {SOCIALS.map((x) => (
          <a key={x.label} className="credit-link" href={x.href} target="_blank" rel="noopener noreferrer" aria-label={`${x.label}: ${x.handle}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {x.icon}
            </svg>
            <span>{x.handle}</span>
          </a>
        ))}
      </div>
    </footer>
  );
}

function Sheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="More">
        {children}
      </div>
    </div>
  );
}

/** Full-screen focus layout for lessons, sessions, bosses and exams. */
export function FocusBar({ onClose, progress, children, label }: { onClose: () => void; progress?: number; children?: ReactNode; label?: string }) {
  return (
    <div className="focusbar">
      <button type="button" className="icon-btn" onClick={onClose} aria-label={label ?? 'Exit'}>
        <X size={22} />
      </button>
      {progress !== undefined && (
        <div className="focusbar-progress">
          <Bar value={progress} label="Progress" />
        </div>
      )}
      {children}
    </div>
  );
}
