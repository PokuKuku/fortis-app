/**
 * RestTimerControls.tsx
 * 
 * A smaller control panel for the rest timer, used when the full modal is not visible.
 * Allows play/pause, adding time, and skipping.
 */
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  ArrowPathIcon, 
  PlusIcon, 
  MinusIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

interface RestTimerControlsProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayPause: () => void;
  onSkip: () => void;
  onReset: () => void;
  onAdd15s: () => void;
  onSubtract15s: () => void;
  isRunning: boolean;
  timeRemaining: number;
  totalDuration: number;
  color: string;
}

export function RestTimerControls({
  isOpen,
  onClose,
  onPlayPause,
  onSkip,
  onReset,
  onAdd15s,
  onSubtract15s,
  isRunning,
  timeRemaining,
  color
}: RestTimerControlsProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeString = formatTime(timeRemaining);

  return (
    <>
      {/* Invisible overlay to capture outside clicks for closing */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-transparent"
          onClick={onClose}
        />
      )}
      
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[360px] bg-[#222222] rounded-3xl border border-white/10 px-5 py-3 shadow-2xl transform transition-all duration-300 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          {/* Time Display */}
          <div 
            className="font-bold font-mono tabular-nums leading-none w-[75px] flex items-center justify-center transition-colors duration-300"
            style={{ 
              color: color,
              fontSize: timeString.length > 5 ? `${Math.max(14, 28 - (timeString.length - 5) * 4)}px` : "28px"
            }}
          >
            {timeString}
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Main Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onSubtract15s}
              className="p-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white transition-colors active:scale-95 flex items-center justify-center w-8 h-8"
            >
              <MinusIcon className="size-4" />
            </button>

            <button 
              onClick={onPlayPause}
              className={`p-3 rounded-full text-white transition-all active:scale-95 shadow-lg flex items-center justify-center ${
                isRunning 
                  ? "bg-[#ff9f0a] hover:bg-[#ffb340]" 
                  : "bg-gradient-to-b from-[#4ade80] to-[#22c55e] hover:brightness-110"
              }`}
            >
              {isRunning ? (
                <PauseIcon className="size-5" />
              ) : (
                <PlayIcon className="size-5 ml-0.5" />
              )}
            </button>

            <button 
              onClick={onAdd15s}
              className="p-2 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white transition-colors active:scale-95 flex items-center justify-center w-8 h-8"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Secondary Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={onReset}
              className="p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
              title="Reset"
            >
              <ArrowPathIcon className="size-5" />
            </button>
            <button 
              onClick={onSkip}
              className="p-2 text-gray-400 hover:text-white transition-colors active:scale-95"
              title="Skip"
            >
              <ForwardIcon className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
