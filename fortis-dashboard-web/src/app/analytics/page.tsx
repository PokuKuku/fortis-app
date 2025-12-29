'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  TrophyIcon,
  ArrowUpRightIcon,
  BoltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

import {
  StainlessSteelPattern,
  ParticleBackground,
} from '@/components/layout/stainless-steel-bg';
import { Sidebar } from '@/components/layout/sidebar';
import { FortisHeader } from '@/components/layout/fortis-header';
import { GlassCard } from '@/components/ui/glass-card';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1500, delay: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration / 16);
      timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          if (timer) {
            clearInterval(timer);
          }
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [end, duration, delay]);

  return count;
}

// Exercise Progress Hero Chart
function ExerciseProgressChart({ exercise }: { exercise: string }) {
  const exerciseData: Record<string, { data: number[]; current: number; pr: number }> = {
    Squat: { data: [225, 235, 245, 250, 265, 275, 285, 290, 295, 305, 310, 315], current: 315, pr: 315 },
    Bench: { data: [135, 145, 155, 160, 170, 175, 185, 190, 195, 205, 215, 225], current: 225, pr: 225 },
    Deadlift: { data: [275, 295, 315, 335, 345, 355, 365, 375, 385, 395, 400, 405], current: 405, pr: 405 },
    OHP: { data: [85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 132, 135], current: 135, pr: 135 },
  };

  const { data, current, pr } = exerciseData[exercise] || exerciseData.Squat;
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;

  const width = 100;
  const height = 100;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / (max - min)) * height * 0.85 - 7,
    value: v,
  }));

  const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  const animatedCurrent = useAnimatedCounter(current, 1200, 500);
  const animatedPR = useAnimatedCounter(pr, 1200, 700);

  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  return (
    <div className="relative w-full h-[380px] overflow-hidden">
      {/* Gradient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#4ade80]/8 via-[#4ade80]/3 to-transparent pointer-events-none" />

      {/* Y-axis labels */}
      <div className="absolute left-4 top-8 bottom-16 flex flex-col justify-between text-[10px] font-mono text-zinc-600">
        <span>{Math.round(max)} lbs</span>
        <span>{Math.round((max + min) / 2)} lbs</span>
        <span>{Math.round(min)} lbs</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full pl-12"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="progressAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#22c55e" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="progressLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="0.3"
          />
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#progressAreaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#progressLineGradient)"
          strokeWidth="0.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint === i ? 2 : 1.2}
              fill={i === points.length - 1 ? '#86efac' : '#4ade80'}
              filter={i === points.length - 1 ? 'url(#glow)' : undefined}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              onMouseEnter={() => setHoveredPoint(i)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            />
            {/* Tooltip */}
            {hoveredPoint === i && (
              <g>
                <rect
                  x={p.x - 12}
                  y={p.y - 12}
                  width="24"
                  height="8"
                  rx="1"
                  fill="rgba(0,0,0,0.8)"
                  stroke="rgba(74,222,128,0.3)"
                  strokeWidth="0.3"
                />
                <text
                  x={p.x}
                  y={p.y - 7}
                  textAnchor="middle"
                  className="text-[3px] fill-white font-mono"
                >
                  {p.value} lbs
                </text>
              </g>
            )}
          </g>
        ))}

        {/* PR marker */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8 }}
        >
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3"
            fill="none"
            stroke="#4ade80"
            strokeWidth="0.4"
            opacity="0.5"
          />
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="5"
            fill="none"
            stroke="#4ade80"
            strokeWidth="0.2"
            opacity="0.3"
          />
        </motion.g>
      </svg>

      {/* Month labels */}
      <div className="absolute bottom-4 left-12 right-4 flex justify-between text-[10px] font-mono text-zinc-600">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
          <span key={m} className={i === 11 ? 'text-[#4ade80]' : ''}>{m}</span>
        ))}
      </div>

      {/* Stats overlay */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute top-6 right-6 text-right space-y-4"
      >
        <div>
          <div className="text-5xl font-light text-white tracking-tight font-mono">
            {animatedCurrent}
            <span className="text-xl text-zinc-500 ml-1">lbs</span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">Current {exercise}</div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <TrophyIcon className="w-3.5 h-3.5 text-[#4ade80]" />
          <span className="text-sm font-mono text-[#4ade80]">PR: {animatedPR} lbs</span>
        </div>
        <div className="flex items-center justify-end gap-1 text-[#86efac]">
          <ArrowUpRightIcon className="w-3.5 h-3.5" />
          <span className="text-sm font-mono">+40% YTD</span>
        </div>
      </motion.div>
    </div>
  );
}

