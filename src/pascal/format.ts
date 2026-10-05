import type { Ty } from './types';
import { isArrayValue } from './types';

const padLeft = (s: string, width?: number) => (width && width > s.length ? ' '.repeat(width - s.length) + s : s);

/** Free Pascal style scientific notation, e.g. " 2.5000000000000000E+000". */
function scientific(v: number, width?: number): string {
  const decimals = width === undefined ? 16 : Math.max(1, width - 8);
  if (!isFinite(v)) return padLeft(isNaN(v) ? 'Nan' : v > 0 ? '+Inf' : '-Inf', width);
  const [mant, expPart] = Math.abs(v).toExponential(decimals).split('e');
  const exp = parseInt(expPart, 10);
  const expStr = (exp < 0 ? '-' : '+') + String(Math.abs(exp)).padStart(3, '0');
  const sign = v < 0 || Object.is(v, -0) ? '-' : ' ';
  return padLeft(`${sign}${mant}E${expStr}`, width);
}

function fixed(v: number, decimals: number, width?: number): string {
  let s = v.toFixed(Math.max(0, Math.min(100, decimals)));
  if (/^-0(\.0*)?$/.test(s)) s = s.slice(1);
  return padLeft(s, width);
}

/** Format a value the way write/writeln prints it. */
export function formatForWrite(v: unknown, ty: Ty, width?: number, decimals?: number): string {
  switch (ty.k) {
    case 'integer':
      return padLeft(String(v), width);
    case 'real': {
      const n = v as number;
      if (decimals !== undefined) return fixed(n, decimals, width);
      return scientific(n, width);
    }
    case 'boolean':
      return padLeft(v ? 'TRUE' : 'FALSE', width);
    case 'char':
    case 'string':
      return padLeft(String(v), width);
    default:
      return String(v);
  }
}

/** Friendly display for the visualiser / variable boxes (not exact Pascal output). */
export function displayValue(v: unknown, ty: Ty): string {
  switch (ty.k) {
    case 'integer':
      return String(v);
    case 'real': {
      const n = v as number;
      if (!isFinite(n)) return String(n);
      if (Number.isInteger(n)) return n.toFixed(1);
      return String(+n.toFixed(6));
    }
    case 'boolean':
      return v ? 'TRUE' : 'FALSE';
    case 'char': {
      const s = v as string;
      if (s === '\0' || s === '') return "''";
      return `'${s}'`;
    }
    case 'string':
      return `'${v as string}'`;
    case 'array':
      if (isArrayValue(v)) return `[${v.items.map((x) => displayValue(x, ty.of)).join(', ')}]`;
      return '[]';
    default:
      return String(v);
  }
}
