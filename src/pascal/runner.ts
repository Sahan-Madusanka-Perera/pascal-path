import type { Program } from './ast';
import { check } from './checker';
import { PascalError, type PascalErrorData, type PascalWarning } from './errors';
import { displayValue } from './format';
import { Frame, Interpreter, type Note, type Yield } from './interpreter';
import { parse } from './parser';
import { isArrayValue, tyName, type Ty } from './types';

export interface Compiled {
  program: Program;
  src: string;
  warnings: PascalWarning[];
  globals: import('./ast').RoutineInfo['locals'];
}

export type CompileResult = { ok: true; compiled: Compiled } | { ok: false; error: PascalErrorData };

export function compile(src: string): CompileResult {
  try {
    const { program, ignoredAfterLine } = parse(src);
    const checker = check(program);
    const warnings = [...checker.warnings];
    if (ignoredAfterLine) {
      warnings.push({ code: 'W_CODE_AFTER_END', line: ignoredAfterLine, message: 'Code after "end." ignored', params: { line: String(ignoredAfterLine) } });
    }
    return { ok: true, compiled: { program, src, warnings, globals: checker.globals } };
  } catch (e) {
    if (e instanceof PascalError) return { ok: false, error: e.toData() };
    throw e;
  }
}

// ---------- Trace snapshots (for "Show me what happened") ----------
export interface VarView {
  name: string;
  type: string;
  kind: string;
  value: string;
  init: boolean;
  items?: Array<{ index: number; value: string }>;
}
export interface FrameView {
  title: string;
  vars: VarView[];
}
export interface Snapshot {
  step: number;
  /** Line about to run (0 when finished). */
  line: number;
  frames: FrameView[];
  outLen: number;
  /** What happened since the previous snapshot. */
  notes: Note[];
  done?: boolean;
}

export interface Segment {
  kind: 'out' | 'in';
  text: string;
}

export interface RunOptions {
  inputs?: string[];
  /** Ask the UI for a line of input when the queue is empty. Resolve null to cancel. */
  onInput?: () => Promise<string | null>;
  onOutput?: (text: string) => void;
  onEcho?: (text: string) => void;
  onClear?: () => void;
  maxSteps?: number;
  trace?: boolean;
  traceLimit?: number;
  random?: () => number;
  shouldStop?: () => boolean;
}

export interface RunResult {
  status: 'ok' | 'compile-error' | 'runtime-error' | 'stopped';
  output: string;
  transcript: Segment[];
  error?: PascalErrorData;
  warnings: PascalWarning[];
  trace: Snapshot[];
  traceTruncated: boolean;
  steps: number;
  inputsUsed: string[];
}

function viewOf(cellTy: Ty, value: unknown): Pick<VarView, 'value' | 'items'> {
  if (cellTy.k === 'array' && isArrayValue(value)) {
    return {
      value: '',
      items: value.items.map((v, i) => ({ index: value.lo + i, value: displayValue(v, cellTy.of) })),
    };
  }
  return { value: displayValue(value, cellTy) };
}

function snapshotFrames(interp: Interpreter): FrameView[] {
  const frames: FrameView[] = [];
  const views = (f: Frame): VarView[] => {
    const out: VarView[] = [];
    for (const c of f.cells.values()) {
      out.push({ name: c.text, type: tyName(c.ty), kind: c.kind, init: c.init, ...viewOf(c.ty, c.value) });
    }
    if (f.resultCell) {
      const c = f.resultCell;
      out.push({ name: `${c.text} (result)`, type: tyName(c.ty), kind: 'result', init: c.init, ...viewOf(c.ty, c.value) });
    }
    return out;
  };
  const constViews: VarView[] = interp.constants.map((c) => ({ name: c.text, type: tyName(c.ty), kind: 'const', init: true, value: displayValue(c.value, c.ty) }));
  frames.push({ title: 'Main program', vars: [...constViews, ...views(interp.global)] });
  for (const f of interp.callStack) frames.push({ title: f.title, vars: views(f) });
  return frames;
}

class Session {
  interp: Interpreter;
  gen: Generator<Yield, void, string | undefined>;
  output = '';
  transcript: Segment[] = [];
  trace: Snapshot[] = [];
  traceTruncated = false;
  inputsUsed: string[] = [];
  queue: string[];
  opts: RunOptions;
  compiled: Compiled;

  constructor(compiled: Compiled, opts: RunOptions) {
    this.compiled = compiled;
    this.opts = opts;
    this.queue = [...(opts.inputs ?? [])];
    this.interp = new Interpreter(
      compiled.program,
      compiled.src,
      {
        out: (text) => {
          this.output += text;
          const last = this.transcript[this.transcript.length - 1];
          if (last && last.kind === 'out') last.text += text;
          else this.transcript.push({ kind: 'out', text });
          opts.onOutput?.(text);
        },
        random: opts.random,
      },
      compiled.globals,
    );
    this.interp.constants = compiled.program.block.consts.map((c) => {
      const ty = (c.expr.ty ?? { k: 'integer' }) as Ty;
      return { name: c.name, text: c.text, ty, value: constValueOf(c.expr) };
    });
    this.interp.maxSteps = opts.maxSteps ?? 2_000_000;
    if (opts.trace) this.interp.notes = [];
    this.gen = this.interp.run();
  }

