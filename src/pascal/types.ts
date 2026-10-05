export type Ty =
  | { k: 'integer' }
  | { k: 'real' }
  | { k: 'boolean' }
  | { k: 'char' }
  | { k: 'string' }
  | { k: 'array'; lo: number; hi: number; of: Ty; open?: boolean }
  | { k: 'void' };

export const T = {
  integer: { k: 'integer' } as Ty,
  real: { k: 'real' } as Ty,
  boolean: { k: 'boolean' } as Ty,
  char: { k: 'char' } as Ty,
  string: { k: 'string' } as Ty,
  void: { k: 'void' } as Ty,
};

export const isNumeric = (t: Ty) => t.k === 'integer' || t.k === 'real';
export const isOrdinal = (t: Ty) => t.k === 'integer' || t.k === 'char' || t.k === 'boolean';
export const isTextual = (t: Ty) => t.k === 'string' || t.k === 'char';

export function tyName(t: Ty): string {
  if (t.k === 'array') return t.open ? `array of ${tyName(t.of)}` : `array[${t.lo}..${t.hi}] of ${tyName(t.of)}`;
  return t.k;
}

/** Simple name used for messages ("array" rather than full description). */
export function tyKind(t: Ty): string {
  return t.k;
}

export function sameTy(a: Ty, b: Ty): boolean {
  if (a.k !== b.k) return false;
  if (a.k === 'array' && b.k === 'array') {
    if (a.open || b.open) return sameTy(a.of, b.of);
    return a.lo === b.lo && a.hi === b.hi && sameTy(a.of, b.of);
  }
  return true;
}

/** Can a value of type `src` be stored in a variable of type `dst`? */
export function assignable(dst: Ty, src: Ty): boolean {
  if (sameTy(dst, src)) return true;
  if (dst.k === 'real' && src.k === 'integer') return true;
  if (dst.k === 'string' && src.k === 'char') return true;
  if (dst.k === 'array' && src.k === 'array' && dst.open) return assignable(dst.of, src.of) && sameTy(dst.of, src.of);
  return false;
}

export function defaultValue(t: Ty): unknown {
  switch (t.k) {
    case 'integer':
    case 'real':
      return 0;
    case 'boolean':
      return false;
    case 'char':
      return '\0';
    case 'string':
      return '';
    case 'array': {
      const size = t.open ? 0 : t.hi - t.lo + 1;
      const items = new Array(size);
      for (let i = 0; i < size; i++) items[i] = defaultValue(t.of);
      return { lo: t.lo, items } as ArrayValue;
    }
    default:
      return undefined;
  }
}

export interface ArrayValue {
  lo: number;
  items: unknown[];
}

export function isArrayValue(v: unknown): v is ArrayValue {
  return typeof v === 'object' && v !== null && 'items' in v;
}

export function cloneValue(v: unknown): unknown {
  if (isArrayValue(v)) return { lo: v.lo, items: v.items.map(cloneValue) };
  return v;
}
