import { ArrowDown, ArrowUp, Check, CornerDownLeft, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ArrangeQ, CategorizeQ, FillQ, MatchQ, MCQ, OutputQ, Question, SpotQ, TraceQ } from '../../content/types';
import { arrangeProgram, givenText, isGiven, traceKey, type Answer, type Grade } from '../../engine/grading';
import { seeded, shuffle } from '../../engine/session';
import { CodeBlock, Tokens } from '../code/CodeBlock';
import { highlightLines } from '../code/highlight';
import { Playground } from '../code/Playground';
import { inline, Rich } from '../ui/Rich';
import { TestResults } from './TestResults';

export interface QuestionViewProps {
  q: Question;
  /** Bumped to reset the input (e.g. new question). */
  resetKey?: string | number;
  onAnswer: (a: Answer | null) => void;
  grade?: Grade | null;
  /** Input locked (after a correct answer or when revealing). */
  locked?: boolean;
  /** Show the correct answer highlighted. */
  reveal?: boolean;
  /** Called when a code question wants to submit (Check my code). */
  onSubmit?: () => void;
  /** Restore a previous answer (e.g. when moving between exam questions). */
  initial?: Answer | null;
}

const hashSeed = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function QuestionView(props: QuestionViewProps) {
  const { q } = props;
  return (
    <div className="question" key={`${q.id}-${props.resetKey ?? ''}`}>
      <div className="question-prompt">
        <Rich text={q.prompt} />
      </div>
      <QuestionBody {...props} />
    </div>
  );
}

function QuestionBody(props: QuestionViewProps) {
  const { q } = props;
  switch (q.type) {
    case 'mcq':
      return <MCQView {...props} q={q} />;
    case 'output':
      return <OutputView {...props} q={q} />;
    case 'fill':
      return <FillView {...props} q={q} />;
    case 'spot':
      return <SpotView {...props} q={q} />;
    case 'fix':
    case 'write':
      return <CodeTaskView {...props} />;
    case 'arrange':
      return <ArrangeView {...props} q={q} />;
    case 'trace':
      return <TraceView {...props} q={q} />;
    case 'match':
      return <MatchView {...props} q={q} />;
    case 'categorize':
      return <CategorizeView {...props} q={q} />;
  }
}

