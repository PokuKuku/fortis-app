import React from 'react';
import { StainlessSteelPattern } from './StainlessSteelPattern';
import { ParticleBackground } from './ParticleBackground';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="relative min-h-screen bg-[#222222] text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <StainlessSteelPattern />
        <ParticleBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
