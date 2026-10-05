import type { Arg, Block, CallExpr, Expr, Program, Routine, RoutineInfo, Stmt, Symbol } from './ast';
import { PascalError, type PascalWarning } from './errors';
import { displayValue, formatForWrite } from './format';
import { cloneValue, defaultValue, isArrayValue, T, type ArrayValue, type Ty } from './types';

export type Value = number | string | boolean | ArrayValue;

/** A storage box for a variable. Element references use getters/setters. */
export interface Cell {
  value: Value;
  init: boolean;
  ty: Ty;
  name: string;
  text: string;
  kind: 'var' | 'param' | 'varparam' | 'result' | 'const';
}

export class Frame {
  cells = new Map<string, Cell>();
  parent: Frame | null;
  title: string;
  routine?: RoutineInfo;
  resultCell?: Cell;
  constructor(title: string, parent: Frame | null, routine?: RoutineInfo) {
    this.title = title;
    this.parent = parent;
    this.routine = routine;
  }
  lookup(name: string): Cell | undefined {
    let f: Frame | null = this;
    while (f) {
      const c = f.cells.get(name);
      if (c) return c;
      f = f.parent;
    }
    return undefined;
  }
}

export type Yield = { t: 'step'; line: number } | { t: 'input' } | { t: 'clear' };
type Gen<T = void> = Generator<Yield, T, string | undefined>;

export interface Note {
  line: number;
  kind: 'assign' | 'cond' | 'loop' | 'call' | 'return' | 'input' | 'output' | 'info';
  text: string;
  /** For conditions: which way it went */
  result?: boolean;
  /** Variable that changed (for highlighting) */
  name?: string;
}

class BreakSignal {}
class ContinueSignal {}
class ExitSignal {}
class HaltSignal {}

export interface InterpreterHooks {
  out: (text: string) => void;
  random?: () => number;
}

const MAX_INT = 2147483647;

function rtErr(code: string, line: number, message: string, params: Record<string, string> = {}): PascalError {
  return new PascalError({ code, line, message, params, phase: 'runtime' });
}

function roundHalfEven(x: number): number {
  const r = Math.round(x);
  if (Math.abs(x % 1) === 0.5) return 2 * Math.round(x / 2);
  return r;
}

export class Interpreter {
  program: Program;
  src: string;
  hooks: InterpreterHooks;
  global: Frame;
  frame: Frame;
  callStack: Frame[] = [];
  steps = 0;
  maxSteps = 2_000_000;
  lineHits = new Map<number, number>();
  notes: Note[] | null = null;
  warnings: PascalWarning[] = [];
  private warned = new Set<string>();
  private routineParent = new Map<Routine, Routine | null>();
  private inputLine: string | null = null;
  private inputPos = 0;
  private currentLine = 0;
  constants: Array<{ name: string; text: string; ty: Ty; value: unknown }> = [];

  constructor(program: Program, src: string, hooks: InterpreterHooks, globals: RoutineInfo['locals']) {
    this.program = program;
    this.src = src;
    this.hooks = hooks;
    this.global = new Frame('Main program', null);
    this.frame = this.global;
    for (const g of globals) {
      const v = g.init ? (g.init as Expr & { ty?: Ty }) : undefined;
      this.global.cells.set(g.name, {
        value: v ? (this.constOf(v) as Value) : (defaultValue(g.ty) as Value),
        init: !!v,
        ty: g.ty,
        name: g.name,
        text: g.text,
        kind: 'var',
      });
    }
    this.indexRoutines(program.block, null);
  }

  private constOf(e: Expr): unknown {
    switch (e.kind) {
      case 'num':
      case 'str':
      case 'bool':
        return e.value;
      case 'unary':
        return e.op === '-' ? -(this.constOf(e.operand) as number) : e.op === 'not' ? !this.constOf(e.operand) : this.constOf(e.operand);
      case 'var':
        return e.sym?.kind === 'const' ? e.sym.value : 0;
      default:
        return 0;
    }
  }

  private indexRoutines(block: Block, parent: Routine | null) {
    for (const r of block.routines) {
      this.routineParent.set(r, parent);
      this.indexRoutines(r.block, r);
    }
  }

  private src_(e: { pos: { start: number; end: number } }) {
    return this.src.slice(e.pos.start, e.pos.end).replace(/\s+/g, ' ');
  }

