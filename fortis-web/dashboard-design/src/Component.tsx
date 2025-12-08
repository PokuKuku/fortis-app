/**
 * StrengthAnalyticsDashboard
 * A premium, production-grade analytics dashboard with advanced animations and visual effects.
 * Features: 
 * - Advanced particle effects and animated backgrounds
 * - Interactive 3D-inspired chart visualizations
 * - Glassmorphism UI with glow effects
 * - Real-time data tracking aesthetics
 * - Industrial futuristic design
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Activity, 
  Calendar, 
  TrendingUp, 
  Users, 
  Settings, 
  ChevronRight,
  Trophy,
  Flame,
  Timer,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

interface StrengthAnalyticsDashboardProps {
  userName?: string;
  theme?: 'dark' | 'midnight'; 
}

// --- Animated Background with Particles ---
const ParticleBackground = () => {
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 5,
    size: 1 + Math.random() * 3,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/10"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 0.8, 0],
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

// --- Enhanced Stat Card ---
const StatCard = ({ title, value, change, icon, trend, delay = 0 }: StatCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-2xl group hover:border-primary/60 transition-all duration-500 cursor-pointer"
    >
      {/* Animated gradient background on hover */}
      <motion.div 
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl"
        animate={isHovered ? { scale: 1.2, opacity: 0.8 } : { scale: 1, opacity: 0.3 }}
        transition={{ duration: 0.4 }}
      />
      
      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <motion.p 
            className="text-xs font-semibold text-primary/70 mb-2 uppercase tracking-widest"
            animate={isHovered ? { letterSpacing: '0.15em' } : { letterSpacing: '0.1em' }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.p>
          <motion.h3 
            className="text-3xl md:text-4xl font-black tracking-tighter text-white font-mono"
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.h3>
        </div>
        
        <motion.div 
          className="rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 p-2 text-primary ring-1 ring-primary/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
      </div>

      {change !== undefined && (
        <motion.div 
          className="relative z-10 mt-4 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <span className={cn(
            "flex items-center text-sm font-bold",
            trend === 'up' ? "text-emerald-400" : trend === 'down' ? "text-rose-400" : "text-zinc-400"
          )}>
            {trend === 'up' ? <ArrowUpRight className="mr-1 h-4 w-4" /> : trend === 'down' ? <ArrowDownRight className="mr-1 h-4 w-4" /> : null}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-zinc-500">vs last month</span>
        </motion.div>
      )}
    </motion.div>
  );
};

