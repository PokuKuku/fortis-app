import { MoreVertical, Eye, Trash, Timer } from "lucide-react";
import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { exerciseData } from "./data/exerciseData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface DraggableExerciseItemProps {
  exercise: string;
  index: number;
  onRemove: () => void;
  moveExercise: (dragIndex: number, hoverIndex: number) => void;
  readOnly?: boolean;
  onInfoClick?: () => void;
  onSetRestTimer?: () => void;
}

export function DraggableExerciseItem({ exercise, index, onRemove, moveExercise, readOnly = false, onInfoClick, onSetRestTimer }: DraggableExerciseItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'exercise',
    item: { exercise, index },
    canDrag: !readOnly,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [exercise, index, readOnly]);

  const [{ isOver }, drop] = useDrop({
    accept: 'exercise',
    canDrop: () => !readOnly,
    hover: (item: { exercise: string; index: number }, monitor) => {
      if (!ref.current || readOnly) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveExercise(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  drag(drop(ref));

  const data = exerciseData[exercise];
  const primaryMuscle = data?.primaryMuscles;
  const equipment = data?.equipment;

  const muscleText = Array.isArray(primaryMuscle) 
    ? primaryMuscle.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ") 
    : primaryMuscle 
      ? primaryMuscle.charAt(0).toUpperCase() + primaryMuscle.slice(1) 
      : "General";

  return (
    <motion.div
      ref={ref}
      layout
      layoutId={`exercise-${exercise}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0 : 1,
        scale: isDragging ? 0.8 : 1,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
      }}
      className={`group relative rounded-2xl p-3 transition-all duration-200 border ${
        isOver
          ? 'border-[#22c55e]/50 bg-[#22c55e]/12 scale-[1.02] cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.30)]'
          : isDragging
          ? 'border-[#22c55e]/40 bg-[#22c55e]/8 shadow-[0_12px_32px_rgba(0,0,0,0.48),0_0_0_1px_rgba(34,197,94,0.36)] cursor-grabbing'
          : readOnly
          ? 'border-white/10 cursor-default bg-[#3E3E3E]/60'
          : 'border-white/10 hover:border-white/20 cursor-grab shadow-[0_2px_8px_rgba(0,0,0,0.30)] bg-gradient-to-b from-[#5A5A5A] to-[#404040] hover:from-[#666666] hover:to-[#4d4d4d]'
      }`}
    >
      {/* Actions Menu */}
      {!readOnly && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 right-2 z-20"
          onMouseDown={(e) => e.stopPropagation()} // Prevent drag start
        >
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1.5 hover:bg-white/10 rounded-lg text-[#9CA3AF] hover:text-white transition-colors focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#2A2A2A] border-white/10 text-white min-w-[160px] z-[100]">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onInfoClick?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSetRestTimer?.(); }} className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-xs font-medium">
                <Timer className="w-3.5 h-3.5 mr-2" />
                Set Rest Timer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRemove(); }} className="hover:bg-red-500/10 focus:bg-red-500/10 text-red-400 focus:text-red-400 cursor-pointer text-xs font-medium">
                <Trash className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 pr-7">
        <h3 className="font-['SF_Pro:Semibold',sans-serif] font-[590] text-[14px] text-[#DFE2E6] truncate w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
          {exercise}
        </h3>
        <div className="flex items-center gap-1.5 text-[#9CA3AF] text-[12px]">
           {data ? (
             <>
                <span className="truncate">{muscleText} • {equipment ? equipment.charAt(0).toUpperCase() + equipment.slice(1) : "No Equipment"}</span>
             </>
           ) : (
             <span className="text-xs text-gray-500">Custom Exercise</span>
           )}
        </div>
      </div>
    </motion.div>
  );
}
