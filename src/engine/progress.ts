import { BOSSES, questionsForTopic, TOPIC_ORDER, TOPICS, UNITS, unitOf } from '../content';
import type { Difficulty, Skill } from '../content/types';
import type { AppState, Attempt } from './store';
import { today } from './store';

const W: Record<Difficulty, number> = { easy: 1, practice: 1.5, challenge: 2, boss: 3 };

/** Latest attempt per question for a filter, newest first. */
function latestPerQuestion(attempts: Attempt[], pred: (a: Attempt) => boolean, limit = 15): Attempt[] {
  const seen = new Set<string>();
  const out: Attempt[] = [];
  for (let i = attempts.length - 1; i >= 0 && out.length < limit; i--) {
    const a = attempts[i];
    if (!pred(a) || seen.has(a.q)) continue;
    seen.add(a.q);
    out.push(a);
  }
  return out;
}

export interface Strength {
  /** 0..100 combined accuracy × coverage — "I can actually do this". */
  score: number;
  /** 0..1 accuracy over recent distinct questions. */
  accuracy: number;
  /** Distinct questions attempted recently. */
  count: number;
}

function strengthOf(list: Attempt[], target: number): Strength {
  if (!list.length) return { score: 0, accuracy: 0, count: 0 };
  let sw = 0;
  let sc = 0;
  let evidence = 0;
  for (const a of list) {
    const w = W[a.d] ?? 1;
    sw += w;
    sc += w * a.c;
    if (a.c >= 0.5) evidence += w;
  }
  const accuracy = sc / sw;
  const coverage = Math.min(1, evidence / target);
  return { score: Math.round(100 * accuracy * coverage), accuracy, count: list.length };
}

export function topicStrength(s: AppState, topicId: string): Strength {
  const list = latestPerQuestion(s.attempts, (a) => a.t === topicId);
  return strengthOf(list, 6);
}

export function skillStrength(s: AppState, topicId: string, skill: Skill): Strength {
  const list = latestPerQuestion(s.attempts, (a) => a.t === topicId && a.s === skill, 10);
  return strengthOf(list, 3);
}

export type TopicStatus = 'locked' | 'available' | 'learning' | 'learned' | 'mastered';

export function isUnlocked(s: AppState, topicId: string): boolean {
  if (s.profile.unlockAll) return true;
  const i = TOPIC_ORDER.indexOf(topicId);
  if (i <= 0) return true;
  return !!s.lessons[TOPIC_ORDER[i - 1]]?.done;
}

export function topicStatus(s: AppState, topicId: string): TopicStatus {
  if (s.checks[topicId]?.passedAt) return 'mastered';
  const l = s.lessons[topicId];
  if (l?.done) return 'learned';
  if (l && l.step > 0) return 'learning';
  return isUnlocked(s, topicId) ? 'available' : 'locked';
}

/** 0..1 progress for a topic: lesson 40%, strength 40%, mastery check 20%. */
export function topicProgress(s: AppState, topicId: string): number {
  const lesson = s.lessons[topicId];
  const lessonPart = lesson?.done ? 1 : lesson ? Math.min(0.9, lesson.step / Math.max(1, TOPICS[topicId].lesson.length)) : 0;
  const strength = topicStrength(s, topicId).score / 100;
  const mastered = s.checks[topicId]?.passedAt ? 1 : 0;
  return Math.min(1, 0.4 * lessonPart + 0.4 * Math.max(strength, mastered ? 0.8 : 0) + 0.2 * mastered);
}