  private note(n: Note) {
    if (this.notes) this.notes.push(n);
  }

  private warn(code: string, line: number, message: string, params: Record<string, string>) {
    const key = code + ':' + (params.name ?? '');
    if (this.warned.has(key)) return;
    this.warned.add(key);
    this.warnings.push({ code, line, message, params });
  }

  *run(): Gen {
    try {
      yield* this.exec(this.program.block.body);
    } catch (e) {
      if (e instanceof ExitSignal || e instanceof HaltSignal) return;
      if (e instanceof BreakSignal || e instanceof ContinueSignal) return;
      throw e;
    }
  }

  private *step(line: number): Gen {
    this.steps++;
    this.currentLine = line;
    this.lineHits.set(line, (this.lineHits.get(line) ?? 0) + 1);
    if (this.steps > this.maxSteps) {
      let busy = line;
      let max = 0;
      for (const [l, h] of this.lineHits) if (h > max) [busy, max] = [l, h];
      throw rtErr('R_STEP_LIMIT', busy, 'Program ran too long', { steps: this.maxSteps.toLocaleString('en-US'), line: String(busy) });
    }
    yield { t: 'step', line };
  }

  // ---------- statements ----------
  private *exec(s: Stmt): Gen {
    switch (s.kind) {
      case 'compound':
        for (const x of s.body) yield* this.exec(x);
        return;
      case 'empty':
        return;
      case 'assign': {
        yield* this.step(s.line);
        const v = yield* this.eval(s.value);
        const ref = yield* this.lvalue(s.target);
        const old = this.notes ? ref.get() : undefined;
        const stored = this.coerce(v, ref.ty, s.line);
        ref.set(stored);
        if (this.notes) {
          const name = this.src_(s.target);
          const nv = displayValue(stored, ref.ty);
          const ov = old === undefined || !ref.wasInit ? null : displayValue(old as Value, ref.ty);
          this.note({ line: s.line, kind: 'assign', name: ref.rootName, text: ov !== null && ov !== nv ? `${name} changed from ${ov} to ${nv}` : `${name} is now ${nv}` });
        }
        return;
      }
      case 'callStmt':
        yield* this.step(s.line);
        yield* this.call(s.call, true);
        return;
      case 'if': {
        yield* this.step(s.line);
        const c = (yield* this.eval(s.cond)) as boolean;
        this.note({
          line: s.line, kind: 'cond', result: c,
          text: `${this.src_(s.cond)} is ${c ? 'TRUE' : 'FALSE'} → ${c ? 'doing the THEN part' : s.else ? 'doing the ELSE part' : 'skipping the THEN part'}`,
        });
        if (c) yield* this.exec(s.then);
        else if (s.else) yield* this.exec(s.else);
        return;
      }
      case 'case': {
        yield* this.step(s.line);
        const v = yield* this.eval(s.expr);
        for (const b of s.branches) {
          for (const lab of b.labels) {
            const lo = yield* this.eval(lab.lo);
            const hi = lab.hi ? yield* this.eval(lab.hi) : lo;
            const hit = lab.hi ? (v as number) >= (lo as number) && (v as number) <= (hi as number) : v === lo;
            if (hit) {
              this.note({ line: s.line, kind: 'cond', result: true, text: `${this.src_(s.expr)} is ${displayValue(v, s.expr.ty!)} → running the matching branch (line ${b.line})` });
              yield* this.exec(b.body);
              return;
            }
          }
        }
        if (s.elseBody) {
          this.note({ line: s.line, kind: 'cond', result: false, text: `${this.src_(s.expr)} is ${displayValue(v, s.expr.ty!)} → no label matches, running ELSE` });
          for (const x of s.elseBody) yield* this.exec(x);
        } else {
          this.note({ line: s.line, kind: 'cond', result: false, text: `${this.src_(s.expr)} is ${displayValue(v, s.expr.ty!)} → no label matches, nothing happens` });
        }
        return;
      }
      case 'for': {
        yield* this.step(s.line);
        const from = (yield* this.eval(s.from)) as number | string;
        const to = (yield* this.eval(s.to)) as number | string;
        const ref = yield* this.lvalue(s.variable);
        const isChar = ref.ty.k === 'char';
        let a = isChar ? (from as string).charCodeAt(0) : (from as number);
        const b = isChar ? (to as string).charCodeAt(0) : (to as number);
        const total = s.down ? a - b + 1 : b - a + 1;
        let count = 0;
        const name = s.variable.text;
        if (total <= 0) {
          this.note({ line: s.line, kind: 'loop', text: `The loop runs 0 times (${s.down ? `${a} is smaller than ${b}` : `${a} is bigger than ${b}`})`, result: false });
          return;
        }
        for (;;) {
          count++;
          ref.set(isChar ? String.fromCharCode(a) : a);
          this.note({ line: s.line, kind: 'loop', name: ref.rootName, text: `${name} = ${isChar ? `'${String.fromCharCode(a)}'` : a}  (round ${count} of ${total})`, result: true });
          try {
            yield* this.exec(s.body);
          } catch (e) {
            if (e instanceof BreakSignal) {
              this.note({ line: s.line, kind: 'loop', text: 'break → leaving the loop early', result: false });
              return;
            }
            if (!(e instanceof ContinueSignal)) throw e;
          }
          if (a === b) break;
          a += s.down ? -1 : 1;
          yield* this.step(s.line);
        }
        yield* this.step(s.line);
        this.note({ line: s.line, kind: 'loop', text: `${name} reached ${isChar ? `'${String.fromCharCode(b)}'` : b} → the for loop is finished`, result: false });
        return;
      }
      case 'while': {
        let round = 0;
        for (;;) {
          yield* this.step(s.line);
          const c = (yield* this.eval(s.cond)) as boolean;
          this.note({
            line: s.line, kind: 'cond', result: c,
            text: c ? `${this.src_(s.cond)} is TRUE → ${round === 0 ? 'enter' : 'repeat'} the loop (round ${round + 1})` : `${this.src_(s.cond)} is FALSE → the loop stops`,
          });
          if (!c) return;
          round++;
          try {
            yield* this.exec(s.body);
          } catch (e) {
            if (e instanceof BreakSignal) return;
            if (!(e instanceof ContinueSignal)) throw e;
          }
        }
      }
      case 'repeat': {
        let round = 0;
        yield* this.step(s.line);
        for (;;) {
          round++;
          try {
            for (const x of s.body) yield* this.exec(x);
          } catch (e) {
            if (e instanceof BreakSignal) return;
            if (!(e instanceof ContinueSignal)) throw e;
          }
          yield* this.step(s.untilLine);
          const c = (yield* this.eval(s.cond)) as boolean;
          this.note({
            line: s.untilLine, kind: 'cond', result: c,
            text: c ? `until ${this.src_(s.cond)} is TRUE → the loop stops after ${round} round(s)` : `until ${this.src_(s.cond)} is FALSE → go back and repeat`,
          });
          if (c) return;
        }
      }
    }
  }

