import { ArrowRight, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CodeBlock } from '../components/code/CodeBlock';
import { FocusBar } from '../components/layout/AppShell';
import { QuestionRunner, type QuestionOutcome } from '../components/questions/QuestionRunner';
import { Rich } from '../components/ui/Rich';
import { STRUCTURED } from '../content/exam';
import type { StructuredPart } from '../content/types';
import { recordExam } from '../engine/rewards';
import { update } from '../engine/store';
import NotFound from './NotFound';

export default function Structured() {
  const { id = '' } = useParams();
  const sq = STRUCTURED.find((x) => x.id === id);
  const nav = useNavigate();
  const [marks, setMarks] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  if (!sq) return <NotFound />;
  const total = sq.parts.reduce((n, p) => n + p.marks, 0);
  const got = Object.values(marks).reduce((a, b) => a + b, 0);
  const allDone = sq.parts.every((_, i) => marks[i] !== undefined);

  const finish = () => {
    recordExam({ kind: 'structured', score: got, max: total, seconds: 0 });
    update((d) => {
      d.counters['sq:' + sq.id] = Math.max(d.counters['sq:' + sq.id] ?? 0, got);
    });
    setFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="focus structured">
      <FocusBar onClose={() => nav('/exam')} progress={Object.keys(marks).length / sq.parts.length}>
        <span className="hud-pill hud-score">
          {got} / {total} marks
        </span>
      </FocusBar>
      <main className="focus-main focus-main-wide">
        <h1 className="lesson-title">{sq.title}</h1>
        <p className="meta-line">Structured question · {sq.parts.reduce((n, p) => n + p.marks, 0)} marks</p>
        {finished && (
          <div className="card sq-done pop">
            <h2>
              You scored {got} / {total}
            </h2>
            <p className="muted">Structured questions test whether you can explain and write code — exactly what Paper II needs.</p>
            <div className="row row-wrap">
              <Link to="/exam" className="btn btn-primary">
                Back to Exam Ready
              </Link>
              <Link to="/revision" className="btn">
                Revise topics
              </Link>
            </div>
          </div>
        )}
        <div className="card sq-intro">
          <Rich text={sq.intro} />
          {sq.code && <CodeBlock code={sq.code} />}
        </div>
        <ol className="sq-parts">
          {sq.parts.map((p, i) => (
            <li key={i} className="sq-part">
              <div className="sq-part-head">
                <b>{p.label}</b>
                <span className="chip">
                  {p.marks} mark{p.marks > 1 ? 's' : ''}
                </span>
                {marks[i] !== undefined && (
                  <span className="chip chip-xp">
                    {marks[i]}/{p.marks}
                  </span>
                )}
              </div>
              <Rich text={p.prompt} />
              <Part part={p} done={marks[i] !== undefined} onMarked={(m) => setMarks((x) => ({ ...x, [i]: m }))} />
            </li>
          ))}
        </ol>
        {!finished && (
          <div className="sq-submit">
            <button type="button" className="btn btn-primary btn-lg" onClick={finish} disabled={!allDone}>
              Finish and save score <ArrowRight size={18} />
            </button>
            {!allDone && <span className="subtle">Answer every part to finish.</span>}
          </div>
        )}
      </main>
    </div>
  );
}

function Part({ part, done, onMarked }: { part: StructuredPart; done: boolean; onMarked: (m: number) => void }) {
  const [text, setText] = useState('');
  const [shown, setShown] = useState(false);
  const [ticks, setTicks] = useState<boolean[]>(() => (part.points ?? []).map(() => false));
  if (part.question) {
    if (done) return <p className="callout callout-success">Marked automatically.</p>;
    return (
      <QuestionRunner
        q={{ ...part.question, prompt: '' }}
        mode="exam"
        hints={false}
        inlineFooter
        continueLabel="Save marks"
        onDone={(o: QuestionOutcome) => onMarked(o.correct && !o.revealed ? (o.tries === 1 ? part.marks : Math.ceil(part.marks / 2)) : 0)}
      />
    );
  }
  const perPoint = part.marks / Math.max(1, part.points?.length ?? 1);
  return (
    <div className="stack">
      <textarea className="textarea sq-answer" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your answer here (as you would in the exam)…" readOnly={shown} aria-label="Your answer" />
      {!shown ? (
        <button type="button" className="btn" onClick={() => setShown(true)} disabled={text.trim().length < 3}>
          <Eye size={16} /> Show model answer and mark it
        </button>
      ) : (
        <div className="sq-mark fade-up">
          <div className="reveal">
            <span className="eyebrow">Model answer</span>
            <Rich text={part.model ?? ''} />
          </div>
          <p className="subtle">Be honest: tick each marking point your answer includes.</p>
          <ul className="sq-points">
            {(part.points ?? []).map((pt, k) => (
              <li key={k}>
                <label>
                  <input type="checkbox" checked={ticks[k]} disabled={done} onChange={() => setTicks((t) => t.map((v, j) => (j === k ? !v : v)))} />
                  <span>{pt}</span>
                </label>
              </li>
            ))}
          </ul>
          {!done ? (
            <button type="button" className="btn btn-primary" onClick={() => onMarked(Math.round(ticks.filter(Boolean).length * perPoint))}>
              <Check size={16} /> Save my marks
            </button>
          ) : (
            <p className="subtle">Marks saved.</p>
          )}
        </div>
      )}
    </div>
  );
}