// --- Enhanced Chart Bar with glow ---
const ChartBar = ({ height, delay, active }: { height: number, delay: number, active?: boolean }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: `${height}%`, opacity: 1 }}
    transition={{ duration: 1.2, delay, type: "spring", stiffness: 100 }}
    className={cn(
      "w-full rounded-t-lg transition-all duration-300 hover:opacity-100 cursor-crosshair group relative",
      active ? "bg-gradient-to-t from-[#4ade80] via-[#4ade80]/80 to-[#4ade80]/40 shadow-[0_0_20px_rgba(74,222,128,0.5)]" : "bg-gradient-to-t from-zinc-700/70 to-zinc-700/30 hover:from-zinc-600 hover:to-zinc-600/40"
    )}
  >
    {/* Animated top highlight */}
    {active && (
      <motion.div
        className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-lg blur-sm"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
  </motion.div>
);

// --- Volume Chart with enhanced interactivity ---
const VolumeChart = () => {
  const data = [45, 60, 75, 60, 85, 95, 70, 65, 80, 90, 100, 85];
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Volume Load</h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Total tonnage per week (lbs)</p>
        </div>
        <div className="flex gap-2">
          {['1M', '3M', '6M', '1Y'].map((period, i) => (
            <motion.button 
              key={period} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 uppercase tracking-widest",
                i === 1 ? "bg-[#4ade80]/30 text-[#4ade80] border border-[#4ade80]/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]" : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 border border-transparent hover:border-white/10"
              )}
            >
              {period}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 flex items-end gap-2 min-h-[240px] px-2">
        {data.map((h, i) => (
          <motion.div 
            key={i} 
            className="h-full flex-1 flex flex-col justify-end group relative"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Enhanced Tooltip */}
            <AnimatePresence>
              {hoveredIndex === i && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-primary/40 px-3 py-2 rounded-lg text-xs text-white opacity-100 pointer-events-none whitespace-nowrap z-20 font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {h * 1000} lbs
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-800" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <ChartBar height={h} delay={i * 0.06} active={i === data.length - 2} />
            <span className="text-[10px] text-zinc-600 text-center mt-2 font-mono font-semibold hidden sm:block group-hover:text-[#4ade80] transition-colors">W{i+1}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Enhanced Muscle Group Heatmap ---
const MuscleGroupHeatmap = () => {
  const groups = [
    { name: 'Chest', value: 85 },
    { name: 'Back', value: 70 },
    { name: 'Legs', value: 92 },
    { name: 'Shoulders', value: 60 },
    { name: 'Arms', value: 50 },
    { name: 'Core', value: 40 },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Training Split</h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">Muscle group distribution</p>
        </div>
        <motion.span 
          className="text-xs text-[#4ade80] border border-[#4ade80]/40 px-3 py-1 rounded-full bg-[#4ade80]/10 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.2)]"
          whileHover={{ scale: 1.05 }}
        >
          Balanced
        </motion.span>
      </div>
      
      {groups.map((g, i) => (
        <motion.div 
          key={g.name} 
          className="group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-300 group-hover:text-white transition-colors font-semibold">{g.name}</span>
            <span className="text-[#4ade80] font-mono font-bold">{g.value}%</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${g.value}%` }}
              transition={{ duration: 1.2, delay: 0.5 + (i * 0.1), type: 'spring' }}
              className={cn(
                "h-full rounded-full transition-all duration-300 relative",
                g.value > 80 ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] shadow-[0_0_15px_rgba(16,185,129,0.6)]" : 
                g.value > 60 ? "bg-gradient-to-r from-primary/80 to-primary/40 shadow-[0_0_10px_rgba(16,185,129,0.4)]" : 
                "bg-gradient-to-r from-zinc-600 to-zinc-700"
              )}
            >
              {/* Animated shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// --- Enhanced Recent Activity ---
const RecentActivity = () => {
  const activities = [
    { day: 'Today', workout: 'Upper Body Power', duration: '1h 15m', pr: 2 },
    { day: 'Yesterday', workout: 'Lower Body Hypertrophy', duration: '1h 30m', pr: 0 },
    { day: 'Mon, Oct 23', workout: 'Active Recovery', duration: '45m', pr: 0 },
    { day: 'Sun, Oct 22', workout: 'Full Body Strength', duration: '1h 45m', pr: 3 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">Recent Sessions</h3>
        <p className="text-xs text-zinc-500 mt-1 font-medium">Your workout history</p>
      </div>
      <div className="space-y-3">
        {activities.map((act, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/8 border border-transparent hover:border-white/20 transition-all cursor-pointer group backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 flex-1">
              <motion.div 
                className={cn(
                  "h-11 w-11 rounded-lg flex items-center justify-center font-bold",
                  act.pr > 0 ? "bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-400 border border-amber-500/30" : "bg-gradient-to-br from-zinc-700/50 to-zinc-800/30 text-zinc-400 border border-white/10"
                )}
                whileHover={{ scale: 1.1 }}
              >
                {act.pr > 0 ? <Trophy size={18} /> : <Dumbbell size={18} />}
              </motion.div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white group-hover:text-[#4ade80] transition-colors">{act.workout}</h4>
                <p className="text-xs text-zinc-500 font-medium">{act.day} • {act.duration}</p>
              </div>
            </div>
            <AnimatePresence>
              {act.pr > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(251,146,60,0.2)]"
                >
                  {act.pr} PRs
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export function StrengthAnalyticsDashboard({ userName = "Athlete", theme = "dark" }: StrengthAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePage, setActivePage] = useState('dashboard');
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Activity size={16} /> },
    { id: 'history', label: 'History', icon: <Calendar size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'ai', label: 'AI Analysis', icon: Sparkles },
  ];

  return (
    <div className={cn(
      "min-h-screen w-full text-zinc-200 font-sans selection:bg-primary/30 selection:text-primary-foreground relative overflow-hidden"
    )}>
      <StainlessSteelPattern />
      {/* Animated background */}
      <ParticleBackground />
      
      {/* Sidebar / Mobile Nav */}
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

      {/* Main Content */}
      <main className="relative z-10 pb-24 pt-8 px-4 md:pl-28 md:pr-8 md:pt-8 md:pb-8 max-w-7xl mx-auto">
        <FortisHeader />
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight">
              Good morning, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-primary animate-pulse">{userName}</span>
            </h1>
            <p className="text-zinc-400 mt-2 font-medium">Ready to crush your PRs today?</p>
          </motion.div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="hidden md:flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-white/5 to-white/3 border border-white/10 backdrop-blur-sm hover:border-primary/30 transition-all"
            >
              <Zap size={14} className="text-primary" />
              <span className="text-sm font-mono font-bold">Rest Day: <span className="text-primary">Active</span></span>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-primary-foreground px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all border border-primary/50"
            >
              <Dumbbell size={18} />
              <span>Log Workout</span>
            </motion.button>
          </div>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total Volume" 
            value="42.5k" 
            change={12.5} 
            trend="up" 
            icon={<Activity size={20} />} 
            delay={0.1}
          />
          <StatCard 
            title="Workouts" 
            value="18" 
            change={4} 
            trend="up" 
            icon={<Calendar size={20} />} 
            delay={0.15}
          />
          <StatCard 
            title="Est. 1RM Squat" 
            value="315 lbs" 
            change={5} 
            trend="up" 
            icon={<TrendingUp size={20} />} 
            delay={0.2}
          />
          <StatCard 
            title="Recovery" 
            value="85%" 
            change={2.1} 
            trend="down" 
            icon={<Timer size={20} />} 
            delay={0.25}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-8 backdrop-blur-2xl hover:border-white/20 transition-all duration-500"
          >
            <VolumeChart />
          </motion.div>

          {/* Side Panel - Muscle Heatmap */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-8 backdrop-blur-2xl hover:border-white/20 transition-all duration-500"
          >
            <MuscleGroupHeatmap />
          </motion.div>

          {/* Bottom Row - Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-8 backdrop-blur-2xl hover:border-white/20 transition-all duration-500"
          >
            <RecentActivity />
            <motion.button 
              whileHover={{ x: 4 }}
              className="w-full mt-6 py-3 text-sm font-semibold text-primary hover:text-emerald-300 hover:bg-primary/10 rounded-lg transition-all flex items-center justify-center gap-2 border border-[#4ade80]/20 hover:border-[#4ade80]/40"
            >
              View Full History <ChevronRight size={14} />
            </motion.button>
          </motion.div>

          {/* Goals Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/5 border border-[#4ade80]/20 p-8 relative overflow-hidden group hover:border-[#4ade80]/40 transition-all"
          >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
              <Trophy size={140} />
            </div>
            <h3 className="text-xl font-black text-white mb-6 relative z-10">Weekly Goal</h3>
            
            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-zinc-800/50"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <motion.path
                    className="text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]"
                    strokeDasharray="75, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 2 }}
                  />
                </svg>
                <motion.div 
                  className="absolute flex flex-col items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <span className="text-3xl font-black text-[#4ade80]">3/4</span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">Workouts</span>
                </motion.div>
              </div>
              <p className="mt-6 text-sm text-center text-zinc-400 font-medium">
                You are on track! One more session to hit your weekly target.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default StrengthAnalyticsDashboard;