  private coerce(v: Value, ty: Ty, line: number): Value {
    if (ty.k === 'integer') {
      if (typeof v === 'number' && Math.abs(v) > MAX_INT) throw rtErr('R_OVERFLOW', line, 'Arithmetic overflow');
      return v;
    }
    if (ty.k === 'array') return cloneValue(v) as Value;
    return v;
  }

  // ---------- l-values ----------
  private *lvalue(e: Expr): Gen<{ get: () => Value; set: (v: Value) => void; ty: Ty; rootName: string; wasInit: boolean; cell?: Cell }> {
    if (e.kind === 'var') {
      const cell = this.cellFor(e.sym!, e.name);
      const wasInit = cell.init;
      return {
        get: () => cell.value,
        set: (v) => {
          cell.value = v;
          cell.init = true;
        },
        ty: cell.ty,
        rootName: cell.name,
        wasInit,
        cell,
      };
    }
    if (e.kind === 'index') {
      const base = yield* this.lvalue(e.base);
      const idx = (yield* this.eval(e.index)) as number | string;
      const container = base.get();
      if (base.ty.k === 'array' && isArrayValue(container)) {
        const i = typeof idx === 'string' ? idx.charCodeAt(0) : idx;
        const hi = container.lo + container.items.length - 1;
        if (i < container.lo || i > hi) {
          throw rtErr('R_INDEX_RANGE', e.pos.line, 'Range check error', { name: this.src_(e.base), index: String(i), lo: String(container.lo), hi: String(hi) });
        }
        const elTy = base.ty.of;
        return {
          get: () => container.items[i - container.lo] as Value,
          set: (v) => {
            container.items[i - container.lo] = v;
            if (base.cell) base.cell.init = true;
          },
          ty: elTy,
          rootName: base.rootName,
          wasInit: true,
        };
      }
      if (base.ty.k === 'string') {
        const s = container as string;
        const i = idx as number;
        if (i < 1 || i > s.length) throw rtErr('R_STRING_INDEX', e.pos.line, 'Range check error', { index: String(i), length: String(s.length) });
        return {
          get: () => (base.get() as string)[i - 1],
          set: (v) => {
            const cur = base.get() as string;
            base.set(cur.slice(0, i - 1) + (v as string) + cur.slice(i));
          },
          ty: T.char,
          rootName: base.rootName,
          wasInit: true,
        };
      }
    }
    throw rtErr('E_VAR_PARAM_NEEDS_VARIABLE', e.pos.line, 'Variable expected');
  }