// Volume Breakdown Donut Chart
function VolumeDonutChart() {
  const segments = [
    { name: 'Legs', value: 35, color: '#4ade80' },
    { name: 'Chest', value: 25, color: '#22c55e' },
    { name: 'Back', value: 20, color: '#86efac' },
    { name: 'Shoulders', value: 12, color: '#16a34a' },
    { name: 'Arms', value: 8, color: '#15803d' },
  ];

  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const totalVolume = useAnimatedCounter(42500, 1500, 300);

  const size = 220;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* Segments */}
          {segments.map((segment, i) => {
            const segmentLength = (segment.value / 100) * circumference;
            const offset = accumulatedOffset;
            accumulatedOffset += segmentLength;

            return (
              <motion.circle
                key={segment.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoveredSegment === segment.name ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${segmentLength} ${circumference}` }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
                onMouseEnter={() => setHoveredSegment(segment.name)}
                onMouseLeave={() => setHoveredSegment(null)}
                style={{
                  cursor: 'pointer',
                  filter: hoveredSegment === segment.name ? 'drop-shadow(0 0 8px rgba(74,222,128,0.5))' : undefined,
                  transition: 'stroke-width 0.2s, filter 0.2s',
                }}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <div className="text-3xl font-light text-white font-mono">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
              Total lbs
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mt-6 w-full">
        {segments.map((segment, i) => (
          <motion.div
            key={segment.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.1 }}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all cursor-pointer',
              hoveredSegment === segment.name ? 'bg-white/10' : 'hover:bg-white/5'
            )}
            onMouseEnter={() => setHoveredSegment(segment.name)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-xs text-zinc-400">{segment.name}</span>
            <span className="text-xs font-mono text-white ml-auto">{segment.value}%</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// PR Timeline
function PRTimeline() {
  const prs = [
    { exercise: 'Squat', weight: 315, date: 'Dec 15', isNew: true },
    { exercise: 'Deadlift', weight: 405, date: 'Nov 28', isNew: false },
    { exercise: 'Bench', weight: 225, date: 'Oct 12', isNew: false },
    { exercise: 'OHP', weight: 135, date: 'Sep 5', isNew: false },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        {/* Timeline line */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute left-3 top-0 w-px bg-gradient-to-b from-[#4ade80] via-[#22c55e]/50 to-transparent"
        />

        {/* PR items */}
        <div className="space-y-6">
          {prs.map((pr, i) => (
            <motion.div
              key={pr.exercise}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="relative flex items-start gap-4 pl-8"
            >
              {/* Dot */}
              <div
                className={cn(
                  'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center',
                  pr.isNew
                    ? 'bg-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.5)]'
                    : 'bg-zinc-800 border border-zinc-700'
                )}
              >
                {pr.isNew ? (
                  <BoltIcon className="w-3 h-3 text-black" />
                ) : (
                  <TrophyIcon className="w-2.5 h-2.5 text-zinc-500" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{pr.exercise}</span>
                  {pr.isNew && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ade80]/20 text-[#4ade80] font-medium">
                      NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl font-mono text-[#4ade80]">{pr.weight} lbs</span>
                  <span className="text-xs text-zinc-600">{pr.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Lift Comparison Chart
function LiftComparisonChart() {
  const lifts = [
    { name: 'Squat', color: '#4ade80', data: [225, 245, 265, 285, 295, 315] },
    { name: 'Bench', color: '#22c55e', data: [155, 170, 185, 195, 210, 225] },
    { name: 'Deadlift', color: '#86efac', data: [315, 345, 365, 385, 395, 405] },
    { name: 'OHP', color: '#16a34a', data: [95, 105, 115, 125, 130, 135] },
  ];

  const allValues = lifts.flatMap(l => l.data);
  const max = Math.max(...allValues) * 1.1;
  const min = Math.min(...allValues) * 0.8;

  const width = 100;
  const height = 60;

  const [activeLift, setActiveLift] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {lifts.map((lift) => (
          <button
            key={lift.name}
            onClick={() => setActiveLift(activeLift === lift.name ? null : lift.name)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs',
              activeLift === lift.name
                ? 'bg-white/10 border border-white/20'
                : activeLift === null
                ? 'hover:bg-white/5'
                : 'opacity-30 hover:opacity-60'
            )}
          >
            <div
              className="w-3 h-0.5 rounded-full"
              style={{ backgroundColor: lift.color }}
            />
            <span className="text-zinc-300">{lift.name}</span>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-[200px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid */}
          {[0, 20, 40, 60].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2={width}
              y2={y}
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="0.2"
            />
          ))}

          {/* Lines */}
          {lifts.map((lift, liftIndex) => {
            const points = lift.data.map((v, i) => ({
              x: (i / (lift.data.length - 1)) * width,
              y: height - ((v - min) / (max - min)) * height * 0.9 - 3,
            }));

            const linePath = points.map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`)).join(' ');

            const isActive = activeLift === null || activeLift === lift.name;

            return (
              <motion.path
                key={lift.name}
                d={linePath}
                fill="none"
                stroke={lift.color}
                strokeWidth={isActive ? 0.8 : 0.3}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 1 : 0.2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: liftIndex * 0.2, ease: 'easeOut' }}
              />
            );
          })}

          {/* End points */}
          {lifts.map((lift, liftIndex) => {
            const lastPoint = {
              x: width,
              y: height - ((lift.data[lift.data.length - 1] - min) / (max - min)) * height * 0.9 - 3,
            };
            const isActive = activeLift === null || activeLift === lift.name;

            return (
              <motion.circle
                key={lift.name}
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={isActive ? 1.5 : 0.8}
                fill={lift.color}
                opacity={isActive ? 1 : 0.2}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0.2 }}
                transition={{ delay: 1.5 + liftIndex * 0.2 }}
              />
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-4 flex flex-col justify-between text-[10px] font-mono text-zinc-600">
          <span>{Math.round(max)} lbs</span>
          <span>{Math.round(min)} lbs</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[10px] font-mono text-zinc-600">
          <span>Jul</span>
          <span>Aug</span>
          <span>Sep</span>
          <span>Oct</span>
          <span>Nov</span>
          <span>Dec</span>
        </div>
      </div>
    </div>
  );
}

