/**
 * TimeUpModal.tsx
 * 
 * A notification displayed when the rest timer hits zero.
 * Can act as a prompt to start the next set.
 */
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface TimeUpModalProps {
  onClose: () => void;
}

export function TimeUpModal({ onClose }: TimeUpModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative rounded-2xl w-[90%] max-w-md mx-4 text-center transition-all duration-200 overflow-hidden bg-[#222222] ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <StainlessSteelPattern opacity={0.15} />
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-center p-6 pb-4">
          <h2 className="text-white text-[22px]">Time's up!</h2>
          <button onClick={handleClose} className="absolute right-6 bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors">
            <XMarkIcon className="size-5 text-[#ef4444]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <p className="text-[#b9bec7] text-[16px] mb-6">
            Get ready for your next set!
          </p>
          
          <button
            onClick={handleClose}
            className="w-full bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white py-2 rounded-2xl hover:brightness-110 transition-all font-semibold"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}