import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { CATEGORY_META, PRIORITY_META, habitColor } from '../lib/meta';
import {
  cx,
  daysUntil,
  deadlineLabel,
  fmtDay,
  fmtDayFull,
  progressOf,
  statusOf,
  STATUS_META,
  todayISO,
  habitDoneOn,
  habitStreak,
} from '../lib/utils';
import { Button, Card, IconBtn, SectionHeader, Toggle } from '../components/ui';
import { ProgressRing } from '../components/charts';
import { Icon } from '../components/icons';
import { EmptyState } from '../components/ui';

export function GoalDetail({ goalId }: { goalId: string }) {
  const {
    data,
    back,
    go,
    openSheet,
    toggleFavorite,
    toggleArchive,
    deleteGoal,
    completeGoal,
    reopenGoal,
    toggleMilestone,
    addMilestone,
    deleteMilestone,
    setGoalProgress,
    updateGoal,
    toggleHabit,
  } = useApp();

  const goal = data.goals.find((g) => g.id === goalId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msDate, setMsDate] = useState('');

  if (!goal) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState icon="goals" title="Goal not found" body="It may have been deleted. Head back to keep flowing." action="Back to goals" onAction={() => back()} />
      </div>
    );
  }

  const meta = CATEGORY_META[goal.category];
  const status = statusOf(goal);
  const progress = progressOf(goal);
  const done = goal.milestones.filter((m) => m.done).length;
  const days = daysUntil(goal.deadline);
  const linkedHabits = data.habits.filter((h) => h.goalId === goal.id);
  const today = todayISO();

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-3xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <IconBtn icon="left" label="Back" onClick={() => back()} className="bg-white shadow-soft ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10" />
        <h1 className="text-[17px] font-extrabold text-slate-800 dark:text-white">Goal Details</h1>
        <div className="relative">
          <IconBtn
            icon="dots"
            label="Options"
            onClick={() => setMenuOpen((o) => !o)}
            className="bg-white shadow-soft ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10"
          />
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -6 }}
                  className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lift ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/15"
                >
                  {[
                    { icon: 'edit', label: 'Edit goal', fn: () => openSheet({ kind: 'goal', goalId: goal.id }) },
                    { icon: 'star', label: goal.favorite ? 'Unfavorite' : 'Favorite', fn: () => toggleFavorite(goal.id) },
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
                        'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-bold transition',
                        'danger' in a && a.danger ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5',
                      )}
                    >
                      <Icon name={a.icon} size={15} /> {a.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className={cx('relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-lift', meta.gradient)}
      >
        <div className="pointer-events-none absolute -top-14 -right-10 size-44 rounded-full bg-white/12 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-8 size-44 rounded-full bg-black/12 blur-2xl" />

        <div className="relative flex items-center gap-2">
          <span className="glass-chip">
            <Icon name={meta.icon} size={12} strokeWidth={2.4} /> {goal.category}
          </span>
          <span className="glass-chip">
            <Icon name="flag" size={12} strokeWidth={2.6} /> {PRIORITY_META[goal.priority].label}
          </span>
          {goal.favorite && (
            <span className="glass-chip bg-amber-400/30">
              <Icon name="star" size={12} solid /> Favorite
            </span>
          )}
        </div>

        <h2 className="relative mt-3 text-[24px] leading-tight font-extrabold tracking-tight">{goal.title}</h2>
        {goal.description && <p className="relative mt-2 max-w-lg text-[13.5px] leading-relaxed text-white/85">{goal.description}</p>}

        <div className="relative mt-5 flex items-center gap-5">
          <div className="rounded-3xl bg-white/10 p-3 backdrop-blur-sm">
            <ProgressRing value={progress} size={104} stroke={11} from="#ffffff" to="#d1fae5" track="rgba(255,255,255,0.22)">
              <div className="text-center">
                <span className="text-[26px] font-extrabold">{progress}</span>
                <span className="text-[14px] font-bold opacity-70">%</span>
              </div>
            </ProgressRing>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2">
            {[
              { icon: 'calendar', label: 'Deadline', value: fmtDay(goal.deadline) },
              { icon: 'timer', label: 'Status', value: status === 'completed' || status === 'overdue' || status === 'archived' ? STATUS_META[status].label : `${STATUS_META[status].label} · ${deadlineLabel(goal)}` },
              { icon: 'checkCircle', label: 'Milestones', value: goal.milestones.length ? `${done}/${goal.milestones.length}` : '—' },
              { icon: 'bell', label: 'Reminder', value: goal.reminder.enabled ? goal.reminder.time : 'Off' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-black/12 px-3 py-2 backdrop-blur-sm">
                <p className="flex items-center gap-1 text-[10px] font-bold tracking-wider text-white/65 uppercase">
                  <Icon name={s.icon} size={11} /> {s.label}
                </p>
                <p className="mt-0.5 text-[13px] font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {!goal.archived && (
          <div className="relative mt-5">
            {goal.completedAt ? (
              <button
                onClick={() => reopenGoal(goal.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-3.5 text-[14px] font-extrabold backdrop-blur transition hover:bg-white/25 active:scale-[0.98]"
              >
                <Icon name="refresh" size={17} /> Reopen this goal
              </button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => completeGoal(goal.id)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-[14.5px] font-extrabold text-slate-900 shadow-xl transition hover:shadow-2xl"
              >
                <Icon name="trophy" size={18} className="text-amber-500" />
                {progress === 100 ? 'Claim your completion 🎉' : 'Mark as complete'}
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* completed banner */}
      {goal.completedAt && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 flex items-center gap-3 rounded-3xl bg-emerald-50 p-4 ring-1 ring-emerald-200/60 dark:bg-emerald-500/10 dark:ring-emerald-400/20">
          <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
            <Icon name="trophy" size={20} />
          </span>
          <div>
            <p className="text-[14px] font-extrabold text-emerald-700 dark:text-emerald-300">Completed {fmtDayFull(goal.completedAt.slice(0, 10))}</p>
            <p className="text-[12px] font-semibold text-emerald-600/80 dark:text-emerald-400/80">You earned +100 XP for this win.</p>
          </div>
        </motion.div>
      )}

      {/* milestones */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Card className="mt-4">
          <SectionHeader title={`Milestones ${goal.milestones.length ? `· ${done}/${goal.milestones.length}` : ''}`} />
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {goal.milestones.map((m, i) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className={cx(
                    'group flex items-center gap-3 rounded-2xl p-2.5 ring-1 transition',
                    m.done ? 'bg-emerald-50/60 ring-emerald-100 dark:bg-emerald-500/8 dark:ring-emerald-400/15' : 'bg-slate-50/80 ring-slate-100 dark:bg-white/4 dark:ring-white/8',
                  )}
                >
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    aria-label={m.done ? 'Uncheck milestone' : 'Complete milestone'}
                    className={cx(
                      'grid size-7.5 shrink-0 place-items-center rounded-full transition-all',
                      m.done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30' : 'bg-white text-transparent ring-2 ring-slate-200 hover:ring-emerald-300 dark:bg-white/10 dark:ring-white/20',
                    )}
                  >
                    <motion.span initial={false} animate={{ scale: m.done ? 1 : 0.4 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                      <Icon name="check" size={14} strokeWidth={3.4} />
                    </motion.span>
                  </motion.button>
                  <div className="min-w-0 flex-1">
                    <p className={cx('truncate text-[13.5px] font-bold transition', m.done ? 'text-slate-400 line-through decoration-emerald-400/70 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200')}>
                      {m.title}
                    </p>
                    {m.dueDate && !m.done && (
                      <p className={cx('text-[11px] font-semibold', m.dueDate < today ? 'text-rose-500' : 'text-slate-400')}>
                        Due {fmtDay(m.dueDate)} {m.dueDate < today && '· overdue'}
                      </p>
                    )}
                  </div>
                  {!m.done && (
                    <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-400 group-hover:hidden dark:bg-white/10">
                      #{i + 1}
                    </span>
                  )}
                  <IconBtn icon="x" label="Delete milestone" className="size-7 opacity-0 transition group-hover:opacity-100" onClick={() => deleteMilestone(goal.id, m.id)} />
                </motion.div>
              ))}
            </AnimatePresence>

            {goal.milestones.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-center text-[12.5px] font-semibold text-slate-400 dark:bg-white/4">
                Break this goal into milestones for automatic progress tracking.
              </p>
            )}
          </div>

          {!goal.completedAt && (
            <div className="mt-3 space-y-2 rounded-2xl border border-dashed border-slate-200 p-3 dark:border-white/10">
              <div className="flex gap-2">
                <input
                  className="field-input border-none bg-transparent px-2 py-1.5 text-[13px] ring-0 dark:bg-transparent"
                  placeholder="Add a milestone…"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && msTitle.trim()) {
                      addMilestone(goal.id, msTitle, msDate || undefined);
                      setMsTitle('');
                      setMsDate('');
                    }
                  }}
                />
                <input type="date" aria-label="Milestone due date" className="field-input w-10 border-none bg-transparent p-0 text-transparent ring-0" value={msDate} onChange={(e) => setMsDate(e.target.value)} />
                <Button
                  size="sm"
                  variant="soft"
                  className="shrink-0"
                  onClick={() => {
                    if (!msTitle.trim()) return;
                    addMilestone(goal.id, msTitle, msDate || undefined);
                    setMsTitle('');
                    setMsDate('');
                  }}
                >
                  <Icon name="plus" size={15} strokeWidth={2.8} /> Add
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* manual progress when no milestones */}
      {goal.milestones.length === 0 && !goal.completedAt && (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="mt-4">
            <SectionHeader title="Progress" />
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={goal.progress}
                onChange={(e) => setGoalProgress(goal.id, Number(e.target.value))}
                className="flex-1"
                style={{
                  background: `linear-gradient(to right, var(--color-primary-500) ${goal.progress}%, rgba(100,116,139,0.18) ${goal.progress}%)`,
                }}
                aria-label="Goal progress"
              />
              <span className="w-14 rounded-2xl bg-primary-50 py-2 text-center text-[15px] font-extrabold text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                {goal.progress}%
              </span>
            </div>
            {goal.progress >= 100 && (
              <p className="mt-3 rounded-xl bg-emerald-50 px-3.5 py-2 text-[12px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                100% — hit “Mark as complete” above to celebrate! 🎉
              </p>
            )}
          </Card>
        </motion.div>
      )}

      {/* linked habits */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="mt-4">
          <SectionHeader title="Linked habits" action="New habit" onAction={() => openSheet({ kind: 'habit' })} />
          {linkedHabits.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-center text-[12.5px] font-semibold text-slate-400 dark:bg-white/4">
              No habits linked yet. Daily habits supercharge this goal.
            </p>
          ) : (
            <div className="space-y-2">
              {linkedHabits.map((h) => {
                const c = habitColor(h.color);
                const doneToday = habitDoneOn(h, today);
                return (
                  <div key={h.id} className="flex items-center gap-3 rounded-2xl bg-slate-50/80 p-2.5 ring-1 ring-slate-100 dark:bg-white/4 dark:ring-white/8">
                    <span className={cx('grid size-10 place-items-center rounded-xl', c.blob, c.text)}>
                      <Icon name={h.icon} size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-bold text-slate-700 dark:text-slate-200">{h.title}</p>
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                        <Icon name="flame" size={11} solid /> {habitStreak(h)} day streak
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.82 }}
                      onClick={() => toggleHabit(h.id)}
                      aria-label="Toggle habit for today"
                      className={cx(
                        'grid size-9 place-items-center rounded-full transition-all',
                        doneToday ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/30' : 'bg-white text-transparent ring-2 ring-slate-200 hover:ring-emerald-300 dark:bg-white/10 dark:ring-white/15',
                      )}
                    >
                      <Icon name="check" size={16} strokeWidth={3.2} />
                    </motion.button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      {/* reminder */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Card className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-500 dark:bg-amber-500/15 dark:text-amber-300">
                <Icon name="bell" size={20} />
              </span>
              <div>
                <p className="text-[14px] font-extrabold text-slate-700 dark:text-slate-100">Deadline reminders</p>
                <p className="text-[12px] text-slate-400">Get nudged as this goal approaches</p>
              </div>
            </div>
            <Toggle on={goal.reminder.enabled} onChange={(v) => updateGoal(goal.id, { reminder: { ...goal.reminder, enabled: v } })} />
          </div>
          {goal.reminder.enabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex items-center gap-3 overflow-hidden">
              <input
                type="time"
                className="field-input max-w-36 py-2"
                value={goal.reminder.time}
                onChange={(e) => updateGoal(goal.id, { reminder: { ...goal.reminder, time: e.target.value } })}
                aria-label="Reminder time"
              />
              <p className="text-[12px] font-semibold text-slate-400">Daily at this time while the deadline is near</p>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* motivation */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="relative mt-4 overflow-hidden rounded-3xl shadow-lift">
        <img src="/images/motivation-runner.webp" alt="Keep going" className="h-36 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-900/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center p-5 text-white">
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-amber-300 uppercase">Keep flowing</p>
          <p className="mt-1 max-w-[26ch] text-[17px] leading-snug font-extrabold">
            {status === 'completed' ? 'On to the next summit.' : 'Every milestone checked is a step closer.'}
          </p>
        </div>
      </motion.div>

      {/* danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }} className="mt-4 flex gap-3 pb-2">
        <Button variant="soft" className="flex-1" icon="archive" onClick={() => toggleArchive(goal.id)}>
          {goal.archived ? 'Restore goal' : 'Archive'}
        </Button>
        <Button
          variant="danger"
          className="flex-1"
          icon="trash"
          onClick={() =>
            openSheet({
              kind: 'confirm',
              title: 'Delete this goal?',
              body: `“${goal.title}” and its milestones will be permanently removed.`,
              confirmLabel: 'Delete goal',
              danger: true,
              onConfirm: () => deleteGoal(goal.id),
            })
          }
        >
          Delete
        </Button>
      </motion.div>
    </div>
  );
}
