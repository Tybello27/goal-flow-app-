import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { CATEGORIES } from '../types';
import { CATEGORY_META } from '../lib/meta';
import {
  activeDaysSet,
  completionsPerWeek,
  computeXp,
  cx,
  fmtDay,
  globalStreak,
  isoAddDays,
  longestStreak,
  progressOf,
  todayISO,
  weeklyReport,
  weeklyTrend,
} from '../lib/utils';
import { Card, SectionHeader, Segmented } from '../components/ui';
import { AreaChart, BarChart, DonutChart } from '../components/charts';
import { Icon } from '../components/icons';

export function Analytics() {
  const { data } = useApp();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const today = todayISO();

  const trend = useMemo(() => weeklyTrend(data.habits, today), [data.habits, today]);
  const report = useMemo(() => weeklyReport(data.habits, data.goals, today), [data.habits, data.goals, today]);
  const weekBars = useMemo(() => completionsPerWeek(data.goals, data.habits, 6, today), [data.goals, data.habits, today]);

  const active = data.goals.filter((g) => !g.archived && !g.completedAt);
  const completed = data.goals.filter((g) => !g.archived && g.completedAt);
  const nonArchived = data.goals.filter((g) => !g.archived);
  const completionRate = nonArchived.length ? Math.round((completed.length / nonArchived.length) * 100) : 0;
  const streak = globalStreak(data.goals, data.habits, today);
  const best = longestStreak(activeDaysSet(data.goals, data.habits), today);
  const xp = computeXp(data.goals, data.habits, Object.keys(data.unlocked).length);

  const categoryData = useMemo(() => {
    return CATEGORIES.map((c) => {
      const goals = data.goals.filter((g) => !g.archived && g.category === c);
      if (goals.length === 0) return null;
      const avg = Math.round(goals.reduce((n, g) => n + (g.completedAt ? 100 : progressOf(g)), 0) / goals.length);
      return { category: c, count: goals.length, avg, meta: CATEGORY_META[c] };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
  }, [data.goals]);

  const streakHistory = useMemo(() => {
    const days = activeDaysSet(data.goals, data.habits);
    return Array.from({ length: 14 }, (_, i) => {
      const iso = isoAddDays(i - 13, today);
      return { iso, active: days.has(iso) };
    });
  }, [data.goals, data.habits, today]);

  const statCards = [
    { icon: 'goals', label: 'Active goals', value: String(active.length), cls: 'bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300' },
    { icon: 'trophy', label: 'Completion rate', value: `${completionRate}%`, cls: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300' },
    { icon: 'flame', label: 'Best streak', value: `${Math.max(streak, best)}d`, cls: 'bg-orange-100 text-orange-500 dark:bg-orange-500/15 dark:text-orange-300' },
    { icon: 'zap', label: 'Total XP', value: xp.toLocaleString(), cls: 'bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300' },
  ];

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-6xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
          <p className="mt-0.5 text-[12.5px] font-semibold text-slate-400">Your productivity, visualized</p>
        </div>
        <Segmented
          options={[
            { value: 'week' as const, label: 'Weekly' },
            { value: 'month' as const, label: 'Monthly' },
          ]}
          value={period}
          onChange={setPeriod}
          size="sm"
          className="w-44"
        />
      </motion.div>

      {/* stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}>
            <Card className="flex items-center gap-3 p-4">
              <span className={cx('grid size-11 shrink-0 place-items-center rounded-2xl', s.cls)}>
                <Icon name={s.icon} size={20} strokeWidth={2} />
              </span>
              <div>
                <p className="text-[17px] leading-none font-extrabold text-slate-800 dark:text-white">{s.value}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">{s.label}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* trend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <SectionHeader title="Completion trend" />
            <AreaChart
              data={trend.map((t) => t.value)}
              labels={trend.map((t) => t.label)}
            />
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 dark:bg-white/4">
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400">Best day this week</span>
              <span className="text-[13px] font-extrabold text-emerald-500">
                {(() => {
                  const bestDay = trend.reduce((a, b) => (b.value > a.value ? b : a), trend[0]);
                  return `${fmtDay(bestDay.iso)} · ${bestDay.value}%`;
                })()}
              </span>
            </div>
          </Card>
        </motion.div>

        {/* monthly / report */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <Card>
            <SectionHeader title="Activity report" />
            <BarChart data={period === 'week' ? weekBars.slice(-4) : weekBars} />
          </Card>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 p-5 text-white shadow-lift">
            <div className="pointer-events-none absolute -top-10 -right-8 size-36 rounded-full bg-emerald-400/25 blur-2xl" />
            <p className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-primary-200 uppercase">
              <Icon name="trend" size={14} /> Weekly report
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[24px] leading-none font-extrabold">{report.thisWeek.done}</p>
                <p className="mt-1 text-[10.5px] font-bold text-primary-200">habit check-ins</p>
              </div>
              <div>
                <p className="text-[24px] leading-none font-extrabold">{report.milestonesThisWeek}</p>
                <p className="mt-1 text-[10.5px] font-bold text-primary-200">milestones done</p>
              </div>
              <div>
                <p className={cx('flex items-center gap-1 text-[24px] leading-none font-extrabold', report.delta >= 0 ? 'text-emerald-300' : 'text-rose-300')}>
                  <Icon name={report.delta >= 0 ? 'trend' : 'down'} size={18} />
                  {Math.abs(report.delta)}%
                </p>
                <p className="mt-1 text-[10.5px] font-bold text-primary-200">vs last week</p>
              </div>
            </div>
            <p className="relative mt-4 rounded-2xl bg-white/10 px-4 py-2.5 text-[12px] leading-relaxed font-semibold text-primary-50 backdrop-blur-sm">
              {report.delta >= 20
                ? 'You are on fire! Output is well above last week — protect this momentum.'
                : report.delta >= 0
                  ? 'Steady climb. A little more consistency and the curve bends upward.'
                  : 'A quieter week. Pick one tiny habit today and restart the streak.'}
            </p>
          </div>
        </motion.div>

        {/* category donut */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <SectionHeader title="Goals by category" />
            {categoryData.length === 0 ? (
              <p className="py-6 text-center text-[13px] font-semibold text-slate-400">Create goals to see the breakdown.</p>
            ) : (
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                <DonutChart
                  segments={categoryData.map((c) => ({ value: c.count, color: c.meta.ring, label: c.category }))}
                  centerLabel={String(nonArchived.length)}
                  centerSub="goals"
                  size={140}
                />
                <div className="w-full flex-1 space-y-2.5">
                  {categoryData.map((c) => (
                    <div key={c.category}>
                      <div className="flex items-center justify-between text-[12px] font-bold">
                        <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <span className="size-2 rounded-full" style={{ backgroundColor: c.meta.ring }} />
                          {c.category}
                        </span>
                        <span className="text-slate-400">
                          {c.count} · {c.avg}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: c.meta.ring }}
                          initial={{ width: 0 }}
                          animate={{ width: `${c.avg}%` }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* streak history */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <SectionHeader title="Streak history" />
            <div className="flex flex-wrap items-center gap-2">
              {streakHistory.map((d, i) => (
                <motion.div
                  key={d.iso}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.03, type: 'spring', stiffness: 300, damping: 18 }}
                  title={fmtDay(d.iso)}
                  className={cx(
                    'grid size-9 flex-col place-items-center rounded-xl text-[9px] font-extrabold ring-1',
                    d.active
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/25 ring-emerald-400/0'
                      : 'bg-slate-50 text-slate-300 ring-slate-100 dark:bg-white/4 dark:text-slate-600 dark:ring-white/8',
                  )}
                >
                  {d.active ? <Icon name="check" size={15} strokeWidth={3} /> : d.iso.slice(8)}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-2.5 text-[12px] font-semibold text-slate-500 dark:bg-white/4 dark:text-slate-400">
              Current streak: <span className="font-extrabold text-amber-500">{streak} day{streak === 1 ? '' : 's'}</span> · any habit check-in or milestone keeps it alive.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
