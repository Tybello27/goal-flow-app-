import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppData, Goal, Habit, NavState, Settings, View } from '../types';
import { buildSeedData } from '../lib/seed';
import * as storage from '../lib/storage';
import { fmtClock, todayISO, uid } from '../lib/utils';
import { newlyUnlocked } from '../lib/achievements';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface Toast {
  id: string;
  icon: string;
  title: string;
  body?: string;
  tone: 'default' | 'success' | 'amber';
}

export type Celebration =
  | { kind: 'goal-complete'; goalId: string }
  | { kind: 'achievement'; achievementIds: string[] }
  | { kind: 'perfect-day' };

export type SheetState =
  | null
  | { kind: 'goal'; goalId?: string }
  | { kind: 'habit'; habitId?: string }
  | { kind: 'reminders' }
  | { kind: 'ios-install' }
  | {
      kind: 'confirm';
      title: string;
      body: string;
      confirmLabel: string;
      danger?: boolean;
      onConfirm: () => void;
    };

export interface ReminderItem {
  key: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
  goalId?: string;
  habitId?: string;
  kind: 'goal' | 'habit';
}

export interface NewGoalInput {
  title: string;
  description: string;
  category: Goal['category'];
  priority: Goal['priority'];
  deadline: string;
  milestones: Array<{ title: string; dueDate?: string }>;
  reminder: Goal['reminder'];
}

export interface NewHabitInput {
  title: string;
  icon: string;
  color: string;
  goalId: string | null;
  reminderTime: string | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface AppCtx {
  data: AppData;
  settings: Settings;
  onboarded: boolean;

  nav: NavState;
  go: (view: View, goalId?: string) => void;
  goTab: (view: View) => void;
  back: () => void;
  canGoBack: boolean;

  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;

  celebrations: Celebration[];
  dismissCelebration: () => void;

  sheet: SheetState;
  openSheet: (s: SheetState) => void;
  closeSheet: () => void;

  canInstall: boolean;
  promptInstall: () => Promise<void>;
  isIOS: boolean;
  isStandalone: boolean;

  reminders: ReminderItem[];

  completeOnboarding: (name: string) => void;
  saveSettings: (patch: Partial<Settings>) => void;

  createGoal: (input: NewGoalInput) => string;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleArchive: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setGoalProgress: (id: string, value: number) => void;
  completeGoal: (id: string) => void;
  reopenGoal: (id: string) => void;
  addMilestone: (goalId: string, title: string, dueDate?: string) => void;
  toggleMilestone: (goalId: string, msId: string) => void;
  deleteMilestone: (goalId: string, msId: string) => void;

  createHabit: (input: NewHabitInput) => void;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (habitId: string, dateISO?: string) => void;

  resetSamples: () => void;
  clearAll: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export const useApp = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
};

/* ------------------------------------------------------------------ */

function initialData(): AppData {
  const existing = storage.loadData();
  if (existing && Array.isArray(existing.goals)) return existing;
  const seeded = buildSeedData();
  storage.saveData(seeded);
  return seeded;
}

function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(initialData);
  const [settings, setSettings] = useState<Settings>(storage.loadSettings);
  const [onboarded, setOnboarded] = useState<boolean>(storage.loadOnboarded);

