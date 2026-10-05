import { AlertTriangle, GraduationCap, Lightbulb, X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Callout as CalloutT, Difficulty } from '../../content/types';
import { Icon } from './icons';
import { inline } from './Rich';

export function Bar({ value, color, size, label }: { value: number; color?: string; size?: 'sm' | 'lg'; label?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className={'bar' + (size ? ' bar-' + size : '')}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      style={color ? ({ ['--bar-color' as string]: color } as React.CSSProperties) : undefined}
    >
      <span style={{ clipPath: `inset(0 ${100 - pct}% 0 0 round 999px)` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 7, color = 'var(--primary)', track = 'var(--surface-3)', children, label }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode; label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)}%`}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - v)} />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', practice: 'Practice', challenge: 'Challenge', boss: 'Boss' };
export function DifficultyChip({ d }: { d: Difficulty }) {
  return (
    <span className={'chip chip-' + d}>
      <span className="diff-dot" aria-hidden="true" /> {DIFF_LABEL[d]}
    </span>
  );
}

export function Callout({ c }: { c: CalloutT }) {
  const Icon = c.kind === 'tip' ? Lightbulb : c.kind === 'mistake' ? AlertTriangle : GraduationCap;
  const label = c.kind === 'tip' ? 'Tip' : c.kind === 'mistake' ? 'Common mistake' : 'Exam point';
  return (
    <div className={'callout callout-' + c.kind}>
      <Icon size={18} className="callout-icon" aria-hidden="true" />
      <div>
        <b className="callout-label">{label}</b>
        {inline(c.text)}
      </div>
    </div>
  );
}

export function Modal({ children, onClose, wide, label }: { children: ReactNode; onClose?: () => void; wide?: boolean; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('button, [href], input, textarea, select');
    (first ?? ref.current)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === 'Tab' && ref.current) {
        const items = [...ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input, textarea, select')];
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={'modal' + (wide ? ' modal-wide' : '')} role="dialog" aria-modal="true" aria-label={label} ref={ref} tabIndex={-1}>
        {onClose && (
          <button type="button" className="icon-btn modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, lead, children }: { title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page-header">
      <div className="page-header-text">
        <h1>{title}</h1>
        {lead && <p className="page-lead">{lead}</p>}
      </div>
      {children && <div className="page-header-side">{children}</div>}
    </header>
  );
}

export function Empty({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
