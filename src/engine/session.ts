import { ALL_QUESTIONS, isTheoryTopic, QUESTIONS, questionsForTopic, TOPIC_ORDER } from '../content';
import type { Difficulty, Question } from '../content/types';
import { dueForReview, weakAreas } from './progress';
import type { AppState } from './store';

export type SessionMode = 'topic' | 'weak' | 'check' | 'random' | 'challenge' | 'review' | 'timed' | 'mock' | 'output' | 'daily';

export interface SessionSpec {
  mode: SessionMode;
  title: string;
  questions: Question[];
  /** Show feedback after each question (false = exam conditions). */
  feedback: boolean;
  hints: boolean;
  /** Seconds, if timed. */
  timeLimit?: number;
  topic?: string;
  /** Requeue wrong answers once at the end. */
  retryWrong: boolean;
}

const DIFF_RANK: Record<Difficulty, number> = { easy: 0, practice: 1, challenge: 2, boss: 3 };
const HANDS_ON = new Set(['write', 'fix', 'fill', 'arrange', 'trace', 'output']);

export function shuffle<T>(arr: T[], rnd = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Lower = should be asked sooner. Unseen first, then previously wrong, then oldest. */
function priority(s: AppState, q: Question): number {
  const st = s.qstats[q.id];
  if (!st) return 0;
  if (!st.lastRight) return 1;
  const ageDays = (Date.now() - st.last) / 86400000;
  return 3 - Math.min(1.5, ageDays / 7);
}

function pickBy(s: AppState, pool: Question[], n: number): Question[] {
  return shuffle(pool)
    .sort((a, b) => priority(s, a) - priority(s, b))
    .slice(0, n);
}

function learnedTopics(s: AppState): string[] {
  const learned = TOPIC_ORDER.filter((t) => s.lessons[t]?.done);
  return learned.length ? learned : TOPIC_ORDER.slice(0, 3);
}

export function buildSession(s: AppState, mode: SessionMode, topic?: string): SessionSpec {
  switch (mode) {
    case 'topic': {
      const pool = questionsForTopic(topic!);
      const easy = pickBy(s, pool.filter((q) => q.difficulty === 'easy'), 2);
      const practice = pickBy(s, pool.filter((q) => q.difficulty === 'practice'), 3);
      const challenge = pickBy(s, pool.filter((q) => q.difficulty === 'challenge'), 1);
      let qs = [...easy, ...practice, ...challenge];
      if (qs.length < 6) qs = [...qs, ...pickBy(s, pool.filter((q) => !qs.includes(q)), 6 - qs.length)];
      qs.sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]);
      return { mode, title: 'Practice', questions: qs, feedback: true, hints: true, topic, retryWrong: true };
    }
    case 'weak': {
      const t = topic ?? weakAreas(s)[0]?.topicId ?? learnedTopics(s)[0];
      const pool = questionsForTopic(t);
      const easy = pickBy(s, pool.filter((q) => q.difficulty === 'easy'), 3);
      const more = pickBy(s, pool.filter((q) => q.difficulty === 'practice'), 2);
      return { mode, title: 'Strengthen', questions: [...easy, ...more], feedback: true, hints: true, topic: t, retryWrong: true };
    }
    case 'check': {
      const pool = questionsForTopic(topic!);
      const take = (d: Difficulty[], n: number, exclude: Question[]) => pickBy(s, pool.filter((q) => d.includes(q.difficulty) && !exclude.includes(q)), n);
      const chosen: Question[] = [];
      chosen.push(...take(['easy'], 1, chosen));
      chosen.push(...take(['practice'], 2, chosen));
      chosen.push(...take(['challenge'], 2, chosen));
      if (chosen.length < 5) chosen.push(...take(['easy', 'practice', 'challenge'], 5 - chosen.length, chosen));
      if (!isTheoryTopic(topic!) && !chosen.some((q) => HANDS_ON.has(q.type))) {
        const h = pickBy(s, pool.filter((q) => HANDS_ON.has(q.type) && !chosen.includes(q)), 1);
        if (h.length) chosen[chosen.length - 1] = h[0];
      }
      chosen.sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]);
      return { mode, title: 'Mastery check', questions: chosen, feedback: true, hints: true, topic, retryWrong: false };
    }
    case 'random': {
      const topics = new Set(learnedTopics(s));
      const pool = ALL_QUESTIONS.filter((q) => topics.has(q.topic) && q.difficulty !== 'boss');
      const qs = pickBy(s, pool, 8).sort((a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty]);
      return { mode, title: 'Random mix', questions: qs, feedback: true, hints: true, retryWrong: true };
    }
    case 'challenge': {
      if (topic) {
        const pool = questionsForTopic(topic).filter((q) => q.difficulty === 'challenge' || q.difficulty === 'boss');
        return { mode, title: 'Challenge', questions: pickBy(s, pool, 4), feedback: true, hints: true, topic, retryWrong: false };
      }
      const topics = new Set(learnedTopics(s));
      const pool = ALL_QUESTIONS.filter((q) => topics.has(q.topic) && (q.difficulty === 'challenge' || q.difficulty === 'boss'));
      return { mode, title: 'Challenge mode', questions: pickBy(s, pool, 5), feedback: true, hints: true, retryWrong: false };
    }
    case 'review': {
      const due = dueForReview(s);
      const wrongIds = Object.entries(s.qstats)
        .filter(([, st]) => !st.lastRight)
        .map(([id]) => QUESTIONS[id])
        .filter(Boolean);
      const fromDue = due.flatMap((t) => pickBy(s, questionsForTopic(t).filter((q) => q.difficulty !== 'boss'), 2));
      let qs = [...shuffle(wrongIds).slice(0, 4), ...fromDue].slice(0, 8);
      if (qs.length < 5) {
        const topics = new Set(learnedTopics(s));
        qs = [...qs, ...pickBy(s, ALL_QUESTIONS.filter((q) => topics.has(q.topic) && !qs.includes(q)), 6 - qs.length)];
      }
      return { mode, title: 'Smart review', questions: qs, feedback: true, hints: true, retryWrong: true };
    }
    case 'output': {
      const pool = ALL_QUESTIONS.filter((q) => q.type === 'output' || (q.type === 'mcq' && q.code && q.exam));
      return { mode, title: 'Output questions', questions: pickBy(s, pool, 8), feedback: true, hints: true, retryWrong: false };
    }
    case 'timed': {
      const pool = ALL_QUESTIONS.filter((q) => q.exam && (q.type === 'mcq' || q.type === 'output'));
      return { mode, title: 'Timed practice', questions: shuffle(pool).slice(0, 10), feedback: false, hints: false, timeLimit: 12 * 60, retryWrong: false };
    }
    case 'mock': {
      return buildMock(s);
    }
    case 'daily':
      return { mode, title: 'Daily challenge', questions: [dailyQuestion()], feedback: true, hints: true, retryWrong: false };
  }
}

