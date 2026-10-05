import { BookOpen, Code2, HelpCircle, Lightbulb, Lock, Eye } from 'lucide-react';
import { useState } from 'react';
import { TOPICS } from '../../content';
import type { Question } from '../../content/types';
import { whyWrong } from '../../engine/help';
import type { Answer, Grade } from '../../engine/grading';
import { t } from '../../i18n';
import { CodeBlock } from '../code/CodeBlock';
import { Playground } from '../code/Playground';
import { Modal } from '../ui/primitives';
import { inline, Rich } from '../ui/Rich';

interface Props {
  q: Question;
  hintsShown: number;
  onHint: () => void;
  wrongAnswer?: { answer: Answer; grade: Grade } | null;
  canReveal: boolean;
  revealNeeds: number;
  onReveal: () => void;
  disabled?: boolean;
}

export function HelpPanel({ q, hintsShown, onHint, wrongAnswer, canReveal, revealNeeds, onReveal, disabled }: Props) {
  const [modal, setModal] = useState<'concept' | 'example' | 'why' | null>(null);
  const topic = TOPICS[q.topic];
  const example = findExample(q.topic);
  const noMore = hintsShown >= q.hints.length;
  return (
    <section className="help" aria-label={t('help.title')}>
      {hintsShown > 0 && (
        <ol className="hints">
          {q.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i} className="hint fade-up">
              <span className="hint-label">
                <Lightbulb size={15} aria-hidden="true" /> {t('help.hintN', { n: i + 1, total: q.hints.length })}
              </span>
              <span>{inline(h)}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="help-row">
        <span className="help-title">
          <HelpCircle size={16} aria-hidden="true" /> {t('help.title')}
        </span>
        <button type="button" className="btn btn-sm" onClick={onHint} disabled={noMore || disabled}>
          <Lightbulb size={15} /> {noMore && hintsShown ? 'No more hints' : t('help.hint')}
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => setModal('concept')}>
          <BookOpen size={15} /> {t('help.concept')}
        </button>
        {example && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setModal('example')}>
            <Code2 size={15} /> {t('help.example')}
          </button>
        )}
        {wrongAnswer && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setModal('why')}>
            <HelpCircle size={15} /> {t('help.why')}
          </button>
        )}
        {!disabled &&
          (canReveal ? (
            <button type="button" className="btn btn-sm btn-ghost help-reveal" onClick={onReveal}>
              <Eye size={15} /> {t('help.solution')}
            </button>
          ) : (
            wrongAnswer && (
              <span className="subtle help-locked">
                <Lock size={13} aria-hidden="true" /> {t('help.solutionLocked', { n: revealNeeds })}
              </span>
            )
          ))}
      </div>

      {modal === 'concept' && topic && (
        <Modal label={t('help.concept')} onClose={() => setModal(null)} wide>
          <div className="stack">
            <div className="eyebrow">{topic.title}</div>
            <h2>Quick explanation</h2>
            <Rich text={topic.revision.what} />
            <Rich text={`**Why use it?** ${topic.revision.why}`} />
            {topic.revision.syntax && <CodeBlock code={topic.revision.syntax} title="Pattern" />}
            {topic.revision.mistakes[0] && (
              <div className="callout callout-mistake">
                <div>
                  <b className="callout-label">Watch out</b>
                  {inline(topic.revision.mistakes[0])}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
      {modal === 'example' && example && (
        <Modal label={t('help.example')} onClose={() => setModal(null)} wide>
          <div className="stack">
            <div className="eyebrow">Similar example</div>
            <h2>{example.title}</h2>
            {example.body && <Rich text={example.body} />}
            <Playground initialCode={example.code} presetInputs={example.inputs} minLines={4} />
          </div>
        </Modal>
      )}
      {modal === 'why' && wrongAnswer && (
        <Modal label={t('help.why')} onClose={() => setModal(null)}>
          <div className="stack">
            <h2>Why it isn't right yet</h2>
            <Rich text={whyWrong(q, wrongAnswer.answer, wrongAnswer.grade)} />
            <p className="subtle">Try again — use a hint if you're stuck.</p>
            <button type="button" className="btn btn-primary" onClick={() => setModal(null)}>
              {t('common.tryAgain')}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}

function findExample(topicId: string): { title: string; body?: string; code: string; inputs?: string[] } | null {
  const topic = TOPICS[topicId];
  if (!topic) return null;
  const ex = topic.lesson.find((s) => s.kind === 'example' || s.kind === 'watch');
  if (ex && (ex.kind === 'example' || ex.kind === 'watch')) return { title: ex.title, body: ex.body, code: ex.code, inputs: ex.inputs };
  if (topic.revision.example) return { title: topic.title + ' example', code: topic.revision.example.code };
  return null;
}
