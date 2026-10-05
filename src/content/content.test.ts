import { describe, expect, it } from 'vitest';
import { arrangeProgram, fillProgram, normOutput, runCodeTests } from '../engine/grading';
import { compile, runSync } from '../pascal';
import { ALL_QUESTIONS, BOSSES, QUESTIONS, TOPICS, UNITS } from './index';
import { EXAMPLES } from './examples';
import { STRUCTURED } from './exam';
import type { Question } from './types';

function checkQuestion(q: Question) {
  switch (q.type) {
    case 'mcq':
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      if (q.why) expect(q.why.length, q.id + ' why length').toBe(q.options.length);
      break;
    case 'output': {
      const r = runSync(q.code, { inputs: q.inputs ?? [] });
      expect(r.error?.message ?? '', q.id).toBe('');
      expect(normOutput(r.output), q.id).toBe(normOutput(q.answer));
      break;
    }
    case 'write':
    case 'fix': {
      const c = runCodeTests(q.solution, q.tests, q.type === 'write' ? q.requires : undefined);
      const detail = c.compileError?.error?.message ?? c.results.find((r) => !r.passed)?.output ?? c.failedRequirement?.message;
      expect(c.passed, `${q.id} solution fails: ${detail}`).toBe(true);
      const start = runCodeTests(q.type === 'fix' ? q.code : q.starter, q.tests, q.type === 'write' ? q.requires : undefined);
      expect(start.passed, `${q.id} starter already passes`).toBe(false);
      break;
    }
    case 'fill': {
      const filled = fillProgram(q.code, q.blanks.map((b) => b.accept[0]));
      if (q.tests) {
        const c = runCodeTests(filled, q.tests);
        expect(c.passed, `${q.id}: ${c.compileError?.error?.message ?? c.results.find((r) => !r.passed)?.output}`).toBe(true);
      } else if (/^\s*program/i.test(filled)) {
        const c = compile(filled);
        expect(c.ok ? '' : c.error.message, q.id).toBe('');
      }
      break;
    }
    case 'arrange': {
      const prog = arrangeProgram(q, q.lines);
      if (q.tests) {
        const c = runCodeTests(prog, q.tests);
        expect(c.passed, `${q.id}: ${c.compileError?.error?.message ?? c.results.find((r) => !r.passed)?.output}`).toBe(true);
      } else if (/^\s*program/i.test(prog)) {
        const c = compile(prog);
        expect(c.ok ? '' : c.error.message, q.id).toBe('');
      }
      break;
    }
    case 'spot': {
      const n = q.code.split('\n').length;
      for (const l of q.lines) expect(l, q.id).toBeLessThanOrEqual(n);
      break;
    }
    case 'trace':
      for (const row of q.rows) expect(row.length, q.id).toBe(q.columns.length);
      break;
    case 'match':
    case 'categorize':
      break;
  }
}

describe('content integrity', () => {
  it('ids are unique and references resolve', () => {
    const ids = ALL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of ALL_QUESTIONS) expect(TOPICS[q.topic], `${q.id} topic ${q.topic}`).toBeTruthy();
    for (const u of UNITS) for (const t of u.topics) expect(TOPICS[t], `unit ${u.id} topic ${t}`).toBeTruthy();
    for (const t of Object.values(TOPICS)) {
      expect(QUESTIONS[t.revision.mini], `${t.id} mini`).toBeTruthy();
      for (const s of t.lesson) if (s.kind === 'check') expect(QUESTIONS[s.question], `${t.id} check ${s.question}`).toBeTruthy();
    }
  });

  it('every topic has enough varied practice', () => {
    for (const t of Object.keys(TOPICS)) {
      const qs = ALL_QUESTIONS.filter((q) => q.topic === t);
      expect(qs.length, `${t} question count`).toBeGreaterThanOrEqual(7);
      expect(qs.some((q) => q.difficulty === 'challenge'), `${t} has a challenge`).toBe(true);
    }
  });
});

describe('questions', () => {
  for (const q of ALL_QUESTIONS) it(q.id, () => checkQuestion(q));
});

describe('lessons', () => {
  for (const t of Object.values(TOPICS)) {
    it(t.id, () => {
      for (const s of t.lesson) {
        if (s.kind === 'example' || s.kind === 'watch') {
          const r = runSync(s.code, { inputs: s.inputs ?? [] });
          expect(r.error?.message ?? '', `${t.id}: ${s.title}`).toBe('');
        }
        if (s.kind === 'try' && s.tests?.length && s.solution) {
          const c = runCodeTests(s.solution, s.tests, s.requires);
          expect(c.passed, `${t.id} try "${s.title}"`).toBe(true);
          expect(runCodeTests(s.starter, s.tests, s.requires).passed, `${t.id} try starter passes already`).toBe(false);
        }
      }
      if (t.revision.example) {
        const r = runSync(t.revision.example.code);
        expect(r.error?.message ?? '', `${t.id} revision example`).toBe('');
        if (t.revision.example.output) expect(normOutput(r.output)).toBe(normOutput(t.revision.example.output));
      }
    });
  }
});

describe('bosses', () => {
  for (const b of Object.values(BOSSES)) {
    it(b.id, () => {
      b.stages.forEach((st, i) => {
        const c = runCodeTests(st.solution, st.tests, st.requires);
        expect(c.passed, `${b.id} stage ${i + 1}: ${c.compileError?.error?.message ?? c.results.find((r) => !r.passed)?.output ?? c.failedRequirement?.message}`).toBe(true);
        expect(runCodeTests(st.starter, st.tests, st.requires).passed, `${b.id} stage ${i + 1} starter`).toBe(false);
      });
    });
  }
});

describe('code lab examples and exam', () => {
  for (const e of EXAMPLES) {
    it(e.id, () => {
      const c = compile(e.code);
      expect(c.ok ? '' : c.error.message).toBe('');
    });
  }
  for (const sq of STRUCTURED) {
    it(sq.id, () => {
      if (sq.code) expect(compile(sq.code).ok).toBe(true);
      for (const p of sq.parts) if (p.question) checkQuestion(p.question);
    });
  }
});
