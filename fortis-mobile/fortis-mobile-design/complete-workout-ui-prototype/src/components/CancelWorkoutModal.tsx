/**
 * CancelWorkoutModal.tsx
 * 
 * A confirmation modal shown when the user attempts to cancel the workout.
 * Prevents accidental data loss.
 */
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CancelWorkoutModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export function CancelWorkoutModal({ onConfirm, onClose }: CancelWorkoutModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setTimeout(onConfirm, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#222222] rounded-2xl w-[90%] max-w-md mx-4 transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center p-6 pb-4 relative">
          <h2 className="text-white text-[22px]">Cancel Workout</h2>
          <button onClick={handleClose} className="absolute right-6 bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors">
            <XMarkIcon className="size-5 text-[#ef4444]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-[#b9bec7] text-[16px] text-center mb-6">
            Are you sure you want to cancel this workout? All progress will be lost.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 bg-[#333333] text-white py-1.5 rounded-xl hover:bg-[#3a3a3a] transition-colors"
            >
              Keep Workout
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-red-500/20 text-red-500 py-1.5 rounded-xl hover:bg-red-500/30 transition-colors"
            >
              Cancel Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}