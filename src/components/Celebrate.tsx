import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useApp } from '../store/AppContext';
import { ACHIEVEMENTS } from '../lib/achievements';
import { Button } from './ui';
import { Icon } from './icons';
import { cx } from '../lib/utils';

const BRAND = ['#2563eb', '#10b981', '#f59e0b', '#fbbf24', '#818cf8', '#ffffff'];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function fireConfetti() {
  if (reducedMotion()) return;
  confetti({
    particleCount: 110,
    spread: 80,
    origin: { y: 0.68 },
    colors: BRAND,
    disableForReducedMotion: true,
  });
  window.setTimeout(
    () =>
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.8 },
        colors: BRAND,
        disableForReducedMotion: true,
      }),
    180,
  );
  window.setTimeout(
    () =>
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.8 },
        colors: BRAND,
        disableForReducedMotion: true,
      }),
    320,
  );
}

export function fireFireworks() {
  if (reducedMotion()) return;
  const end = Date.now() + 1500;
  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      startVelocity: 55,
      origin: { x: 0, y: 0.6 },
      colors: BRAND,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      startVelocity: 55,
      origin: { x: 1, y: 0.6 },
      colors: BRAND,
      disableForReducedMotion: true,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/* ------------------------------------------------------------------ */
/*  Toasts                                                              */
/* ------------------------------------------------------------------ */

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.8rem,env(safe-area-inset-top))] z-[70] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, y: -26, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            onClick={() => dismissToast(t.id)}
            className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl bg-slate-900/95 py-2.5 pr-4 pl-3 text-left shadow-lift backdrop-blur dark:bg-white/95"
          >
            <span
              className={cx(
                'grid size-9 shrink-0 place-items-center rounded-xl text-white',
                t.tone === 'success'
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                  : t.tone === 'amber'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                    : 'bg-gradient-to-br from-primary-500 to-indigo-500',
              )}
            >
              <Icon name={t.icon} size={17} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-[13px] font-extrabold text-white dark:text-slate-900">{t.title}</span>
              {t.body && <span className="block max-w-60 truncate text-[11.5px] font-medium text-slate-400 dark:text-slate-500">{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Celebration centre                                                  */
/* ------------------------------------------------------------------ */

export function CelebrationHost() {
  const { celebrations, dismissCelebration, data, go } = useApp();
  const current = celebrations[0];

  useEffect(() => {
    if (!current) return;
    if (current.kind === 'goal-complete' || current.kind === 'perfect-day') fireConfetti();
    if (current.kind === 'achievement') fireFireworks();
  }, [current]);

  const goal = current?.kind === 'goal-complete' ? data.goals.find((g) => g.id === current.goalId) : undefined;
  const unlockedBadges =
    current?.kind === 'achievement'
      ? ACHIEVEMENTS.filter((a) => current.achievementIds.includes(a.id))
      : [];

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={dismissCelebration} />

          <motion.div
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white p-7 text-center shadow-lift dark:bg-slate-900 dark:ring-1 dark:ring-white/10"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 h-44 w-[130%] -translate-x-1/2 rounded-[100%] bg-gradient-to-r from-primary-500/15 via-emerald-400/20 to-amber-400/15 blur-2xl" />

            {current.kind === 'goal-complete' && goal && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -18 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 14 }}
                  className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/40"
                >
                  <Icon name="trophy" size={46} strokeWidth={1.7} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <p className="mt-5 text-[11px] font-extrabold tracking-[0.22em] text-emerald-500 uppercase">Goal completed</p>
                  <h2 className="mt-1.5 text-[22px] leading-tight font-extrabold text-slate-900 dark:text-white">{goal.title}</h2>
                  <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
                    {goal.milestones.length > 0
                      ? `All ${goal.milestones.length} milestones crushed. Incredible work, keep flowing!`
                      : 'You set the goal and you smashed it. Incredible work!'}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-1.5 text-[12px] font-extrabold text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                    <Icon name="zap" size={14} solid /> +100 XP earned
                  </div>
                  <div className="mt-6 flex gap-2.5">
                    <Button variant="ghost" className="flex-1" onClick={dismissCelebration}>
                      Keep going
                    </Button>
                    <Button
                      variant="emerald"
                      className="flex-1"
                      onClick={() => {
                        dismissCelebration();
                        go('goal', goal.id);
                      }}
                    >
                      View goal
                    </Button>
                  </div>
                </motion.div>
              </>
            )}

            {current.kind === 'achievement' && unlockedBadges.length > 0 && (
              <>
                <div className="flex justify-center gap-3">
                  {unlockedBadges.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ scale: 0, rotate: -14 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.12 + i * 0.12, type: 'spring', stiffness: 280, damping: 15 }}
                      className={cx('grid size-20 place-items-center rounded-[1.6rem] bg-gradient-to-br text-white shadow-xl', b.gradient)}
                    >
                      <Icon name={b.icon} size={38} strokeWidth={1.7} />
                    </motion.div>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <p className="mt-5 text-[11px] font-extrabold tracking-[0.22em] text-amber-500 uppercase">
                    Badge unlocked
                  </p>
                  <h2 className="mt-1.5 text-[22px] font-extrabold text-slate-900 dark:text-white">
                    {unlockedBadges.length === 1 ? unlockedBadges[0].name : `${unlockedBadges.length} new badges!`}
                  </h2>
                  <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
                    {unlockedBadges.map((b) => b.desc).join(' · ')}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-1.5 text-[12px] font-extrabold text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                    <Icon name="zap" size={14} solid /> +{unlockedBadges.length * 60} XP earned
                  </div>
                  <Button variant="primary" className="mt-6 w-full" onClick={dismissCelebration}>
                    Awesome!
                  </Button>
                </motion.div>
              </>
            )}

            {current.kind === 'perfect-day' && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.12, type: 'spring', stiffness: 280, damping: 14 }}
                  className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-xl shadow-amber-500/40"
                >
                  <Icon name="sun" size={46} strokeWidth={1.7} />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
                  <p className="mt-5 text-[11px] font-extrabold tracking-[0.22em] text-amber-500 uppercase">Perfect day</p>
                  <h2 className="mt-1.5 text-[22px] font-extrabold text-slate-900 dark:text-white">Every habit completed!</h2>
                  <p className="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
                    100% check-ins today. Days like this build unstoppable momentum.
                  </p>
                  <Button variant="emerald" className="mt-6 w-full" onClick={dismissCelebration}>
                    Let&apos;s go!
                  </Button>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
