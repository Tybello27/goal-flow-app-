import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Goal } from '../types';
import { CATEGORY_META, PRIORITY_META } from '../lib/meta';
import { cx, deadlineLabel, fmtDay, progressOf, statusOf, STATUS_META } from '../lib/utils';
import { Icon } from './icons';
import { useApp } from '../store/AppContext';

const STATUS_GRADIENT: Record<string, string> = {
  completed: 'from-emerald-500 to-teal-600',
  overdue: 'from-rose-500 to-red-600',
  archived: 'from-slate-400 to-slate-600',
};

export function GoalCard({ goal, index = 0 }: { goal: Goal; index?: number }) {
  const { go, openSheet, toggleFavorite, toggleArchive, deleteGoal } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const status = statusOf(goal);
  const meta = CATEGORY_META[goal.category];
  const gradient = STATUS_GRADIENT[status] ?? meta.gradient;
  const progress = progressOf(goal);
  const doneMilestones = goal.milestones.filter((m) => m.done).length;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      onClick={() => go('goal', goal.id)}
      className={cx(
        'relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br p-[1.2rem] text-white shadow-lift',
        gradient,
        goal.archived && 'opacity-80 saturate-[0.6]',
      )}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-12 -right-8 size-36 rounded-full bg-white/12 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-6 size-36 rounded-full bg-black/10 blur-xl" />

      <div className="relative">
        {/* header */}
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Icon name={meta.icon} size={19} strokeWidth={2.1} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[16.5px] leading-snug font-extrabold tracking-tight">{goal.title}</h3>
            <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] font-semibold text-white/75">
              {goal.category}
              {status === 'completed' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                  <Icon name="checkCircle" size={11} strokeWidth={2.6} /> Completed
                </span>
              )}
              {status === 'overdue' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold">
                  <Icon name="alert" size={11} strokeWidth={2.6} /> Overdue
                </span>
              )}
              {status === 'archived' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold">
                  <Icon name="archive" size={11} strokeWidth={2.4} /> Archived
                </span>
              )}
            </p>
          </div>

          <button
            aria-label={goal.favorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(goal.id);
            }}
            className={cx(
              'grid size-9 shrink-0 place-items-center rounded-full transition active:scale-75',
              goal.favorite ? 'text-amber-300' : 'text-white/60 hover:text-white',
            )}
          >
            <motion.span whileTap={{ scale: 1.5 }} transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
              <Icon name="star" size={18} solid={goal.favorite} />
            </motion.span>
          </button>

          <div className="relative" ref={menuRef}>
            <button
              aria-label="Goal options"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="grid size-9 shrink-0 place-items-center rounded-full text-white/70 transition hover:bg-white/15 hover:text-white active:scale-90"
            >
              <Icon name="dots" size={20} strokeWidth={2.6} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  transition={{ duration: 0.16 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-10 right-0 z-20 w-44 overflow-hidden rounded-2xl bg-white p-1.5 text-slate-700 shadow-lift ring-1 ring-slate-900/10 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/15"
                >
                  {[
                    { icon: 'edit', label: 'Edit goal', fn: () => openSheet({ kind: 'goal', goalId: goal.id }) },
                    { icon: goal.favorite ? 'star' : 'star', label: goal.favorite ? 'Unfavorite' : 'Favorite', fn: () => toggleFavorite(goal.id) },
                    { icon: 'archive', label: goal.archived ? 'Restore' : 'Archive', fn: () => toggleArchive(goal.id) },
                    {
                      icon: 'trash',
                      label: 'Delete',
                      danger: true,
                      fn: () =>
                        openSheet({
                          kind: 'confirm',
                          title: 'Delete this goal?',
                          body: `“${goal.title}” and its milestones will be permanently removed.`,
                          confirmLabel: 'Delete goal',
                          danger: true,
                          onConfirm: () => deleteGoal(goal.id),
                        }),
                    },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={() => {
                        setMenuOpen(false);
                        a.fn();
                      }}
                      className={cx(
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-bold transition active:scale-[0.98]',
                        'danger' in a && a.danger ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5',
                      )}
                    >
                      <Icon name={a.icon} size={15} /> {a.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* progress */}
        <div className="mt-4 flex items-end justify-between">
          <span className="text-[11.5px] font-semibold text-white/80">
            Progress {goal.milestones.length > 0 && <span className="text-white/60">· {doneMilestones}/{goal.milestones.length} milestones</span>}
          </span>
          <span className="text-[15px] font-extrabold">{progress}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/15">
          <motion.div
            className="h-full rounded-full bg-white shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />
        </div>

        {/* footer */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={cx('glass-chip')}>
            <span className={cx('size-1.5 rounded-full', STATUS_META[status].dot, (status === 'in-progress' || status === 'not-started') && 'bg-white/90')} />
            {STATUS_META[status].label}
          </span>
          <span className={cx('glass-chip')}>
            <Icon name="flag" size={11} strokeWidth={2.6} />
            {PRIORITY_META[goal.priority].label} priority
          </span>
          <span className="glass-chip">
            <Icon name="calendar" size={11} strokeWidth={2.4} />
            {fmtDay(goal.deadline)} · {deadlineLabel(goal)}
          </span>
          {goal.reminder.enabled && (
            <span className="glass-chip">
              <Icon name="bell" size={11} strokeWidth={2.4} />
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