  private cellFor(sym: Symbol, name: string): Cell {
    if (sym.kind === 'result') {
      for (let i = this.callStack.length - 1; i >= 0; i--) {
        const f = this.callStack[i];
        if (f.routine?.routine.name === sym.name && f.resultCell) return f.resultCell;
      }
    }
    const cell = this.frame.lookup(name);
    if (!cell) throw rtErr('E_UNDECLARED', this.currentLine, `Unknown variable ${name}`, { name });
    return cell;
  }

  // ---------- expressions ----------
  private *eval(e: Expr): Gen<Value> {
    switch (e.kind) {
      case 'num':
      case 'str':
      case 'bool':
        return e.value;
      case 'var': {
        const sym = e.sym!;
        if (sym.kind === 'const') return sym.value as Value;
        if (sym.kind === 'routine' || sym.kind === 'builtin') {
          return (yield* this.call({ kind: 'call', name: e.name, text: e.text, args: [], hasParens: false, pos: e.pos, sym }, false)) as Value;
        }
        const cell = this.cellFor(sym, e.name);
        if (!cell.init && cell.ty.k !== 'array') {
          this.warn('W_UNINITIALIZED', e.pos.line, `Variable "${cell.text}" does not seem to be initialized`, {
            name: cell.text, defaultValue: displayValue(cell.value, cell.ty),
          });
        }
        return cell.value;
      }
      case 'index': {
        const base = yield* this.eval(e.base);
        const idx = (yield* this.eval(e.index)) as number | string;
        if (isArrayValue(base)) {
          const i = typeof idx === 'string' ? idx.charCodeAt(0) : idx;
          const hi = base.lo + base.items.length - 1;
          if (i < base.lo || i > hi) {
            throw rtErr('R_INDEX_RANGE', e.pos.line, 'Range check error', { name: this.src_(e.base), index: String(i), lo: String(base.lo), hi: String(hi) });
          }
          return base.items[i - base.lo] as Value;
        }
        const s = base as string;
        const i = idx as number;
        if (i < 1 || i > s.length) throw rtErr('R_STRING_INDEX', e.pos.line, 'Range check error', { index: String(i), length: String(s.length) });
        return s[i - 1];
      }
      case 'call':
        return (yield* this.call(e, false)) as Value;
      case 'unary': {
        const v = yield* this.eval(e.operand);
        if (e.op === 'not') return !v;
        if (e.op === '-') return -(v as number) || 0;
        return v;
      }
      case 'binary': {
        if (e.op === 'and') {
          const l = yield* this.eval(e.left);
          if (!l) return false;
          return (yield* this.eval(e.right)) as boolean;
        }
        if (e.op === 'or') {
          const l = yield* this.eval(e.left);
          if (l) return true;
          return (yield* this.eval(e.right)) as boolean;
        }
        const l = yield* this.eval(e.left);
        const r = yield* this.eval(e.right);
        return this.binary(e.op, l, r, e.pos.line);
      }
    }
  }

  private binary(op: string, l: Value, r: Value, line: number): Value {
    switch (op) {
      case '+':
        if (typeof l === 'string' || typeof r === 'string') return String(l) + String(r);
        return (l as number) + (r as number);
      case '-':
        return (l as number) - (r as number);
      case '*':
        return (l as number) * (r as number);
      case '/':
        if (r === 0) throw rtErr('R_DIV_ZERO', line, 'Division by zero');
        return (l as number) / (r as number);
      case 'div':
        if (r === 0) throw rtErr('R_DIV_ZERO', line, 'Division by zero');
        return Math.trunc((l as number) / (r as number)) || 0;
      case 'mod':
        if (r === 0) throw rtErr('R_DIV_ZERO', line, 'Division by zero');
        return (l as number) % (r as number) || 0;
      case 'xor':
        return (l as boolean) !== (r as boolean);
      case '=':
        return l === r;
      case '<>':
        return l !== r;
      case '<':
        return (l as number) < (r as number);
      case '>':
        return (l as number) > (r as number);
      case '<=':
        return (l as number) <= (r as number);
      case '>=':
        return (l as number) >= (r as number);
    }
    throw rtErr('E_TYPE_MISMATCH_OP', line, 'Unknown operator', { op });
  }

