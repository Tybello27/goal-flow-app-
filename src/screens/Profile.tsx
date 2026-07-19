import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { ACCENTS } from '../lib/meta';
import { computeXp, cx, fmtDay, globalStreak, todayISO } from '../lib/utils';
import { exportData } from '../lib/storage';
import type { AccentKey, GreetingStyle } from '../types';
import { Button, Card, SectionHeader, Toggle } from '../components/ui';
import { Icon } from '../components/icons';
import { InstallCard } from '../components/Install';
import { Logo } from '../components/Nav';

const item = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: 0.05 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
});

function Row({
  icon,
  tint,
  title,
  sub,
  onClick,
  right,
  danger,
}: {
  icon: string;
  tint: string;
  title: string;
  sub?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cx(
        'flex w-full items-center gap-3.5 rounded-2xl px-2 py-3 text-left transition',
        onClick && 'hover:bg-slate-50 active:scale-[0.99] dark:hover:bg-white/5',
      )}
    >
      <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl', tint)}>
        <Icon name={icon} size={18} strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cx('block text-[13.5px] font-extrabold', danger ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-100')}>
          {title}
        </span>
        {sub && <span className="block truncate text-[11.5px] font-semibold text-slate-400">{sub}</span>}
      </span>
      {right ?? (onClick && <Icon name="right" size={16} className="shrink-0 text-slate-300" />)}
    </button>
  );
}

