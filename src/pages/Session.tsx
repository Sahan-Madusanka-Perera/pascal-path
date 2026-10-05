import { ArrowRight, Check, Crown, RefreshCw, Target, Trophy, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FocusBar } from '../components/layout/AppShell';
import { confetti } from '../components/layout/Celebrations';
import { QuestionRunner, type QuestionOutcome } from '../components/questions/QuestionRunner';
import { Bar, Empty } from '../components/ui/primitives';
import { TOPICS } from '../content';
import type { Question } from '../content/types';
import { topicStrength } from '../engine/progress';
import { recordCheck } from '../engine/rewards';
import { buildSession, type SessionMode } from '../engine/session';
import { getState, useAppState } from '../engine/store';

interface Result {
  q: Question;
  o: QuestionOutcome;
  retry: boolean;
}

const MODES: SessionMode[] = ['topic', 'weak', 'check', 'random', 'challenge', 'review', 'output'];

export default function SessionRoute() {
  const [params] = useSearchParams();
  return <Session key={params.toString()} />;
}

function Session() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const modeParam = params.get('mode') as SessionMode;
  const mode: SessionMode = MODES.includes(modeParam) ? modeParam : 'random';
  const topic = params.get('topic') ?? undefined;
  const runKey = params.get('k') ?? '';
  const spec = useMemo(() => buildSession(getState(), mode, topic), [mode, topic, runKey]);
  const [queue, setQueue] = useState<Array<{ q: Question; retry: boolean }>>(() => spec.questions.map((q) => ({ q, retry: false })));
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [done, setDone] = useState(false);
  const startStrength = useRef(topic ? topicStrength(getState(), topic).score : 0);
  const s = useAppState();

  const title = topic ? `${spec.title}: ${TOPICS[topic]?.title ?? ''}` : spec.title;
  const exit = () => nav(topic ? `/learn/${topic}` : '/practice');

  if (!spec.questions.length) {
    return (
      <div className="focus">
        <FocusBar onClose={exit} />
        <main className="focus-main">
          <Empty icon="compass" title="Nothing to practise here yet">
            <p className="muted">Finish a lesson first, and questions will appear here.</p>
            <Link to="/learn" className="btn btn-primary">
              Go to the learning map
            </Link>
          </Empty>
        </main>
      </div>
    );
  }

  const onDone = (o: QuestionOutcome) => {
    const item = queue[i];
    const nextResults = [...results, { q: item.q, o, retry: item.retry }];
    setResults(nextResults);
    let nextQueue = queue;
    // Repeat difficult questions once at the end of the session.
    if (spec.retryWrong && !item.retry && (!o.correct || o.revealed) && queue.filter((x) => x.retry).length < 3) {
      nextQueue = [...queue, { q: item.q, retry: true }];
      setQueue(nextQueue);
    }
    if (i + 1 < nextQueue.length) setI(i + 1);
    else finish(nextResults);
  };

  const finish = (all: Result[]) => {
    const firstPass = all.filter((r) => !r.retry);
    if (mode === 'check' && topic) {
      const pct = Math.round((100 * firstPass.filter((r) => r.o.correct && r.o.tries === 1).length) / Math.max(1, firstPass.length));
      recordCheck(topic, pct);
      if (pct >= 80) confetti({ count: 180 });
    } else if (firstPass.filter((r) => r.o.correct).length === firstPass.length) confetti({ count: 100 });
    setDone(true);
  };

  if (done) {
    return <Summary results={results} mode={mode} topic={topic} startStrength={startStrength.current} exit={exit} again={() => nav(`/practice/session?mode=${mode}${topic ? `&topic=${topic}` : ''}&k=${Date.now()}`, { replace: true })} xpNow={s.xp} />;
  }

  const cur = queue[i];
  return (
    <div className="focus session">
      <FocusBar onClose={exit} progress={i / queue.length} label="Exit practice">
        <span className="focusbar-count subtle">
          {i + 1}/{queue.length}
        </span>
      </FocusBar>
      <main className={'focus-main' + (cur.q.type === 'write' || cur.q.type === 'fix' ? ' focus-main-wide' : '')}>
        <div className="session-title subtle">{title}</div>
        <QuestionRunner
          key={`${i}-${cur.q.id}`}
          q={cur.q}
          mode={mode === 'check' ? 'check' : mode === 'review' ? 'review' : 'practice'}
          onDone={onDone}
          continueLabel={i + 1 >= queue.length ? 'See results' : 'Continue'}
          header={cur.retry ? <span className="chip chip-info">
                <RefreshCw size={12} aria-hidden="true" /> Let's try this one again
              </span> : undefined}
        />
      </main>
    </div>
  );
}