// Dropdown component
function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/10 text-sm text-white hover:border-white/20 transition-all"
      >
        <span>{value}</span>
        <ChevronDownIcon className={cn('w-3.5 h-3.5 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 w-full bg-zinc-900 border border-white/10 rounded-lg overflow-hidden z-50"
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm transition-colors',
                  value === option
                    ? 'bg-[#4ade80]/20 text-[#4ade80]'
                    : 'text-zinc-300 hover:bg-white/5'
                )}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnalyticsPage() {
  const [activePage, setActivePage] = useState('analytics');
  const [timeRange, setTimeRange] = useState('Year');
  const [selectedExercise, setSelectedExercise] = useState('Squat');

  return (
    <div className="min-h-screen w-full text-zinc-200 font-sans selection:bg-[#4ade80]/30 selection:text-white relative overflow-hidden">
      <StainlessSteelPattern />
      <ParticleBackground />

      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      {/* Main Content */}
      <main className="relative z-10 pb-24 pt-8 px-4 md:pl-28 md:pr-8 md:pt-8 md:pb-8 max-w-7xl mx-auto">
        <FortisHeader />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight flex items-center gap-3">
              <ArrowTrendingUpIcon className="w-7 h-7 text-[#4ade80]" />
              Analytics
            </h2>
            <p className="text-zinc-500 mt-1 text-sm">
              Deep dive into your training data
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown
              value={selectedExercise}
              options={['Squat', 'Bench', 'Deadlift', 'OHP']}
              onChange={setSelectedExercise}
            />

            <div className="flex items-center gap-1 p-1 bg-zinc-900/50 backdrop-blur-sm rounded-lg border border-white/5">
              {['Week', 'Month', 'Year', 'All'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                    timeRange === range
                      ? 'bg-[#4ade80] text-black'
                      : 'text-zinc-500 hover:text-white'
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </motion.header>

        {/* Hero Chart */}
        <GlassCard className="mb-6" transition={{ delay: 0.1 }}>
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/5 flex items-center justify-center border border-[#4ade80]/20">
                  <ChartBarIcon className="w-4.5 h-4.5 text-[#4ade80]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-white">{selectedExercise} Progression</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Weight over time • {timeRange}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <CalendarDaysIcon className="w-3.5 h-3.5" />
                <span>Last updated today</span>
              </div>
            </div>
          </div>
          <ExerciseProgressChart exercise={selectedExercise} />
        </GlassCard>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Volume Breakdown */}
          <GlassCard transition={{ delay: 0.2 }}>
            <div className="p-5 border-b border-white/5">
              <h3 className="text-base font-medium text-white">Volume Distribution</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Training volume by muscle group</p>
            </div>
            <div className="p-6">
              <VolumeDonutChart />
            </div>
          </GlassCard>

          {/* PR Timeline */}
          <GlassCard transition={{ delay: 0.3 }}>
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-medium text-white">Personal Records</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Recent milestones achieved</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                  <span className="text-[10px] text-[#4ade80] font-medium">4 PRs this month</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <PRTimeline />
            </div>
          </GlassCard>
        </div>

        {/* Lift Comparison Chart */}
        <GlassCard transition={{ delay: 0.4 }}>
          <div className="p-5 border-b border-white/5">
            <h3 className="text-base font-medium text-white">Lift Comparison</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Compare progression across major lifts</p>
          </div>
          <div className="p-6">
            <LiftComparisonChart />
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