export function Profile() {
  const { data, settings, saveSettings, go, openSheet, resetSamples, clearAll, isStandalone, toast } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.name);
  const [notifPerm, setNotifPerm] = useState<string>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);

  const today = todayISO();
  const completedCount = data.goals.filter((g) => g.completedAt && !g.archived).length;
  const streak = globalStreak(data.goals, data.habits, today);
  const badges = Object.keys(data.unlocked).length;
  const xp = computeXp(data.goals, data.habits, badges);
  const memberSince = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(data.meta.seededAt));

  const isDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const saveName = () => {
    saveSettings({ name: nameDraft.trim() || 'Tomisin' });
    setEditingName(false);
    toast({ icon: 'checkCircle', title: 'Name updated', tone: 'success' });
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPerm(result);
    if (result === 'granted') {
      saveSettings({ notifications: true });
      toast({ icon: 'bell', title: 'Notifications enabled', body: 'We will nudge you at the right moments.', tone: 'success' });
    }
  };

  const GREETINGS: Array<{ value: GreetingStyle; label: string }> = [
    { value: 'auto', label: 'Auto' },
    { value: 'welcome', label: '👋' },
    { value: 'hi', label: '🚀' },
    { value: 'morning', label: '☀️' },
  ];

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 lg:max-w-3xl">
      <motion.h1 {...item(0)} className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
        Profile
      </motion.h1>

      {/* identity */}
      <motion.div {...item(1)}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-emerald-900 p-6 text-white shadow-lift">
          <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-8 size-48 rounded-full bg-primary-500/25 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <motion.img
              src="/images/avatar.webp"
              alt={settings.name}
              className="size-20 rounded-full object-cover ring-4 ring-white/20"
              whileTap={{ scale: 0.94 }}
            />
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameDraft}
                    maxLength={20}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                    className="w-full rounded-xl border-none bg-white/15 px-3 py-2 text-[17px] font-extrabold text-white placeholder-white/50 backdrop-blur outline-none ring-1 ring-white/25 focus:bg-white/25"
                  />
                  <button onClick={saveName} aria-label="Save name" className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white shadow-lg active:scale-90">
                    <Icon name="check" size={16} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <button onClick={() => { setNameDraft(settings.name); setEditingName(true); }} className="group flex items-center gap-2">
                  <h2 className="truncate text-[22px] font-extrabold tracking-tight">{settings.name}</h2>
                  <Icon name="edit" size={15} className="text-white/50 transition group-hover:text-white" />
                </button>
              )}
              <p className="mt-0.5 text-[12px] font-bold text-emerald-300">Productivity Explorer · Level up daily</p>
              <p className="mt-0.5 text-[11px] font-semibold text-white/50">Flowing since {memberSince}</p>
            </div>
          </div>
          <div className="relative mt-5 grid grid-cols-3 gap-2.5">
            {[
              { n: String(completedCount), l: 'goals done' },
              { n: `${streak}d`, l: 'day streak' },
              { n: xp > 999 ? `${(xp / 1000).toFixed(1)}k` : String(xp), l: 'total XP' },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
                <p className="text-[17px] font-extrabold">{s.n}</p>
                <p className="text-[10px] font-bold text-white/60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* achievements + install */}
      <motion.div {...item(2)}>
        <Card className="!p-3">
          <Row
            icon="trophy"
            tint="bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
            title="Achievements"
            sub={`${badges} badges unlocked · keep collecting`}
            onClick={() => go('achievements')}
          />
          <Row
            icon="calendar"
            tint="bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300"
            title="Calendar & timeline"
            sub="Deadlines and milestones at a glance"
            onClick={() => go('calendar')}
          />
          <Row
            icon="smartphone"
            tint="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
            title={isStandalone ? 'App installed' : 'Install GoalFlow'}
            sub={isStandalone ? 'Running as an installed app ✓' : 'Add to your home screen'}
            onClick={isStandalone ? undefined : () => go('home')}
          />
        </Card>
      </motion.div>
      {!isStandalone && (
        <motion.div {...item(3)}>
          <InstallCard compact />
        </motion.div>
      )}

      {/* theme */}
      <motion.div {...item(4)}>
        <Card>
          <SectionHeader title="Theme settings" />
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-slate-900 text-amber-300 dark:bg-white/10">
                <Icon name={isDark ? 'moon' : 'sun'} size={19} />
              </span>
              <div>
                <p className="text-[13.5px] font-extrabold text-slate-700 dark:text-slate-100">{isDark ? 'Dark mode' : 'Light mode'}</p>
                <p className="text-[11px] font-semibold text-slate-400">{isDark ? 'Easy on the eyes' : 'Bright and airy'}</p>
              </div>
            </div>
            <Toggle on={isDark} onChange={(v) => saveSettings({ theme: v ? 'dark' : 'light' })} accent="bg-slate-700 dark:bg-primary-500" />
          </div>

          <p className="field-label mt-4">Accent color</p>
          <div className="flex flex-wrap items-center gap-3">
            {(Object.keys(ACCENTS) as AccentKey[]).map((key) => {
              const a = ACCENTS[key];
              const active = settings.accent === key;
              return (
                <button
                  key={key}
                  onClick={() => saveSettings({ accent: key })}
                  aria-label={a.label}
                  title={a.label}
                  className={cx(
                    'grid size-10 place-items-center rounded-full transition-transform active:scale-90',
                    active && 'scale-110 ring-2 ring-offset-2 ring-slate-300 dark:ring-slate-500 dark:ring-offset-slate-900',
                  )}
                  style={{ background: `linear-gradient(135deg, ${a.swatch}, ${a.swatch}aa)` }}
                >
                  {active && <Icon name="check" size={17} strokeWidth={3} className="text-white" />}
                </button>
              );
            })}
            <span className="text-[11.5px] font-bold text-slate-400">{ACCENTS[settings.accent].label}</span>
          </div>
        </Card>
      </motion.div>

      {/* greeting */}
      <motion.div {...item(5)}>
        <Card>
          <SectionHeader title="Greeting style" />
          <p className="-mt-1 mb-3 text-[12px] font-semibold text-slate-400">
            Choose how GoalFlow says hello on your dashboard.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {GREETINGS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => saveSettings({ greeting: opt.value })}
                className={cx(
                  'rounded-2xl py-2.5 text-[13px] font-extrabold ring-1 transition active:scale-95',
                  settings.greeting === opt.value
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white ring-primary-600 shadow-md shadow-primary-600/25'
                    : 'bg-slate-50 text-slate-500 ring-slate-100 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* notifications */}
      <motion.div {...item(6)}>
        <Card>
          <SectionHeader title="Notifications" />
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
                <Icon name="bell" size={19} />
              </span>
              <div>
                <p className="text-[13.5px] font-extrabold text-slate-700 dark:text-slate-100">Goal reminders</p>
                <p className="text-[11px] font-semibold text-slate-400">
                  {notifPerm === 'granted' ? 'System notifications allowed' : notifPerm === 'denied' ? 'Blocked by browser' : 'In-app + optional system alerts'}
                </p>
              </div>
            </div>
            <Toggle on={settings.notifications} onChange={(v) => saveSettings({ notifications: v })} accent="bg-rose-500" />
          </div>

          {settings.notifications && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
              <div className="mt-3 flex items-center gap-3">
                <span className="field-label mb-0 shrink-0">Daily digest</span>
                <input
                  type="time"
                  className="field-input max-w-36 py-2"
                  value={settings.dailyDigestTime}
                  onChange={(e) => saveSettings({ dailyDigestTime: e.target.value })}
                  aria-label="Daily digest time"
                />
              </div>
              {notifPerm === 'default' && typeof Notification !== 'undefined' && (
                <Button variant="soft" size="sm" icon="bell" onClick={() => void requestNotifications()}>
                  Allow system notifications
                </Button>
              )}
              {notifPerm === 'denied' && (
                <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11.5px] font-bold text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                  Notifications are blocked in your browser settings — enable them for GoalFlow to get system alerts.
                </p>
              )}
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* account info / data */}
      <motion.div {...item(7)}>
        <Card className="!p-3">
          <div className="px-2 pt-2 pb-1">
            <SectionHeader title="Account info & data" className="mb-0" />
          </div>
          <Row icon="user" tint="bg-primary-100 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300" title={settings.name} sub={`Local profile · all data stays on this device`} />
          <Row
            icon="download"
            tint="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
            title="Export backup (JSON)"
            sub="Download your goals, habits and settings"
            onClick={() => {
              exportData(data, settings);
              toast({ icon: 'download', title: 'Backup downloaded', tone: 'success' });
            }}
          />
          <Row
            icon="refresh"
            tint="bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300"
            title="Restore sample data"
            sub="Reload the demo workspace"
            onClick={() =>
              openSheet({
                kind: 'confirm',
                title: 'Restore sample data?',
                body: 'Your current goals and habits will be replaced with the demo set.',
                confirmLabel: 'Restore samples',
                onConfirm: resetSamples,
              })
            }
          />
          <Row
            icon="trash"
            tint="bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300"
            title="Clear all data"
            sub="Delete every goal, habit and badge"
            danger
            onClick={() =>
              openSheet({
                kind: 'confirm',
                title: 'Clear everything?',
                body: 'All goals, habits, streaks and achievements will be permanently wiped from this device.',
                confirmLabel: 'Clear all data',
                danger: true,
                onConfirm: clearAll,
              })
            }
          />
        </Card>
      </motion.div>

      {/* about */}
      <motion.div {...item(8)} className="flex flex-col items-center gap-1.5 pb-4">
        <Logo size={40} />
        <p className="text-[13px] font-extrabold text-slate-700 dark:text-slate-200">
          GoalFlow <span className="text-slate-400">v1.0.0</span>
        </p>
        <p className="text-[11px] font-semibold text-slate-400">Flow with the future, not the past.</p>
      </motion.div>
    </div>
  );
}
