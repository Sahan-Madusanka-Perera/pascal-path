import type {
  Arg, Block, CallExpr, CaseBranch, CaseStmt, Compound, ConstDecl, Expr, ForStmt, IfStmt, Param, Pos,
  Program, RepeatStmt, Routine, Stmt, TypeDecl, TypeNode, VarDecl, VarRef, WhileStmt,
} from './ast';
import { PascalError } from './errors';
import { lex, RESERVED_FOR_NAMES, type Token } from './lexer';

const STMT_START_KEYWORDS = new Set(['begin', 'if', 'for', 'while', 'repeat', 'case']);
const RELOPS = new Set(['=', '<>', '<', '>', '<=', '>=']);
const ADDOPS = new Set(['+', '-', 'or', 'xor']);
const MULOPS = new Set(['*', '/', 'div', 'mod', 'and']);

export interface ParseResult {
  program: Program;
  /** Line of a stray `end.` if code followed it (ignored, like Free Pascal does). */
  ignoredAfterLine?: number;
}

export function parse(src: string): ParseResult {
  const toks = lex(src);
  return new Parser(toks, src).parseProgram();
}

class Parser {
  private i = 0;
  private toks: Token[];
  private src: string;
  constructor(toks: Token[], src: string) {
    this.toks = toks;
    this.src = src;
  }

  // ---------- token helpers ----------
  private peek(k = 0): Token {
    return this.toks[Math.min(this.i + k, this.toks.length - 1)];
  }
  private get prev(): Token {
    return this.toks[Math.max(0, this.i - 1)];
  }
  private next(): Token {
    const t = this.toks[this.i];
    if (this.i < this.toks.length - 1) this.i++;
    return t;
  }
  private isKw(v: string, t = this.peek()) {
    return t.kind === 'keyword' && t.value === v;
  }
  private isOp(v: string, t = this.peek()) {
    return t.kind === 'op' && t.value === v;
  }
  private pos(t: Token): Pos {
    return { line: t.line, col: t.col, start: t.start, end: t.end };
  }
  private span(from: Pos, to: Token = this.prev): Pos {
    return { line: from.line, col: from.col, start: from.start, end: to.end };
  }
  private fail(code: string, t: Token, message: string, params: Record<string, string> = {}, line = t.line, col = t.col): never {
    throw new PascalError({ code, line, col, message, params, phase: 'syntax' });
  }
  private describe(t: Token): string {
    if (t.kind === 'eof') return 'the end of the program';
    if (t.kind === 'string') return `'${t.value}'`;
    return t.text;
  }
  private expectOp(v: string, code = 'E_EXPECTED') {
    const t = this.peek();
    if (this.isOp(v)) return this.next();
    if (v === ';') this.missingSemicolon(t);
    this.fail(code, t, `"${v}" expected but "${this.describe(t)}" found`, { expected: v, found: this.describe(t) });
  }
  private expectKw(v: string, code = 'E_EXPECTED', extra: Record<string, string> = {}) {
    const t = this.peek();
    if (this.isKw(v)) return this.next();
    this.fail(code, t, `"${v.toUpperCase()}" expected but "${this.describe(t)}" found`, { expected: v, found: this.describe(t), ...extra });
  }
  private missingSemicolon(t: Token): never {
    const p = this.prev;
    this.fail('E_MISSING_SEMICOLON', t, `";" expected but "${this.describe(t)}" found`, { prevLine: String(p.line), found: this.describe(t) }, p.line, p.col);
  }
  private ident(what = 'identifier'): Token {
    const t = this.peek();
    if (t.kind === 'ident') return this.next();
    if (t.kind === 'keyword') {
      this.fail('E_RESERVED_AS_IDENTIFIER', t, `Identifier expected but "${t.text}" found (reserved word)`, { word: t.text.toLowerCase() });
    }
    this.fail('E_EXPECTED_IDENTIFIER', t, `${what} expected but "${this.describe(t)}" found`, { found: this.describe(t) });
  }
  /** Next tokens look like `name :` / `name ,` / `name =` (a reserved word used as a name still counts). */
  private looksLikeDecl() {
    const t = this.peek();
    if (t.kind === 'ident') return true;
    const n = this.peek(1);
    return t.kind === 'keyword' && n.kind === 'op' && (n.value === ':' || n.value === ',' || n.value === '=');
  }

