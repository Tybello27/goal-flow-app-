import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../lib/utils';

/* ------------------------------------------------------------------ */
/*  Progress ring                                                       */
/* ------------------------------------------------------------------ */

export function ProgressRing({
  value,
  size = 84,
  stroke = 9,
  color = 'url(#ring-grad)',
  from = '#2563eb',
  to = '#10b981',
  track = 'rgba(100,116,139,0.16)',
  children,
  className,
}: {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string;
  from?: string;
  to?: string;
  track?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cx('relative inline-grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color === 'url(#ring-grad)' ? `url(#${id})` : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * v) / 100 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Smooth area chart                                                   */
/* ------------------------------------------------------------------ */

function smoothPath(points: Array<[number, number]>): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function AreaChart({
  data,
  height = 150,
  from = '#2563eb',
  to = '#10b981',
  labels,
}: {
  data: number[]; // 0..100
  height?: number;
  from?: string;
  to?: string;
  labels?: string[];
}) {
  const id = useId();
  const W = 340;
  const H = height;
  const pad = 8;
  const max = 100;
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const points: Array<[number, number]> = data.map((v, i) => [
    pad + i * stepX,
    H - pad - (Math.max(0, Math.min(max, v)) / max) * (H - pad * 2),
  ]);
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1]?.[0] ?? pad},${H - pad} L ${pad},${H - pad} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id={`${id}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <linearGradient id={`${id}-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={to} stopOpacity="0.28" />
            <stop offset="100%" stopColor={to} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={W - pad}
            y1={pad + (H - pad * 2) * f}
            y2={pad + (H - pad * 2) * f}
            stroke="currentColor"
            className="text-slate-200 dark:text-white/10"
            strokeWidth="1"
            strokeDasharray="3 6"
          />
        ))}
        <motion.path
          d={area}
          fill={`url(#${id}-fill)`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={`url(#${id}-line)`}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        {points.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r="4.5"
            fill="white"
            stroke={to}
            strokeWidth="3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.07, type: 'spring', stiffness: 300, damping: 18 }}
          />
        ))}
      </svg>
      {labels && (
        <div className="mt-1 flex justify-between px-1 text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bar chart                                                           */
/* ------------------------------------------------------------------ */

export function BarChart({
  data,
  height = 150,
  colors = ['#2563eb', '#10b981'],
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  colors?: [string, string];
}) {
  const max = Math.max(4, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100 dark:text-slate-300">
            {d.value}
          </span>
          <motion.div
            className="w-full max-w-9 rounded-t-xl rounded-b-md"
            style={{
              background: `linear-gradient(180deg, ${colors[i % 2 === 0 ? 0 : 1]}, ${colors[i % 2 === 0 ? 0 : 1]}cc)`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(6, (d.value / max) * 78)}%` }}
            transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 160, damping: 20 }}
          />
          <span className="text-[10px] font-bold tracking-wide text-slate-400 uppercase">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Donut chart                                                         */
/* ------------------------------------------------------------------ */

export function DonutChart({
  segments,
  size = 150,
  stroke = 18,
  centerLabel,
  centerSub,
}: {
  segments: Array<{ value: number; color: string; label: string }>;
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerSub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = Math.max(
    0.0001,
    segments.reduce((n, s) => n + s.value, 0),
  );
  let acc = 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(100,116,139,0.12)" strokeWidth={stroke} fill="none" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * c;
          const offset = -acc * c;
          acc += frac;
          if (dash <= 0) return null;
          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${Math.max(0, dash - 2)} ${c}`}
              initial={{ strokeDashoffset: c / 4, opacity: 0 }}
              animate={{ strokeDashoffset: offset + c / 4, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{centerLabel}</div>
          {centerSub && <div className="text-[11px] font-semibold text-slate-400">{centerSub}</div>}
        </div>
      </div>
    </div>
  );
}
