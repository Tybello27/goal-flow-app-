import type { AccentKey, Category, Priority } from '../types';

/* ------------------------------------------------------------------ */
/*  Category visual language (literal classes for Tailwind scanning)   */
/* ------------------------------------------------------------------ */

export interface CategoryMeta {
  icon: string;
  /** card gradient */
  gradient: string;
  /** soft chip / blob background */
  soft: string;
  /** icon color on light surfaces */
  text: string;
  /** progress ring stroke */
  ring: string;
  dot: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Fitness: {
    icon: 'dumbbell',
    gradient: 'from-emerald-500 to-teal-600',
    soft: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: '#10b981',
    dot: 'bg-emerald-500',
  },
  Career: {
    icon: 'briefcase',
    gradient: 'from-blue-500 to-indigo-600',
    soft: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    ring: '#3b82f6',
    dot: 'bg-blue-500',
  },
  Education: {
    icon: 'grad',
    gradient: 'from-violet-500 to-purple-600',
    soft: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-400',
    ring: '#8b5cf6',
    dot: 'bg-violet-500',
  },
  Finance: {
    icon: 'wallet',
    gradient: 'from-amber-500 to-orange-600',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    ring: '#f59e0b',
    dot: 'bg-amber-500',
  },
  Health: {
    icon: 'heart',
    gradient: 'from-rose-500 to-pink-600',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    ring: '#f43f5e',
    dot: 'bg-rose-500',
  },
  'Personal Development': {
    icon: 'sprout',
    gradient: 'from-teal-500 to-emerald-600',
    soft: 'bg-teal-50 dark:bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    ring: '#14b8a6',
    dot: 'bg-teal-500',
  },
  Travel: {
    icon: 'plane',
    gradient: 'from-sky-500 to-cyan-600',
    soft: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-600 dark:text-sky-400',
    ring: '#0ea5e9',
    dot: 'bg-sky-500',
  },
  Lifestyle: {
    icon: 'leaf',
    gradient: 'from-lime-500 to-green-600',
    soft: 'bg-lime-50 dark:bg-lime-500/10',
    text: 'text-lime-600 dark:text-lime-400',
    ring: '#84cc16',
    dot: 'bg-lime-500',
  },
  Other: {
    icon: 'flag',
    gradient: 'from-slate-500 to-slate-700',
    soft: 'bg-slate-100 dark:bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    ring: '#64748b',
    dot: 'bg-slate-500',
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; chipOnCard: string; dot: string }
> = {
  low: {
    label: 'Low',
    chip: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
    chipOnCard: 'bg-white/20 text-white',
    dot: 'bg-sky-400',
  },
  medium: {
    label: 'Medium',
    chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
    chipOnCard: 'bg-white/20 text-white',
    dot: 'bg-amber-400',
  },
  high: {
    label: 'High',
    chip: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
    chipOnCard: 'bg-white/20 text-white',
    dot: 'bg-rose-500',
  },
};

/* ------------------------------------------------------------------ */
/*  Habit appearance                                                    */
/* ------------------------------------------------------------------ */

export const HABIT_ICONS = [
  'book',
  'dumbbell',
  'code',
  'coffee',
  'sun',
  'moon',
  'heart',
  'zap',
  'flame',
  'leaf',
  'wallet',
  'sparkles',
  'lotus',
  'alarm',
] as const;

export interface HabitColor {
  key: string;
  blob: string;
  text: string;
  ring: string;
  hex: string;
}

export const HABIT_COLORS: HabitColor[] = [
  {
    key: 'blue',
    blob: 'bg-blue-100 dark:bg-blue-500/15',
    text: 'text-blue-600 dark:text-blue-400',
    ring: '#3b82f6',
    hex: '#3b82f6',
  },
  {
    key: 'emerald',
    blob: 'bg-emerald-100 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    ring: '#10b981',
    hex: '#10b981',
  },
  {
    key: 'amber',
    blob: 'bg-amber-100 dark:bg-amber-500/15',
    text: 'text-amber-600 dark:text-amber-400',
    ring: '#f59e0b',
    hex: '#f59e0b',
  },
  {
    key: 'violet',
    blob: 'bg-violet-100 dark:bg-violet-500/15',
    text: 'text-violet-600 dark:text-violet-400',
    ring: '#8b5cf6',
    hex: '#8b5cf6',
  },
  {
    key: 'rose',
    blob: 'bg-rose-100 dark:bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    ring: '#f43f5e',
    hex: '#f43f5e',
  },
  {
    key: 'teal',
    blob: 'bg-teal-100 dark:bg-teal-500/15',
    text: 'text-teal-600 dark:text-teal-400',
    ring: '#14b8a6',
    hex: '#14b8a6',
  },
];

export const habitColor = (key: string): HabitColor =>
  HABIT_COLORS.find((c) => c.key === key) ?? HABIT_COLORS[0];

/* ------------------------------------------------------------------ */
/*  Accent themes (profile > theme settings)                            */
/* ------------------------------------------------------------------ */

export const ACCENTS: Record<
  AccentKey,
  { label: string; swatch: string; vars: Record<string, string> }
> = {
  blue: {
    label: 'Ocean Blue',
    swatch: '#2563eb',
    vars: {
      '--color-primary-500': '#3b6ef6',
      '--color-primary-600': '#2563eb',
      '--color-primary-700': '#1d4ed8',
    },
  },
  emerald: {
    label: 'Emerald',
    swatch: '#10b981',
    vars: {
      '--color-primary-500': '#10b981',
      '--color-primary-600': '#059669',
      '--color-primary-700': '#047857',
    },
  },
  violet: {
    label: 'Violet',
    swatch: '#8b5cf6',
    vars: {
      '--color-primary-500': '#8b5cf6',
      '--color-primary-600': '#7c3aed',
      '--color-primary-700': '#6d28d9',
    },
  },
  amber: {
    label: 'Amber',
    swatch: '#f59e0b',
    vars: {
      '--color-primary-500': '#f59e0b',
      '--color-primary-600': '#d97706',
      '--color-primary-700': '#b45309',
    },
  },
  rose: {
    label: 'Rose',
    swatch: '#f43f5e',
    vars: {
      '--color-primary-500': '#f43f5e',
      '--color-primary-600': '#e11d48',
      '--color-primary-700': '#be123c',
    },
  },
};
