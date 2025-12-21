'use client';

import { motion } from 'framer-motion';

export function FortisHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-2"
    >
      <div className="flex items-center gap-3">
        <h1
          className="text-[38px] tracking-[0.15em] text-center relative animate-shine"
          style={{
            fontFamily: 'BankGothicMediumBT, sans-serif',
            fontWeight: 500,
            background:
              'linear-gradient(110deg, #4ade80 0%, #22c55e 30%, #86efac 45%, #ffffff 50%, #86efac 55%, #22c55e 70%, #4ade80 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          FORTIS
        </h1>
      </div>
    </motion.div>
  );
}
