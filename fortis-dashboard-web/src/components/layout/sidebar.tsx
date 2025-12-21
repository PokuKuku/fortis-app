'use client';

import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  UserIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { id: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon },
  { id: 'ai', label: 'AI Analysis', icon: SparklesIcon },
];

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 z-40 w-full border-t border-white/5 bg-gradient-to-t from-zinc-950/95 via-zinc-950/90 to-transparent backdrop-blur-xl md:fixed md:left-0 md:top-0 md:bottom-0 md:w-20 md:border-r md:border-t-0 md:border-l-0 md:from-zinc-950 md:to-zinc-950/80 md:flex md:flex-col md:items-center md:py-8"
    >
      {/* Logo - Desktop only */}
      <motion.div
        className="hidden md:flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#4ade80] to-[#22c55e] text-black font-bold text-2xl mb-8 shadow-[0_0_30px_rgba(74,222,128,0.4)] border border-[#4ade80]/50"
        whileHover={{ scale: 1.1 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <FireIcon className="w-7 h-7" />
      </motion.div>

      {/* Navigation */}
      <nav className="flex h-16 w-full justify-around items-center md:h-auto md:w-auto md:flex-col md:gap-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative p-3 rounded-xl transition-all duration-300 group',
                activePage === item.id
                  ? 'text-[#4ade80] bg-gradient-to-br from-[#4ade80]/20 to-[#22c55e]/5 border border-[#4ade80]/30 shadow-[0_0_20px_rgba(74,222,128,0.2)]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
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

      {/* Footer - Desktop only */}
      <div className="hidden md:flex mt-auto flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          className="p-3 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
        >
          <UserIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
