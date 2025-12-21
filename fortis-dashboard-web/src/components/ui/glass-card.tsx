'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn(
        'rounded-2xl bg-gradient-to-br from-white/8 to-white/3 border border-white/10 p-8 backdrop-blur-2xl transition-all duration-500',
        hoverEffect && 'hover:border-white/20',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
