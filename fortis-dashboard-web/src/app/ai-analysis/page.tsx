'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  MoonIcon,
  ChartBarIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  TrophyIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import { DumbbellIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

import {
  StainlessSteelPattern,
  ParticleBackground,
} from '@/components/layout/stainless-steel-bg';
import { Sidebar } from '@/components/layout/sidebar';
import { FortisHeader } from '@/components/layout/fortis-header';
import { GlassCard } from '@/components/ui/glass-card';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 1200, delay: number = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, delay);
    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return count;
}

// AI Indicator with pulsing glow
function AIIndicator() {
  return (
    <div className="relative">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#4ade80]/20"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full bg-[#4ade80]/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          delay: 0.3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Core orb */}
      <motion.div
        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#4ade80] via-[#22c55e] to-[#16a34a] flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.5)]"
        animate={{
          boxShadow: [
            '0 0 20px rgba(74,222,128,0.4)',
            '0 0 40px rgba(74,222,128,0.6)',
            '0 0 20px rgba(74,222,128,0.4)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <SparklesIcon className="w-5 h-5 text-black" />
      </motion.div>
    </div>
  );
}

// Gradient text component
function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn('bg-clip-text text-transparent bg-gradient-to-r from-[#4ade80] via-[#86efac] to-[#4ade80]', className)}
      style={{ backgroundSize: '200% 100%' }}
    >
      {children}
    </span>
  );
}

