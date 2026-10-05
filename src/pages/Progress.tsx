import { Check, Crown, Download, Flame, Lock, Shield, Upload, Zap } from 'lucide-react';
import { Icon } from '../components/ui/icons';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bar, Modal, PageHeader } from '../components/ui/primitives';
import { TOPICS, UNITS } from '../content';
import { ACHIEVEMENTS } from '../engine/achievements';
import { levelProgress, levelTitle, xpForLevel } from '../engine/levels';
import { topicStatus, topicStrength } from '../engine/progress';
import { exportProgress, importProgress, resetProgress, today, update, useAppState } from '../engine/store';

export default function Progress() {
  const s = useAppState();
  const lp = levelProgress(s.xp);
  const loc = useLocation();
  const [confirmReset, setConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [loc.hash]);

  // 10-week activity grid
  const weeks = 10;
  const days: Array<{ key: string; xp: number; future: boolean }> = [];
  const start = new Date();
  start.setDate(start.getDate() - (weeks * 7 - 1) - ((start.getDay() + 6) % 7 === 6 ? 0 : 0));
  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = today(d);
    days.push({ key, xp: s.dailyXp[key] ?? 0, future: d > new Date() });
  }
  const totalDays = Object.values(s.dailyXp).filter((x) => x > 0).length;
  const solved = Object.values(s.qstats).filter((q) => q.right > 0).length;
  const lessonsDone = Object.values(s.lessons).filter((l) => l.done).length;

  const download = () => {
    const blob = new Blob([exportProgress()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pascalpath-progress-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onImport = async (f: File) => {
    const ok = importProgress(await f.text());
    setImportMsg(ok ? 'Progress imported!' : "That file doesn't look like PascalPath progress.");
  };

  return (
    <div className="page progress-page">
      <PageHeader title="Your progress" lead="Everything is saved in this browser — no account needed. Export a backup to move to another device." />

      <section className="prog-summary">
        <div className="prog-level">
          <div className="level-card-badge">{lp.level}</div>
          <div className="prog-level-text">
            <h2>
              Level {lp.level} · {lp.title}
            </h2>
            <Bar value={lp.pct} color="var(--xp)" label="Level progress" />
            <p className="subtle">
              {lp.into} / {lp.needed} XP to {levelTitle(lp.level + 1)}
            </p>
          </div>
        </div>
        <dl className="prog-facts">
          <div>
            <dt>
              <Zap size={15} aria-hidden="true" /> Total XP
            </dt>
            <dd>{s.xp.toLocaleString()}</dd>
          </div>
          <div>
            <dt>
              <Flame size={15} aria-hidden="true" /> Streak
            </dt>
            <dd>
              {s.streak.current} day{s.streak.current === 1 ? '' : 's'} <span className="subtle">· best {s.streak.best}</span>
            </dd>
          </div>
          <div>
            <dt>
              <Shield size={15} aria-hidden="true" /> Streak shields
            </dt>
            <dd>{s.streak.freezes}</dd>
          </div>
          <div>
            <dt>
              <Check size={15} aria-hidden="true" /> Solved
            </dt>
            <dd>
              {solved} question{solved === 1 ? '' : 's'}{' '}
              <span className="subtle">
                · {lessonsDone} lesson{lessonsDone === 1 ? '' : 's'} · {totalDays} active day{totalDays === 1 ? '' : 's'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Activity</h2>
          <span className="subtle">Missing a day is OK — every 7-day streak earns a shield that protects one missed day.</span>
        </div>
        <div className="heatmap" role="img" aria-label={`Activity over the last ${weeks} weeks`}>
          {days.map((d) => (
            <span key={d.key} className={'heat' + (d.future ? ' is-future' : '')} data-level={d.xp === 0 ? 0 : d.xp < 30 ? 1 : d.xp < 80 ? 2 : 3} title={`${d.key}: ${d.xp} XP`} />
          ))}
        </div>
      </section>

      <section id="skills">
        <div className="section-title">
          <h2>Skills</h2>
          <span className="subtle">Read = lesson finished · Strength = what you can do</span>
        </div>
        <div className="skills">
          {UNITS.filter((u) => u.topics.length).map((u) => (
            <div key={u.id} className="card skill-unit" style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}>
              <h3>
                <Icon name={u.icon} size={18} className="unit-inline-icon" /> {u.title}
              </h3>
              {u.topics.map((t) => {
                const st = topicStatus(s, t);
                const str = topicStrength(s, t);
                return (
                  <div key={t} className="skill-row">
                    <span className="skill-name">
                      {TOPICS[t].title}
                      {st === 'mastered' ? <Crown size={13} className="skill-mark is-master" aria-label="mastered" /> : st === 'learned' ? <Check size={13} className="skill-mark" aria-label="lesson done" /> : null}
                    </span>
                    <Bar value={str.score / 100} size="sm" color="var(--unit)" label={`${TOPICS[t].title} strength`} />
                    <span className="subtle skill-pct">{str.score}%</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section id="achievements">
        <div className="section-title">
          <h2>Achievements</h2>
          <span className="subtle">
            {Object.keys(s.achievements).length} / {ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = s.achievements[a.id];
            const prog = !got && a.progress ? a.progress(s) : null;
            return (
              <div key={a.id} className={'ach' + (got ? ' is-got' : '')}>
                <div className="ach-icon" aria-hidden="true">
                  {got ? <Icon name={a.icon} size={22} /> : <Lock size={18} />}
                </div>
                <div className="ach-text">
                  <b>{a.title}</b>
                  <span className="subtle">{a.description}</span>
                  {got ? (
                    <span className="ach-date">Unlocked {new Date(got).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  ) : prog ? (
                    <div className="ach-prog">
                      <Bar value={Math.min(1, prog[0] / prog[1])} size="sm" color="var(--xp)" label={a.title} />
                      <span className="subtle">
                        {Math.min(prog[0], prog[1])}/{prog[1]}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card" id="levels">
        <h2>Levels</h2>
        <ol className="levels">
          {Array.from({ length: 11 }, (_, i) => i + 1).map((l) => (
            <li key={l} className={l <= lp.level ? 'is-reached' : ''}>
              <span className="levels-num">{l}</span>
              <b>{levelTitle(l)}</b>
              <span className="subtle">{xpForLevel(l).toLocaleString()} XP</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card settings" id="settings">
        <h2>Settings</h2>
        <div className="setting">
          <div>
            <b>Daily goal</b>
            <p className="subtle">How much XP you aim for each day.</p>
          </div>
          <div className="segmented" role="group" aria-label="Daily goal">
            {[
              [20, 'Casual'],
              [50, 'Regular'],
              [100, 'Serious'],
            ].map(([v, l]) => (
              <button key={v} type="button" aria-pressed={s.profile.dailyGoal === v} onClick={() => update((d) => void (d.profile.dailyGoal = v as number))}>
                {l} · {v}
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <div>
            <b>Theme</b>
            <p className="subtle">Light, dark, or follow your device.</p>
          </div>
          <div className="segmented" role="group" aria-label="Theme">
            {(['system', 'light', 'dark'] as const).map((th) => (
              <button key={th} type="button" aria-pressed={s.profile.theme === th} onClick={() => update((d) => void (d.profile.theme = th))}>
                {th[0].toUpperCase() + th.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="setting">
          <div>
            <b>Unlock all topics</b>
            <p className="subtle">Skip the recommended order and open every topic.</p>
          </div>
          <button type="button" role="switch" aria-checked={s.profile.unlockAll} className={'tswitch' + (s.profile.unlockAll ? ' is-on' : '')} onClick={() => update((d) => void (d.profile.unlockAll = !d.profile.unlockAll))}>
            <span className="tswitch-track">
              <span className="tswitch-knob" />
            </span>
            <span>{s.profile.unlockAll ? 'On' : 'Off'}</span>
          </button>
        </div>
        <div className="setting">
          <div>
            <b>Backup</b>
            <p className="subtle">Save your progress to a file, or load it on another device.</p>
          </div>
          <div className="row row-wrap">
            <button type="button" className="btn btn-sm" onClick={download}>
              <Download size={16} /> Export
            </button>
            <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Import
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            {importMsg && <span className="subtle">{importMsg}</span>}
          </div>
        </div>
        <div className="setting">
          <div>
            <b>Reset progress</b>
            <p className="subtle">Start again from zero on this device.</p>
          </div>
          <button type="button" className="btn btn-sm btn-ghost danger-text" onClick={() => setConfirmReset(true)}>
            Reset everything
          </button>
        </div>
        <p className="subtle storage-note">Progress is stored only in this browser. Clearing your browser data will reset it — export a backup if you want to keep it.</p>
      </section>

      {confirmReset && (
        <Modal label="Reset progress" onClose={() => setConfirmReset(false)}>
          <div className="stack">
            <h2>Reset all progress?</h2>
            <p className="muted">This deletes your XP, streak, lessons, achievements and saved programs on this device. It can't be undone.</p>
            <div className="row row-wrap">
              <button type="button" className="btn btn-danger" onClick={() => { resetProgress(); setConfirmReset(false); }}>
                Yes, reset
              </button>
              <button type="button" className="btn" onClick={() => setConfirmReset(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
