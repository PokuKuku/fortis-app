import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Calendar, Clock, Dumbbell, HelpCircle } from "lucide-react";
import { StainlessSteelPattern } from "./StainlessSteelPattern";

interface Set {
  id: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

interface ExerciseLog {
  id: number;
  name: string;
  sets: Set[];
}

interface WorkoutDetail {
  id: number;
  name: string;
  date: Date;
  duration: string;
  volume: number;
  exercises: ExerciseLog[];
}

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutDetail | null;
}

export function WorkoutSummaryModal({ isOpen, onClose, workout }: WorkoutSummaryModalProps) {
  if (!workout) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222222] border-[#333333] text-white w-[90%] max-w-md rounded-3xl p-0 overflow-hidden gap-0 flex flex-col max-h-[85vh] [&>button:last-child]:hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <StainlessSteelPattern />
        </div>
        
        <div className="relative z-10 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="p-6 bg-gradient-to-b from-[#2A2A2A]/90 to-[#222222]/90 border-b border-white/5 relative flex-none">
            
            <DialogTitle className="text-xl font-bold mb-1 font-['SF_Pro:Semibold',sans-serif]">{workout.name}</DialogTitle>
            <DialogDescription className="sr-only">
              Detailed summary of the workout including duration, volume, and exercises performed.
            </DialogDescription>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {workout.date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {workout.duration}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
               <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Total Volume</span>
                  <span className="text-[#22c55e] font-bold text-lg">{workout.volume.toLocaleString()} lbs</span>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Exercises</span>
                  <span className="text-white font-bold text-lg">{workout.exercises.length}</span>
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0 w-full">
            <div className="p-6 space-y-4">
              {workout.exercises.map((exercise) => (
                <div key={exercise.id} className="bg-gradient-to-b from-[#454545] to-[#303030] border border-white/5 rounded-2xl p-4 space-y-3">
                  <h3 className="font-bold text-[#22c55e] text-[17px] flex items-center gap-2">
                    {exercise.name}
                  </h3>
                  
                  <div className="grid grid-cols-5 gap-2 text-xs text-gray-500 uppercase tracking-wider font-medium px-2 mb-1">
                    <div className="text-center">Set</div>
                    <div className="text-center">lbs</div>
                    <div className="text-center">Reps</div>
                    <div className="text-center">RPE</div>
                    <div className="text-right"></div>
                  </div>
                  
                  <div className="space-y-2">
                    {exercise.sets.map((set, index) => (
                      <div 
                        key={set.id} 
                        className="grid grid-cols-5 gap-2 bg-[#1c1c1c]/50 items-center py-2 px-2 rounded-lg"
                      >
                        <div className="text-center text-gray-400 font-medium">{index + 1}</div>
                        <div className="text-center text-white font-medium">{set.weight}</div>
                        <div className="text-center text-white font-medium">{set.reps}</div>
                        <div className="text-center text-white font-medium">{set.rpe || "-"}</div>
                        <div className="text-right flex justify-end">
                           {set.completed && (
                             <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                               <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M9 1L3.5 6.5L1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                               </svg>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-[#2A2A2A]/90 flex-none mt-auto">
             <button 
               onClick={onClose}
               className="w-full py-3 rounded-xl bg-gradient-to-b from-[#454545] to-[#303030] border border-[#22c55e]/30 text-[#22c55e] font-semibold text-sm hover:brightness-110 transition-all"
             >
               Close Summary
             </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
