import { AlertTriangle, Bug, Info, Lightbulb, MapPin, Timer } from 'lucide-react';
import { useState } from 'react';
import { explainError, type PascalErrorData, type PascalWarning } from '../../pascal';
import { inline } from '../ui/Rich';

const PHASE: Record<string, { label: string; sub: string }> = {
  syntax: { label: 'Syntax error', sub: 'Something about how the code is written' },
  type: { label: 'Mistake in the code', sub: 'Pascal checked your code before running it' },
  runtime: { label: 'Runtime error', sub: 'This happened while the program was running' },
};

export function ErrorCard({ error, onShowLine, compact }: { error: PascalErrorData; onShowLine?: (line: number) => void; compact?: boolean }) {
  const f = explainError(error);
  const [showHint, setShowHint] = useState(false);
  const phase = PHASE[error.phase] ?? PHASE.runtime;
  const Icon = error.code === 'R_STEP_LIMIT' ? Timer : error.phase === 'runtime' ? AlertTriangle : Bug;
  return (
    <div className={'error-card' + (compact ? ' error-card-compact' : '')} role="alert">
      <div className="error-card-head">
        <span className="error-card-icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <div>
          <div className="error-card-phase">
            {phase.label}
            {error.line > 0 && error.code !== 'R_STOPPED' && <> · line {error.line}</>}
          </div>
          <div className="error-card-title">{f.title}</div>
        </div>
      </div>
      <p className="error-card-body">{inline(f.explanation)}</p>
      <div className="row row-wrap error-card-actions">
        {!showHint ? (
          <button type="button" className="btn btn-sm" onClick={() => setShowHint(true)}>
            <Lightbulb size={16} /> What should I check?
          </button>
        ) : (
          <div className="error-card-hint fade-up">
            <Lightbulb size={16} aria-hidden="true" />
            <span>{inline(f.hint)}</span>
          </div>
        )}
        {onShowLine && error.line > 0 && error.code !== 'R_STOPPED' && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onShowLine(error.line)}>
            <MapPin size={16} /> Go to line {error.line}
          </button>
        )}
      </div>
      {!compact && (
        <details className="error-card-tech">
          <summary>What Pascal says</summary>
          <code>{error.message}</code>
        </details>
      )}
    </div>
  );
}

export function WarningList({ warnings }: { warnings: PascalWarning[] }) {
  if (!warnings.length) return null;
  return (
    <div className="warnings">
      {warnings.map((w, i) => {
        const f = explainError(w);
        return (
          <div key={i} className="warning-note">
            <Info size={16} aria-hidden="true" />
            <div>
              <b>{f.title}</b> {w.line > 0 && <span className="subtle">(line {w.line})</span>}
              <div className="warning-text">{inline(f.explanation)} {inline(f.hint)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
