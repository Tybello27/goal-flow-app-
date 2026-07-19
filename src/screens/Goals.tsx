import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { CATEGORIES, type GoalStatus } from '../types';
import { cx, statusOf, progressOf, daysUntil } from '../lib/utils';
import { CATEGORY_META } from '../lib/meta';
import { GoalCard } from '../components/GoalCard';
import { EmptyState, IconBtn } from '../components/ui';
import { Icon } from '../components/icons';

type Filter = 'all' | 'favorites' | GoalStatus;
type Sort = 'deadline' | 'recent' | 'progress' | 'priority';

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: '★ Favorites' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'not-started', label: 'Not Started' },
  { key: 'completed', label: 'Completed' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'archived', label: 'Archived' },
];

const PRIO_ORDER = { high: 0, medium: 1, low: 2 } as const;

export function Goals() {
  const { data, openSheet } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number] | 'All'>('All');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [sortOpen, setSortOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: data.goals.length, favorites: 0 };
    for (const g of data.goals) {
      const s = statusOf(g);
      c[s] = (c[s] ?? 0) + 1;
      if (g.favorite) c.favorites++;
    }
    return c;
  }, [data.goals]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data.goals.filter((g) => {
      if (category !== 'All' && g.category !== category) return false;
      const status = statusOf(g);
      if (filter === 'favorites') {
        if (!g.favorite) return false;
      } else if (filter !== 'all' && status !== filter) {
        return false;
      }
      if (q && !`${g.title} ${g.description} ${g.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'deadline':
          return daysUntil(a.deadline) - daysUntil(b.deadline);
        case 'progress':
          return progressOf(b) - progressOf(a);
        case 'priority':
          return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority];
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    // favorites first within "all"
    return list;
  }, [data.goals, query, category, filter, sort]);

  const emptyCopy = query
    ? { icon: 'search', title: `No matches for “${query}”`, body: 'Try a different keyword, category or status filter.' }
    : filter === 'favorites'
      ? { icon: 'star', title: 'No favorite goals yet', body: 'Tap the star on any goal to pin it here for quick access.' }
      : filter === 'completed'
        ? { icon: 'trophy', title: 'No completed goals — yet', body: 'Finish a goal and it will shine right here with confetti.' }
        : filter === 'archived'
          ? { icon: 'archive', title: 'Archive is empty', body: 'Archived goals rest here, out of sight but never lost.' }
          : filter === 'overdue'
            ? { icon: 'checkCircle', title: 'Nothing overdue. Nice!', body: 'Every deadline is under control. Keep the flow going.' }
            : { icon: 'goals', title: 'No goals yet', body: 'Your next big thing starts with a single goal. Create it now.' };

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-6xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">My Goals</h1>
          <p className="mt-0.5 text-[12.5px] font-semibold text-slate-400">
            {counts['in-progress'] ?? 0} in motion · {counts.completed ?? 0} completed
          </p>
        </div>
        <button
          onClick={() => openSheet({ kind: 'goal' })}
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-primary-600/30 transition hover:shadow-xl active:scale-95"
        >
          <Icon name="plus" size={15} strokeWidth={2.8} /> New Goal
        </button>
      </motion.div>

      {/* search + sort */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Icon name="search" size={17} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search goals…"
            className="field-input pl-11 shadow-soft"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-300 hover:text-slate-500" aria-label="Clear search">
              <Icon name="x" size={16} strokeWidth={2.4} />
            </button>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            aria-label="Sort goals"
            className="grid h-full w-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-soft ring-1 ring-slate-900/5 transition active:scale-95 dark:bg-slate-900 dark:text-slate-300 dark:ring-white/10"
          >
            <Icon name="sort" size={18} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -6 }}
                  className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/15"
                >
                  <p className="px-3 pt-1.5 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Sort by</p>
                  {(
                    [
                      ['recent', 'Recently added'],
                      ['deadline', 'Deadline'],
                      ['progress', 'Progress'],
                      ['priority', 'Priority'],
                    ] as Array<[Sort, string]>
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setSort(k);
                        setSortOpen(false);
                      }}
                      className={cx(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-[13px] font-bold transition',
                        sort === k ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5',
                      )}
                    >
                      {label}
                      {sort === k && <Icon name="check" size={14} strokeWidth={3} />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* status filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold ring-1 transition active:scale-95',
                active
                  ? 'bg-slate-900 text-white ring-slate-900 shadow-md dark:bg-white dark:text-slate-900 dark:ring-white'
                  : 'bg-white text-slate-500 ring-slate-200 hover:ring-slate-300 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
              )}
            >
              {f.label}
              <span className={cx('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-slate-100 text-slate-400 dark:bg-white/10')}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* category chips */}
      <div className="no-scrollbar -mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        {(['All', ...CATEGORIES] as const).map((c) => {
          const active = category === c;
          const meta = c === 'All' ? null : CATEGORY_META[c];
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cx(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold ring-1 transition active:scale-95',
                active
                  ? c === 'All'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white ring-primary-600 shadow-md shadow-primary-600/25'
                    : `bg-gradient-to-r ${meta!.gradient} text-white ring-transparent shadow-md`
                  : 'bg-white/70 text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10',
              )}
            >
              {meta && <Icon name={meta.icon} size={13} strokeWidth={2.2} />}
              {c}
            </button>
          );
        })}
      </div>

      {/* list */}
      <div className="mt-5 grid gap-4 pb-2 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((g, i) => (
            <GoalCard key={g.id} goal={g} index={i} />
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && (
        <EmptyState
          icon={emptyCopy.icon}
          title={emptyCopy.title}
          body={emptyCopy.body}
          action={filter === 'all' && !query ? 'Create your first goal' : undefined}
          onAction={() => openSheet({ kind: 'goal' })}
        />
      )}
    </div>
  );
}
