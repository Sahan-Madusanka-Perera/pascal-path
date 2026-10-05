import type { Boss, Question, Topic, Unit } from './types';
import u1 from './units/u1-getting-started';
import u2 from './units/u2-data';
import u3 from './units/u3-operators';
import u4 from './units/u4-decisions';
import u5 from './units/u5-loops';
import u6 from './units/u6-together';
import u7 from './units/u7-arrays';
import u8 from './units/u8-subprograms';
import u9 from './units/u9-theory';

export interface UnitModule {
  unit: Unit;
  topics: Topic[];
  questions: Question[];
  boss?: Boss;
}

const MODULES: UnitModule[] = [u1, u2, u3, u4, u5, u6, u7, u8, u9];

export const UNITS: Unit[] = MODULES.map((m) => m.unit);
export const TOPICS: Record<string, Topic> = Object.fromEntries(MODULES.flatMap((m) => m.topics.map((t) => [t.id, t])));
export const TOPIC_ORDER: string[] = UNITS.flatMap((u) => u.topics);
export const QUESTIONS: Record<string, Question> = Object.fromEntries(MODULES.flatMap((m) => m.questions.map((q) => [q.id, q])));
export const ALL_QUESTIONS: Question[] = MODULES.flatMap((m) => m.questions);
export const BOSSES: Record<string, Boss> = Object.fromEntries(MODULES.filter((m) => m.boss).map((m) => [m.boss!.id, m.boss!]));

const byTopic = new Map<string, Question[]>();
for (const q of ALL_QUESTIONS) {
  if (!byTopic.has(q.topic)) byTopic.set(q.topic, []);
  byTopic.get(q.topic)!.push(q);
}

export function questionsForTopic(topicId: string): Question[] {
  return byTopic.get(topicId) ?? [];
}

export function unitOf(topicId: string): Unit {
  return UNITS.find((u) => u.topics.includes(topicId))!;
}

export function topicIndex(topicId: string) {
  return TOPIC_ORDER.indexOf(topicId);
}

export function isTheoryTopic(topicId: string) {
  return !!unitOf(topicId)?.theory;
}

export { MODULES };