  private checkNameNotReserved(t: Token) {
    if (RESERVED_FOR_NAMES.has(t.value)) {
      this.fail('E_RESERVED_AS_IDENTIFIER', t, `"${t.text}" is a reserved word`, { word: t.value });
    }
  }

  // ---------- program ----------
  parseProgram(): ParseResult {
    if (this.peek().kind === 'eof') {
      this.fail('E_EMPTY_PROGRAM', this.peek(), 'Empty program', {}, 1, 1);
    }
    let name = 'program';
    const first = this.peek();
    if (this.isKw('program')) {
      this.next();
      const nameTok = this.ident('Program name');
      name = nameTok.text;
      if (this.isOp('(')) {
        this.next();
        while (!this.isOp(')') && this.peek().kind !== 'eof') this.next();
        this.expectOp(')');
      }
      this.expectOp(';');
    }
    const uses: string[] = [];
    if (this.isKw('uses')) {
      this.next();
      uses.push(this.ident('Unit name').value);
      while (this.isOp(',')) {
        this.next();
        uses.push(this.ident('Unit name').value);
      }
      this.expectOp(';');
    }
    const block = this.parseBlock(true);
    const endTok = this.prev;
    const t = this.peek();
    if (this.isOp('.')) {
      this.next();
    } else if (this.isOp(';') || t.kind === 'eof') {
      this.fail('E_MISSING_PERIOD', t, `"." expected but "${this.describe(t)}" found`, {}, endTok.line, endTok.col);
    } else {
      this.fail('E_EXTRA_END', t, `"." expected but "${this.describe(t)}" found`, { line: String(endTok.line) }, endTok.line, endTok.col);
    }
    const result: ParseResult = { program: { name, block, line: first.line, endLine: endTok.line, uses } };
    if (this.peek().kind !== 'eof') result.ignoredAfterLine = endTok.line;
    return result;
  }

  private parseBlock(isMain: boolean): Block {
    const block: Block = { consts: [], types: [], vars: [], routines: [], body: undefined as unknown as Compound };
    for (;;) {
      const t = this.peek();
      if (this.isKw('const')) {
        this.next();
        do block.consts.push(this.parseConst());
        while (this.looksLikeDecl());
      } else if (this.isKw('type')) {
        this.next();
        do block.types.push(this.parseTypeDecl());
        while (this.peek().kind === 'ident');
      } else if (this.isKw('var')) {
        this.next();
        if (!this.looksLikeDecl()) continue;
        do block.vars.push(this.parseVarDecl());
        while (this.looksLikeDecl());
      } else if (this.isKw('procedure') || this.isKw('function')) {
        block.routines.push(this.parseRoutine());
      } else if (this.isKw('begin')) {
        block.body = this.parseCompound();
        return block;
      } else if (t.kind === 'eof') {
        this.fail('E_MISSING_BEGIN', t, '"BEGIN" expected', {});
      } else if (t.kind === 'ident' || STMT_START_KEYWORDS.has(t.value)) {
        this.fail('E_MISSING_BEGIN', t, `"BEGIN" expected but "${this.describe(t)}" found`, {});
      } else {
        this.fail('E_EXPECTED', t, `"BEGIN" expected but "${this.describe(t)}" found`, { expected: 'begin', found: this.describe(t) });
      }
      void isMain;
    }
  }

  private parseConst(): ConstDecl {
    const t = this.ident('Constant name');
    this.checkNameNotReserved(t);
    if (this.isOp(':=')) this.fail('E_EXPECTED', this.peek(), '"=" expected', { expected: '=', found: ':=' });
    this.expectOp('=');
    const expr = this.parseExpr();
    this.expectOp(';');
    return { name: t.value, text: t.text, expr, pos: this.pos(t) };
  }

  private parseTypeDecl(): TypeDecl {
    const t = this.ident('Type name');
    this.checkNameNotReserved(t);
    this.expectOp('=');
    const type = this.parseType();
    this.expectOp(';');
    return { name: t.value, text: t.text, type, pos: this.pos(t) };
  }

