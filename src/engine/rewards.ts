import { TOPICS } from '../content';
import type { Difficulty, Question } from '../content/types';
import { ACHIEVEMENTS } from './achievements';
import { celebrate, type Celebration } from './celebrate';
import { levelFromXp, levelTitle } from './levels';
import { bump, getState, today, update, type AppState, type Attempt, type ExamRecord } from './store';

type Ev = Celebration extends infer C ? (C extends { id: number } ? Omit<C, 'id'> : never) : never;

const BASE_XP: Record<Difficulty, number> = { easy: 10, practice: 15, challenge: 25, boss: 40 };

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000);
}

function touchStreak(d: AppState, ev: Ev[]) {
  const t = today();
  const st = d.streak;
  if (st.lastDay === t) return;
  if (!st.lastDay) {
    st.current = 1;
  } else {
    const gap = daysBetween(st.lastDay, t);
    if (gap === 1) {
      st.current += 1;
      if (st.current > 1) ev.push({ kind: 'streak', days: st.current, message: `${st.current} day streak!` });
    } else if (gap === 2 && st.freezes > 0) {
      st.freezes -= 1;
      st.current += 1;
      ev.push({ kind: 'streak', days: st.current, message: `A streak shield saved your ${st.current} day streak!` });
    } else {
      bump(d, 'comebacks');
      ev.push({ kind: 'info', message: 'Welcome back! Your XP and progress are all safe. A new streak starts today.' });
      st.current = 1;
    }
  }
  st.lastDay = t;
  st.best = Math.max(st.best, st.current);
  if (st.current > 0 && st.current % 7 === 0 && st.lastFreezeEarned !== t) {
    st.freezes = Math.min(2, st.freezes + 1);
    st.lastFreezeEarned = t;
  }
}

function gain(d: AppState, amount: number, reason: string, ev: Ev[]) {
  if (amount <= 0) return;
  touchStreak(d, ev);
  const t = today();
  const before = d.dailyXp[t] ?? 0;
  d.xp += amount;
  d.dailyXp[t] = before + amount;
  ev.push({ kind: 'xp', amount, reason });
  if (before < d.profile.dailyGoal && before + amount >= d.profile.dailyGoal) {
    bump(d, 'goalsHit');
    d.xp += 20;
    d.dailyXp[t] += 20;
    ev.push({ kind: 'goal' });
  }
}

/** Apply a state change, then award achievements and fire celebrations. */
function apply(recipe: (d: AppState, ev: Ev[]) => void): number {
  const before = getState();
  const ev: Ev[] = [];
  update((d) => {
    recipe(d, ev);
    for (const a of ACHIEVEMENTS) {
      if (!d.achievements[a.id] && a.test(d)) {
        d.achievements[a.id] = Date.now();
        ev.push({ kind: 'achievement', achId: a.id });
        d.xp += 25;
      }
    }
  });
  const after = getState();
  const l0 = levelFromXp(before.xp);
  const l1 = levelFromXp(after.xp);
  if (l1 > l0) ev.push({ kind: 'level', level: l1, title: levelTitle(l1) });
  ev.forEach((e) => celebrate(e));
  return after.xp - before.xp;
}

export interface AnswerOutcome {
  correct: boolean;
  hints: number;
  tries: number;
  mode: NonNullable<Attempt['m']>;
}

export function attemptScore(o: AnswerOutcome) {
  if (!o.correct) return 0;
  if (o.tries > 1) return 0.5;
  if (o.hints > 0) return 0.7;
  return 1;
}

/** Records an answer, returns XP earned. Only call once per question per session. */
export function recordAnswer(q: Question, o: AnswerOutcome): number {
  let earned = 0;
  apply((d, ev) => {
    const c = attemptScore(o);
    d.attempts.push({ q: q.id, t: q.topic, s: q.skill, d: q.difficulty, c, h: o.hints, ts: Date.now(), m: o.mode });
    const st = d.qstats[q.id] ?? { seen: 0, right: 0, last: 0, lastRight: false };
    const solvedBefore = st.right > 0;
    st.seen++;
    st.last = Date.now();
    st.lastRight = o.correct;
    if (o.correct) st.right++;
    d.qstats[q.id] = st;
    if (!o.correct) return;
    if (q.type === 'fix' || q.type === 'spot') bump(d, 'bugsFixed');
    if (q.type === 'write' || q.type === 'fix') bump(d, 'programsPassed');
    if ((q.difficulty === 'challenge' || q.difficulty === 'boss') && o.tries === 1 && o.hints === 0) bump(d, 'cleanChallenges');
    let xp = BASE_XP[q.difficulty] * (o.tries > 1 ? 0.5 : o.hints > 0 ? 0.6 : 1);
    if (solvedBefore) xp = Math.max(2, xp * 0.3);
    earned = Math.round(xp);
    gain(d, earned, 'Correct answer', ev);
  });
  return earned;
}

