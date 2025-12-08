import { X, Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface CreateWorkoutModalProps {
  onClose: () => void;
  onCreate: (name: string, exercises: string[]) => void;
}

const availableExercises = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Pull-up",
  "Push-up",
  "Barbell Row",
  "Overhead Press",
  "Bicep Curl",
  "Tricep Extension",
  "Lateral Raise",
  "Leg Press",
  "Romanian Deadlift",
  "Incline Dumbbell Press",
  "Cable Fly",
  "Face Pull",
  "Hammer Curl",
  "Calf Raise",
  "Plank",
  "Russian Twist",
  "Leg Curl",
  "Leg Extension",
  "Lunge",
  "Dip",
  "Chin-up"
];

export function CreateWorkoutModal({ onClose, onCreate }: CreateWorkoutModalProps) {
  const [workoutName, setWorkoutName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedExercises.includes(exercise)
  ).sort((a, b) => a.localeCompare(b));

  const addExercise = (exercise: string) => {
    setSelectedExercises([...selectedExercises, exercise]);
    setSearchQuery(""); // Clear search after adding
  };

  const removeExercise = (exercise: string) => {
    setSelectedExercises(selectedExercises.filter(e => e !== exercise));
  };

  const handleCreate = () => {
    if (workoutName && selectedExercises.length > 0) {
      onCreate(workoutName, selectedExercises);
      onClose();
    }
  };

  return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#222222] w-full max-w-md rounded-3xl max-h-[80vh] overflow-hidden border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Stainless Steel Pattern Background */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
            <StainlessSteelPattern />
          </div>
          {/* Header */}
          <div className="bg-transparent border-b border-white/5 px-6 py-5 flex items-center justify-between">
            <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
              Create Workout
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5"
            >
              <X className="w-5 h-5 text-[#EF4444]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] relative z-10">
            {/* Workout Name Input */}
            <div className="mb-6">
              <label className="text-[#C4C8CC] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] mb-2 block" style={{ fontVariationSettings: "'wdth' 100" }}>
                Workout Name
              </label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="Enter workout name..."
                className="w-full h-[48px] px-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
              />
            </div>

            {/* Selected Exercises */}
            <AnimatePresence mode="wait">
              {selectedExercises.length > 0 && (
                <motion.div
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 ml-1">
                    <h3 className="text-[#22c55e] text-[17px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Selected Exercises ({selectedExercises.length})
                    </h3>
                  </div>
                  <motion.div layout className="space-y-2">
                    {selectedExercises.map((exercise, index) => (
                      <motion.div
                        key={index}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between bg-[#252525] rounded-2xl p-4 border border-white/5"
                      >
                        <span className="text-[16px] text-white font-['SF_Pro:Medium',sans-serif]">{exercise}</span>
                        <button
                          onClick={() => removeExercise(exercise)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3A2525] hover:bg-[#452b2b] transition-all duration-200"
                        >
                          <X className="w-4 h-4 text-[#FF453A]" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                  <button
                    onClick={handleCreate}
                    disabled={!workoutName}
                    className="mt-4 w-full bg-[#22c55e] hover:bg-[#1db051] h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[17px] text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#22c55e]/20"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Create Workout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Exercises */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Add exercises"
                className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
              />
            </div>

            {/* Available Exercises */}
            {filteredExercises.length > 0 ? (
              <div>
                <h3 className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590] mb-3" style={{ fontVariationSettings: "'wdth' 100" }}>
                  Available Exercises
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {filteredExercises.map((exercise, index) => (
                    <button
                      key={index}
                      onClick={() => addExercise(exercise)}
                      className="relative rounded-2xl p-4 transition-all duration-200 group text-left bg-[#565656]/40 hover:bg-[#666666]/60 border border-white/5 hover:border-[#22c55e]/20"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20">
                        <Plus className="w-3.5 h-3.5 text-[#22c55e] transition-transform duration-200" />
                      </div>
                      <div className="pr-10">
                        <h4 className="text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                          {exercise}
                        </h4>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-[#9CA3AF]">
                <p>No exercises found matching "{searchQuery}"</p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
  );
}