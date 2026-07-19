import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { CATEGORY_META } from '../lib/meta';
import { cx, fmtDay, fmtMonthYear, monthGrid, toISO, todayISO } from '../lib/utils';
import { Button, Card, IconBtn } from '../components/ui';
import { Icon } from '../components/icons';
import type { Goal, Milestone } from '../types';

interface CalEvent {
  kind: 'deadline' | 'milestone' | 'completed';
  goal: Goal;
  milestone?: Milestone;
}

export function CalendarScreen() {
  const { data, back, go } = useApp();
  const today = todayISO();
  const [ref, setRef] = useState(() => new Date());
  const [selected, setSelected] = useState(today);

  const events = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const push = (iso: string | undefined, e: CalEvent) => {
      if (!iso) return;
      const key = iso.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), e]);
    };
    for (const g of data.goals) {
      if (g.archived) continue;
      if (g.completedAt) push(g.completedAt, { kind: 'completed', goal: g });
      else push(g.deadline, { kind: 'deadline', goal: g });
      for (const m of g.milestones) {
        if (m.done) continue;
        push(m.dueDate, { kind: 'milestone', goal: g, milestone: m });
      }
    }
    return map;
  }, [data.goals]);

  const grid = useMemo(() => monthGrid(ref), [ref]);
  const move = (n: number) => setRef((r) => new Date(r.getFullYear(), r.getMonth() + n, 1));
  const selEvents = events.get(selected) ?? [];

  const legend = [
    { cls: 'bg-primary-500', label: 'Goal deadline' },
    { cls: 'bg-amber-400', label: 'Milestone due' },
    { cls: 'bg-emerald-500', label: 'Completed' },
  ];

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-3xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <IconBtn icon="left" label="Back" onClick={() => back()} className="bg-white shadow-soft ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10" />
        <h1 className="text-[17px] font-extrabold text-slate-800 dark:text-white">Timeline</h1>
        <Button size="sm" variant="soft" onClick={() => { setRef(new Date()); setSelected(today); }}>
          Today
        </Button>
      </motion.div>

      {/* calendar card */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white">{fmtMonthYear(ref)}</h2>
            <div className="flex gap-1">
              <IconBtn icon="left" label="Previous month" onClick={() => move(-1)} className="size-8" />
              <IconBtn icon="right" label="Next month" onClick={() => move(1)} className="size-8" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={i} className="pb-1 text-center text-[10.5px] font-extrabold tracking-wider text-slate-400">
                {d}
              </div>
            ))}
            {grid.map((cell) => {
              const isToday = cell.iso === today;
              const isSel = cell.iso === selected;
              const dayEvents = events.get(cell.iso) ?? [];
              return (
                <button
                  key={cell.iso}
                  onClick={() => setSelected(cell.iso)}
                  className={cx(
                    'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-[13px] font-bold transition-all active:scale-95',
                    !cell.inMonth && 'opacity-30',
                    isSel
                      ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                      : isToday
                        ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-400/60 dark:bg-primary-500/15 dark:text-primary-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/8',
                  )}
                >
                  {cell.day}
                  <span className="absolute bottom-1 flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={i}
                        className={cx(
                          'size-1.5 rounded-full',
                          isSel
                            ? 'bg-white'
                            : e.kind === 'deadline'
                              ? CATEGORY_META[e.goal.category].dot
                              : e.kind === 'milestone'
                                ? 'bg-amber-400'
                                : 'bg-emerald-500',
                        )}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 dark:border-white/8">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400">
                <span className={cx('size-2 rounded-full', l.cls)} /> {l.label}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* agenda */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="mt-4 pb-2">
          <h3 className="mb-2 text-[15px] font-bold text-slate-800 dark:text-slate-100">
            {selected === today ? "Today's schedule" : fmtDay(selected)}
            <span className="ml-2 text-[11px] font-bold text-slate-400">{selEvents.length} item{selEvents.length === 1 ? '' : 's'}</span>
          </h3>
          <AnimatePresence mode="popLayout">
            {selEvents.length === 0 ? (
              <motion.p
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl bg-slate-50 py-5 text-center text-[12.5px] font-semibold text-slate-400 dark:bg-white/4"
              >
                Nothing scheduled — enjoy the flow ✨
              </motion.p>
            ) : (
              selEvents.map((e, i) => {
                const meta = CATEGORY_META[e.goal.category];
                return (
                  <motion.button
                    key={`${e.goal.id}-${e.kind}-${e.milestone?.id ?? 0}`}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => go('goal', e.goal.id)}
                    className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-slate-50 active:scale-[0.99] dark:hover:bg-white/5"
                  >
                    <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', e.kind === 'completed' ? 'from-emerald-500 to-teal-600' : e.kind === 'milestone' ? 'from-amber-400 to-orange-500' : meta.gradient)}>
                      <Icon name={e.kind === 'completed' ? 'trophy' : e.kind === 'milestone' ? 'flag' : 'calendar'} size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-slate-700 dark:text-slate-200">
                        {e.kind === 'milestone' ? e.milestone!.title : e.goal.title}
                      </span>
                      <span className="block text-[11.5px] font-semibold text-slate-400">
                        {e.kind === 'deadline' && `Goal deadline · ${e.goal.category}`}
                        {e.kind === 'milestone' && `Milestone · ${e.goal.title}`}
                        {e.kind === 'completed' && `Completed · ${e.goal.category}`}
                      </span>
                    </span>
                    <Icon name="right" size={15} className="shrink-0 text-slate-300" />
                  </motion.button>
                );
              })
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
