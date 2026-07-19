import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './store/AppContext';
import { ACCENTS } from './lib/meta';
import { TopNav, BottomNav } from './components/Nav';
import { GoalSheet, HabitSheet, ConfirmSheet, RemindersSheet } from './components/Sheets';
import { ToastHost, CelebrationHost } from './components/Celebrate';
import { IOSInstallBanner, IOSInstallSheet } from './components/Install';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './screens/Dashboard';
import { Goals } from './screens/Goals';
import { GoalDetail } from './screens/GoalDetail';
import { Habits } from './screens/Habits';
import { CalendarScreen } from './screens/Calendar';
import { Analytics } from './screens/Analytics';
import { Achievements } from './screens/Achievements';
import { Profile } from './screens/Profile';

/* Applies dark/light + accent theming to <html>. */
function useTheming() {
  const { settings } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = settings.theme === 'dark' || (settings.theme === 'system' && mq.matches);
      root.classList.toggle('dark', dark);
      root.style.colorScheme = dark ? 'dark' : 'light';
      document
        .querySelector('meta[name="theme-color"]:not([media])')
        ?.setAttribute('content', dark ? '#070d1c' : '#eff4ff');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    const vars = ACCENTS[settings.accent].vars;
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  }, [settings.accent]);
}

/* Handles /?action=new-goal and /?view=habits PWA shortcuts. */
function useShortcuts() {
  const { onboarded, openSheet, goTab } = useApp();
  const handled = useRef(false);
  useEffect(() => {
    if (!onboarded || handled.current) return;
    handled.current = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new-goal') openSheet({ kind: 'goal' });
    const view = params.get('view');
    if (view === 'habits' || view === 'goals' || view === 'analytics' || view === 'home') goTab(view);
    if (params.toString()) window.history.replaceState(null, '', window.location.pathname);
  }, [onboarded, openSheet, goTab]);
}

function Screens() {
  const { nav, onboarded } = useApp();
  useTheming();
  useShortcuts();

  if (!onboarded) return <Onboarding />;

  const screen = (() => {
    switch (nav.view) {
      case 'home':
        return <Dashboard />;
      case 'goals':
        return <Goals />;
      case 'goal':
        return nav.goalId ? <GoalDetail goalId={nav.goalId} /> : <Goals />;
      case 'habits':
        return <Habits />;
      case 'calendar':
        return <CalendarScreen />;
      case 'analytics':
        return <Analytics />;
      case 'achievements':
        return <Achievements />;
      case 'profile':
        return <Profile />;
    }
  })();

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full px-5 pt-4 pb-36 lg:px-8 lg:pt-26 lg:pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${nav.view}-${nav.goalId ?? ''}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />

      {/* global overlays */}
      <GoalSheet />
      <HabitSheet />
      <ConfirmSheet />
      <RemindersSheet />
      <IOSInstallSheet />
      <ToastHost />
      <CelebrationHost />
      <IOSInstallBanner />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Screens />
    </AppProvider>
  );
}