  const [stack, setStack] = useState<NavState[]>([{ view: 'home' }]);
  const nav = stack[stack.length - 1];

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [sheet, setSheet] = useState<SheetState>(null);

  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true,
  );
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const dataRef = useRef(data);
  dataRef.current = data;

  /* ------------ persistence ------------ */
  useEffect(() => storage.saveData(data), [data]);
  useEffect(() => storage.saveSettings(settings), [settings]);

  /* ------------ navigation ------------ */
  const go = useCallback((view: View, goalId?: string) => {
    setStack((s) => [...s, { view, goalId }]);
  }, []);
  const goTab = useCallback((view: View) => {
    setStack((s) => {
      const root = s[0];
      if (s.length === 1 && root.view === view) return s;
      return [{ view }];
    });
  }, []);
  const back = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : [{ view: 'home' }]));
  }, []);

  /* ------------ toasts & celebrations ------------ */
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);
  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = uid();
      setToasts((list) => [...list.slice(-2), { ...t, id }]);
      window.setTimeout(() => dismissToast(id), 3800);
    },
    [dismissToast],
  );
  const dismissCelebration = useCallback(() => setCelebrations((c) => c.slice(1)), []);

  const openSheet = useCallback((s: SheetState) => setSheet(s), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  /* ------------ helpers ------------ */

  const pushActivity = (d: AppData, type: AppData['activity'][number]['type'], text: string): AppData => ({
    ...d,
    activity: [...d.activity, { id: uid(), type, text, at: Date.now() }].slice(-80),
  });

  /** Applies any newly-earned achievements to `next`, returns [data, unlockedIds]. */
  const applyUnlocks = (next: AppData): [AppData, string[]] => {
    const ids = newlyUnlocked(next);
    if (ids.length === 0) return [next, []];
    let out = next;
    for (const id of ids) {
      out = { ...out, unlocked: { ...out.unlocked, [id]: todayISO() } };
      out = pushActivity(out, 'achievement-unlocked', `Unlocked a new badge`);
    }
    return [out, ids];
  };

  const commit = (next: AppData, queue: Celebration[] = []) => {
    setData(next);
    if (queue.length) setCelebrations((c) => [...c, ...queue]);
  };

  /* ------------ settings & onboarding ------------ */

  const saveSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const completeOnboarding = useCallback(
    (name: string) => {
      const clean = name.trim() || 'Tomisin';
      saveSettings({ name: clean });
      storage.saveOnboarded();
      setOnboarded(true);
      toast({ icon: 'sparkles', title: `You're all set, ${clean}!`, body: 'Let the flow begin.', tone: 'success' });
    },
    [saveSettings, toast],
  );

  /* ------------ goal actions ------------ */

  const createGoal = useCallback(
    (input: NewGoalInput): string => {
      const id = uid();
      const goal: Goal = {
        id,
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        priority: input.priority,
        deadline: input.deadline,
        milestones: input.milestones
          .filter((m) => m.title.trim())
          .map((m) => ({ id: uid(), title: m.title.trim(), done: false, dueDate: m.dueDate || undefined })),
        progress: 0,
        favorite: false,
        reminder: input.reminder,
        createdAt: new Date().toISOString(),
        completedAt: null,
        archived: false,
      };
      let next = { ...dataRef.current, goals: [goal, ...dataRef.current.goals] };
      next = pushActivity(next, 'goal-created', `Created goal “${goal.title}”`);
      const [withUnlocks, ids] = applyUnlocks(next);
      commit(withUnlocks, ids.length ? [{ kind: 'achievement', achievementIds: ids }] : []);
      toast({ icon: 'flag', title: 'Goal created', body: goal.title, tone: 'success' });
      return id;
    },
    [toast],
  );

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    const next = {
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    };
    setData(next);
    toast({ icon: 'checkCircle', title: 'Goal updated', tone: 'default' });
  }, [toast]);

  const deleteGoal = useCallback(
    (id: string) => {
      const goal = dataRef.current.goals.find((g) => g.id === id);
      if (!goal) return;
      let next: AppData = {
        ...dataRef.current,
        goals: dataRef.current.goals.filter((g) => g.id !== id),
        habits: dataRef.current.habits.map((h) => (h.goalId === id ? { ...h, goalId: null } : h)),
      };
      next = pushActivity(next, 'goal-deleted', `Deleted goal “${goal.title}”`);
      setData(next);
      setStack((s) => (s[s.length - 1].view === 'goal' && s[s.length - 1].goalId === id ? s.slice(0, -1) : s));
      toast({ icon: 'trash', title: 'Goal deleted', tone: 'default' });
    },
    [toast],
  );

  const toggleArchive = useCallback(
    (id: string) => {
      const goal = dataRef.current.goals.find((g) => g.id === id);
      if (!goal) return;
      const archived = !goal.archived;
      let next = {
        ...dataRef.current,
        goals: dataRef.current.goals.map((g) => (g.id === id ? { ...g, archived } : g)),
      };
      next = pushActivity(next, 'goal-archived', archived ? `Archived “${goal.title}”` : `Restored “${goal.title}” from the archive`);
      setData(next);
      toast({ icon: 'archive', title: archived ? 'Goal archived' : 'Goal restored', tone: 'amber' });
    },
    [toast],
  );

  const toggleFavorite = useCallback((id: string) => {
    setData({
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)),
    });
  }, []);

  const setGoalProgress = useCallback((id: string, value: number) => {
    setData({
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) => (g.id === id ? { ...g, progress: value } : g)),
    });
  }, []);

  const completeGoal = useCallback(
    (id: string) => {
      const goal = dataRef.current.goals.find((g) => g.id === id);
      if (!goal || goal.completedAt) return;
      let next: AppData = {
        ...dataRef.current,
        goals: dataRef.current.goals.map((g) =>
          g.id === id
            ? {
                ...g,
                completedAt: new Date().toISOString(),
                progress: 100,
                milestones: g.milestones.map((m) => (m.done ? m : { ...m, done: true, completedAt: new Date().toISOString() })),
              }
            : g,
        ),
      };
      next = pushActivity(next, 'goal-completed', `Goal completed: “${goal.title}” 🎉`);
      const [withUnlocks, ids] = applyUnlocks(next);
      const queue: Celebration[] = [{ kind: 'goal-complete', goalId: id }];
      if (ids.length) queue.push({ kind: 'achievement', achievementIds: ids });
      commit(withUnlocks, queue);
    },
    [],
  );

  const reopenGoal = useCallback(
    (id: string) => {
      const goal = dataRef.current.goals.find((g) => g.id === id);
      if (!goal || !goal.completedAt) return;
      let next: AppData = {
        ...dataRef.current,
        goals: dataRef.current.goals.map((g) => (g.id === id ? { ...g, completedAt: null } : g)),
      };
      next = pushActivity(next, 'goal-reopened', `Reopened “${goal.title}”`);
      setData(next);
      toast({ icon: 'refresh', title: 'Goal reopened', tone: 'default' });
    },
    [toast],
  );

  const addMilestone = useCallback((goalId: string, title: string, dueDate?: string) => {
    const t = title.trim();
    if (!t) return;
    setData({
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) =>
        g.id === goalId
          ? { ...g, milestones: [...g.milestones, { id: uid(), title: t, done: false, dueDate: dueDate || undefined }] }
          : g,
      ),
    });
  }, []);

  const deleteMilestone = useCallback((goalId: string, msId: string) => {
    setData({
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) =>
        g.id === goalId ? { ...g, milestones: g.milestones.filter((m) => m.id !== msId) } : g,
      ),
    });
  }, []);

  const toggleMilestone = useCallback((goalId: string, msId: string) => {
    const goal = dataRef.current.goals.find((g) => g.id === goalId);
    const target = goal?.milestones.find((m) => m.id === msId);
    if (!goal || !target) return;

    const marking = !target.done;
    let next: AppData = {
      ...dataRef.current,
      goals: dataRef.current.goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              milestones: g.milestones.map((m) =>
                m.id === msId ? { ...m, done: marking, completedAt: marking ? new Date().toISOString() : undefined } : m,
              ),
            }
          : g,
      ),
    };

    const queue: Celebration[] = [];
    const updated = next.goals.find((g) => g.id === goalId)!;

    if (marking) {
      next = pushActivity(next, 'milestone-completed', `Completed milestone “${target.title}”`);
      const allDone = updated.milestones.length > 0 && updated.milestones.every((m) => m.done || m.id === msId);
      if (allDone && !updated.completedAt) {
        next = {
          ...next,
          goals: next.goals.map((g) => (g.id === goalId ? { ...g, completedAt: new Date().toISOString() } : g)),
        };
        next = pushActivity(next, 'goal-completed', `Goal completed: “${goal.title}” 🎉`);
        queue.push({ kind: 'goal-complete', goalId });
      } else {
        toast({ icon: 'checkCircle', title: 'Milestone done!', body: target.title, tone: 'success' });
      }
    } else if (updated.completedAt) {
      // Unchecking a milestone reopens a completed goal.
      next = {
        ...next,
        goals: next.goals.map((g) => (g.id === goalId ? { ...g, completedAt: null } : g)),
      };
    }

    const [withUnlocks, ids] = applyUnlocks(next);
    if (ids.length) queue.push({ kind: 'achievement', achievementIds: ids });
    commit(withUnlocks, queue);
  }, [toast]);

  /* ------------ habits ------------ */

  const createHabit = useCallback(
    (input: NewHabitInput) => {
      const habit: Habit = {
        id: uid(),
        title: input.title.trim(),
        icon: input.icon,
        color: input.color,
        goalId: input.goalId,
        reminderTime: input.reminderTime,
        createdAt: new Date().toISOString(),
        log: [],
      };
      let next = { ...dataRef.current, habits: [...dataRef.current.habits, habit] };
      next = pushActivity(next, 'habit-created', `Started habit “${habit.title}”`);
      setData(next);
      toast({ icon: 'flame', title: 'Habit created', body: habit.title, tone: 'success' });
    },
    [toast],
  );

  const updateHabit = useCallback(
    (id: string, patch: Partial<Habit>) => {
      setData({
        ...dataRef.current,
        habits: dataRef.current.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      });
      toast({ icon: 'checkCircle', title: 'Habit updated', tone: 'default' });
    },
    [toast],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      setData({ ...dataRef.current, habits: dataRef.current.habits.filter((h) => h.id !== id) });
      toast({ icon: 'trash', title: 'Habit deleted', tone: 'default' });
    },
    [toast],
  );

  const toggleHabit = useCallback(
    (habitId: string, dateISO?: string) => {
      const day = dateISO ?? todayISO();
      const habit = dataRef.current.habits.find((h) => h.id === habitId);
      if (!habit) return;
      const has = habit.log.includes(day);
      const today = todayISO();

      let next: AppData = {
        ...dataRef.current,
        habits: dataRef.current.habits.map((h) =>
          h.id === habitId ? { ...h, log: has ? h.log.filter((d) => d !== day) : [...h.log, day].sort() } : h,
        ),
      };

      const queue: Celebration[] = [];

      if (!has) {
        // Early-bird detection (before 7 AM)
        const hour = new Date().getHours();
        if (day === today && hour < 7) {
          next = { ...next, meta: { ...next.meta, earlyLogged: true } as AppData['meta'] };
        }
        next = pushActivity(next, 'habit-completed', `Checked off “${habit.title}”`);

        // Perfect day?
        if (day === today) {
          const habits = next.habits;
          const allDone = habits.length > 0 && habits.every((h) => h.id === habitId || h.log.includes(day));
          if (allDone && next.meta.lastPerfectDay !== day) {
            next = { ...next, meta: { ...next.meta, lastPerfectDay: day } };
            next = pushActivity(next, 'perfect-day', 'Perfect day — every habit completed! ⭐');
            queue.push({ kind: 'perfect-day' });
          }
        }
        toast({
          icon: 'checkCircle',
          title: day === today ? 'Nice work!' : 'Habit logged',
          body: habit.title,
          tone: 'success',
        });
      }

      const [withUnlocks, ids] = applyUnlocks(next);
      if (ids.length) queue.push({ kind: 'achievement', achievementIds: ids });
      commit(withUnlocks, queue);
    },
    [toast],
  );

  /* ------------ data management ------------ */

  const resetSamples = useCallback(() => {
    setData(buildSeedData());
    toast({ icon: 'refresh', title: 'Sample data restored', tone: 'default' });
  }, [toast]);

  const clearAll = useCallback(() => {
    setData({
      goals: [],
      habits: [],
      activity: [],
      unlocked: {},
      meta: { seededAt: Date.now(), notified: {} },
    });
    toast({ icon: 'trash', title: 'All data cleared', tone: 'amber' });
  }, [toast]);

  /* ------------ install prompt ------------ */

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    const onInstalled = () => {
      setCanInstall(false);
      deferredPrompt.current = null;
      setIsStandalone(true);
    };
    const mq = window.matchMedia('(display-mode: standalone)');
    const onMode = () => setIsStandalone(mq.matches);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    mq.addEventListener('change', onMode);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      mq.removeEventListener('change', onMode);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    await deferredPrompt.current.userChoice.catch(() => undefined);
    deferredPrompt.current = null;
    setCanInstall(false);
  }, []);

  /* ------------ reminders + notifications ------------ */

  const reminders = useMemo<ReminderItem[]>(() => {
    const today = todayISO();
    const items: ReminderItem[] = [];
    for (const g of data.goals) {
      if (g.archived || g.completedAt || !g.reminder.enabled) continue;
      const days = Math.round(
        (new Date(`${g.deadline}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000,
      );
      if (days <= 3) {
        items.push({
          key: `goal-${g.id}`,
          icon: 'flag',
          title: g.title,
          detail: days < 0 ? `Deadline passed ${Math.abs(days)}d ago` : days === 0 ? 'Deadline is today' : `Deadline in ${days}d`,
          time: g.reminder.time,
          goalId: g.id,
          kind: 'goal',
        });
      }
    }
    for (const h of data.habits) {
      if (h.reminderTime && !h.log.includes(today)) {
        items.push({
          key: `habit-${h.id}`,
          icon: h.icon,
          title: h.title,
          detail: 'Habit not checked off yet today',
          time: h.reminderTime,
          habitId: h.id,
          kind: 'habit',
        });
      }
    }
    return items;
  }, [data.goals, data.habits]);

  useEffect(() => {
    if (!settings.notifications) return;
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const tick = () => {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = todayISO();
      const notified = dataRef.current.meta.notified ?? {};
      const fire = (key: string, body: string) => {
        if (notified[key] === today) return;
        try {
          new Notification('GoalFlow', { body, icon: '/icon-192.png', badge: '/icon-192.png', tag: key });
        } catch {
          /* unsupported (e.g. some mobile browsers) */
        }
        setData((d) => ({
          ...d,
          meta: { ...d.meta, notified: { ...(d.meta.notified ?? {}), [key]: today } },
        }));
      };

      for (const item of reminders) {
        if (item.time <= hhmm) {
          fire(
            item.key,
            item.kind === 'habit'
              ? `Habit reminder (${fmtClock(item.time)}): ${item.title}`
              : `Goal reminder: ${item.title} — ${item.detail.toLowerCase()}`,
          );
        }
      }

      if (settings.dailyDigestTime <= hhmm) {
        const pendingHabits = dataRef.current.habits.filter((h) => !h.log.includes(today)).length;
        if (pendingHabits > 0) {
          fire('daily-digest', `Good ${now.getHours() < 12 ? 'morning' : 'day'}, ${settings.name}! You have ${pendingHabits} habit${pendingHabits > 1 ? 's' : ''} to check off today.`);
        }
      }
    };

    const id = window.setInterval(tick, 30_000);
    tick();
    return () => window.clearInterval(id);
  }, [settings.notifications, settings.dailyDigestTime, settings.name, reminders]);

  /* ------------ context value ------------ */

  const value: AppCtx = {
    data,
    settings,
    onboarded,
    nav,
    go,
    goTab,
    back,
    canGoBack: stack.length > 1,
    toasts,
    toast,
    dismissToast,
    celebrations,
    dismissCelebration,
    sheet,
    openSheet,
    closeSheet,
    canInstall,
    promptInstall,
    isIOS: useMemo(detectIOS, []),
    isStandalone,
    reminders,
    completeOnboarding,
    saveSettings,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleArchive,
    toggleFavorite,
    setGoalProgress,
    completeGoal,
    reopenGoal,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    resetSamples,
    clearAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
