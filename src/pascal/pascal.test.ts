import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compile, runSync } from './index';

const dir = join(__dirname, 'fixtures');

describe('matches Free Pascal output on tute programs', () => {
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.pas'))) {
    const base = f.replace(/\.pas$/, '');
    it(base, () => {
      const src = readFileSync(join(dir, f), 'utf8');
      const inFile = join(dir, base + '.in');
      const inputs = existsSync(inFile) ? readFileSync(inFile, 'utf8').replace(/\n$/, '').split('\n') : [];
      const expected = readFileSync(join(dir, base + '.out'), 'utf8');
      const r = runSync(src, { inputs });
      expect(r.error).toBeUndefined();
      expect(r.output).toBe(expected);
    });
  }
});

function errCode(src: string, inputs: string[] = []) {
  const r = runSync(src, { inputs });
  return r.error?.code;
}

describe('friendly errors', () => {
  const wrap = (body: string, vars = 'x, y: integer;') => `program T;\nvar ${vars}\nbegin\n${body}\nend.`;
  const cases: Array<[string, string, number?]> = [
    [wrap("  x := 5\n  writeln(x);"), 'E_MISSING_SEMICOLON', 4],
    ['program T;\nbegin\n  writeln(1);\nend', 'E_MISSING_PERIOD'],
    ['program T;\nbegin\n  writeln(1);\nend;', 'E_MISSING_PERIOD'],
    [wrap('  x = 5;'), 'E_ASSIGN_EQUALS'],
    [wrap('  writeln("hi");'), 'E_DOUBLE_QUOTES'],
    [wrap("  if x > 1 then\n    writeln('a');\n  else\n    writeln('b');"), 'E_SEMICOLON_BEFORE_ELSE'],
    [wrap('  if x := 1 then writeln(1);'), 'E_COLON_EQUALS_IN_CONDITION'],
    [wrap('  total := 5;'), 'E_UNDECLARED'],
    [wrap('  x := 10 / 2;'), 'E_TYPE_MISMATCH_ASSIGN'],
    [wrap("  x := 'five';"), 'E_TYPE_MISMATCH_ASSIGN'],
    [wrap('  if x > 5 and y < 3 then writeln(1);'), 'E_LOGIC_BRACKETS'],
    [wrap('  if x = 1 or x = 2 then writeln(1);'), 'E_LOGIC_BRACKETS'],
    [wrap('  if 1 < x < 10 then writeln(1);'), 'E_CHAINED_COMPARISON'],
    [wrap('  x := 0;\n  y := 5 div x;'), 'R_DIV_ZERO'],
    [wrap('  for x := 1 to 3 do\n    x := x + 1;'), 'E_ASSIGN_FOR_VAR'],
    [wrap('  x := 1;\n  while x < 5 do\n    writeln(x);'), 'R_STEP_LIMIT'],
    ['program T;\nvar a: array[1..3] of integer; i: integer;\nbegin\n  for i := 1 to 4 do a[i] := i;\nend.', 'R_INDEX_RANGE'],
    [wrap('  readln(x);'), 'R_INVALID_INPUT'],
    ['program T;\nvar begin: integer;\nbegin\nend.', 'E_RESERVED_AS_IDENTIFIER'],
    ['program T;\nvar 9thGrade: integer;\nbegin\nend.', 'E_IDENT_STARTS_WITH_DIGIT'],
    ['program T;\nvar student#: integer;\nbegin\nend.', 'E_UNEXPECTED_CHAR'],
    ["program T;\nvar x: integer;\nbegin\n  if x > 1 then\n  begin\n    writeln('a');\n    writeln('b');\nend.", 'E_MISSING_END'],
    [wrap("  if x > 1\n    writeln('a');"), 'E_MISSING_THEN'],
    [wrap("  for x := 1 to 3\n    writeln('a');"), 'E_MISSING_DO'],
    ["program T;\nfunction Sq(n: integer): integer;\nbegin\n  return n * n;\nend;\nbegin\nend.", 'E_RETURN_STATEMENT'],
    [wrap('  writen(x);'), 'E_UNDECLARED'],
    ["program T;\nconst P = 5;\nbegin\n  P := 6;\nend.", 'E_ASSIGN_CONST'],
    ["program T;\nvar c: char;\nbegin\n  c := 'AB';\nend.", 'E_TYPE_MISMATCH_ASSIGN'],
    ["program T;\nvar r: real; i: integer;\nbegin\n  i := 7; r := 2.5;\n  i := r div 2;\nend.", 'E_DIV_REAL'],
    ["program T;\nvar x: integer;\nprocedure P;\nbegin\nend;\nbegin\n  x := P;\nend.", 'E_NOT_A_FUNCTION'],
    ["program T;\nvar x: integer;\nbegin\n  x := 1;\n  x;\nend.", 'E_NOT_A_PROCEDURE'],
    ["program T;\nvar x: integer;\nbegin\n  x := 1;\nend.\nwriteln(2);", ''],
  ];
  for (const [src, code, line] of cases) {
    it(code || 'no error', () => {
      const inputs = code === 'R_INVALID_INPUT' ? ['abc'] : [];
      const r = runSync(src, { inputs, maxSteps: 5000 });
      expect(r.error?.code ?? '').toBe(code);
      if (line) expect(r.error?.line).toBe(line);
    });
  }

  it('suggests close names', () => {
    const r = runSync('program T;\nvar total: integer;\nbegin\n  totl := 1;\nend.');
    expect(r.error?.params?.suggestion).toBe('total');
    const r2 = runSync('program T;\nbegin\n  print(1);\nend.');
    expect(r2.error?.params?.suggestion).toBe('writeln');
  });

  it('warns about uninitialised totals', () => {
    const r = runSync('program T;\nvar sum, i: integer;\nbegin\n  for i := 1 to 3 do sum := sum + i;\n  writeln(sum);\nend.');
    expect(r.output).toBe('6\n');
    expect(r.warnings.map((w) => w.code)).toContain('W_UNINITIALIZED');
  });

  it('missing end points at the inner begin', () => {
    const src = "program T;\nvar marks: integer;\nbegin\n  marks := 60;\n  if marks > 50 then\n  begin\n    writeln('Pass');\n    writeln('Good');\nend.";
    const r = runSync(src);
    expect(r.error?.code).toBe('E_MISSING_END');
    expect(r.error?.params?.beginLine).toBe('6');
  });
});

