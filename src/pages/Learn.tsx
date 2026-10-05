import { Check, Crown, GraduationCap, Lock, Play, Swords, Trophy } from 'lucide-react';
import { Icon } from '../components/ui/icons';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bar, PageHeader, Ring } from '../components/ui/primitives';
import { BOSSES, TOPICS, UNITS } from '../content';
import { bossAvailable, currentTopic, overallProgress, topicProgress, topicStatus, unitProgress, type TopicStatus } from '../engine/progress';
import { useAppState } from '../engine/store';

const STATUS_LABEL: Record<TopicStatus, string> = {
  locked: 'Locked',
  available: 'Ready to start',
  learning: 'In progress',
  learned: 'Lesson done — practise to master',
  mastered: 'Mastered',
};

export default function Learn() {
  const s = useAppState();
  const cur = currentTopic(s);
  const loc = useLocation();
  const overall = overallProgress(s);
  const mastered = Object.values(s.checks).filter((c) => c.passedAt).length;
  const total = UNITS.reduce((n, u) => n + u.topics.length, 0);

  useEffect(() => {
    if (loc.hash) document.getElementById(loc.hash.slice(1))?.scrollIntoView({ block: 'start' });
  }, [loc.hash]);

  let nodeIndex = 0;
  return (
    <div className="page learn">
      <PageHeader title="Your path to O/L Pascal" lead="Follow the path from your very first program to exam-ready. Each topic: learn → practise → master.">
        <div className="map-summary">
          <div className="map-summary-top">
            <b>{Math.round(overall * 100)}%</b>
            <span className="subtle">
              {mastered} of {total} topics mastered
            </span>
          </div>
          <Bar value={overall} label="Course progress" />
          <div className="map-legend">
            <span><i className="lg lg-mastered" /> Mastered</span>
            <span><i className="lg lg-learned" /> Learned</span>
            <span><i className="lg lg-open" /> Open</span>
            <span><i className="lg lg-locked" /> Locked</span>
          </div>
        </div>
      </PageHeader>

      <div className="map">
        {UNITS.filter((u) => u.topics.length).map((u, ui) => {
          const up = unitProgress(s, u.id);
          const boss = u.boss ? BOSSES[u.boss] : null;
          const bossOpen = boss ? bossAvailable(s, u.id) : false;
          const bossDone = boss ? !!s.bosses[boss.id]?.done : false;
          return (
            <section key={u.id} id={u.id} className="map-unit" style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}>
              <header className="map-unit-head">
                <Icon name={u.icon} size={132} strokeWidth={1.6} className="map-unit-mark" />
                <span className="map-unit-icon" aria-label={`Unit ${ui + 1}`}>
                  {ui + 1}
                </span>
                <div className="map-unit-text">
                  <h2>
                    {u.title}
                    {u.theory && <span className="chip map-unit-tag">Theory</span>}
                  </h2>
                  <p>{u.subtitle}</p>
                </div>
                <div className="map-unit-progress">
                  <Bar value={up} color="var(--unit)" label={`${u.title} progress`} />
                  <span>{Math.round(up * 100)}%</span>
                </div>
              </header>
              <ol className="map-path">
                {u.topics.map((tid) => {
                  const tp = TOPICS[tid];
                  const st = topicStatus(s, tid);
                  const isCur = cur?.topicId === tid && cur.mode === 'lesson';
                  const offset = OFFSETS[nodeIndex++ % OFFSETS.length];
                  const prog = topicProgress(s, tid);
                  return (
                    <li key={tid} className={'map-node-row is-' + st} style={{ ['--x' as string]: offset } as React.CSSProperties}>
                      <Link to={`/learn/${tid}`} className={'map-node is-' + st + (isCur ? ' is-current' : '')} aria-label={`${tp.title}: ${STATUS_LABEL[st]}`}>
                        <Ring value={st === 'mastered' ? 1 : prog} size={76} stroke={6} color="var(--unit)" track="color-mix(in srgb, var(--unit) 14%, var(--surface-3))">
                          <span className="map-node-face">
                            {st === 'locked' ? <Lock size={24} /> : st === 'mastered' ? <Crown size={26} /> : st === 'learned' ? <Check size={28} strokeWidth={3} /> : <Play size={24} fill="currentColor" />}
                          </span>
                        </Ring>
                        {isCur && <span className="map-here">Start here</span>}
                      </Link>
                      <div className="map-node-label">
                        <b>{tp.title}</b>
                        <span className="subtle">{STATUS_LABEL[st]}</span>
                      </div>
                    </li>
                  );
                })}
                {boss && (
                  <li className={'map-node-row map-boss-row' + (bossDone ? ' is-mastered' : bossOpen ? ' is-available' : ' is-locked')} style={{ ['--x' as string]: '0px' } as React.CSSProperties}>
                    <Link to={`/challenges/boss/${boss.id}`} className={'map-boss' + (bossDone ? ' is-done' : bossOpen ? ' is-open' : '')} aria-label={`Boss battle: ${boss.title}`}>
                      <span className="map-boss-icon" aria-hidden="true">
                        {bossDone ? <Trophy size={22} /> : <Icon name={boss.emoji} size={22} />}
                      </span>
                      <span className="map-boss-text">
                        <b>{boss.title}</b>
                        <span className="subtle">
                          <Swords size={12} aria-hidden="true" /> Boss battle ·{' '}
                          {bossDone ? 'defeated' : bossOpen ? `${boss.stages.length} stages, ready` : "finish the unit's lessons to unlock"}
                        </span>
                      </span>
                    </Link>
                  </li>
                )}
              </ol>
            </section>
          );
        })}
        <Link to="/exam" className="map-finale">
          <GraduationCap size={28} aria-hidden="true" />
          <div>
            <h3>Exam Ready</h3>
            <p className="muted">The end of the path: mock exams, timed practice and your readiness score.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

const OFFSETS = ['0px', '56px', '84px', '56px', '0px', '-56px', '-84px', '-56px'];
