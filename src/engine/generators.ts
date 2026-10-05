import { runSync } from '../pascal';
import { shuffle } from './session';

/**
 * Procedural question generators: every program is run through the real
 * interpreter, so answers are always correct.
 */

type Rnd = () => number;
const int = (rnd: Rnd, lo: number, hi: number) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = <T,>(rnd: Rnd, xs: T[]) => xs[Math.floor(rnd() * xs.length)];

export interface GenMCQ {
  code: string;
  answer: string;
  options: string[];
  explain: string;
}

function outputOf(code: string, inputs: string[] = []): string {
  const r = runSync(code, { inputs, maxSteps: 50_000 });
  if (r.error) throw new Error('generator produced invalid program: ' + r.error.message + '\n' + code);
  return r.output.replace(/\n$/, '');
}

function withDistractors(rnd: Rnd, answer: string, candidates: string[]): string[] {
  const set = new Set<string>([answer]);
  for (const c of shuffle(candidates, rnd)) {
    if (set.size >= 4) break;
    if (c !== answer && c.trim() !== '') set.add(c);
  }
  let k = 1;
  while (set.size < 4) {
    const n = Number(answer.split(/\s+/)[0]);
    set.add(Number.isFinite(n) ? String(n + k * (k % 2 ? 1 : -1) * 2) : answer + ' ' + k);
    k++;
  }
  return shuffle([...set], rnd);
}

const prog = (vars: string, body: string) => `program Q;\nvar\n  ${vars};\nbegin\n${body}\nend.`;

/** "What does this print?" quick questions for Output Predictor. */
export function genOutputQuestion(rnd: Rnd, level: number): GenMCQ {
  const kinds = level < 2 ? ['divmod', 'assign', 'ifelse'] : level < 4 ? ['divmod', 'assign', 'ifelse', 'for', 'while'] : ['for', 'while', 'repeat', 'nested', 'divmod', 'logic'];
  const kind = pick(rnd, kinds);
  switch (kind) {
    case 'divmod': {
      const a = int(rnd, 10, 50);
      const b = int(rnd, 2, 9);
      const op = pick(rnd, ['div', 'mod']);
      const code = prog('a, b : integer', `  a := ${a};\n  b := ${b};\n  writeln(a ${op} b);`);
      const ans = outputOf(code);
      return {
        code, answer: ans,
        options: withDistractors(rnd, ans, [String(Math.trunc(a / b)), String(a % b), (a / b).toFixed(1), String(b), String(Math.trunc(a / b) + 1)]),
        explain: op === 'div' ? `${a} div ${b} keeps only the whole-number part of ${a} ÷ ${b}.` : `${a} mod ${b} is the remainder after dividing ${a} by ${b}.`,
      };
    }
    case 'assign': {
      const x = int(rnd, 1, 9);
      const y = int(rnd, 2, 6);
      const code = prog('x, y : integer', `  x := ${x};\n  y := x * ${y};\n  x := y - x;\n  writeln(x, ' ', y);`);
      const ans = outputOf(code);
      const yv = x * y;
      return {
        code, answer: ans,
        options: withDistractors(rnd, ans, [`${x} ${yv}`, `${yv - x} ${x}`, `${yv} ${yv - x}`, `${x - yv} ${yv}`]),
        explain: `y becomes ${yv}, then x becomes ${yv} - ${x} = ${yv - x}.`,
      };
    }
    case 'ifelse': {
      const m = int(rnd, 20, 95);
      const t = pick(rnd, [40, 50, 65, 75]);
      const code = prog('marks : integer', `  marks := ${m};\n  if marks >= ${t} then\n    writeln('Pass')\n  else\n    writeln('Fail');`);
      const ans = outputOf(code);
      return { code, answer: ans, options: shuffle(['Pass', 'Fail', 'Pass\nFail', 'Nothing is printed'], rnd), explain: `${m} >= ${t} is ${m >= t ? 'TRUE' : 'FALSE'}, so only the ${m >= t ? 'THEN' : 'ELSE'} part runs.` };
    }
    case 'for': {
      const a = int(rnd, 1, 3);
      const b = a + int(rnd, 2, 4);
      const code = prog('i, total : integer', `  total := 0;\n  for i := ${a} to ${b} do\n    total := total + i;\n  writeln(total);`);
      const ans = outputOf(code);
      let s1 = 0;
      for (let i = a; i < b; i++) s1 += i;
      return { code, answer: ans, options: withDistractors(rnd, ans, [String(s1), String(Number(ans) + b + 1), String(b - a + 1), String(b)]), explain: `The loop adds ${Array.from({ length: b - a + 1 }, (_, k) => a + k).join(' + ')} = ${ans}.` };
    }
    case 'while': {
      const start = int(rnd, 1, 4);
      const lim = start + int(rnd, 6, 14);
      const step = pick(rnd, [2, 3]);
      const code = prog('n, count : integer', `  n := ${start};\n  count := 0;\n  while n < ${lim} do\n  begin\n    n := n + ${step};\n    count := count + 1;\n  end;\n  writeln(count);`);
      const ans = outputOf(code);
      return { code, answer: ans, options: withDistractors(rnd, ans, [String(Number(ans) + 1), String(Number(ans) - 1), String(lim), String(Math.round((lim - start) / step))]), explain: `Count how many times n can increase by ${step} while it is still below ${lim}.` };
    }
    case 'repeat': {
      const x = int(rnd, 5, 30);
      const code = prog('x : integer', `  x := ${x};\n  repeat\n    x := x - 4;\n  until x < 10;\n  writeln(x);`);
      const ans = outputOf(code);
      return { code, answer: ans, options: withDistractors(rnd, ans, [String(Number(ans) + 4), String(Number(ans) - 4), String(x - 4), '10']), explain: 'repeat runs the body first, then checks the condition. Keep subtracting 4 until x < 10.' };
    }
    case 'nested': {
      const r = int(rnd, 2, 4);
      const c = int(rnd, 2, 4);
      const code = prog('i, j, count : integer', `  count := 0;\n  for i := 1 to ${r} do\n    for j := 1 to ${c} do\n      count := count + 1;\n  writeln(count);`);
      const ans = outputOf(code);
      return { code, answer: ans, options: withDistractors(rnd, ans, [String(r + c), String(r * c + 1), String(r), String(c)]), explain: `The inner loop runs ${c} times for each of the ${r} outer rounds: ${r} × ${c} = ${r * c}.` };
    }
    default: {
      const a = int(rnd, 1, 10);
      const b = int(rnd, 1, 10);
      const code = prog('a, b : integer', `  a := ${a};\n  b := ${b};\n  writeln((a > b) or (a = 5));`);
      const ans = outputOf(code);
      return { code, answer: ans, options: shuffle(['TRUE', 'FALSE', String(a > b ? a : b), 'Error'], rnd), explain: `a > b is ${a > b ? 'TRUE' : 'FALSE'}; a = 5 is ${a === 5 ? 'TRUE' : 'FALSE'}. or needs at least one TRUE.` };
    }
  }
}

