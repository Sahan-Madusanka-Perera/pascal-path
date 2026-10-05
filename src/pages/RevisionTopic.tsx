import { AlertTriangle, ArrowLeft, Check, GraduationCap, HelpCircle, Lightbulb, Target, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Playground } from '../components/code/Playground';
import { CodeBlock } from '../components/code/CodeBlock';
import { QuestionRunner } from '../components/questions/QuestionRunner';
import { inline, Rich } from '../components/ui/Rich';
import { QUESTIONS, TOPIC_ORDER, TOPICS, unitOf } from '../content';
import { COMMON_MISTAKES, DIFFERENCES } from '../content/revision';
import { completeRevision } from '../engine/rewards';
import { useAppState } from '../engine/store';
import NotFound from './NotFound';

export default function RevisionTopic() {
  const { topicId = '' } = useParams();
  const s = useAppState();
  const topic = TOPICS[topicId];
  const [miniDone, setMiniDone] = useState(false);
  if (!topic) return <NotFound />;
  const r = topic.revision;
  const unit = unitOf(topicId);
  const mini = QUESTIONS[r.mini];
  const extraMistakes = COMMON_MISTAKES.filter((m) => m.topic === topicId);
  const diffs = DIFFERENCES.filter((d) => d.topic === topicId);
  const idx = TOPIC_ORDER.indexOf(topicId);
  const next = TOPICS[TOPIC_ORDER[idx + 1]];
  const done = !!s.revisionsDone[topicId];

  return (
    <div className="page page-narrow rev-topic" style={{ ['--unit' as string]: `var(--hue-${unit.hue})` } as React.CSSProperties}>
      <Link to="/revision" className="back-link">
        <ArrowLeft size={16} /> Revision
      </Link>
      <header className="rev-head">
        <h1>{topic.title}</h1>
        <p className="meta-line">
          {unit.title} · {topic.source} · 5-minute revision
        </p>
      </header>

      <div className="rev-grid">
        <section className="card rev-block">
          <h2>
            <Lightbulb size={18} aria-hidden="true" /> What is it?
          </h2>
          <Rich text={r.what} />
        </section>
        <section className="card rev-block">
          <h2>
            <Target size={18} aria-hidden="true" /> Why is it used?
          </h2>
          <Rich text={r.why} />
        </section>
      </div>

      {r.syntax && (
        <section className="rev-block">
          <h2>Syntax</h2>
          <CodeBlock code={r.syntax} />
        </section>
      )}

      {r.example && (
        <section className="rev-block">
          <h2>Example</h2>
          <Playground initialCode={r.example.code} minLines={4} />
        </section>
      )}

      {diffs.map((d) => (
        <section key={d.title} className="card rev-block">
          <h2>Know the difference: {d.title}</h2>
          <div className={'diff-cols' + (d.c ? ' diff-cols-3' : '')}>
            {[d.a, d.b, d.c].filter(Boolean).map((col) => (
              <div key={col!.name} className="diff-col">
                <b className="mono">{col!.name}</b>
                <ul>
                  {col!.points.map((p) => (
                    <li key={p}>{inline(p)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="card rev-block rev-mistakes">
        <h2>
          <AlertTriangle size={18} aria-hidden="true" /> Common mistakes
        </h2>
        <ul>
          {r.mistakes.map((m) => (
            <li key={m}>{inline(m)}</li>
          ))}
        </ul>
        {extraMistakes.map((m) => (
          <div key={m.title} className="mistake-cols">
            <div>
              <span className="mistake-tag is-wrong">
                    <X size={13} strokeWidth={3} aria-hidden="true" /> Wrong
                  </span>
              <CodeBlock code={m.wrong} compact />
            </div>
            <div>
              <span className="mistake-tag is-right">
                    <Check size={13} strokeWidth={3} aria-hidden="true" /> Correct
                  </span>
              <CodeBlock code={m.right} compact />
            </div>
          </div>
        ))}
      </section>

      <section className="card rev-block rev-exam">
        <h2>
          <GraduationCap size={18} aria-hidden="true" /> Important exam points
        </h2>
        <ul>
          {r.examPoints.map((m) => (
            <li key={m}>{inline(m)}</li>
          ))}
        </ul>
      </section>

      {r.keyTerms && r.keyTerms.length > 0 && (
        <section className="rev-block">
          <h2>Key terms</h2>
          <dl className="glossary">
            {r.keyTerms.map((k) => (
              <div key={k.term} className="glossary-item">
                <dt>{k.term}</dt>
                <dd>{inline(k.def)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {mini && (
        <section className="rev-block rev-mini">
          <h2>
            <HelpCircle size={18} aria-hidden="true" /> Mini question
          </h2>
          {miniDone ? (
            <p className="callout callout-success">Nice — you've checked yourself on this topic.</p>
          ) : (
            <QuestionRunner q={mini} mode="review" onDone={() => setMiniDone(true)} inlineFooter continueLabel="Done" />
          )}
        </section>
      )}

      <div className="rev-finish card">
        {done ? (
          <p>
            <Check size={18} aria-hidden="true" /> You revised this topic{' '}
            {new Date(s.revisionsDone[topicId]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}.
          </p>
        ) : (
          <p className="muted">Finished reading? Mark it as revised (+15 XP).</p>
        )}
        <div className="row row-wrap">
          <button type="button" className="btn btn-primary" onClick={() => completeRevision(topicId)}>
            <Check size={18} /> {done ? 'Revised again today' : 'Mark as revised'}
          </button>
          <Link to={`/practice/session?mode=topic&topic=${topicId}`} className="btn">
            Practise this topic
          </Link>
          {next && (
            <Link to={`/revision/${next.id}`} className="btn btn-ghost">
              Next: {next.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
