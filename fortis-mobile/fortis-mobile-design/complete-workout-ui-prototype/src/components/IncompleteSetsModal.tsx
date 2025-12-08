/**
 * IncompleteSetsModal.tsx
 * 
 * Warns the user if they try to finish a workout with incomplete sets.
 * Allows them to mark all as complete or finish anyway.
 */
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface IncompleteSetsModalProps {
  onCompleteRest: () => void;
  onDiscardUnfinished: () => void;
  onClose: () => void;
}

export function IncompleteSetsModal({ onCompleteRest, onDiscardUnfinished, onClose }: IncompleteSetsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200);
  };

  const handleCompleteRest = () => {
    setIsOpen(false);
    setTimeout(onCompleteRest, 200);
  };

  const handleDiscardUnfinished = () => {
    setIsOpen(false);
    setTimeout(onDiscardUnfinished, 200);
  };

  return (
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
          <h2 className="text-white text-[22px]">Unfinished Sets</h2>
          <button onClick={handleClose} className="absolute right-6 bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors">
            <XMarkIcon className="size-5 text-[#ef4444]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 pb-6">
          <p className="text-[#b9bec7] text-[16px] text-center mb-6">
            You have incomplete sets in your workout. How would you like to proceed?
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleCompleteRest}
              className="w-full bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white py-3 rounded-xl hover:brightness-110 transition-all font-semibold"
            >
              Finish Workout
            </button>
            <button
              onClick={handleDiscardUnfinished}
              className="w-full bg-[#333333] text-white py-3 rounded-xl hover:bg-[#3a3a3a] transition-colors font-medium"
            >
              Discard Workout
            </button>
            <button
              onClick={handleClose}
              className="w-full bg-transparent border border-[#333333] text-[#b9bec7] py-3 rounded-xl hover:bg-[#333333]/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
