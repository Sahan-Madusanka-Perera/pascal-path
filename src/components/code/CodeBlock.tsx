import { useMemo, type ReactNode } from 'react';
import { highlightLines, type HTok } from './highlight';

export function Tokens({ toks }: { toks: HTok[] }) {
  return (
    <>
      {toks.map((t, i) =>
        t.cls === 'ws' || t.cls === 'id' ? (
          <span key={i} className={t.cls === 'id' ? 'syn-id' : undefined}>
            {t.text}
          </span>
        ) : (
          <span key={i} className={'syn-' + t.cls}>
            {t.text}
          </span>
        ),
      )}
    </>
  );
}

export interface CodeBlockProps {
  code: string;
  /** Line to highlight as "running now". */
  active?: number;
  errorLine?: number;
  /** Extra per-line marks. */
  marks?: Record<number, 'good' | 'bad' | 'selected' | 'note'>;
  onLineClick?: (line: number) => void;
  lineLabel?: (line: number) => string;
  compact?: boolean;
  /** Optional content rendered after a line (e.g. annotations). */
  after?: Record<number, ReactNode>;
  /** Small inline badge shown at the end of a line. */
  badges?: Record<number, ReactNode>;
  title?: string;
  className?: string;
  maxHeight?: number;
}

export function CodeBlock({ code, active, errorLine, marks, onLineClick, compact, after, badges, title, className, maxHeight, lineLabel }: CodeBlockProps) {
  const lines = useMemo(() => highlightLines(code.replace(/\s+$/, '')), [code]);
  const clickable = !!onLineClick;
  return (
    <div className={'codeblock ' + (compact ? 'codeblock-compact ' : '') + (className ?? '')}>
      {title && <div className="codeblock-title">{title}</div>}
      <div className="codeblock-scroll" style={maxHeight ? { maxHeight } : undefined}>
        <div className="codeblock-lines" role={clickable ? 'listbox' : undefined} aria-label={clickable ? 'Program lines' : undefined}>
          {lines.map((toks, i) => {
            const n = i + 1;
            const mark = marks?.[n];
            const cls = ['code-line', n === active ? 'is-active' : '', n === errorLine ? 'is-error' : '', mark ? 'is-' + mark : ''].join(' ');
            const content = (
              <>
                <span className="code-ln" aria-hidden="true">
                  {n}
                </span>
                <span className="code-text">{toks.length ? <Tokens toks={toks} /> : ' '}</span>
                {badges?.[n] && <span className="code-badge">{badges[n]}</span>}
              </>
            );
            return (
              <div key={n}>
                {clickable ? (
                  <button
                    type="button"
                    className={cls + ' code-line-btn'}
                    onClick={() => onLineClick!(n)}
                    role="option"
                    aria-selected={mark === 'selected'}
                    aria-label={lineLabel ? lineLabel(n) : `Line ${n}: ${toks.map((t) => t.text).join('')}`}
                  >
                    {content}
                  </button>
                ) : (
                  <div className={cls}>{content}</div>
                )}
                {after?.[n]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
