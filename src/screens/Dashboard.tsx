import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { quoteOfDay } from '../lib/quotes';
import { ACHIEVEMENTS, computeStats } from '../lib/achievements';
import {
  activeDaysSet,
  cx,
  deadlineLabel,
  fmtDay,
  fmtRel,
  globalStreak,
  greeting,
  habitDoneOn,
  longestStreak,
  plural,
  progressOf,
  todayISO,
} from '../lib/utils';
import { CATEGORY_META, habitColor, PRIORITY_META } from '../lib/meta';
import { Avatar, Button, Card, CountUp, IconBtn, ProgressBar, SectionHeader } from '../components/ui';
import { Icon } from '../components/icons';
import { ProgressRing } from '../components/charts';
import { Logo } from '../components/Nav';
import { InstallCard } from '../components/Install';
import type { ActivityType } from '../types';

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
});

const ACTIVITY_ICON: Record<ActivityType, { icon: string; cls: string }> = {
  'goal-created': { icon: 'flag', cls: 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
  'goal-completed': { icon: 'trophy', cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
  'goal-reopened': { icon: 'refresh', cls: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300' },
  'goal-archived': { icon: 'archive', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-500/15 dark:text-slate-300' },
  'goal-deleted': { icon: 'trash', cls: 'bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300' },
  'milestone-completed': { icon: 'checkCircle', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  'habit-created': { icon: 'sparkles', cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
  'habit-completed': { icon: 'check', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' },
  'perfect-day': { icon: 'sun', cls: 'bg-amber-100 text-amber-500 dark:bg-amber-500/15 dark:text-amber-300' },
  'achievement-unlocked': { icon: 'medal', cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
};

export function Dashboard() {
  const { data, settings, goTab, go, openSheet, toggleHabit, reminders } = useApp();
  const today = todayISO();
  const quote = useMemo(() => quoteOfDay(), []);
  const g = greeting(settings.name, settings.greeting);

  const active = data.goals.filter((x) => !x.archived && !x.completedAt);
  const completed = data.goals.filter((x) => !x.archived && x.completedAt);
  const overall = active.length
    ? Math.round(active.reduce((n, x) => n + progressOf(x), 0) / active.length)
    : completed.length
      ? 100
      : 0;

  const streak = globalStreak(data.goals, data.habits, today);
  const bestStreak = Math.max(streak, longestStreak(activeDaysSet(data.goals, data.habits), today));

  const habitsToday = data.habits.map((h) => ({ h, done: habitDoneOn(h, today) }));
  const doneToday = habitsToday.filter((x) => x.done).length;

  const upcoming = [...active]
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 3);

  const nextMilestone = useMemo(() => {
    for (const goal of [...data.goals].sort((a, b) => Number(b.favorite) - Number(a.favorite))) {
      if (goal.archived || goal.completedAt) continue;
      const m = goal.milestones.find((x) => !x.done);
      if (m) return { goal, m };
    }
    return null;
  }, [data.goals]);

  const recentActivity = [...data.activity].reverse().slice(0, 4);

  const stats = computeStats(data, today);
  const nextBadge = ACHIEVEMENTS.find((a) => !data.unlocked[a.id]);

  const dateLine = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const quickActions = [
    { icon: 'flag', label: 'New Goal', grad: 'from-primary-500 to-indigo-600', fn: () => openSheet({ kind: 'goal' }) },
    { icon: 'flame', label: 'Add Habit', grad: 'from-emerald-500 to-teal-600', fn: () => openSheet({ kind: 'habit' }) },
    { icon: 'calendar', label: 'Calendar', grad: 'from-amber-500 to-orange-600', fn: () => go('calendar') },
    { icon: 'analytics', label: 'Analytics', grad: 'from-violet-500 to-purple-600', fn: () => goTab('analytics') },
    { icon: 'bell', label: 'Reminders', grad: 'from-rose-500 to-pink-600', fn: () => openSheet({ kind: 'reminders' }) },
  ];

  return (
    <div className="mx-auto grid w-full max-w-xl gap-4 lg:max-w-6xl lg:grid-cols-3">
      {/* ---- mobile header ---- */}
      <div className="flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-[18px] font-extrabold tracking-tight text-slate-800 dark:text-white">
            Goal<span className="text-gradient">Flow</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openSheet({ kind: 'reminders' })}
            className="relative grid size-11 place-items-center rounded-full bg-white text-slate-500 shadow-soft ring-1 ring-slate-900/5 transition active:scale-90 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10"
            aria-label="Reminders"
          >
            <Icon name="bell" size={19} />
            {reminders.length > 0 && (
              <span className="absolute top-1 right-1 grid min-w-4.5 place-items-center rounded-full bg-rose-500 px-1 py-px text-[9.5px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                {reminders.length}
              </span>
            )}
          </button>
          <Avatar size={44} onClick={() => go('profile')} />
        </div>
      </div>

      {/* ---- greeting ---- */}
      <motion.div {...stagger(0)} className="lg:col-span-3 lg:mt-2">
        <p className="text-[12.5px] font-bold tracking-wider text-slate-400 uppercase">{dateLine}</p>
        <h1 className="mt-1 text-[30px] leading-[1.12] font-extrabold tracking-tight text-slate-900 sm:text-[36px] dark:text-white">
          {g.lead}
          <br />
          <span className="text-gradient">{g.name}</span> {g.emoji}
        </h1>
      </motion.div>

      {/* ---- quote ---- */}
      <motion.div {...stagger(1)} className="lg:col-span-2">
        <Card className="relative flex h-full flex-col justify-between overflow-hidden">
          <div className="pointer-events-none absolute -top-8 -right-6 size-32 rounded-full bg-gradient-to-br from-amber-400/20 to-primary-400/10 blur-2xl" />
          <div className="relative flex gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-500/15 dark:text-amber-300">
              <Icon name="quote" size={18} strokeWidth={2.2} />
            </span>
            <div>
              <p className="text-[15px] leading-snug font-semibold text-slate-700 dark:text-slate-200">“{quote.text}”</p>
              <p className="mt-1.5 text-[12px] font-bold text-slate-400">— {quote.author}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ---- overall progress ring ---- */}
      <motion.div {...stagger(2)}>
        <Card className="flex h-full items-center justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Goal progress</h3>
            <p className="mt-0.5 text-[12px] font-medium text-slate-400">Overall completion</p>
            <div className="mt-3 space-y-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary-500" /> {active.length} active
              </p>
              <p className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> {completed.length} completed
              </p>
            </div>
          </div>
          <ProgressRing value={overall} size={96} stroke={11}>
            <div className="text-center">
              <CountUp value={overall} className="text-[22px] font-extrabold text-slate-800 dark:text-white" />
              <span className="text-[13px] font-bold text-slate-400">%</span>
            </div>
          </ProgressRing>
        </Card>
      </motion.div>

      {/* ---- streak + today ---- */}
      <motion.div {...stagger(3)} className="grid grid-cols-2 gap-4 lg:col-span-1">
        <Card className="relative overflow-hidden" onClick={() => go('analytics')}>
          <div className="pointer-events-none absolute -top-8 -right-8 size-24 rounded-full bg-amber-400/20 blur-xl" />
          <span className="relative grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Icon name="flame" size={20} solid />
          </span>
          <p className="mt-3 text-[12px] font-bold text-slate-400">Day streak</p>
          <p className="text-[24px] leading-tight font-extrabold text-slate-800 dark:text-white">
            <CountUp value={streak} /> <span className="text-[13px] font-bold text-slate-400">{plural(streak, 'day')}</span>
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-400">Best: {bestStreak}</p>
        </Card>
        <Card onClick={() => goTab('habits')}>
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30">
            <Icon name="habits" size={20} strokeWidth={2} />
          </span>
          <p className="mt-3 text-[12px] font-bold text-slate-400">Today&apos;s tasks</p>
          <p className="text-[24px] leading-tight font-extrabold text-slate-800 dark:text-white">
            {doneToday}
            <span className="text-[13px] font-bold text-slate-400">/{data.habits.length}</span>
          </p>
          <ProgressBar value={data.habits.length ? (doneToday / data.habits.length) * 100 : 0} height="h-1.5" className="mt-2" barClass="bg-gradient-to-r from-emerald-500 to-teal-400" />
        </Card>
      </motion.div>

      {/* ---- quick actions ---- */}
      <motion.div {...stagger(4)} className="lg:col-span-2">
        <Card className="h-full">
          <SectionHeader title="Quick actions" />
          <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-1">
            {quickActions.map((a, i) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.94 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={a.fn}
                className="group flex w-[5.4rem] shrink-0 flex-col items-center gap-2 rounded-2xl bg-slate-50 px-2 py-3.5 ring-1 ring-slate-100 transition hover:bg-white hover:shadow-soft hover:ring-slate-200 dark:bg-white/5 dark:ring-white/8 dark:hover:bg-white/10"
              >
                <span className={cx('grid size-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform group-hover:scale-110', a.grad)}>
                  <Icon name={a.icon} size={20} strokeWidth={2.1} />
                </span>
                <span className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300">{a.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* ---- milestone hero ---- */}
      <motion.div {...stagger(5)} className="lg:row-span-2">
        <div
          onClick={() => nextMilestone && go('goal', nextMilestone.goal.id)}
          className="relative h-full min-h-44 cursor-pointer overflow-hidden rounded-3xl shadow-lift"
        >
          <img src="/images/milestone-hero.webp" alt="Milestone" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
          <div className="relative flex h-full flex-col justify-end p-5 text-white">
            <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-300 uppercase">Milestone</p>
            {nextMilestone ? (
              <>
                <h3 className="mt-1 text-[18px] leading-snug font-extrabold">{nextMilestone.m.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-white/80">
                  <Icon name="flag" size={13} /> {nextMilestone.goal.title}
                  {nextMilestone.m.dueDate && (
                    <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-bold backdrop-blur">
                      {fmtDay(nextMilestone.m.dueDate)}
                    </span>
                  )}
                </p>
              </>
            ) : (
              <h3 className="mt-1 text-[18px] leading-snug font-extrabold">Every summit starts with a single step</h3>
            )}
          </div>
        </div>
      </motion.div>

      {/* ---- today's habits preview ---- */}
      <motion.div {...stagger(6)} className="lg:col-span-1">
        <Card className="h-full">
          <SectionHeader title="Today's habits" action="View all" onAction={() => goTab('habits')} />
          {habitsToday.length === 0 ? (
            <div className="py-2 text-center">
              <p className="text-[13px] font-semibold text-slate-400">No habits yet — start your first streak.</p>
              <Button size="sm" variant="soft" className="mt-3" icon="plus" onClick={() => openSheet({ kind: 'habit' })}>
                Add habit
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {habitsToday.slice(0, 3).map(({ h, done }) => {
                const c = habitColor(h.color);
                return (
                  <div key={h.id} className="flex items-center gap-3 rounded-2xl px-1 py-1.5">
                    <span className={cx('grid size-9 shrink-0 place-items-center rounded-xl', c.blob, c.text)}>
                      <Icon name={h.icon} size={17} />
                    </span>
                    <span className={cx('min-w-0 flex-1 truncate text-[13.5px] font-bold', done ? 'text-slate-400 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-700 dark:text-slate-200')}>
                      {h.title}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => toggleHabit(h.id)}
                      aria-label={done ? 'Uncheck habit' : 'Check habit'}
                      className={cx(
                        'grid size-8 shrink-0 place-items-center rounded-full ring-2 transition-all',
                        done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white ring-emerald-400/0 shadow-md shadow-emerald-500/30' : 'text-transparent ring-slate-200 hover:ring-emerald-300 dark:ring-white/20',
                      )}
                    >
                      <Icon name="check" size={15} strokeWidth={3.2} />
                    </motion.button>
                  </div>
                );
              })}
              {habitsToday.length > 3 && (
                <p className="pt-1 pl-1 text-[11.5px] font-bold text-slate-400">+{habitsToday.length - 3} more in Habits</p>
              )}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ---- upcoming deadlines ---- */}
      <motion.div {...stagger(7)} className="lg:col-span-1">
        <Card className="h-full">
          <SectionHeader title="Upcoming deadlines" action="Calendar" onAction={() => go('calendar')} />
          {upcoming.length === 0 ? (
            <p className="py-3 text-center text-[13px] font-semibold text-slate-400">Nothing scheduled. Dream something up!</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((goal) => {
                const meta = CATEGORY_META[goal.category];
                const days = Math.round((new Date(`${goal.deadline}T12:00:00`).getTime() - new Date(`${today}T12:00:00`).getTime()) / 86_400_000);
                return (
                  <button
                    key={goal.id}
                    onClick={() => go('goal', goal.id)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-slate-50/80 p-2.5 ring-1 ring-slate-100 transition hover:ring-primary-200 active:scale-[0.99] dark:bg-white/5 dark:ring-white/8"
                  >
                    <span className={cx('grid w-11 shrink-0 flex-col place-items-center rounded-xl py-1.5 text-white shadow-md', `bg-gradient-to-br ${meta.gradient}`)}>
                      <span className="text-[15px] leading-none font-extrabold">{goal.deadline.slice(8, 10)}</span>
                      <span className="text-[8.5px] font-bold tracking-wider uppercase opacity-85">
                        {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(`${goal.deadline}T12:00:00`))}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[13px] font-bold text-slate-700 dark:text-slate-200">{goal.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                        <span className={cx('size-1.5 rounded-full', PRIORITY_META[goal.priority].dot)} />
                        {goal.category}
                      </span>
                    </span>
                    <span
                      className={cx(
                        'shrink-0 rounded-full px-2 py-1 text-[10.5px] font-extrabold',
                        days < 0
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
                          : days <= 3
                            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300'
                            : 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300',
                      )}
                    >
                      {deadlineLabel(goal)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ---- recent activity ---- */}
      <motion.div {...stagger(8)} className="lg:col-span-2">
        <Card className="h-full">
          <SectionHeader title="Recent activity" action={data.goals.length ? 'My goals' : undefined} onAction={() => goTab('goals')} />
          {recentActivity.length === 0 ? (
            <p className="py-3 text-center text-[13px] font-semibold text-slate-400">Your wins will show up here.</p>
          ) : (
            <div className="relative space-y-1">
              {recentActivity.map((a, i) => {
                const conf = ACTIVITY_ICON[a.type];
                return (
                  <div key={a.id} className="relative flex items-center gap-3 rounded-2xl px-1 py-1.5">
                    {i < recentActivity.length - 1 && <span className="absolute top-9 left-[18px] h-[calc(100%-14px)] w-px bg-slate-100 dark:bg-white/8" />}
                    <span className={cx('relative grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-white dark:ring-slate-900', conf.cls)}>
                      <Icon name={conf.icon} size={15} strokeWidth={2.2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-600 dark:text-slate-300">{a.text}</span>
                    <span className="shrink-0 text-[11px] font-bold text-slate-400">{fmtRel(a.at)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* ---- next badge / install ---- */}
      <motion.div {...stagger(9)} className="space-y-4 lg:col-span-1">
        {nextBadge && (
          <Card onClick={() => go('achievements')} className="relative overflow-hidden">
            <div className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-violet-400/15 blur-2xl" />
            <div className="flex items-center gap-3.5">
              <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg saturate-[0.35]', nextBadge.gradient)}>
                <Icon name={nextBadge.icon} size={23} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Next badge</p>
                <p className="text-[14.5px] font-extrabold text-slate-800 dark:text-white">{nextBadge.name}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar value={(nextBadge.value(stats) / nextBadge.target) * 100} height="h-1.5" />
                  <span className="shrink-0 text-[10.5px] font-extrabold text-slate-400">
                    {Math.min(nextBadge.value(stats), nextBadge.target)}/{nextBadge.target}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}
        <InstallCard />
      </motion.div>
    </div>
  );
}
