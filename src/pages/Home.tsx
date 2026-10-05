import {
  ArrowRight, BookOpen, Check, Dumbbell, Flame, GraduationCap, RefreshCw, Rocket, Shield, Smile, Sparkles, Sprout, Swords, Target, Trophy, Zap,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../components/ui/icons';
import { Bar } from '../components/ui/primitives';
import { TOPIC_ORDER, TOPICS, UNITS, unitOf } from '../content';
import { ACH_BY_ID } from '../engine/achievements';
import { levelProgress } from '../engine/levels';
import { currentTopic, overallProgress, readiness, recommendations, topicProgress, unitProgress, weakAreas, type Rec } from '../engine/progress';
import { markOnboarded, setOnboarding } from '../engine/rewards';
import { isStorageAvailable, today, useAppState, type AppState } from '../engine/store';
import { t } from '../i18n';

export function Home() {
  const s = useAppState();
  if (!s.profile.onboarded) return <Welcome />;
  return <Dashboard s={s} />;
}

// ---------------------------------------------------------------- Welcome
const STEPS = [
  { title: 'Learn', text: 'Short lessons that show the code running, line by line.' },
  { title: 'Code', text: 'Write real Pascal and run it here. Errors explain themselves.' },
  { title: 'Level up', text: 'XP, streaks, unlocked topics and boss battles.' },
  { title: 'Exam ready', text: 'Timed drills and full mock exams on the O/L syllabus.' },
];

function Welcome() {
  const nav = useNavigate();
  const choose = (c: 'new' | 'basics' | 'coder') => {
    setOnboarding(c);
    nav(c === 'new' ? '/learn/intro/lesson' : c === 'basics' ? '/learn' : '/challenges');
  };
  return (
    <div className="page welcome">
      <section className="welcome-hero">
        <div className="welcome-copy">
          <h1 className="welcome-title">{t('welcome.title')}</h1>
          <p className="welcome-lead">{t('welcome.lead')}</p>
          <div className="row row-wrap">
            <button type="button" className="btn btn-primary btn-lg" onClick={() => choose('new')}>
              {t('welcome.cta')} <ArrowRight size={20} />
            </button>
            <a className="btn btn-lg btn-ghost" href="#confidence">
              I've coded before
            </a>
          </div>
          <p className="subtle welcome-note">{t('welcome.noAccount')}</p>
        </div>
        <HeroDemo />
      </section>

      <ol className="welcome-path" aria-label="How it works">
        {STEPS.map((x) => (
          <li key={x.title}>
            <b>{x.title}</b>
            <span className="muted">{x.text}</span>
          </li>
        ))}
      </ol>

      <section id="confidence" className="welcome-confidence">
        <h2>{t('welcome.confidence')}</h2>
        <p className="muted">This only sets your starting point. You can go anywhere, any time.</p>
        <div className="confidence-grid">
          {(
            [
              ['new', Sprout, t('welcome.new'), t('welcome.newSub')],
              ['basics', Smile, t('welcome.basics'), t('welcome.basicsSub')],
              ['coder', Rocket, t('welcome.coder'), t('welcome.coderSub')],
            ] as const
          ).map(([k, I, title, sub]) => (
            <button key={k} type="button" className="confidence-card" onClick={() => choose(k)}>
              <I size={22} className="confidence-icon" aria-hidden="true" />
              <span className="confidence-text">
                <b>{title}</b>
                <span className="muted">{sub}</span>
              </span>
              <ArrowRight size={18} className="confidence-arrow" aria-hidden="true" />
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm welcome-skip" onClick={() => markOnboarded()}>
          Just show me around
        </button>
      </section>
    </div>
  );
}

function HeroDemo() {
  return (
    <div className="hero-demo" aria-hidden="true">
      <div className="hero-code">
        <div className="hero-code-bar">
          <em>hello.pas</em>
        </div>
        <pre>
          <span className="syn-kw">program</span> Hello;{'\n'}
          <span className="syn-kw">var</span> name : <span className="syn-type">string</span>;{'\n'}
          <span className="syn-kw">begin</span>{'\n'}
          {'  '}<span className="syn-bi">write</span>(<span className="syn-str">'Your name: '</span>);{'\n'}
          {'  '}<span className="syn-bi">readln</span>(name);{'\n'}
          {'  '}<span className="syn-bi">writeln</span>(<span className="syn-str">'Ayubowan, '</span>, name, <span className="syn-str">'!'</span>);{'\n'}
          <span className="syn-kw">end</span>.
        </pre>
        <div className="hero-out">
          <span>Your name: </span>
          <span className="hero-typed">Dilini</span>
          <br />
          <span className="hero-line2">Ayubowan, Dilini!</span>
        </div>
      </div>
      <div className="hero-float hero-float-xp">
        <Zap size={15} strokeWidth={2.5} /> +15 XP
      </div>
      <div className="hero-float hero-float-box">
        <span className="mono">name</span>
        <b className="mono">'Dilini'</b>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Dashboard
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const REC_ICON: Record<Rec['kind'], typeof Target> = {
  continue: BookOpen, weak: Target, review: RefreshCw, check: Trophy, daily: Sparkles, boss: Swords, exam: GraduationCap, practice: Dumbbell, stretch: Zap,
};

function Dashboard({ s }: { s: AppState }) {
  const cur = currentTopic(s);
  const lp = levelProgress(s.xp);
  const overall = overallProgress(s);
  const ready = readiness(s);
  const recs = useMemo(() => recommendations(s), [s]);
  const weak = weakAreas(s);
  const xpToday = s.dailyXp[today()] ?? 0;
  const goal = s.profile.dailyGoal;
  const recentAch = Object.entries(s.achievements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const curTopic = cur ? TOPICS[cur.topicId] : null;
  const curUnit = curTopic ? unitOf(curTopic.id) : null;
  const continueTo = !cur ? '/exam' : cur.mode === 'lesson' ? `/learn/${cur.topicId}/lesson` : cur.mode === 'check' ? `/practice/session?mode=check&topic=${cur.topicId}` : `/practice/session?mode=topic&topic=${cur.topicId}`;
  const continueLabel = !cur ? 'Go to Exam Ready' : cur.mode === 'lesson' ? (s.lessons[cur.topicId]?.step ? 'Continue lesson' : 'Start lesson') : cur.mode === 'check' ? 'Take mastery check' : 'Practise';
  const lessonStep = cur && cur.mode === 'lesson' ? (s.lessons[cur.topicId]?.step ?? 0) : 0;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = today(d);
    return { key, day: d.toLocaleDateString('en', { weekday: 'narrow' }), active: (s.dailyXp[key] ?? 0) > 0, isToday: i === 6 };
  });

  return (
    <div className="page dashboard">
      <header className="dash-head">
        <h1>{greeting()}</h1>
        <p className="page-lead">{s.streak.current > 1 ? `You're on a ${s.streak.current}-day streak. Keep it going.` : 'Ready to level up your coding?'}</p>
      </header>

      {!isStorageAvailable() && (
        <div className="callout callout-mistake">
          <div>
            <b className="callout-label">Progress can't be saved</b>
            Your browser is blocking storage (private mode?). You can still learn, but progress will reset when you close the tab.
          </div>
        </div>
      )}

      <div className="dash-cols">
        <div className="dash-main">
          <section className="continue" style={curUnit ? ({ ['--unit' as string]: `var(--hue-${curUnit.hue})` } as React.CSSProperties) : undefined}>
            <div className="continue-tile" aria-hidden="true">
              {curUnit ? <Icon name={curUnit.icon} size={28} /> : <GraduationCap size={28} />}
            </div>
            <div className="continue-body">
              <h2>{curTopic ? curTopic.title : 'Every lesson done'}</h2>
              <p className="continue-meta">
                {curTopic && curUnit
                  ? `${curUnit.title} · ${cur?.mode === 'lesson' ? `Lesson, about ${curTopic.minutes} min` : cur?.mode === 'check' ? 'Mastery check' : 'Practice'}`
                  : 'Sharpen your exam skills with timed practice and mock exams.'}
              </p>
              {curTopic && lessonStep > 0 && (
                <div className="continue-progress">
                  <Bar value={lessonStep / curTopic.lesson.length} size="sm" color="var(--unit)" label="Lesson progress" />
                  <span className="subtle">
                    Step {lessonStep + 1} of {curTopic.lesson.length}
                  </span>
                </div>
              )}
            </div>
            <Link to={continueTo} className="btn btn-primary btn-lg continue-cta">
              {continueLabel} <ArrowRight size={20} />
            </Link>
          </section>

          <section>
            <h2 className="section-h">Recommended for you</h2>
            {recs.length ? (
              <div className="rec-list">
                {recs.slice(0, 5).map((r) => {
                  const I = REC_ICON[r.kind];
                  return (
                    <Link key={r.id} to={r.to} className={'rec rec-' + r.kind}>
                      <span className="rec-icon">
                        <I size={19} aria-hidden="true" />
                      </span>
                      <span className="rec-text">
                        <b>{r.title}</b>
                        <span className="muted">{r.subtitle}</span>
                      </span>
                      <ArrowRight size={18} className="rec-arrow" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="muted">Finish your first lesson and practice suggestions will appear here.</p>
            )}
          </section>
          <section>
            <div className="section-title">
              <h2 className="section-h">Your path</h2>
              <Link to="/learn" className="small-link">
                Open the learning map
              </Link>
            </div>
            <div className="path-overall">
              <Bar value={overall} label="Course progress" />
              <span className="subtle">
                {Math.round(overall * 100)}% of the course · {TOPIC_ORDER.filter((tp) => topicProgress(s, tp) >= 0.99).length} of {TOPIC_ORDER.length} topics mastered
              </span>
            </div>
            <div className="unit-strip">
              {UNITS.filter((u) => u.topics.length).map((u, i) => {
                const p = unitProgress(s, u.id);
                return (
                  <Link key={u.id} to={`/learn#${u.id}`} className="unit-chip" style={{ ['--unit' as string]: `var(--hue-${u.hue})` } as React.CSSProperties}>
                    <span className="unit-chip-icon">
                      <Icon name={u.icon} size={18} />
                    </span>
                    <span className="unit-chip-text">
                      <b>
                        <span className="subtle">{i + 1}</span> {u.title}
                      </b>
                      <Bar value={p} size="sm" color={`var(--hue-${u.hue})`} label={`${u.title} progress`} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="dash-side">
          <section className="panel today" aria-label="Today">
            <div className="today-row">
              <Flame size={20} className={'today-icon ' + (s.streak.lastDay === today() ? 'is-streak' : '')} aria-hidden="true" />
              <div className="today-main">
                <b>
                  {s.streak.current}-day streak
                  {s.streak.freezes > 0 && (
                    <span className="today-shield" title="A streak shield protects one missed day">
                      <Shield size={13} aria-hidden="true" /> {s.streak.freezes}
                    </span>
                  )}
                </b>
                <div className="week-dots" aria-label="Last 7 days">
                  {last7.map((d) => (
                    <div key={d.key} className={'week-dot' + (d.active ? ' is-on' : '') + (d.isToday ? ' is-today' : '')} title={d.key}>
                      <span>{d.active ? <Check size={11} strokeWidth={3.5} /> : null}</span>
                      <small>{d.day}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="today-row">
              <Zap size={20} className="today-icon is-xp" aria-hidden="true" />
              <div className="today-main">
                <b>
                  Level {lp.level} · {lp.title}
                </b>
                <Bar value={lp.pct} size="sm" color="var(--xp)" label="Level progress" />
                <span className="subtle">{lp.needed - lp.into} XP to level {lp.level + 1}</span>
              </div>
            </div>
            <div className="today-row">
              <Target size={20} className={'today-icon ' + (xpToday >= goal ? 'is-done' : '')} aria-hidden="true" />
              <div className="today-main">
                <b>{xpToday >= goal ? 'Daily goal reached' : `${goal - xpToday} XP to today's goal`}</b>
                <Bar value={xpToday / goal} size="sm" color={xpToday >= goal ? 'var(--success)' : 'var(--xp)'} label="Daily goal" />
                <span className="subtle">
                  {xpToday} / {goal} XP today
                </span>
              </div>
            </div>
          </section>

          <Link to="/exam" className="panel panel-link readiness-mini">
            <div className="row">
              <h3>Exam readiness</h3>
              <span className="spacer" />
              <b className="readiness-num">{ready.overall}%</b>
            </div>
            <dl className="readiness-dims">
              {(
                [
                  ['Concepts', ready.concepts],
                  ['Coding', ready.coding],
                  ['Problem solving', ready.problem],
                  ['Exam questions', ready.exam],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    <Bar value={v / 100} size="sm" color="var(--info)" label={k} />
                    <span>{v}%</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Link>

          {weak.length > 0 && (
            <section className="panel">
              <h3>Needs attention</h3>
              <ul className="weak-list">
                {weak.slice(0, 3).map((w) => (
                  <li key={w.topicId}>
                    <Link to={`/practice/session?mode=weak&topic=${w.topicId}`}>{TOPICS[w.topicId].title}</Link>
                    <span className="subtle">{Math.round(w.accuracy * 100)}% recently</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel">
            <div className="row">
              <h3>Achievements</h3>
              <span className="spacer" />
              <Link to="/progress#achievements" className="small-link">
                See all
              </Link>
            </div>
            {recentAch.length ? (
              <ul className="ach-mini">
                {recentAch.map(([id]) => (
                  <li key={id}>
                    <span className="ach-mini-icon">
                      <Icon name={ACH_BY_ID[id]?.icon ?? 'trophy'} size={16} />
                    </span>
                    <b>{ACH_BY_ID[id]?.title}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="subtle">Run your first program to earn your first badge.</p>
            )}
          </section>
        </aside>
      </div>

    </div>
  );
}
