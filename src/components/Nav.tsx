import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { cx } from '../lib/utils';
import { Icon } from './icons';
import { Avatar } from './ui';

const TABS = [
  { view: 'home', icon: 'home', label: 'Home' },
  { view: 'goals', icon: 'goals', label: 'Goals' },
  { view: 'habits', icon: 'habits', label: 'Habits' },
  { view: 'analytics', icon: 'analytics', label: 'Analytics' },
] as const;

export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[0.9rem] bg-gradient-to-br from-primary-500 via-primary-600 to-emerald-500 text-white shadow-lg shadow-primary-600/30"
      style={{ width: size, height: size }}
    >
      <Icon name="goals" size={size * 0.58} strokeWidth={2.2} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop top navigation                                              */
/* ------------------------------------------------------------------ */

export function TopNav() {
  const { nav, goTab, go, openSheet, reminders, settings } = useApp();
  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden lg:block">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-8 py-4">
        <div className="card flex w-full items-center gap-6 rounded-full px-5 py-3">
          <button onClick={() => goTab('home')} className="flex items-center gap-2.5">
            <Logo size={36} />
            <span className="text-[17px] font-extrabold tracking-tight text-slate-800 dark:text-white">
              Goal<span className="text-gradient">Flow</span>
            </span>
          </button>

          <nav className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = nav.view === t.view || (t.view === 'goals' && nav.view === 'goal');
              return (
                <button
                  key={t.view}
                  onClick={() => goTab(t.view)}
                  className={cx(
                    'relative flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-bold transition-colors',
                    active ? 'text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="topnav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 shadow-md shadow-primary-600/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon name={t.icon} size={16} strokeWidth={2.2} />
                    {t.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => openSheet({ kind: 'reminders' })}
              className="relative grid size-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              aria-label="Reminders"
            >
              <Icon name="bell" size={19} />
              {reminders.length > 0 && (
                <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                  {reminders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => openSheet({ kind: 'goal' })}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 px-4 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-primary-600/30 transition hover:shadow-xl active:scale-95"
            >
              <Icon name="plus" size={15} strokeWidth={2.6} />
              New Goal
            </button>
            <Avatar size={40} onClick={() => go('profile')} />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile bottom navigation + FAB quick actions                        */
/* ------------------------------------------------------------------ */

export function BottomNav() {
  const { nav, goTab, go, openSheet } = useApp();
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

  const leftTabs = TABS.slice(0, 2);
  const rightTabs = TABS.slice(2);

  const item = (t: (typeof TABS)[number]) => {
    const active = nav.view === t.view || (t.view === 'goals' && nav.view === 'goal');
    return (
      <button
        key={t.view}
        onClick={() => goTab(t.view)}
        className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
        aria-label={t.label}
      >
        {active && (
          <motion.span
            layoutId="bottomnav-pill"
            className="absolute -top-1 h-1 w-8 rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          />
        )}
        <Icon
          name={t.icon}
          size={22}
          strokeWidth={active ? 2.3 : 1.8}
          className={cx('transition-colors', active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500')}
        />
        <span
          className={cx(
            'text-[10px] font-bold transition-colors',
            active ? 'text-primary-700 dark:text-primary-300' : 'text-slate-400 dark:text-slate-500',
          )}
        >
          {t.label}
        </span>
      </button>
    );
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="mx-auto max-w-md px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
        {/* Quick action menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="pointer-events-auto absolute bottom-[calc(100%+0.75rem)] left-1/2 w-56 -translate-x-1/2 overflow-hidden rounded-3xl bg-white p-2 shadow-lift ring-1 ring-slate-900/10 dark:bg-slate-900 dark:ring-white/10"
            >
              {[
                { icon: 'flag', label: 'New Goal', grad: 'from-primary-500 to-indigo-500', action: () => openSheet({ kind: 'goal' }) },
                { icon: 'flame', label: 'New Habit', grad: 'from-emerald-500 to-teal-500', action: () => openSheet({ kind: 'habit' }) },
                { icon: 'calendar', label: 'Open Calendar', grad: 'from-amber-500 to-orange-500', action: () => go('calendar') },
              ].map((a, i) => (
                <motion.button
                  key={a.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  onClick={() => {
                    setMenuOpen(false);
                    a.action();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-50 active:scale-[0.98] dark:hover:bg-white/5"
                >
                  <span className={cx('grid size-9 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md', a.grad)}>
                    <Icon name={a.icon} size={17} strokeWidth={2.2} />
                  </span>
                  <span className="text-[13.5px] font-bold text-slate-700 dark:text-slate-100">{a.label}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="pointer-events-auto relative flex items-center rounded-[1.9rem] bg-white/95 px-2 py-2 shadow-lift ring-1 ring-slate-900/8 backdrop-blur-xl dark:bg-slate-900/95 dark:ring-white/10">
          {leftTabs.map(item)}

          <div className="relative flex-1">
            <motion.button
              whileTap={{ scale: 0.88, rotate: menuOpen ? 45 : 0 }}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Quick actions"
              className={cx(
                'absolute left-1/2 -top-7 grid size-14 -translate-x-1/2 place-items-center rounded-2xl text-white shadow-xl ring-4 ring-[#eff4ff] transition-transform duration-300 dark:ring-[#070d1c]',
                menuOpen
                  ? 'rotate-45 bg-gradient-to-br from-slate-600 to-slate-800 shadow-slate-900/30'
                  : 'bg-gradient-to-br from-primary-500 to-emerald-500 shadow-primary-600/40',
              )}
            >
              <Icon name="plus" size={26} strokeWidth={2.5} />
            </motion.button>
          </div>

          {rightTabs.map(item)}

          <button onClick={() => go('profile')} className="relative flex flex-1 flex-col items-center gap-0.5 py-1" aria-label="Profile">
            {nav.view === 'profile' && (
              <motion.span
                layoutId="bottomnav-pill"
                className="absolute -top-1 h-1 w-8 rounded-full bg-gradient-to-r from-primary-500 to-emerald-500"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <Icon
              name="user"
              size={22}
              strokeWidth={nav.view === 'profile' ? 2.3 : 1.8}
              className={cx('transition-colors', nav.view === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500')}
            />
            <span className={cx('text-[10px] font-bold', nav.view === 'profile' ? 'text-primary-700 dark:text-primary-300' : 'text-slate-400 dark:text-slate-500')}>
              Profile
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