export interface LogicQ {
  vars: Record<string, number | boolean>;
  expr: string;
  answer: boolean;
}

/** Boolean expression quick-fire for Logic Challenge. */
export function genLogic(rnd: Rnd, level: number): LogicQ {
  const x = int(rnd, 0, 12);
  const y = int(rnd, 0, 12);
  const rel = () => {
    const v = pick(rnd, ['x', 'y']);
    const op = pick(rnd, ['>', '<', '>=', '<=', '=', '<>']);
    return `(${v} ${op} ${int(rnd, 0, 12)})`;
  };
  let expr: string;
  if (level < 2) expr = rel();
  else if (level < 4) expr = `${rel()} ${pick(rnd, ['and', 'or'])} ${rel()}`;
  else expr = pick(rnd, [`not ${rel()}`, `${rel()} and not ${rel()}`, `(${rel()} or ${rel()}) and ${rel()}`, `not (${rel()} and ${rel()})`]);
  const code = `program L;\nvar x, y : integer;\nbegin\n  x := ${x}; y := ${y};\n  writeln(${expr});\nend.`;
  const out = outputOf(code);
  return { vars: { x, y }, expr, answer: out === 'TRUE' };
}

export interface MemoryQ {
  steps: string[];
  ask: string;
  answer: string;
  options: string[];
}

/** Assignments to remember for Memory Challenge. */
export function genMemory(rnd: Rnd, level: number): MemoryQ {
  const names = ['a', 'b', 'c'];
  const n = 3 + Math.min(4, level);
  const steps: string[] = [`a := ${int(rnd, 1, 9)};`, `b := ${int(rnd, 1, 9)};`];
  if (level > 1) steps.push(`c := ${int(rnd, 1, 5)};`);
  const used = level > 1 ? names : ['a', 'b'];
  while (steps.length < n) {
    const t = pick(rnd, used);
    const s = pick(rnd, used);
    const op = pick(rnd, ['+', '-', '*']);
    steps.push(op === '*' ? `${t} := ${s} * 2;` : `${t} := ${t} ${op} ${s === t ? int(rnd, 1, 5) : s};`);
  }
  const ask = pick(rnd, used);
  const code = `program M;\nvar a, b, c : integer;\nbegin\n  c := 0;\n  ${steps.join('\n  ')}\n  writeln(${ask});\nend.`;
  const answer = outputOf(code);
  const v = Number(answer);
  return { steps, ask, answer, options: withDistractors(rnd, answer, [String(v + 1), String(v - 2), String(v * 2), String(v + 3), String(v - 1)]) };
}
