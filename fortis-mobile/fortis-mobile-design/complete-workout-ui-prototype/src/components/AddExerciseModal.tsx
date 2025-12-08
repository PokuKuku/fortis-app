/**
 * AddExerciseModal.tsx
 * 
 * Allows users to search for and select exercises to add to their workout.
 * Features search functionality and a list of available exercises.
 */
import { useState, useEffect } from "react";
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface Exercise {
  name: string;
  category: string;
}

interface AddExerciseModalProps {
  exercises: Exercise[];
  onSelect: (name: string) => void;
  onClose: () => void;
  existingExercises?: string[];
}

export function AddExerciseModal({
  exercises,
  onSelect,
  onClose,
  existingExercises = [],
}: AddExerciseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<
    string[]
  >([]);

  useEffect(() => {
    // Trigger animation on mount
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const toggleExercise = (exerciseName: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseName)
        ? prev.filter((name) => name !== exerciseName)
        : [...prev, exerciseName],
    );
  };

  const removeExercise = (exerciseName: string) => {
    setSelectedExercises((prev) =>
      prev.filter((name) => name !== exerciseName),
    );
  };

  const handleAddExercises = () => {
    selectedExercises.forEach((exerciseName) => {
      onSelect(exerciseName);
    });
    handleClose();
  };

  const filteredExercises = exercises
    .filter((ex) =>
      !existingExercises.includes(ex.name) &&
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#222222] w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-[#818692] rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-[#2a2a2a]">
          <p className="text-[#DFE2E6] text-[20px]">
            Add Exercise
          </p>
          <button
            onClick={handleClose}
            className="bg-[#2a2a2a] rounded-lg p-1 hover:bg-[#333333] transition-colors"
          >
            <XMarkIcon
              className="size-5 text-[#ef4444]"
              strokeWidth={2.5}
            />
          </button>
        </div>

        {/* Selected Exercises Section */}
        {selectedExercises.length > 0 && (
          <div className="px-6 pt-6 pb-3">
            <h3
              className="text-[#22c55e] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590] mb-3"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Selected Exercises ({selectedExercises.length})
            </h3>
            <div className="space-y-2 mb-4">
              {selectedExercises.map((exerciseName) => (
                <div
                  key={exerciseName}
                  className="relative rounded-2xl p-4 bg-[#252525] border border-white/5 flex items-center justify-between"
                >
                  <h4
                    className="text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6] pr-10"
                    style={{
                      fontVariationSettings: "'wdth' 100",
                    }}
                  >
                    {exerciseName}
                  </h4>
                  <button
                    onClick={() => removeExercise(exerciseName)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-[#ef4444]/20 hover:bg-[#ef4444]/30 transition-colors"
                  >
                    <XMarkIcon
                      className="w-3.5 h-3.5 text-[#ef4444]"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAddExercises}
              className="w-full h-[48px] bg-gradient-to-b from-[#4ade80] to-[#22c55e] text-white rounded-2xl font-bold transition-all hover:brightness-110"
              style={{ fontVariationSettings: "'wdth' 100" }}
            >
              Add {selectedExercises.length}{" "}
              {selectedExercises.length === 1
                ? "Exercise"
                : "Exercises"}
            </button>
          </div>
        )}

        {/* Search Input */}
        <div className="px-6 pt-6 pb-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises"
              className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
              autoFocus
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <h3
            className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590] mb-3"
            style={{ fontVariationSettings: "'wdth' 100" }}
          >
            Available Exercises
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedExercises.includes(
                exercise.name,
              );
              return (
                <button
                  key={exercise.name}
                  onClick={() => toggleExercise(exercise.name)}
                  className={`relative rounded-2xl p-4 transition-all duration-200 group text-left border ${
                    isSelected
                      ? "bg-[#22c55e]/10 border-[#22c55e]/30"
                      : "bg-[#373737]/40 hover:bg-[#424242]/60 border-white/5 hover:border-[#22c55e]/20"
                  }`}
                >
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#22c55e]"
                        : "bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20"
                    }`}
                  >
                    {isSelected ? (
                      <CheckIcon
                        className="w-3.5 h-3.5 text-white"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <PlusIcon
                        className="w-3.5 h-3.5 text-[#22c55e] transition-transform duration-200"
                        strokeWidth={2.5}
                      />
                    )}
                  </div>
                  <div className="pr-10">
                    <h4
                      className="text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]"
                      style={{
                        fontVariationSettings: "'wdth' 100",
                      }}
                    >
                      {exercise.name}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}