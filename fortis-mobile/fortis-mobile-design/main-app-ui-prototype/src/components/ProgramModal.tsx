import { X, List, Play, Search, Plus, HelpCircle, Pencil, Check } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion, AnimatePresence } from "motion/react";
import { DraggableWorkoutItem } from "./DraggableWorkoutItem";
import { useState } from "react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface ProgramModalProps {
  program: {
    id: number;
    name: string;
    workouts: number;
    weeks: number;
  };
  workouts: Array<{
    id: number;
    name: string;
    exercises: number;
    duration: string;
    date: string;
  }>;
  allWorkouts: Array<{
    id: number;
    name: string;
    exercises: number;
    duration: string;
    date: string;
  }>;
  // Removed day-related props
  onClose: () => void;
  onRemoveWorkout: (workoutId: number) => void;
  onAddWorkout: (workoutId: number) => void;
  moveWorkout: (dragIndex: number, hoverIndex: number) => void;
  onWorkoutClick?: (workoutId: number) => void;
  onReplaceWorkout?: (oldWorkoutId: number, newWorkoutId: number) => void;
  onRename?: (newName: string) => void;
  isBottomSheet?: boolean;
}

export function ProgramModal({ program, workouts, allWorkouts, onClose, onRemoveWorkout, onAddWorkout, moveWorkout, onWorkoutClick, onReplaceWorkout, onRename, isBottomSheet = true }: ProgramModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState<number[]>([]);
  const [activeWorkoutId, setActiveWorkoutId] = useState<number | null>(null);
  const [workoutToReplace, setWorkoutToReplace] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [programName, setProgramName] = useState(program.name);

  const [replaceSearchQuery, setReplaceSearchQuery] = useState("");

  const handleNameSave = () => {
    if (programName.trim() !== program.name) {
        onRename?.(programName);
    }
    setIsRenaming(false);
  };

  // Create a set of workout IDs that are already in the program
  const workoutIds = new Set(workouts.map(w => w.id));
  
  const filteredCurrentWorkouts = searchQuery
    ? workouts.filter(workout => 
        workout.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : workouts;

  // Filter out workouts that are already in the program
  const filteredLibraryWorkouts = (searchQuery
    ? allWorkouts.filter(workout => 
        !workoutIds.has(workout.id) && 
        workout.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []).sort((a, b) => a.name.localeCompare(b.name));

  const handleToggleWorkout = (workoutId: number) => {
    setSelectedToAdd(prev => {
      if (prev.includes(workoutId)) {
        return prev.filter(id => id !== workoutId);
      }
      if (workouts.length + prev.length >= 7) {
        // Trigger shake animation if trying to add beyond limit
        setShake(true);
        setTimeout(() => setShake(false), 500);
        toast.error("Maximum of 7 workouts per program", { duration: 2000 });
        return prev;
      }
      return [...prev, workoutId];
    });
  };

  const handleConfirmAdditions = () => {
    // Check if any selected workouts are already in the program
    const duplicates = selectedToAdd.filter(workoutId => workoutIds.has(workoutId));
    
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

    // Check if total workouts would exceed 7
    if (workouts.length + selectedToAdd.length > 7) {
       setShake(true);
       setTimeout(() => setShake(false), 500);
       if (navigator.vibrate) {
         navigator.vibrate([50, 30, 50]);
       }
       toast.error("Maximum of 7 workouts per program", { duration: 2000 });
       return;
    }
    
    // Only add workouts that aren't already in the program
    selectedToAdd.forEach(workoutId => {
      if (!workoutIds.has(workoutId)) {
        onAddWorkout(workoutId);
      }
    });
    setSelectedToAdd([]);
    setSearchQuery(""); // Clear search to show all current workouts
  };

  const hasResults = filteredCurrentWorkouts.length > 0 || filteredLibraryWorkouts.length > 0;

  if (isBottomSheet) {
    return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/40 z-[60]" 
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
              <div className="flex flex-col gap-1 w-full mr-4">
                {isRenaming ? (
                    <div className="flex items-center gap-2 w-full">
                         <input 
                            type="text" 
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            className="bg-[#1f1f1f] border border-[#22c55e]/50 rounded-lg px-2 py-1 text-[18px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6] focus:outline-none focus:ring-1 focus:ring-[#22c55e] w-full"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameSave();
                            }}
                         />
                         <button onClick={handleNameSave} className="p-1.5 bg-[#22c55e]/20 rounded-lg text-[#22c55e] hover:bg-[#22c55e]/30 transition-colors">
                             <Check className="w-4 h-4" />
                         </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6] truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
                        {program.name}
                        </h2>
                        <button 
                            onClick={() => setIsRenaming(true)}
                            className="text-[#9CA3AF] hover:text-white transition-colors p-1"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                <p className="text-[#9CA3AF] text-[14px]">
                  {workouts.length} workouts
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 flex-shrink-0"
              >
                <X className="w-5 h-5 text-[#EF4444]" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 relative z-10" onClick={() => {
              setActiveWorkoutId(null);
              setShowHelp(false);
            }}>
              {/* Start Program Button */}
              <button onClick={(e) => e.stopPropagation()} className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)] mb-4" style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}>
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-current" />
                  Continue with Program
                </span>
              </button>

              {/* Selected Workouts to Add */}
              <AnimatePresence mode="wait">
                {selectedToAdd.length > 0 && (
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
                        Selected to Add ({selectedToAdd.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedToAdd.map((workoutId) => {
                        const workout = allWorkouts.find(w => w.id === workoutId);
                        if (!workout) return null;
                        return (
                          <motion.div
                            key={workoutId}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between bg-[#252525] rounded-2xl p-4 border border-white/5"
                          >
                            <div>
                              <span className="text-[16px] text-white font-['SF_Pro:Medium',sans-serif] block">
                                {workout.name}
                              </span>
                              <p className="text-[13px] text-[#9CA3AF] mt-0.5">
                                {workout.exercises} exercises
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleWorkout(workoutId); }}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3A2525] hover:bg-[#452b2b] transition-all duration-200"
                            >
                              <X className="w-4 h-4 text-[#FF453A]" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleConfirmAdditions(); }}
                      className="mt-4 w-full bg-[#22c55e] hover:bg-[#1db051] h-[50px] rounded-[20px] font-['SF_Pro:Bold',sans-serif] font-[700] text-[17px] text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#22c55e]/20"
                      style={{ fontVariationSettings: "'wdth' 100" }}
                    >
                      Add {selectedToAdd.length} Workout{selectedToAdd.length > 1 ? 's' : ''}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Add workouts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                />
              </div>

              {/* NOTE: Removed Day Selection Circles as requested */}

              {!hasResults && searchQuery ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-12 text-[#9CA3AF]"
                >
                  <p>No workouts found matching "{searchQuery}"</p>
                </motion.div>
              ) : (
                <>
                  {filteredCurrentWorkouts.length === 0 && !searchQuery ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-12 text-[#9CA3AF]"
                    >
                      <p>No workouts in this program yet</p>
                      <p className="text-sm mt-2">Drag workouts here to add them</p>
                    </motion.div>
                  ) : (
                    filteredCurrentWorkouts.length > 0 && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                      >
                        {/* Changed grid-cols-2 to flex-col gap-3 for full width rows */}
                        <motion.div 
                          className="flex flex-col gap-3"
                          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.4 }}
                        >
                          {filteredCurrentWorkouts.map((workout, index) => (
                            <DraggableWorkoutItem
                              key={workout.id}
                              workout={workout}
                              index={index}
                              isSelected={activeWorkoutId === workout.id}
                              onRemove={() => onRemoveWorkout(workout.id)}
                              moveWorkout={moveWorkout}
                              onClick={() => {
                                setActiveWorkoutId(workout.id === activeWorkoutId ? null : workout.id);
                              }}
                              onInfoClick={() => onWorkoutClick?.(workout.id)}
                              onReplace={() => setWorkoutToReplace(workout.id)}
                            />
                          ))}
                        </motion.div>
                      </motion.div>
                    )
                  )}

                  {/* Add Workouts from Library */}
                  <AnimatePresence mode="wait">
                    {filteredLibraryWorkouts.length > 0 && (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                            {workoutToReplace ? "Select Replacement" : "Add from Library"}
                          </h3>
                          {workoutToReplace && (
                            <button 
                              onClick={() => setWorkoutToReplace(null)}
                              className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                              Cancel Replace
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {filteredLibraryWorkouts.map(workout => {
                            const isSelected = selectedToAdd.includes(workout.id);
                            return (
                              <button
                                key={workout.id}
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if (workoutToReplace !== null) {
                                    onReplaceWorkout?.(workoutToReplace, workout.id);
                                    setWorkoutToReplace(null);
                                    setSearchQuery("");
                                  } else {
                                    handleToggleWorkout(workout.id); 
                                  }
                                }}
                                className={`relative rounded-2xl p-4 transition-all duration-200 group text-left ${
                                  isSelected
                                    ? 'bg-[#22c55e]/15 border border-[#22c55e]/30'
                                    : workoutToReplace
                                      ? 'bg-[#232323]/40 hover:bg-[#22c55e]/10 border border-white/5 hover:border-[#22c55e]/30'
                                      : 'bg-[#565656]/40 hover:bg-[#666666]/60 border border-white/5 hover:border-[#22c55e]/20'
                                }`}
                              >
                                <div className={`absolute top-1/2 -translate-y-1/2 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? 'bg-[#22c55e] text-white'
                                    : workoutToReplace
                                      ? 'bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20'
                                      : 'bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20'
                                }`}>
                                  {workoutToReplace ? (
                                    <List className={`w-3.5 h-3.5 transition-transform duration-200 ${isSelected ? 'text-white' : 'text-[#22c55e]'}`} />
                                  ) : (
                                    <Plus className={`w-3.5 h-3.5 ${isSelected ? 'rotate-45' : ''} transition-transform duration-200 ${isSelected ? 'text-white' : 'text-[#22c55e]'}`} />
                                  )}
                                </div>
                                <div className="pr-10">
                                  <h4 className="text-[15px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6] mb-1" style={{ fontVariationSettings: "'wdth' 100" }}>
                                    {workout.name}
                                  </h4>
                                  <p className="text-[13px] text-[#9CA3AF]">
                                    {workout.exercises} exercises
                                  </p>
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

            {/* Help Button */}
            <div className="absolute bottom-6 right-6 z-50">
              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute bottom-14 right-0 w-72 bg-[#252525] border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-sm origin-bottom-right"
                  >
                    <p className="text-[13px] text-[#DFE2E6] leading-relaxed">
                      Drag and drop workouts to reorder your program.
                      <br /><br />
                      The order of workouts here defines the sequence in your program.
                      <br /><br />
                      Don't worry if you miss a session, continuing the program will simply start where you left off.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={(e) => { e.stopPropagation(); setShowHelp(!showHelp); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg backdrop-blur-md border ${showHelp ? 'bg-[#22c55e] text-black border-[#22c55e]' : 'bg-[#1c1c1e]/80 text-[#9CA3AF] hover:text-white border-white/10 hover:border-white/20'}`}
              >
                <span className="text-[18px] font-['SF_Pro:Bold',sans-serif] font-bold">?</span>
              </button>
            </div>
          </motion.div>

        {/* Replace Workout Modal */}
        <AnimatePresence>
        {workoutToReplace !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setWorkoutToReplace(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className="bg-[#222222] rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden border border-white/10 flex flex-col max-h-[70vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
               {/* Stainless Steel Pattern Background */}
               <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
                 <StainlessSteelPattern />
               </div>

               {/* Header */}
               <div className="relative z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#2A2A2A]/80 backdrop-blur-md">
                 <h3 className="text-[18px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]">Replace Workout</h3>
                 <button 
                   onClick={() => setWorkoutToReplace(null)}
                   className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 transition-colors"
                 >
                   <X className="w-4 h-4 text-[#EF4444]" />
                 </button>
               </div>

               {/* Search */}
               <div className="relative z-10 px-6 pt-4 pb-2 shrink-0">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                   <input
                     type="text"
                     placeholder="Search replacement..."
                     value={replaceSearchQuery}
                     onChange={(e) => setReplaceSearchQuery(e.target.value)}
                     autoFocus
                     className="w-full h-[40px] pl-10 pr-4 bg-[#1f1f1f]/60 border border-white/5 rounded-xl text-[#DFE2E6] placeholder-[#9CA3AF] text-[14px] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                   />
                 </div>
               </div>

               {/* List */}
               <div className="relative z-10 p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
                 <div className="grid grid-cols-1 gap-2">
                   {allWorkouts
                     .filter(w => 
                       !workoutIds.has(w.id) && 
                       w.name.toLowerCase().includes(replaceSearchQuery.toLowerCase())
                     )
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .map(workout => (
                       <button
                         key={workout.id}
                         onClick={() => {
                           onReplaceWorkout?.(workoutToReplace, workout.id);
                           setWorkoutToReplace(null);
                           setReplaceSearchQuery("");
                         }}
                         className="flex items-center justify-between bg-[#252525]/60 hover:bg-[#252525] rounded-xl p-3 border border-white/5 hover:border-[#22c55e]/30 transition-all duration-200 group text-left"
                       >
                         <div>
                           <h4 className="text-[15px] font-['SF_Pro:Medium',sans-serif] text-[#DFE2E6] mb-0.5">
                             {workout.name}
                           </h4>
                           <p className="text-[12px] text-[#9CA3AF]">
                             {workout.exercises} exercises
                           </p>
                         </div>
                         <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20 transition-colors">
                           <div className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                               <line x1="16" y1="5" x2="22" y2="5" />
                               <line x1="22" y1="5" x2="22" y2="11" />
                             </svg>
                           </div>
                         </div>
                       </button>
                     ))}
                    {allWorkouts.filter(w => !workoutIds.has(w.id) && w.name.toLowerCase().includes(replaceSearchQuery.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-[#9CA3AF] text-sm">
                        No workouts found
                      </div>
                    )}
                 </div>
               </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
        </motion.div>
    );
  }

  return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-6" 
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
            <div className="flex flex-col gap-1 w-full mr-4">
                {isRenaming ? (
                    <div className="flex items-center gap-2 w-full">
                         <input 
                            type="text" 
                            value={programName}
                            onChange={(e) => setProgramName(e.target.value)}
                            className="bg-[#1f1f1f] border border-[#22c55e]/50 rounded-lg px-2 py-1 text-[18px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6] focus:outline-none focus:ring-1 focus:ring-[#22c55e] w-full"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleNameSave();
                            }}
                         />
                         <button onClick={handleNameSave} className="p-1.5 bg-[#22c55e]/20 rounded-lg text-[#22c55e] hover:bg-[#22c55e]/30 transition-colors">
                             <Check className="w-4 h-4" />
                         </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h2 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[20px] text-[#DFE2E6] truncate" style={{ fontVariationSettings: "'wdth' 100" }}>
                        {program.name}
                        </h2>
                        <button 
                            onClick={() => setIsRenaming(true)}
                            className="text-[#9CA3AF] hover:text-white transition-colors p-1"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
              <p className="text-[#9CA3AF] text-[14px]">
                {workouts.length} workouts
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center transition-all duration-200 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 flex-shrink-0"
            >
              <X className="w-5 h-5 text-[#EF4444]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] relative z-10" onClick={() => {
            setActiveWorkoutId(null);
          }}>
            
            {/* Start Program Button */}
            <button onClick={(e) => e.stopPropagation()} className="group w-full h-[36px] rounded-2xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px] text-white border border-white/10 active:scale-[0.98] transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.1)] mb-4" style={{ fontVariationSettings: "'wdth' 100", background: 'linear-gradient(to bottom, #4ade80, #22c55e)' }}>
              <span className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                Continue with Program
              </span>
            </button>

            {/* Selected Workouts to Add */}
            <AnimatePresence mode="wait">
              {selectedToAdd.length > 0 && (
                <div className="mb-4 bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-2xl p-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[#22c55e] text-[14px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                      Selected to Add ({selectedToAdd.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {selectedToAdd.map((workoutId) => {
                      const workout = allWorkouts.find(w => w.id === workoutId);
                      if (!workout) return null;
                      return (
                        <div
                          key={workoutId}
                          className="flex items-center justify-between bg-[#232323]/40 rounded-xl px-3 py-2.5 border border-white/5"
                        >
                          <div>
                            <span className="text-[14px] text-[#DFE2E6] font-['SF_Pro:Medium',sans-serif]">
                              {workout.name}
                            </span>
                            <p className="text-[12px] text-[#9CA3AF]">
                              {workout.exercises} exercises
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleWorkout(workoutId); }}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
                          >
                            <X className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                   <button
                    onClick={(e) => { e.stopPropagation(); handleConfirmAdditions(); }}
                    className="mt-3 w-full bg-[#22c55e] hover:bg-[#22c55e]/90 h-[44px] rounded-xl font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-white active:scale-[0.98] transition-all duration-200"
                    style={{ fontVariationSettings: "'wdth' 100" }}
                  >
                    Add {selectedToAdd.length} Workout{selectedToAdd.length > 1 ? 's' : ''}
                  </button>
                </div>
              )}
            </AnimatePresence>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Add workouts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-[48px] pl-12 pr-4 bg-[#1f1f1f]/30 border border-white/5 rounded-2xl text-[#DFE2E6] placeholder-[#9CA3AF] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
              />
            </div>

            {!hasResults && searchQuery ? (
              <div className="text-center py-12 text-[#9CA3AF]">
                <p>No workouts found matching "{searchQuery}"</p>
              </div>
            ) : (
              <>
                {filteredCurrentWorkouts.length === 0 && !searchQuery ? (
                  <div className="text-center py-12 text-[#9CA3AF]">
                    <p>No workouts in this program yet</p>
                    <p className="text-sm mt-2">Drag workouts here to add them</p>
                  </div>
                ) : (
                  filteredCurrentWorkouts.length > 0 && (
                    <motion.div 
                      className="flex flex-col gap-3"
                      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {filteredCurrentWorkouts.map((workout, index) => (
                        <DraggableWorkoutItem
                          key={workout.id}
                          workout={workout}
                          index={index}
                          isSelected={activeWorkoutId === workout.id}
                          onRemove={() => onRemoveWorkout(workout.id)}
                          moveWorkout={moveWorkout}
                          onClick={() => {
                            setActiveWorkoutId(workout.id === activeWorkoutId ? null : workout.id);
                          }}
                          onInfoClick={() => onWorkoutClick?.(workout.id)}
                          onReplace={() => setWorkoutToReplace(workout.id)}
                        />
                      ))}
                    </motion.div>
                  )
                )}

                {/* Add Workouts from Library */}
                <AnimatePresence mode="wait">
                {filteredLibraryWorkouts.length > 0 && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    className="mt-6 overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[#DFE2E6] text-[16px] font-['SF_Pro:Semibold',sans-serif] font-[590]" style={{ fontVariationSettings: "'wdth' 100" }}>
                        Add from Library
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {filteredLibraryWorkouts.map(workout => {
                        const isSelected = selectedToAdd.includes(workout.id);
                        return (
                          <button
                            key={workout.id}
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleToggleWorkout(workout.id); 
                            }}
                            className={`relative rounded-2xl p-4 transition-all duration-200 group text-left ${
                              isSelected
                                ? 'bg-[#22c55e]/15 border border-[#22c55e]/30'
                                : 'bg-[#232323]/40 hover:bg-[#2a2a2a]/60 border border-white/5 hover:border-[#22c55e]/20'
                            }`}
                          >
                            <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[#22c55e] text-white'
                                : 'bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20'
                            }`}>
                              <Plus className={`w-4 h-4 ${isSelected ? 'rotate-45' : ''} transition-transform duration-200 ${isSelected ? 'text-white' : 'text-[#22c55e]'}`} />
                            </div>
                            <div className="pr-8">
                              <h4 className="text-[15px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6] mb-1" style={{ fontVariationSettings: "'wdth' 100" }}>
                                {workout.name}
                              </h4>
                              <p className="text-[13px] text-[#9CA3AF]">
                                {workout.exercises} exercises
                              </p>
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

          {/* Help Button */}
          <div className="absolute bottom-6 right-6 z-50">
             {/* Help content same as above */}
          </div>
        </motion.div>

        {/* Replace Workout Modal */}
        <AnimatePresence>
        {workoutToReplace !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setWorkoutToReplace(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
              className="bg-[#222222] rounded-[24px] shadow-[0_24px_48px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden border border-white/10 flex flex-col max-h-[70vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
               {/* Stainless Steel Pattern Background */}
               <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
                 <StainlessSteelPattern />
               </div>

               {/* Header */}
               <div className="relative z-10 px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#2A2A2A]/80 backdrop-blur-md">
                 <h3 className="text-[18px] font-['SF_Pro:Semibold',sans-serif] font-[590] text-[#DFE2E6]">Replace Workout</h3>
                 <button 
                   onClick={() => setWorkoutToReplace(null)}
                   className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1C1C1C] hover:bg-[#252525] border border-white/5 transition-colors"
                 >
                   <X className="w-4 h-4 text-[#EF4444]" />
                 </button>
               </div>

               {/* Search */}
               <div className="relative z-10 px-6 pt-4 pb-2 shrink-0">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                   <input
                     type="text"
                     placeholder="Search replacement..."
                     value={replaceSearchQuery}
                     onChange={(e) => setReplaceSearchQuery(e.target.value)}
                     autoFocus
                     className="w-full h-[40px] pl-10 pr-4 bg-[#1f1f1f]/60 border border-white/5 rounded-xl text-[#DFE2E6] placeholder-[#9CA3AF] text-[14px] focus:outline-none focus:border-[#22c55e]/30 focus:bg-[#22c55e]/5 transition-all duration-200"
                   />
                 </div>
               </div>

               {/* List */}
               <div className="relative z-10 p-6 pt-2 overflow-y-auto custom-scrollbar flex-1">
                 <div className="grid grid-cols-1 gap-2">
                   {allWorkouts
                     .filter(w => 
                       !workoutIds.has(w.id) && 
                       w.name.toLowerCase().includes(replaceSearchQuery.toLowerCase())
                     )
                     .sort((a, b) => a.name.localeCompare(b.name))
                     .map(workout => (
                       <button
                         key={workout.id}
                         onClick={() => {
                           onReplaceWorkout?.(workoutToReplace, workout.id);
                           setWorkoutToReplace(null);
                           setReplaceSearchQuery("");
                         }}
                         className="flex items-center justify-between bg-[#252525]/60 hover:bg-[#252525] rounded-xl p-3 border border-white/5 hover:border-[#22c55e]/30 transition-all duration-200 group text-left"
                       >
                         <div>
                           <h4 className="text-[15px] font-['SF_Pro:Medium',sans-serif] text-[#DFE2E6] mb-0.5">
                             {workout.name}
                           </h4>
                           <p className="text-[12px] text-[#9CA3AF]">
                             {workout.exercises} exercises
                           </p>
                         </div>
                         <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#22c55e]/10 group-hover:bg-[#22c55e]/20 transition-colors">
                           <div className="w-4 h-4 text-[#22c55e] group-hover:scale-110 transition-transform">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                               <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                               <line x1="16" y1="5" x2="22" y2="5" />
                               <line x1="22" y1="5" x2="22" y2="11" />
                             </svg>
                           </div>
                         </div>
                       </button>
                     ))}
                    {allWorkouts.filter(w => !workoutIds.has(w.id) && w.name.toLowerCase().includes(replaceSearchQuery.toLowerCase())).length === 0 && (
                      <div className="text-center py-8 text-[#9CA3AF] text-sm">
                        No workouts found
                      </div>
                    )}
                 </div>
               </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
  );
}
