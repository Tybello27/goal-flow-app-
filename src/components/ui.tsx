import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cx } from '../lib/utils';
import { Icon } from './icons';

/* ------------------------------------------------------------------ */

export const spring = { type: 'spring', stiffness: 340, damping: 30 } as const;

export function Card({
  className,
  children,
  onClick,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={cx('card p-5', onClick && 'cursor-pointer', className)} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  className,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cx('mb-3 flex items-center justify-between', className)}>
      <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {action && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1 text-[12.5px] font-bold text-primary-600 transition hover:text-primary-700 dark:text-primary-400"
        >
          {action}
          <Icon name="right" size={14} strokeWidth={2.4} />
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Buttons                                                             */
/* ------------------------------------------------------------------ */

type BtnVariant = 'primary' | 'emerald' | 'ghost' | 'soft' | 'danger' | 'dark';

const BTN: Record<BtnVariant, string> = {
  primary:
    'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 active:scale-[0.97]',
  emerald:
    'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 active:scale-[0.97]',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.97] dark:text-slate-300 dark:hover:bg-white/10',
  soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100 active:scale-[0.97] dark:bg-primary-500/15 dark:text-primary-300 dark:hover:bg-primary-500/25',
  danger:
    'bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-[0.97] dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25',
  dark: 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.97] dark:bg-white dark:text-slate-900',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' && 'px-3.5 py-2 text-[13px]',
        size === 'md' && 'px-5 py-3 text-[14.5px]',
        size === 'lg' && 'w-full px-6 py-4 text-[15.5px]',
        BTN[variant],
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 15 : 17} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

export function IconBtn({
  icon,
  label,
  className,
  solid,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string; solid?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        'grid size-10 shrink-0 place-items-center rounded-full text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:scale-90 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={19} solid={solid} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle                                                              */
/* ------------------------------------------------------------------ */

export function Toggle({ on, onChange, accent = 'bg-emerald-500' }: { on: boolean; onChange: (v: boolean) => void; accent?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cx(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300',
        on ? accent : 'bg-slate-200 dark:bg-white/15',
      )}
    >
      <motion.span
        layout
        transition={spring}
        className={cx(
          'absolute top-1 size-5 rounded-full bg-white shadow-md',
          on ? 'right-1' : 'left-1',
        )}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Segmented control                                                   */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={cx('flex rounded-2xl bg-slate-100 p-1 dark:bg-white/8', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            'relative flex-1 rounded-xl px-3 font-bold whitespace-nowrap transition-colors',
            size === 'sm' ? 'py-1.5 text-[11.5px]' : 'py-2 text-[13px]',
            value === o.value ? 'text-slate-800 dark:text-slate-900' : 'text-slate-500 dark:text-slate-400',
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={undefined}
              className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-slate-100"
              transition={spring}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom sheet / modal                                                */
/* ------------------------------------------------------------------ */

export function Sheet({
  open,
  onClose,
  children,
  title,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 700) onClose();
            }}
            className={cx(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-slate-900 dark:ring-1 dark:ring-white/10 sm:rounded-[2rem]',
              wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
            )}
            initial={{ y: '100%', opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="mx-auto mt-3 mb-1 h-1.5 w-11 shrink-0 rounded-full bg-slate-200 dark:bg-white/15" />
            {title && (
              <div className="flex items-center justify-between px-6 pt-1 pb-2">
                <h2 className="text-lg font-extrabold tracking-tight text-slate-800 dark:text-white">{title}</h2>
                <IconBtn icon="x" label="Close" onClick={onClose} />
              </div>
            )}
            <div className="no-scrollbar overflow-y-auto px-6 pt-1 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                        */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  className,
  barClass = 'bg-gradient-to-r from-primary-500 to-emerald-500',
  trackClass = 'bg-slate-100 dark:bg-white/10',
  height = 'h-2.5',
}: {
  value: number;
  className?: string;
  barClass?: string;
  trackClass?: string;
  height?: string;
}) {
  return (
    <div className={cx('w-full overflow-hidden rounded-full', height, trackClass, className)}>
      <motion.div
        className={cx('h-full rounded-full', barClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
  actionIcon = 'plus',
}: {
  icon: string;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  actionIcon?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative flex flex-col items-center overflow-hidden px-6 py-12 text-center"
    >
      <div className="pointer-events-none absolute -top-16 -right-10 size-44 rounded-full bg-gradient-to-br from-primary-400/15 to-emerald-400/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 size-44 rounded-full bg-gradient-to-br from-amber-400/15 to-primary-400/10 blur-2xl" />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        className="relative mb-5 grid size-20 place-items-center rounded-[1.75rem] bg-gradient-to-br from-primary-500/12 to-emerald-500/12 text-primary-600 ring-1 ring-primary-500/15 dark:text-primary-300"
      >
        <Icon name={icon} size={36} strokeWidth={1.6} />
        <motion.span
          className="absolute -top-1.5 -right-1.5 text-amber-400"
          animate={{ scale: [1, 1.35, 1], rotate: [0, 20, 0] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        >
          <Icon name="sparkles" size={20} solid />
        </motion.span>
      </motion.div>
      <h3 className="text-[17px] font-extrabold text-slate-800 dark:text-white">{title}</h3>
      <p className="mt-1.5 max-w-[26ch] text-[13.5px] leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
      {action && (
        <Button className="mt-6" icon={actionIcon} onClick={onAction}>
          {action}
        </Button>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated number                                                     */
/* ------------------------------------------------------------------ */

export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (from === value) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{display}</span>;
}

/* ------------------------------------------------------------------ */
/*  Avatar                                                              */
/* ------------------------------------------------------------------ */

export function Avatar({ size = 44, className, onClick }: { size?: number; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open profile"
      className={cx('relative shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md transition active:scale-95 dark:ring-slate-800', className)}
      style={{ width: size, height: size }}
    >
      <img src="/images/avatar.webp" alt="Tomisin" width={size} height={size} className="size-full object-cover" />
    </button>
  );
}
