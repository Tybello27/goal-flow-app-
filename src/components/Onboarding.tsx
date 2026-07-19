import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { Button } from './ui';
import { cx } from '../lib/utils';
import { Logo } from './Nav';

const SLIDES = [
  {
    img: '/images/onboarding-1.webp',
    title: 'Set goals that\nactually stick',
    body: 'Break big dreams into clear milestones, deadlines and priorities — then watch every step forward come alive.',
    accent: 'from-primary-500/25 via-primary-400/10 to-transparent',
    chip: 'Goals & Milestones',
  },
  {
    img: '/images/onboarding-2.webp',
    title: 'Build habits,\nday after day',
    body: 'Link daily habits to your goals, rack up streaks and get gentle nudges exactly when you need them.',
    accent: 'from-emerald-500/25 via-emerald-400/10 to-transparent',
    chip: 'Habits & Streaks',
  },
  {
    img: '/images/onboarding-3.webp',
    title: 'Celebrate every\nwin along the way',
    body: 'Earn XP, unlock achievement badges and turn your analytics into a story of consistent progress.',
    accent: 'from-amber-500/25 via-amber-400/10 to-transparent',
    chip: 'Rewards & Analytics',
  },
];

export function Onboarding() {
  const { completeOnboarding, settings } = useApp();
  const [index, setIndex] = useState(0);
  const [name, setName] = useState(settings.name || 'Tomisin');

  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* ambient bg */}
      <div className={cx('pointer-events-none absolute inset-x-0 top-0 h-[52%] bg-gradient-to-b transition-colors duration-700', slide.accent)} />
      <motion.div
        key={`blob-${index}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-gradient-to-br from-primary-400/20 to-emerald-400/20 blur-3xl"
      />

      {/* header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-[16px] font-extrabold tracking-tight text-slate-800 dark:text-white">
            Goal<span className="text-gradient">Flow</span>
          </span>
        </div>
        {!last && (
          <button
            onClick={() => setIndex(SLIDES.length - 1)}
            className="rounded-full px-3 py-1.5 text-[13px] font-bold text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
          >
            Skip
          </button>
        )}
      </div>

      {/* content */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -48 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="relative mx-auto flex w-full max-w-sm flex-1 items-center justify-center py-4">
              <motion.img
                src={slide.img}
                alt=""
                initial={{ scale: 0.92, y: 14 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 180, damping: 18 }}
                className="max-h-[44dvh] w-auto max-w-full rounded-[2rem] object-contain shadow-lift"
                draggable={false}
              />
              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1.5 text-[11px] font-extrabold tracking-wide text-slate-600 uppercase shadow-md ring-1 ring-slate-900/5 backdrop-blur dark:bg-slate-900/90 dark:text-slate-300"
              >
                {slide.chip}
              </motion.span>
            </div>

            <div className="mx-auto w-full max-w-sm pb-2 text-center">
              <h1 className="text-[27px] leading-[1.15] font-extrabold tracking-tight whitespace-pre-line text-slate-900 dark:text-white">
                {slide.title}
              </h1>
              <p className="mx-auto mt-3 max-w-[34ch] text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">
                {slide.body}
              </p>

              {last && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-5"
                >
                  <label className="field-label text-left">What should we call you?</label>
                  <input
                    className="field-input text-center text-[16px] font-bold"
                    value={name}
                    maxLength={20}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* footer */}
      <div className="relative z-10 mx-auto w-full max-w-sm px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="mb-5 flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="relative h-2 overflow-hidden rounded-full"
              style={{ width: i === index ? 26 : 8, transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1)' }}
            >
              <span
                className={cx(
                  'absolute inset-0 rounded-full transition-colors duration-300',
                  i === index ? 'bg-gradient-to-r from-primary-500 to-emerald-500' : 'bg-slate-200 dark:bg-white/15',
                )}
              />
            </button>
          ))}
        </div>

        {last ? (
          <Button size="lg" variant="primary" icon="rocket" onClick={() => completeOnboarding(name)}>
            Start flowing
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1" />
            <Button variant="primary" icon="right" className="px-6" onClick={() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1))}>
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
