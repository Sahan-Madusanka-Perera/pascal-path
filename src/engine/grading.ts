import type { CodeRequirement, CodeTest, Question } from '../content/types';
import { runSync, type RunResult } from '../pascal';

// ---------- normalisation helpers ----------
export const normOutput = (s: string, strictSpaces = false) =>
  s
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => (strictSpaces ? l.replace(/\s+$/, '') : l.trim().replace(/[ \t]+/g, ' ')))
    .join('\n')
    .replace(/\n+$/, '');

const normLoose = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const normToken = (s: string) => s.toLowerCase().replace(/\s+/g, '');

const isWordChar = (c: string | undefined) => !!c && /[a-z0-9_]/i.test(c);

/** Find `frag` in `hay` at/after `from`, respecting word boundaries at alphanumeric edges. */
function findFragment(hay: string, frag: string, from: number): number {
  let i = hay.indexOf(frag, from);
  while (i !== -1) {
    const before = hay[i - 1];
    const after = hay[i + frag.length];
    const okBefore = !isWordChar(frag[0]) || !isWordChar(before) || (/[0-9]/.test(frag[0]) && !/[0-9.]/.test(before ?? ''));
    const okAfter =
      !isWordChar(frag[frag.length - 1]) ||
      !isWordChar(after) ||
      (/[0-9]/.test(frag[frag.length - 1]) && !/[0-9]/.test(after ?? '') && !(after === '.' && /[0-9]/.test(hay[i + frag.length + 1] ?? '')));
    if (okBefore && okAfter) return i;
    i = hay.indexOf(frag, i + 1);
  }
  return -1;
}

export interface TestResult {
  test: CodeTest;
  passed: boolean;
  output: string;
  run: RunResult;
  /** First expected fragment that wasn't found. */
  missing?: string;
  /** Fragment that must not appear but did. */
  unwanted?: string;
}

export interface CodeCheck {
  passed: boolean;
  compileError?: RunResult;
  results: TestResult[];
  failedRequirement?: CodeRequirement;
}

export function checkOutput(output: string, test: CodeTest): { passed: boolean; missing?: string; unwanted?: string } {
  if (test.exact !== undefined) {
    const a = normOutput(output, true).toLowerCase();
    const b = normOutput(test.exact, true).toLowerCase();
    if (a === b) return { passed: true };
    return { passed: false, missing: test.exact };
  }
  const hay = normLoose(output);
  let pos = 0;
  for (const frag of test.expect ?? []) {
    const f = normLoose(frag);
    const at = findFragment(hay, f, pos);
    if (at === -1) return { passed: false, missing: frag };
    pos = at + f.length;
  }
  for (const frag of test.reject ?? []) {
    if (findFragment(hay, normLoose(frag), 0) !== -1) return { passed: false, unwanted: frag };
  }
  return { passed: true };
}

const stripComments = (code: string) => code.replace(/\{[^}]*\}|\(\*[\s\S]*?\*\)|\/\/[^\n]*/g, ' ');

export function runCodeTests(code: string, tests: CodeTest[], requires: CodeRequirement[] = []): CodeCheck {
  const results: TestResult[] = [];
  const list = tests.length ? tests : [{}];
  for (const test of list) {
    const run = runSync(code, { inputs: test.inputs ?? [], maxSteps: 200_000, random: () => 0.42 });
    if (run.status === 'compile-error') return { passed: false, compileError: run, results };
    if (run.error) {
      results.push({ test, passed: false, output: run.output, run });
      continue;
    }
    const r = checkOutput(run.output, test);
    results.push({ test, passed: r.passed, output: run.output, run, missing: r.missing, unwanted: r.unwanted });
  }
  const passedTests = results.every((r) => r.passed);
  if (passedTests) {
    const clean = stripComments(code);
    for (const req of requires) {
      const found = new RegExp(req.pattern, 'i').test(req.raw ? code : clean);
      if (found === !!req.forbid) return { passed: false, results, failedRequirement: req };
    }
  }
  return { passed: passedTests, results };
}

// ---------- answers ----------
export type Answer =
  | { type: 'mcq'; choice: number }
  | { type: 'output'; text: string }
  | { type: 'fill'; values: string[] }
  | { type: 'spot'; line: number }
  | { type: 'fix' | 'write'; code: string }
  | { type: 'arrange'; order: string[] }
  | { type: 'trace'; cells: Record<string, string> }
  | { type: 'match'; pairs: Record<number, number> }
  | { type: 'categorize'; placed: Record<number, number> };

export interface Grade {
  correct: boolean;
  /** 0..1 for partially-correct structured answers. */
  score: number;
  feedback?: string;
  code?: CodeCheck;
  /** Per-part correctness for fill/trace/match/categorize (keys = blank/cell/item ids). */
  parts?: Record<string, boolean>;
}

export function fillProgram(code: string, values: string[]) {
  return code.replace(/\[\[(\d+)\]\]/g, (_, i) => values[Number(i)] ?? '');
}

export function arrangeProgram(q: Extract<Question, { type: 'arrange' }>, order: string[]) {
  return [...(q.fixedTop ?? []), ...order, ...(q.fixedBottom ?? [])].join('\n');
}

const normCell = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/^'(.*)'$/, '$1')
    .replace(/\s+/g, ' ');

