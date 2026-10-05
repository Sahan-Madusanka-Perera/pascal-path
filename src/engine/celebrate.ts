import { useSyncExternalStore } from 'react';

/** In-memory queue of reward events for the UI (toasts, level-up modal). */
export type Celebration =
  | { id: number; kind: 'xp'; amount: number; reason: string }
  | { id: number; kind: 'level'; level: number; title: string }
  | { id: number; kind: 'achievement'; achId: string }
  | { id: number; kind: 'streak'; days: number; message: string }
  | { id: number; kind: 'goal' }
  | { id: number; kind: 'info'; message: string };

type NewCelebration = Celebration extends infer C ? (C extends { id: number } ? Omit<C, 'id'> : never) : never;

let queue: Celebration[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export function celebrate(c: NewCelebration) {
  queue = [...queue, { ...c, id: nextId++ } as Celebration];
  listeners.forEach((l) => l());
}

export function dismiss(id: number) {
  queue = queue.filter((c) => c.id !== id);
  listeners.forEach((l) => l());
}

export function useCelebrations() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => queue,
  );
}
