import { CornerDownLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import type { Segment } from '../../pascal';

interface Props {
  segments: Segment[];
  waiting: boolean;
  onSubmit: (line: string) => void;
  status: 'idle' | 'running' | 'done' | 'error' | 'stopped';
  emptyText?: string;
  minHeight?: number;
}

export function Console({ segments, waiting, onSubmit, status, emptyText, minHeight = 120 }: Props) {
  const [line, setLine] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (waiting) input.current?.focus({ preventScroll: true });
  }, [waiting]);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [segments, waiting]);

  const submit = () => {
    onSubmit(line);
    setLine('');
  };

  const empty = segments.length === 0 && !waiting;
  return (
    <div className="console" style={{ minHeight }}>
      <div className="console-head">
        <span className="console-dot" data-status={status} aria-hidden="true" />
        <span>{t('code.output')}</span>
        <span className="spacer" />
        {status === 'running' && !waiting && <span className="console-status">{t('code.running')}</span>}
        {waiting && <span className="console-status console-status-wait">{t('code.waitingInput')}</span>}
        {status === 'done' && <span className="console-status console-status-ok">{t('code.finished')}</span>}
      </div>
      <div className="console-body" ref={scroller} aria-live="polite">
        {empty ? (
          <div className="console-empty">{emptyText ?? t('code.empty')}</div>
        ) : (
          <pre className="console-pre">
            {segments.map((s, i) =>
              s.kind === 'in' ? (
                <span key={i} className="console-in">
                  {s.text}
                </span>
              ) : (
                <span key={i}>{s.text}</span>
              ),
            )}
            {waiting && (
              <span className="console-inputline">
                <input
                  ref={input}
                  className="console-input"
                  value={line}
                  onChange={(e) => setLine(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  aria-label="Program input"
                  placeholder={t('code.inputPlaceholder')}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="button" className="console-enter" onClick={submit} aria-label="Send input">
                  <CornerDownLeft size={14} />
                </button>
              </span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