export function traceKey(row: number, col: number) {
  return `${row}:${col}`;
}

export const isGiven = (v: string) => /^\{.*\}$/.test(v);
export const givenText = (v: string) => v.replace(/^\{(.*)\}$/, '$1');

export function grade(q: Question, a: Answer): Grade {
  switch (q.type) {
    case 'mcq': {
      const ok = a.type === 'mcq' && a.choice === q.answer;
      const choice = a.type === 'mcq' ? a.choice : -1;
      return { correct: ok, score: ok ? 1 : 0, feedback: ok ? undefined : q.why?.[choice] || undefined };
    }
    case 'output': {
      const text = a.type === 'output' ? a.text : '';
      const exp = normOutput(q.answer);
      const got = normOutput(text);
      if (got === exp) return { correct: true, score: 1 };
      if (got.toLowerCase() === exp.toLowerCase()) {
        return { correct: true, score: 1, feedback: 'Correct! (Watch the capital letters: Pascal prints TRUE/FALSE in capitals.)' };
      }
      const gl = got.split('\n');
      const el = exp.split('\n');
      let feedback: string | undefined;
      if (gl.length !== el.length) {
        feedback = `The program prints ${el.length} line${el.length === 1 ? '' : 's'}, but your answer has ${gl.length}. Check where writeln starts a new line and where write stays on the same line.`;
      } else {
        const idx = el.findIndex((l, i) => l.toLowerCase() !== gl[i].toLowerCase());
        if (idx >= 0) feedback = `Line ${idx + 1} of your answer isn't right yet.`;
      }
      return { correct: false, score: 0, feedback };
    }
    case 'fill': {
      const values = a.type === 'fill' ? a.values : [];
      const parts: Record<string, boolean> = {};
      q.blanks.forEach((b, i) => {
        parts[i] = b.accept.some((acc) => normToken(acc) === normToken(values[i] ?? ''));
      });
      const exact = Object.values(parts).every(Boolean);
      if (exact) return { correct: true, score: 1, parts };
      if (q.tests && values.every((v) => v.trim() !== '')) {
        const check = runCodeTests(fillProgram(q.code, values), q.tests);
        if (check.passed) {
          const all: Record<string, boolean> = {};
          q.blanks.forEach((_, i) => (all[i] = true));
          return { correct: true, score: 1, parts: all, code: check, feedback: 'That works too! It is different from our answer, but the program gives the right result.' };
        }
        return { correct: false, score: Object.values(parts).filter(Boolean).length / q.blanks.length, parts, code: check };
      }
      return { correct: false, score: Object.values(parts).filter(Boolean).length / q.blanks.length, parts };
    }
    case 'spot': {
      const ok = a.type === 'spot' && q.lines.includes(a.line);
      return { correct: ok, score: ok ? 1 : 0 };
    }
    case 'fix':
    case 'write': {
      const code = a.type === 'fix' || a.type === 'write' ? a.code : '';
      const check = runCodeTests(code, q.tests, q.type === 'write' ? q.requires : undefined);
      const passedCount = check.results.filter((r) => r.passed).length;
      return { correct: check.passed, score: check.passed ? 1 : check.results.length ? passedCount / check.results.length / 2 : 0, code: check };
    }
    case 'arrange': {
      const order = a.type === 'arrange' ? a.order : [];
      const exact = order.length === q.lines.length && order.every((l, i) => l === q.lines[i]);
      if (exact) return { correct: true, score: 1 };
      if (q.tests && order.length > 0) {
        const check = runCodeTests(arrangeProgram(q, order), q.tests);
        if (check.passed && !order.some((l) => q.distractors?.includes(l))) return { correct: true, score: 1, code: check };
        return { correct: false, score: 0, code: check };
      }
      const usedDistractor = order.some((l) => q.distractors?.includes(l));
      return {
        correct: false,
        score: 0,
        feedback: usedDistractor ? 'One of the blocks you used doesn\'t belong in this program.' : order.length < q.lines.length ? 'Some blocks are still missing.' : undefined,
      };
    }
    case 'trace': {
      const cells = a.type === 'trace' ? a.cells : {};
      const parts: Record<string, boolean> = {};
      q.rows.forEach((row, r) =>
        row.forEach((v, c) => {
          if (isGiven(v)) return;
          const k = traceKey(r, c);
          parts[k] = normCell(cells[k] ?? '') === normCell(v);
        }),
      );
      const vals = Object.values(parts);
      const right = vals.filter(Boolean).length;
      return { correct: right === vals.length, score: vals.length ? right / vals.length : 1, parts };
    }
    case 'match': {
      const pairs = a.type === 'match' ? a.pairs : {};
      const parts: Record<string, boolean> = {};
      q.pairs.forEach((_, i) => (parts[i] = pairs[i] === i));
      const right = Object.values(parts).filter(Boolean).length;
      return { correct: right === q.pairs.length, score: right / q.pairs.length, parts };
    }
    case 'categorize': {
      const placed = a.type === 'categorize' ? a.placed : {};
      const parts: Record<string, boolean> = {};
      q.items.forEach((it, i) => (parts[i] = placed[i] === it.category));
      const right = Object.values(parts).filter(Boolean).length;
      return { correct: right === q.items.length, score: right / q.items.length, parts };
    }
  }
}
