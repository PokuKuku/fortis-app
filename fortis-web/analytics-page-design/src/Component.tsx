/**
 * AnalyticsPage
 * A comprehensive analytics dashboard with advanced performance tracking.
 * Features:
 * - Progress tracking with animated gauges
 * - Performance metrics over time
 * - Personal records and milestones
 * - Muscle group breakdown analytics
 * - Workout frequency heatmap
 * - Comparative analysis with animation
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  Zap,
  Trophy,
  Activity,
  Flame,
  Heart,
  ChevronDown,
  Filter,
  Download,
  LineChart as LineChartIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Sparkles,
  Users
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AnalyticsPageProps {
  userName?: string;
}

// Mock analytics data
const PERFORMANCE_DATA = [
  { date: 'Jan 5', volume: 12400, reps: 285, sets: 18 },
  { date: 'Jan 12', volume: 15600, reps: 312, sets: 22 },
  { date: 'Jan 19', volume: 18900, reps: 345, sets: 25 },
  { date: 'Jan 26', volume: 16200, reps: 328, sets: 21 },
  { date: 'Feb 2', volume: 19800, reps: 361, sets: 27 },
  { date: 'Feb 9', volume: 21400, reps: 378, sets: 29 },
  { date: 'Feb 16', volume: 23100, reps: 395, sets: 31 },
  { date: 'Feb 23', volume: 24600, reps: 412, sets: 33 },
];

const MUSCLE_BREAKDOWN = [
  { name: 'Chest', value: 18, color: '#10b981', growth: 2.4 },
  { name: 'Back', value: 20, color: '#3b82f6', growth: 2.8 },
  { name: 'Legs', value: 28, color: '#8b5cf6', growth: 3.9 },
  { name: 'Arms', value: 22, color: '#ec4899', growth: 3.1 },
  { name: 'Shoulders', value: 12, color: '#f59e0b', growth: 1.8 },
];

const MILESTONES = [
  { name: 'Bench Press PR', value: '315 lbs', date: '2 weeks ago', icon: Trophy },
  { name: 'Total Volume', value: '156k lbs', date: '1 week ago', icon: Flame },
  { name: 'Workout Streak', value: '42 days', date: 'Current', icon: Activity },
  { name: 'Body Weight', value: '190 lbs', date: 'Today', icon: Heart },
];

// --- Stainless Steel Pattern Helper ---
const StainlessSteelPattern = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-black via-zinc-900 to-black transition-colors duration-300">
      {/* Brushed Metal Texture Base */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)`
      }} />
      <div className="absolute inset-0 opacity-10" style={{
         backgroundImage: `repeating-linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 2%, transparent 4%)`
      }} />

      {/* Stainless steel pattern - SVG version */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <pattern id="slashPattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            {/* Staggered Stainless Steel Pattern */}
            {/* Row 1: Forward Slash / centered at 6,6 */}
            <line x1="3" y1="9" x2="9" y2="3" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
            {/* Row 2: Backslash \ centered at 18,18 (sitting in between) */}
            <line x1="15" y1="15" x2="21" y2="21" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#slashPattern)" />
      </svg>
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)]" />
    </div>
  );
};

// --- Fortis Analytics Branding Header ---
const FortisHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex items-center gap-3">
        <style>
          {`
          @keyframes shine {
            0% {
              background-position: 200% 200%;
            }
            100% {
              background-position: -200% -200%;
            }
          }
          `}
        </style>
        <h1
          className="text-[38px] tracking-[0.15em] text-center relative"
          style={{
            fontFamily: 'BankGothic, sans-serif',
            fontWeight: 900,
            // Metallic Green Gradient
            background: 'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
            // Setup for background clip text
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            // Animation
            animation: 'shine 5s linear infinite'
          }}
        >
          FORTIS
        </h1>
      </div>
    </motion.div>
  );
};

// Particle background
const ParticleBackground = () => {
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 10 + Math.random() * 14,
    delay: Math.random() * 6,
    size: 1 + Math.random() * 2.5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/8"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -120],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Animated gauge for progress
const ProgressGauge = ({ value, max, label, delay }: { value: number; max: number; label: string; delay: number }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center"
    >
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="3"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: 'easeOut' }}
            style={{ strokeDasharray: circumference }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-white">{value}</span>
          <span className="text-xs text-zinc-400">/ {max}</span>
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-zinc-300 text-center">{label}</p>
    </motion.div>
  );
};

// Line chart component
const VolumeLineChart = ({ data, delay }: { data: typeof PERFORMANCE_DATA; delay: number }) => {
  const maxValue = Math.max(...data.map(d => d.volume));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.volume / maxValue) * 85;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 backdrop-blur-2xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Training Volume</h3>
          <p className="text-xs text-zinc-400 mt-1">Total tonnage (lbs) over time</p>
        </div>
        <LineChartIcon className="h-5 w-5 text-primary" />
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-48 mb-4">
        <defs>
          <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((line, i) => (
          <line
            key={i}
            x1="0"
            y1={line}
            x2="100"
            y2={line}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}

        {/* Chart area */}
        <motion.path
          d={`${pathD} L 100 100 L 0 100 Z`}
          fill="url(#volumeGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        />

        {/* Chart line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1, delay: delay + 0.1 }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.5"
            fill="#10b981"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: delay + 0.4 + i * 0.05 }}
          />
        ))}
      </svg>

      <div className="flex gap-4 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-zinc-500 font-mono text-xs">{d.date.split(' ')[0]}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Pie chart for muscle breakdown
const MuscleBreakdownChart = ({ delay }: { delay: number }) => {
  const total = MUSCLE_BREAKDOWN.reduce((sum, m) => sum + m.value, 0);
  let currentAngle = -90;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 backdrop-blur-2xl"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Muscle Groups</h3>
          <p className="text-xs text-zinc-400 mt-1">Training volume distribution</p>
        </div>
        <PieChartIcon className="h-5 w-5 text-primary" />
      </div>

      <div className="flex items-center gap-8">
        <svg viewBox="0 0 100 100" className="w-32 h-32 flex-shrink-0">
          {MUSCLE_BREAKDOWN.map((muscle, i) => {
            const sliceAngle = (muscle.value / total) * 360;
            const startAngle = currentAngle * (Math.PI / 180);
            const endAngle = (currentAngle + sliceAngle) * (Math.PI / 180);

            const x1 = 50 + 40 * Math.cos(startAngle);
            const y1 = 50 + 40 * Math.sin(startAngle);
            const x2 = 50 + 40 * Math.cos(endAngle);
            const y2 = 50 + 40 * Math.sin(endAngle);

            const largeArc = sliceAngle > 180 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            currentAngle += sliceAngle;

            const colorMap = ['#4ade80', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

            return (
              <motion.path
                key={i}
                d={pathData}
                fill={colorMap[i] || muscle.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8 }}
                whileHover={{ opacity: 1, filter: 'brightness(1.2)' }}
                transition={{ duration: 0.5, delay: delay + 0.2 + i * 0.08 }}
              />
            );
          })}
        </svg>

        <div className="space-y-2 flex-1">
          {MUSCLE_BREAKDOWN.map((muscle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: delay + 0.3 + i * 0.06 }}
              className="flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: muscle.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{muscle.name}</span>
                  <span className="text-xs text-[#4ade80] font-semibold">+{muscle.growth}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: muscle.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(muscle.value / total) * 100}%` }}
                    transition={{ duration: 0.8, delay: delay + 0.4 + i * 0.06 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Milestones section
const Milestones = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="space-y-3"
    >
      <h3 className="text-lg font-bold text-white">Recent Milestones</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MILESTONES.map((milestone, i) => {
          const Icon = milestone.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.3 + i * 0.08 }}
              className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 backdrop-blur-md group hover:border-primary/60 transition-all duration-300"
            >
              <motion.div
                className="absolute -right-12 -top-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
              />

              <div className="relative z-10 flex items-start gap-4">
                <div className="rounded-lg bg-primary/20 p-2 text-primary ring-1 ring-primary/30">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary/70 uppercase tracking-wider">{milestone.name}</p>
                  <p className="text-2xl font-black text-white mt-1 truncate">{milestone.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{milestone.date}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// Main component
export function AnalyticsPage({ userName = 'Athlete' }: AnalyticsPageProps) {
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'reps' | 'sets'>('volume');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [activePage, setActivePage] = useState('analytics');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai', label: 'AI Analysis', icon: Sparkles },
  ];

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden">
      <StainlessSteelPattern />
      <ParticleBackground />

      {/* Sidebar Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-0 left-0 z-40 w-full border-t border-white/5 bg-gradient-to-t from-zinc-950/95 via-zinc-950/90 to-transparent backdrop-blur-xl md:fixed md:left-0 md:top-0 md:bottom-0 md:w-20 md:border-r md:border-t-0 md:border-l-0 md:from-zinc-950 md:to-zinc-950/80 md:flex md:flex-col md:items-center md:py-8"
      >
        <motion.div 
          className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-primary-foreground font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(74,222,128,0.4)] border border-[#4ade80]/50"
          whileHover={{ scale: 1.1 }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Flame size={28} />
        </motion.div>
        
        <nav className="flex h-16 w-full justify-around items-center md:h-auto md:w-auto md:flex-col md:gap-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative p-3 rounded-xl transition-all duration-300 group",
                  activePage === item.id 
                    ? "text-[#4ade80] bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/5 border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon size={16} />
                {activePage === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] -translate-x-1/2 md:left-auto md:-right-1 md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:w-1 md:h-8 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                  />
                )}
                
                {/* Tooltip for desktop */}
                <span className="absolute left-full ml-4 px-3 py-1 bg-zinc-800/90 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 hidden md:block border border-white/10 font-semibold">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>
        
        <div className="hidden md:flex mt-auto flex-col gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            className="p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <Users size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 p-6 md:p-8 md:pl-28">
        <FortisHeader />
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">Detailed Insights</h2>
              <p className="text-zinc-400 mt-2">Performance tracking & analytics</p>
            </div>
            <div className="flex gap-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <motion.button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300',
                    timeRange === range
                      ? 'bg-[#4ade80] text-black'
                      : 'border border-white/10 text-zinc-300 hover:border-[#4ade80]/50'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: 'Weekly Volume', value: '24.6k lbs', change: 12, icon: TrendingUp },
            { label: 'Workouts', value: '5/6', change: 0, icon: Activity },
            { label: 'Total PRs', value: '12', change: 3, icon: Trophy },
            { label: 'Streak Days', value: '42', change: 0, icon: Flame },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.05 }}
                className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-2xl group hover:border-primary/60 transition-all duration-300"
              >
                <motion.div
                  className="absolute -right-8 -top-8 w-20 h-20 bg-primary/10 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-primary/50" />
                    {metric.change !== 0 && (
                      <span className="text-xs font-semibold text-[#4ade80]">+{metric.change}%</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-400 mt-2">{metric.label}</p>
                  <p className="text-2xl font-black text-white mt-1">{metric.value}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <VolumeLineChart data={PERFORMANCE_DATA} delay={0.2} />
          </div>
          <MuscleBreakdownChart delay={0.25} />
        </div>

        {/* Progress Gauges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-6">Monthly Goals Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ProgressGauge value={24} max={26} label="Workouts" delay={0.35} />
            <ProgressGauge value={85} max={100} label="Volume" delay={0.4} />
            <ProgressGauge value={156} max={160} label="Total Sets" delay={0.45} />
            <ProgressGauge value={42} max={30} label="Streak Days" delay={0.5} />
          </div>
        </motion.div>

        {/* Milestones */}
        <Milestones delay={0.35} />
      </div>
    </div>
  );
}

export default AnalyticsPage;
