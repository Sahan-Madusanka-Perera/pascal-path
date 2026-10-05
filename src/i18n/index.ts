import { en, type Messages } from './en';

/**
 * Minimal translation layer. UI chrome strings live in per-locale dictionaries;
 * learning content lives in src/content (and can get per-locale copies later).
 * To add Sinhala: create si.ts with the same keys and register it below.
 */
const dictionaries: Record<string, Messages> = { en };
let locale = 'en';

export function setLocale(l: string) {
  if (dictionaries[l]) locale = l;
}

type Key = keyof Messages;

export function t(key: Key, params?: Record<string, string | number>): string {
  const msg = (dictionaries[locale] as Messages)[key] ?? en[key] ?? key;
  if (!params) return msg;
  return msg.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

export function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}