export function unitProgress(s: AppState, unitId: string) {
  const u = UNITS.find((x) => x.id === unitId)!;
  const vals = u.topics.map((t) => topicProgress(s, t));
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function overallProgress(s: AppState) {
  const vals = TOPIC_ORDER.map((t) => topicProgress(s, t));
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Where "Continue learning" should go. */
export function currentTopic(s: AppState): { topicId: string; mode: 'lesson' | 'practice' | 'check' } | null {
  for (const t of TOPIC_ORDER) {
    if (!s.lessons[t]?.done && isUnlocked(s, t)) return { topicId: t, mode: 'lesson' };
  }
  for (const t of TOPIC_ORDER) {
    if (!s.checks[t]?.passedAt) return { topicId: t, mode: topicStrength(s, t).count >= 4 ? 'check' : 'practice' };
  }
  return null;
}

// ---------- readiness ----------
const topicsWithSkill = (skill: Skill) => TOPIC_ORDER.filter((t) => questionsForTopic(t).some((q) => q.skill === skill));

export interface Readiness {
  overall: number;
  concepts: number;
  coding: number;
  problem: number;
  exam: number;
}

export function readiness(s: AppState): Readiness {
  const avg = (skill: Skill) => {
    const ts = topicsWithSkill(skill);
    if (!ts.length) return 0;
    return ts.reduce((sum, t) => sum + skillStrength(s, t, skill).score, 0) / ts.length;
  };
  const concepts = avg('concept');
  const coding = avg('coding');
  const problem = avg('problem');
  const recentExams = s.exams.slice(-3);
  const examScores = recentExams.map((e) => (100 * e.score) / Math.max(1, e.max));
  const examAttempts = latestPerQuestion(s.attempts, (a) => a.m === 'exam', 40);
  const examAcc = examAttempts.length ? (100 * examAttempts.reduce((x, a) => x + a.c, 0)) / examAttempts.length : 0;
  const coverage = Math.min(1, examAttempts.length / 30);
  const exam = examScores.length
    ? 0.7 * (examScores.reduce((a, b) => a + b, 0) / examScores.length) + 0.3 * examAcc * coverage
    : examAcc * coverage * 0.8;
  const overall = 0.25 * concepts + 0.3 * coding + 0.25 * problem + 0.2 * exam;
  return { overall: Math.round(overall), concepts: Math.round(concepts), coding: Math.round(coding), problem: Math.round(problem), exam: Math.round(exam) };
}

// ---------- weak areas ----------
export interface WeakArea {
  topicId: string;
  accuracy: number;
  count: number;
}

export function weakAreas(s: AppState): WeakArea[] {
  const out: WeakArea[] = [];
  for (const t of TOPIC_ORDER) {
    const recent = s.attempts.filter((a) => a.t === t).slice(-8);
    if (recent.length < 3) continue;
    const acc = recent.reduce((x, a) => x + a.c, 0) / recent.length;
    if (acc < 0.6) out.push({ topicId: t, accuracy: acc, count: recent.length });
  }
  return out.sort((a, b) => a.accuracy - b.accuracy);
}

export function strongTopics(s: AppState): string[] {
  return TOPIC_ORDER.filter((t) => {
    const recent = s.attempts.filter((a) => a.t === t).slice(-6);
    return recent.length >= 5 && recent.reduce((x, a) => x + a.c, 0) / recent.length >= 0.85;
  });
}

/** Topics due for spaced review: learned, practised, not touched for a while. */
export function dueForReview(s: AppState): string[] {
  const now = Date.now();
  const DAY = 86400000;
  return TOPIC_ORDER.filter((t) => {
    if (!s.lessons[t]?.done) return false;
    const last = [...s.attempts].reverse().find((a) => a.t === t);
    if (!last) return false;
    const mastered = !!s.checks[t]?.passedAt;
    const gap = mastered ? 4 * DAY : 2 * DAY;
    return now - last.ts > gap;
  });
}

export function bossAvailable(s: AppState, unitId: string): boolean {
  const u = UNITS.find((x) => x.id === unitId);
  if (!u?.boss) return false;
  return s.profile.unlockAll || u.topics.every((t) => s.lessons[t]?.done);
}

// ---------- recommendations ----------
export interface Rec {
  id: string;
  kind: 'continue' | 'weak' | 'review' | 'check' | 'daily' | 'boss' | 'exam' | 'practice' | 'stretch';
  title: string;
  subtitle: string;
  to: string;
}

export function recommendations(s: AppState): Rec[] {
  const recs: Rec[] = [];
  const weak = weakAreas(s);
  for (const w of weak.slice(0, 2)) {
    const t = TOPICS[w.topicId];
    recs.push({
      id: 'weak-' + w.topicId,
      kind: 'weak',
      title: `Strengthen ${t.title}`,
      subtitle: `You seem to be finding ${t.title.toLowerCase()} tricky. Try 3 easier questions to rebuild confidence.`,
      to: `/practice/session?mode=weak&topic=${w.topicId}`,
    });
  }
  // Learned but not yet checked
  for (const t of TOPIC_ORDER) {
    if (s.lessons[t]?.done && !s.checks[t]?.passedAt && !weak.some((w) => w.topicId === t)) {
      const st = topicStrength(s, t);
      if (st.count >= 4) {
        recs.push({ id: 'check-' + t, kind: 'check', title: `Mastery check: ${TOPICS[t].title}`, subtitle: 'Prove you can do it — 5 questions, pass with 80%.', to: `/practice/session?mode=check&topic=${t}` });
      } else {
        recs.push({ id: 'practice-' + t, kind: 'practice', title: `Practise ${TOPICS[t].title}`, subtitle: 'You finished the lesson. Now lock it in with practice.', to: `/practice/session?mode=topic&topic=${t}` });
      }
      if (recs.length >= 4) break;
    }
  }
  const strong = strongTopics(s);
  if (strong.length >= 2 && !weak.length) {
    recs.push({ id: 'stretch', kind: 'stretch', title: 'Mixed challenge', subtitle: `${TOPICS[strong[strong.length - 1]].title} looks strong! Ready for harder mixed questions?`, to: '/practice/session?mode=challenge' });
  }
  const due = dueForReview(s);
  if (due.length) {
    recs.push({ id: 'review', kind: 'review', title: 'Quick review', subtitle: `Refresh ${due.slice(0, 2).map((t) => TOPICS[t].title).join(' and ')} so you don't forget.`, to: '/practice/session?mode=review' });
  }
  if (!s.daily[today()]) recs.push({ id: 'daily', kind: 'daily', title: "Today's challenge", subtitle: 'One problem a day keeps your skills sharp. +50 XP', to: '/challenges/daily' });
  for (const u of UNITS) {
    if (u.boss && bossAvailable(s, u.id) && !s.bosses[u.boss]?.done) {
      recs.push({ id: 'boss-' + u.boss, kind: 'boss', title: `Boss battle: ${BOSSES[u.boss].title}`, subtitle: `Use everything from ${u.title} to win.`, to: `/challenges/boss/${u.boss}` });
      break;
    }
  }
  const learned = TOPIC_ORDER.filter((t) => s.lessons[t]?.done).length;
  if (learned >= TOPIC_ORDER.length * 0.5) {
    recs.push({ id: 'exam', kind: 'exam', title: 'Timed exam practice', subtitle: '10 exam-style questions in 12 minutes.', to: '/exam/timed' });
  }
  return recs;
}

export function unitForTopic(topicId: string) {
  return unitOf(topicId);
}
