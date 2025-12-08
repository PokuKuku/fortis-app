/**
 * DarkBackgroundPreview
 * A dedicated preview component for the Fortis Dark Mode background system.
 * Includes the Stainless Steel Pattern and Particle "Shine" effects.
 */

import React from 'react';
import { motion } from 'framer-motion';

// --- 1. Stainless Steel Pattern (The Base & Texture) ---
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

// --- 2. Particle Background (The "Shine" / Floating Effect) ---
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
          className="absolute rounded-full bg-[#10b981]/10" // Using primary color (emerald) for the shine
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

export function DarkBackgroundPreview() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* 1. Base Layer */}
      <StainlessSteelPattern />
      
      {/* 2. Shine/Animation Layer */}
      <ParticleBackground />
      
      {/* Foreground Content for Contrast */}
      <div className="relative z-10 flex items-center justify-center h-full w-full p-8 pointer-events-none">
        <div className="max-w-md text-center p-6 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
          <h2 className="text-2xl font-black text-white mb-2">Dark Mode Background</h2>
          <p className="text-zinc-400">
            Combining the <span className="text-white font-mono">StainlessSteelPattern</span> with 
            the animated <span className="text-white font-mono">ParticleBackground</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
