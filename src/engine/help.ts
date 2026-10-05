import type { Question } from '../content/types';
import { explainError } from '../pascal';
import { givenText, isGiven, normOutput, type Answer, type Grade } from './grading';

/**
 * Structured "AI-like" help built from content metadata — no AI backend needed.
 * A future AI provider could implement the same function signatures (see HelpProvider).
 */
export interface HelpProvider {
  whyWrong(q: Question, a: Answer, g: Grade): string;
}

export function whyWrong(q: Question, a: Answer, g: Grade): string {
  return provider.whyWrong(q, a, g);
}

let provider: HelpProvider = { whyWrong: localWhyWrong };

/** Swap in a different help provider (e.g. one backed by an AI model). */
export function setHelpProvider(p: HelpProvider) {
  provider = p;
}

function localWhyWrong(q: Question, a: Answer, g: Grade): string {
  switch (q.type) {
    case 'mcq': {
      const choice = a.type === 'mcq' ? a.choice : -1;
      const why = q.why?.[choice];
      return why ? `You chose **${stripMd(q.options[choice])}**. ${why}` : 'That option doesn\'t match what the code or rule says. Re-read the question carefully, then check each option against it.';
    }
    case 'output': {
      const got = a.type === 'output' ? normOutput(a.text) : '';
      const exp = normOutput(q.answer);
      const gl = got.split('\n');
      const el = exp.split('\n');
      const tips: string[] = [];
      if (gl.length !== el.length) tips.push(`Your answer has **${gl.length}** line(s) but the program prints **${el.length}**. Remember: \`writeln\` ends the line, \`write\` stays on the same line.`);
      else {
        const i = el.findIndex((l, k) => l.toLowerCase() !== (gl[k] ?? '').toLowerCase());
        if (i >= 0) tips.push(`Line ${i + 1} is different from what the program prints.`);
      }
      if (/'/.test(got)) tips.push('The quote marks themselves are never printed.');
      tips.push('Trace the program line by line: write down each variable\'s value as it changes.');
      return tips.join('\n\n');
    }
    case 'fill': {
      const wrong = Object.entries(g.parts ?? {}).filter(([, ok]) => !ok).map(([k]) => Number(k) + 1);
      return wrong.length ? `Blank${wrong.length > 1 ? 's' : ''} **${wrong.join(', ')}** ${wrong.length > 1 ? "aren't" : "isn't"} right yet (marked in red). Check spelling and symbols like \`:=\` and \`;\`.` : 'Check each blank again.';
    }
    case 'spot':
      return 'That line is actually fine. Read each line slowly and check: semicolons, quotes, `:=` vs `=`, `begin`/`end` pairs, and names.';
    case 'fix':
    case 'write': {
      const c = g.code;
      if (!c) return 'Run your code and compare the output with what the task asks for.';
      if (c.compileError?.error) {
        const f = explainError(c.compileError.error);
        return `Your program doesn't run yet. **${f.title}** (line ${c.compileError.error.line}).\n\n${f.explanation}\n\n${f.hint}`;
      }
      const failed = c.results.find((r) => !r.passed);
      if (failed) {
        if (failed.run.error) {
          const f = explainError(failed.run.error);
          return `The program crashed${failed.test.inputs?.length ? ` with input **${failed.test.inputs.join(', ')}**` : ''}: **${f.title}**.\n\n${f.explanation}\n\n${f.hint}`;
        }
        const inputs = failed.test.inputs?.length ? `With input **${failed.test.inputs.join(', ')}**, your` : 'Your';
        return `${inputs} program printed:\n\n\`\`\`\n${failed.output.trim() || '(nothing)'}\n\`\`\`\n\nbut the output should contain **${failed.missing ?? failed.unwanted ?? 'something else'}**. Check your calculation and what you print.`;
      }
      if (c.failedRequirement) return c.failedRequirement.message;
      return 'Check the task again.';
    }
    case 'arrange':
      return g.feedback ?? 'Some lines are in the wrong order. Think about what must happen first: declarations, then begin, then the steps in order, then end.';
    case 'trace': {
      const wrong = Object.entries(g.parts ?? {}).filter(([, ok]) => !ok);
      const first = wrong[0]?.[0];
      if (!first) return 'Check the table again.';
      const [r, col] = first.split(':').map(Number);
      return `Row ${r + 1}, column \`${q.columns[col]}\` isn't right. Go through the code one line at a time and update only the variable that changes on that line.${q.rows[r].some(isGiven) ? ` (Row ${r + 1} already gives you: ${q.rows[r].filter(isGiven).map(givenText).join(', ')}.)` : ''}`;
    }
    case 'match':
      return 'Some pairs are mismatched (shown in red). Tap a left item to re-pair it.';
    case 'categorize':
      return 'Some items are in the wrong group (shown in red). Tap one to pick it up and choose a different group.';
  }
}

function stripMd(s: string) {
  return s.replace(/`/g, '').split('\n')[0];
}