  snapshot(line: number, done = false) {
    if (!this.opts.trace) return;
    const limit = this.opts.traceLimit ?? 2000;
    const notes = this.interp.notes ?? [];
    this.interp.notes = [];
    if (this.trace.length >= limit) {
      this.traceTruncated = true;
      if (!done) return;
    }
    this.trace.push({ step: this.trace.length, line, frames: snapshotFrames(this.interp), outLen: this.output.length, notes, done });
  }

  echo(line: string) {
    this.inputsUsed.push(line);
    this.transcript.push({ kind: 'in', text: line + '\n' });
    this.opts.onEcho?.(line);
  }

  result(status: RunResult['status'], error?: PascalErrorData): RunResult {
    return {
      status,
      output: this.output,
      transcript: this.transcript,
      error,
      warnings: [...this.compiled.warnings, ...this.interp.warnings],
      trace: this.trace,
      traceTruncated: this.traceTruncated,
      steps: this.interp.steps,
      inputsUsed: this.inputsUsed,
    };
  }
}

function constValueOf(e: import('./ast').Expr): unknown {
  switch (e.kind) {
    case 'num':
    case 'str':
    case 'bool':
      return e.value;
    case 'unary':
      return e.op === '-' ? -(constValueOf(e.operand) as number) : constValueOf(e.operand);
    case 'var':
      return e.sym?.kind === 'const' ? e.sym.value : 0;
    case 'binary': {
      const a = constValueOf(e.left) as number;
      const b = constValueOf(e.right) as number;
      switch (e.op) {
        case '+': return (a as unknown as string) + (b as unknown as string);
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case 'div': return Math.trunc(a / b);
        case 'mod': return a % b;
      }
      return 0;
    }
    default:
      return 0;
  }
}

function errorData(e: unknown): PascalErrorData {
  if (e instanceof PascalError) return e.toData();
  return { code: 'INTERNAL', line: 0, message: String(e instanceof Error ? e.message : e), phase: 'runtime' };
}

/** Run to completion synchronously (tests, auto-marking). Input comes only from `inputs`. */
export function runSync(src: string, opts: RunOptions = {}): RunResult {
  const c = compile(src);
  if (!c.ok) {
    return { status: 'compile-error', output: '', transcript: [], error: c.error, warnings: [], trace: [], traceTruncated: false, steps: 0, inputsUsed: [] };
  }
  const s = new Session(c.compiled, { maxSteps: 300_000, ...opts });
  let send: string | undefined;
  try {
    for (;;) {
      const r = s.gen.next(send);
      send = undefined;
      if (r.done) break;
      const y = r.value;
      if (y.t === 'step') s.snapshot(y.line);
      else if (y.t === 'input') {
        const line = s.queue.shift();
        if (line !== undefined) s.echo(line);
        send = line;
      } else if (y.t === 'clear') {
        s.output += '';
      }
    }
  } catch (e) {
    s.snapshot(s.interp.steps ? 0 : 0, true);
    return s.result('runtime-error', errorData(e));
  }
  s.snapshot(0, true);
  return s.result('ok');
}

/** Run with interactive input and periodic yielding so the UI stays responsive. */
export async function runAsync(src: string, opts: RunOptions = {}): Promise<RunResult> {
  const c = compile(src);
  if (!c.ok) {
    return { status: 'compile-error', output: '', transcript: [], error: c.error, warnings: [], trace: [], traceTruncated: false, steps: 0, inputsUsed: [] };
  }
  const s = new Session(c.compiled, opts);
  let send: string | undefined;
  let sinceYield = 0;
  try {
    for (;;) {
      const r = s.gen.next(send);
      send = undefined;
      if (r.done) break;
      const y = r.value;
      if (y.t === 'step') {
        s.snapshot(y.line);
        if (++sinceYield >= 20000) {
          sinceYield = 0;
          await new Promise((res) => setTimeout(res, 0));
          if (opts.shouldStop?.()) {
            s.snapshot(0, true);
            return s.result('stopped', { code: 'R_STOPPED', line: s.interp.steps, message: 'Stopped', phase: 'runtime' });
          }
        }
      } else if (y.t === 'input') {
        let line = s.queue.shift();
        if (line === undefined && opts.onInput) {
          const got = await opts.onInput();
          if (got === null || opts.shouldStop?.()) {
            s.snapshot(0, true);
            return s.result('stopped', { code: 'R_STOPPED', line: 0, message: 'Stopped', phase: 'runtime' });
          }
          line = got;
        }
        if (line !== undefined) s.echo(line);
        send = line;
      } else if (y.t === 'clear') {
        opts.onClear?.();
      }
    }
  } catch (e) {
    s.snapshot(0, true);
    return s.result('runtime-error', errorData(e));
  }
  s.snapshot(0, true);
  return s.result('ok');
}
