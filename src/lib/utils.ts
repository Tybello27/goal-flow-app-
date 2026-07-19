import type { Goal, GoalStatus, Habit, GreetingStyle } from '../types';

/* ------------------------------------------------------------------ */
/*  Misc                                                               */
/* ------------------------------------------------------------------ */

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export const plural = (n: number, one: string, many?: string) =>
  n === 1 ? one : many ?? `${one}s`;

/* Deterministic PRNG for realistic-looking seeded charts */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Dates                                                              */
/* ------------------------------------------------------------------ */

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

export const todayISO = () => toISO(new Date());

/** Parse an ISO *date* as local noon to dodge DST/timezone edges. */
export const dayFromISO = (iso: string) => new Date(`${iso}T12:00:00`);

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const isoAddDays = (n: number, from = todayISO()) =>
  toISO(addDays(dayFromISO(from), n));

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export function daysUntil(iso: string, from = todayISO()): number {
  return Math.round((dayFromISO(iso).getTime() - dayFromISO(from).getTime()) / 86_400_000);
}

export const fmtDay = (iso?: string | null) =>
  !iso
    ? '—'
    : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
        dayFromISO(iso),
      );

export const fmtDayFull = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(dayFromISO(iso));

export const fmtMonthYear = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);

export function fmtRel(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(ts),
  );
}

