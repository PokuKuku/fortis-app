'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRightIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

import {
  StainlessSteelPattern,
  ParticleBackground,
} from '@/components/layout/stainless-steel-bg';
import { Sidebar } from '@/components/layout/sidebar';
import { FortisHeader } from '@/components/layout/fortis-header';
import { GlassCard } from '@/components/ui/glass-card';
import { BodyHeatmap } from '@/components/charts/body-heatmap';

/**
 * FORTIS DASHBOARD
 * Main dashboard with Apex Classic design.
 * Uses full design system: Sidebar, StainlessSteelPattern, ParticleBackground, GlassCard.
 */

// Color palette
const colors = {
  green: { main: '#4ade80', light: '#86efac', dark: '#22c55e' },
  purple: { main: '#a78bfa', light: '#c4b5fd', dark: '#8b5cf6' },
  cyan: { main: '#22d3ee', light: '#67e8f9', dark: '#06b6d4' },
  orange: { main: '#fb923c', light: '#fdba74', dark: '#f97316' },
  pink: { main: '#f472b6', light: '#f9a8d4', dark: '#ec4899' },
  gold: { main: '#fbbf24', light: '#fcd34d', dark: '#f59e0b' },
};

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Power Meter with particles
function PowerMeter({ value }: { value: number }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const percentage = value;
  const radius = 90;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now(),
        x: Math.random() * 40 - 20,
        y: Math.random() * 20 - 40,
        color: [colors.green.main, colors.cyan.main, colors.purple.main][Math.floor(Math.random() * 3)],
      };
      setParticles(prev => [...prev.slice(-6), newParticle]);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-[260px] h-[160px]">
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 rounded-full blur-3xl"
        style={{ background: `radial-gradient(ellipse, ${colors.green.main}30, transparent)` }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full"
            style={{
              backgroundColor: particle.color,
              left: '50%',
              bottom: '15px',
              boxShadow: `0 0 4px ${particle.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: particle.x * 2, y: particle.y * 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      <svg viewBox="0 0 220 130" className="w-full h-full">
        <defs>
          <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.purple.main} />
            <stop offset="50%" stopColor={colors.cyan.main} />
            <stop offset="100%" stopColor={colors.green.main} />
          </linearGradient>
          <filter id="powerGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={`M 20,110 A ${radius},${radius} 0 0,1 200,110`}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        <motion.path
          d={`M 20,110 A ${radius},${radius} 0 0,1 200,110`}
          fill="none"
          stroke="url(#powerGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          filter="url(#powerGlow)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-4xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-green-400">
            {value}
          </div>
          <div className="text-[9px] text-zinc-500 uppercase tracking-[0.15em]">Power Level</div>
        </motion.div>
      </div>
    </div>
  );
}

// Floating stat badge
function FloatingStat({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -4, 0] }}
      transition={{ delay, y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
      className="px-3 py-2 rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl"
    >
      <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
      <div className="text-[8px] text-zinc-500 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

// Multi-Line Chart
function MultiLineChart() {
  const data = {
    volume: [32, 45, 38, 55, 48, 62, 55, 72, 68, 82, 78, 92],
    intensity: [60, 65, 62, 70, 68, 75, 72, 78, 80, 82, 85, 88],
    frequency: [45, 60, 45, 60, 75, 60, 75, 75, 60, 75, 90, 75],
  };

  const width = 100;
  const height = 50;

  const createPath = (values: number[], max: number) => {
    const points = values.map((v, i) => ({
      x: (i / (values.length - 1)) * width,
      y: height - (v / max) * height * 0.8 - 5,
    }));
    return points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  };

  const createArea = (path: string) => `${path} L ${width},${height} L 0,${height} Z`;

  const lines = [
    { data: data.volume, max: 100, color: colors.cyan.main, label: 'Volume', value: '92k' },
    { data: data.intensity, max: 100, color: colors.purple.main, label: 'Intensity', value: '88%' },
    { data: data.frequency, max: 100, color: colors.green.main, label: 'Frequency', value: '5/wk' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white">Performance Trends</h3>
          <p className="text-xs text-zinc-500 mt-0.5">12-month progression</p>
        </div>
        <div className="flex gap-3">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
              <span className="text-[10px] text-zinc-500">{line.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[140px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          <defs>
            {lines.map((line, i) => (
              <linearGradient key={i} id={`lineGrad${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {lines.map((line, i) => {
            const path = createPath(line.data, line.max);
            return (
              <g key={i}>
                <motion.path
                  d={createArea(path)}
                  fill={`url(#lineGrad${i})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
                />
                <motion.path
                  d={path}
                  fill="none"
                  stroke={line.color}
                  strokeWidth="0.4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: i * 0.15 }}
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] font-mono text-zinc-600">
          <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
        </div>
      </div>
    </div>
  );
}

// Colorful Donut
function ColorfulDonut() {
  const data = [
    { name: 'Legs', value: 25, color: colors.green.main },
    { name: 'Back', value: 22, color: colors.cyan.main },
    { name: 'Chest', value: 20, color: colors.purple.main },
    { name: 'Arms', value: 18, color: colors.orange.main },
    { name: 'Shoulders', value: 15, color: colors.pink.main },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let cumulativePercent = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[120px] h-[120px]">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          {data.map((item, i) => {
            const percent = item.value / total;
            const offset = cumulativePercent * circumference;
            const dash = percent * circumference;
            cumulativePercent += percent;

            return (
              <motion.circle
                key={item.name}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 60 60)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.08 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-light text-white">{total}%</span>
          <span className="text-[8px] text-zinc-500 uppercase">Coverage</span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {data.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.06 }}
            className="flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] text-zinc-400 w-14">{item.name}</span>
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
              />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 w-6 text-right">{item.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Bar Race Chart
function BarRaceChart() {
  const exercises = [
    { name: 'Squat', value: 24500, color: colors.green.main },
    { name: 'Deadlift', value: 21200, color: colors.purple.main },
    { name: 'Bench', value: 18800, color: colors.cyan.main },
    { name: 'Row', value: 15600, color: colors.orange.main },
    { name: 'OHP', value: 12400, color: colors.pink.main },
  ];

  const max = Math.max(...exercises.map(e => e.value));

  return (
    <div className="space-y-2.5">
      {exercises.map((ex, i) => (
        <motion.div
          key={ex.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.08 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-400">{ex.name}</span>
            <span className="text-[9px] font-mono text-zinc-500">{(ex.value / 1000).toFixed(1)}k</span>
          </div>
          <div className="h-2.5 bg-zinc-800/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${ex.color}80, ${ex.color})`,
                boxShadow: `0 0 8px ${ex.color}30`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(ex.value / max) * 100}%` }}
              transition={{ delay: 0.4 + i * 0.12, duration: 0.7, ease: 'easeOut' }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Glowing Heatmap
function GlowingHeatmap() {
  const weeks = [
    [2, 0, 3, 0, 2, 1, 0],
    [3, 0, 2, 0, 3, 0, 1],
    [2, 1, 3, 0, 2, 0, 0],
    [3, 0, 2, 1, 3, 0, 0],
  ];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = { week: 3, day: 4 };

  const getColor = (v: number) => {
    if (v === 0) return 'bg-zinc-800/50';
    if (v === 1) return 'bg-green-500/30';
    if (v === 2) return 'bg-green-500/60';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 pl-5">
        {days.map((day, i) => (
          <div key={i} className="w-6 text-center text-[8px] text-zinc-600">{day}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex items-center gap-1">
          <span className="w-4 text-[8px] text-zinc-600 text-right">W{wi + 1}</span>
          {week.map((v, di) => {
            const isToday = wi === today.week && di === today.day;
            return (
              <motion.div
                key={di}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + wi * 0.04 + di * 0.02 }}
                className={cn(
                  'w-6 h-6 rounded',
                  getColor(v),
                  isToday && 'ring-1 ring-green-400 ring-offset-1 ring-offset-zinc-900'
                )}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Radial Progress Card
function RadialProgressCard({
  title,
  value,
  suffix,
  progress,
  color,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  value: string;
  suffix?: string;
  progress: number;
  color: string;
  icon: React.ElementType;
  delay?: number;
}) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <div className="relative w-14 h-14">
        <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
          <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          <motion.circle
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ delay: delay + 0.3, duration: 0.8 }}
            style={{ filter: `drop-shadow(0 0 3px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div>
        <div className="text-[9px] text-zinc-500 uppercase tracking-wider">{title}</div>
        <div className="text-lg font-light text-white">
          {value}
          {suffix && <span className="text-xs text-zinc-500 ml-0.5">{suffix}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// Live Ticker
function LiveTicker() {
  const activities = [
    { exercise: 'Squat', detail: '315 lbs × 5', isPR: true, time: '2m ago' },
    { exercise: 'Bench Press', detail: '225 lbs × 8', isPR: false, time: '8m ago' },
    { exercise: 'Deadlift', detail: '405 lbs × 3', isPR: true, time: '15m ago' },
    { exercise: 'Row', detail: '185 lbs × 10', isPR: false, time: '22m ago' },
  ];

  return (
    <div className="overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Live Activity</span>
      </div>
      <motion.div
        className="flex gap-3"
        animate={{ x: [0, -500] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {[...activities, ...activities].map((item, i) => (
          <div
            key={i}
            className={cn(
              'flex-shrink-0 px-2.5 py-1.5 rounded-lg border',
              item.isPR ? 'border-yellow-500/30 bg-yellow-500/10' : 'border-white/5 bg-white/[0.02]'
            )}
          >
            <div className="flex items-center gap-2">
              {item.isPR && <TrophyIcon className="w-3 h-3 text-yellow-400" />}
              <span className="text-[10px] text-white">{item.exercise}</span>
              <span className="text-[9px] text-zinc-500">{item.detail}</span>
              <span className="text-[8px] text-zinc-600">{item.time}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const [activePage, setActivePage] = useState('dashboard');
  const userName = 'Athlete';

  return (
    <div className="min-h-screen w-full text-zinc-200 font-sans selection:bg-[#4ade80]/30 selection:text-white relative overflow-hidden">
      <StainlessSteelPattern />
      <ParticleBackground />

      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="relative z-10 pb-24 pt-8 px-4 md:pl-28 md:pr-8 md:pt-8 md:pb-8 max-w-7xl mx-auto">
        <FortisHeader />

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2
            className="text-2xl md:text-4xl font-medium text-white tracking-tight"
            style={{ fontFamily: 'BankGothicMediumBT, sans-serif' }}
          >
            {getGreeting()},
          </h2>
          <motion.h2
            className="text-2xl md:text-4xl font-medium tracking-tight"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 4,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            style={{
              fontFamily: 'BankGothicMediumBT, sans-serif',
              background: 'linear-gradient(90deg, #4ade80, #22d3ee, #a78bfa, #f472b6, #fbbf24, #4ade80)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {userName}
          </motion.h2>
          <p className="text-zinc-500 text-sm mt-1">Your strength journey at a glance</p>
        </motion.div>

        {/* Hero: Power Meter + Floating Stats */}
        <GlassCard className="mb-6" transition={{ delay: 0.2 }}>
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <PowerMeter value={847} />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <FloatingStat label="Volume" value="92k" color={colors.cyan.main} delay={0.4} />
              <FloatingStat label="Streak" value="18d" color={colors.orange.main} delay={0.5} />
              <FloatingStat label="PRs" value="12" color={colors.gold.main} delay={0.6} />
              <FloatingStat label="Recovery" value="92%" color={colors.pink.main} delay={0.7} />
            </div>
          </div>
        </GlassCard>

        {/* Live Ticker */}
        <GlassCard className="mb-6" transition={{ delay: 0.3 }}>
          <div className="p-4">
            <LiveTicker />
          </div>
        </GlassCard>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Multi-Line Chart */}
          <GlassCard className="col-span-12 lg:col-span-7" transition={{ delay: 0.4 }}>
            <div className="p-5">
              <MultiLineChart />
            </div>
          </GlassCard>

          {/* Donut Chart */}
          <GlassCard className="col-span-12 lg:col-span-5" transition={{ delay: 0.45 }}>
            <div className="p-5">
              <h3 className="text-sm font-medium text-white mb-4">Muscle Distribution</h3>
              <ColorfulDonut />
            </div>
          </GlassCard>

          {/* Bar Race */}
          <GlassCard className="col-span-12 md:col-span-6 lg:col-span-4" transition={{ delay: 0.5 }}>
            <div className="p-5">
              <h3 className="text-sm font-medium text-white mb-4">Top Exercises</h3>
              <BarRaceChart />
            </div>
          </GlassCard>

          {/* Body Heatmap */}
          <GlassCard className="col-span-12 md:col-span-6 lg:col-span-4" transition={{ delay: 0.55 }}>
            <div className="p-5">
              <BodyHeatmap />
            </div>
          </GlassCard>

          {/* Radial Progress Cards */}
          <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
            <GlassCard transition={{ delay: 0.6 }}>
              <div className="p-4">
                <RadialProgressCard title="Volume" value="92.5" suffix="k" progress={85} color={colors.cyan.main} icon={BoltIcon} delay={0.65} />
              </div>
            </GlassCard>
            <GlassCard transition={{ delay: 0.65 }}>
              <div className="p-4">
                <RadialProgressCard title="Consistency" value="87" suffix="%" progress={87} color={colors.green.main} icon={FireIcon} delay={0.7} />
              </div>
            </GlassCard>
            <GlassCard transition={{ delay: 0.7 }}>
              <div className="p-4">
                <RadialProgressCard title="Recovery" value="92" suffix="%" progress={92} color={colors.pink.main} icon={HeartIcon} delay={0.75} />
              </div>
            </GlassCard>
            <GlassCard transition={{ delay: 0.75 }}>
              <div className="p-4">
                <RadialProgressCard title="PRs" value="12" progress={75} color={colors.gold.main} icon={TrophyIcon} delay={0.8} />
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  );
}