function Summary({ results, mode, topic, startStrength, exit, again }: { results: Result[]; mode: SessionMode; topic?: string; startStrength: number; exit: () => void; again: () => void; xpNow: number }) {
  const s = useAppState();
  const first = results.filter((r) => !r.retry);
  const correct = first.filter((r) => r.o.correct).length;
  const clean = first.filter((r) => r.o.correct && r.o.tries === 1 && r.o.hints === 0).length;
  const xp = results.reduce((n, r) => n + r.o.xp, 0);
  const pct = Math.round((100 * correct) / Math.max(1, first.length));
  const checkPct = Math.round((100 * first.filter((r) => r.o.correct && r.o.tries === 1).length) / Math.max(1, first.length));
  const strengthNow = topic ? topicStrength(s, topic).score : 0;
  const passed = mode === 'check' && checkPct >= 80;
  const struggling = pct < 60;
  const topicTitle = topic ? TOPICS[topic]?.title : '';

  return (
    <div className="focus">
      <FocusBar onClose={exit} progress={1} />
      <main className="focus-main summary">
        <div className={'summary-badge pop' + (passed ? ' is-gold' : '')} aria-hidden="true">
          {mode === 'check' ? passed ? <Crown size={44} /> : <Target size={44} /> : <Trophy size={44} />}
        </div>
        <h1>
          {mode === 'check'
            ? passed
              ? `${topicTitle} mastered!`
              : `${checkPct}% — almost there`
            : pct === 100
              ? 'Perfect session!'
              : pct >= 70
                ? 'Great work!'
                : 'Good effort — keep going!'}
        </h1>
        {mode === 'check' && !passed && <p className="muted">You need 80% (correct on the first try) to master this topic. Practise a little more and try again.</p>}

        <div className="summary-stats">
          <div className="summary-stat">
            <b>{correct}/{first.length}</b>
            <span>correct</span>
          </div>
          <div className="summary-stat">
            <b>{clean}</b>
            <span>first try, no hints</span>
          </div>
          <div className="summary-stat summary-xp">
            <b>+{xp}</b>
            <span>XP earned</span>
          </div>
        </div>

        {topic && (
          <div className="card summary-strength">
            <div className="row">
              <span className="eyebrow">{topicTitle} strength</span>
              <span className="spacer" />
              <b>
                {startStrength}% → {strengthNow}%
              </b>
            </div>
            <Bar value={strengthNow / 100} label="Topic strength" />
            <p className="subtle">Strength measures what you can actually do — it grows with correct answers on harder questions.</p>
          </div>
        )}

        <ul className="summary-list">
          {results.map((r, k) => (
            <li key={k} className={r.o.correct ? 'is-ok' : 'is-bad'}>
              {r.o.correct ? <Check size={16} strokeWidth={3} className="summary-mark" aria-label="correct" /> : <X size={16} strokeWidth={3} className="summary-mark" aria-label="wrong" />}
              <span className="summary-q">{plain(r.q.prompt)}</span>
              {r.retry && <span className="chip">retry</span>}
              {r.o.hints > 0 && <span className="chip">{r.o.hints} hint{r.o.hints > 1 ? 's' : ''}</span>}
            </li>
          ))}
        </ul>

        {struggling && topic && (
          <div className="callout callout-tip">
            <div>
              <b className="callout-label">Suggestion</b>
              {topicTitle} seems tricky right now. Re-watch the lesson or try easier questions — it's normal to need a few rounds.
            </div>
          </div>
        )}

        <div className="row row-wrap summary-actions">
          {struggling && topic ? (
            <>
              <Link to={`/practice/session?mode=weak&topic=${topic}&k=${Date.now()}`} className="btn btn-primary btn-lg">
                Try easier questions <ArrowRight size={18} />
              </Link>
              <Link to={`/learn/${topic}/lesson`} className="btn btn-lg">
                Review the lesson
              </Link>
            </>
          ) : mode === 'topic' && topic && pct >= 70 ? (
            <Link to={`/practice/session?mode=check&topic=${topic}`} className="btn btn-primary btn-lg">
              Take the mastery check <ArrowRight size={18} />
            </Link>
          ) : passed && topic ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={exit}>
              Continue <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={again}>
              <RefreshCw size={18} /> Practise again
            </button>
          )}
          <button type="button" className="btn btn-lg" onClick={exit}>
            Done
          </button>
        </div>
      </main>
    </div>
  );
}

function plain(md: string) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/[`*]/g, '').split('\n')[0].slice(0, 90);
}