  private parseVarDecl(): VarDecl {
    const first = this.peek();
    const names: VarDecl['names'] = [];
    const takeName = () => {
      const t = this.ident('Variable name');
      this.checkNameNotReserved(t);
      names.push({ name: t.value, text: t.text, pos: this.pos(t) });
    };
    takeName();
    while (this.isOp(',')) {
      this.next();
      takeName();
    }
    const t = this.peek();
    if (!this.isOp(':')) {
      if (t.kind === 'ident' && t.line === this.prev.line) {
        this.fail('E_EXPECTED', t, `"," or ":" expected but "${this.describe(t)}" found`, { expected: ':', found: this.describe(t) });
      }
      this.fail('E_EXPECTED', t, `":" expected but "${this.describe(t)}" found`, { expected: ':', found: this.describe(t) });
    }
    this.next();
    const type = this.parseType();
    let init: Expr | undefined;
    if (this.isOp('=')) {
      this.next();
      init = this.parseExpr();
    }
    this.expectOp(';');
    return { names, type, init, pos: this.pos(first) };
  }

  private parseType(): TypeNode {
    const t = this.peek();
    if (this.isKw('string')) {
      this.next();
      if (this.isOp('[')) {
        this.next();
        this.parseExpr();
        this.expectOp(']');
      }
      return { kind: 'string', pos: this.pos(t) };
    }
    if (this.isKw('array')) {
      this.next();
      if (this.isKw('of')) {
        this.next();
        const of = this.parseType();
        return { kind: 'openArray', of, pos: this.pos(t) };
      }
      this.expectOp('[');
      const lo = this.parseExpr();
      if (!this.isOp('..')) {
        this.fail('E_EXPECTED', this.peek(), '".." expected', { expected: '..', found: this.describe(this.peek()) });
      }
      this.next();
      const hi = this.parseExpr();
      if (this.isOp(',')) {
        this.fail('E_EXPECTED', this.peek(), 'Only one-dimensional arrays are supported', { expected: ']', found: ',' });
      }
      this.expectOp(']');
      this.expectKw('of', 'E_EXPECTED');
      const of = this.parseType();
      return { kind: 'array', lo, hi, of, pos: this.pos(t) };
    }
    if (t.kind === 'ident') {
      this.next();
      return { kind: 'named', name: t.value, pos: this.pos(t) };
    }
    this.fail('E_EXPECTED_TYPE', t, `Type expected but "${this.describe(t)}" found`, { found: this.describe(t) });
  }

  private parseRoutine(): Routine {
    const kwTok = this.next();
    const kind = kwTok.value as 'procedure' | 'function';
    const nameTok = this.ident(kind === 'procedure' ? 'Procedure name' : 'Function name');
    this.checkNameNotReserved(nameTok);
    const params: Param[] = [];
    if (this.isOp('(')) {
      this.next();
      if (!this.isOp(')')) {
        for (;;) {
          let byRef = false;
          let isConst = false;
          if (this.isKw('var')) {
            this.next();
            byRef = true;
          } else if (this.isKw('const')) {
            this.next();
            isConst = true;
          }
          const group: Token[] = [this.ident('Parameter name')];
          this.checkNameNotReserved(group[0]);
          while (this.isOp(',')) {
            this.next();
            const g = this.ident('Parameter name');
            this.checkNameNotReserved(g);
            group.push(g);
          }
          this.expectOp(':');
          const type = this.parseType();
          for (const g of group) params.push({ name: g.value, text: g.text, type, byRef, isConst, pos: this.pos(g) });
          if (this.isOp(';')) {
            this.next();
            continue;
          }
          break;
        }
      }
      this.expectOp(')');
    }
    let returnType: TypeNode | undefined;
    if (kind === 'function') {
      if (!this.isOp(':')) {
        this.fail('E_FUNCTION_NO_RETURN_TYPE', this.peek(), 'Function result type expected', {}, this.prev.line, this.prev.col);
      }
      this.next();
      returnType = this.parseType();
    }
    this.expectOp(';');
    const block = this.parseBlock(false);
    this.expectOp(';');
    return { kind, name: nameTok.value, text: nameTok.text, params, returnType, block, pos: this.pos(nameTok) };
  }

  // ---------- statements ----------
  private parseCompound(): Compound {
    const beginTok = this.next(); // begin
    const body = this.parseStatementList(['end'], beginTok);
    const endTok = this.peek();
    if (!this.isKw('end')) this.fail('E_MISSING_END', endTok, '"END" expected', { beginLine: String(this.guessUnclosedBegin(beginTok.line)) });
    this.next();
    return { kind: 'compound', body, line: beginTok.line, endLine: endTok.line };
  }

