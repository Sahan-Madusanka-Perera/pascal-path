import type { Block, CallExpr, Expr, Program, Routine, RoutineInfo, Stmt, Symbol, TypeNode } from './ast';
import { PascalError, type PascalWarning } from './errors';
import { assignable, isNumeric, isOrdinal, isTextual, T, tyKind, type Ty } from './types';

/** Built-in procedures/functions recognised by the checker and interpreter. */
export const BUILTIN_PROCS = new Set([
  'write', 'writeln', 'read', 'readln', 'inc', 'dec', 'randomize', 'exit', 'break', 'continue', 'halt', 'clrscr', 'delay',
]);
export const BUILTIN_FUNCS = new Set([
  'abs', 'sqr', 'sqrt', 'round', 'trunc', 'int', 'frac', 'ord', 'chr', 'length', 'upcase', 'lowercase', 'copy', 'pos',
  'concat', 'random', 'odd', 'succ', 'pred', 'sin', 'cos', 'arctan', 'ln', 'exp', 'pi', 'low', 'high',
]);

const TYPE_ALIASES: Record<string, Ty> = {
  integer: T.integer, longint: T.integer, shortint: T.integer, smallint: T.integer, byte: T.integer, word: T.integer,
  int64: T.integer, cardinal: T.integer, longword: T.integer,
  real: T.real, double: T.real, single: T.real, extended: T.real, currency: T.real,
  boolean: T.boolean, char: T.char, string: T.string, ansistring: T.string, shortstring: T.string,
};

const SUGGEST_ALIASES: Record<string, string> = {
  print: 'writeln', printf: 'writeln', println: 'writeln', echo: 'writeln', cout: 'writeln', display: 'writeln', output: 'writeln',
  input: 'readln', scanf: 'readln', cin: 'readln', read_line: 'readln', readline: 'readln',
  int: 'integer', float: 'real', bool: 'boolean', str: 'string',
};

class Scope {
  map = new Map<string, Symbol>();
  parent?: Scope;
  routine?: RoutineInfo;
  constructor(parent?: Scope, routine?: RoutineInfo) {
    this.parent = parent;
    this.routine = routine;
  }
  lookup(name: string): Symbol | undefined {
    return this.map.get(name) ?? this.parent?.lookup(name);
  }
  names(): string[] {
    return [...this.map.values()].map((s) => ('text' in s ? s.text : s.name)).concat(this.parent?.names() ?? []);
  }
}

export interface CheckResult {
  warnings: PascalWarning[];
  globals: RoutineInfo['locals'];
}

