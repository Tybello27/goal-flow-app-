export type Priority = 'low' | 'medium' | 'high';

export const CATEGORIES = [
  'Fitness',
  'Career',
  'Education',
  'Finance',
  'Health',
  'Personal Development',
  'Travel',
  'Lifestyle',
  'Other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export type GoalStatus =
  | 'not-started'
  | 'in-progress'
  | 'completed'
  | 'overdue'
  | 'archived';

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
  completedAt?: string; // ISO datetime
}

export interface Reminder {
  enabled: boolean;
  time: string; // "HH:MM"
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  deadline: string; // ISO date
  milestones: Milestone[];
  /** Manual progress 0-100, used only when the goal has no milestones */
  progress: number;
  favorite: boolean;
  reminder: Reminder;
  createdAt: string;
  completedAt: string | null;
  archived: boolean;
}

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string; // tailwind-ish token key, see HABIT_COLORS
  goalId: string | null;
  reminderTime: string | null;
  createdAt: string;
  /** ISO dates ("yyyy-mm-dd") on which the habit was completed */
  log: string[];
}

export type ActivityType =
  | 'goal-created'
  | 'goal-completed'
  | 'goal-reopened'
  | 'goal-archived'
  | 'goal-deleted'
  | 'milestone-completed'
  | 'habit-created'
  | 'habit-completed'
  | 'perfect-day'
  | 'achievement-unlocked';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  text: string;
  at: number; // epoch ms
}

export interface AppData {
  goals: Goal[];
  habits: Habit[];
  activity: ActivityItem[];
  /** achievementId -> ISO date string unlocked */
  unlocked: Record<string, string>;
  meta: {
    lastPerfectDay?: string;
    notified?: Record<string, string>;
    seededAt: number;
  };
}

export type ThemeMode = 'system' | 'light' | 'dark';
export type GreetingStyle = 'auto' | 'welcome' | 'hi' | 'morning';
export type AccentKey = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';

export interface Settings {
  name: string;
  theme: ThemeMode;
  accent: AccentKey;
  greeting: GreetingStyle;
  notifications: boolean;
  dailyDigestTime: string;
}

export type View =
  | 'home'
  | 'goals'
  | 'goal'
  | 'habits'
  | 'calendar'
  | 'analytics'
  | 'achievements'
  | 'profile';

export interface NavState {
  view: View;
  goalId?: string;
}