  /** Find the `begin` most likely missing its `end`, using indentation. */
  private guessUnclosedBegin(fallback: number): number {
    const lines = this.src.split('\n');
    const indentOf = (line: number) => (lines[line - 1] ?? '').search(/\S|$/);
    const stack: Array<{ line: number; indent: number }> = [];
    for (const t of this.toks) {
      if (t.kind !== 'keyword') continue;
      if (t.value === 'begin' || t.value === 'case' || t.value === 'record') stack.push({ line: t.line, indent: indentOf(t.line) });
      else if (t.value === 'end' && stack.length) {
        const ind = indentOf(t.line);
        let idx = -1;
        for (let k = stack.length - 1; k >= 0; k--) {
          if (stack[k].indent === ind) {
            idx = k;
            break;
          }
        }
        if (idx === -1) idx = stack.length - 1;
        stack.splice(idx, 1);
      }
    }
    return stack.length ? stack[stack.length - 1].line : fallback;
  }

  private canStartStatement(t: Token) {
    return t.kind === 'ident' || (t.kind === 'keyword' && STMT_START_KEYWORDS.has(t.value));
  }

  private parseStatementList(terminators: string[], opener: Token): Stmt[] {
    const stmts: Stmt[] = [this.parseStatement()];
    for (;;) {
      const t = this.peek();
      if (this.isOp(';')) {
        const semi = this.next();
        if (this.isKw('else')) {
          this.fail('E_SEMICOLON_BEFORE_ELSE', this.peek(), '";" before ELSE is not allowed', { prevLine: String(semi.line) }, semi.line, semi.col);
        }
        stmts.push(this.parseStatement());
        continue;
      }
      if (t.kind === 'keyword' && terminators.includes(t.value)) return stmts;
      if (t.kind === 'eof') {
        if (opener.value === 'repeat') this.fail('E_MISSING_UNTIL', t, '"UNTIL" expected', {}, opener.line, opener.col);
        this.fail('E_MISSING_END', t, '"END" expected', { beginLine: String(this.guessUnclosedBegin(opener.line)) });
      }
      if (this.isOp('.') && this.prev.kind === 'keyword' && this.prev.value === 'end') {
        // `end.` closed an inner block: there is an unclosed begin somewhere.
        this.fail('E_MISSING_END', t, '"END" expected', { beginLine: String(this.guessUnclosedBegin(opener.line)) });
      }
      if (this.isKw('else')) {
        this.fail('E_EXPECTED', t, '";" expected but "ELSE" found', { expected: ';', found: 'else' });
      }
      if (this.isKw('end') && terminators.includes('until')) {
        this.fail('E_MISSING_UNTIL', t, '"UNTIL" expected but "END" found', {}, opener.line, opener.col);
      }
      if (this.isKw('until') && terminators.includes('end')) {
        this.fail('E_EXPECTED', t, '"END" expected but "UNTIL" found', { expected: 'end', found: 'until' });
      }
      if (this.canStartStatement(t)) this.missingSemicolon(t);
      if (this.isKw('var') || this.isKw('const') || this.isKw('type')) {
        this.fail('E_VAR_AFTER_BEGIN', t, 'Declarations must come before BEGIN', { word: t.value });
      }
      this.fail('E_EXPECTED', t, `";" expected but "${this.describe(t)}" found`, { expected: ';', found: this.describe(t) });
    }
  }

  private parseStatement(): Stmt {
    const t = this.peek();
    if (t.kind === 'keyword') {
      switch (t.value) {
        case 'begin':
          return this.parseCompound();
        case 'if':
          return this.parseIf();
        case 'case':
          return this.parseCase();
        case 'for':
          return this.parseFor();
        case 'while':
          return this.parseWhile();
        case 'repeat':
          return this.parseRepeat();
        case 'end':
        case 'until':
        case 'else':
        case 'otherwise':
          return { kind: 'empty', line: t.line };
        case 'var':
        case 'const':
        case 'type':
          this.fail('E_VAR_AFTER_BEGIN', t, 'Declarations must come before BEGIN', { word: t.value });
        // eslint-disable-next-line no-fallthrough
        default:
          this.fail('E_EXPECTED_STATEMENT', t, `Illegal expression "${this.describe(t)}"`, { found: this.describe(t) });
      }
    }
    if (this.isOp(';')) return { kind: 'empty', line: t.line };
    if (t.kind === 'ident') return this.parseSimpleStatement();
    if (this.isOp('.') ) {
      this.fail('E_EXPECTED_STATEMENT', t, 'Unexpected "."', { found: '.' });
    }
    this.fail('E_EXPECTED_STATEMENT', t, `Illegal expression "${this.describe(t)}"`, { found: this.describe(t) });
  }

