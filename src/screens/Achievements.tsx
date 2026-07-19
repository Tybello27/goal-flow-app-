import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { ACHIEVEMENTS, computeStats } from '../lib/achievements';
import { computeXp, cx, fmtDay, levelFromXp, todayISO } from '../lib/utils';
import { Card, IconBtn, ProgressBar } from '../components/ui';
import { Icon } from '../components/icons';
import { ProgressRing } from '../components/charts';

export function Achievements() {
  const { data, back, settings } = useApp();
  const stats = computeStats(data, todayISO());
  const unlockedCount = Object.keys(data.unlocked).length;
  const xp = computeXp(data.goals, data.habits, unlockedCount);
  const lvl = levelFromXp(xp);
  const next = ACHIEVEMENTS.find((a) => !data.unlocked[a.id]);

  return (
    <div className="mx-auto w-full max-w-xl lg:max-w-3xl">
      {/* header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <IconBtn icon="left" label="Back" onClick={() => back()} className="bg-white shadow-soft ring-1 ring-slate-900/5 dark:bg-slate-900 dark:ring-white/10" />
        <h1 className="text-[17px] font-extrabold text-slate-800 dark:text-white">Achievements</h1>
        <span className="w-10" />
      </motion.div>

      <p className="mt-2 text-center text-[12.5px] font-semibold text-slate-400">
        Ready to conquer today&apos;s goals, {settings.name}?
      </p>

      {/* level hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-primary-700 to-indigo-800 p-5 text-white shadow-lift"
      >
        <div className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-amber-400/25 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-8 size-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="relative flex items-center gap-5">
          <ProgressRing value={(lvl.into / lvl.span) * 100} size={98} stroke={10} from="#fbbf24" to="#f59e0b" track="rgba(255,255,255,0.18)">
            <div className="text-center">
              <p className="text-[9px] font-extrabold tracking-widest text-amber-200 uppercase">Level</p>
              <p className="text-[26px] leading-none font-extrabold">{lvl.level}</p>
            </div>
          </ProgressRing>
          <div className="flex-1">
            <p className="text-[11px] font-extrabold tracking-[0.18em] text-violet-200 uppercase">Reward Points</p>
            <p className="mt-1 text-[24px] leading-none font-extrabold">
              {xp.toLocaleString()} <span className="text-[13px] font-bold text-violet-200">XP</span>
            </p>
            <div className="mt-2.5">
              <ProgressBar value={(lvl.into / lvl.span) * 100} height="h-1.5" trackClass="bg-white/15" barClass="bg-gradient-to-r from-amber-300 to-amber-400" />
              <p className="mt-1.5 text-[10.5px] font-bold text-violet-200">
                {lvl.span - lvl.into} XP to level {lvl.level + 1}
              </p>
            </div>
          </div>
          <div className="hidden text-center sm:block">
            <p className="text-[24px] font-extrabold">
              {unlockedCount}
              <span className="text-[14px] text-violet-200">/{ACHIEVEMENTS.length}</span>
            </p>
            <p className="text-[10.5px] font-bold text-violet-200">badges</p>
          </div>
        </div>
      </motion.div>

      {/* next badge hint */}
      {next && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mt-4 flex items-center gap-3.5">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/8">
              <Icon name={next.icon} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">Almost there</p>
              <p className="truncate text-[14px] font-extrabold text-slate-800 dark:text-white">
                {next.name} — {next.desc}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <ProgressBar value={(next.value(stats) / next.target) * 100} height="h-1.5" barClass="bg-gradient-to-r from-amber-400 to-orange-500" />
                <span className="shrink-0 text-[10.5px] font-extrabold text-slate-400">
                  {Math.min(next.value(stats), next.target)}/{next.target}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* badge grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 pb-2 sm:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const unlockedAt = data.unlocked[a.id];
          const value = a.value(stats);
          const pct = Math.min(100, (value / a.target) * 100);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12 + i * 0.04, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <Card
                className={cx(
                  'relative flex h-full flex-col items-center overflow-hidden px-3 py-5 text-center',
                  !unlockedAt && 'opacity-90',
                )}
              >
                {unlockedAt ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.04, type: 'spring', stiffness: 300, damping: 15 }}
                    className={cx('grid size-16 place-items-center rounded-[1.4rem] bg-gradient-to-br text-white shadow-lg', a.gradient)}
                  >
                    <Icon name={a.icon} size={30} strokeWidth={1.8} />
                  </motion.span>
                ) : (
                  <span className={cx('relative grid size-16 place-items-center rounded-[1.4rem] bg-gradient-to-br text-white shadow-lg grayscale-[0.85] opacity-60', a.gradient)}>
                    <Icon name={a.icon} size={30} strokeWidth={1.8} />
                    <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-slate-700 text-white ring-2 ring-white dark:ring-slate-900">
                      <Icon name="lock" size={12} strokeWidth={2.4} />
                    </span>
                  </span>
                )}

                <p className="mt-3 text-[13.5px] leading-tight font-extrabold text-slate-800 dark:text-white">{a.name}</p>
                <p className="mt-1 text-[11px] leading-snug font-semibold text-slate-400">{a.desc}</p>

                {unlockedAt ? (
                  <p className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
                    <Icon name="check" size={10} strokeWidth={3} /> {fmtDay(unlockedAt)}
                  </p>
                ) : (
                  <div className="mt-2.5 w-full">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3 + i * 0.04, duration: 0.7 }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-extrabold text-slate-400">
                      {Math.min(value, a.target)} / {a.target}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
