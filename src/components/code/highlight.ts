export type TokCls = 'kw' | 'type' | 'bi' | 'str' | 'num' | 'com' | 'op' | 'id' | 'ws' | 'blank';
export interface HTok {
  cls: TokCls;
  text: string;
}

const KW = new Set([
  'program', 'var', 'const', 'type', 'begin', 'end', 'if', 'then', 'else', 'case', 'of', 'otherwise', 'for', 'to', 'downto',
  'do', 'while', 'repeat', 'until', 'procedure', 'function', 'array', 'div', 'mod', 'and', 'or', 'not', 'xor', 'uses',
  'record', 'set', 'in', 'with', 'nil',
]);
const TYPES = new Set(['integer', 'real', 'boolean', 'char', 'string', 'longint', 'byte', 'word', 'double', 'single', 'extended', 'true', 'false']);
const BUILTINS = new Set([
  'write', 'writeln', 'read', 'readln', 'inc', 'dec', 'abs', 'sqr', 'sqrt', 'round', 'trunc', 'ord', 'chr', 'length', 'upcase',
  'lowercase', 'copy', 'pos', 'concat', 'random', 'randomize', 'odd', 'succ', 'pred', 'exit', 'break', 'continue', 'halt',
  'clrscr', 'sin', 'cos', 'ln', 'exp', 'pi', 'low', 'high', 'int', 'frac',
]);

/** Tokenise Pascal source for display. Returns tokens grouped per line. */
export function highlightLines(src: string): HTok[][] {
  const lines: HTok[][] = [[]];
  const push = (cls: TokCls, text: string) => {
    const parts = text.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push({ cls, text: p });
    });
  };
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i];
    if (ch === '{') {
      const j = src.indexOf('}', i);
      const end = j === -1 ? n : j + 1;
      push('com', src.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '(' && src[i + 1] === '*') {
      const j = src.indexOf('*)', i + 2);
      const end = j === -1 ? n : j + 2;
      push('com', src.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      let j = src.indexOf('\n', i);
      if (j === -1) j = n;
      push('com', src.slice(i, j));
      i = j;
      continue;
    }
    if (ch === "'") {
      let j = i + 1;
      while (j < n && src[j] !== '\n') {
        if (src[j] === "'") {
          if (src[j + 1] === "'") {
            j += 2;
            continue;
          }
          j++;
          break;
        }
        j++;
      }
      push('str', src.slice(i, j));
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      const w = src.slice(i, j);
      const lw = w.toLowerCase();
      push(KW.has(lw) ? 'kw' : TYPES.has(lw) ? 'type' : BUILTINS.has(lw) ? 'bi' : 'id', w);
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9.eE]/.test(src[j]) && !(src[j] === '.' && src[j + 1] === '.')) j++;
      push('num', src.slice(i, j));
      i = j;
      continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      push('ws', src.slice(i, j));
      i = j;
      continue;
    }
    const two = src.slice(i, i + 2);
    if ([':=', '<=', '>=', '<>', '..'].includes(two)) {
      push('op', two);
      i += 2;
      continue;
    }
    push('op', ch);
    i++;
  }
  return lines;
}
