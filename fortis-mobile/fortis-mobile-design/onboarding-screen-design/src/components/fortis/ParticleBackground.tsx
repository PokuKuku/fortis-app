import React from 'react';
import { motion } from 'motion/react';

export const ParticleBackground = () => {
  // Create 15 random particles
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
          // Change bg-primary/10 to your desired color (e.g. bg-emerald-500/10)
          className="absolute rounded-full bg-[#10b981]/10" 
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -100], // Move upwards
            opacity: [0, 0.8, 0], // Fade in and out
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