// AI Summary Hero Card
function AISummaryCard() {
  const consistencyImprovement = useAnimatedCounter(23, 1500, 800);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/3 border border-white/10 backdrop-blur-2xl"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: 'easeInOut',
        }}
      />

      <div className="relative p-8">
        <div className="flex items-start gap-6">
          <AIIndicator />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-[#4ade80] uppercase tracking-widest">AI Coach Analysis</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4ade80]/10 border border-[#4ade80]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                <span className="text-[10px] text-[#4ade80]">Live</span>
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-light text-white leading-relaxed">
              You're on track for a <GradientText className="font-medium">350 lb squat</GradientText> by March.
              <br className="hidden md:block" />
              Your training consistency has improved{' '}
              <GradientText className="font-medium">{consistencyImprovement}%</GradientText> this month.
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-[#4ade80]" />
                <span className="text-xs text-zinc-300">Trending Up</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-300">Updated today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Insight Card Component
function InsightCard({
  icon: Icon,
  title,
  insight,
  detail,
  accentColor = '#4ade80',
  delay = 0,
  direction = 'up',
}: {
  icon: React.ElementType;
  title: string;
  insight: string;
  detail: string;
  accentColor?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const initialAnimation = {
    up: { opacity: 0, y: 30 },
    left: { opacity: 0, x: -30 },
    right: { opacity: 0, x: 30 },
  };

  return (
    <motion.div
      initial={initialAnimation[direction]}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 backdrop-blur-2xl transition-all duration-300 cursor-pointer',
          isExpanded ? 'border-white/20' : 'hover:border-white/15'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Hover glow effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, transparent 70%)`,
          }}
        />

        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}05)`,
                borderColor: `${accentColor}30`,
              }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: accentColor }} />
            </div>

            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              className="p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
            </motion.button>
          </div>

          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mt-4 mb-2">
            {title}
          </h3>

          <p className="text-white font-medium leading-relaxed">
            {insight}
          </p>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {detail}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Goal Projection Component
function GoalProjection({
  goal,
  target,
  current,
  projectedDate,
  isAchieved = false,
  delay = 0,
}: {
  goal: string;
  target: number;
  current: number;
  projectedDate: string;
  isAchieved?: boolean;
  delay?: number;
}) {
  const progress = Math.min((current / target) * 100, 100);
  const animatedProgress = useAnimatedCounter(progress, 1200, delay + 500);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={cn(
        'relative p-5 rounded-xl border backdrop-blur-xl transition-all',
        isAchieved
          ? 'bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/5 border-[#4ade80]/30'
          : 'bg-gradient-to-br from-white/8 to-white/3 border-white/10'
      )}
    >
      {isAchieved && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3, type: 'spring' }}
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4ade80] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)]"
        >
          <CheckCircleIcon className="w-4 h-4 text-black" />
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-white">{goal}</h4>
        <span className={cn(
          'text-xs font-mono',
          isAchieved ? 'text-[#4ade80]' : 'text-zinc-400'
        )}>
          {isAchieved ? 'Achieved!' : projectedDate}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-light text-white font-mono">{current}</span>
        <span className="text-sm text-zinc-500">/ {target} lbs</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${animatedProgress}%` }}
          transition={{ duration: 1.2, delay: delay + 0.3, ease: 'easeOut' }}
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isAchieved
              ? 'bg-gradient-to-r from-[#4ade80] to-[#86efac]'
              : 'bg-gradient-to-r from-[#22c55e] to-[#4ade80]'
          )}
        />
        {isAchieved && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          />
        )}
      </div>
    </motion.div>
  );
}

// Weekly Report Card
function WeeklyReportCard() {
  const stats = [
    { label: 'Workouts', value: 5, target: 4, grade: 'A', icon: DumbbellIcon },
    { label: 'Volume', value: '32k', target: '30k', grade: 'A-', icon: ChartBarIcon },
    { label: 'Recovery', value: '8h', target: '8h', grade: 'B+', icon: MoonIcon },
    { label: 'Consistency', value: '100%', target: '80%', grade: 'A+', icon: TrophyIcon },
  ];

  const overallGrade = 'A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 backdrop-blur-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">Weekly Report</h3>
            <p className="text-xs text-zinc-500 mt-1">Dec 14 - Dec 20, 2024</p>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2, type: 'spring' }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4ade80] to-[#22c55e] flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)]">
              <span className="text-2xl font-bold text-black">{overallGrade}</span>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/80 border border-[#4ade80]/30">
              <span className="text-[10px] text-[#4ade80] font-medium">Overall</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="text-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
            >
              <stat.icon className="w-4.5 h-4.5 mx-auto text-zinc-500 mb-2" />
              <div className="text-xl font-mono text-white mb-1">{stat.value}</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">{stat.label}</div>
              <div
                className={cn(
                  'inline-block px-2 py-0.5 rounded-md text-xs font-bold',
                  stat.grade.startsWith('A') ? 'bg-[#4ade80]/20 text-[#4ade80]' : 'bg-yellow-500/20 text-yellow-400'
                )}
              >
                {stat.grade}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#4ade80]/5 to-transparent border border-[#4ade80]/10"
        >
          <div className="flex items-start gap-3">
            <LightBulbIcon className="w-4.5 h-4.5 text-[#4ade80] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-zinc-300">
              <span className="text-[#4ade80] font-medium">Great week!</span> You exceeded your workout target and maintained excellent consistency. Consider adding an extra rest day next week for optimal recovery.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function AIAnalysisPage() {
  const [activePage, setActivePage] = useState('ai');

  const insights = [
    {
      icon: ArrowTrendingUpIcon,
      title: 'Progress Analysis',
      insight: 'Your squat improved 12% this month',
      detail: 'Based on your recent sessions, you\'ve added 35 lbs to your squat since November. This rate of progression is above average for intermediate lifters. Keep pushing progressive overload.',
      accentColor: '#4ade80',
      direction: 'left' as const,
    },
    {
      icon: TrophyIcon,
      title: 'Weak Point Detection',
      insight: 'Shoulders are undertrained compared to chest',
      detail: 'Your chest volume is 2.3x higher than shoulders. Consider adding 2-3 sets of lateral raises and face pulls per session to balance your upper body development.',
      accentColor: '#f59e0b',
      direction: 'up' as const,
    },
    {
      icon: MoonIcon,
      title: 'Recovery Insights',
      insight: 'You perform best after 2 rest days',
      detail: 'Analysis of your PR attempts shows 73% success rate after 2 rest days vs 45% after 1 rest day. Your nervous system benefits from extra recovery time.',
      accentColor: '#8b5cf6',
      direction: 'right' as const,
    },
    {
      icon: ChartBarIcon,
      title: 'Training Patterns',
      insight: 'Most volume on push days, consider more pull work',
      detail: 'Push exercises account for 45% of your weekly volume while pull is only 28%. This imbalance may lead to postural issues. Aim for a 1:1 push-to-pull ratio.',
      accentColor: '#22c55e',
      direction: 'left' as const,
    },
    {
      icon: BoltIcon,
      title: 'Volume Trends',
      insight: 'Weekly volume up 15% from last month',
      detail: 'You\'re averaging 42,500 lbs per week, up from 37,000 lbs last month. This progressive increase is driving your strength gains. Monitor recovery closely.',
      accentColor: '#0ea5e9',
      direction: 'up' as const,
    },
    {
      icon: LightBulbIcon,
      title: 'Recommendations',
      insight: 'Consider adding more pulling exercises',
      detail: 'To optimize your training balance, add 2-3 sets of rows or pull-ups to each session. This will improve posture, prevent injury, and enhance overall strength.',
      accentColor: '#86efac',
      direction: 'right' as const,
    },
  ];

  const goals = [
    { goal: '350 lb Squat', target: 350, current: 315, projectedDate: 'Mar 2025' },
    { goal: '225 lb Bench', target: 225, current: 225, projectedDate: 'Achieved!', isAchieved: true },
    { goal: '405 lb Deadlift', target: 405, current: 385, projectedDate: 'Feb 2025' },
  ];

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
              <AcademicCapIcon className="w-7 h-7 text-[#4ade80]" />
              AI Analysis
            </h2>
            <p className="text-zinc-500 mt-1 text-sm">
              Intelligent insights powered by your training data
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/50 border border-white/10">
              <SparklesIcon className="w-3.5 h-3.5 text-[#4ade80]" />
              <span className="text-xs text-zinc-300">Analyzing 127 workouts</span>
            </div>
          </div>
        </motion.header>

        {/* AI Summary Hero */}
        <div className="mb-8">
          <AISummaryCard />
        </div>

        {/* Insight Cards Grid */}
        <div className="mb-8">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4"
          >
            Key Insights
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <InsightCard
                key={insight.title}
                {...insight}
                delay={0.4 + i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Goal Projections */}
        <div className="mb-8">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4"
          >
            Goal Projections
          </motion.h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((goal, i) => (
              <GoalProjection
                key={goal.goal}
                {...goal}
                delay={0.7 + i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Weekly Report */}
        <WeeklyReportCard />
      </main>
    </div>
  );
}
