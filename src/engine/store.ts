import { useSyncExternalStore } from 'react';
import type { Difficulty, Skill } from '../content/types';

/**
 * All learner progress lives in the browser (localStorage). No accounts.
 * The state is versioned so it can be migrated when the shape changes.
 */

export interface Attempt {
  q: string;
  t: string; // topic
  s: Skill;
  d: Difficulty;
  /** 1 correct first try, 0.7 correct with hints, 0.5 correct after retry, 0 wrong */
  c: number;
  h: number; // hints used
  ts: number;
  m?: 'practice' | 'check' | 'exam' | 'lesson' | 'game' | 'review' | 'daily' | 'boss';
}

export interface QStat {
  seen: number;
  right: number;
  last: number; // ts
  lastRight: boolean;
}

export interface ExamRecord {
  kind: 'mock' | 'timed' | 'structured';
  score: number;
  max: number;
  ts: number;
  seconds: number;
}

export interface Profile {
  createdAt: number;
  onboarded: boolean;
  confidence?: 'new' | 'basics' | 'coder';
  unlockAll: boolean;
  dailyGoal: number;
  theme: 'system' | 'light' | 'dark';
  locale: 'en';
  sound: boolean;
}

export interface AppState {
  version: 1;
  profile: Profile;
  xp: number;
  dailyXp: Record<string, number>;
  streak: { current: number; best: number; lastDay: string | null; freezes: number; lastFreezeEarned: string | null };
  lessons: Record<string, { step: number; done: boolean; doneAt?: number }>;
  attempts: Attempt[];
  qstats: Record<string, QStat>;
  checks: Record<string, { best: number; passedAt?: number; tries: number }>;
  bosses: Record<string, { stage: number; done: boolean; doneAt?: number }>;
  exams: ExamRecord[];
  achievements: Record<string, number>;
  counters: Record<string, number>;
  revisionsDone: Record<string, number>;
  daily: Record<string, boolean>;
  games: Record<string, { best: number; plays: number }>;
  lab: { code: string; snippets: Array<{ name: string; code: string; ts: number }> };
  lastPath: string | null;
}

const KEY = 'pascalpath:v1';

export function today(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function initialState(): AppState {
  return {
    version: 1,
    profile: { createdAt: Date.now(), onboarded: false, unlockAll: false, dailyGoal: 50, theme: 'system', locale: 'en', sound: true },
    xp: 0,
    dailyXp: {},
    streak: { current: 0, best: 0, lastDay: null, freezes: 0, lastFreezeEarned: null },
    lessons: {},
    attempts: [],
    qstats: {},
    checks: {},
    bosses: {},
    exams: [],
    achievements: {},
    counters: {},
    revisionsDone: {},
    daily: {},
    games: {},
    lab: { code: '', snippets: [] },
    lastPath: null,
  };
}

let storageOk = true;

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return initialState();
    // Merge with defaults so newly-added fields exist.
    const base = initialState();
    return { ...base, ...parsed, profile: { ...base.profile, ...parsed.profile }, streak: { ...base.streak, ...parsed.streak }, lab: { ...base.lab, ...parsed.lab } };
  } catch {
    storageOk = false;
    return initialState();
  }
}

let state: AppState = typeof localStorage === 'undefined' ? initialState() : load();
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      storageOk = true;
    } catch {
      storageOk = false;
    }
  }, 150);
}

export function isStorageAvailable() {
  return storageOk;
}

export function getState(): AppState {
  return state;
}

/** Update state with a mutating recipe applied to a copy. */
export function update(recipe: (draft: AppState) => void) {
  const draft = structuredClone(state);
  recipe(draft);
  if (draft.attempts.length > 3000) draft.attempts = draft.attempts.slice(-3000);
  state = draft;
  persist();
  listeners.forEach((l) => l());
}

export function replaceState(next: AppState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function exportProgress(): string {
  return JSON.stringify({ app: 'pascalpath', exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importProgress(json: string): boolean {
  try {
    const data = JSON.parse(json);
    const s = (data.state ?? data) as AppState;
    if (s.version !== 1 || typeof s.xp !== 'number') return false;
    const base = initialState();
    replaceState({ ...base, ...s, profile: { ...base.profile, ...s.profile } });
    return true;
  } catch {
    return false;
  }
}

export function resetProgress() {
  replaceState(initialState());
}

export function bump(draft: AppState, counter: string, by = 1) {
  draft.counters[counter] = (draft.counters[counter] ?? 0) + by;
}