  private parseSimpleStatement(): Stmt {
    const t = this.next();
    if (t.value === 'return' && !this.isOp(':=')) {
      this.fail('E_RETURN_STATEMENT', t, 'Identifier not found "return"', {});
    }
    const ref: VarRef = { kind: 'var', name: t.value, text: t.text, pos: this.pos(t) };
    // Procedure call with arguments
    if (this.isOp('(')) {
      const call = this.parseCallRest(t);
      if (this.isOp(':=')) {
        this.fail('E_EXPECTED', this.peek(), 'Can\'t assign to a call', { expected: ';', found: ':=' });
      }
      return { kind: 'callStmt', call, line: t.line };
    }
    let target: Expr = ref;
    while (this.isOp('[')) {
      this.next();
      const index = this.parseExpr();
      this.expectOp(']');
      target = { kind: 'index', base: target, index, pos: this.span(ref.pos) };
    }
    const n = this.peek();
    if (this.isOp(':=')) {
      this.next();
      const value = this.parseExpr();
      return { kind: 'assign', target, value, line: t.line };
    }
    if (this.isOp('=')) {
      this.fail('E_ASSIGN_EQUALS', n, 'Illegal expression (use := for assignment)', { name: this.src.slice(ref.pos.start, this.prev.end) });
    }
    if (this.isOp(':') && this.peek(1).kind === 'op' && this.peek(1).value === '=') {
      this.fail('E_ASSIGN_EQUALS', n, 'Use := without a space', { name: t.text });
    }
    if (target !== ref) {
      this.fail('E_EXPECTED', n, `":=" expected but "${this.describe(n)}" found`, { expected: ':=', found: this.describe(n) });
    }
    if ((n.kind === 'string' || n.kind === 'int' || n.kind === 'real') && n.line === t.line) {
      this.fail('E_EXPECTED', n, `"(" expected but "${this.describe(n)}" found`, { expected: '(', found: this.describe(n) });
    }
    const call: CallExpr = { kind: 'call', name: t.value, text: t.text, args: [], hasParens: false, pos: this.pos(t) };
    return { kind: 'callStmt', call, line: t.line };
  }

  private parseCallRest(nameTok: Token): CallExpr {
    this.expectOp('(');
    const args: Arg[] = [];
    if (!this.isOp(')')) {
      for (;;) {
        const expr = this.parseExpr();
        const arg: Arg = { expr };
        if (this.isOp(':')) {
          this.next();
          arg.width = this.parseExpr();
          if (this.isOp(':')) {
            this.next();
            arg.decimals = this.parseExpr();
          }
        }
        args.push(arg);
        if (this.isOp(',')) {
          this.next();
          continue;
        }
        break;
      }
    }
    if (!this.isOp(')')) {
      const t = this.peek();
      if (t.kind === 'string' || t.kind === 'ident' || t.kind === 'int' || t.kind === 'real') {
        this.fail('E_EXPECTED', t, `"," or ")" expected but "${this.describe(t)}" found`, { expected: ',', found: this.describe(t) });
      }
      this.fail('E_EXPECTED', t, `")" expected but "${this.describe(t)}" found`, { expected: ')', found: this.describe(t) });
    }
    this.next();
    return { kind: 'call', name: nameTok.value, text: nameTok.text, args, hasParens: true, pos: this.span(this.pos(nameTok)) };
  }

  private conditionEnd(keyword: string, expected: string, code: string) {
    const t = this.peek();
    if (this.isOp(':=')) this.fail('E_COLON_EQUALS_IN_CONDITION', t, `"${expected.toUpperCase()}" expected but ":=" found`, {});
    if (!this.isKw(expected)) {
      if (t.kind === 'keyword' && (t.value === 'then' || t.value === 'do')) {
        this.fail('E_EXPECTED', t, `"${expected.toUpperCase()}" expected but "${t.text}" found`, { expected, found: t.text });
      }
      this.fail(code, t, `"${expected.toUpperCase()}" expected but "${this.describe(t)}" found`, { keyword, found: this.describe(t) }, this.prev.line, this.prev.col);
    }
    this.next();
  }

