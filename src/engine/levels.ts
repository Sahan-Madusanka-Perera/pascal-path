/** Level curve: total XP needed to reach level L is 50·L·(L−1). */
export function xpForLevel(level: number) {
  return 50 * level * (level - 1);
}

export function levelFromXp(xp: number) {
  let l = 1;
  while (xpForLevel(l + 1) <= xp) l++;
  return l;
}

const TITLES = [
  'Newcomer', // 1
  'Explorer', // 2
  'Apprentice', // 3
  'Coder', // 4
  'Debugger', // 5
  'Builder', // 6
  'Problem Solver', // 7
  'Algorithm Ace', // 8
  'Pascal Pro', // 9
  'Code Master', // 10
];

export function levelTitle(level: number) {
  return level <= TITLES.length ? TITLES[level - 1] : 'Legend';
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, title: levelTitle(level), into: xp - base, needed: next - base, pct: (xp - base) / (next - base), nextAt: next };
}
