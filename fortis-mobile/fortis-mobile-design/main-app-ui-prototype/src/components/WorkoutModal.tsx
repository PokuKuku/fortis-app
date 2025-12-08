/**
 * components/WorkoutModal.tsx
 * 
 * Shows detailed information about a specific workout.
 * Allows users to:
 * - View exercises in the workout
 * - Add/Remove exercises
 * - Reorder exercises (drag & drop)
 * - Start the workout session
 */
import { X, Play, Search, Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DraggableExerciseItem } from "./DraggableExerciseItem";
import { useState } from "react";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { RestTimerModal } from "./RestTimerModal";
import { exerciseData } from "./data/exerciseData";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface WorkoutModalProps {
  workout: {
    id: number;
    name: string;
    duration: string;
  };
  exercises: string[];
  exerciseLibrary: string[];
  onClose: () => void;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  removeExercise: (index: number) => void;
  addExercise: (exercise: string) => void;
  isBottomSheet?: boolean;
  readOnly?: boolean;
}

export function WorkoutModal({ workout, exercises, exerciseLibrary, onClose, moveExercise, removeExercise, addExercise, isBottomSheet = true, readOnly = false }: WorkoutModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [selectedExerciseDetail, setSelectedExerciseDetail] = useState<string | null>(null);
  const [exerciseForRestTimer, setExerciseForRestTimer] = useState<string | null>(null);
  const [restTimers, setRestTimers] = useState<Record<string, { normal: number, warmup: number, drop: number }>>({});

  // Create a set of lowercase exercise names for case-insensitive comparison
  const exerciseSet = new Set(exercises.map(e => e.toLowerCase()));

  const filteredCurrentExercises = searchQuery
    ? exercises.filter(exercise => 
        exercise.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : exercises;

  // Filter out exercises that are already in the workout (case-insensitive)
  const filteredLibraryExercises = (searchQuery
    ? exerciseLibrary.filter(exercise => 
        !exerciseSet.has(exercise.toLowerCase()) && 
        exercise.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []).sort((a, b) => a.localeCompare(b));

  const handleToggleExercise = (exercise: string) => {
    setSelectedToAdd(prev => 
      prev.includes(exercise) 
        ? prev.filter(e => e !== exercise)
        : [...prev, exercise]
    );
  };

  const handleConfirmAdditions = () => {
    // Check if any selected exercises are already in the workout
    const duplicates = selectedToAdd.filter(exercise => exerciseSet.has(exercise.toLowerCase()));
    
    if (duplicates.length > 0) {
      // Trigger shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // Trigger haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      
      return; // Don't proceed with addition
    }
    
    // Only add exercises that aren't already in the list
    selectedToAdd.forEach(exercise => {
      if (!exerciseSet.has(exercise.toLowerCase())) {
        addExercise(exercise);
      }
    });
    setSelectedToAdd([]);
    setSearchQuery(""); // Clear search to show all current exercises
  };

  const handleSaveRestTimer = (normal: number, warmup: number, drop: number) => {
    if (exerciseForRestTimer) {
      setRestTimers(prev => ({
        ...prev,
        [exerciseForRestTimer]: { normal, warmup, drop }
      }));
    }
  };

  const hasResults = filteredCurrentExercises.length > 0 || filteredLibraryExercises.length > 0;

  if (isBottomSheet) {
    return (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 z-[70]" 
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#222222] rounded-t-[32px] shadow-[0_-8px_32px_rgba(0,0,0,0.4)] h-[75vh] overflow-hidden border-t border-white/8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stainless Steel Pattern Background */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
              <StainlessSteelPattern />
            </div>
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="bg-transparent border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex flex-col gap-1">
                <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                  {workout.name}
                </h2>
                <p className="text-[#9CA3AF] text-[14px]">
                  {exercises.length} exercises
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5"
              >
                <X className="w-5 h-5 text-[#EF4444]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 relative z-10">
              {/* Start Workout Button */}
              {!readOnly && (
                <button className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)] mb-4" style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}>
                  <span className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Start Workout
                  </span>
                </button>
              )}

              {/* Selected Exercises to Add */}
              <AnimatePresence mode="wait">
                {!readOnly && selectedToAdd.length > 0 && (
                  <motion.div 
                    key="selected-to-add-container"
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3 ml-1">
                      <h3 className="text-[#22c55e] text-[17px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Selected to Add ({selectedToAdd.length})
                      </h3>
                    </div>
                    <motion.div layout className="space-y-2">
                      {selectedToAdd.map((exercise) => (
                        <motion.div
                          key={`selected-${exercise}`}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-between bg-[#252525] rounded-2xl p-4 border border-white/5"
                        >
                          <span className="text-[16px] text-white font-['SF_Pro:Medium',sans-serif]">
                            {exercise}
                          </span>
                          <button
                            onClick={() => handleToggleExercise(exercise)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3A2525] hover:bg-[#452b2b] transition-all duration-200"
                          >
                            <X className="w-4 h-4 text-[#FF453A]" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                    <button
                      onClick={handleConfirmAdditions}
                      className="mt-4 w-full bg-[#22c55e] hover:bg-[#1db051] h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[17px] text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#22c55e]/20"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      Add {selectedToAdd.length} Exercise{selectedToAdd.length > 1 ? 's' : ''}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Bar */}
              {!readOnly && (
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder={readOnly ? "Search exercises" : "Add exercises"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                  />
                </div>
              )}

              {!hasResults && searchQuery ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-12 text-[#9CA3AF]"
                >
                  <p>No exercises found matching "{searchQuery}"</p>
                </motion.div>
              ) : (
                <>
                  {filteredCurrentExercises.length === 0 && !searchQuery ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12 text-[#9CA3AF]"
                    >
                      <p>No exercises in this workout yet</p>
                    </motion.div>
                  ) : (
                    filteredCurrentExercises.length > 0 && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        <motion.div 
                          className="grid grid-cols-2 gap-3"
                          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          {filteredCurrentExercises.map((exercise, index) => {
                            // Find the original index for proper removal
                            const originalIndex = exercises.indexOf(exercise);
                            return (
                              <DraggableExerciseItem
                                key={exercise}
                                exercise={exercise}
                                index={index}
                                onRemove={() => removeExercise(originalIndex)}
                                moveExercise={moveExercise}
                                readOnly={readOnly}
                                onInfoClick={() => setSelectedExerciseDetail(exercise)}
                                onSetRestTimer={() => setExerciseForRestTimer(exercise)}
                              />
                            );
                          })}
                        </motion.div>
                      </motion.div>
                    )
                  )}

                  {/* Add Exercises from Library */}
                  <AnimatePresence mode="wait">
                    {!readOnly && filteredLibraryExercises.length > 0 && (
                      <motion.div 
                        key="library-exercises-container"
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="mt-6 overflow-hidden"
                      >
                        <h3 className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590] mb-3" style={{ fontVariationSettings: "'wdth' 100" }}>
                          Add from Library
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {filteredLibraryExercises.map((exercise, index) => {
                            const isSelected = selectedToAdd.includes(exercise);
                            return (
                              <button
                                key={`lib-${exercise}`}
                                onClick={() => handleToggleExercise(exercise)}
                                className={`relative rounded-2xl p-2 transition-all duration-200 group text-left ${
                                  isSelected
                                    ? 'bg-[#22c55e]/15 border border-[#22c55e]/30'
                                    : 'bg-[#565656]/40 hover:bg-[#666666]/60 border border-white/5 hover:border-[#22c55e]/20'
                                }`}
                              >
                                <div className={`absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-[#22c55e] text-white'
                                    : 'bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20'
                                }`}>
                                  <Plus className={`w-3.5 h-3.5 ${isSelected ? 'rotate-45' : ''} transition-transform duration-200 ${isSelected ? 'text-white' : 'text-[#22c55e]'}`} />
                                </div>
                                <div className="pr-10">
                                  <h4 className="text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    {exercise}
                                  </h4>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
        <AnimatePresence>
          {selectedExerciseDetail && (
            <ExerciseDetailModal
              key="exercise-detail-modal"
              exercise={exerciseData[selectedExerciseDetail] || null}
              exerciseName={selectedExerciseDetail}
              onClose={() => setSelectedExerciseDetail(null)}
            />
          )}
          {exerciseForRestTimer && (
            <RestTimerModal
              key="rest-timer-modal"
              initialNormalDuration={restTimers[exerciseForRestTimer]?.normal ?? 90}
              initialWarmupDuration={restTimers[exerciseForRestTimer]?.warmup ?? 90}
              initialDropDuration={restTimers[exerciseForRestTimer]?.drop ?? 90}
              onSave={handleSaveRestTimer}
              onClose={() => setExerciseForRestTimer(null)}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-6" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#222222] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-w-2xl w-full mx-4 overflow-hidden border border-white/8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Stainless Steel Pattern Background */}
          <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
            <StainlessSteelPattern />
          </div>
          {/* Header */}
          <div className="bg-transparent border-b border-white/5 px-6 py-5 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                {workout.name}
              </h2>
              <p className="text-[#9CA3AF] text-[14px]">
                {exercises.length} exercises
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5"
            >
              <X className="w-5 h-5 text-[#EF4444]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] relative z-10">
            {/* Start Workout Button */}
            {!readOnly && (
              <button className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)] mb-4" style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}>
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  Start Workout
                </span>
              </button>
            )}

            {/* Selected Exercises to Add */}
            <AnimatePresence mode="wait">
              {!readOnly && selectedToAdd.length > 0 && (
                <motion.div 
                  key="selected-to-add-desktop"
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="mb-4 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#22c55e] text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Selected to Add ({selectedToAdd.length})
                    </h3>
                  </div>
                  <motion.div layout className="space-y-2">
                    {selectedToAdd.map((exercise) => (
                      <motion.div
                        key={`selected-desktop-${exercise}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between bg-[#232323]/40 rounded-xl px-3 py-2.5 border border-white/5"
                      >
                        <span className="text-[14px] text-[#DFE2E6] font-['SF_Pro:Medium',sans-serif]">
                          {exercise}
                        </span>
                        <button
                          onClick={() => handleToggleExercise(exercise)}
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
                        >
                          <X className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                  <button
                    onClick={handleConfirmAdditions}
                    className="mt-3 w-full bg-[#22c55e] hover:bg-[#22c55e]/90 h-[44px] rounded-xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-white active:scale-[0.98] transition-all duration-200"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Add {selectedToAdd.length} Exercise{selectedToAdd.length > 1 ? 's' : ''}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            {!readOnly && (
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder={readOnly ? "Search exercises" : "Add exercises"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                />
              </div>
            )}

            {!hasResults && searchQuery ? (
              <div className="text-center py-12 text-[#9CA3AF]">
                <p>No exercises found matching "{searchQuery}"</p>
              </div>
            ) : (
              <>
                {filteredCurrentExercises.length === 0 && !searchQuery ? (
                  <div className="text-center py-12 text-[#9CA3AF]">
                    <p>No exercises in this workout yet</p>
                  </div>
                ) : (
                  filteredCurrentExercises.length > 0 && (
                    <motion.div 
                      className="grid grid-cols-2 gap-3"
                      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {filteredCurrentExercises.map((exercise, index) => {
                        // Find the original index for proper removal
                        const originalIndex = exercises.indexOf(exercise);
                        return (
                          <DraggableExerciseItem
                            key={exercise}
                            exercise={exercise}
                            index={index}
                            onRemove={() => removeExercise(originalIndex)}
                            moveExercise={moveExercise}
                            readOnly={readOnly}
                            onInfoClick={() => setSelectedExerciseDetail(exercise)}
                            onSetRestTimer={() => setExerciseForRestTimer(exercise)}
                          />
                        );
                      })}
                    </motion.div>
                  )
                )}

                {/* Add Exercises from Library */}
                {!readOnly && filteredLibraryExercises.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590] mb-3" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Add from Library
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {filteredLibraryExercises.map((exercise, index) => {
                        const isSelected = selectedToAdd.includes(exercise);
                        return (
                          <button
                            key={`lib-desktop-${exercise}`}
                            onClick={() => handleToggleExercise(exercise)}
                            className={`relative rounded-2xl p-2 transition-all duration-200 group text-left ${
                              isSelected
                                ? 'bg-[#22c55e]/15 border border-[#22c55e]/30'
                                : 'bg-[#565656]/40 hover:bg-[#666666]/60 border border-white/5 hover:border-[#22c55e]/20'
                            }`}
                          >
                            <div className={`absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#22c55e] text-white'
                                : 'bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20'
                            }`}>
                              <Plus className={`w-3.5 h-3.5 ${isSelected ? 'rotate-45' : ''} transition-transform duration-200 ${isSelected ? 'text-white' : 'text-[#22c55e]'}`} />
                            </div>
                            <div className="pr-10">
                              <h4 className="text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                                {exercise}
                              </h4>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {selectedExerciseDetail && (
          <ExerciseDetailModal
            key="exercise-detail-modal-desktop"
            exercise={exerciseData[selectedExerciseDetail] || null}
            exerciseName={selectedExerciseDetail}
            onClose={() => setSelectedExerciseDetail(null)}
          />
        )}
        {exerciseForRestTimer && (
          <RestTimerModal
            key="rest-timer-modal-desktop"
            initialNormalDuration={restTimers[exerciseForRestTimer]?.normal ?? 90}
            initialWarmupDuration={restTimers[exerciseForRestTimer]?.warmup ?? 90}
            initialDropDuration={restTimers[exerciseForRestTimer]?.drop ?? 90}
            onSave={handleSaveRestTimer}
            onClose={() => setExerciseForRestTimer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}