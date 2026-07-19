import type { AppData } from '../types';
import { globalStreak, longestStreak, todayISO } from './utils';

export interface AchievementStats {
  totalGoals: number;
  completedGoals: number;
  milestonesDone: number;
  currentStreak: number;
  bestHabitStreak: number;
  perfectDay: boolean;
  earlyLog: boolean;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  gradient: string;
  target: number;
  value: (s: AchievementStats) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'goal-setter',
    name: 'Goal Setter',
    desc: 'Create your first goal',
    icon: 'flag',
    gradient: 'from-blue-500 to-indigo-600',
    target: 1,
    value: (s) => s.totalGoals,
  },
  {
    id: 'first-victory',
    name: 'First Victory',
    desc: 'Complete your first goal',
    icon: 'trophy',
    gradient: 'from-amber-400 to-orange-500',
    target: 1,
    value: (s) => s.completedGoals,
  },
  {
    id: 'goal-crusher',
    name: 'Goal Crusher',
    desc: 'Complete 5 goals',
    icon: 'medal',
    gradient: 'from-emerald-500 to-teal-600',
    target: 5,
    value: (s) => s.completedGoals,
  },
  {
    id: 'milestone-maker',
    name: 'Milestone Maker',
    desc: 'Finish your first milestone',
    icon: 'checkCircle',
    gradient: 'from-sky-500 to-cyan-600',
    target: 1,
    value: (s) => s.milestonesDone,
  },
  {
    id: 'milestone-crusher',
    name: 'Milestone Crusher',
    desc: 'Finish 15 milestones',
    icon: 'zap',
    gradient: 'from-violet-500 to-purple-600',
    target: 15,
    value: (s) => s.milestonesDone,
  },
  {
    id: 'warming-up',
    name: 'Warming Up',
    desc: 'Reach a 3-day streak',
    icon: 'flame',
    gradient: 'from-orange-400 to-amber-500',
    target: 3,
    value: (s) => s.currentStreak,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    desc: 'Reach a 7-day streak',
    icon: 'shield',
    gradient: 'from-emerald-500 to-green-600',
    target: 7,
    value: (s) => s.currentStreak,
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    desc: 'Reach a 30-day streak',
    icon: 'crown',
    gradient: 'from-amber-500 to-yellow-500',
    target: 30,
    value: (s) => s.currentStreak,
  },
  {
    id: 'habit-hero',
    name: 'Habit Hero',
    desc: 'Keep any habit for 7 days straight',
    icon: 'sparkles',
    gradient: 'from-teal-500 to-emerald-600',
    target: 7,
    value: (s) => s.bestHabitStreak,
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    desc: 'Complete every habit in a single day',
    icon: 'sun',
    gradient: 'from-yellow-400 to-amber-500',
    target: 1,
    value: (s) => (s.perfectDay ? 1 : 0),
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    desc: 'Check off a habit before 7 AM',
    icon: 'coffee',
    gradient: 'from-rose-500 to-pink-600',
    target: 1,
    value: (s) => (s.earlyLog ? 1 : 0),
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    desc: 'Complete 10 goals',
    icon: 'rocket',
    gradient: 'from-blue-600 to-primary-700',
    target: 10,
    value: (s) => s.completedGoals,
  },
];

export function computeStats(data: AppData, today = todayISO()): AchievementStats {
  const goals = data.goals.filter((g) => !g.archived);
  let bestHabitStreak = 0;
  for (const h of data.habits) {
    bestHabitStreak = Math.max(bestHabitStreak, longestStreak(h.log, today));
  }
  let earlyLog = false;
  const earlyFlag = (data.meta as Record<string, unknown>).earlyLogged;
  if (earlyFlag) earlyLog = true;

  return {
    totalGoals: goals.length,
    completedGoals: goals.filter((g) => g.completedAt).length,
    milestonesDone: data.goals.reduce(
      (n, g) => n + g.milestones.filter((m) => m.done).length,
      0,
    ),
    currentStreak: globalStreak(data.goals, data.habits, today),
    bestHabitStreak,
    perfectDay: Boolean(data.meta.lastPerfectDay),
    earlyLog,
  };
}

/** Returns ids of achievements that are newly unlocked (not yet in data.unlocked). */
export function newlyUnlocked(data: AppData): string[] {
  const stats = computeStats(data);
  const out: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (!data.unlocked[a.id] && a.value(stats) >= a.target) out.push(a.id);
  }
  return out;
}