  private parseIf(): IfStmt {
    const ifTok = this.next();
    const cond = this.parseExpr();
    this.conditionEnd('if', 'then', 'E_MISSING_THEN');
    const thenS = this.parseStatement();
    const stmt: IfStmt = { kind: 'if', cond, then: thenS, line: ifTok.line };
    if (this.isKw('else')) {
      stmt.elseLine = this.next().line;
      stmt.else = this.parseStatement();
    }
    return stmt;
  }

  private parseCase(): CaseStmt {
    const caseTok = this.next();
    const expr = this.parseExpr();
    if (!this.isKw('of')) this.fail('E_MISSING_OF', this.peek(), '"OF" expected', {}, this.prev.line, this.prev.col);
    this.next();
    const branches: CaseBranch[] = [];
    const stmt: CaseStmt = { kind: 'case', expr, branches, line: caseTok.line };
    for (;;) {
      if (this.isKw('end')) {
        this.next();
        break;
      }
      if (this.isKw('else') || this.isKw('otherwise')) {
        stmt.elseLine = this.next().line;
        stmt.elseBody = this.parseStatementList(['end'], caseTok);
        if (!this.isKw('end')) this.fail('E_MISSING_END', this.peek(), '"END" expected', { beginLine: String(caseTok.line) });
        this.next();
        break;
      }
      if (this.peek().kind === 'eof') this.fail('E_MISSING_END', this.peek(), '"END" expected', { beginLine: String(caseTok.line) });
      const line = this.peek().line;
      const labels: CaseBranch['labels'] = [];
      for (;;) {
        const lo = this.parseSimple();
        let hi: Expr | undefined;
        if (this.isOp('..')) {
          this.next();
          hi = this.parseSimple();
        }
        labels.push({ lo, hi });
        if (this.isOp(',')) {
          this.next();
          continue;
        }
        break;
      }
      this.expectOp(':');
      const body = this.parseStatement();
      branches.push({ labels, body, line });
      if (this.isOp(';')) {
        this.next();
        continue;
      }
      if (this.isKw('end') || this.isKw('else') || this.isKw('otherwise')) continue;
      this.missingSemicolon(this.peek());
    }
    return stmt;
  }

  private parseFor(): ForStmt {
    const forTok = this.next();
    const vt = this.ident('Loop variable');
    const variable: VarRef = { kind: 'var', name: vt.value, text: vt.text, pos: this.pos(vt) };
    if (this.isOp('=')) this.fail('E_FOR_ASSIGN', this.peek(), '":=" expected but "=" found', {});
    this.expectOp(':=');
    const from = this.parseExpr();
    let down = false;
    if (this.isKw('to')) this.next();
    else if (this.isKw('downto')) {
      this.next();
      down = true;
    } else this.fail('E_MISSING_TO', this.peek(), '"TO" or "DOWNTO" expected', {});
    const to = this.parseExpr();
    this.conditionEnd('for', 'do', 'E_MISSING_DO');
    const body = this.parseStatement();
    return { kind: 'for', variable, from, to, down, body, line: forTok.line };
  }

  private parseWhile(): WhileStmt {
    const wTok = this.next();
    const cond = this.parseExpr();
    this.conditionEnd('while', 'do', 'E_MISSING_DO');
    const body = this.parseStatement();
    return { kind: 'while', cond, body, line: wTok.line };
  }

  private parseRepeat(): RepeatStmt {
    const rTok = this.next();
    const body = this.parseStatementList(['until'], rTok);
    if (!this.isKw('until')) this.fail('E_MISSING_UNTIL', this.peek(), '"UNTIL" expected', {}, rTok.line, rTok.col);
    const untilTok = this.next();
    const cond = this.parseExpr();
    if (this.isOp(':=')) this.fail('E_COLON_EQUALS_IN_CONDITION', this.peek(), '":=" in condition', {});
    return { kind: 'repeat', body, cond, line: rTok.line, untilLine: untilTok.line };
  }

