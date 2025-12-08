import { useState, useEffect } from "react";
import { X, Search, Plus, ArrowRightLeft } from "lucide-react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";
import { exerciseList } from "./data/exerciseList";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "./ui/drawer";

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercises: (exerciseNames: string[]) => void;
  workoutName?: string;
  currentExerciseCount?: number;
  existingExercises?: string[];
  mode?: 'add' | 'replace';
}

export function AddExerciseModal({ isOpen, onClose, onAddExercises, workoutName = "Workout", currentExerciseCount = 0, existingExercises = [], mode = 'add' }: AddExerciseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedExercises([]);
    }
  }, [isOpen]);

  const toggleSelection = (exercise: string) => {
    if (mode === 'replace') {
      onAddExercises([exercise]);
      onClose();
      return;
    }
    
    if (selectedExercises.includes(exercise)) {
      setSelectedExercises(prev => prev.filter(e => e !== exercise));
    } else {
      setSelectedExercises(prev => [...prev, exercise]);
    }
  };

  const handleAdd = () => {
    if (selectedExercises.length > 0) {
      onAddExercises(selectedExercises);
    }
  };

  const filteredExercises = exerciseList.filter(ex => 
    ex.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !existingExercises.some(existing => existing.toLowerCase() === ex.toLowerCase()) &&
    !selectedExercises.includes(ex)
  );

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#222222] border-t border-white/10 h-[90vh] outline-none rounded-t-[32px] [&>div.bg-muted]:bg-white/20">
        <DrawerTitle className="sr-only">{mode === 'replace' ? 'Replace Exercise' : 'Add Exercises'}</DrawerTitle>
        <DrawerDescription className="sr-only">Select exercises to {mode === 'replace' ? 'replace current exercise' : 'add to your workout'}</DrawerDescription>
        
        <div className="flex flex-col h-full overflow-hidden relative pt-4">
           <StainlessSteelPattern opacity={0.05} />
           
           {/* Scrollable Content */}
           <div className="flex-1 overflow-y-auto px-6 pb-8 pt-2 z-10">
             
             {/* Selected Exercises Section - Only show in add mode */}
             {mode === 'add' && selectedExercises.length > 0 && (
               <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
                 <h3 className="text-[#22c55e] font-['SF_Pro:Semibold',sans-serif] font-[590] text-sm mb-3" style={{ fontVariationSettings: "'wdth' 100" }}>
                   Selected to Add ({selectedExercises.length})
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {selectedExercises.map(exercise => (
                     <div key={`selected-${exercise}`} className="flex items-center gap-3 bg-transparent rounded-2xl pl-4 pr-2 py-2 border border-[#22c55e]">
                       <span className="text-white font-['SF_Pro:Semibold',sans-serif] font-[590] text-[15px]" style={{ fontVariationSettings: "'wdth' 100" }}>
                         {exercise}
                       </span>
                       <button 
                         onClick={() => toggleSelection(exercise)}
                         className="w-6 h-6 rounded-full bg-[#22c55e] flex items-center justify-center hover:bg-[#16a34a] transition-colors"
                       >
                         <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                       </button>
                     </div>
                   ))}
                 </div>

                 {/* Add Button */}
                 <button
                   onClick={handleAdd}
                   className="w-full mt-4 bg-[rgba(34,197,94,0.2)] hover:bg-[rgba(34,197,94,0.3)] text-green-500 font-['Inter:Semi_Bold',sans-serif] font-semibold text-[16px] h-12 rounded-[14px] transition-colors flex items-center justify-center"
                 >
                   + Add {selectedExercises.length} Exercises
                 </button>
               </div>
             )}

             {/* Search */}
             <div className="relative mb-6">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
               <input 
                 type="text"
                 placeholder="Search exercises"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-[#2c2c2e] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#22c55e]/50 transition-all text-[15px] border border-white/5"
               />
             </div>

             {/* Library Grid */}
             <div>
               <h3 className="text-white font-['SF_Pro:Semibold',sans-serif] font-[590] text-[17px] mb-4" style={{ fontVariationSettings: "'wdth' 100" }}>
                 {mode === 'replace' ? 'Select Replacement' : 'Add from Library'}
               </h3>
               
               <div className="grid grid-cols-2 gap-3">
                 {filteredExercises.map((exercise) => {
                   return (
                     <button
                       key={exercise}
                       onClick={() => toggleSelection(exercise)}
                       className="flex items-center justify-between p-3 rounded-2xl border text-left h-16 active:scale-95 duration-200 relative overflow-hidden bg-gradient-to-b from-[#5A5A5A] to-[#404040] border-white/10 hover:border-white/20"
                     >
                       <span className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[13px] line-clamp-2 pr-2 leading-tight text-[#DFE2E6]" style={{ fontVariationSettings: "'wdth' 100" }}>
                         {exercise}
                       </span>
                       
                       <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors border bg-[#22c55e]/10 border-[#22c55e]/20">
                          {mode === 'replace' ? (
                             <ArrowRightLeft className="w-3.5 h-3.5 text-[#22c55e]" strokeWidth={3} />
                          ) : (
                             <Plus className="w-3.5 h-3.5 text-[#22c55e]" strokeWidth={3} />
                          )}
                       </div>
                     </button>
                   );
                 })}
               </div>
               
               {filteredExercises.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                      No exercises found
                  </div>
               )}
             </div>
           </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