  // ---------- calls ----------
  private *call(c: CallExpr, _asStatement: boolean): Gen<Value | undefined> {
    const sym = c.sym!;
    if (sym.kind === 'builtin') return yield* this.builtin(c);
    if (sym.kind === 'routine') return yield* this.callRoutine(sym.info, c.args, c.pos.line);
    throw rtErr('E_NOT_A_PROCEDURE', c.pos.line, 'Not callable', { name: c.text });
  }

  private *callRoutine(info: RoutineInfo, args: Arg[], line: number): Gen<Value | undefined> {
    const r = info.routine;
    if (this.callStack.length > 400) throw rtErr('R_STACK_OVERFLOW', line, 'Stack overflow');
    // static parent: frame of the declaring routine (or global)
    const parentRoutine = this.routineParent.get(r) ?? null;
    let staticParent: Frame = this.global;
    if (parentRoutine) {
      for (let i = this.callStack.length - 1; i >= 0; i--) {
        if (this.callStack[i].routine?.routine === parentRoutine) {
          staticParent = this.callStack[i];
          break;
        }
      }
    }
    const frame = new Frame(`${r.kind} ${r.text}`, staticParent, info);
    const shown: string[] = [];
    for (let i = 0; i < info.params.length; i++) {
      const p = info.params[i];
      const a = args[i].expr;
      if (p.byRef) {
        const ref = yield* this.lvalue(a);
        const target: { value: Value; init: boolean } = ref.cell ?? {
          get value() {
            return ref.get();
          },
          set value(v: Value) {
            ref.set(v);
          },
          init: true,
        };
        // Alias the caller's box under the parameter's name: reads and writes go straight through.
        const alias: Cell = {
          get value() {
            return target.value;
          },
          set value(v: Value) {
            target.value = v;
          },
          get init() {
            return target.init;
          },
          set init(b: boolean) {
            target.init = b;
          },
          ty: p.ty,
          name: p.name,
          text: p.text,
          kind: 'varparam',
        };
        frame.cells.set(p.name, alias);
        shown.push(`${p.text} → ${this.src_(a)}`);
      } else {
        const v = yield* this.eval(a);
        frame.cells.set(p.name, { value: cloneValue(v) as Value, init: true, ty: p.ty, name: p.name, text: p.text, kind: 'param' });
        shown.push(`${p.text} = ${displayValue(v, p.ty)}`);
      }
    }
    for (const l of info.locals) {
      frame.cells.set(l.name, { value: defaultValue(l.ty) as Value, init: false, ty: l.ty, name: l.name, text: l.text, kind: 'var' });
    }
    if (info.ret) {
      frame.resultCell = { value: defaultValue(info.ret) as Value, init: false, ty: info.ret, name: r.name, text: r.text, kind: 'result' };
    }
    this.note({ line, kind: 'call', text: `Calling ${r.kind} ${r.text}${shown.length ? ` with ${shown.join(', ')}` : ''}` });
    const savedFrame = this.frame;
    this.callStack.push(frame);
    this.frame = frame;
    try {
      yield* this.step(r.pos.line);
      yield* this.exec(r.block.body);
    } catch (e) {
      if (!(e instanceof ExitSignal)) {
        this.callStack.pop();
        this.frame = savedFrame;
        throw e;
      }
    }
    this.callStack.pop();
    this.frame = savedFrame;
    if (info.ret) {
      const v = frame.resultCell!.value;
      this.note({ line, kind: 'return', text: `${r.text} gives back ${displayValue(v, info.ret)}` });
      return v;
    }
    this.note({ line, kind: 'return', text: `${r.text} finished → back to line ${line}` });
    return undefined;
  }

