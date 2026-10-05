/**
 * Content model. All learning content lives in plain data files under src/content —
 * UI components only render it. Text fields use a tiny markup (see components/ui/Rich):
 *   `code`, **bold**, *italic*, "- " bullets, blank line = paragraph, ```code blocks```.
 */

export type Difficulty = 'easy' | 'practice' | 'challenge' | 'boss';
/** What a question mainly measures — feeds the readiness dimensions. */
export type Skill = 'concept' | 'coding' | 'problem';

export interface CodeTest {
  name?: string;
  inputs?: string[];
  /** Fragments that must appear in the output, in order (case-insensitive, whitespace-tolerant). */
  expect?: string[];
  /** Exact output (after trimming trailing spaces / blank lines). */
  exact?: string;
  /** Fragments that must NOT appear. */
  reject?: string[];
}

export interface CodeRequirement {
  /** Regex (case-insensitive) that must match the student's code (comments removed unless `raw`). */
  pattern: string;
  message: string;
  raw?: boolean;
  /** Pattern must NOT match. */
  forbid?: boolean;
}

interface QBase {
  id: string;
  topic: string;
  difficulty: Difficulty;
  skill: Skill;
  /** Learning objective / what's tested. */
  objective: string;
  /** Exam-style question (used by exam modes). */
  exam?: boolean;
  prompt: string;
  hints: string[];
  explanation: string;
}

export interface MCQ extends QBase {
  type: 'mcq';
  code?: string;
  options: string[];
  answer: number;
  /** Why each wrong option is wrong (index-aligned; empty for correct). */
  why?: string[];
  /** Options are code — render monospace. */
  codeOptions?: boolean;
}

export interface OutputQ extends QBase {
  type: 'output';
  code: string;
  inputs?: string[];
  /** Expected exact output. Verified against the interpreter by tests. */
  answer: string;
}

export interface FillQ extends QBase {
  type: 'fill';
  /** Code with blanks written as [[0]], [[1]] ... */
  code: string;
  blanks: Array<{ accept: string[]; width?: number }>;
  /** Optional: verify by running the filled program instead of exact matching. */
  tests?: CodeTest[];
}

export interface SpotQ extends QBase {
  type: 'spot';
  code: string;
  /** 1-based line numbers counted as correct. */
  lines: number[];
}

export interface FixQ extends QBase {
  type: 'fix';
  code: string;
  tests: CodeTest[];
  solution: string;
}

export interface ArrangeQ extends QBase {
  type: 'arrange';
  /** Correct order. */
  lines: string[];
  distractors?: string[];
  /** If set, any order producing this output is accepted. */
  tests?: CodeTest[];
  /** Lines fixed at the top (e.g. program header) shown but not movable. */
  fixedTop?: string[];
  fixedBottom?: string[];
}

export interface WriteQ extends QBase {
  type: 'write';
  starter: string;
  tests: CodeTest[];
  solution: string;
  requires?: CodeRequirement[];
}

export interface TraceQ extends QBase {
  type: 'trace';
  code: string;
  inputs?: string[];
  columns: string[];
  /** Each row: values per column. A value wrapped in {} is given (shown, not asked). */
  rows: string[][];
  rowLabel?: string;
}

export interface MatchQ extends QBase {
  type: 'match';
  pairs: Array<[string, string]>;
  codeLeft?: boolean;
}

export interface CategorizeQ extends QBase {
  type: 'categorize';
  categories: string[];
  items: Array<{ text: string; category: number }>;
  codeItems?: boolean;
}

export type Question = MCQ | OutputQ | FillQ | SpotQ | FixQ | ArrangeQ | WriteQ | TraceQ | MatchQ | CategorizeQ;
export type QuestionType = Question['type'];

// ---------- Lessons ----------
export type VisualKind =
  | 'program-anatomy'
  | 'data-boxes'
  | 'variable-box'
  | 'divmod'
  | 'truth-table'
  | 'write-vs-writeln'
  | 'if-flow'
  | 'loop-kinds'
  | 'while-vs-repeat'
  | 'array-train'
  | 'proc-vs-func'
  | 'language-ladder'
  | 'translators'
  | 'paradigms'
  | 'oop-car';

export type Callout = { kind: 'tip' | 'mistake' | 'exam'; text: string };

export type LessonStep =
  | { kind: 'concept'; title: string; body: string; callout?: Callout; code?: string }
  | { kind: 'visual'; title: string; body?: string; visual: VisualKind; callout?: Callout }
  | { kind: 'example'; title: string; body?: string; code: string; inputs?: string[]; notes?: Array<{ line: number; text: string }>; callout?: Callout }
  | { kind: 'watch'; title: string; body?: string; code: string; inputs?: string[] }
  | { kind: 'try'; title: string; body: string; starter: string; tests?: CodeTest[]; hints: string[]; solution?: string; requires?: CodeRequirement[] }
  | { kind: 'check'; title?: string; question: string };

export interface Revision {
  what: string;
  why: string;
  syntax?: string;
  example?: { code: string; output?: string };
  mistakes: string[];
  examPoints: string[];
  keyTerms?: Array<{ term: string; def: string }>;
  /** Question id for the mini question. */
  mini: string;
}

export interface Topic {
  id: string;
  unit: string;
  title: string;
  short: string;
  /** Section numbers in the tute (source of truth). */
  source: string;
  minutes: number;
  objectives: string[];
  lesson: LessonStep[];
  revision: Revision;
}

export interface Unit {
  id: string;
  title: string;
  subtitle: string;
  /** Accent hue name used by the UI. */
  hue: 'violet' | 'blue' | 'teal' | 'green' | 'amber' | 'orange' | 'pink' | 'red' | 'slate';
  /** Key into components/ui/icons ICONS. */
  icon: string;
  topics: string[];
  boss?: string;
  /** Theory units don't need coding for mastery. */
  theory?: boolean;
}

export interface BossStage {
  title: string;
  prompt: string;
  starter: string;
  tests: CodeTest[];
  hints: string[];
  solution: string;
  requires?: CodeRequirement[];
}

export interface Boss {
  id: string;
  unit: string;
  title: string;
  story: string;
  /** Key into components/ui/icons ICONS. */
  emoji: string;
  stages: BossStage[];
}

// ---------- Exam ----------
export interface StructuredPart {
  label: string;
  marks: number;
  prompt: string;
  /** Auto-marked via a question in the bank (inline definition). */
  question?: Question;
  /** Self-marked parts: model answer + marking points the student ticks. */
  model?: string;
  points?: string[];
}

export interface StructuredQ {
  id: string;
  title: string;
  topics: string[];
  intro: string;
  code?: string;
  parts: StructuredPart[];
}

export interface CodeExample {
  id: string;
  title: string;
  topic: string;
  description: string;
  code: string;
  inputs?: string[];
}
