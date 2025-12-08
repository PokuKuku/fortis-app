/**
 * components/StainlessSteelPattern.tsx
 * 
 * A visual component that creates a consistent background style across the app.
 * It combines gradients, SVG patterns, and animated particles to create a 
 * "dark stainless steel" aesthetic.
 */
import { motion } from "motion/react";

const ParticleBackground = () => {
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

export const StainlessSteelPattern = ({ className, style, opacity, showParticles = true, ...props }: React.HTMLAttributes<HTMLDivElement> & { opacity?: number, showParticles?: boolean }) => {
  return (
    <div 
      className={`absolute inset-0 w-full h-full bg-gradient-to-br from-black via-zinc-900 to-black transition-colors duration-300 ${className || ''}`} 
      style={{ opacity, ...style }}
      {...props}
    >
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
      
      {showParticles && <ParticleBackground />}
    </div>
  );
};
