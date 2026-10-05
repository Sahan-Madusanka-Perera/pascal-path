import { Flame, Sprout, Target } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from '../ui/icons';
import { ACH_BY_ID } from '../../engine/achievements';
import { dismiss, useCelebrations, type Celebration } from '../../engine/celebrate';
import { Modal } from '../ui/primitives';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Lightweight confetti burst on a full-screen canvas. */
export function confetti(opts: { count?: number; x?: number; y?: number } = {}) {
  if (prefersReducedMotion()) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  const colors = ['#0b8462', '#f5b400', '#ff6a3d', '#2f6fe4', '#7457e8', '#2cc492'];
  const ox = opts.x ?? innerWidth / 2;
  const oy = opts.y ?? innerHeight / 3;
  const parts = Array.from({ length: opts.count ?? 120 }, () => {
    const a = Math.random() * Math.PI * 2;
    const v = 4 + Math.random() * 9;
    return { x: ox, y: oy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 3 + Math.random() * 5, c: colors[(Math.random() * colors.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 0 };
  });
  let frame = 0;
  const tick = () => {
    frame++;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.28;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.max(0, 1 - frame / 110);
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    }
    if (frame < 110) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
  setTimeout(() => canvas.remove(), 3000);
}

function AutoDismiss({ c, ms, children }: { c: Celebration; ms: number; children: ReactNode }) {
  useEffect(() => {
    const id = setTimeout(() => dismiss(c.id), ms);
    return () => clearTimeout(id);
  }, [c.id, ms]);
  return <>{children}</>;
}

export function Celebrations() {
  const list = useCelebrations();
  const level = list.find((c) => c.kind === 'level') as Extract<Celebration, { kind: 'level' }> | undefined;
  const toasts = list.filter((c) => c.kind === 'achievement' || c.kind === 'streak' || c.kind === 'goal' || c.kind === 'info');
  const xps = list.filter((c) => c.kind === 'xp') as Extract<Celebration, { kind: 'xp' }>[];
  const firedLevel = useRef<number | null>(null);

  useEffect(() => {
    if (level && firedLevel.current !== level.id) {
      firedLevel.current = level.id;
      confetti({ count: 160 });
    }
  }, [level]);

  return (
    <>
      <div className="xp-floats" aria-live="polite">
        {xps.slice(-3).map((x, i) => (
          <AutoDismiss key={x.id} c={x} ms={1400}>
            <div className="xp-float" style={{ top: 70 + i * 6, right: 24 + i * 4 }}>
              +{x.amount} XP
            </div>
          </AutoDismiss>
        ))}
      </div>
      <div className="toasts" aria-live="polite">
        {toasts.slice(-3).map((c) => (
          <AutoDismiss key={c.id} c={c} ms={c.kind === 'achievement' ? 5000 : 4000}>
            <Toast c={c} />
          </AutoDismiss>
        ))}
      </div>
      {level && (
        <Modal label="Level up" onClose={() => dismiss(level.id)}>
          <div className="levelup">
            <div className="levelup-badge pop" aria-hidden="true">
              <span>{level.level}</span>
            </div>
            <h2>You're now {/^[aeiou]/i.test(level.title) ? 'an' : 'a'} {level.title}</h2>
            <p className="muted">Level {level.level} reached. Every question you solve makes you a stronger programmer.</p>
            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => dismiss(level.id)}>
              Keep going
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Toast({ c }: { c: Celebration }) {
  if (c.kind === 'achievement') {
    const a = ACH_BY_ID[c.achId];
    return (
      <div className="toast" role="status">
        <div className="toast-icon" aria-hidden="true">
          <Icon name={a?.icon ?? 'trophy'} size={22} />
        </div>
        <div>
          <div className="toast-title">{a?.title}</div>
          <div className="toast-kicker">Achievement unlocked · +25 XP</div>
          <div className="toast-sub">{a?.description}</div>
        </div>
      </div>
    );
  }
  if (c.kind === 'streak') {
    return (
      <div className="toast" role="status">
        <div className="toast-icon toast-icon-streak" aria-hidden="true">
          <Flame size={22} />
        </div>
        <div>
          <div className="toast-title">{c.message}</div>
          <div className="toast-sub">Come back tomorrow to keep it going.</div>
        </div>
      </div>
    );
  }
  if (c.kind === 'goal') {
    return (
      <div className="toast" role="status">
        <div className="toast-icon" aria-hidden="true">
          <Target size={22} />
        </div>
        <div>
          <div className="toast-title">Daily goal reached! +20 XP</div>
          <div className="toast-sub">Great work today. Anything more is a bonus.</div>
        </div>
      </div>
    );
  }
  if (c.kind === 'info') {
    return (
      <div className="toast" role="status">
        <div className="toast-icon toast-icon-info" aria-hidden="true">
          <Sprout size={22} />
        </div>
        <div className="toast-sub toast-sub-strong">{c.message}</div>
      </div>
    );
  }
  return null;
}
