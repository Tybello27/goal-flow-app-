import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { CATEGORIES, type Category, type Priority } from '../types';
import { Button, IconBtn, Sheet, Toggle } from './ui';
import { Icon } from './icons';
import { CATEGORY_META, HABIT_COLORS, HABIT_ICONS, habitColor } from '../lib/meta';
import { cx, fmtClock, isoAddDays, todayISO, uid } from '../lib/utils';

/* ------------------------------------------------------------------ */
/*  Goal form                                                           */
/* ------------------------------------------------------------------ */

interface DraftMilestone {
  id: string;
  title: string;
  dueDate: string;
}

export function GoalSheet() {
  const { sheet, closeSheet, data, createGoal, updateGoal, go } = useApp();
  const open = sheet?.kind === 'goal';
  const editId = sheet?.kind === 'goal' ? sheet.goalId : undefined;
  const existing = data.goals.find((g) => g.id === editId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Personal Development');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState(isoAddDays(30));
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [milestones, setMilestones] = useState<DraftMilestone[]>([]);
  const [msTitle, setMsTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setCategory(existing.category);
      setPriority(existing.priority);
      setDeadline(existing.deadline);
      setReminderOn(existing.reminder.enabled);
      setReminderTime(existing.reminder.time);
      setMilestones(existing.milestones.map((m) => ({ id: m.id, title: m.title, dueDate: m.dueDate ?? '' })));
    } else {
      setTitle('');
      setDescription('');
      setCategory('Personal Development');
      setPriority('medium');
      setDeadline(isoAddDays(30));
      setReminderOn(false);
      setReminderTime('09:00');
      setMilestones([]);
    }
    setMsTitle('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const save = () => {
    if (!title.trim()) {
      setError('Give your goal a title first.');
      return;
    }
    if (!deadline) {
      setError('Pick a deadline — even a rough one helps.');
      return;
    }
    if (existing) {
      const keepMilestones = milestones.map((m) => {
        const prev = existing.milestones.find((x) => x.id === m.id);
        return {
          id: m.id,
          title: m.title.trim() || 'Untitled milestone',
          done: prev?.done ?? false,
          completedAt: prev?.completedAt,
          dueDate: m.dueDate || undefined,
        };
      });
      updateGoal(existing.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        deadline,
        reminder: { enabled: reminderOn, time: reminderTime },
        milestones: keepMilestones,
      });
      closeSheet();
    } else {
      const id = createGoal({
        title,
        description,
        category,
        priority,
        deadline,
        reminder: { enabled: reminderOn, time: reminderTime },
        milestones: milestones.map((m) => ({ title: m.title, dueDate: m.dueDate || undefined })),
      });
      closeSheet();
      go('goal', id);
    }
  };

  return (
    <Sheet open={open} onClose={closeSheet} title={existing ? 'Edit Goal' : 'New Goal'}>
      <div className="space-y-5">
        <div>
          <label className="field-label">Goal title</label>
          <input
            className="field-input"
            placeholder="e.g. Learn React Native"
            value={title}
            maxLength={70}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus={!existing}
          />
        </div>

        <div>
          <label className="field-label">Description</label>
          <textarea
            className="field-input min-h-20 resize-none"
            placeholder="What does success look like?"
            value={description}
            maxLength={240}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const meta = CATEGORY_META[c];
              const active = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cx(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ring-1 transition active:scale-95',
                    active
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white ring-primary-600 shadow-md shadow-primary-600/25'
                      : 'bg-white text-slate-600 ring-slate-200 hover:ring-primary-300 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
                  )}
                >
                  <Icon name={meta.icon} size={13} strokeWidth={2.2} />
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Priority</label>
            <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-white/8">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cx(
                    'flex-1 rounded-xl py-2 text-[12px] font-bold capitalize transition-all',
                    priority === p
                      ? p === 'high'
                        ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-100'
                        : p === 'medium'
                          ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-100'
                          : 'bg-white text-sky-600 shadow-sm dark:bg-slate-100'
                      : 'text-slate-400',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Deadline</label>
            <input type="date" className="field-input px-3.5" value={deadline} min={todayISO()} onChange={(e) => setDeadline(e.target.value)} />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                <Icon name="bell" size={18} />
              </span>
              <div>
                <p className="text-[13.5px] font-bold text-slate-700 dark:text-slate-100">Reminder</p>
                <p className="text-[11.5px] text-slate-400">Nudge me as the deadline approaches</p>
              </div>
            </div>
            <Toggle on={reminderOn} onChange={setReminderOn} />
          </div>
          {reminderOn && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
              <div className="mt-3 flex items-center gap-2">
                <Icon name="clock" size={16} className="text-slate-400" />
                <input type="time" className="field-input max-w-36 px-3 py-2" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                <span className="text-[12px] font-semibold text-slate-400">{fmtClock(reminderTime)}</span>
              </div>
            </motion.div>
          )}
        </div>

        <div>
          <label className="field-label">Milestones ({milestones.length})</label>
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <motion.div key={m.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-50 text-[10px] font-extrabold text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                  {i + 1}
                </span>
                <input
                  className="field-input py-2 text-[13.5px]"
                  value={m.title}
                  placeholder={`Milestone ${i + 1}`}
                  onChange={(e) => setMilestones((list) => list.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)))}
                />
                <input
                  type="date"
                  aria-label="Milestone due date"
                  className="field-input w-9.5 p-0 text-transparent [&::-webkit-calendar-picker-indicator]:m-auto [&::-webkit-calendar-picker-indicator]:opacity-60"
                  value={m.dueDate}
                  onChange={(e) => setMilestones((list) => list.map((x) => (x.id === m.id ? { ...x, dueDate: e.target.value } : x)))}
                />
                <IconBtn icon="x" label="Remove milestone" className="size-8" onClick={() => setMilestones((list) => list.filter((x) => x.id !== m.id))} />
              </motion.div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="field-input py-2 text-[13.5px]"
              placeholder="Add a milestone and press +"
              value={msTitle}
              onChange={(e) => setMsTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && msTitle.trim()) {
                  setMilestones((l) => [...l, { id: uid(), title: msTitle.trim(), dueDate: '' }]);
                  setMsTitle('');
                }
              }}
            />
            <Button
              variant="soft"
              className="shrink-0 px-3.5"
              onClick={() => {
                if (!msTitle.trim()) return;
                setMilestones((l) => [...l, { id: uid(), title: msTitle.trim(), dueDate: '' }]);
                setMsTitle('');
              }}
              aria-label="Add milestone"
            >
              <Icon name="plus" size={16} strokeWidth={2.6} />
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Progress is tracked automatically from completed milestones.</p>
        </div>

        {error && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-[12.5px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={closeSheet}>
            Cancel
          </Button>
          <Button variant={existing ? 'primary' : 'emerald'} className="flex-2" icon={existing ? 'check' : 'flag'} onClick={save}>
            {existing ? 'Save changes' : 'Create goal'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Habit form                                                          */
/* ------------------------------------------------------------------ */

export function HabitSheet() {
  const { sheet, closeSheet, data, createHabit, updateHabit, deleteHabit, openSheet } = useApp();
  const open = sheet?.kind === 'habit';
  const editId = sheet?.kind === 'habit' ? sheet.habitId : undefined;
  const existing = data.habits.find((h) => h.id === editId);

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState<string>('zap');
  const [color, setColor] = useState('blue');
  const [goalId, setGoalId] = useState<string | null>(null);
  const [reminderOn, setReminderOn] = useState(false);
  const [time, setTime] = useState('08:00');

  const linkableGoals = useMemo(() => data.goals.filter((g) => !g.archived && !g.completedAt), [data.goals]);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setTitle(existing.title);
      setIcon(existing.icon);
      setColor(existing.color);
      setGoalId(existing.goalId);
      setReminderOn(Boolean(existing.reminderTime));
      setTime(existing.reminderTime ?? '08:00');
    } else {
      setTitle('');
      setIcon('zap');
      setColor('emerald');
      setGoalId(null);
      setReminderOn(false);
      setTime('08:00');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const save = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      icon,
      color,
      goalId,
      reminderTime: reminderOn ? time : null,
    };
    if (existing) updateHabit(existing.id, payload);
    else createHabit(payload);
    closeSheet();
  };

  return (
    <Sheet open={open} onClose={closeSheet} title={existing ? 'Edit Habit' : 'New Habit'}>
      <div className="space-y-5">
        <div>
          <label className="field-label">Habit</label>
          <input className="field-input" placeholder="e.g. Meditate 10 minutes" value={title} maxLength={48} onChange={(e) => setTitle(e.target.value)} autoFocus={!existing} />
        </div>

        <div>
          <label className="field-label">Icon</label>
          <div className="grid grid-cols-7 gap-2">
            {HABIT_ICONS.map((i) => {
              const c = habitColor(color);
              const active = icon === i;
              return (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={cx(
                    'grid aspect-square place-items-center rounded-2xl ring-1 transition active:scale-90',
                    active ? cx(c.blob, c.text, 'ring-current shadow-md') : 'bg-slate-50 text-slate-400 ring-slate-100 hover:text-slate-600 dark:bg-white/5 dark:ring-white/8',
                  )}
                >
                  <Icon name={i} size={18} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="field-label">Color</label>
          <div className="flex gap-2.5">
            {HABIT_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key)}
                aria-label={c.key}
                className={cx('grid size-9 place-items-center rounded-full transition active:scale-90', color === c.key && 'ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-600 dark:ring-offset-slate-900')}
                style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.hex}bb)` }}
              >
                {color === c.key && <Icon name="check" size={15} strokeWidth={3} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Link to a goal (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGoalId(null)}
              className={cx(
                'rounded-full px-3.5 py-1.5 text-[12px] font-bold ring-1 transition active:scale-95',
                goalId === null ? 'bg-slate-800 text-white ring-slate-800 dark:bg-slate-100 dark:text-slate-900' : 'bg-white text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
              )}
            >
              None
            </button>
            {linkableGoals.map((g) => {
              const active = goalId === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoalId(g.id)}
                  className={cx(
                    'flex max-w-44 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold ring-1 transition active:scale-95',
                    active ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white ring-primary-600' : 'bg-white text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
                  )}
                >
                  <Icon name={CATEGORY_META[g.category].icon} size={12} strokeWidth={2.4} />
                  <span className="truncate">{g.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
              <Icon name="alarm" size={18} />
            </span>
            <div>
              <p className="text-[13.5px] font-bold text-slate-700 dark:text-slate-100">Daily reminder</p>
              {reminderOn && <input type="time" className="mt-0.5 rounded-lg border-none bg-transparent p-0 text-[12.5px] font-bold text-primary-600 outline-none dark:text-primary-300" value={time} onChange={(e) => setTime(e.target.value)} />}
            </div>
          </div>
          <Toggle on={reminderOn} onChange={setReminderOn} />
        </div>

        <div className="flex gap-3 pt-1">
          {existing ? (
            <Button
              variant="danger"
              icon="trash"
              onClick={() =>
                openSheet({
                  kind: 'confirm',
                  title: 'Delete this habit?',
                  body: `“${existing.title}” and its ${existing.log.length} check-ins will be removed.`,
                  confirmLabel: 'Delete habit',
                  danger: true,
                  onConfirm: () => deleteHabit(existing.id),
                })
              }
            />
          ) : (
            <Button variant="ghost" className="flex-1" onClick={closeSheet}>
              Cancel
            </Button>
          )}
          <Button variant="emerald" className="flex-2" icon="flame" onClick={save} disabled={!title.trim()}>
            {existing ? 'Save habit' : 'Start habit'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

export function ConfirmSheet() {
  const { sheet, closeSheet } = useApp();
  const open = sheet?.kind === 'confirm';
  const cfg = sheet?.kind === 'confirm' ? sheet : null;

  return (
    <Sheet open={open} onClose={closeSheet}>
      <div className="flex flex-col items-center pt-2 pb-1 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          className={cx(
            'mb-4 grid size-16 place-items-center rounded-[1.4rem]',
            cfg?.danger ? 'bg-rose-100 text-rose-500 dark:bg-rose-500/15' : 'bg-amber-100 text-amber-500 dark:bg-amber-500/15',
          )}
        >
          <Icon name={cfg?.danger ? 'trash' : 'alert'} size={30} strokeWidth={1.8} />
        </motion.div>
        <h2 className="text-[18px] font-extrabold text-slate-800 dark:text-white">{cfg?.title}</h2>
        <p className="mt-1.5 max-w-[30ch] text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{cfg?.body}</p>
        <div className="mt-6 flex w-full gap-3">
          <Button variant="ghost" className="flex-1" onClick={closeSheet}>
            Cancel
          </Button>
          <Button
            variant={cfg?.danger ? 'danger' : 'primary'}
            className={cx('flex-1', cfg?.danger && 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 dark:bg-rose-500 dark:text-white')}
            onClick={() => {
              cfg?.onConfirm();
              closeSheet();
            }}
          >
            {cfg?.confirmLabel ?? 'Confirm'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Reminders center                                                    */
/* ------------------------------------------------------------------ */

export function RemindersSheet() {
  const { sheet, closeSheet, reminders, go, settings } = useApp();
  const open = sheet?.kind === 'reminders';

  return (
    <Sheet open={open} onClose={closeSheet} title="Reminders">
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="mb-4 grid size-16 place-items-center rounded-[1.4rem] bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15">
            <Icon name="checkCircle" size={30} />
          </span>
          <p className="text-[15px] font-extrabold text-slate-700 dark:text-slate-100">All caught up!</p>
          <p className="mt-1 max-w-[28ch] text-[13px] text-slate-400">No pending reminders right now. Enjoy the flow.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {reminders.map((r, i) => (
            <motion.button
              key={r.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                closeSheet();
                if (r.goalId) go('goal', r.goalId);
                else go('habits');
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-3.5 text-left ring-1 ring-slate-100 transition hover:ring-primary-200 active:scale-[0.99] dark:bg-white/5 dark:ring-white/8"
            >
              <span
                className={cx(
                  'grid size-11 shrink-0 place-items-center rounded-xl text-white shadow-md',
                  r.kind === 'goal' ? 'bg-gradient-to-br from-primary-500 to-indigo-500' : 'bg-gradient-to-br from-emerald-500 to-teal-500',
                )}
              >
                <Icon name={r.icon} size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-bold text-slate-700 dark:text-slate-100">{r.title}</span>
                <span className="block text-[11.5px] font-medium text-slate-400">{r.detail}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-slate-500 ring-1 ring-slate-100 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10">
                {fmtClock(r.time)}
              </span>
            </motion.button>
          ))}
          <p className="pt-2 text-center text-[11.5px] text-slate-400">
            System notifications are {settings.notifications ? 'enabled' : 'disabled'} in Settings.
          </p>
        </div>
      )}
    </Sheet>
  );
}