export function fmtClock(hhmm: string | null | undefined): string {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const naira = (n: number) =>
  `₦${n.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

/** 42-cell calendar grid for the month containing `ref`. */
export function monthGrid(ref: Date): Array<{ iso: string; inMonth: boolean; day: number }> {
  const first = startOfMonth(ref);
  const start = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = addDays(start, i);
    return {
      iso: toISO(d),
      inMonth: d.getMonth() === ref.getMonth(),
      day: d.getDate(),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Greeting                                                           */
/* ------------------------------------------------------------------ */

export function greeting(
  name: string,
  style: GreetingStyle,
  date = new Date(),
): { lead: string; name: string; emoji: string; full: string } {
  const h = date.getHours();
  const auto =
    style === 'welcome'
      ? 'welcome'
      : style === 'hi'
        ? 'hi'
        : style === 'morning'
          ? 'morning'
          : h >= 5 && h < 12
            ? 'morning'
            : h >= 12 && h < 18
              ? 'welcome'
              : 'hi';

  const map = {
    morning: { lead: 'Good Morning,', emoji: '☀️' },
    welcome: { lead: 'Welcome back,', emoji: '👋' },
    hi: { lead: 'Hi,', emoji: '🚀' },
  } as const;

  const picked = map[auto];
  return { ...picked, name, full: `${picked.lead} ${name} ${picked.emoji}` };
}

/* ------------------------------------------------------------------ */
/*  Goal derivations                                                    */
/* ------------------------------------------------------------------ */

export function progressOf(goal: Goal): number {
  if (goal.milestones.length > 0) {
    const done = goal.milestones.filter((m) => m.done).length;
    return Math.round((done / goal.milestones.length) * 100);
  }
  return clamp(Math.round(goal.progress), 0, 100);
}

export function statusOf(goal: Goal, today = todayISO()): GoalStatus {
  if (goal.archived) return 'archived';
  if (goal.completedAt) return 'completed';
  if (goal.deadline && goal.deadline < today) return 'overdue';
  return progressOf(goal) > 0 ? 'in-progress' : 'not-started';
}

export const STATUS_META: Record<
  GoalStatus,
  { label: string; chip: string; dot: string }
> = {
  'not-started': {
    label: 'Not Started',
    chip: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
    dot: 'bg-slate-400',
  },
  'in-progress': {
    label: 'In Progress',
    chip: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
    dot: 'bg-primary-500',
  },
  completed: {
    label: 'Completed',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
  overdue: {
    label: 'Overdue',
    chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
  },
  archived: {
    label: 'Archived',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
};

export function deadlineLabel(goal: Goal, today = todayISO()): string {
  if (goal.completedAt) return 'Done';
  const d = daysUntil(goal.deadline, today);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return 'Due today';
  if (d === 1) return 'Due tomorrow';
  return `${d}d left`;
}

/* ------------------------------------------------------------------ */
/*  Habits & streaks                                                   */
/* ------------------------------------------------------------------ */

export const habitDoneOn = (h: Habit, iso: string) => h.log.includes(iso);

export function habitStreak(h: Habit, today = todayISO()): number {
  return streakFromDays(h.log, today);
}

/** Consecutive-day streak ending today (or yesterday if today has no entry yet). */
export function streakFromDays(days: Iterable<string>, today = todayISO()): number {
  const set = days instanceof Set ? days : new Set(days);
  let cursor = set.has(today) ? today : isoAddDays(-1, today);
  if (!set.has(cursor)) return 0;
  let n = 0;
  while (set.has(cursor)) {
    n++;
    cursor = isoAddDays(-1, cursor);
  }
  return n;
}

export function longestStreak(days: Iterable<string>, today = todayISO()): number {
  const set = days instanceof Set ? days : new Set(days);
  if (set.size === 0) return 0;
  let best = 0;
  let cursor: string | null = null;
  // Walk back from today through the earliest logged day.
  for (let i = 0; i < 370; i++) {
    const iso = isoAddDays(-i, today);
    if (set.has(iso)) {
      cursor = iso;
      let run = 0;
      while (set.has(cursor)) {
        run++;
        cursor = isoAddDays(-1, cursor);
      }
      best = Math.max(best, run);
      i += run; // skip scanned range
    }
  }
  return best;
}

/** Days that have at least one habit completion or milestone completion. */
export function activeDaysSet(goals: Goal[], habits: Habit[]): Set<string> {
  const set = new Set<string>();
  for (const h of habits) for (const d of h.log) set.add(d);
  for (const g of goals)
    for (const m of g.milestones)
      if (m.completedAt) set.add(m.completedAt.slice(0, 10));
  for (const g of goals) if (g.completedAt) set.add(g.completedAt.slice(0, 10));
  return set;
}

export function globalStreak(goals: Goal[], habits: Habit[], today = todayISO()): number {
  return streakFromDays(activeDaysSet(goals, habits), today);
}

/* ------------------------------------------------------------------ */
/*  Analytics aggregates                                               */
/* ------------------------------------------------------------------ */

export function habitRateForDay(habits: Habit[], iso: string): number {
  const eligible = habits.filter((h) => h.createdAt.slice(0, 10) <= iso);
  if (eligible.length === 0) return 0;
  const done = eligible.filter((h) => h.log.includes(iso)).length;
  return done / eligible.length;
}

export function weeklyTrend(habits: Habit[], today = todayISO()) {
  return Array.from({ length: 7 }, (_, i) => {
    const iso = isoAddDays(i - 6, today);
    return {
      iso,
      label: new Intl.DateTimeFormat('en-US', { weekday: 'narrow' }).format(dayFromISO(iso)),
      value: Math.round(habitRateForDay(habits, iso) * 100),
    };
  });
}

export function weeklyReport(habits: Habit[], goals: Goal[], today = todayISO()) {
  const sumRange = (start: number, end: number) => {
    let done = 0;
    let planned = 0;
    for (let i = start; i <= end; i++) {
      const iso = isoAddDays(-i, today);
      const eligible = habits.filter((h) => h.createdAt.slice(0, 10) <= iso);
      planned += eligible.length;
      done += eligible.filter((h) => h.log.includes(iso)).length;
    }
    return { done, planned };
  };
  const mstones = (start: number, end: number) => {
    let n = 0;
    for (const g of goals)
      for (const m of g.milestones) {
        if (!m.completedAt) continue;
        const d = daysUntil(m.completedAt.slice(0, 10), today);
        if (d <= -start && d >= -end) n++;
      }
    return n;
  };
  const thisWeek = sumRange(0, 6);
  const lastWeek = sumRange(7, 13);
  return {
    thisWeek,
    lastWeek,
    milestonesThisWeek: mstones(0, 6),
    milestonesLastWeek: mstones(7, 13),
    delta: lastWeek.done > 0 ? Math.round(((thisWeek.done - lastWeek.done) / lastWeek.done) * 100) : 100,
  };
}



/** Completions (habit check-ins + milestones + goals) bucketed into the last N ISO weeks */
export function completionsPerWeek(goals: Goal[], habits: Habit[], weeks = 6, today = todayISO()) {
  const buckets = Array.from({ length: weeks }, () => 0);
  const bump = (iso: string) => {
    const d = daysUntil(iso, today); // <= 0
    const weekAgo = Math.floor(-d / 7);
    if (weekAgo >= 0 && weekAgo < weeks) buckets[weeks - 1 - weekAgo]++;
  };
  for (const h of habits) for (const d of h.log) bump(d);
  for (const g of goals) {
    for (const m of g.milestones) if (m.completedAt) bump(m.completedAt.slice(0, 10));
    if (g.completedAt) bump(g.completedAt.slice(0, 10));
  }
  return buckets.map((value, i) => ({
    label: `W${i + 1}`,
    value,
  }));
}

export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  // Each level needs level*120 XP more than the previous one.
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 120) {
    remaining -= level * 120;
    level++;
  }
  return { level, into: remaining, span: level * 120 };
}

export function computeXp(goals: Goal[], habits: Habit[], unlockedCount: number): number {
  let xp = 0;
  for (const g of goals) {
    if (g.completedAt) xp += 100;
    xp += g.milestones.filter((m) => m.done).length * 25;
  }
  for (const h of habits) xp += h.log.length * 10;
  xp += unlockedCount * 60;
  return xp;
}
