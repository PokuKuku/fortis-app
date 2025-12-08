/**
 * SetTypeModal.tsx
 * 
 * A modal that allows the user to change the type of a set (Normal, Warmup, Failure, Drop).
 * Shows descriptions for each type to guide the user.
 */
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export type SetType = "normal" | "warmup" | "failure" | "drop";

interface SetTypeModalProps {
  currentType: SetType;
  setNumber: number;
  onSelect: (type: SetType) => void;
  onRemove: () => void;
  onClose: () => void;
}

export function SetTypeModal({ currentType, setNumber, onSelect, onRemove, onClose }: SetTypeModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 200); // Wait for animation to complete
  };

  const setTypes = [
    { type: "warmup" as SetType, label: "Warm Up Set", color: "text-yellow-500", icon: "W" },
    { type: "normal" as SetType, label: "Normal Set", color: "text-white", icon: setNumber.toString() },
    { type: "failure" as SetType, label: "Failure Set", color: "text-red-500", icon: "F" },
    { type: "drop" as SetType, label: "Drop Set", color: "text-blue-400", icon: "D" },
  ];

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-[#222222] w-full max-w-sm rounded-2xl overflow-hidden transition-all duration-200 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#2a2a2a]">
          <h3 className="text-[#DFE2E6] text-[20px]">Select Set Type</h3>
          <button
            onClick={handleClose}
            className="bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors"
          >
            <XMarkIcon className="size-5 text-[#ef4444]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Set Type Options */}
        <div className="py-2">
          {setTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                onSelect(item.type);
                handleClose();
              }}
              className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[#232323] transition-colors border-b border-[#2a2a2a]"
            >
              <span className={`${item.color} text-[20px] w-8 text-center`}>
                {item.icon}
              </span>
              <span className="text-[#DFE2E6] text-[16px]">{item.label}</span>
            </button>
          ))}

          {/* Remove Set Option */}
          <button
            onClick={() => {
              onRemove();
              handleClose();
            }}
            className="w-full px-6 py-4 flex items-center gap-4 hover:bg-[#232323] transition-colors"
          >
            <XMarkIcon className="size-6 text-red-500" />
            <span className="text-[#DFE2E6] text-[16px]">Remove Set</span>
          </button>
        </div>
      </div>
    </div>
  );
}