export function saveLessonStep(topicId: string, step: number) {
  update((d) => {
    const l = d.lessons[topicId] ?? { step: 0, done: false };
    l.step = Math.max(l.step, step);
    d.lessons[topicId] = l;
  });
}

export function completeLesson(topicId: string) {
  return apply((d, ev) => {
    const l = d.lessons[topicId] ?? { step: 0, done: false };
    const first = !l.done;
    l.done = true;
    l.step = TOPICS[topicId].lesson.length;
    l.doneAt = l.doneAt ?? Date.now();
    d.lessons[topicId] = l;
    if (first) gain(d, 40, 'Lesson complete', ev);
  });
}

export function recordCheck(topicId: string, pct: number) {
  return apply((d, ev) => {
    const ch = d.checks[topicId] ?? { best: 0, tries: 0 };
    ch.tries++;
    ch.best = Math.max(ch.best, pct);
    const passed = pct >= 80;
    if (passed && !ch.passedAt) {
      ch.passedAt = Date.now();
      gain(d, 100, 'Topic mastered', ev);
    } else if (passed) {
      gain(d, 20, 'Mastery check passed', ev);
    }
    d.checks[topicId] = ch;
  });
}

export function recordRun(opts: { lab: boolean; ok: boolean }) {
  apply((d) => {
    bump(d, 'runs');
    if (opts.lab) bump(d, 'labRuns');
    if (opts.ok) bump(d, 'okRuns');
  });
}

export function recordVisualise() {
  apply((d) => bump(d, 'visualised'));
}

export function completeRevision(topicId: string) {
  return apply((d, ev) => {
    const t = today();
    const last = d.revisionsDone[topicId];
    d.revisionsDone[topicId] = Date.now();
    if (!last || today(new Date(last)) !== t) gain(d, 15, 'Revision complete', ev);
  });
}

export function completeDaily(ok: boolean) {
  return apply((d, ev) => {
    const t = today();
    if (d.daily[t]) return;
    d.daily[t] = ok;
    if (ok) gain(d, 50, 'Daily challenge', ev);
  });
}

export function bossStageDone(bossId: string, stage: number, total: number) {
  return apply((d, ev) => {
    const b = d.bosses[bossId] ?? { stage: 0, done: false };
    if (stage + 1 > b.stage) {
      b.stage = stage + 1;
      gain(d, 40, 'Boss stage cleared', ev);
    }
    if (b.stage >= total && !b.done) {
      b.done = true;
      b.doneAt = Date.now();
      gain(d, 100, 'Boss defeated', ev);
    }
    d.bosses[bossId] = b;
  });
}

export function recordExam(rec: Omit<ExamRecord, 'ts'>) {
  return apply((d, ev) => {
    d.exams.push({ ...rec, ts: Date.now() });
    const pct = rec.score / Math.max(1, rec.max);
    const base = rec.kind === 'mock' ? 100 : rec.kind === 'timed' ? 40 : 30;
    gain(d, Math.round(base * (0.4 + 0.6 * pct)), rec.kind === 'mock' ? 'Mock exam finished' : 'Exam practice finished', ev);
  });
}

export function recordGame(gameId: string, score: number, xp: number) {
  return apply((d, ev) => {
    const g = d.games[gameId] ?? { best: 0, plays: 0 };
    g.plays++;
    g.best = Math.max(g.best, score);
    d.games[gameId] = g;
    gain(d, xp, 'Game played', ev);
  });
}

export function setOnboarding(confidence: 'new' | 'basics' | 'coder') {
  update((d) => {
    d.profile.onboarded = true;
    d.profile.confidence = confidence;
    d.profile.unlockAll = confidence !== 'new';
  });
}

export function markOnboarded() {
  update((d) => {
    d.profile.onboarded = true;
  });
}
