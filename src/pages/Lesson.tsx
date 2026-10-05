import { ArrowLeft, ArrowRight, Check, Dumbbell, Lightbulb, PartyPopper } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Playground, type PlaygroundHandle } from '../components/code/Playground';
import { Visualizer } from '../components/code/Visualizer';
import { CodeBlock } from '../components/code/CodeBlock';
import { confetti } from '../components/layout/Celebrations';
import { FocusBar } from '../components/layout/AppShell';
import { QuestionRunner } from '../components/questions/QuestionRunner';
import { TestResults } from '../components/questions/TestResults';
import { Callout } from '../components/ui/primitives';
import { inline, Rich } from '../components/ui/Rich';
import { Visual } from '../components/visuals/Visual';
import { QUESTIONS, TOPICS, unitOf } from '../content';
import type { LessonStep } from '../content/types';
import { runCodeTests, type CodeCheck } from '../engine/grading';
import { completeLesson, saveLessonStep } from '../engine/rewards';
import { getState, useAppState } from '../engine/store';
import { runSync } from '../pascal';
import NotFound from './NotFound';

export default function Lesson() {
  const { topicId = '' } = useParams();
  const topic = TOPICS[topicId];
  const nav = useNavigate();
  const s = useAppState();
  const saved = s.lessons[topicId];
  const [step, setStep] = useState(() => {
    const st = getState().lessons[topicId];
    return st && !st.done ? Math.min(st.step, (topic?.lesson.length ?? 1) - 1) : 0;
  });
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(0);
  const [canContinue, setCanContinue] = useState(true);

  useEffect(() => {
    if (topic && !saved?.done) saveLessonStep(topicId, step);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, topicId]);

  if (!topic) return <NotFound />;
  const unit = unitOf(topicId);
  const steps = topic.lesson;
  const cur = steps[step];
  const exit = () => nav(`/learn/${topicId}`);

  const advance = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      const xp = completeLesson(topicId);
      setEarned(xp);
      setFinished(true);
      confetti();
    }
  };

  if (finished) {
    return (
      <div className="focus" style={{ ['--unit' as string]: `var(--hue-${unit.hue})` } as React.CSSProperties}>
        <FocusBar onClose={exit} progress={1} />
        <main className="focus-main lesson-done">
          <div className="lesson-done-badge pop" aria-hidden="true">
            <PartyPopper size={44} />
          </div>
          <h1>You learned {topic.title}!</h1>
          {earned > 0 && <div className="chip chip-xp lesson-done-xp">+{earned} XP</div>}
          <ul className="objectives objectives-done">
            {topic.objectives.map((o) => (
              <li key={o}>
                <Check size={18} aria-hidden="true" /> {o}
              </li>
            ))}
          </ul>
          <p className="muted">Reading is step one. Now show you can actually do it: practice turns "I've read this" into "I can do this".</p>
          <div className="row row-wrap lesson-done-actions">
            <Link to={`/practice/session?mode=topic&topic=${topicId}`} className="btn btn-primary btn-lg">
              <Dumbbell size={20} /> Practise now
            </Link>
            <Link to={`/learn/${topicId}`} className="btn btn-lg">
              Back to topic
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isCheck = cur.kind === 'check';
  return (
    <div className="focus lesson" style={{ ['--unit' as string]: `var(--hue-${unit.hue})` } as React.CSSProperties}>
      <FocusBar onClose={exit} progress={step / steps.length} label="Exit lesson">
        <span className="focusbar-title">
          {topic.title} · {STEP_LABEL[cur.kind]}
        </span>
        <span className="focusbar-count subtle">
          {step + 1}/{steps.length}
        </span>
      </FocusBar>
      <main className="focus-main" key={step}>
        <div className="lesson-step fade-up">
          <StepView step={cur} topicId={topicId} onDone={advance} setCanContinue={setCanContinue} />
        </div>
      </main>
      {!isCheck && (
        <div className="focus-footer">
          <div className="focus-footer-inner">
            {step > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft size={18} /> Back
              </button>
            ) : (
              <span />
            )}
            <span className="spacer" />
            {cur.kind === 'try' && !canContinue ? (
              <button type="button" className="btn btn-lg" onClick={advance}>
                Skip for now <ArrowRight size={18} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={advance}>
                {step === steps.length - 1 ? 'Finish lesson' : 'Continue'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const STEP_LABEL: Record<LessonStep['kind'], string> = {
  concept: 'Concept',
  visual: 'See it',
  example: 'Example',
  watch: 'Watch it run',
  try: 'Try it',
  check: 'Quick check',
};

function StepView({ step, topicId, onDone, setCanContinue }: { step: LessonStep; topicId: string; onDone: () => void; setCanContinue: (b: boolean) => void }) {
  useEffect(() => setCanContinue(step.kind !== 'try' || !step.tests?.length), [step, setCanContinue]);
  switch (step.kind) {
    case 'concept':
      return (
        <div className="stack">
          <h1 className="lesson-title">{step.title}</h1>
          <Rich text={step.body} className="lesson-body" />
          {step.code && <CodeBlock code={step.code} />}
          {step.callout && <Callout c={step.callout} />}
        </div>
      );
    case 'visual':
      return (
        <div className="stack">
          <h1 className="lesson-title">{step.title}</h1>
          {step.body && <Rich text={step.body} className="lesson-body" />}
          <Visual kind={step.visual} />
          {step.callout && <Callout c={step.callout} />}
        </div>
      );
    case 'example':
      return (
        <div className="stack">
          <h1 className="lesson-title">{step.title}</h1>
          {step.body && <Rich text={step.body} className="lesson-body" />}
          {step.inputs?.length ? (
            <p className="subtle">
              When it asks for input, try typing: {step.inputs.map((x) => <code key={x} className="ic">{x}</code>)}
            </p>
          ) : null}
          <Playground initialCode={step.code} minLines={Math.min(14, step.code.split('\n').length + 1)} />
          {step.notes && (
            <ol className="line-notes">
              {step.notes.map((n) => (
                <li key={n.line}>
                  <span className="line-note-num">Line {n.line}</span>
                  <span>{inline(n.text)}</span>
                </li>
              ))}
            </ol>
          )}
          {step.callout && <Callout c={step.callout} />}
        </div>
      );
    case 'watch':
      return <WatchStep step={step} />;
    case 'try':
      return <TryStep step={step} setCanContinue={setCanContinue} />;
    case 'check': {
      const q = QUESTIONS[step.question];
      if (!q) return <p>Missing question {step.question}</p>;
      return (
        <div className="stack">
          {step.title && <h1 className="lesson-title">{step.title}</h1>}
          <QuestionRunner q={q} mode="lesson" onDone={onDone} />
        </div>
      );
    }
  }
  void topicId;
}

function WatchStep({ step }: { step: Extract<LessonStep, { kind: 'watch' }> }) {
  const result = useMemo(() => runSync(step.code, { inputs: step.inputs ?? [], trace: true, traceLimit: 400 }), [step]);
  return (
    <div className="stack">
      <h1 className="lesson-title">{step.title}</h1>
      {step.body && <Rich text={step.body} className="lesson-body" />}
      {step.inputs?.length ? (
        <p className="subtle">
          The user types: {step.inputs.map((x) => <code key={x} className="ic">{x}</code>)}
        </p>
      ) : null}
      <div className="card watch-card">
        <Visualizer code={step.code} trace={result.trace} output={result.output} truncated={result.traceTruncated} />
      </div>
    </div>
  );
}

function TryStep({ step, setCanContinue }: { step: Extract<LessonStep, { kind: 'try' }>; setCanContinue: (b: boolean) => void }) {
  const pg = useRef<PlaygroundHandle>(null);
  const [check, setCheck] = useState<CodeCheck | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const hasTests = !!step.tests?.length;
  const doCheck = () => {
    const code = pg.current?.getCode() ?? step.starter;
    const c = runCodeTests(code, step.tests ?? [], step.requires);
    setCheck(c);
    if (c.passed) {
      setCanContinue(true);
      confetti({ count: 60, y: innerHeight * 0.7 });
    }
  };
  return (
    <div className="stack">
      <h1 className="lesson-title">{step.title}</h1>
      <div className="try-task card">
        <Rich text={step.body} />
      </div>
      <Playground
        ref={pg}
        initialCode={step.starter}
        minLines={Math.max(8, step.starter.split('\n').length + 2)}
        actions={
          hasTests ? (
            <button type="button" className="btn btn-sm btn-success" onClick={doCheck}>
              <Check size={16} /> Check my code
            </button>
          ) : undefined
        }
        footer={check ? <TestResults check={check} /> : undefined}
        externalError={check?.compileError?.error ?? null}
      />
      {check?.passed && (
        <div className="callout callout-success pop">
          <Check size={18} className="callout-icon" aria-hidden="true" />
          <div>
            <b className="callout-label">You did it!</b>
            Your code works. Press Continue when you're ready.
          </div>
        </div>
      )}
      {step.hints.length > 0 && !check?.passed && (
        <div className="help">
          {hints > 0 && (
            <ol className="hints">
              {step.hints.slice(0, hints).map((h, i) => (
                <li key={i} className="hint fade-up">
                  <span className="hint-label">
                    <Lightbulb size={15} aria-hidden="true" /> Hint {i + 1}
                  </span>
                  <span>{inline(h)}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="help-row">
            <button type="button" className="btn btn-sm" onClick={() => setHints((h) => h + 1)} disabled={hints >= step.hints.length}>
              <Lightbulb size={15} /> {hints >= step.hints.length ? 'No more hints' : 'Give me a hint'}
            </button>
            {step.solution && hints >= step.hints.length && (
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowSolution(true)}>
                Show a solution
              </button>
            )}
          </div>
          {showSolution && step.solution && (
            <div className="reveal">
              <span className="eyebrow">One possible solution</span>
              <CodeBlock code={step.solution} />
              <button type="button" className="btn btn-sm" onClick={() => pg.current?.setCode(step.solution!)}>
                Copy into the editor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
