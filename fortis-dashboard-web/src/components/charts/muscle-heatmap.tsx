'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MuscleGroup {
  name: string;
  value: number;
}

interface MuscleHeatmapProps {
  data?: MuscleGroup[];
}

const defaultData: MuscleGroup[] = [
  { name: 'Chest', value: 85 },
  { name: 'Back', value: 70 },
  { name: 'Legs', value: 92 },
  { name: 'Shoulders', value: 60 },
  { name: 'Arms', value: 50 },
  { name: 'Core', value: 40 },
];

export function MuscleHeatmap({ data = defaultData }: MuscleHeatmapProps) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Training Split
          </h3>
          <p className="text-xs text-zinc-500 mt-1 font-medium">
            Muscle group distribution
          </p>
        </div>
        <motion.span
          className="text-xs text-[#4ade80] border border-[#4ade80]/40 px-3 py-1 rounded-full bg-[#4ade80]/10 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(74,222,128,0.2)]"
          whileHover={{ scale: 1.05 }}
        >
          Balanced
        </motion.span>
      </div>

      {data.map((g, i) => (
        <motion.div
          key={g.name}
          className="group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <div className="flex justify-between text-xs mb-2">
            <span className="text-zinc-300 group-hover:text-white transition-colors font-semibold">
              {g.name}
            </span>
            <span className="text-[#4ade80] font-mono font-bold">{g.value}%</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${g.value}%` }}
              transition={{ duration: 1.2, delay: 0.5 + i * 0.1, type: 'spring' }}
              className={cn(
                'h-full rounded-full transition-all duration-300 relative overflow-hidden',
                g.value > 80
                  ? 'bg-gradient-to-r from-[#4ade80] to-[#22c55e] shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                  : g.value > 60
                    ? 'bg-gradient-to-r from-[#4ade80]/80 to-[#4ade80]/40 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-r from-zinc-600 to-zinc-700'
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
}
