import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Question } from '../../content/types';
import { grade, type Answer, type Grade } from '../../engine/grading';
import { recordAnswer } from '../../engine/rewards';
import type { Attempt } from '../../engine/store';
import { t } from '../../i18n';
import { inline, Rich } from '../ui/Rich';
import { DifficultyChip } from '../ui/primitives';
import { HelpPanel } from './HelpPanel';
import { QuestionView } from './QuestionView';

export interface QuestionOutcome {
  correct: boolean;
  hints: number;
  tries: number;
  revealed: boolean;
  xp: number;
}

interface Props {
  q: Question;
  mode: NonNullable<Attempt['m']>;
  onDone: (o: QuestionOutcome) => void;
  /** Label for the continue button after answering. */
  continueLabel?: string;
  hints?: boolean;
  record?: boolean;
  /** Render footer inline instead of fixed at bottom (e.g. inside a page). */
  inlineFooter?: boolean;
  header?: React.ReactNode;
}

type Status = 'answering' | 'correct' | 'wrong' | 'revealed';

const CODE_TYPES = new Set(['write', 'fix']);

export function QuestionRunner({ q, mode, onDone, continueLabel, hints = true, record = true, inlineFooter, header }: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [g, setG] = useState<Grade | null>(null);
  const [status, setStatus] = useState<Status>('answering');
  const [tries, setTries] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [xp, setXp] = useState(0);
  const [shake, setShake] = useState(false);
  const [lastWrong, setLastWrong] = useState<{ answer: Answer; grade: Grade } | null>(null);
  const recorded = useRef(false);
  const startedAt = useRef(Date.now());
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAnswer(null);
    setG(null);
    setStatus('answering');
    setTries(0);
    setHintsShown(0);
    setXp(0);
    setLastWrong(null);
    recorded.current = false;
    startedAt.current = Date.now();
  }, [q.id]);

  const isCode = CODE_TYPES.has(q.type);
  const resolved = status === 'correct' || status === 'revealed';

  const finish = (correct: boolean, revealed: boolean, triesNow: number) => {
    if (recorded.current) return;
    recorded.current = true;
    if (record) {
      const earned = recordAnswer(q, { correct: correct && !revealed, hints: hintsShown, tries: triesNow, mode });
      setXp(earned);
    }
  };

  const check = useCallback(() => {
    if (!answer || resolved) return;
    const result = grade(q, answer);
    const n = tries + 1;
    setTries(n);
    setG(result);
    if (result.correct) {
      setStatus('correct');
      finish(true, false, n);
    } else {
      setStatus('wrong');
      setLastWrong({ answer, grade: result });
      setShake(true);
    }
    requestAnimationFrame(() => footerRef.current?.querySelector<HTMLButtonElement>('.btn-primary, .btn-success')?.focus({ preventScroll: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, resolved, q, tries, hintsShown]);

  const reveal = () => {
    setStatus('revealed');
    finish(false, true, tries);
  };

  const retry = () => {
    setStatus('answering');
    if (!isCode) setG(null);
  };

  const next = () =>
    onDone({ correct: status === 'correct', hints: hintsShown, tries, revealed: status === 'revealed', xp });

  const onAnswer = (a: Answer | null) => {
    setAnswer(a);
    if (status === 'wrong' && !isCode) {
      setStatus('answering');
      setG(null);
    }
  };

  // Enter to check / continue (not while typing in a multi-line field)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey || e.metaKey || e.ctrlKey) return;
      const tgt = e.target as HTMLElement;
      if (tgt instanceof HTMLTextAreaElement || tgt.closest('.console') || tgt.closest('.modal')) return;
      if (tgt instanceof HTMLButtonElement) return;
      if (resolved) {
        e.preventDefault();
        next();
      } else if (answer && status === 'answering') {
        e.preventDefault();
        check();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const revealNeeds = Math.max(0, Math.min(2 - tries, q.hints.length - hintsShown));
  const canReveal = tries >= 2 || (tries >= 1 && hintsShown >= q.hints.length);

  const footer = (
    <div ref={footerRef} className={(inlineFooter ? 'inline-footer' : 'focus-footer') + (status === 'correct' ? ' is-correct' : status === 'wrong' || status === 'revealed' ? ' is-wrong' : '')}>
      <div className="focus-footer-inner">
        {status === 'answering' && (
          <>
            <span className="footer-hint subtle">{isCode ? 'Run your code, then check it.' : answer ? 'Press Enter to check' : 'Choose or type your answer'}</span>
            <span className="spacer" />
            <button type="button" className={'btn btn-lg ' + (isCode ? 'btn-success' : 'btn-primary')} disabled={!answer} onClick={check}>
              {isCode ? t('code.checkAnswer') : t('common.check')}
            </button>
          </>
        )}
        {status === 'wrong' && (
          <>
            <div className="footer-feedback">
              <XCircle size={28} className="footer-icon" aria-hidden="true" />
              <div>
                <div className="footer-title">{g && g.score > 0 && g.score < 1 && q.type !== 'mcq' ? t('feedback.partial') : t('feedback.wrong')}</div>
                <div className="footer-sub">{g?.feedback ? inline(g.feedback) : 'Have another go — use a hint if you need one.'}</div>
              </div>
            </div>
            <span className="spacer" />
            {!hints && (
              <button type="button" className="btn btn-lg btn-ghost" onClick={reveal}>
                {t('help.solution')}
              </button>
            )}
            <button type="button" className="btn btn-lg btn-primary" onClick={retry}>
              <RotateCcw size={18} /> {t('common.tryAgain')}
            </button>
          </>
        )}
        {resolved && (
          <>
            <div className="footer-feedback">
              {status === 'correct' ? <CheckCircle2 size={28} className="footer-icon pop" aria-hidden="true" /> : <XCircle size={28} className="footer-icon" aria-hidden="true" />}
              <div>
                <div className="footer-title">
                  {status === 'correct' ? (tries === 1 && hintsShown === 0 ? pickPraise(q.id) : t('feedback.correct')) : "Here's the answer"}
                  {xp > 0 && <span className="chip chip-xp footer-xp">+{xp} XP</span>}
                </div>
                <div className="footer-sub footer-explain">
                  <Rich text={g?.feedback && status === 'correct' ? g.feedback + '\n\n' + q.explanation : q.explanation} />
                </div>
              </div>
            </div>
            <span className="spacer" />
            <button type="button" className={'btn btn-lg ' + (status === 'correct' ? 'btn-success' : 'btn-primary')} onClick={next}>
              {continueLabel ?? t('common.continue')} <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="qrunner">
      <div className="qrunner-meta">
        {header}
        <DifficultyChip d={q.difficulty} />
        <span className="chip">{TYPE_LABEL[q.type]}</span>
        {q.exam && <span className="chip chip-info">Exam style</span>}
      </div>
      <div className={shake ? 'shake-once' : undefined} onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}>
        <QuestionView q={q} onAnswer={onAnswer} grade={g} locked={resolved} reveal={status === 'revealed'} onSubmit={isCode && !resolved ? check : undefined} />
      </div>
      {hints && !resolved && (
        <HelpPanel
          q={q}
          hintsShown={hintsShown}
          onHint={() => setHintsShown((h) => Math.min(q.hints.length, h + 1))}
          wrongAnswer={status === 'wrong' ? lastWrong : null}
          canReveal={canReveal}
          revealNeeds={revealNeeds || 1}
          onReveal={reveal}
        />
      )}
      {inlineFooter ? footer : createPortal(footer, document.body)}
    </div>
  );
}

export const TYPE_LABEL: Record<Question['type'], string> = {
  mcq: 'Choose the answer',
  output: 'Predict the output',
  fill: 'Fill in the code',
  spot: 'Spot the bug',
  fix: 'Fix the bug',
  write: 'Write the code',
  arrange: 'Arrange the code',
  trace: 'Trace the program',
  match: 'Match',
  categorize: 'Sort',
};

const PRAISE = ['Nailed it!', 'Spot on!', 'Brilliant!', 'Excellent!', 'Perfect!', 'Great thinking!'];
function pickPraise(id: string) {
  return PRAISE[[...id].reduce((h, c) => h + c.charCodeAt(0), 0) % PRAISE.length];
}