describe('trace', () => {
  it('records variable changes and branches', () => {
    const r = runSync("program T;\nvar score: integer;\nbegin\n  score := 10;\n  score := score + 5;\n  if score > 12 then writeln('big');\nend.", { trace: true });
    expect(r.trace.length).toBeGreaterThan(3);
    const notes = r.trace.flatMap((s) => s.notes.map((n) => n.text));
    expect(notes).toContain('score changed from 10 to 15');
    expect(notes.some((n) => n.includes('score > 12 is TRUE'))).toBe(true);
    const last = r.trace[r.trace.length - 1];
    expect(last.done).toBe(true);
    expect(last.frames[0].vars.find((v) => v.name === 'score')?.value).toBe('15');
  });

  it('shows call frames', () => {
    const r = runSync('program T;\nfunction Sq(n: integer): integer;\nbegin\n  Sq := n * n;\nend;\nbegin\n  writeln(Sq(4));\nend.', { trace: true });
    expect(r.output).toBe('16\n');
    expect(r.trace.some((s) => s.frames.length === 2 && s.frames[1].title === 'function Sq')).toBe(true);
  });
});

describe('compile', () => {
  it('accepts programs without header', () => {
    expect(compile("begin writeln('x') end.").ok).toBe(true);
  });
  it('reports errors with codes', () => {
    expect(errCode('program T; begin x := 1; end.')).toBe('E_UNDECLARED');
  });
});