  // ---------- expressions ----------
  parseExpr(): Expr {
    const startTok = this.peek();
    const left = this.parseSimple();
    const t = this.peek();
    if (t.kind === 'op' && RELOPS.has(t.value)) {
      this.next();
      const right = this.parseSimple();
      const n = this.peek();
      if (n.kind === 'op' && RELOPS.has(n.value)) {
        const usesLogic = this.containsTopLogic(right);
        this.fail(usesLogic ? 'E_LOGIC_BRACKETS' : 'E_CHAINED_COMPARISON', n, 'Operator is not overloaded', {}, startTok.line, startTok.col);
      }
      return { kind: 'binary', op: t.value, left, right, pos: this.span(this.pos(startTok)) };
    }
    return left;
  }

  private containsTopLogic(e: Expr): boolean {
    return e.kind === 'binary' && (e.op === 'and' || e.op === 'or' || this.containsTopLogic(e.left) || this.containsTopLogic(e.right));
  }

  private parseSimple(): Expr {
    const startTok = this.peek();
    let left: Expr;
    if (this.isOp('-') || this.isOp('+')) {
      const op = this.next().value as '-' | '+';
      const operand = this.parseTerm();
      left = { kind: 'unary', op, operand, pos: this.span(this.pos(startTok)) };
    } else {
      left = this.parseTerm();
    }
    for (;;) {
      const t = this.peek();
      const op = t.value;
      if ((t.kind === 'op' || t.kind === 'keyword') && ADDOPS.has(op)) {
        this.next();
        const right = this.parseTerm();
        left = { kind: 'binary', op, left, right, pos: this.span(this.pos(startTok)) };
      } else break;
    }
    return left;
  }

  private parseTerm(): Expr {
    const startTok = this.peek();
    let left = this.parseFactor();
    for (;;) {
      const t = this.peek();
      const op = t.value;
      if ((t.kind === 'op' || t.kind === 'keyword') && MULOPS.has(op)) {
        this.next();
        const right = this.parseFactor();
        left = { kind: 'binary', op, left, right, pos: this.span(this.pos(startTok)) };
      } else break;
    }
    return left;
  }

  private parseFactor(): Expr {
    const t = this.peek();
    const p = this.pos(t);
    switch (t.kind) {
      case 'int':
        this.next();
        return { kind: 'num', value: parseInt(t.value, 10), isReal: false, pos: p };
      case 'real':
        this.next();
        return { kind: 'num', value: parseFloat(t.value), isReal: true, pos: p };
      case 'string':
        this.next();
        return { kind: 'str', value: t.value, pos: p };
      case 'keyword':
        if (t.value === 'true' || t.value === 'false') {
          this.next();
          return { kind: 'bool', value: t.value === 'true', pos: p };
        }
        if (t.value === 'not') {
          this.next();
          const operand = this.parseFactor();
          return { kind: 'unary', op: 'not', operand, pos: this.span(p) };
        }
        break;
      case 'op':
        if (t.value === '(') {
          this.next();
          const e = this.parseExpr();
          if (!this.isOp(')')) {
            const n = this.peek();
            this.fail('E_EXPECTED', n, `")" expected but "${this.describe(n)}" found`, { expected: ')', found: this.describe(n) });
          }
          this.next();
          e.pos = this.span(p);
          return e;
        }
        if (t.value === '-' || t.value === '+') {
          this.next();
          const operand = this.parseFactor();
          return { kind: 'unary', op: t.value, operand, pos: this.span(p) };
        }
        break;
      case 'ident': {
        this.next();
        let e: Expr;
        if (this.isOp('(')) {
          e = this.parseCallRest(t);
        } else {
          e = { kind: 'var', name: t.value, text: t.text, pos: p };
        }
        while (this.isOp('[')) {
          this.next();
          const index = this.parseExpr();
          if (!this.isOp(']')) {
            const n = this.peek();
            this.fail('E_EXPECTED', n, `"]" expected but "${this.describe(n)}" found`, { expected: ']', found: this.describe(n) });
          }
          this.next();
          e = { kind: 'index', base: e, index, pos: this.span(p) };
        }
        return e;
      }
      default:
        break;
    }
    this.fail('E_EXPECTED_EXPRESSION', t, `Illegal expression "${this.describe(t)}"`, { found: this.describe(t) });
  }
}
