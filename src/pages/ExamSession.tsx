import { ArrowLeft, ArrowRight, Check, Clock, Flag, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FocusBar } from '../components/layout/AppShell';
import { confetti } from '../components/layout/Celebrations';
import { QuestionView } from '../components/questions/QuestionView';
import { Modal } from '../components/ui/primitives';
import { Rich } from '../components/ui/Rich';
import { TOPICS } from '../content';
import { STRUCTURED } from '../content/exam';
import { grade, type Answer, type Grade } from '../engine/grading';
import { recordAnswer, recordExam } from '../engine/rewards';
import { buildSession } from '../engine/session';
import { getState } from '../engine/store';
import NotFound from './NotFound';

type Phase = 'intro' | 'run' | 'results';

export default function ExamSession() {
  const { kind = '' } = useParams();
  if (kind !== 'mock' && kind !== 'timed') return <NotFound />;
  return <ExamRun key={kind} kind={kind} />;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ExamRun({ kind }: { kind: 'mock' | 'timed' }) {
  const nav = useNavigate();
  const spec = useMemo(() => buildSession(getState(), kind), [kind]);
  const qs = spec.questions;
  const [phase, setPhase] = useState<Phase>('intro');
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer | null>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [left, setLeft] = useState(spec.timeLimit ?? 600);
  const [confirm, setConfirm] = useState(false);
  const [grades, setGrades] = useState<Grade[]>([]);
  const started = useRef(0);
  const [reviewI, setReviewI] = useState<number | null>(null);

  useEffect(() => {
    if (phase !== 'run') return;
    const id = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (phase === 'run' && left <= 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  const submit = () => {
    const gs = qs.map((q, k) => (answers[k] ? grade(q, answers[k]!) : { correct: false, score: 0 }));
    setGrades(gs);
    qs.forEach((q, k) => answers[k] && recordAnswer(q, { correct: gs[k].correct, hints: 0, tries: 1, mode: 'exam' }));
    const score = gs.filter((g) => g.correct).length;
    recordExam({ kind, score, max: qs.length, seconds: Math.round((Date.now() - started.current) / 1000) });
    if (score / qs.length >= 0.75) confetti({ count: 160 });
    setPhase('results');
    setConfirm(false);
    window.scrollTo({ top: 0 });
  };

  const answered = Object.values(answers).filter(Boolean).length;
  const exit = () => nav('/exam');

  if (phase === 'intro') {
    return (
      <div className="focus">
        <FocusBar onClose={exit} />
        <main className="focus-main exam-intro fade-up">
          <h1>{kind === 'mock' ? 'Full mock exam' : 'Timed practice'}</h1>
          {kind === 'mock' && <p className="meta-line">Part A</p>}
          <ul className="game-rules">
            <li>{qs.length} questions · {Math.round((spec.timeLimit ?? 0) / 60)} minutes</li>
            <li>No hints and no feedback until you submit — just like the real exam.</li>
            <li>You can move between questions and flag ones to come back to.</li>
            <li>When time runs out, your answers are submitted automatically.</li>
            {kind === 'mock' && <li>After Part A you can do Part B: structured questions.</li>}
          </ul>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => { started.current = Date.now(); setPhase('run'); }}>
            Start — the timer begins <ArrowRight size={18} />
          </button>
        </main>
      </div>
    );
  }

  if (phase === 'results') {
    const score = grades.filter((g) => g.correct).length;
    const pct = Math.round((100 * score) / qs.length);
    const byTopic = new Map<string, { right: number; total: number }>();
    qs.forEach((q, k) => {
      const e = byTopic.get(q.topic) ?? { right: 0, total: 0 };
      e.total++;
      if (grades[k].correct) e.right++;
      byTopic.set(q.topic, e);
    });
    const weak = [...byTopic.entries()].filter(([, v]) => v.right < v.total).map(([t]) => t);
    const partB = STRUCTURED.slice().sort(() => Math.random() - 0.5).slice(0, 2);
    return (
      <div className="focus">
        <FocusBar onClose={exit} progress={1} />
        <main className="focus-main exam-results">
          <h1>
            {score} / {qs.length} <span className="subtle">({pct}%)</span>
          </h1>
          <p className="meta-line">{kind === 'mock' ? 'Mock exam, Part A' : 'Timed practice'}</p>
          <p className="page-lead">{pct >= 75 ? 'Excellent — exam ready on this material!' : pct >= 50 ? 'Good work. Review the ones you missed below.' : 'Keep going — review your mistakes and practise the weak topics.'}</p>
          {weak.length > 0 && (
            <div className="card">
              <div className="eyebrow">Topics to revise</div>
              <div className="row row-wrap">
                {weak.slice(0, 6).map((t) => (
                  <Link key={t} to={`/revision/${t}`} className="chip chip-info">
                    {TOPICS[t]?.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="review-grid" aria-label="Review answers">
            {qs.map((_, k) => (
              <button key={k} type="button" className={'review-dot' + (grades[k].correct ? ' is-ok' : ' is-bad')} onClick={() => setReviewI(k)} aria-label={`Question ${k + 1}: ${grades[k].correct ? 'correct' : 'wrong'}`}>
                {grades[k].correct ? <Check size={14} /> : <X size={14} />}
                <span>{k + 1}</span>
              </button>
            ))}
          </div>
          <p className="subtle">Tap a question number to see the correct answer and explanation.</p>
          {kind === 'mock' && (
            <div className="card">
              <div className="eyebrow">Part B · structured questions</div>
              <p className="muted">Real exams also have structured questions. Try these two:</p>
              <div className="row row-wrap">
                {partB.map((sq) => (
                  <Link key={sq.id} to={`/exam/structured/${sq.id}`} className="btn">
                    {sq.title} <ArrowRight size={16} />
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="row row-wrap">
            <Link to="/exam" className="btn btn-primary btn-lg">
              Back to Exam Ready
            </Link>
            <Link to="/practice/session?mode=review" className="btn btn-lg">
              Review mistakes
            </Link>
          </div>
          {reviewI !== null && (
            <Modal label={`Question ${reviewI + 1}`} onClose={() => setReviewI(null)} wide>
              <div className="stack">
                <div className="row">
                  <span className={'chip ' + (grades[reviewI].correct ? 'chip-easy' : 'chip-boss')}>{grades[reviewI].correct ? 'Correct' : 'Incorrect'}</span>
                  <span className="chip">{TOPICS[qs[reviewI].topic]?.title}</span>
                </div>
                <QuestionView key={reviewI} q={qs[reviewI]} initial={answers[reviewI]} onAnswer={() => {}} locked reveal grade={answers[reviewI] ? grades[reviewI] : null} />
                <div className="callout callout-tip">
                  <div>
                    <b className="callout-label">Explanation</b>
                    <Rich text={qs[reviewI].explanation} />
                  </div>
                </div>
                <div className="row">
                  <button type="button" className="btn" disabled={reviewI === 0} onClick={() => setReviewI(reviewI - 1)}>
                    <ArrowLeft size={16} /> Previous
                  </button>
                  <span className="spacer" />
                  <button type="button" className="btn" disabled={reviewI === qs.length - 1} onClick={() => setReviewI(reviewI + 1)}>
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </main>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div className="focus exam-run">
      <FocusBar onClose={() => setConfirm(true)} progress={answered / qs.length} label="Finish exam">
        <span className={'hud-pill' + (left < 60 ? ' is-urgent' : '')} aria-live="off">
          <Clock size={16} aria-hidden="true" /> {fmt(Math.max(0, left))}
        </span>
      </FocusBar>
      <main className="focus-main">
        <nav className="exam-nav" aria-label="Questions">
          {qs.map((_, k) => (
            <button
              key={k}
              type="button"
              className={'exam-nav-dot' + (k === i ? ' is-current' : '') + (answers[k] ? ' is-answered' : '') + (flags[k] ? ' is-flagged' : '')}
              onClick={() => setI(k)}
              aria-current={k === i}
              aria-label={`Question ${k + 1}${answers[k] ? ', answered' : ''}${flags[k] ? ', flagged' : ''}`}
            >
              {k + 1}
            </button>
          ))}
        </nav>
        <div className="row exam-qhead">
          <b>
            Question {i + 1} <span className="subtle">of {qs.length}</span>
          </b>
          <span className="spacer" />
          <button type="button" className={'btn btn-sm btn-ghost' + (flags[i] ? ' is-flag' : '')} onClick={() => setFlags({ ...flags, [i]: !flags[i] })} aria-pressed={!!flags[i]}>
            <Flag size={15} /> {flags[i] ? 'Flagged' : 'Flag'}
          </button>
        </div>
        <QuestionView key={i} q={q} initial={answers[i]} onAnswer={(a) => setAnswers((prev) => ({ ...prev, [i]: a }))} />
      </main>
      <div className="focus-footer">
        <div className="focus-footer-inner">
          <button type="button" className="btn" onClick={() => setI(i - 1)} disabled={i === 0}>
            <ArrowLeft size={18} /> Previous
          </button>
          <span className="spacer" />
          <span className="subtle">
            {answered}/{qs.length} answered
          </span>
          {i < qs.length - 1 ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setI(i + 1)}>
              Next <ArrowRight size={18} />
            </button>
          ) : (
            <button type="button" className="btn btn-success btn-lg" onClick={() => setConfirm(true)}>
              Submit exam
            </button>
          )}
        </div>
      </div>
      {confirm && (
        <Modal label="Submit exam" onClose={() => setConfirm(false)}>
          <div className="stack">
            <h2>Submit your answers?</h2>
            <p className="muted">
              You answered {answered} of {qs.length} questions{Object.values(flags).some(Boolean) ? ' and flagged some to review' : ''}. Unanswered questions count as wrong.
            </p>
            <div className="row row-wrap">
              <button type="button" className="btn btn-success" onClick={submit}>
                Submit now
              </button>
              <button type="button" className="btn" onClick={() => setConfirm(false)}>
                Keep working
              </button>
              <button type="button" className="btn btn-ghost" onClick={exit}>
                Quit without saving
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
