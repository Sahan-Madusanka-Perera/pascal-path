import { ArrowRight, BookOpenCheck, ClipboardList, Eye, FileText, NotebookPen, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, PageHeader } from '../components/ui/primitives';
import { TOPIC_ORDER, TOPICS } from '../content';
import { STRUCTURED } from '../content/exam';
import { readiness, topicStrength } from '../engine/progress';
import { useAppState } from '../engine/store';

const DIMS = [
  { key: 'concepts', label: 'Concepts', text: 'Definitions, rules and theory questions.' },
  { key: 'coding', label: 'Coding', text: 'Writing, fixing and completing real programs.' },
  { key: 'problem', label: 'Problem solving', text: 'Tracing, predicting output and challenge problems.' },
  { key: 'exam', label: 'Exam questions', text: 'Your scores in timed practice and mock exams.' },
] as const;

export default function Exam() {
  const s = useAppState();
  const r = readiness(s);
  const read = TOPIC_ORDER.filter((t) => s.lessons[t]?.done).length;
  const can = TOPIC_ORDER.filter((t) => s.checks[t]?.passedAt).length;
  const weakest = TOPIC_ORDER.filter((t) => s.lessons[t]?.done)
    .map((t) => ({ t, v: topicStrength(s, t).score }))
    .sort((a, b) => a.v - b.v)
    .slice(0, 3);
  const history = [...s.exams].reverse().slice(0, 6);

  return (
    <div className="page exam">
      <PageHeader title="Get exam ready" lead="Train under exam conditions, then review every answer. Your readiness score only grows when you can actually do things — not by reading pages." />

      <section className="readiness">
        <div className="readiness-head">
          <div className="readiness-score">
            <span className="readiness-big">{r.overall}%</span>
            <span className="muted">ready for the exam</span>
          </div>
          <dl className="readiness-split">
            <div>
              <dt>Topics read</dt>
              <dd>
                {read} <span className="subtle">of {TOPIC_ORDER.length}</span>
              </dd>
            </div>
            <div>
              <dt>Topics mastered</dt>
              <dd>
                {can} <span className="subtle">of {TOPIC_ORDER.length}</span>
              </dd>
            </div>
          </dl>
        </div>
        <Bar value={r.overall / 100} size="lg" color="var(--info)" label={`Exam readiness ${r.overall}%`} />
        <div className="readiness-dims-lg">
          {DIMS.map((d) => (
            <div key={d.key} className="dim">
              <div className="row">
                <b>{d.label}</b>
                <span className="spacer" />
                <b>{r[d.key]}%</b>
              </div>
              <Bar value={r[d.key] / 100} size="sm" color="var(--info)" label={d.label} />
              <span className="subtle">{d.text}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="exam-modes">
        <Link to="/exam/run/mock" className="exam-feature">
          <span className="exam-feature-icon" aria-hidden="true">
            <ClipboardList size={26} />
          </span>
          <span className="exam-feature-text">
            <b>Full mock exam</b>
            <span className="muted">Part A: 25 questions across the whole syllabus in 40 minutes, no hints. Then Part B structured questions.</span>
          </span>
          <span className="btn btn-primary">
            Start mock exam <ArrowRight size={16} />
          </span>
        </Link>
        <div className="rec-list">
          {(
            [
              ['/exam/run/timed', Timer, 'Timed practice', '10 exam-style questions in 12 minutes. A quick daily drill.'],
              ['/practice/session?mode=output', Eye, 'Output questions', '"What does this program print?" with hints and explanations.'],
              ['/revision', NotebookPen, 'Quick revision', '5-minute summaries, key differences and common mistakes for every topic.'],
            ] as const
          ).map(([to, I, title, text]) => (
            <Link key={to} to={to} className="rec rec-exam">
              <span className="rec-icon">
                <I size={19} aria-hidden="true" />
              </span>
              <span className="rec-text">
                <b>{title}</b>
                <span className="muted">{text}</span>
              </span>
              <ArrowRight size={18} className="rec-arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2 className="section-h">Structured questions</h2>
          <span className="subtle">Paper II style · code parts auto-marked</span>
        </div>
        <div className="grid-auto">
          {STRUCTURED.map((q) => {
            const marks = q.parts.reduce((n, p) => n + p.marks, 0);
            const best = s.counters['sq:' + q.id];
            return (
              <Link key={q.id} to={`/exam/structured/${q.id}`} className="card card-link sq-card">
                <FileText size={20} aria-hidden="true" />
                <h3>{q.title}</h3>
                <p className="muted">{q.topics.map((t) => TOPICS[t]?.title).filter(Boolean).join(' · ')}</p>
                <div className="row">
                  <span className="chip">{marks} marks</span>
                  {best !== undefined && <span className="chip chip-xp">Best {best}/{marks}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid-2">
        <section className="card">
          <h3>Focus your revision</h3>
          {weakest.length ? (
            <ul className="weak-list">
              {weakest.map((w) => (
                <li key={w.t}>
                  <Link to={`/practice/session?mode=weak&topic=${w.t}`}>{TOPICS[w.t].title}</Link>
                  <span className="subtle">{w.v}% strength</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">Complete some lessons to see which topics need the most work.</p>
          )}
        </section>
        <section className="card">
          <h3>Recent exam attempts</h3>
          {history.length ? (
            <ul className="history">
              {history.map((e, i) => (
                <li key={i}>
                  <BookOpenCheck size={16} aria-hidden="true" />
                  <span>{e.kind === 'mock' ? 'Mock exam' : e.kind === 'timed' ? 'Timed practice' : 'Structured'}</span>
                  <span className="subtle">{new Date(e.ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                  <b>{Math.round((100 * e.score) / e.max)}%</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted">No attempts yet. Try a timed practice to get your first exam score.</p>
          )}
        </section>
      </div>
    </div>
  );
}
