import { PascalError } from './errors';

export type TokKind = 'ident' | 'keyword' | 'int' | 'real' | 'string' | 'op' | 'eof';

export interface Token {
  kind: TokKind;
  /** Lower-cased for identifiers/keywords, decoded text for strings, symbol for ops. */
  value: string;
  /** Original source text. */
  text: string;
  line: number;
  col: number;
  start: number;
  end: number;
}

export const KEYWORDS = new Set([
  'program', 'var', 'const', 'type', 'begin', 'end', 'if', 'then', 'else', 'case', 'of', 'otherwise',
  'for', 'to', 'downto', 'do', 'while', 'repeat', 'until', 'procedure', 'function', 'array',
  'div', 'mod', 'and', 'or', 'not', 'xor', 'true', 'false', 'uses',
  'record', 'set', 'file', 'nil', 'in', 'with', 'goto', 'label', 'packed', 'string',
]);

/**
 * Words students are taught as "reserved" in the O/L syllabus. Some are technically
 * predefined type identifiers in Free Pascal, but we treat them as reserved so the
 * platform matches what the syllabus teaches.
 */
export const RESERVED_FOR_NAMES = new Set([
  ...KEYWORDS,
  'integer', 'real', 'char', 'boolean',
]);

const OPS = [':=', '<=', '>=', '<>', '..', '+', '-', '*', '/', '=', '<', '>', '(', ')', '[', ']', ',', ';', ':', '.', '^', '@'];

export function lex(src: string): Token[] {
  const toks: Token[] = [];
  let i = 0;
  let line = 1;
  let lineStart = 0;
  const n = src.length;

  const err = (code: string, message: string, params: Record<string, string> = {}, at = i, atLine = line) => {
    throw new PascalError({ code, line: atLine, col: at - lineStart + 1, message, params, phase: 'syntax' });
  };

  while (i < n) {
    const ch = src[i];
    if (ch === '\n') {
      line++;
      i++;
      lineStart = i;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i++;
      continue;
    }
    // Comments
    if (ch === '{') {
      const startLine = line;
      const startI = i;
      i++;
      while (i < n && src[i] !== '}') {
        if (src[i] === '\n') {
          line++;
          lineStart = i + 1;
        }
        i++;
      }
      if (i >= n) err('E_UNTERMINATED_COMMENT', 'Unterminated comment', {}, startI, startLine);
      i++;
      continue;
    }
    if (ch === '(' && src[i + 1] === '*') {
      const startLine = line;
      const startI = i;
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === ')')) {
        if (src[i] === '\n') {
          line++;
          lineStart = i + 1;
        }
        i++;
      }
      if (i >= n) err('E_UNTERMINATED_COMMENT', 'Unterminated comment', {}, startI, startLine);
      i += 2;
      continue;
    }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }

    const start = i;
    const col = i - lineStart + 1;
    const push = (kind: TokKind, value: string) =>
      toks.push({ kind, value, text: src.slice(start, i), line, col, start, end: i });

    // The O/L syllabus rule: identifiers must start with a letter.
    if (ch === '_' && /[A-Za-z0-9_]/.test(src[i + 1] ?? '')) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
      err('E_IDENT_STARTS_WITH_UNDERSCORE', 'Identifier should start with a letter', { text: src.slice(i, j) }, i);
    }
    // Identifiers & keywords
    if (/[A-Za-z_]/.test(ch)) {
      while (i < n && /[A-Za-z0-9_]/.test(src[i])) i++;
      const text = src.slice(start, i);
      const lower = text.toLowerCase();
      push(KEYWORDS.has(lower) ? 'keyword' : 'ident', lower);
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch)) {
      while (i < n && /[0-9]/.test(src[i])) i++;
      let isReal = false;
      if (src[i] === '.' && /[0-9]/.test(src[i + 1] ?? '')) {
        isReal = true;
        i++;
        while (i < n && /[0-9]/.test(src[i])) i++;
      }
      if ((src[i] === 'e' || src[i] === 'E') && /[0-9]/.test(src[i + 1] === '+' || src[i + 1] === '-' ? src[i + 2] ?? '' : src[i + 1] ?? '')) {
        isReal = true;
        i++;
        if (src[i] === '+' || src[i] === '-') i++;
        while (i < n && /[0-9]/.test(src[i])) i++;
      }
      if (i < n && /[A-Za-z_]/.test(src[i])) {
        let j = i;
        while (j < n && /[A-Za-z0-9_]/.test(src[j])) j++;
        err('E_IDENT_STARTS_WITH_DIGIT', 'Identifier cannot start with a digit', { text: src.slice(start, j) }, start);
      }
      push(isReal ? 'real' : 'int', src.slice(start, i));
      continue;
    }

    // Strings (with '' escapes and #nn char codes joined)
    if (ch === "'" || ch === '#') {
      let value = '';
      while (i < n && (src[i] === "'" || src[i] === '#')) {
        if (src[i] === '#') {
          i++;
          const ds = i;
          while (i < n && /[0-9]/.test(src[i])) i++;
          if (ds === i) err('E_UNEXPECTED_CHAR', "Illegal character '#'", { char: '#' }, ds - 1);
          value += String.fromCharCode(parseInt(src.slice(ds, i), 10));
          continue;
        }
        i++; // opening quote
        for (;;) {
          if (i >= n || src[i] === '\n') err('E_UNTERMINATED_STRING', 'String exceeds line', {}, start);
          if (src[i] === "'") {
            if (src[i + 1] === "'") {
              value += "'";
              i += 2;
              continue;
            }
            i++;
            break;
          }
          value += src[i];
          i++;
        }
      }
      push('string', value);
      continue;
    }

    if (ch === '"') {
      err('E_DOUBLE_QUOTES', 'Illegal character \'"\'', {}, i);
    }

    let matched = '';
    for (const op of OPS) {
      if (src.startsWith(op, i)) {
        matched = op;
        break;
      }
    }
    if (matched) {
      i += matched.length;
      push('op', matched);
      continue;
    }
    err('E_UNEXPECTED_CHAR', `Illegal character '${ch}'`, { char: ch }, i);
  }
  toks.push({ kind: 'eof', value: '<eof>', text: '', line, col: i - lineStart + 1, start: i, end: i });
  return toks;
}
