'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Dumbbell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  day: string;
  workout: string;
  duration: string;
  pr: number;
}

interface RecentSessionsProps {
  sessions?: Session[];
}

const defaultSessions: Session[] = [
  { day: 'Today', workout: 'Upper Body Power', duration: '1h 15m', pr: 2 },
  { day: 'Yesterday', workout: 'Lower Body Hypertrophy', duration: '1h 30m', pr: 0 },
  { day: 'Mon, Oct 23', workout: 'Active Recovery', duration: '45m', pr: 0 },
  { day: 'Sun, Oct 22', workout: 'Full Body Strength', duration: '1h 45m', pr: 3 },
];

export function RecentSessions({ sessions = defaultSessions }: RecentSessionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Recent Sessions
        </h3>
        <p className="text-xs text-zinc-500 mt-1 font-medium">
          Your workout history
        </p>
      </div>
      <div className="space-y-3">
        {sessions.map((session, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/3 hover:from-white/10 hover:to-white/8 border border-transparent hover:border-white/20 transition-all cursor-pointer group backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                className={cn(
                  'h-11 w-11 rounded-lg flex items-center justify-center font-bold',
                  session.pr > 0
                    ? 'bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gradient-to-br from-zinc-700/50 to-zinc-800/30 text-zinc-400 border border-white/10'
                )}
                whileHover={{ scale: 1.1 }}
              >
                {session.pr > 0 ? <Trophy size={18} /> : <Dumbbell size={18} />}
              </motion.div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white group-hover:text-[#4ade80] transition-colors">
                  {session.workout}
                </h4>
                <p className="text-xs text-zinc-500 font-medium">
                  {session.day} • {session.duration}
                </p>
              </div>
            </div>
            <AnimatePresence>
              {session.pr > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1 rounded-lg text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(251,146,60,0.2)]"
                >
                  {session.pr} PRs
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      <motion.button
        whileHover={{ x: 4 }}
        className="w-full mt-6 py-3 text-sm font-semibold text-[#4ade80] hover:text-emerald-300 hover:bg-[#4ade80]/10 rounded-lg transition-all flex items-center justify-center gap-2 border border-[#4ade80]/20 hover:border-[#4ade80]/40"
      >
        View Full History <ChevronRight size={14} />
      </motion.button>
    </div>
  );
}