/** Mock exam section A: exam-style auto-marked questions across the whole syllabus. */
export function buildMock(_s: AppState): SessionSpec {
  const exam = ALL_QUESTIONS.filter((q) => q.exam && q.type !== 'write' && q.type !== 'fix');
  const byUnitTopic = new Map<string, Question[]>();
  for (const q of exam) {
    if (!byUnitTopic.has(q.topic)) byUnitTopic.set(q.topic, []);
    byUnitTopic.get(q.topic)!.push(q);
  }
  // At least one question from each topic, then fill to 25.
  const chosen: Question[] = [];
  for (const t of TOPIC_ORDER) {
    const list = byUnitTopic.get(t);
    if (list?.length) chosen.push(shuffle(list)[0]);
  }
  const rest = shuffle(exam.filter((q) => !chosen.includes(q)));
  while (chosen.length < 25 && rest.length) chosen.push(rest.shift()!);
  const ordered = TOPIC_ORDER.flatMap((t) => chosen.filter((q) => q.topic === t));
  return { mode: 'mock', title: 'Mock exam', questions: ordered.slice(0, 25), feedback: false, hints: false, timeLimit: 40 * 60, retryWrong: false };
}

/** Deterministic daily challenge: same for everyone on a given date. */
export function dailyQuestion(date = new Date()): Question {
  const pool = ALL_QUESTIONS.filter((q) => (q.difficulty === 'challenge' || q.difficulty === 'practice') && ['write', 'output', 'fix', 'trace', 'arrange'].includes(q.type));
  const key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const rnd = seeded(key * 2654435761);
  return pool[Math.floor(rnd() * pool.length)];
}
