import { forwardRef, useId, useImperativeHandle, useMemo, useRef, type KeyboardEvent } from 'react';
import { Tokens } from './CodeBlock';
import { highlightLines } from './highlight';

export interface CodeEditorHandle {
  focusLine: (line: number) => void;
  focus: () => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  activeLine?: number;
  errorLine?: number;
  minLines?: number;
  label?: string;
  readOnly?: boolean;
}

const INDENT = '  ';
const OPENERS = /\b(begin|then|do|else|repeat|of|var|const|record)\s*$/i;

function insertText(ta: HTMLTextAreaElement, text: string) {
  ta.focus();
  // execCommand keeps the browser's undo history working.
  const ok = typeof document.execCommand === 'function' && document.execCommand('insertText', false, text);
  if (!ok) {
    const { selectionStart: s, selectionEnd: e } = ta;
    ta.setRangeText(text, s, e, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export const CodeEditor = forwardRef<CodeEditorHandle, Props>(function CodeEditor(
  { value, onChange, onRun, activeLine, errorLine, minLines = 8, label = 'Code editor', readOnly },
  ref,
) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const helpId = useId();
  const lines = useMemo(() => highlightLines(value), [value]);
  const lineCount = Math.max(lines.length, minLines);
  const longest = useMemo(() => value.split('\n').reduce((m, l) => Math.max(m, l.length), 0), [value]);

  useImperativeHandle(ref, () => ({
    focus: () => ta.current?.focus(),
    focusLine: (line: number) => {
      const el = ta.current;
      if (!el) return;
      const parts = el.value.split('\n');
      let pos = 0;
      for (let i = 0; i < line - 1 && i < parts.length; i++) pos += parts[i].length + 1;
      el.focus();
      el.setSelectionRange(pos, pos + (parts[line - 1]?.length ?? 0));
    },
  }));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun?.();
      return;
    }
    if (e.key === 'Escape') {
      el.blur();
      return;
    }
    if (e.key === 'Tab') {
      const { selectionStart: s, selectionEnd: en, value: v } = el;
      const multi = v.slice(s, en).includes('\n');
      if (!multi && !e.shiftKey) {
        e.preventDefault();
        insertText(el, INDENT);
        return;
      }
      e.preventDefault();
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const block = v.slice(lineStart, en);
      const changed = block
        .split('\n')
        .map((l) => (e.shiftKey ? l.replace(/^ {1,2}/, '') : INDENT + l))
        .join('\n');
      el.setSelectionRange(lineStart, en);
      insertText(el, changed);
      el.setSelectionRange(lineStart, lineStart + changed.length);
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      const { selectionStart: s, value: v } = el;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const current = v.slice(lineStart, s);
      const indent = current.match(/^\s*/)?.[0] ?? '';
      const extra = OPENERS.test(current) ? INDENT : '';
      e.preventDefault();
      insertText(el, '\n' + indent + extra);
      return;
    }
    // Auto-dedent when typing "end" at the start of an over-indented line.
    if (e.key === 'd') {
      const { selectionStart: s, value: v } = el;
      const lineStart = v.lastIndexOf('\n', s - 1) + 1;
      const before = v.slice(lineStart, s);
      if (/^\s+en$/i.test(before)) {
        const prevLines = v.slice(0, lineStart).split('\n');
        // find indentation of the matching opener: previous non-empty line's indent minus one level
        const prev = [...prevLines].reverse().find((l) => l.trim());
        const prevIndent = prev?.match(/^\s*/)?.[0].length ?? 0;
        const myIndent = before.match(/^\s*/)?.[0].length ?? 0;
        if (myIndent >= prevIndent && myIndent >= 2) {
          e.preventDefault();
          el.setSelectionRange(lineStart, s);
          insertText(el, before.slice(2) + 'd');
        }
      }
    }
  };

  return (
    <div className="editor" style={{ ['--lines' as string]: lineCount }}>
      <div className="editor-gutter" aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={'editor-ln' + (i + 1 === activeLine ? ' is-active' : '') + (i + 1 === errorLine ? ' is-error' : '')}>
            {i + 1 === errorLine ? '!' : i + 1}
          </div>
        ))}
      </div>
      <div className="editor-main">
        <div className="editor-layer" style={{ minWidth: `calc(${longest + 4}ch + 28px)` }}>
          <pre className="editor-highlight" aria-hidden="true">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className={'editor-row' + (i + 1 === activeLine ? ' is-active' : '') + (i + 1 === errorLine ? ' is-error' : '')}>
                {lines[i]?.length ? <Tokens toks={lines[i]} /> : ' '}
              </div>
            ))}
          </pre>
          <textarea
            ref={ta}
            className="editor-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            wrap="off"
            aria-label={label}
            aria-describedby={helpId}
            readOnly={readOnly}
            rows={lineCount}
          />
        </div>
      </div>
      <span id={helpId} className="sr-only">
        Pascal code editor. Tab indents. Press Escape, then Tab, to leave the editor. Control Enter runs the program.
      </span>
    </div>
  );
});