  // ---------- input ----------
  private *needLine(): Gen<string> {
    const line = yield { t: 'input' };
    if (line === undefined) throw rtErr('R_NO_INPUT', this.currentLine, 'Not enough input');
    this.inputLine = line;
    this.inputPos = 0;
    return line;
  }

  private *readToken(): Gen<string> {
    for (;;) {
      if (this.inputLine === null || this.inputPos >= this.inputLine.length) {
        yield* this.needLine();
      }
      const s = this.inputLine!;
      while (this.inputPos < s.length && /\s/.test(s[this.inputPos])) this.inputPos++;
      if (this.inputPos >= s.length) {
        this.inputLine = null;
        continue;
      }
      const start = this.inputPos;
      while (this.inputPos < s.length && !/\s/.test(s[this.inputPos])) this.inputPos++;
      return s.slice(start, this.inputPos);
    }
  }

  private *readValue(ty: Ty, line: number): Gen<Value> {
    switch (ty.k) {
      case 'integer': {
        const tok = yield* this.readToken();
        if (!/^[+-]?\d+$/.test(tok)) throw rtErr('R_INVALID_INPUT', line, 'Invalid numeric format', { input: tok, expected: 'integer' });
        return parseInt(tok, 10);
      }
      case 'real': {
        const tok = yield* this.readToken();
        if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(tok)) throw rtErr('R_INVALID_INPUT', line, 'Invalid numeric format', { input: tok, expected: 'real' });
        return parseFloat(tok);
      }
      case 'boolean': {
        const tok = (yield* this.readToken()).toLowerCase();
        if (tok !== 'true' && tok !== 'false') throw rtErr('R_INVALID_INPUT', line, 'Invalid boolean', { input: tok, expected: 'boolean' });
        return tok === 'true';
      }
      case 'char': {
        if (this.inputLine === null) yield* this.needLine();
        const s = this.inputLine!;
        if (this.inputPos >= s.length) return ' ';
        return s[this.inputPos++];
      }
      case 'string': {
        if (this.inputLine === null) yield* this.needLine();
        const s = this.inputLine!.slice(this.inputPos);
        this.inputPos = this.inputLine!.length;
        return s;
      }
      default:
        throw rtErr('E_READ_TYPE', line, 'Cannot read this type');
    }
  }

  // ---------- builtins ----------
  private *builtin(c: CallExpr): Gen<Value | undefined> {
    const line = c.pos.line;
    const args = c.args;
    const ev = (i: number) => this.eval(args[i].expr);
    switch (c.name) {
      case 'write':
      case 'writeln': {
        let text = '';
        for (const a of args) {
          const v = yield* this.eval(a.expr);
          const w = a.width ? ((yield* this.eval(a.width)) as number) : undefined;
          const d = a.decimals ? ((yield* this.eval(a.decimals)) as number) : undefined;
          text += formatForWrite(v, a.expr.ty!, w, d);
        }
        if (c.name === 'writeln') text += '\n';
        this.hooks.out(text);
        this.note({ line, kind: 'output', text: text === '\n' ? 'Printed an empty line' : `Printed "${text.replace(/\n$/, '')}"${c.name === 'write' ? ' (and stayed on the same line)' : ''}` });
        return undefined;
      }
      case 'read':
      case 'readln': {
        const got: string[] = [];
        for (const a of args) {
          const ref = yield* this.lvalue(a.expr);
          const v = yield* this.readValue(ref.ty, line);
          ref.set(v);
          got.push(`${this.src_(a.expr)} = ${displayValue(v, ref.ty)}`);
        }
        if (c.name === 'readln') {
          if (args.length === 0 && this.inputLine === null) yield* this.needLine();
          this.inputLine = null;
        }
        this.note({ line, kind: 'input', text: got.length ? `Input received → ${got.join(', ')}` : 'Waited for Enter' });
        return undefined;
      }
      case 'inc':
      case 'dec': {
        const ref = yield* this.lvalue(args[0].expr);
        const by = args[1] ? ((yield* ev(1)) as number) : 1;
        const cur = ref.get();
        const delta = c.name === 'inc' ? by : -by;
        const nv = typeof cur === 'string' ? String.fromCharCode(cur.charCodeAt(0) + delta) : (cur as number) + delta;
        ref.set(nv);
        this.note({ line, kind: 'assign', name: ref.rootName, text: `${this.src_(args[0].expr)} changed from ${displayValue(cur, ref.ty)} to ${displayValue(nv, ref.ty)}` });
        return undefined;
      }
      case 'randomize':
      case 'delay':
        return undefined;
      case 'clrscr':
        yield { t: 'clear' };
        return undefined;
      case 'break':
        throw new BreakSignal();
      case 'continue':
        throw new ContinueSignal();
      case 'halt':
        throw new HaltSignal();
      case 'exit': {
        if (args[0]) {
          const v = yield* ev(0);
          const top = this.callStack[this.callStack.length - 1];
          if (top?.resultCell) {
            top.resultCell.value = v;
            top.resultCell.init = true;
          }
        }
        throw new ExitSignal();
      }
      case 'abs': {
        const v = (yield* ev(0)) as number;
        return Math.abs(v);
      }
      case 'sqr': {
        const v = (yield* ev(0)) as number;
        return v * v;
      }
      case 'sqrt': {
        const v = (yield* ev(0)) as number;
        if (v < 0) throw rtErr('R_MATH_DOMAIN', line, 'Invalid floating point operation', { fn: 'sqrt', value: String(v) });
        return Math.sqrt(v);
      }
      case 'ln': {
        const v = (yield* ev(0)) as number;
        if (v <= 0) throw rtErr('R_MATH_DOMAIN', line, 'Invalid floating point operation', { fn: 'ln', value: String(v) });
        return Math.log(v);
      }
      case 'exp':
        return Math.exp((yield* ev(0)) as number);
      case 'sin':
        return Math.sin((yield* ev(0)) as number);
      case 'cos':
        return Math.cos((yield* ev(0)) as number);
      case 'arctan':
        return Math.atan((yield* ev(0)) as number);
      case 'round':
        return roundHalfEven((yield* ev(0)) as number);
      case 'trunc':
        return Math.trunc((yield* ev(0)) as number) || 0;
      case 'int':
        return Math.trunc((yield* ev(0)) as number);
      case 'frac': {
        const v = (yield* ev(0)) as number;
        return v - Math.trunc(v);
      }
      case 'ord': {
        const v = yield* ev(0);
        if (typeof v === 'string') return v.charCodeAt(0) || 0;
        if (typeof v === 'boolean') return v ? 1 : 0;
        return v as number;
      }
      case 'chr': {
        const v = (yield* ev(0)) as number;
        if (v < 0 || v > 255) throw rtErr('R_CHR_RANGE', line, 'Range check error', { value: String(v) });
        return String.fromCharCode(v);
      }
      case 'length': {
        const v = yield* ev(0);
        if (isArrayValue(v)) return v.items.length;
        return (v as string).length;
      }
      case 'upcase':
        return ((yield* ev(0)) as string).toUpperCase();
      case 'lowercase':
        return ((yield* ev(0)) as string).toLowerCase();
      case 'copy': {
        const s = (yield* ev(0)) as string;
        let i = (yield* ev(1)) as number;
        const n = (yield* ev(2)) as number;
        if (i < 1) i = 1;
        return s.substr(i - 1, Math.max(0, n));
      }
      case 'pos': {
        const sub = (yield* ev(0)) as string;
        const s = (yield* ev(1)) as string;
        return s.indexOf(sub) + 1;
      }
      case 'concat': {
        let s = '';
        for (let i = 0; i < args.length; i++) s += (yield* ev(i)) as string;
        return s;
      }
      case 'random': {
        const rnd = this.hooks.random ?? Math.random;
        if (args[0]) {
          const n = (yield* ev(0)) as number;
          return Math.floor(rnd() * n);
        }
        return rnd();
      }
      case 'odd':
        return Math.abs(((yield* ev(0)) as number) % 2) === 1;
      case 'succ':
      case 'pred': {
        const v = yield* ev(0);
        const d = c.name === 'succ' ? 1 : -1;
        if (typeof v === 'string') return String.fromCharCode(v.charCodeAt(0) + d);
        if (typeof v === 'boolean') return !v;
        return (v as number) + d;
      }
      case 'pi':
        return Math.PI;
      case 'low':
      case 'high': {
        const v = yield* ev(0);
        if (isArrayValue(v)) return c.name === 'low' ? v.lo : v.lo + v.items.length - 1;
        return c.name === 'low' ? 1 : (v as string).length;
      }
    }
    throw rtErr('E_UNDECLARED', line, `Unknown builtin ${c.name}`, { name: c.text });
  }
}