export function check(program: Program): CheckResult {
  return new Checker().run(program);
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

class Checker {
  private warnings: PascalWarning[] = [];
  private scope = new Scope();
  private forVars: string[] = [];
  private loopDepth = 0;
  private resultAssigned = false;

  run(program: Program): CheckResult {
    for (const name of [...BUILTIN_PROCS, ...BUILTIN_FUNCS]) this.scope.map.set(name, { kind: 'builtin', name });
    for (const [name, ty] of Object.entries(TYPE_ALIASES)) this.scope.map.set(name, { kind: 'type', name, ty });
    this.scope = new Scope(this.scope);
    this.checkBlock(program.block, true);
    return { warnings: this.warnings, globals: this.globalsDecl };
  }

  private fail(code: string, line: number, message: string, params: Record<string, string> = {}, col?: number): never {
    throw new PascalError({ code, line, col, message, params, phase: 'type' });
  }

  // ---------- declarations ----------
  private declare(name: string, sym: Symbol, line: number) {
    const existing = this.scope.map.get(name);
    if (existing) this.fail('E_DUPLICATE', line, `Duplicate identifier "${name}"`, { name: 'text' in sym ? sym.text : name });
    this.scope.map.set(name, sym);
  }

  private resolveType(t: TypeNode): Ty {
    switch (t.kind) {
      case 'string':
        return T.string;
      case 'named': {
        const sym = this.scope.lookup(t.name);
        if (sym?.kind === 'type') return sym.ty;
        if (TYPE_ALIASES[t.name]) return TYPE_ALIASES[t.name];
        this.fail('E_EXPECTED_TYPE', t.pos.line, `Identifier not found "${t.name}"`, { found: t.name }, t.pos.col);
      }
      // eslint-disable-next-line no-fallthrough
      case 'openArray':
        return { k: 'array', lo: 0, hi: -1, of: this.resolveType(t.of), open: true };
      case 'array': {
        const lo = this.constValue(t.lo);
        const hi = this.constValue(t.hi);
        if (lo.ty.k !== 'integer' || hi.ty.k !== 'integer') {
          this.fail('E_CONST_EXPR', t.pos.line, 'Array bounds must be integer constants');
        }
        if ((hi.value as number) < (lo.value as number)) {
          this.fail('E_ARRAY_BOUNDS', t.pos.line, 'High range limit < low range limit', { lo: String(lo.value), hi: String(hi.value) });
        }
        return { k: 'array', lo: lo.value as number, hi: hi.value as number, of: this.resolveType(t.of) };
      }
    }
  }

  /** Evaluate a constant expression at compile time. */
  constValue(e: Expr): { value: unknown; ty: Ty } {
    switch (e.kind) {
      case 'num':
        e.ty = e.isReal ? T.real : T.integer;
        return { value: e.value, ty: e.ty };
      case 'str':
        e.ty = e.value.length === 1 ? T.char : T.string;
        return { value: e.value, ty: e.ty };
      case 'bool':
        e.ty = T.boolean;
        return { value: e.value, ty: T.boolean };
      case 'var': {
        const sym = this.scope.lookup(e.name);
        if (sym?.kind === 'const') {
          e.sym = sym;
          e.ty = sym.ty;
          return { value: sym.value, ty: sym.ty };
        }
        if (!sym) this.undeclared(e.name, e.text, e.pos.line, e.pos.col);
        this.fail('E_CONST_EXPR', e.pos.line, 'Constant expression expected');
      }
      // eslint-disable-next-line no-fallthrough
      case 'unary': {
        const v = this.constValue(e.operand);
        e.ty = v.ty;
        if (e.op === '-' && isNumeric(v.ty)) return { value: -(v.value as number), ty: v.ty };
        if (e.op === '+' && isNumeric(v.ty)) return v;
        if (e.op === 'not' && v.ty.k === 'boolean') return { value: !v.value, ty: T.boolean };
        this.fail('E_CONST_EXPR', e.pos.line, 'Constant expression expected');
      }
      // eslint-disable-next-line no-fallthrough
      case 'binary': {
        const l = this.constValue(e.left);
        const r = this.constValue(e.right);
        const ty = this.binaryType(e.op, l.ty, r.ty, e.pos.line);
        e.ty = ty;
        const a = l.value as number;
        const b = r.value as number;
        let value: unknown;
        switch (e.op) {
          case '+': value = (a as unknown as string) + (b as unknown as string); break;
          case '-': value = a - b; break;
          case '*': value = a * b; break;
          case '/': value = a / b; break;
          case 'div': value = Math.trunc(a / b); break;
          case 'mod': value = a % b; break;
          default: this.fail('E_CONST_EXPR', e.pos.line, 'Constant expression expected');
        }
        return { value, ty };
      }
      default:
        this.fail('E_CONST_EXPR', e.pos.line, 'Constant expression expected');
    }
  }

  private checkBlock(block: Block, isMain: boolean) {
    for (const c of block.consts) {
      const v = this.constValue(c.expr);
      this.declare(c.name, { kind: 'const', name: c.name, text: c.text, ty: v.ty.k === 'char' ? T.char : v.ty, value: v.value }, c.pos.line);
    }
    for (const t of block.types) {
      this.declare(t.name, { kind: 'type', name: t.name, ty: this.resolveType(t.type) }, t.pos.line);
    }
    const locals: RoutineInfo['locals'] = [];
    for (const v of block.vars) {
      const ty = this.resolveType(v.type);
      if (v.init) {
        const iv = this.constValue(v.init);
        if (!assignable(ty, iv.ty)) {
          this.fail('E_TYPE_MISMATCH_ASSIGN', v.pos.line, 'Incompatible types', { target: tyKind(ty), source: tyKind(iv.ty), name: v.names[0].text });
        }
      }
      for (const n of v.names) {
        this.declare(n.name, { kind: 'var', name: n.name, text: n.text, ty, isGlobal: isMain }, n.pos.line);
        locals.push({ name: n.name, text: n.text, ty, init: v.init });
      }
    }
    if (!isMain && this.scope.routine) this.scope.routine.locals = locals;
    if (isMain) this.globalsDecl = locals;
    for (const r of block.routines) this.checkRoutine(r);
    this.checkStmt(block.body);
  }

  globalsDecl: RoutineInfo['locals'] = [];

  private checkRoutine(r: Routine) {
    const params = r.params.map((p) => ({ name: p.name, text: p.text, ty: this.resolveType(p.type), byRef: p.byRef }));
    const ret = r.returnType ? this.resolveType(r.returnType) : undefined;
    const info: RoutineInfo = { routine: r, params, ret, locals: [] };
    r.info = info;
    this.declare(r.name, { kind: 'routine', name: r.name, text: r.text, info }, r.pos.line);

    const saved = { scope: this.scope, forVars: this.forVars, loopDepth: this.loopDepth, resultAssigned: this.resultAssigned };
    this.scope = new Scope(this.scope, info);
    this.forVars = [];
    this.loopDepth = 0;
    this.resultAssigned = false;
    if (ret) this.scope.map.set(r.name, { kind: 'result', name: r.name, text: r.text, ty: ret });
    if (ret) this.scope.map.set('result', { kind: 'result', name: r.name, text: 'Result', ty: ret });
    for (const p of r.params) {
      const ty = params.find((x) => x.name === p.name)!.ty;
      if (this.scope.map.has(p.name) && this.scope.map.get(p.name)!.kind !== 'result') {
        this.fail('E_DUPLICATE', p.pos.line, `Duplicate identifier "${p.name}"`, { name: p.text });
      }
      this.scope.map.set(p.name, { kind: 'var', name: p.name, text: p.text, ty, isGlobal: false, byRef: p.byRef, isParam: true, isConstParam: p.isConst });
    }
    this.checkBlock(r.block, false);
    if (ret && !this.resultAssigned) {
      this.warnings.push({ code: 'W_FUNCTION_RESULT', line: r.pos.line, message: 'Function result does not seem to be set', params: { name: r.text } });
    }
    Object.assign(this, saved);
  }

  // ---------- statements ----------
  private checkStmt(s: Stmt): void {
    switch (s.kind) {
      case 'compound':
        s.body.forEach((x) => this.checkStmt(x));
        return;
      case 'empty':
        return;
      case 'assign': {
        const targetTy = this.checkAssignTarget(s.target, s.line);
        const valueTy = this.checkExpr(s.value);
        if (valueTy.k === 'void') this.notAFunction(s.value);
        if (!assignable(targetTy, valueTy)) {
          this.fail('E_TYPE_MISMATCH_ASSIGN', s.line, `Incompatible types: got "${tyKind(valueTy)}" expected "${tyKind(targetTy)}"`, {
            target: tyKind(targetTy), source: tyKind(valueTy), name: this.targetName(s.target),
          });
        }
        return;
      }
      case 'callStmt':
        this.checkCall(s.call, true);
        return;
      case 'if':
        this.checkCondition(s.cond, 'if');
        this.checkStmt(s.then);
        if (s.else) this.checkStmt(s.else);
        return;
      case 'while':
        this.checkCondition(s.cond, 'while');
        this.loopDepth++;
        this.checkStmt(s.body);
        this.loopDepth--;
        return;
      case 'repeat':
        this.loopDepth++;
        s.body.forEach((x) => this.checkStmt(x));
        this.loopDepth--;
        this.checkCondition(s.cond, 'until');
        return;
      case 'for': {
        const sym = this.scope.lookup(s.variable.name);
        if (!sym) this.undeclared(s.variable.name, s.variable.text, s.line, s.variable.pos.col);
        if (sym.kind !== 'var') this.fail('E_FOR_VAR_NOT_VARIABLE', s.line, 'Illegal counter variable', { name: s.variable.text });
        if (sym.ty.k !== 'integer' && sym.ty.k !== 'char') {
          this.fail('E_FOR_VAR_TYPE', s.line, 'Ordinal expression expected', { name: s.variable.text, type: tyKind(sym.ty) });
        }
        s.variable.sym = sym;
        s.variable.ty = sym.ty;
        for (const bound of [s.from, s.to]) {
          const bt = this.checkExpr(bound);
          if (!assignable(sym.ty, bt) || bt.k === 'real') {
            this.fail('E_TYPE_MISMATCH_ASSIGN', s.line, 'Incompatible types in for loop', { target: tyKind(sym.ty), source: tyKind(bt), name: s.variable.text });
          }
        }
        this.forVars.push(s.variable.name);
        this.loopDepth++;
        this.checkStmt(s.body);
        this.loopDepth--;
        this.forVars.pop();
        return;
      }
      case 'case': {
        const selTy = this.checkExpr(s.expr);
        if (!isOrdinal(selTy) && selTy.k !== 'string') {
          this.fail('E_CASE_TYPE', s.line, 'Ordinal expression expected', { expected: 'integer or char', found: tyKind(selTy) });
        }
        for (const b of s.branches) {
          for (const lab of b.labels) {
            for (const le of [lab.lo, lab.hi]) {
              if (!le) continue;
              if (!this.isConstExpr(le)) this.fail('E_CASE_LABEL_CONST', b.line, 'Constant expression expected');
              const lt = this.constValue(le).ty;
              const ok = (isNumeric(selTy) && lt.k === 'integer') || (isTextual(selTy) && isTextual(lt)) || (selTy.k === 'boolean' && lt.k === 'boolean');
              if (!ok) this.fail('E_CASE_TYPE', b.line, 'Constant and CASE types do not match', { expected: tyKind(selTy), found: tyKind(lt) });
            }
          }
          this.checkStmt(b.body);
        }
        s.elseBody?.forEach((x) => this.checkStmt(x));
        return;
      }
    }
  }

  private isConstExpr(e: Expr): boolean {
    if (e.kind === 'num' || e.kind === 'str' || e.kind === 'bool') return true;
    if (e.kind === 'unary') return this.isConstExpr(e.operand);
    if (e.kind === 'var') return this.scope.lookup(e.name)?.kind === 'const';
    return false;
  }

  private targetName(e: Expr): string {
    if (e.kind === 'var') return e.text;
    if (e.kind === 'index') return this.targetName(e.base) + '[...]';
    return '';
  }

  private checkCondition(e: Expr, keyword: string) {
    const ty = this.checkExpr(e);
    if (ty.k !== 'boolean') {
      this.fail('E_CONDITION_NOT_BOOLEAN', e.pos.line, `Incompatible types: got "${tyKind(ty)}" expected "boolean"`, { keyword, type: tyKind(ty) }, e.pos.col);
    }
  }

  /** Validates an assignment / var-parameter target. Returns its type. */
  private checkAssignTarget(e: Expr, line: number, forRead = false): Ty {
    if (e.kind === 'var') {
      const sym = this.scope.lookup(e.name);
      if (!sym) this.undeclared(e.name, e.text, line, e.pos.col);
      e.sym = sym;
      if (sym.kind === 'const') this.fail('E_ASSIGN_CONST', line, 'Can\'t assign values to a constant', { name: e.text });
      if (sym.kind === 'routine') {
        if (sym.info.ret && this.isInside(sym.info)) {
          this.resultAssigned = true;
          const res: Symbol = { kind: 'result', name: sym.name, text: sym.text, ty: sym.info.ret };
          e.sym = res;
          e.ty = sym.info.ret;
          return sym.info.ret;
        }
        this.fail('E_PROCEDURE_RESULT', line, 'Illegal assignment', { name: e.text });
      }
      if (sym.kind === 'result') {
        this.resultAssigned = true;
        e.ty = sym.ty;
        return sym.ty;
      }
      if (sym.kind !== 'var') this.fail('E_VAR_PARAM_NEEDS_VARIABLE', line, 'Variable identifier expected', { name: e.text });
      if (this.forVars.includes(e.name) && !forRead) this.fail('E_ASSIGN_FOR_VAR', line, 'Illegal assignment to for-loop variable', { name: e.text });
      e.ty = sym.ty;
      return sym.ty;
    }
    if (e.kind === 'index') {
      const baseTy = this.checkAssignTarget(e.base, line, forRead);
      return this.indexType(e, baseTy);
    }
    this.fail('E_VAR_PARAM_NEEDS_VARIABLE', line, 'Variable identifier expected', { name: '' });
  }

  private isInside(info: RoutineInfo): boolean {
    for (let s: Scope | undefined = this.scope; s; s = s.parent) if (s.routine === info) return true;
    return false;
  }

  private isDesignator(e: Expr): boolean {
    if (e.kind === 'var') {
      const sym = this.scope.lookup(e.name);
      return sym?.kind === 'var' || sym?.kind === 'result';
    }
    if (e.kind === 'index') return this.isDesignator(e.base);
    return false;
  }

  private indexType(e: Extract<Expr, { kind: 'index' }>, baseTy: Ty): Ty {
    const it = this.checkExpr(e.index);
    if (baseTy.k === 'array') {
      if (it.k !== 'integer' && it.k !== 'char') this.fail('E_ARRAY_INDEX_TYPE', e.pos.line, 'Incompatible index type', { type: tyKind(it) });
      e.ty = baseTy.of;
      return baseTy.of;
    }
    if (baseTy.k === 'string') {
      if (it.k !== 'integer') this.fail('E_ARRAY_INDEX_TYPE', e.pos.line, 'Incompatible index type', { type: tyKind(it) });
      e.ty = T.char;
      return T.char;
    }
    this.fail('E_NOT_ARRAY', e.pos.line, 'Illegal qualifier', { name: this.targetName(e.base) });
  }

  private undeclared(name: string, text: string, line: number, col?: number): never {
    const candidates = this.scope.names().filter((n) => !TYPE_ALIASES[n.toLowerCase()] || n.toLowerCase() === 'integer');
    let best: string | undefined = SUGGEST_ALIASES[name];
    if (!best) {
      let bestD = Infinity;
      for (const c of candidates) {
        const d = levenshtein(name, c.toLowerCase());
        const limit = name.length <= 3 ? 1 : 2;
        if (d <= limit && d < bestD) {
          bestD = d;
          best = c;
        }
      }
    }
    this.fail('E_UNDECLARED', line, `Identifier not found "${text}"`, best ? { name: text, suggestion: best } : { name: text }, col);
  }

  private notAFunction(e: Expr): never {
    const name = e.kind === 'call' || e.kind === 'var' ? e.text : 'This';
    this.fail('E_NOT_A_FUNCTION', e.pos.line, 'Procedure has no result', { name });
  }

  // ---------- expressions ----------
  checkExpr(e: Expr): Ty {
    const ty = this.exprType(e);
    e.ty = ty;
    return ty;
  }

  private exprType(e: Expr): Ty {
    switch (e.kind) {
      case 'num':
        return e.isReal ? T.real : T.integer;
      case 'str':
        return e.value.length === 1 ? T.char : T.string;
      case 'bool':
        return T.boolean;
      case 'var': {
        const sym = this.scope.lookup(e.name);
        if (!sym) this.undeclared(e.name, e.text, e.pos.line, e.pos.col);
        e.sym = sym;
        switch (sym.kind) {
          case 'var':
          case 'const':
          case 'result':
            return sym.ty;
          case 'routine': {
            if (sym.info.ret && this.isInside(sym.info) && sym.info.params.length > 0) {
              e.sym = { kind: 'result', name: sym.name, text: sym.text, ty: sym.info.ret };
              return sym.info.ret;
            }
            const call: CallExpr = { kind: 'call', name: e.name, text: e.text, args: [], hasParens: false, pos: e.pos };
            const t = this.checkCall(call, false);
            e.sym = sym;
            return t;
          }
          case 'builtin': {
            const call: CallExpr = { kind: 'call', name: e.name, text: e.text, args: [], hasParens: false, pos: e.pos };
            return this.checkCall(call, false);
          }
          case 'type':
            this.fail('E_EXPECTED_EXPRESSION', e.pos.line, 'Type identifier not allowed here', { found: e.text });
        }
        break;
      }
      case 'index': {
        const baseTy = this.checkExpr(e.base);
        return this.indexType(e, baseTy);
      }
      case 'call':
        return this.checkCall(e, false);
      case 'unary': {
        const t = this.checkExpr(e.operand);
        if (e.op === 'not') {
          if (t.k !== 'boolean') this.fail('E_TYPE_MISMATCH_OP', e.pos.line, 'Operator is not overloaded', { op: 'not', left: 'boolean', right: tyKind(t) });
          return T.boolean;
        }
        if (!isNumeric(t)) this.fail('E_TYPE_MISMATCH_OP', e.pos.line, 'Operator is not overloaded', { op: e.op, left: 'number', right: tyKind(t) });
        return t;
      }
      case 'binary': {
        const l = this.checkExpr(e.left);
        const r = this.checkExpr(e.right);
        if (l.k === 'void') this.notAFunction(e.left);
        if (r.k === 'void') this.notAFunction(e.right);
        return this.binaryType(e.op, l, r, e.pos.line);
      }
    }
    return T.void;
  }

  private binaryType(op: string, l: Ty, r: Ty, line: number): Ty {
    const mismatch = (): never =>
      this.fail('E_TYPE_MISMATCH_OP', line, `Operator is not overloaded: "${tyKind(l)}" ${op} "${tyKind(r)}"`, { op, left: tyKind(l), right: tyKind(r) });
    switch (op) {
      case '+':
        if (isNumeric(l) && isNumeric(r)) return l.k === 'real' || r.k === 'real' ? T.real : T.integer;
        if (isTextual(l) && isTextual(r)) return T.string;
        return mismatch();
      case '-':
      case '*':
        if (isNumeric(l) && isNumeric(r)) return l.k === 'real' || r.k === 'real' ? T.real : T.integer;
        return mismatch();
      case '/':
        if (isNumeric(l) && isNumeric(r)) return T.real;
        return mismatch();
      case 'div':
      case 'mod':
        if (l.k === 'integer' && r.k === 'integer') return T.integer;
        if (isNumeric(l) && isNumeric(r)) this.fail('E_DIV_REAL', line, 'Operator is not overloaded', { op });
        return mismatch();
      case 'and':
      case 'or':
      case 'xor':
        if (l.k === 'boolean' && r.k === 'boolean') return T.boolean;
        if (l.k === 'integer' || r.k === 'integer' || l.k === 'real' || r.k === 'real') this.fail('E_LOGIC_BRACKETS', line, 'Operator is not overloaded');
        return mismatch();
      case '=':
      case '<>':
      case '<':
      case '>':
      case '<=':
      case '>=':
        if (isNumeric(l) && isNumeric(r)) return T.boolean;
        if (isTextual(l) && isTextual(r)) return T.boolean;
        if (l.k === 'boolean' && r.k === 'boolean') return T.boolean;
        return mismatch();
    }
    return mismatch();
  }

  // ---------- calls ----------
  private checkCall(call: CallExpr, asStatement: boolean): Ty {
    const sym = this.scope.lookup(call.name);
    if (!sym) this.undeclared(call.name, call.text, call.pos.line, call.pos.col);
    call.sym = sym;
    const line = call.pos.line;
    if (!(sym.kind === 'builtin' && (sym.name === 'write' || sym.name === 'writeln'))) {
      for (const a of call.args) if (a.width) this.fail('E_EXPECTED', line, 'Illegal format', { expected: ',', found: ':' });
    }
    if (sym.kind === 'builtin') return this.checkBuiltin(call, asStatement);
    if (sym.kind === 'routine' || (sym.kind === 'result' && call.hasParens)) {
      const routineSym = sym.kind === 'routine' ? sym : this.lookupRoutine(call.name);
      call.sym = routineSym;
      const info = routineSym.info;
      if (!asStatement && !info.ret) this.notAFunction(call);
      if (call.args.length !== info.params.length) {
        const sig = `${info.routine.kind} ${info.routine.text}(${info.params.map((p) => `${p.byRef ? 'var ' : ''}${p.text}: ${tyKind(p.ty)}`).join('; ')})`;
        this.fail('E_ARG_COUNT', line, `Wrong number of parameters specified for call to "${call.text}"`, {
          name: call.text, expected: String(info.params.length), found: String(call.args.length), signature: sig,
        });
      }
      info.params.forEach((p, i) => {
        const a = call.args[i].expr;
        if (p.byRef) {
          if (!this.isDesignator(a)) this.fail('E_VAR_PARAM_NEEDS_VARIABLE', line, 'Variable identifier expected', { name: call.text });
          const t = this.checkAssignTarget(a, line, true);
          a.ty = t;
          if (!(t.k === p.ty.k && (t.k !== 'array' || assignable(p.ty, t)))) {
            this.fail('E_ARG_TYPE', line, 'Incompatible type for arg', { name: call.text, index: String(i + 1), expected: tyKind(p.ty), found: tyKind(t) });
          }
        } else {
          const t = this.checkExpr(a);
          if (!assignable(p.ty, t)) {
            this.fail('E_ARG_TYPE', line, 'Incompatible type for arg', { name: call.text, index: String(i + 1), expected: tyKind(p.ty), found: tyKind(t) });
          }
        }
      });
      return info.ret ?? T.void;
    }
    if (sym.kind === 'var' || sym.kind === 'const' || sym.kind === 'result') {
      if (call.hasParens) this.fail('E_CALL_NON_ROUTINE', line, 'Illegal expression', { name: call.text });
      this.fail('E_NOT_A_PROCEDURE', line, 'Illegal expression', { name: call.text, kind: sym.kind === 'const' ? 'constant' : 'variable' });
    }
    this.fail('E_EXPECTED_STATEMENT', line, 'Illegal expression', { found: call.text });
  }

  private argCount(call: CallExpr, min: number, max = min) {
    const n = call.args.length;
    if (n < min || n > max) {
      this.fail('E_ARG_COUNT', call.pos.line, `Wrong number of parameters specified for call to "${call.text}"`, {
        name: call.text, expected: min === max ? String(min) : `${min} to ${max}`, found: String(n),
      });
    }
  }

  private argType(call: CallExpr, i: number, ok: (t: Ty) => boolean, expected: string): Ty {
    const t = this.checkExpr(call.args[i].expr);
    if (!ok(t)) this.fail('E_ARG_TYPE', call.pos.line, 'Incompatible type for arg', { name: call.text, index: String(i + 1), expected, found: tyKind(t) });
    return t;
  }

  private checkBuiltin(call: CallExpr, asStatement: boolean): Ty {
    const name = call.name;
    const line = call.pos.line;
    const isProc = BUILTIN_PROCS.has(name);
    if (isProc && !asStatement) this.notAFunction(call);
    switch (name) {
      case 'write':
      case 'writeln':
        for (const a of call.args) {
          const t = this.checkExpr(a.expr);
          if (t.k === 'array') this.fail('E_WRITE_ARRAY', line, "Can't read or write variables of this type");
          if (t.k === 'void') this.notAFunction(a.expr);
          if (a.width) {
            const wt = this.checkExpr(a.width);
            if (wt.k !== 'integer') this.fail('E_ARG_TYPE', line, 'Width must be integer', { name, index: '?', expected: 'integer', found: tyKind(wt) });
          }
          if (a.decimals) {
            if (t.k !== 'real') this.fail('E_FORMAT_NOT_REAL', line, 'Illegal use of ":"');
            const dt = this.checkExpr(a.decimals);
            if (dt.k !== 'integer') this.fail('E_ARG_TYPE', line, 'Decimals must be integer', { name, index: '?', expected: 'integer', found: tyKind(dt) });
          }
        }
        return T.void;
      case 'read':
      case 'readln':
        for (const a of call.args) {
          if (!this.isDesignator(a.expr)) this.fail('E_READ_TYPE', line, 'Variable identifier expected');
          const t = this.checkAssignTarget(a.expr, line, true);
          a.expr.ty = t;
          if (t.k === 'array') this.fail('E_WRITE_ARRAY', line, "Can't read or write variables of this type");
        }
        return T.void;
      case 'inc':
      case 'dec': {
        this.argCount(call, 1, 2);
        if (!this.isDesignator(call.args[0].expr)) this.fail('E_VAR_PARAM_NEEDS_VARIABLE', line, 'Variable identifier expected', { name });
        const t = this.checkAssignTarget(call.args[0].expr, line);
        call.args[0].expr.ty = t;
        if (!isOrdinal(t)) this.fail('E_ARG_TYPE', line, 'Ordinal expected', { name, index: '1', expected: 'integer', found: tyKind(t) });
        if (call.args[1]) this.argType(call, 1, (x) => x.k === 'integer', 'integer');
        return T.void;
      }
      case 'randomize':
      case 'clrscr':
      case 'break':
      case 'continue':
        this.argCount(call, 0);
        if ((name === 'break' || name === 'continue') && this.loopDepth === 0) this.fail('E_BREAK_OUTSIDE_LOOP', line, `${name} not allowed outside a loop`, { name });
        return T.void;
      case 'halt':
        this.argCount(call, 0, 1);
        if (call.args[0]) this.argType(call, 0, (x) => x.k === 'integer', 'integer');
        return T.void;
      case 'delay':
        this.argCount(call, 1);
        this.argType(call, 0, (x) => x.k === 'integer', 'integer');
        return T.void;
      case 'exit':
        this.argCount(call, 0, 1);
        if (call.args[0]) {
          const ret = this.scope.routine?.ret;
          if (!ret) this.fail('E_PROCEDURE_RESULT', line, 'Procedures cannot return a value');
          this.argType(call, 0, (x) => assignable(ret, x), tyKind(ret));
          this.resultAssigned = true;
        }
        return T.void;
      case 'abs':
      case 'sqr': {
        this.argCount(call, 1);
        return this.argType(call, 0, isNumeric, 'number');
      }
      case 'sqrt':
      case 'sin':
      case 'cos':
      case 'arctan':
      case 'ln':
      case 'exp':
      case 'int':
      case 'frac':
        this.argCount(call, 1);
        this.argType(call, 0, isNumeric, 'number');
        return T.real;
      case 'round':
      case 'trunc':
        this.argCount(call, 1);
        this.argType(call, 0, isNumeric, 'number');
        return T.integer;
      case 'ord':
        this.argCount(call, 1);
        this.argType(call, 0, isOrdinal, 'char');
        return T.integer;
      case 'chr':
        this.argCount(call, 1);
        this.argType(call, 0, (t) => t.k === 'integer', 'integer');
        return T.char;
      case 'length':
        this.argCount(call, 1);
        this.argType(call, 0, (t) => isTextual(t) || t.k === 'array', 'string');
        return T.integer;
      case 'upcase':
      case 'lowercase': {
        this.argCount(call, 1);
        const t = this.argType(call, 0, isTextual, 'char or string');
        return t.k === 'char' && name === 'upcase' ? T.char : t.k === 'char' ? T.char : T.string;
      }
      case 'copy':
        this.argCount(call, 3);
        this.argType(call, 0, isTextual, 'string');
        this.argType(call, 1, (t) => t.k === 'integer', 'integer');
        this.argType(call, 2, (t) => t.k === 'integer', 'integer');
        return T.string;
      case 'pos':
        this.argCount(call, 2);
        this.argType(call, 0, isTextual, 'string');
        this.argType(call, 1, isTextual, 'string');
        return T.integer;
      case 'concat':
        if (call.args.length < 1) this.argCount(call, 1, 99);
        call.args.forEach((_, i) => this.argType(call, i, isTextual, 'string'));
        return T.string;
      case 'random':
        this.argCount(call, 0, 1);
        if (call.args[0]) {
          this.argType(call, 0, (t) => t.k === 'integer', 'integer');
          return T.integer;
        }
        return T.real;
      case 'odd':
        this.argCount(call, 1);
        this.argType(call, 0, (t) => t.k === 'integer', 'integer');
        return T.boolean;
      case 'succ':
      case 'pred': {
        this.argCount(call, 1);
        return this.argType(call, 0, isOrdinal, 'integer or char');
      }
      case 'pi':
        this.argCount(call, 0);
        return T.real;
      case 'low':
      case 'high':
        this.argCount(call, 1);
        this.argType(call, 0, (t) => t.k === 'array' || t.k === 'string', 'array');
        return T.integer;
    }
    return T.void;
  }

  private lookupRoutine(name: string): Extract<Symbol, { kind: 'routine' }> {
    for (let s: Scope | undefined = this.scope; s; s = s.parent) {
      const sym = s.map.get(name);
      if (sym?.kind === 'routine') return sym;
    }
    throw new Error('routine not found: ' + name);
  }
}
