import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { cx, fmtClock, habitDoneOn, habitStreak, isoAddDays, todayISO, longestStreak } from '../lib/utils';
import { habitColor } from '../lib/meta';
import { Card, EmptyState, ProgressBar } from '../components/ui';
import { Icon } from '../components/icons';
import { ProgressRing } from '../components/charts';

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function Habits() {
  const { data, openSheet, toggleHabit, go } = useApp();
  const today = todayISO();

  const doneCount = data.habits.filter((h) => habitDoneOn(h, today)).length;
  const rate = data.habits.length ? Math.round((doneCount / data.habits.length) * 100) : 0;
  const best = data.habits.reduce((n, h) => Math.max(n, longestStreak(h.log, today)), 0);
  const currentBest = data.habits.reduce((n, h) => Math.max(n, habitStreak(h, today)), 0);
  const allDone = data.habits.length > 0 && doneCount === data.habits.length;

  const last7 = Array.from({ length: 7 }, (_, i) => isoAddDays(i - 6, today));

  const dateLine = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-3xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">Daily Habits</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-400">
            {dateLine}
            {allDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10.5px] font-extrabold text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                <Icon name="sun" size={11} /> Perfect day!
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => openSheet({ kind: 'habit' })}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-xl active:scale-95"
        >
          <Icon name="plus" size={15} strokeWidth={2.8} /> Habit
        </button>
      </motion.div>

      {/* hero */}
      {data.habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-5 text-white shadow-lift"
        >
          <div className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-white/12 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-6 size-40 rounded-full bg-black/12 blur-2xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.18em] text-emerald-100 uppercase">Today&apos;s completion</p>
              <p className="mt-1 text-[26px] leading-tight font-extrabold">
                {doneCount} of {data.habits.length} <span className="text-[14px] font-bold text-emerald-100/80">habits</span>
              </p>
              <div className="mt-3 flex gap-4 text-[12px] font-bold text-emerald-50">
                <span className="flex items-center gap-1.5">
                  <Icon name="flame" size={14} solid className="text-amber-300" /> Best streak: {currentBest}d
                </span>
                <span className="flex items-center gap-1.5">
                  <Icon name="crown" size={14} className="text-amber-300" /> Record: {best}d
                </span>
              </div>
            </div>
            <div className="rounded-3xl bg-white/10 p-2.5 backdrop-blur-sm">
              <ProgressRing value={rate} size={92} stroke={10} from="#fde68a" to="#ffffff" track="rgba(255,255,255,0.22)">
                <div className="text-center">
                  <span className="text-[22px] font-extrabold">{rate}</span>
                  <span className="text-[12px] font-bold text-emerald-50/80">%</span>
                </div>
              </ProgressRing>
            </div>
          </div>
        </motion.div>
      )}

      {/* list */}
      <div className="mt-4 space-y-3 pb-2">
        {data.habits.map((h, idx) => {
          const c = habitColor(h.color);
          const done = habitDoneOn(h, today);
          const streak = habitStreak(h, today);
          const goal = data.goals.find((g) => g.id === h.goalId);
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.06 }}
            >
              <Card
                onClick={() => openSheet({ kind: 'habit', habitId: h.id })}
                className={cx('flex items-center gap-3.5 p-4 transition', done && 'ring-emerald-200/70 dark:ring-emerald-400/20')}
              >
                <span className={cx('grid size-12 shrink-0 place-items-center rounded-2xl shadow-sm', c.blob, c.text)}>
                  <Icon name={h.icon} size={22} strokeWidth={1.9} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cx('truncate text-[14.5px] font-extrabold', done ? 'text-slate-400 line-through decoration-emerald-400/60' : 'text-slate-800 dark:text-slate-100')}>
                      {h.title}
                    </p>
                    {streak > 0 && (
                      <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-500 dark:bg-amber-500/10">
                        <Icon name="flame" size={10} solid />
                        {streak}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                    {goal ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          go('goal', goal.id);
                        }}
                        className="flex max-w-40 items-center gap-1 truncate rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 transition hover:bg-primary-50 hover:text-primary-600 dark:bg-white/8 dark:text-slate-400"
                      >
                        <Icon name="link" size={10} strokeWidth={2.4} />
                        <span className="truncate">{goal.title}</span>
                      </button>
                    ) : (
                      <span>No linked goal</span>
                    )}
                    {h.reminderTime && (
                      <span className="flex items-center gap-1">
                        <Icon name="alarm" size={11} /> {fmtClock(h.reminderTime)}
                      </span>
                    )}
                  </div>
                  {/* week dots */}
                  <div className="mt-2 flex gap-1">
                    {last7.map((iso, i) => {
                      const hit = h.log.includes(iso);
                      const isToday = iso === today;
                      return (
                        <div key={iso} className="flex flex-col items-center gap-0.5">
                          <span className={cx('text-[8.5px] font-extrabold', isToday ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600')}>
                            {WEEK_LETTERS[(new Date(`${iso}T12:00:00`)).getDay()]}
                          </span>
                          <motion.span
                            initial={false}
                            animate={{ scale: hit ? 1 : 0.85 }}
                            className={cx(
                              'size-2.5 rounded-full transition-colors',
                              hit ? '' : 'bg-slate-200 dark:bg-white/12',
                              isToday && 'ring-2 ring-emerald-300 ring-offset-1 dark:ring-offset-slate-900',
                            )}
                            style={hit ? { backgroundColor: c.hex } : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.78 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHabit(h.id);
                  }}
                  aria-label={done ? `Uncheck ${h.title}` : `Check ${h.title}`}
                  className={cx(
                    'grid size-11 shrink-0 place-items-center rounded-full transition-all duration-300',
                    done
                      ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/35'
                      : 'bg-slate-50 text-transparent ring-2 ring-slate-200 hover:bg-emerald-50 hover:ring-emerald-300 dark:bg-white/5 dark:ring-white/15 dark:hover:ring-emerald-400',
                  )}
                >
                  <motion.span animate={{ scale: done ? 1 : 0.6, rotate: done ? 0 : -90 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
                    <Icon name="check" size={20} strokeWidth={3.4} />
                  </motion.span>
                </motion.button>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {data.habits.length === 0 && (
        <div className="mt-4">
          <EmptyState
            icon="flame"
            title="No habits yet"
            body="Tiny daily actions compound into massive results. Start your first habit and light up a streak."
            action="Create your first habit"
            actionIcon="flame"
            onAction={() => openSheet({ kind: 'habit' })}
          />
        </div>
      )}

      {data.habits.length > 0 && !allDone && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="pb-2 text-center text-[12px] font-semibold text-slate-400">
          Complete all {data.habits.length} habits today to earn a <span className="text-amber-500">Perfect Day</span> ⭐
        </motion.p>
      )}
    </div>
  );
}
