import { BOSSES, UNITS } from '../content';
import type { AppState } from './store';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Progress towards it: [current, target] */
  progress?: (s: AppState) => [number, number];
  test: (s: AppState) => boolean;
}

const correctCount = (s: AppState) => Object.values(s.qstats).filter((q) => q.right > 0).length;
const unitMastered = (s: AppState, unitId: string) => {
  const u = UNITS.find((x) => x.id === unitId);
  return !!u && u.topics.length > 0 && u.topics.every((t) => s.checks[t]?.passedAt);
};
const unitProgressCount = (s: AppState, unitId: string): [number, number] => {
  const u = UNITS.find((x) => x.id === unitId)!;
  return [u.topics.filter((t) => s.checks[t]?.passedAt).length, u.topics.length];
};
const c = (s: AppState, k: string) => s.counters[k] ?? 0;

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-run', title: 'Hello, World!', description: 'Run your first Pascal program.', icon: 'hand', test: (s) => c(s, 'runs') >= 1 },
  { id: 'first-lesson', title: 'First Steps', description: 'Finish your first lesson.', icon: 'footprints', test: (s) => Object.values(s.lessons).some((l) => l.done) },
  { id: 'first-program', title: 'First Program', description: 'Write a program that passes all its tests.', icon: 'puzzle', test: (s) => c(s, 'programsPassed') >= 1 },
  { id: 'solve-10', title: 'Warming Up', description: 'Answer 10 different questions correctly.', icon: 'flame', progress: (s) => [correctCount(s), 10], test: (s) => correctCount(s) >= 10 },
  { id: 'solve-50', title: 'On a Roll', description: 'Answer 50 different questions correctly.', icon: 'target', progress: (s) => [correctCount(s), 50], test: (s) => correctCount(s) >= 50 },
  { id: 'solve-150', title: 'Practice Machine', description: 'Answer 150 different questions correctly.', icon: 'cog', progress: (s) => [correctCount(s), 150], test: (s) => correctCount(s) >= 150 },
  { id: 'debugger', title: 'Debugger', description: 'Find or fix 5 bugs.', icon: 'bug', progress: (s) => [c(s, 'bugsFixed'), 5], test: (s) => c(s, 'bugsFixed') >= 5 },
  { id: 'no-hints', title: 'No Hints Needed', description: 'Solve a challenge question first try without hints.', icon: 'brain', test: (s) => c(s, 'cleanChallenges') >= 1 },
  { id: 'look-inside', title: 'Look Inside', description: 'Use "Show me what happened" to watch a program run.', icon: 'search', test: (s) => c(s, 'visualised') >= 1 },
  { id: 'experimenter', title: 'Experimenter', description: 'Run 25 programs in the Code Lab.', icon: 'flask', progress: (s) => [c(s, 'labRuns'), 25], test: (s) => c(s, 'labRuns') >= 25 },
  { id: 'decision-maker', title: 'Decision Maker', description: 'Master every topic in Making Decisions.', icon: 'split', progress: (s) => unitProgressCount(s, 'u4'), test: (s) => unitMastered(s, 'u4') },
  { id: 'loop-master', title: 'Loop Master', description: 'Master every loop topic.', icon: 'repeat', progress: (s) => unitProgressCount(s, 'u5'), test: (s) => unitMastered(s, 'u5') },
  { id: 'array-explorer', title: 'Array Explorer', description: 'Master both array topics.', icon: 'train', progress: (s) => unitProgressCount(s, 'u7'), test: (s) => unitMastered(s, 'u7') },
  { id: 'modular', title: 'Modular Thinker', description: 'Master procedures and functions.', icon: 'blocks', progress: (s) => unitProgressCount(s, 'u8'), test: (s) => unitMastered(s, 'u8') },
  { id: 'theory', title: 'Theory Whiz', description: 'Master languages, paradigms and translators.', icon: 'book', progress: (s) => unitProgressCount(s, 'u9'), test: (s) => unitMastered(s, 'u9') },
  { id: 'perfect', title: 'Perfectionist', description: 'Score 100% on a mastery check.', icon: 'percent', test: (s) => Object.values(s.checks).some((x) => x.best >= 100) },
  { id: 'boss-1', title: 'Boss Slayer', description: 'Defeat your first boss.', icon: 'swords', test: (s) => Object.values(s.bosses).some((b) => b.done) },
  { id: 'boss-all', title: 'Unstoppable', description: 'Defeat every boss.', icon: 'crown', progress: (s) => [Object.values(s.bosses).filter((b) => b.done).length, Object.keys(BOSSES).length], test: (s) => Object.keys(BOSSES).length > 0 && Object.keys(BOSSES).every((b) => s.bosses[b]?.done) },
  { id: 'streak-3', title: 'Getting Into It', description: 'Practise 3 days in a row.', icon: 'calendar', progress: (s) => [s.streak.best, 3], test: (s) => s.streak.best >= 3 },
  { id: 'streak-7', title: 'Week Warrior', description: 'Practise 7 days in a row.', icon: 'calendar-check', progress: (s) => [s.streak.best, 7], test: (s) => s.streak.best >= 7 },
  { id: 'streak-30', title: 'Habit Formed', description: 'Practise 30 days in a row.', icon: 'medal', progress: (s) => [s.streak.best, 30], test: (s) => s.streak.best >= 30 },
  { id: 'goal', title: 'Goal Getter', description: 'Reach your daily XP goal.', icon: 'check', test: (s) => c(s, 'goalsHit') >= 1 },
  { id: 'daily-5', title: 'Daily Devotee', description: 'Complete 5 daily challenges.', icon: 'sun', progress: (s) => [Object.values(s.daily).filter(Boolean).length, 5], test: (s) => Object.values(s.daily).filter(Boolean).length >= 5 },
  { id: 'racer', title: 'Bug Race Winner', description: 'Score 8 or more in Debugging Race.', icon: 'flag', test: (s) => (s.games['debug-race']?.best ?? 0) >= 8 },
  { id: 'reviser', title: 'Smart Reviser', description: 'Complete 5 revision pages.', icon: 'notebook', progress: (s) => [Object.keys(s.revisionsDone).length, 5], test: (s) => Object.keys(s.revisionsDone).length >= 5 },
  { id: 'comeback', title: 'Welcome Back', description: 'Come back and practise after a break.', icon: 'sprout', test: (s) => c(s, 'comebacks') >= 1 },
  { id: 'exam-ready', title: 'Exam Ready', description: 'Score 75% or more on a full mock exam.', icon: 'cap', test: (s) => s.exams.some((e) => e.kind === 'mock' && e.score / e.max >= 0.75) },
];

export const ACH_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
