'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface WeeklyGoalProps {
  current?: number;
  target?: number;
}

export function WeeklyGoal({ current = 3, target = 4 }: WeeklyGoalProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#4ade80]/10 to-[#22c55e]/5 border border-[#4ade80]/20 p-8 relative overflow-hidden group hover:border-[#4ade80]/40 transition-all">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
        <Trophy size={140} />
      </div>
      <h3 className="text-xl font-black text-white mb-6 relative z-10">
        Weekly Goal
      </h3>

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
              strokeDasharray={`${percentage}, 100`}
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
            <span className="text-3xl font-black text-[#4ade80]">
              {current}/{target}
            </span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1">
              Workouts
            </span>
          </motion.div>
        </div>
        <p className="mt-6 text-sm text-center text-zinc-400 font-medium">
          {current < target
            ? `You are on track! ${target - current === 1 ? 'One more session' : `${target - current} more sessions`} to hit your weekly target.`
            : 'Weekly goal achieved!'}
        </p>
      </div>
    </div>
  );
}
