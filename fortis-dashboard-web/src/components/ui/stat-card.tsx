'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  delay = 0,
}: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-4 backdrop-blur-2xl group hover:border-[#4ade80]/60 transition-all duration-500 cursor-pointer"
    >
      {/* Animated gradient background on hover */}
      <motion.div
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-[#4ade80]/20 to-transparent blur-3xl"
        animate={
          isHovered ? { scale: 1.2, opacity: 0.8 } : { scale: 1, opacity: 0.3 }
        }
        transition={{ duration: 0.4 }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <motion.p
            className="text-xs font-semibold text-[#4ade80]/70 mb-2 uppercase tracking-widest"
            animate={
              isHovered
                ? { letterSpacing: '0.15em' }
                : { letterSpacing: '0.1em' }
            }
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
          className="rounded-lg bg-gradient-to-br from-[#4ade80]/40 to-[#4ade80]/10 p-2 text-[#4ade80] ring-1 ring-[#4ade80]/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          animate={
            isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }
          }
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
          <span
            className={cn(
              'flex items-center text-sm font-bold',
              trend === 'up'
                ? 'text-emerald-400'
                : trend === 'down'
                  ? 'text-rose-400'
                  : 'text-zinc-400'
            )}
          >
            {trend === 'up' ? (
              <ArrowUpRight className="mr-1 h-4 w-4" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="mr-1 h-4 w-4" />
            ) : null}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-zinc-500">vs last month</span>
        </motion.div>
      )}
    </motion.div>
  );
}
