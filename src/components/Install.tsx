import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { loadInstallHintDismissed, saveInstallHintDismissed } from '../lib/storage';
import { Button, IconBtn, Sheet } from './ui';
import { Icon } from './icons';

/** Inline install card (dashboard / profile). Shows only when really installable. */
export function InstallCard({ compact = false }: { compact?: boolean }) {
  const { canInstall, isIOS, isStandalone, promptInstall, openSheet } = useApp();
  if (isStandalone) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 p-5 text-white shadow-lift dark:from-primary-900 dark:via-slate-900 dark:to-emerald-900"
    >
      <div className="pointer-events-none absolute -top-10 -right-6 size-36 rounded-full bg-emerald-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-6 size-36 rounded-full bg-primary-400/25 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/20 backdrop-blur"
        >
          <Icon name="smartphone" size={24} strokeWidth={1.8} />
        </motion.span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold">Install GoalFlow</h3>
          <p className="mt-0.5 text-[12px] leading-snug text-white/70">
            {isIOS && !canInstall
              ? 'Add it to your Home Screen for the full app experience.'
              : 'One tap, works offline, feels native.'}
          </p>
        </div>
        {canInstall ? (
          <Button
            variant="emerald"
            size="sm"
            icon="download"
            className="shrink-0 shadow-emerald-500/40"
            onClick={() => void promptInstall()}
          >
            Install
          </Button>
        ) : (
          <Button variant="emerald" size="sm" className="shrink-0 shadow-emerald-500/40" onClick={() => openSheet({ kind: 'ios-install' })}>
            How to
          </Button>
        )}
      </div>
      {!compact && canInstall && (
        <p className="relative mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/50">
          <Icon name="checkCircle" size={12} /> Free · Instant · No app store needed
        </p>
      )}
    </motion.div>
  );
}

/** Dismissible floating hint banner — only for iOS Safari, not yet installed. */
export function IOSInstallBanner() {
  const { isIOS, isStandalone, onboarded, openSheet } = useApp();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isIOS && !isStandalone && onboarded && !loadInstallHintDismissed()) {
      const t = window.setTimeout(() => setVisible(true), 2600);
      return () => window.clearTimeout(t);
    }
  }, [isIOS, isStandalone, onboarded]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 70 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 70 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed inset-x-0 bottom-[6.4rem] z-40 mx-auto w-[min(26rem,calc(100%-2rem))] lg:bottom-6 lg:mr-6 lg:ml-auto"
        >
          <div className="flex items-center gap-3 rounded-3xl bg-slate-900/95 p-3.5 pl-4 text-white shadow-lift ring-1 ring-white/10 backdrop-blur dark:bg-white/95 dark:text-slate-900">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white">
              <Icon name="share" size={19} />
            </span>
            <button className="min-w-0 flex-1 text-left" onClick={() => openSheet({ kind: 'ios-install' })}>
              <span className="block text-[13px] font-extrabold">Add to Home Screen</span>
              <span className="block truncate text-[11.5px] text-white/60 dark:text-slate-500">
                Tap Share <span className="font-bold">→</span> “Add to Home Screen”
              </span>
            </button>
            <IconBtn
              icon="x"
              label="Dismiss"
              className="text-white/60 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:bg-slate-900/5"
              onClick={() => {
                saveInstallHintDismissed();
                setVisible(false);
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Step-by-step iOS instructions sheet. */
export function IOSInstallSheet() {
  const { sheet, closeSheet } = useApp();
  return (
    <Sheet open={sheet?.kind === 'ios-install'} onClose={closeSheet} title="Install on iPhone">
      <div className="space-y-3 pb-2">
        {[
          { step: 1, icon: 'share', title: 'Tap the Share button', body: 'Find the Share icon in Safari’s bottom toolbar.' },
          { step: 2, icon: 'down', title: 'Scroll down', body: 'Swipe up in the share sheet to see more actions.' },
          { step: 3, icon: 'plus', title: '“Add to Home Screen”', body: 'Tap it, then confirm with “Add” in the top corner.' },
          { step: 4, icon: 'sparkles', title: 'Launch GoalFlow', body: 'Find the GoalFlow icon on your Home Screen — it works fully offline.' },
        ].map((s) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: s.step * 0.07 }}
            className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 dark:bg-white/5 dark:ring-white/8"
          >
            <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-500 to-emerald-500 text-white shadow-md">
              <Icon name={s.icon} size={19} strokeWidth={2.2} />
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-slate-900 text-[10px] font-extrabold text-white ring-2 ring-white dark:bg-white dark:text-slate-900 dark:ring-slate-900">
                {s.step}
              </span>
            </span>
            <div>
              <p className="text-[13.5px] font-extrabold text-slate-800 dark:text-slate-100">{s.title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">{s.body}</p>
            </div>
          </motion.div>
        ))}
        <Button variant="primary" className="mt-2 w-full" onClick={closeSheet}>
          Got it
        </Button>
      </div>
    </Sheet>
  );
}
