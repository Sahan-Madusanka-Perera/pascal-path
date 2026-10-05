import {
  ArrowLeftRight, Check, ChevronLeft, ChevronRight, CornerDownLeft, Keyboard, Pause, Phone, Play, Printer, Repeat, SkipBack, SkipForward, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { FrameView, Note, Snapshot, VarView } from '../../pascal';
import { CodeBlock } from './CodeBlock';

interface View {
  justRan: number;
  next: number;
  notes: Note[];
  frames: FrameView[];
  outLen: number;
  done: boolean;
}

function viewAt(trace: Snapshot[], k: number): View {
  const s = trace[k];
  if (k === 0) {
    return {
      justRan: 0,
      next: s.line,
      notes: [{ line: 0, kind: 'info', text: 'The program is about to start. Pascal has made a box for every variable.' }],
      frames: s.frames,
      outLen: s.outLen,
      done: !!s.done,
    };
  }
  return { justRan: trace[k - 1].line, next: s.done ? 0 : s.line, notes: s.notes, frames: s.frames, outLen: s.outLen, done: !!s.done };
}

const NOTE_ICON: Record<Note['kind'], typeof Check> = {
  assign: ArrowLeftRight,
  cond: Check,
  loop: Repeat,
  call: Phone,
  return: CornerDownLeft,
  input: Keyboard,
  output: Printer,
  info: Play,
};

const SPEEDS = [
  { label: 'Slow', ms: 1500 },
  { label: 'Normal', ms: 850 },
  { label: 'Fast', ms: 350 },
];

export function Visualizer({ code, trace, output, truncated, onClose }: { code: string; trace: Snapshot[]; output: string; truncated?: boolean; onClose?: () => void }) {
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const last = trace.length - 1;
  const view = useMemo(() => viewAt(trace, k), [trace, k]);
  const prev = useMemo(() => (k > 0 ? viewAt(trace, k - 1) : null), [trace, k]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    if (k >= last) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setK((x) => Math.min(last, x + 1)), SPEEDS[speed].ms);
    return () => clearTimeout(id);
  }, [playing, k, last, speed]);

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setK((x) => Math.min(last, x + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setK((x) => Math.max(0, x - 1));
    } else if (e.key === ' ') {
      e.preventDefault();
      setPlaying((p) => !p);
    }
  };

  const condNote = view.notes.find((n) => n.kind === 'cond' || (n.kind === 'loop' && n.result !== undefined));
  const badges: Record<number, ReactNode> = {};
  if (condNote && view.justRan) {
    badges[view.justRan] = (
      <span className={'viz-badge ' + (condNote.result ? 'viz-badge-true' : 'viz-badge-false')}>{condNote.kind === 'loop' ? (condNote.result ? 'loop' : 'done') : condNote.result ? 'TRUE' : 'FALSE'}</span>
    );
  }
  const marks: Record<number, 'note'> = {};
  if (view.next && view.next !== view.justRan) marks[view.next] = 'note';

  const shownOut = output.slice(0, view.outLen);
  const prevOut = prev ? output.slice(0, prev.outLen) : '';
  const newOut = shownOut.slice(prevOut.length);

  return (
    <div className="viz" ref={root} tabIndex={-1} onKeyDown={onKey} aria-label="Program visualiser">
      <div className="viz-toolbar">
        <div className="viz-title">
          <b>Step {k + 1}</b> <span className="subtle">of {trace.length}</span>
          {view.done && <span className="chip chip-easy">Finished</span>}
        </div>
        <div className="viz-controls" role="group" aria-label="Playback">
          <button type="button" className="icon-btn" onClick={() => { setK(0); setPlaying(false); }} aria-label="Back to start" disabled={k === 0}>
            <SkipBack size={18} />
          </button>
          <button type="button" className="icon-btn" onClick={() => setK((x) => Math.max(0, x - 1))} aria-label="Previous step" disabled={k === 0}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="btn btn-primary btn-sm viz-play" onClick={() => { if (k >= last) setK(0); setPlaying((p) => !p); }} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? 'Pause' : k >= last ? 'Replay' : 'Play'}
          </button>
          <button type="button" className="icon-btn" onClick={() => setK((x) => Math.min(last, x + 1))} aria-label="Next step" disabled={k >= last}>
            <ChevronRight size={20} />
          </button>
          <button type="button" className="icon-btn" onClick={() => { setK(last); setPlaying(false); }} aria-label="Jump to end" disabled={k >= last}>
            <SkipForward size={18} />
          </button>
        </div>
        <div className="segmented viz-speed" role="group" aria-label="Speed">
          {SPEEDS.map((s, i) => (
            <button key={s.label} type="button" aria-pressed={speed === i} onClick={() => setSpeed(i)}>
              {s.label}
            </button>
          ))}
        </div>
        {onClose && (
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close visualiser">
            <X size={18} />
          </button>
        )}
      </div>
      <input
        type="range"
        className="viz-slider"
        min={0}
        max={last}
        value={k}
        onChange={(e) => { setK(Number(e.target.value)); setPlaying(false); }}
        aria-label="Step"
      />
      <div className="viz-grid">
        <div className="viz-code">
          <CodeBlock code={code} active={view.justRan || undefined} marks={marks} badges={badges} maxHeight={420} />
          <div className="viz-legend subtle">
            <span><i className="viz-swatch viz-swatch-ran" /> just ran</span>
            <span><i className="viz-swatch viz-swatch-next" /> runs next</span>
            <span className="viz-keys">Use ← → to step</span>
          </div>
        </div>
        <div className="viz-side">
          <section className="viz-panel viz-happened" aria-live="polite">
            <h4>{view.justRan ? `Line ${view.justRan}` : 'Start'}: what happened</h4>
            {view.notes.length ? (
              <ul className="viz-notes">
                {view.notes.map((n, i) => {
                  const Icon = n.kind === 'cond' && n.result === false ? X : NOTE_ICON[n.kind];
                  return (
                    <li key={i} className={'viz-note viz-note-' + n.kind + (n.result === false ? ' is-false' : n.result ? ' is-true' : '')}>
                      <Icon size={15} aria-hidden="true" />
                      <span>{n.text}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="subtle">Nothing visible changed on this step.</p>
            )}
          </section>
          <section className="viz-panel">
            <h4>Variables (memory)</h4>
            {view.frames.map((f, fi) => (
              <div key={fi} className={'viz-frame' + (fi > 0 ? ' viz-frame-call' : '')}>
                {view.frames.length > 1 && <div className="viz-frame-title">{f.title}</div>}
                {f.vars.length ? (
                  <div className="viz-vars">
                    {f.vars.map((v) => (
                      <VarBox key={v.name} v={v} prev={prev?.frames[fi]?.title === f.title ? prev.frames[fi].vars.find((x) => x.name === v.name) : undefined} stepKey={k} />
                    ))}
                  </div>
                ) : (
                  <p className="subtle">No variables here.</p>
                )}
              </div>
            ))}
          </section>
          <section className="viz-panel">
            <h4>Output</h4>
            <pre className="viz-output">
              {prevOut}
              {newOut && <mark className="viz-newout">{newOut}</mark>}
              {!shownOut && <span className="subtle">(nothing printed yet)</span>}
            </pre>
          </section>
          {truncated && <p className="subtle viz-trunc">Showing the first {trace.length} steps only.</p>}
        </div>
      </div>
    </div>
  );
}

function VarBox({ v, prev, stepKey }: { v: VarView; prev?: VarView; stepKey: number }) {
  const changed = !!prev && (prev.value !== v.value || JSON.stringify(prev.items) !== JSON.stringify(v.items));
  const isNew = !prev;
  const kindLabel = v.kind === 'const' ? 'constant' : v.kind === 'param' ? 'parameter' : v.kind === 'varparam' ? 'var parameter' : v.kind === 'result' ? 'result' : null;
  if (v.items) {
    return (
      <div className={'varbox varbox-array' + (changed ? ' is-changed' : '')}>
        <div className="varbox-name">
          {v.name} <span className="varbox-type">{v.type}</span>
        </div>
        <div className="array-cells">
          {v.items.map((it, i) => {
            const pc = prev?.items?.[i];
            const cellChanged = !!pc && pc.value !== it.value;
            return (
              <div key={i} className={'array-cell' + (cellChanged ? ' is-changed' : '')}>
                <span key={cellChanged ? `${stepKey}` : 'v'} className={'array-val' + (cellChanged ? ' flash' : '')}>
                  {it.value}
                </span>
                <span className="array-idx">[{it.index}]</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className={'varbox' + (changed ? ' is-changed' : '') + (v.kind === 'const' ? ' is-const' : '') + (!v.init ? ' is-empty' : '')}>
      <div className="varbox-name">
        {v.name}
        {kindLabel && <span className="varbox-kind">{kindLabel}</span>}
      </div>
      <div key={changed || isNew ? stepKey : 'same'} className={'varbox-val' + (changed ? ' flash' : '')}>
        {v.init ? v.value : <span className="subtle" title="No value stored yet">?</span>}
      </div>
      <div className="varbox-type">{v.type}</div>
      {changed && prev?.init && <div className="varbox-old">was {prev.value}</div>}
    </div>
  );
}
