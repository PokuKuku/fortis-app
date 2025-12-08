/**
 * WorkoutCompleteModal.tsx
 * 
 * The celebration screen shown after finishing a workout.
 * Displays summary stats and motivational messaging.
 */
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface WorkoutCompleteModalProps {
  exerciseCount: number;
  setCount: number;
  duration: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function WorkoutCompleteModal({ 
  exerciseCount, 
  setCount, 
  duration, 
  onClose,
  onConfirm 
}: WorkoutCompleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setTimeout(onConfirm, 200);
  };

  return (
    <>
      {/* Fireworks overlay */}
      <div className="fixed inset-0 z-[60] pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, fireworkIndex) => {
          const fireworkX = 20 + Math.random() * 60;
          const fireworkY = 20 + Math.random() * 40;
          const delay = Math.random() * 1.5;
          const particleCount = 30;
          
          return (
            <div key={fireworkIndex}>
              {[...Array(particleCount)].map((_, i) => {
                const colors = [
                  '#22c55e', // Fortis green
                  '#ef4444', // Red
                  '#3b82f6', // Blue
                  '#f59e0b', // Orange
                  '#8b5cf6', // Purple
                  '#ec4899', // Pink
                  '#10b981', // Emerald
                  '#f97316', // Orange
                  '#06b6d4', // Cyan
                  '#eab308', // Yellow
                  '#fbbf24', // Amber
                  '#fb923c', // Orange-400
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const angle = (i / particleCount) * 2 * Math.PI;
                const distance = 100 + Math.random() * 150;
                const translateX = Math.cos(angle) * distance;
                const translateY = Math.sin(angle) * distance;
                const size = 4 + Math.random() * 6;
                const duration = 1.5 + Math.random() * 0.8;
                
                return (
                  <div
                    key={`${fireworkIndex}-${i}`}
                    className="absolute rounded-full"
                    style={{
                      backgroundColor: color,
                      width: `${size}px`,
                      height: `${size}px`,
                      left: `${fireworkX}%`,
                      top: `${fireworkY}%`,
                      boxShadow: `0 0 ${size * 2}px ${color}`,
                      animation: `firework-burst ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
                      '--translate-x': `${translateX}px`,
                      '--translate-y': `${translateY}px`,
                    } as React.CSSProperties}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      >
        <div 
          className={`relative rounded-2xl w-[90%] max-w-md mx-4 transition-all duration-200 overflow-hidden bg-[#222222] ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <StainlessSteelPattern opacity={0.15} />
          {/* Header */}
          <div className="relative z-10 flex items-center justify-center p-6 pb-4">
            <h2 className="text-white text-[22px]">Workout Complete!</h2>
            <button onClick={handleClose} className="absolute right-6 bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors">
              <XMarkIcon className="size-5 text-[#ef4444]" strokeWidth={2.5} />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 pb-6">
            <p className="text-[#22c55e] text-[18px] text-center mb-6">
              Great work! You crushed it! 💪
            </p>

            {/* Stats */}
            <div className="bg-[#1a1a1a] rounded-xl p-5 mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[#b9bec7] text-[16px]">Exercises</span>
                <span className="text-white text-[18px]">{exerciseCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#b9bec7] text-[16px]">Sets</span>
                <span className="text-white text-[18px]">{setCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#b9bec7] text-[16px]">Duration</span>
                <span className="text-white text-[18px]">{duration}</span>
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white py-2 rounded-2xl hover:brightness-110 transition-all font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Fireworks animation styles */}
      <style>{`
        @keyframes firework-burst {
          0% {
            transform: translate(calc(var(--translate-x) * 0.7), calc(var(--translate-y) * 0.7)) scale(0.8);
            opacity: 0.9;
          }
          60% {
            opacity: 0.5;
          }
          100% {
            transform: translate(var(--translate-x), var(--translate-y)) scale(0.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}