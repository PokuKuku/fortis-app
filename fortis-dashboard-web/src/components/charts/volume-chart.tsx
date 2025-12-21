'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChartBarProps {
  height: number;
  delay: number;
  active?: boolean;
}

function ChartBar({ height, delay, active }: ChartBarProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: `${height}%`, opacity: 1 }}
      transition={{ duration: 1.2, delay, type: 'spring', stiffness: 100 }}
      className={cn(
        'w-full rounded-t-lg transition-all duration-300 hover:opacity-100 cursor-crosshair group relative',
        active
          ? 'bg-gradient-to-t from-[#4ade80] via-[#4ade80]/80 to-[#4ade80]/40 shadow-[0_0_20px_rgba(74,222,128,0.5)]'
          : 'bg-gradient-to-t from-zinc-700/70 to-zinc-700/30 hover:from-zinc-600 hover:to-zinc-600/40'
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
}

interface VolumeChartProps {
  data?: number[];
}

export function VolumeChart({ data = [45, 60, 75, 60, 85, 95, 70, 65, 80, 90, 100, 85] }: VolumeChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('3M');

  const periods = ['1M', '3M', '6M', '1Y'];

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Volume Load
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Total tonnage per week (lbs)
          </p>
        </div>
        <div className="flex gap-2">
          {periods.map((period) => (
            <motion.button
              key={period}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 uppercase tracking-widest',
                selectedPeriod === period
                  ? 'bg-[#4ade80]/30 text-[#4ade80] border border-[#4ade80]/50 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 border border-transparent hover:border-white/10'
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
                  className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-[#4ade80]/40 px-3 py-2 rounded-lg text-xs text-white opacity-100 pointer-events-none whitespace-nowrap z-20 font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  {h * 1000} lbs
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-zinc-800" />
                </motion.div>
              )}
            </AnimatePresence>

            <ChartBar height={h} delay={i * 0.06} active={i === data.length - 2} />
            <span className="text-[10px] text-zinc-600 text-center mt-2 font-mono font-semibold hidden sm:block group-hover:text-[#4ade80] transition-colors">
              W{i + 1}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