// ---------------------------------------------------------------- MCQ
function MCQView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: MCQ }) {
  const [choice, setChoice] = useState<number | null>(initial?.type === 'mcq' ? initial.choice : null);
  const pick = (i: number) => {
    if (locked) return;
    setChoice(i);
    onAnswer({ type: 'mcq', choice: i });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) pick(n - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <div className="stack">
      {q.code && <CodeBlock code={q.code} />}
      <div className={'options' + (q.codeOptions ? ' options-code' : '')} role="radiogroup" aria-label="Answer options">
        {q.options.map((o, i) => {
          const selected = choice === i;
          let state = '';
          if (grade && selected) state = grade.correct ? ' is-correct' : ' is-wrong';
          if (reveal && i === q.answer) state = ' is-correct';
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected}
              className={'option' + (selected ? ' is-selected' : '') + state}
              onClick={() => pick(i)}
              disabled={locked && !selected && !(reveal && i === q.answer)}
            >
              <span className="option-key" aria-hidden="true">
                {i + 1}
              </span>
              <span className="option-text">{q.codeOptions ? <CodeBlock code={o} compact className="option-code" /> : inline(o)}</span>
              {state === ' is-correct' && <Check size={18} className="option-mark" aria-label="correct" />}
              {state === ' is-wrong' && <X size={18} className="option-mark" aria-label="wrong" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Output
function InputsNote({ inputs }: { inputs?: string[] }) {
  if (!inputs?.length) return null;
  return (
    <div className="inputs-note">
      <CornerDownLeft size={15} aria-hidden="true" /> The user types:{' '}
      {inputs.map((x, i) => (
        <code key={i} className="ic">
          {x}
        </code>
      ))}
    </div>
  );
}

function OutputView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: OutputQ }) {
  const [text, setText] = useState(initial?.type === 'output' ? initial.text : '');
  const lines = Math.max(2, q.answer.split('\n').length + 1);
  return (
    <div className="stack">
      <CodeBlock code={q.code} />
      <InputsNote inputs={q.inputs} />
      <label className="output-answer">
        <span className="eyebrow">Your answer: what appears on the screen?</span>
        <textarea
          className={'textarea output-textarea' + (grade ? (grade.correct ? ' is-correct' : ' is-wrong') : '')}
          rows={Math.min(10, lines)}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onAnswer(e.target.value.trim() ? { type: 'output', text: e.target.value } : null);
          }}
          readOnly={locked}
          spellCheck={false}
          placeholder="Type the output, one line per line…"
        />
      </label>
      {reveal && (
        <div className="reveal">
          <span className="eyebrow">Correct output</span>
          <pre className="reveal-pre">{q.answer}</pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Fill
function FillView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: FillQ }) {
  const [values, setValues] = useState<string[]>(() => (initial?.type === 'fill' ? initial.values : q.blanks.map(() => '')));
  const set = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    setValues(next);
    onAnswer(next.every((x) => x.trim()) ? { type: 'fill', values: next } : null);
  };
  const lines = q.code.split('\n');
  return (
    <div className="stack">
      <div className="codeblock fill-code">
        <div className="codeblock-scroll">
          <div className="codeblock-lines">
            {lines.map((line, li) => {
              const parts = line.split(/(\[\[\d+\]\])/);
              return (
                <div key={li} className="code-line">
                  <span className="code-ln" aria-hidden="true">
                    {li + 1}
                  </span>
                  <span className="code-text">
                    {parts.map((p, pi) => {
                      const m = p.match(/^\[\[(\d+)\]\]$/);
                      if (!m) return <Tokens key={pi} toks={highlightLines(p)[0] ?? []} />;
                      const bi = Number(m[1]);
                      const b = q.blanks[bi];
                      const ok = grade?.parts?.[bi];
                      const shown = reveal && !ok ? b.accept[0] : values[bi];
                      return (
                        <input
                          key={pi}
                          className={'blank' + (grade ? (ok ? ' is-correct' : ' is-wrong') : '') + (reveal && !ok ? ' is-revealed' : '')}
                          style={{ width: `${Math.max(b.width ?? 4, shown.length + 1)}ch` }}
                          value={shown}
                          onChange={(e) => set(bi, e.target.value)}
                          readOnly={locked || reveal}
                          aria-label={`Blank ${bi + 1}`}
                          autoCapitalize="off"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      );
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {grade?.code && !grade.correct && <TestResults check={grade.code} compact />}
    </div>
  );
}

// ---------------------------------------------------------------- Spot the bug
function SpotView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: SpotQ }) {
  const [line, setLine] = useState<number | null>(initial?.type === 'spot' ? initial.line : null);
  const marks: Record<number, 'good' | 'bad' | 'selected'> = {};
  if (line) marks[line] = grade ? (grade.correct ? 'good' : 'bad') : 'selected';
  if (reveal) q.lines.forEach((l) => (marks[l] = 'good'));
  return (
    <div className="stack">
      <p className="subtle spot-help">Click (or tap) the line that contains the bug.</p>
      <CodeBlock
        code={q.code}
        marks={marks}
        onLineClick={
          locked
            ? undefined
            : (n) => {
                setLine(n);
                onAnswer({ type: 'spot', line: n });
              }
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------- Write / Fix code
function CodeTaskView({ q, onAnswer, grade, onSubmit, reveal }: QuestionViewProps) {
  const initial = q.type === 'fix' ? q.code : q.type === 'write' ? q.starter : '';
  const solution = q.type === 'fix' || q.type === 'write' ? q.solution : '';
  useEffect(() => {
    onAnswer({ type: q.type as 'fix' | 'write', code: initial });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);
  const tests = q.type === 'fix' || q.type === 'write' ? q.tests : [];
  const showTests = tests.filter((t) => t.inputs?.length);
  return (
    <div className="stack">
      {showTests.length > 0 && (
        <div className="test-preview">
          <span className="eyebrow">Your program will be tested with these inputs</span>
          <div className="row row-wrap">
            {showTests.map((t, i) => (
              <span key={i} className="chip">
                Test {i + 1}: {t.inputs!.join(', ')}
              </span>
            ))}
          </div>
        </div>
      )}
      <Playground
        initialCode={initial}
        onCodeChange={(code) => onAnswer({ type: q.type as 'fix' | 'write', code })}
        minLines={Math.max(8, initial.split('\n').length + 2)}
        actions={
          onSubmit ? (
            <button type="button" className="btn btn-sm btn-success" onClick={onSubmit}>
              <Check size={16} /> Check my code
            </button>
          ) : undefined
        }
        footer={grade?.code ? <TestResults check={grade.code} /> : undefined}
        externalError={grade?.code?.compileError?.error ?? null}
      />
      {reveal && solution && (
        <div className="reveal">
          <span className="eyebrow">One possible solution</span>
          <CodeBlock code={solution} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Arrange (Parsons)
function ArrangeView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: ArrangeQ }) {
  const all = useMemo(() => {
    const blocks = [...q.lines, ...(q.distractors ?? [])].map((text, i) => ({ id: i, text }));
    return shuffle(blocks, seeded(hashSeed(q.id)));
  }, [q]);
  const [placed, setPlaced] = useState<number[]>(() => {
    if (initial?.type !== 'arrange') return [];
    const used = new Set<number>();
    return initial.order.map((t) => all.find((b) => b.text === t && !used.has(b.id) && used.add(b.id))?.id).filter((x): x is number => x !== undefined);
  });
  const dragFrom = useRef<number | null>(null);
  const update = (next: number[]) => {
    setPlaced(next);
    onAnswer(next.length ? { type: 'arrange', order: next.map((id) => all.find((b) => b.id === id)!.text) } : null);
  };
  const pool = all.filter((b) => !placed.includes(b.id));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= placed.length) return;
    const next = [...placed];
    [next[idx], next[j]] = [next[j], next[idx]];
    update(next);
  };
  const correctAt = (i: number) => !!grade && all.find((b) => b.id === placed[i])?.text === q.lines[i];
  const fixedLine = (text: string, k: string) => (
    <div key={k} className="parsons-fixed">
      <Tokens toks={highlightLines(text)[0] ?? []} />
    </div>
  );
  return (
    <div className="parsons">
      <div className="parsons-col">
        <div className="eyebrow">Code blocks — tap to add</div>
        <div className="parsons-pool" aria-label="Available code blocks">
          {all.map((b) => {
            const used = placed.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                className={'parsons-block' + (used ? ' is-used' : '')}
                disabled={locked || used}
                aria-hidden={used || undefined}
                tabIndex={used ? -1 : undefined}
                onClick={() => update([...placed, b.id])}
              >
                <Tokens toks={highlightLines(b.text.trim())[0] ?? []} />
              </button>
            );
          })}
          {pool.length === 0 && <p className="subtle">All blocks used.</p>}
        </div>
      </div>
      <div className="parsons-col">
        <div className="eyebrow">Your program — tap a line to remove it</div>
        <div className="parsons-program codeblock">
          {q.fixedTop?.map((l, i) => fixedLine(l, 't' + i))}
          {placed.length === 0 && <div className="parsons-empty">Tap blocks on the left to build the program here.</div>}
          {placed.map((id, i) => {
            const b = all.find((x) => x.id === id)!;
            return (
              <div
                key={id}
                className={'parsons-line' + (grade ? (correctAt(i) || grade.correct ? ' is-correct' : ' is-wrong') : '')}
                draggable={!locked}
                onDragStart={() => (dragFrom.current = i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  const from = dragFrom.current;
                  if (from === null || from === i) return;
                  const next = [...placed];
                  const [x] = next.splice(from, 1);
                  next.splice(i, 0, x);
                  update(next);
                  dragFrom.current = null;
                }}
              >
                <span className="parsons-num">{i + 1}</span>
                <button type="button" className="parsons-text" disabled={locked} onClick={() => update(placed.filter((p) => p !== id))} aria-label={`Remove line: ${b.text}`}>
                  <Tokens toks={highlightLines(b.text)[0] ?? []} />
                </button>
                {!locked && (
                  <span className="parsons-moves">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                      <ArrowUp size={14} />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === placed.length - 1} aria-label="Move down">
                      <ArrowDown size={14} />
                    </button>
                  </span>
                )}
              </div>
            );
          })}
          {q.fixedBottom?.map((l, i) => fixedLine(l, 'b' + i))}
        </div>
        {grade?.code && !grade.correct && <TestResults check={grade.code} compact />}
        {reveal && (
          <div className="reveal">
            <span className="eyebrow">Correct order</span>
            <CodeBlock code={arrangeProgram(q, q.lines)} compact />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Trace table
function TraceView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: TraceQ }) {
  const [cells, setCells] = useState<Record<string, string>>(initial?.type === 'trace' ? initial.cells : {});
  const set = (k: string, v: string) => {
    const next = { ...cells, [k]: v };
    setCells(next);
    const needed = q.rows.flatMap((row, r) => row.map((v2, c) => (isGiven(v2) ? null : traceKey(r, c)))).filter(Boolean) as string[];
    onAnswer(needed.every((key) => (next[key] ?? '').trim()) ? { type: 'trace', cells: next } : null);
  };
  return (
    <div className="stack">
      <CodeBlock code={q.code} />
      <InputsNote inputs={q.inputs} />
      <div className="trace-wrap">
        <table className="trace-table">
          <thead>
            <tr>
              <th scope="col">{q.rowLabel ?? 'Step'}</th>
              {q.columns.map((c) => (
                <th key={c} scope="col" className="mono">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {q.rows.map((row, r) => (
              <tr key={r}>
                <th scope="row">{r + 1}</th>
                {row.map((v, c) => {
                  if (isGiven(v)) return <td key={c} className="trace-given mono">{givenText(v)}</td>;
                  const k = traceKey(r, c);
                  const ok = grade?.parts?.[k];
                  return (
                    <td key={c}>
                      <input
                        className={'trace-input' + (grade ? (ok ? ' is-correct' : ' is-wrong') : '')}
                        value={reveal && !ok ? v : (cells[k] ?? '')}
                        onChange={(e) => set(k, e.target.value)}
                        readOnly={locked || reveal}
                        aria-label={`Row ${r + 1}, ${q.columns[c]}`}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Match
const PAIR_COLORS = ['var(--hue-blue)', 'var(--hue-orange)', 'var(--hue-green)', 'var(--hue-pink)', 'var(--hue-violet)', 'var(--hue-teal)', 'var(--hue-amber)'];

function MatchView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: MatchQ }) {
  const rightOrder = useMemo(() => shuffle(q.pairs.map((_, i) => i), seeded(hashSeed(q.id) + 3)), [q]);
  const [pairs, setPairs] = useState<Record<number, number>>(initial?.type === 'match' ? initial.pairs : {});
  const [left, setLeft] = useState<number | null>(null);
  const colorOf = (li: number) => PAIR_COLORS[Object.keys(pairs).map(Number).sort().indexOf(li) % PAIR_COLORS.length];
  const leftOfRight = (ri: number) => Object.entries(pairs).find(([, r]) => r === ri)?.[0];
  const commit = (next: Record<number, number>) => {
    setPairs(next);
    onAnswer(Object.keys(next).length === q.pairs.length ? { type: 'match', pairs: next } : null);
  };
  const pickRight = (ri: number) => {
    if (locked || left === null) return;
    const next = { ...pairs };
    for (const [l, r] of Object.entries(next)) if (r === ri) delete next[Number(l)];
    next[left] = ri;
    commit(next);
    setLeft(null);
  };
  const shown = reveal ? Object.fromEntries(q.pairs.map((_, i) => [i, i])) : pairs;
  return (
    <div className="match">
      <p className="subtle">Tap an item on the left, then its partner on the right.</p>
      <div className="match-grid">
        <div className="match-col">
          {q.pairs.map(([l], i) => {
            const paired = shown[i] !== undefined;
            const ok = grade?.parts?.[i];
            return (
              <button
                key={i}
                type="button"
                className={'match-item' + (left === i ? ' is-active' : '') + (paired ? ' is-paired' : '') + (grade ? (ok ? ' is-correct' : ' is-wrong') : '')}
                style={paired ? ({ ['--pair' as string]: reveal ? PAIR_COLORS[i % PAIR_COLORS.length] : colorOf(i) } as React.CSSProperties) : undefined}
                onClick={() => {
                  if (locked) return;
                  if (paired && left !== i) {
                    const next = { ...pairs };
                    delete next[i];
                    commit(next);
                  }
                  setLeft(i);
                }}
                aria-pressed={left === i}
              >
                {q.codeLeft ? <code className="ic">{l}</code> : inline(l)}
              </button>
            );
          })}
        </div>
        <div className="match-col">
          {rightOrder.map((ri) => {
            const li = reveal ? String(ri) : leftOfRight(ri);
            return (
              <button
                key={ri}
                type="button"
                className={'match-item match-right' + (li !== undefined ? ' is-paired' : '')}
                style={li !== undefined ? ({ ['--pair' as string]: reveal ? PAIR_COLORS[ri % PAIR_COLORS.length] : colorOf(Number(li)) } as React.CSSProperties) : undefined}
                onClick={() => pickRight(ri)}
                disabled={locked}
              >
                {li !== undefined && <span className="match-tag">{Number(li) + 1}</span>}
                {inline(q.pairs[ri][1])}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Categorize
function CategorizeView({ q, onAnswer, grade, locked, reveal, initial }: QuestionViewProps & { q: CategorizeQ }) {
  const order = useMemo(() => shuffle(q.items.map((_, i) => i), seeded(hashSeed(q.id))), [q]);
  const [placed, setPlaced] = useState<Record<number, number>>(initial?.type === 'categorize' ? initial.placed : {});
  const [sel, setSel] = useState<number | null>(null);
  const commit = (next: Record<number, number>) => {
    setPlaced(next);
    onAnswer(Object.keys(next).length === q.items.length ? { type: 'categorize', placed: next } : null);
  };
  const place = (cat: number) => {
    if (sel === null || locked) return;
    commit({ ...placed, [sel]: cat });
    const remaining = order.filter((i) => i !== sel && placed[i] === undefined);
    setSel(remaining[0] ?? null);
  };
  useEffect(() => {
    setSel(order.find((i) => placed[i] === undefined) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);
  const shownPlaced = reveal ? Object.fromEntries(q.items.map((it, i) => [i, it.category])) : placed;
  const chip = (i: number): ReactNode => {
    const it = q.items[i];
    const ok = grade?.parts?.[i];
    return (
      <button
        key={i}
        type="button"
        className={'cat-chip' + (sel === i ? ' is-selected' : '') + (grade && shownPlaced[i] !== undefined ? (ok ? ' is-correct' : ' is-wrong') : '')}
        onClick={() => {
          if (locked) return;
          if (placed[i] !== undefined) {
            const next = { ...placed };
            delete next[i];
            commit(next);
          }
          setSel(i);
        }}
        aria-pressed={sel === i}
      >
        {q.codeItems ? <span className="mono">{it.text}</span> : inline(it.text)}
      </button>
    );
  };
  const unplaced = order.filter((i) => shownPlaced[i] === undefined);
  // Keep the pool's starting height so the buckets below don't jump as items leave it.
  const poolRef = useRef<HTMLDivElement>(null);
  const [poolMin, setPoolMin] = useState<number | undefined>();
  useLayoutEffect(() => {
    if (poolRef.current && poolMin === undefined) setPoolMin(poolRef.current.offsetHeight);
  }, [poolMin]);
  return (
    <div className="cat">
      <div className="cat-pool" aria-label="Items to sort" ref={poolRef} style={poolMin ? { minHeight: poolMin } : undefined}>
        {unplaced.length ? unplaced.map(chip) : <span className="subtle">All sorted! Tap an item to move it.</span>}
      </div>
      {sel !== null && unplaced.includes(sel) && !locked && <p className="subtle cat-help">Now choose where it goes ↓</p>}
      <div className="cat-buckets" style={{ gridTemplateColumns: `repeat(${Math.min(3, q.categories.length)}, minmax(0, 1fr))` }}>
        {q.categories.map((c, ci) => (
          <div key={ci} className="cat-bucket">
            <button type="button" className="cat-bucket-head" onClick={() => place(ci)} disabled={sel === null || locked}>
              {c}
            </button>
            <div className="cat-bucket-items">{order.filter((i) => shownPlaced[i] === ci).map(chip)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
