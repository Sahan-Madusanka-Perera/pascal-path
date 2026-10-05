import type { Ty } from './types';

export interface Pos {
  line: number;
  col: number;
  start: number;
  end: number;
}

// ---------- Types as written in source ----------
export type TypeNode =
  | { kind: 'named'; name: string; pos: Pos }
  | { kind: 'string'; pos: Pos }
  | { kind: 'array'; lo: Expr; hi: Expr; of: TypeNode; pos: Pos }
  | { kind: 'openArray'; of: TypeNode; pos: Pos };

// ---------- Expressions ----------
export type Expr =
  | NumLit
  | StrLit
  | BoolLit
  | VarRef
  | IndexExpr
  | CallExpr
  | UnaryExpr
  | BinaryExpr;

interface ExprBase {
  pos: Pos;
  /** Filled by the checker. */
  ty?: Ty;
}

export interface NumLit extends ExprBase {
  kind: 'num';
  value: number;
  isReal: boolean;
}
export interface StrLit extends ExprBase {
  kind: 'str';
  value: string;
}
export interface BoolLit extends ExprBase {
  kind: 'bool';
  value: boolean;
}
export interface VarRef extends ExprBase {
  kind: 'var';
  name: string;
  /** Original spelling. */
  text: string;
  sym?: Symbol;
}
export interface IndexExpr extends ExprBase {
  kind: 'index';
  base: Expr;
  index: Expr;
}
export interface CallExpr extends ExprBase {
  kind: 'call';
  name: string;
  text: string;
  args: Arg[];
  hasParens: boolean;
  sym?: Symbol;
}
export interface UnaryExpr extends ExprBase {
  kind: 'unary';
  op: 'not' | '-' | '+';
  operand: Expr;
}
export interface BinaryExpr extends ExprBase {
  kind: 'binary';
  op: string;
  left: Expr;
  right: Expr;
}

export interface Arg {
  expr: Expr;
  width?: Expr;
  decimals?: Expr;
}

// ---------- Statements ----------
export type Stmt =
  | Compound
  | Assign
  | CallStmt
  | IfStmt
  | CaseStmt
  | ForStmt
  | WhileStmt
  | RepeatStmt
  | EmptyStmt;

interface StmtBase {
  line: number;
}
export interface Compound extends StmtBase {
  kind: 'compound';
  body: Stmt[];
  endLine: number;
}
export interface Assign extends StmtBase {
  kind: 'assign';
  target: Expr;
  value: Expr;
}
export interface CallStmt extends StmtBase {
  kind: 'callStmt';
  call: CallExpr;
}
export interface IfStmt extends StmtBase {
  kind: 'if';
  cond: Expr;
  then: Stmt;
  else?: Stmt;
  elseLine?: number;
}
export interface CaseBranch {
  labels: Array<{ lo: Expr; hi?: Expr }>;
  body: Stmt;
  line: number;
}
export interface CaseStmt extends StmtBase {
  kind: 'case';
  expr: Expr;
  branches: CaseBranch[];
  elseBody?: Stmt[];
  elseLine?: number;
}
export interface ForStmt extends StmtBase {
  kind: 'for';
  variable: VarRef;
  from: Expr;
  to: Expr;
  down: boolean;
  body: Stmt;
}
export interface WhileStmt extends StmtBase {
  kind: 'while';
  cond: Expr;
  body: Stmt;
}
export interface RepeatStmt extends StmtBase {
  kind: 'repeat';
  body: Stmt[];
  cond: Expr;
  untilLine: number;
}
export interface EmptyStmt extends StmtBase {
  kind: 'empty';
}

// ---------- Declarations ----------
export interface ConstDecl {
  name: string;
  text: string;
  expr: Expr;
  pos: Pos;
}
export interface VarDecl {
  names: Array<{ name: string; text: string; pos: Pos }>;
  type: TypeNode;
  init?: Expr;
  pos: Pos;
}
export interface TypeDecl {
  name: string;
  text: string;
  type: TypeNode;
  pos: Pos;
}
export interface Param {
  name: string;
  text: string;
  type: TypeNode;
  byRef: boolean;
  isConst: boolean;
  pos: Pos;
}
export interface Routine {
  kind: 'procedure' | 'function';
  name: string;
  text: string;
  params: Param[];
  returnType?: TypeNode;
  block: Block;
  pos: Pos;
  /** Filled by checker */
  info?: RoutineInfo;
}
export interface Block {
  consts: ConstDecl[];
  types: TypeDecl[];
  vars: VarDecl[];
  routines: Routine[];
  body: Compound;
}
export interface Program {
  name: string;
  block: Block;
  line: number;
  endLine: number;
  uses: string[];
}

// ---------- Symbols (checker output, used by interpreter) ----------
export type Symbol =
  | { kind: 'var'; name: string; text: string; ty: Ty; isGlobal: boolean; byRef?: boolean; isParam?: boolean; isConstParam?: boolean }
  | { kind: 'const'; name: string; text: string; ty: Ty; value: unknown }
  | { kind: 'type'; name: string; ty: Ty }
  | { kind: 'routine'; name: string; text: string; info: RoutineInfo }
  | { kind: 'result'; name: string; text: string; ty: Ty }
  | { kind: 'builtin'; name: string };

export interface RoutineInfo {
  routine: Routine;
  params: Array<{ name: string; text: string; ty: Ty; byRef: boolean }>;
  ret?: Ty;
  locals: Array<{ name: string; text: string; ty: Ty; init?: Expr }>;
}
